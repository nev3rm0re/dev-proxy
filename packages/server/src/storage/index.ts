// packages/server/src/storage/index.ts
import { JsonDB, Config } from 'node-json-db';
import { ProjectConfig, ProxyEvent, Route, Response } from '../types';
import { IncomingMessage, request } from 'http';

export class StorageManager {
  private db: JsonDB;

  constructor() {
    this.db = new JsonDB(new Config('proxyDB', true, false, '/'));
    this.init();
  }

  private async init() {
    try {
      await this.db.getData('/routes');
    } catch {
      await this.db.push('/routes', {});
    }
  }

  async setRoutes(path: string, data: any): Promise<void> {
    await this.db.push(path, data);
  }

  async createRoute(data: Omit<Route, 'id'>): Promise<Route | null> {
    const shortId = this.shortId(data.method, data.path);
    return await this.saveRoute({ id: shortId, ...data });
  }

  async saveRoute(data: Route): Promise<Route | null> {
    try {
      await this.db.push(`/routes/${data.id}`, data);
      return await this.getRoute(data.id);
    } catch (error) {
      console.error('Error saving route', error);
      return null;
    }
  }

  async getRoute(shortId: string): Promise<Route | null> {
    return await this.db.getData(`/routes/${shortId}`);
  }

  async getRouteByUrlMethod(urlPath: string, method: string): Promise<Route | null> {
    const shortId = this.shortId(method, urlPath);
    try {
      return await this.getRoute(`${shortId}`);
    } catch (error) {
      console.log('Route not found', shortId, error);
      return null;
    }
  }

  async createRouteFromRequest({ method, path, hostname }: { method: string, path: string, hostname: string}): Promise<Route | null> {
    const route: Omit<Route, 'id'> = {
      method,
      path,
      hostname,
      responses: [],
      isLocked: false,
      hits: 1
    };
    return await this.createRoute(route);
  }

  async getProject(id: string): Promise<ProjectConfig | null> {
    try {
      return await this.db.getData(`/projects/${id}`);
    } catch {
      return null;
    }
  }

  async saveProject(config: ProjectConfig): Promise<void> {
    await this.db.push(`/projects/${config.id}`, config);
  }

  async findRequest(path: string, method: string): Promise<Route | null> {
    const routes = await this.getRoutes();
    return routes.find(r => r.method === method && r.path === path) || null;
  }

  async updateRequest(projectId: string, request: Route): Promise<void> {
    const routes = await this.getRoutes();
    const route = routes.find(r => r.method === request.method && r.path === request.path);
    if (route) {
      route.hits = request.hits;
      await this.saveRoute(route);
    }
  }

  async findLastResponse(path: string, method: string): Promise<Response | null> {
    const route = await this.getRouteByUrlMethod(path, method);
    return route?.responses[0] || null;
  }

  async findRandomResponse(path: string, method: string): Promise<Response | null> {
    const route = await this.getRouteByUrlMethod(path, method);
    return route?.responses[Math.floor(Math.random() * route.responses.length)] || null;
  }

  async getRoutes(): Promise<Route[]> {
    try {
      return await this.db.getData('/routes');
    } catch (error) {
      console.error('Error getting routes', error);
      return [];
    }
  }

  async addRouteResponse(
    route: Route,
    proxyEvent: ProxyEvent,
    lockRoute?: boolean
  ): Promise<void> {

    const normalizedResponse = {
      headers: proxyEvent.responseHeaders,
      body: proxyEvent.responseBody,
      status: proxyEvent.responseStatus,
      count: 1
    };

    route.hits++;
    route.isLocked = lockRoute || false;
    route.responses.push(normalizedResponse);

    await this.saveRoute(route);
  }

  async lockRoute(routeId: string): Promise<void> {
    // flatten routes
    const routes = await this.getRoutes();
    const route = routes.find(r => r.method === routeId.split(':')[0] && r.path === routeId.split(':')[1]);
    if (!route) {
      throw new Error(`Route ${routeId} not found`);
    }

    route.isLocked = true;

    await this.saveRoute(route);
  }

  private shortId(method: string, path: string): string {
    const combined = `${method}:${path}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Convert to positive number and take modulo to ensure 6 chars in base36
    const positiveHash = Math.abs(hash);
    const shortId = positiveHash.toString(36).padStart(6, '0').slice(-6);
    console.log('Generated shortId for', method, path, shortId);
    return shortId;
  }

  // Helper method to get route by short ID
  async getRouteByShortId(projectId: string, shortId: string): Promise<Route | null> {
    const project = await this.getProject(projectId);
    if (!project) return null;

    for (const route of project.routes) {
      const routeShortId = this.shortId(route.method, route.path);
      if (routeShortId === shortId) {
        return route;
      }
    }
    return null;
  }
}

export const storage = new StorageManager();