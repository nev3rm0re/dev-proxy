import type { Request } from "express";
import type { Route } from "../types/index.js";

export interface ExtendedRequest extends Omit<Request, "route"> {
  isServerName?: boolean;
  target?: string;
  route?: Route;
  resolvedPath?: string;
  cachedResponse?: Response;
  startTime?: number;
}
