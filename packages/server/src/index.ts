// packages/server/src/index.ts
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { WebSocketManager } from './websocket/index.js';
import { createProxyHandler } from './proxy/index.js';
import apiRouter from './routes/api.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ServerOptions {
  port?: number;
  storagePath?: string;
}

const PROXY_PORT = process.env.PROXY_PORT || 3000;
const ADMIN_PORT = process.env.ADMIN_PORT || 3001;

export function startServer(options: ServerOptions = {}) {
  // Admin/Frontend application
  const adminApp = express();
  const adminServer = createServer(adminApp);
  
  adminApp.use(cors());
  adminApp.use(express.json());

  adminApp.use('/api', apiRouter);        // Server's own API endpoints

  adminApp.use(express.static(path.join(__dirname, '../public'))); 
  
  adminApp.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });
  
  // Attach WebSocket to the admin server
  const wsManager = new WebSocketManager(adminServer);
  
  // Proxy application
  const proxyApp = express();
  const proxyServer = createServer(proxyApp);
  
  // Add handler for root path
  proxyApp.get('/', (req, res) => {
    res.send(`
      <html>
        <head><title>Proxy Server</title></head>
        <body>
          <h1>Welcome to the Proxy Server</h1>
          <p>This is a proxy server. To use it correctly, you should:</p>
          <ul>
            <li>Access specific project endpoints using the project ID in the path</li>
            <li>Example: http://localhost:${PROXY_PORT}/[project-id]/your-path</li>
          </ul>
          <p>Direct access to the root path is not supported.</p>
        </body>
      </html>
    `);
  });

  // Setup proxy middleware with error handling for all other paths
  proxyApp.use('/', (req, res, next) => {
    // Ignore favicon.ico requests
    if (req.url === '/favicon.ico') {
      res.status(404).end();
      return;
    }

    createProxyHandler(wsManager)(req, res, (err) => {
      if (err?.message?.includes('No target URL found for project')) {
        res.status(404).json({ error: 'Not Found', message: err.message });
      } else {
        next(err);
      }
    });
  });

  // Error handling middleware for both servers
  const errorHandler = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  };

  adminApp.use(errorHandler);
  proxyApp.use(errorHandler);

  // Start the servers using the HTTP server instances
  proxyServer.listen(PROXY_PORT, () => {
    console.log(`Proxy server running on port ${PROXY_PORT}`);
  });

  adminServer.listen(ADMIN_PORT, () => {
    console.log(`Admin dashboard available at: http://localhost:${ADMIN_PORT}`);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  return adminServer;
}
