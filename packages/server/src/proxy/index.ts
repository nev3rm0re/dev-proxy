// packages/server/src/proxy/index.ts
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import { storage } from '../storage';
import { WebSocketManager } from '../websocket';
import { ProxyEvent } from '../types';

export function createProxyHandler(wsManager: WebSocketManager): RequestHandler {
  return createProxyMiddleware({
    router: async (req: IncomingMessage) => {
      const urlPath = (req as Request).originalUrl || req.url || '/';
      const [projectId] = urlPath.split('/').filter(Boolean);
      const project = await storage.getProject(projectId);
      
      // Handle case when no project or target URL is found
      if (!project?.targetUrl) {
        throw new Error(`No target URL found for project: ${projectId}`);
      }
      
      return project.targetUrl;
    },
    pathRewrite: (path) => {
      const parts = path.split('/').filter(Boolean);
      return '/' + parts.slice(1).join('/');
    },
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req: IncomingMessage, res) => {
        (req as any).startTime = Date.now();
      },
      proxyRes: (proxyRes, req: IncomingMessage, res) => {
        const startTime = (req as any).startTime;
        const urlPath = (req as Request).originalUrl || req.url || '/';
        const [projectId, ...pathParts] = urlPath.split('/').filter(Boolean);

        const proxyEvent: ProxyEvent = {
          id: Math.random().toString(36).substring(7),
          timestamp: startTime,
          method: (req as Request).method || 'GET',
          path: '/' + pathParts.join('/'),
          targetUrl: (req as any).target,
          requestHeaders: req.headers as Record<string, string>,
          requestBody: (req as any).body,
          responseHeaders: proxyRes.headers as Record<string, string>
        };

        let body = '';
        proxyRes.on('data', chunk => body += chunk);
        proxyRes.on('end', () => {
          proxyEvent.duration = Date.now() - startTime;
          try {
            proxyEvent.responseBody = JSON.parse(body);
          } catch {
            proxyEvent.responseBody = body;
          }
          wsManager.broadcast(proxyEvent);
        });
      },
      error: (err: Error, req: IncomingMessage, res: ServerResponse | Socket) => {
        console.error('Proxy error:', err);
        if (res instanceof ServerResponse) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
        }
      }
    },
    logger: console
  });
}