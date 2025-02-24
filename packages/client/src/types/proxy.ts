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

export type ProxyRule = {
  id?: string;
  method: string;
  url: string;
  responseStatus: number;
  responseBody: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
};
