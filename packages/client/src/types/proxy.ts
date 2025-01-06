// src/types/proxy.ts
export interface ProxyResponse {
  id: string;
  status: number;
  headers: {
    'content-type': string;
    'content-length': number;
    date: string;
  }
  body: string;
  timestamp: number;
  isLocked?: boolean;
}

export interface ProxyEvent {
    id: string;
    projectId: string
    path: string;
    timestamp: number;
    method: string;
    hits: number;
    isLocked: boolean;
    responses: ProxyResponse[];
    targetUrl: string;
    requestHeaders: Record<string, string>;
    requestBody: any;
    responseHeaders: Record<string, string>;
    responseBody: any;
    duration: number;
  }
  
  export interface ProxyState {
    events: ProxyEvent[];
    selectedEventId: string | null;
    isConnected: boolean;
    setEvents: (events: ProxyEvent[]) => void;
    addEvent: (event: ProxyEvent) => void;
    selectEvent: (id: string | null) => void;
    setConnected: (connected: boolean) => void;
  }