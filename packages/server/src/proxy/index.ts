// packages/server/src/proxy/index.ts
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import { storage } from '../storage/index.js';
import { WebSocketManager } from '../websocket/index.js';
import { ProxyEvent } from '../types/index.js';
import { determineTargetUrl } from './routing.js';
import { shortId } from '../utils/hash.js';
import { OpenAPIRecorder } from '../services/OpenAPIRecorder.js';

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
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)+$/.test(str);
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

/**
 * Create ProxyEvent from request and response data
 */
const createProxyEvent = async (
  req: IncomingMessage,
  responseData: {
    headers: Record<string, string>;
    status: number;
    body: any;
    targetUrl: string;
  },
  startTime: number
): Promise<ProxyEvent> => {
  const urlPath = (req as Request).originalUrl || req.url || '/';
  const hostname = getHostnameFromRequest(req);
  const method = (req as Request).method || 'GET';
  const route = (req as any).route;

  const path = (req as any).isServerName || isDomainLike(urlPath.split('/')[1])
    ? '/' + urlPath.split('/').slice(2).join('/')
    : urlPath;

  return {
    id: shortId(urlPath, startTime),
    hostname,
    timestamp: startTime,
    method,
    path,
    targetUrl: responseData.targetUrl,
    requestHeaders: req.headers as Record<string, string>,
    requestBody: (req as any).body,
    responseHeaders: responseData.headers,
    responseStatus: responseData.status,
    responseBody: responseData.body,
    duration: Date.now() - startTime,
    ...route,
  };
};

const openAPIRecorder = new OpenAPIRecorder();

export function createProxyHandler(wsManager: WebSocketManager): RequestHandler {
  return createProxyMiddleware({
    // Determines target URL for each request
    // Lifecycle: Called first when request is received
    router: async (req: IncomingMessage) => {
      const urlPath = (req as Request).originalUrl || req.url || '/';
      const method = (req as Request).method || 'GET';

      // Use determineTargetUrl to get targetUrl, hostname, and isServerName
      const { targetUrl, hostname, isServerName, resolvedPath } = await determineTargetUrl(req);

      if (!hostname) {
        throw new Error('No valid target URL found. Please check server configurations.');
      }

      // Store information for pathRewrite
      (req as any).resolvedPath = resolvedPath;
      
      // Get or create route for tracking
      const route = await storage.getRouteByUrlMethod(resolvedPath, method) || 
                   await storage.createRouteFromRequest({ method, path: resolvedPath, hostname });
      (req as any).route = route;
      
      const lockedResponse = await storage.findLockedResponse(route) || await storage.findRandomResponse(route);
      if (route.isLocked || lockedResponse) {
        // Attach the cached response to the request for later use
        (req as any).cachedResponse = lockedResponse || await storage.findRandomResponse(route);
      }

      // Store the target URL for later use
      (req as any).target = targetUrl;
      return targetUrl;
    },

    // Use resolvedPath from the router()
    // Lifecycle: Called after router, before request is proxied
    pathRewrite: (_path, req) => {
      return (req as any).resolvedPath;
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
          return; // continue to target
        }

        proxyReq.destroy(); // cancel request to target
        const body = cachedResponse.lockedBody || cachedResponse.body;
        console.log('Picked response', cachedResponse.body);

        // Send back cached response
        const response = typeof body === 'string' ? body : JSON.stringify(body);
        const headers = {...cachedResponse.headers};
        // update content-length to match responseBody length
        headers['content-length'] = Buffer.byteLength(response).toString();
        res.writeHead(cachedResponse.status, headers);
        res.end(response);

        // Broadcast the cached response hit
        const route = (req as any).route;
        const proxyEvent = await createProxyEvent(req, {
          headers: cachedResponse.headers,
          status: cachedResponse.status,
          body: cachedResponse.body,
          targetUrl: 'cache'
        }, Date.now());
        
        route.hits++;
        await storage.saveRoute(route);

        // Broadcast the cached response hit
        wsManager.broadcast(proxyEvent);
        return true;
      },

      // Called when response is received from target
      // Lifecycle: After target responds, before sending back to client
      proxyRes: (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
        const startTime = (req as any).startTime;
        const route = (req as any).route;

        let body = '';
        proxyRes.on('data', chunk => body += chunk);
        proxyRes.on('end', async () => {
          let parsedBody;
          try {
            parsedBody = JSON.parse(body);
          } catch {
            parsedBody = body;
          }

          // Store response body for OpenAPI recording
          (res as any).responseBody = parsedBody;

          // Record the request/response pair
          openAPIRecorder.recordRequest(req as Request, res, startTime);

          const proxyEvent = await createProxyEvent(req, {
            headers: proxyRes.headers as Record<string, string>,
            status: proxyRes.statusCode!,
            body: parsedBody,
            targetUrl: (req as any).target
          }, startTime);

          // Add OpenAPI spec to the event
          proxyEvent.openapi = openAPIRecorder.getSpec();

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