import type { OpenAPIV3 } from "openapi-types";

/**
 * Represents a proxy event - response received from a target server
 *
 * @param {string} id - The unique identifier for the proxy event
 * @param {number} timestamp - The timestamp of the proxy event
 * @param {string} method - The HTTP method used for the request
 * @param {string} path - The path of the request
 * @param {string} targetUrl - The URL of the target server
 * @param {Record<string, string>} requestHeaders - The headers of the request
 * @param {unknown} requestBody - The body of the request
 * @param {Record<string, string>} responseHeaders - The headers of the response
 * @param {unknown} responseBody - The body of the response
 * @param {number} responseStatus - The status code of the response
 * @param {number} duration - The duration of the request in milliseconds
 * @param {OpenAPIV3.Document} openapi - The OpenAPI document of the target server
 * @example
 * ```typescript
 * const proxyEvent: ProxyEvent = {
 *   id: "xuHnrB",
 *   timestamp: 1712688000,
 *   method: "GET",
 *   path: "/api/v1/users",
 *   targetUrl: "https://api.example.com/api/v1/users",
 *   requestHeaders: { "Content-Type": "application/json" },
 *   requestBody: { name: "John Doe" },
 *   responseHeaders: { "Content-Type": "application/json" },
 *   responseBody: { id: "123", name: "John Doe" },
 *   responseStatus: 200,
 *   duration: 1000,
 *   openapi: { ... },
 * };
 * ```
 */
export interface ProxyEvent {
  id: string;
  timestamp: number;
  method: string;
  path: string;
  targetUrl: string;
  requestHeaders: Record<string, string>;
  requestBody?: unknown;
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;
  responseStatus?: number;
  duration?: number;
  openapi?: OpenAPIV3.Document;
}

export interface Response {
  responseId: string;
  body: unknown;
  status: number | undefined;
  headers?: Record<string, string>;
  count: number;
  isLocked: boolean;
  lockedBody?: string | null;
}

export interface Route {
  id: string;
  method: string;
  hostname: string;
  path: string;
  responses: Response[];
  isLocked: boolean;
  lockedResponseIndex?: number;
  customResponse?: Response;
  hits: number;
}
