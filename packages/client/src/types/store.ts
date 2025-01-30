import type { ProxyEvent } from "@4ev3rm0re/dev-proxy-types";

export interface ProxyStore {
  events: ProxyEvent[];
  addEvent: (event: ProxyEvent) => void;
}
