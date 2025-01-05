// packages/server/src/proxy/index.ts
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import { Request } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import { storage } from '../storage';
import { WebSocketManager } from '../websocket';
import { ProxyEvent } from '../types';

export function createProxyHandler(wsManager: WebSocketManager): RequestHandler {
  return createProxyMiddleware({
    // Determines target URL for each request
    // Lifecycle: Called first when request is received
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

    // Rewrites the path by removing the project ID prefix
    // Lifecycle: Called after router, before request is proxied
    pathRewrite: (path) => {
      const parts = path.split('/').filter(Boolean);
      return '/' + parts.slice(1).join('/');
    },

    // Changes the origin of the host header to the target URL
    // Lifecycle: Applied to all proxied requests
    changeOrigin: true,
    on: {
      // Called just before the request is sent to the target
      // Lifecycle: After path rewrite, before sending to target
      proxyReq: (_, req: IncomingMessage) => {
        (req as any).startTime = Date.now();
      },

      // Called when response is received from target
      // Lifecycle: After target responds, before sending back to client
      proxyRes: (proxyRes, req: IncomingMessage) => {
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

      // Called when any error occurs during proxying
      // Lifecycle: Can occur at any point during the proxy process
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