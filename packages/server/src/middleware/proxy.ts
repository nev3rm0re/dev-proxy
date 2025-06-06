import type { Request, Response, NextFunction } from 'express';
import type { WebSocketManager } from '../websocket/index.js';
import { createProxyHandler } from '../proxy/index.js';

export function proxyMiddleware(wsManager: WebSocketManager) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    createProxyHandler(wsManager)(req, res, (err) => {
      if (err?.message?.includes('No target URL found for project')) {
        res.status(404).json({ error: 'Not Found', message: err.message });
      } else {
        next(err);
      }
    });
  };
} 