// packages/server/src/proxy/index.ts
import type { RequestHandler } from "http-proxy-middleware";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { Request, Response } from "express";
import type { IncomingMessage } from "http";
import { ServerResponse } from "http";
import type { Socket } from "net";
import { storage } from "../storage/index.js";
import type { WebSocketManager } from "../websocket/index.js";
import type {
  ProxyEvent,
  Route,
  Response as ProxyResponse,
} from "../types/index.js";
import { determineTargetUrl } from "./routing.js";
import { shortId } from "../utils/hash.js";
import { OpenAPIRecorder } from "../services/OpenAPIRecorder.js";
import { createGunzip } from "zlib";
import { Readable } from "stream";

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

interface ResponseData {
  headers: Record<string, string>;
  status: number;
  body: unknown;
  targetUrl: string;
}

/**
 * Extension of the IncomingMessage interface
 */
interface ExtendedRequest extends IncomingMessage {
  isServerName?: boolean;
  target?: string;
  route?: Route;
  resolvedPath?: string;
  cachedResponse?: ProxyResponse;
  startTime?: number;
  body?: unknown;
  originalUrl?: string;
  method?: string;
}

interface ExtendedServerResponse extends ServerResponse {
  responseBody?: unknown;
}

const isDomainLike = (str: string): boolean => {
  // Simple check for domain-like strings (contains at least one dot)
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)+$/.test(str);
};

const getHostnameFromRequest = (req: ProxyExtendedRequest): string => {
  const urlPath = (req as Request).originalUrl || req.url || "/";
  const [firstPart] = urlPath.split("/").filter(Boolean);

  if (req.isServerName || !isDomainLike(firstPart)) {
    // For server name paths or default server case, use hostname from target URL
    return new URL(req.target!).hostname;
  }
  // For domain-like paths, use the first part directly
  return firstPart;
};

type ProxyExtendedRequest = IncomingMessage & ExtendedRequest;

/**
 * Create ProxyEvent from request and response data
 */
const createProxyEvent = async (
  req: IncomingMessage,
  responseData: ResponseData,
  startTime: number
): Promise<ProxyEvent> => {
  const urlPath = req.url || "/";
  const hostname = getHostnameFromRequest(req);
  const method = req.method || "GET";
  const route = (req as ExtendedRequest).route;

  const path =
    (req as ExtendedRequest).isServerName || isDomainLike(urlPath.split("/")[1])
      ? "/" + urlPath.split("/").slice(2).join("/")
      : urlPath;

  return {
    id: shortId(urlPath, startTime),
    hostname,
    timestamp: startTime,
    method,
    path,
    targetUrl: responseData.targetUrl,
    requestHeaders: req.headers as Record<string, string>,
    requestBody: (req as ExtendedRequest).body,
    responseHeaders: responseData.headers,
    responseStatus: responseData.status,
    responseBody: responseData.body,
    duration: Date.now() - startTime,
    responses: route?.responses,
    ...route,
  };
};

const openAPIRecorder = new OpenAPIRecorder();

const broadcastCachedResponse = async (
  wsManager: WebSocketManager,
  cachedResponse: ProxyResponse,
  req: IncomingMessage
) => {
  const proxyEvent = await createProxyEvent(
    req,
    {
      headers: cachedResponse.headers || {},
      status: cachedResponse.status,
      body: cachedResponse.body,
      targetUrl: "cache",
    },
    Date.now()
  );
  wsManager.broadcast(proxyEvent);
};
const writeCachedResponse = (
  res: ServerResponse,
  cachedResponse: ProxyResponse
) => {
  // Get cached response body
  const body = cachedResponse.lockedBody || cachedResponse.body;
  // Convert body to string if it's not already
  const response = typeof body === "string" ? body : JSON.stringify(body);
  // Copy cached response headers
  const headers = { ...(cachedResponse.headers || {}) };
  // Update content-length header
  headers["content-length"] = Buffer.byteLength(response).toString();
  // Write response to client with original status
  res.writeHead(cachedResponse.status || 200, headers);
  res.end(response);
};

export function createProxyHandler(
  wsManager: WebSocketManager
): RequestHandler {
  return createProxyMiddleware({
    // Determines target URL for each request
    // Lifecycle: Called first when request is received
    router: async (req: IncomingMessage) => {
      const method = (req as Request).method || "GET";

      // Use determineTargetUrl to get targetUrl, hostname, and isServerName
      const { targetUrl, hostname, resolvedPath } = await determineTargetUrl(
        req
      );

      if (!hostname) {
        console.log("No hostname for url: ", req.url);
        throw new Error(
          "No valid target URL found. Please check server configurations."
        );
      }

      // Store information for pathRewrite
      (req as ExtendedRequest).resolvedPath = resolvedPath;

      // Get or create route for tracking
      const route =
        (await storage.getRouteByUrlMethod(resolvedPath, method)) ||
        (await storage.createRouteFromRequest({
          method,
          path: resolvedPath,
          hostname,
        }));
      (req as ExtendedRequest).route = route;

      const lockedResponse = await storage.findLockedResponse(route);
      if (route.isLocked || lockedResponse) {
        // Attach the cached response to the request for later use
        (req as ExtendedRequest).cachedResponse =
          lockedResponse ||
          (await storage.findRandomResponse(route)) ||
          undefined;
      }

      // Store the target URL for later use
      (req as ExtendedRequest).target = targetUrl;
      return targetUrl;
    },

    // Use resolvedPath from the router()
    // Lifecycle: Called after router, before request is proxied
    pathRewrite: (_path, req) => {
      return (req as ExtendedRequest).resolvedPath;
    },

    // Changes the origin of the host header to the target URL
    // Lifecycle: Applied to all proxied requests
    changeOrigin: true,
    on: {
      // Called just before the request is sent to the target
      // Lifecycle: After path rewrite, before sending to target
      proxyReq: async (proxyReq, req: IncomingMessage, res: ServerResponse) => {
        // has cached response?
        const cachedResponse = (req as ExtendedRequest).cachedResponse;

        if (!cachedResponse) {
          // If not, start timer
          (req as ExtendedRequest).startTime = Date.now();
          return; // ... and proceed with request to target
        }

        proxyReq.destroy(); // cancel request to target
        writeCachedResponse(res, cachedResponse);
        broadcastCachedResponse(wsManager, cachedResponse, req);

        // Broadcast the cached response hit
        const route = (req as ExtendedRequest).route;
        if (!route) return true; // Early return if no route

        const proxyEvent = await createProxyEvent(
          req,
          {
            headers: cachedResponse.headers || {},
            status: cachedResponse.status || 200,
            body: cachedResponse.body,
            targetUrl: "cache",
          },
          Date.now()
        );

        route.hits++;
        await storage.saveRoute(route);

        // Broadcast the cached response hit
        wsManager.broadcast(proxyEvent);
        return true;
      },

      // Called when response is received from target
      // Lifecycle: After target responds, before sending back to client
      proxyRes: (
        proxyRes: IncomingMessage,
        req: IncomingMessage,
        res: ServerResponse
      ) => {
        const startTime = (req as ExtendedRequest).startTime;
        const route = (req as ExtendedRequest).route;

        let body = "";
        const contentEncoding = proxyRes.headers["content-encoding"];

        // Handle gzipped response
        if (contentEncoding === "gzip") {
          const gunzip = createGunzip();
          const responseStream = Readable.from(proxyRes);

          responseStream.pipe(gunzip);
          gunzip.on("data", (chunk) => (body += chunk));
          gunzip.on("end", async () => handleResponseEnd());
          gunzip.on("error", (err) => console.error("Gunzip error:", err));
        } else {
          // Handle non-gzipped response as before
          proxyRes.on("data", (chunk) => (body += chunk));
          proxyRes.on("end", async () => handleResponseEnd());
        }

        async function handleResponseEnd() {
          let parsedBody;
          try {
            parsedBody = JSON.parse(body);
          } catch {
            parsedBody = body;
          }

          // Store response body for OpenAPI recording
          (res as ExtendedServerResponse).responseBody = parsedBody;
          // Record the request/response pair
          openAPIRecorder.recordRequest(
            req as Request,
            res as unknown as Response,
            startTime || Date.now()
          );

          const proxyEvent = await createProxyEvent(
            req,
            {
              headers: proxyRes.headers as Record<string, string>,
              status: proxyRes.statusCode!,
              body: parsedBody,
              targetUrl: (req as ExtendedRequest).target || "unknown",
            },
            startTime || Date.now()
          );

          // Add OpenAPI spec to the event
          proxyEvent.openapi = openAPIRecorder.getSpec();

          if (!route) return; // Early return if no route

          storage.addRouteResponse(route, proxyEvent);
          wsManager.broadcast(proxyEvent);
        }
      },

      // Called when any error occurs during proxying
      // Lifecycle: Can occur at any point during the proxy process
      error: (
        err: Error,
        req: IncomingMessage,
        res: ServerResponse | Socket
      ) => {
        console.error("Proxy error:", err);
        if (res instanceof ServerResponse) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({ error: "Proxy error", message: err.message })
          );
        }
      },
    },
    logger: console,
  });
}
