// src/types/proxy.ts
export interface ProxyResponse {
  responseId: string;
  status: number;
  headers: {
    "content-type": string;
    "content-length": number;
    date: string;
  };
  body: string;
  lockedBody?: string | null;
  timestamp: number;
  isLocked?: boolean;
}

/**
 * Expected format of the websocket payload for processed request
 * This is broadcasted when proxy is done sending response back to the client
 *
 * For response we want both request and response
 */
export interface EventResponseSent {
  id: string;
  // request fields
  hostname: string; // target hostname
  path: string; // target path
  targetUrl: string; // target url
  timestamp: number; // timestamp of the request
  method: string; // request method
  requestHeaders: Record<string, string>;
  requestBody: unknown;
  // response fields
  responseHeaders: Record<string, string>;
  responseBody: unknown;
  duration: number;
  // isGzipped: boolean;
  hits: number; // number of times this request has been hit
  responses: ProxyResponse[]; // this should belong to Route
  isLocked: boolean; // if the request is locked
}

export interface ProxyState {
  events: EventResponseSent[];
  incomingEventId: string | null;
  isConnected: boolean;
  setEvents: (events: EventResponseSent[]) => void;
  addEvent: (event: EventResponseSent) => void;
  setIncomingEventId: (id: string | null) => void;
  setConnected: (connected: boolean) => void;
  updateEvent: (event: EventResponseSent) => void;
  getEvent: (id: string) => EventResponseSent | undefined;
}

// Base rule interface
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

// JWT plugin specific configuration
export interface JwtPluginConfig {
  secret: string;
  kid?: string;
  exp?: number; // Expiration in seconds
  additionalClaims: Record<string, unknown>; // Additional JWT claims
  responseFormat?: "raw" | "json"; // Format of the response
  jsonProperty?: string; // Property name when responseFormat is "json"
}

// Union type for all rule types
export type Rule = ForwardingRule | StaticResponseRule | PluginRule;

// Legacy ProxyRule type for backward compatibility
export type ProxyRule = {
  id?: string;
  method: string;
  url: string;
  responseStatus: number;
  responseBody: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
};
