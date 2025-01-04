// packages/server/src/types/index.ts
export interface ProxyConfig {
    id: string;
    targetUrl: string;
  }
  
  export interface ProxyEvent {
    id: string;
    timestamp: number;
    method: string;
    path: string;
    targetUrl: string;
    requestHeaders: Record<string, string>;
    requestBody?: any;
    responseHeaders?: Record<string, string>;
    responseBody?: any;
    duration?: number;
  }
  
  export interface LockedRoute {
    pattern: string;
    method?: string;
    response: any;
    headers?: Record<string, string>;
  }
  
  export interface ProjectConfig {
    id: string;
    targetUrl: string;
    routes: LockedRoute[];
  }