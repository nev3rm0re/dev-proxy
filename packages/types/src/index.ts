import type { OpenAPIV3 } from "openapi-types";

// Common types used across packages
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