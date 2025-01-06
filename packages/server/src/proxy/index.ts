// packages/server/src/proxy/index.ts
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import { Request } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import { storage } from '../storage';
import { WebSocketManager } from '../websocket';
import { ProxyEvent } from '../types';

/**
 * IncomingMessage properties:
 * - headers: Object containing request headers
 * - httpVersion: HTTP version of the request (e.g. '1.1')
 * - method: HTTP method of the request (e.g. 'GET', 'POST')
 * - url: Request URL string
 * - socket: Underlying socket for the request
 * - statusCode: Response status code (only on responses)
 * - statusMessage: Response status message (only on responses)
 * - rawHeaders: Raw request headers as array of key/value pairs
 * - rawTrailers: Raw trailer headers as array (if present)
 * - trailers: Object containing trailer headers (if present)
 * - complete: Whether message is complete
 * - aborted: Whether request was aborted by client
 */
export function createProxyHandler(wsManager: WebSocketManager): RequestHandler {
  return createProxyMiddleware({
    // Determines target URL for each request
    // Lifecycle: Called first when request is received
    router: async (req: IncomingMessage) => {
      const urlPath = (req as Request).originalUrl || req.url || '/';
      const [projectId] = urlPath.split('/').filter(Boolean);
      const project = await storage.getProject(projectId);
      
      // Check for previous matching request
      const path = '/' + urlPath.split('/').slice(2).join('/');
      const method = (req as Request).method || 'GET';
      const request = await storage.findRequest(projectId, path, method);
      if (request?.isLocked) {
        const lastResponse = await storage.findRandomResponse(projectId, path, method);
        if (lastResponse) {
          // Attach the cached response to the request for later use
          (req as any).cachedResponse = lastResponse;
          (req as any).foundRequest = request;
        }
      }
      
      // Handle case when no project or target URL is found
      if (!project) {
        await storage.createProjectFromRequest(projectId, req);
      }
      
      return `https://${projectId}`;
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
      proxyReq: async (proxyReq, req: IncomingMessage, res: ServerResponse) => {
        const cachedResponse = (req as any).cachedResponse;
        if (cachedResponse) {
          proxyReq.destroy();

          const responseBody = typeof cachedResponse.body === 'string' ? cachedResponse.body : JSON.stringify(cachedResponse.body);
          const headers = {...cachedResponse.headers};
          // update content-length to match responseBody length
          headers['content-length'] = Buffer.byteLength(responseBody).toString();
          res.writeHead(cachedResponse.status, headers);
          res.end(responseBody);

          const urlPath = (req as Request).originalUrl || req.url || '/';
          const [projectId] = urlPath.split('/').filter(Boolean);
          const proxyEvent: ProxyEvent = {
            id: Math.random().toString(36).substring(7),
            projectId,
            timestamp: Date.now(),
            method: (req as Request).method || 'GET',
            path: '/' + urlPath.split('/').slice(2).join('/'),
            targetUrl: 'cache',
            requestHeaders: req.headers as Record<string, string>,
            requestBody: (req as any).body,
            responseHeaders: cachedResponse.headers,
            responseStatus: cachedResponse.status,
            responseBody: cachedResponse.body,
            duration: 0,
            ...(req as any).foundRequest,
          };
          // increment hits
          console.log('working with cached response', proxyEvent);
          const request = await storage.findRequest(projectId, proxyEvent.path, proxyEvent.method);
          console.log('request found?', request);
          if (request) {
            console.log('incrementing hits');
            request.hits++;
            await storage.updateRequest(projectId, request);
          }

          // Broadcast the cached response hit
          wsManager.broadcast(proxyEvent);
          return true;
        }

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
          projectId,
          timestamp: startTime,
          method: (req as Request).method || 'GET',
          path: '/' + pathParts.join('/'),
          targetUrl: (req as any).target,
          requestHeaders: req.headers as Record<string, string>,
          requestBody: (req as any).body,
          responseHeaders: proxyRes.headers as Record<string, string>,
          responseStatus: proxyRes.statusCode,
          responseBody: '',
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
          storage.addRouteResponse(projectId, proxyEvent, true);
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
      },
    },
    logger: console
  });
}