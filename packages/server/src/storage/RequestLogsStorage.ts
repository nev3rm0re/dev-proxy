import { JsonDB, Config } from "node-json-db";
import { shortId } from "../utils/hash.js";
import type { ProxyEvent, Route, Response } from "../types/index.js";
import path from "path";

export class RequestLogsStorage {
  private db: JsonDB;
  private initialized: Promise<void>;

  constructor() {
    // Use absolute path for request logs database
    const dbPath = process.cwd().includes("packages/server")
      ? "requestLogsDB" // If we're in packages/server, use local path
      : "packages/server/requestLogsDB"; // Otherwise use path from project root

    const realPath = path.resolve(dbPath);
    console.log(`Using request logs database at: ${realPath}`);

    try {
      this.db = new JsonDB(new Config(realPath, true, true, "/"));
    } catch (error) {
      console.error("Error initializing request logs database", error);
      throw error;
    }

    this.initialized = this.init();
  }

  private async init() {
    console.debug("INITIALIZING REQUEST LOGS DATABASE");
    try {
      await this.db.getData("/routes");
    } catch {
      await this.db.push("/routes", {});
    }
  }

  async setRoutes(path: string, data: Record<string, Route>): Promise<void> {
    await this.initialized;
    await this.db.push(path, data);
  }

  async createRoute(data: Omit<Route, "id">): Promise<Route> {
    const routeId = shortId(data.method, data.path);
    return await this.saveRoute({ id: routeId, ...data });
  }

  async saveRoute(data: Route): Promise<Route> {
    await this.initialized;
    try {
      await this.db.push(`/routes/${data.id}`, data);
      return await this.getRoute(data.id);
    } catch (error) {
      console.error("Error saving route", error);
      throw error;
    }
  }

  async getRoute(shortId: string): Promise<Route> {
    await this.initialized;
    return await this.db.getData(`/routes/${shortId}`);
  }

  /**
   * Get a route by its URL and method
   * @param urlPath - The URL path of the route, e.g. /api/v1/users
   * @param method - The HTTP method of the route, e.g. GET
   * @returns The route object if found, otherwise null
   */
  async getRouteByUrlMethod(
    urlPath: string,
    method: string
  ): Promise<Route | null> {
    const routeId = shortId(method, urlPath);
    try {
      return await this.getRoute(`${routeId}`);
    } catch (error) {
      return null;
    }
  }

  async createRouteFromRequest({
    method,
    path,
    hostname,
    headers,
  }: {
    method: string;
    path: string;
    hostname: string;
    headers: Record<string, string>;
  }): Promise<Route> {
    const route: Omit<Route, "id"> = {
      method,
      path,
      hostname,
      headers: {},
      responses: [],
      isLocked: false,
      hits: 1,
    };
    return await this.createRoute(route);
  }

  async toggleResponseLock(
    requestId: string,
    responseId: string
  ): Promise<Response | null> {
    const route = await this.getRoute(requestId);
    if (!route) {
      throw new Error(`Route ${requestId} not found`);
    }
    const response = route.responses.find((r) => r.responseId === responseId);
    if (!response) {
      throw new Error(`Response ${responseId} not found`);
    }
    response.isLocked = !response.isLocked;
    if (response.isLocked) {
      response.lockedBody = null;
    }
    route.isLocked = route.responses.some((r) => r.isLocked);
    await this.saveRoute(route);
    return response;
  }

  async findRandomResponse(route: Route): Promise<Response | null> {
    return route.responses?.length
      ? route.responses[Math.floor(Math.random() * route.responses.length)]
      : null;
  }

  async findLockedResponse(route: Route): Promise<Response | undefined> {
    const lockedResponses = route.responses?.filter((r) => r.isLocked);
    if (!lockedResponses?.length) return undefined;
    return lockedResponses[Math.floor(Math.random() * lockedResponses.length)];
  }

  async getRoutes(): Promise<Record<string, Route>> {
    await this.initialized;
    try {
      return await this.db.getData("/routes");
    } catch (error) {
      console.error("Error getting routes", error);
      return {};
    }
  }

  async addRouteResponse(
    route: Route,
    proxyEvent: ProxyEvent,
    lockRoute: boolean = false
  ): Promise<void> {
    const normalizedResponse = {
      responseId: shortId(proxyEvent.responseBody),
      headers: proxyEvent.responseHeaders,
      body: proxyEvent.responseBody,
      status: proxyEvent.responseStatus,
      count: 1,
      isLocked: false,
    };

    route.hits++;
    route.isLocked = lockRoute || false;
    route.responses.push(normalizedResponse);

    await this.saveRoute(route);
  }

  async findRoute(routeId: string): Promise<Route> {
    const routes = await this.getRoutes();
    const route = routes[routeId];
    if (!route) {
      throw new Error(`Route ${routeId} not found`);
    }
    return route;
  }

  async toggleRouteLock(routeId: string): Promise<Route> {
    const routes = await this.getRoutes();
    const route = routes[routeId];
    if (!route) {
      throw new Error(`Route ${routeId} not found`);
    }

    route.isLocked = !route.isLocked;

    await this.saveRoute(route);
    return route;
  }

  clearEvents(): void {
    this.db.push("/routes", {});
  }
}

export const requestLogsStorage = new RequestLogsStorage();
