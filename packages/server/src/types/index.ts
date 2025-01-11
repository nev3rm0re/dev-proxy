// packages/server/src/types/index.ts
export interface Response {
  responseId: string;
  body: any;
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

export interface ProxyConfig {
  id: string;
  targetUrl: string;
}

/**
 * This is the event that is sent to the websocket on the incoming request
 */
export interface ProxyEvent {
  id: string;
  timestamp: number; // timestamp of the request
  method: string; // http method
  path: string; // path of the request
  targetUrl: string; // target url of the request, projectId + path
  requestHeaders: Record<string, string>; // headers of the request
  requestBody?: any; // body of the request
  responseHeaders?: Record<string, string>; // headers of the response
  responseBody?: any; // body of the response
  responseStatus?: number; // status of the response
  duration?: number;
}

export interface ProjectConfig {
  id: string; // e.g. 'api.example.com'
  routes: Route[];
}