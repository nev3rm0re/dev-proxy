// packages/server/src/index.ts
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { WebSocketManager } from './websocket/index.js';
import { createProxyHandler } from './proxy/index.js';
import apiRouter from './routes/api.js';

interface ServerOptions {
  port?: number;
  storagePath?: string;
}

export function startServer(options: ServerOptions = {}) {
  const app = express();
  const server = createServer(app);
  const wsManager = new WebSocketManager(server);

  app.use(cors());
  app.use(express.json());
  // API Routes - would not be caught by proxy middleware
  app.use('/api', apiRouter);

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  });

  // Serve static files for dashboard (we'll add this later)
  app.use(express.static('public'));

  // Setup proxy middleware with error handling
  app.use((req, res, next) => {
    createProxyHandler(wsManager)(req, res, (err) => {
      if (err?.message?.includes('No target URL found for project')) {
        res.status(404).json({ error: 'Not Found', message: err.message });
      } else {
        next(err);
      }
    });
  });

  const PORT = options.port || process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log('Listening...');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  return server;
}
