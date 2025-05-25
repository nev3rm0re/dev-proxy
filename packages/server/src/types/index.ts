// packages/server/src/types/index.ts
import type { OpenAPIV3 } from "openapi-types";

export interface Response {
  responseId: string;
  headers: Record<string, string>;
  body: unknown;
  status: number;
  lockedBody?: unknown;
  count: number;
  isLocked: boolean;
}

export interface Route {
  id: string;
  method: string;
  path: string;
  hostname: string;
  headers: Record<string, string>;
  responses: Response[];
  isLocked: boolean;
  hits: number;
}

export interface ProxyConfig {
  id: string;
  targetUrl: string;
}

/**
 * This is the event that is sent to the websocket on the incoming request
 */
export interface ProxyEvent {
  id: string;
  method: string;
  path: string;
  hostname: string;
  targetUrl: string;
  status: number;
  responseStatus: number;
  responseBody: unknown;
  responseHeaders: Record<string, string>;
  requestHeaders: Record<string, string>;
  requestBody?: unknown;
  timestamp: number;
  duration?: number;
  responses?: Response[];
  openapi?: OpenAPIV3.Document;
}

export interface ProjectConfig {
  id: string; // e.g. 'api.example.com'
  routes: Route[];
}

// Base rule interface for the new rules system
export interface BaseRule {
  id?: string;
  name: string;
  order: number;
  isActive: boolean;
  isTerminating: boolean; // Whether to stop processing other rules after this one
  description?: string;
}

// Forward rule type - forwards requests to a target URL
export interface ForwardingRule extends BaseRule {
  type: "forwarding";
  method: string | string[]; // HTTP method(s) to match
  pathPattern: string; // Path pattern to match
  targetUrl: string; // URL to forward to
  pathTransformation?: string; // How to transform the path
}

// Static response rule - returns predefined response
export interface StaticResponseRule extends BaseRule {
  type: "static";
  method: string | string[]; // HTTP method(s) to match
  pathPattern: string; // Path pattern to match
  responseStatus: number;
  responseBody: string;
  responseHeaders?: Record<string, string>;
}

// Plugin rule - uses a plugin to generate the response
export interface PluginRule extends BaseRule {
  type: "plugin";
  pluginType: string; // e.g., 'jwt'
  method: string | string[]; // HTTP method(s) to match
  pathPattern: string; // Path pattern to match
  responseStatus: number;
  responseTemplate: string;
  pluginConfig: Record<string, unknown>; // Plugin-specific configuration
}

// Union type for all rule types
export type Rule = ForwardingRule | StaticResponseRule | PluginRule;
