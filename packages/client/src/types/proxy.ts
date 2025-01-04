// src/types/proxy.ts
export interface ProxyEvent {
    id: string;
    timestamp: number;
    method: string;
    path: string;
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
    addEvent: (event: ProxyEvent) => void;
    selectEvent: (id: string | null) => void;
    setConnected: (connected: boolean) => void;
  }