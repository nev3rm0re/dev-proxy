// packages/server/src/storage/index.ts
import { JsonDB, Config } from 'node-json-db';
import { shortId } from '../utils/hash.js';
import { ProxyEvent, Route, Response } from '../types/index.js';

interface Server {
    id: string;
    name: string;
    url: string;
    isDefault: boolean;
}

export class StorageManager {
  private db: JsonDB;

  constructor() {
    this.db = new JsonDB(new Config('proxyDB', true, false, '/'));
    this.init();
  }

  private async init() {
    try {
      await this.db.getData('/routes');
      await this.db.getData('/servers');
    } catch {
      await this.db.push('/routes', {});
      await this.db.push('/servers', []);
    }
  }

  async setRoutes(path: string, data: any): Promise<void> {
    await this.db.push(path, data);
  }

  async createRoute(data: Omit<Route, 'id'>): Promise<Route | null> {
    const routeId = shortId(data.method, data.path);
    return await this.saveRoute({ id: routeId, ...data });
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
    const routeId = shortId(method, urlPath);
    try {
      return await this.getRoute(`${routeId}`);
    } catch (error) {
      console.log('Route not found', routeId, error);
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

  async toggleResponseLock(requestId: string, responseId: string): Promise<Response | null> {
    const route = await this.getRoute(requestId);
    if (!route) {
      throw new Error(`Route ${requestId} not found`);
    }
    const response = route.responses.find(r => r.responseId === responseId);
    if (!response) {
      throw new Error(`Response ${responseId} not found`);
    }
    response.isLocked = !response.isLocked;
    if (response.isLocked) {
      response.lockedBody = null;
    }
    route.isLocked = route.responses.some(r => r.isLocked);
    await this.saveRoute(route);
    return response;
  }

  async findLastResponse(path: string, method: string): Promise<Response | null> {
    const route = await this.getRouteByUrlMethod(path, method);
    return route?.responses[0] || null;
  }

  async findRandomResponse(path: string, method: string): Promise<Response | null> {
    const route = await this.getRouteByUrlMethod(path, method);
    return route?.responses[Math.floor(Math.random() * route.responses.length)] || null;
  }

  async findLockedResponse(path: string, method: string): Promise<Response | null> {
    const route = await this.getRouteByUrlMethod(path, method);
    const lockedResponse = route?.responses.find(r => r.isLocked) || null;

    if (lockedResponse) {
      return lockedResponse;
    }

    return this.findRandomResponse(path, method);
  }

  async getRoutes(): Promise<Record<string, Route>> {
    try {
      return await this.db.getData('/routes');
    } catch (error) {
      console.error('Error getting routes', error);
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
      isLocked: false
    };

    route.hits++;
    route.isLocked = lockRoute || false;
    route.responses.push(normalizedResponse);

    await this.saveRoute(route);
  }

  async toggleRouteLock(routeId: string): Promise<Route> {
    // flatten routes
    const routes = await this.getRoutes();
    const route = routes[routeId];
    if (!route) {
      throw new Error(`Route ${routeId} not found`);
    }

    route.isLocked = !route.isLocked;

    await this.saveRoute(route);
    return route;
  }

  // Server management methods
  async getServers(): Promise<Server[]> {
    try {
      return await this.db.getData('/servers') || [];
    } catch (error) {
      console.error('Error getting servers', error);
      return [];
    }
  }

  async addServer(server: Server): Promise<void> {
    try {
      const servers = await this.getServers();
      servers.push(server);
      await this.db.push('/servers', servers);
    } catch (error) {
      console.error('Error adding server', error);
      throw error;
    }
  }

  async setDefaultServer(id: string): Promise<void> {
    try {
      const servers = await this.getServers();
      const serverExists = servers.some(s => s.id === id);
      
      if (!serverExists) {
        throw new Error('Server not found');
      }

      const updatedServers = servers.map(server => ({
        ...server,
        isDefault: server.id === id
      }));

      await this.db.push('/servers', updatedServers);
    } catch (error) {
      console.error('Error setting default server', error);
      throw error;
    }
  }

  async deleteServer(id: string): Promise<void> {
    try {
      const servers = await this.getServers();
      const serverToDelete = servers.find(s => s.id === id);
      
      if (!serverToDelete) {
        throw new Error('Server not found');
      }

      const updatedServers = servers.filter(server => server.id !== id);

      // If we deleted the default server and there are other servers,
      // make the first remaining server the default
      if (serverToDelete.isDefault && updatedServers.length > 0) {
        updatedServers[0].isDefault = true;
      }

      await this.db.push('/servers', updatedServers);
    } catch (error) {
      console.error('Error deleting server', error);
      throw error;
    }
  }

  async updateServer(id: string, updates: { name: string; url: string }): Promise<void> {
    try {
        const servers = await this.getServers();
        const serverIndex = servers.findIndex(s => s.id === id);
        
        if (serverIndex === -1) {
            throw new Error('Server not found');
        }

        servers[serverIndex] = {
            ...servers[serverIndex],
            ...updates
        };

        await this.db.push('/servers', servers);
    } catch (error) {
        console.error('Error updating server', error);
        throw error;
    }
  }

  clearEvents(): void {
    this.db.push('/routes', {});
  }
}

export const storage = new StorageManager();