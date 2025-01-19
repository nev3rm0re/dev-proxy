// packages/server/src/proxy/index.ts
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import { Request } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import { storage } from '../storage/index.js';
import { WebSocketManager } from '../websocket/index.js';
import { ProxyEvent } from '../types/index.js';

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

const isDomainLike = (str: string): boolean => {
  // Simple check for domain-like strings (contains at least one dot)
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z0-9-_.]+$/.test(str);
};

const getHostnameFromRequest = (req: IncomingMessage): string => {
  const urlPath = (req as Request).originalUrl || req.url || '/';
  const [firstPart] = urlPath.split('/').filter(Boolean);
  
  if ((req as any).isServerName || !isDomainLike(firstPart)) {
    // For server name paths or default server case, use hostname from target URL
    return new URL((req as any).target).hostname;
  }
  // For domain-like paths, use the first part directly
  return firstPart;
};

export function createProxyHandler(wsManager: WebSocketManager): RequestHandler {
  return createProxyMiddleware({
    // Determines target URL for each request
    // Lifecycle: Called first when request is received
    router: async (req: IncomingMessage) => {
      const urlPath = (req as Request).originalUrl || req.url || '/';
      const [firstPart, ...restParts] = urlPath.split('/').filter(Boolean);
      const path = '/' + restParts.join('/');
      const method = (req as Request).method || 'GET';

      let targetUrl: string;
      let hostname: string = firstPart;
      let isServerName = false;

      if (isDomainLike(firstPart)) {
        // Case 1: Domain-like path (/api.example.com/...)
        targetUrl = `https://${firstPart}`;
      } else {
        // Get all servers to check for server name or default
        const servers = await storage.getServers();
        
        if (servers.length === 0) {
          throw new Error('No servers configured. Please add at least one server in settings.');
        }

        const serverByName = servers.find(s => s.name === firstPart);
        
        if (serverByName) {
          // Case 2: Server name match (/myserver/...)
          targetUrl = serverByName.url;
          hostname = new URL(serverByName.url).hostname;
          isServerName = true;
        } else {
          // Case 3: Default server fallback (/api/...)
          const defaultServer = servers.find(s => s.isDefault);
          if (!defaultServer) {
            throw new Error('No default server configured. Please set a default server in settings.');
          }
          targetUrl = defaultServer.url;
          hostname = new URL(defaultServer.url).hostname;
        }
      }

      // Store information for pathRewrite
      (req as any).isServerName = isServerName;
      
      // Get or create route for tracking
      const route = await storage.getRouteByUrlMethod(urlPath, method) || 
                   await storage.createRouteFromRequest({ hostname, path: urlPath, method });
      (req as any).route = route;
      console.log('Found route', route, route?.isLocked);
      
      if (route?.isLocked) {
        const lastResponse = await storage.findLockedResponse(urlPath, method);
        
        if (lastResponse) {
          // Attach the cached response to the request for later use
          (req as any).cachedResponse = lastResponse;
          (req as any).foundRequest = route;
        }
      }

      // Store the target URL for later use
      (req as any).target = targetUrl;
      return targetUrl;
    },

    // Rewrites the path by removing the project ID prefix
    // Lifecycle: Called after router, before request is proxied
    pathRewrite: (path, req) => {
      const parts = path.split('/').filter(Boolean);
      
      // If this was a server name path, remove the server name
      if ((req as any).isServerName) {
        return '/' + parts.slice(1).join('/');
      }
      
      // For domain-like paths, remove the domain
      if (isDomainLike(parts[0])) {
        return '/' + parts.slice(1).join('/');
      }
      
      // For default server, keep the full path
      return path;
    },

    // Changes the origin of the host header to the target URL
    // Lifecycle: Applied to all proxied requests
    changeOrigin: true,
    on: {
      // Called just before the request is sent to the target
      // Lifecycle: After path rewrite, before sending to target
      proxyReq: async (proxyReq, req: IncomingMessage, res: ServerResponse) => {
        const cachedResponse = (req as any).cachedResponse;
        
        if (!cachedResponse) {
          (req as any).startTime = Date.now();
          return; // exit early
        }

        proxyReq.destroy();

        const body = cachedResponse.lockedBody || cachedResponse.body;
        console.log('Picked response', cachedResponse.body);

        const response = typeof body === 'string' ? body : JSON.stringify(body);
        const headers = {...cachedResponse.headers};
        // update content-length to match responseBody length
        headers['content-length'] = Buffer.byteLength(response).toString();
        res.writeHead(cachedResponse.status, headers);
        res.end(response);

        const route = (req as any).route;
        const urlPath = (req as Request).originalUrl || req.url || '/';
        const hostname = getHostnameFromRequest(req);

        const proxyEvent: ProxyEvent = {
          id: Math.random().toString(36).substring(7),
          hostname,
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
          ...route,
        };
        
        // increment hits
        route.hits++;
        await storage.saveRoute(route);

        // Broadcast the cached response hit
        wsManager.broadcast(proxyEvent);
        return true;
      },

      // Called when response is received from target
      // Lifecycle: After target responds, before sending back to client
      proxyRes: (proxyRes: IncomingMessage, req: IncomingMessage) => {
        const startTime = (req as any).startTime;
        const urlPath = (req as Request).originalUrl || req.url || '/';
        const hostname = getHostnameFromRequest(req);

        // Get the path without the first part (domain or server name)
        const path = (req as any).isServerName || isDomainLike(urlPath.split('/')[1])
          ? '/' + urlPath.split('/').slice(2).join('/')
          : urlPath;

        const route = (req as any).route;

        const proxyEvent: ProxyEvent = {
          id: Math.random().toString(36).substring(7),
          hostname,
          timestamp: startTime,
          method: (req as Request).method || 'GET',
          path,
          targetUrl: (req as any).target,
          requestHeaders: req.headers as Record<string, string>,
          requestBody: (req as any).body,
          responseHeaders: proxyRes.headers as Record<string, string>,
          responseStatus: proxyRes.statusCode,
          responseBody: '',
          ...route,
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
          storage.addRouteResponse(route, proxyEvent);
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