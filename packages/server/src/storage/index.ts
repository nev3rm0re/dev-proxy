// packages/server/src/storage/index.ts
import { JsonDB, Config } from 'node-json-db';
import { ProjectConfig, ProxyEvent, Route, Response } from '../types';
import { IncomingMessage } from 'http';

export class StorageManager {
  private db: JsonDB;

  constructor() {
    this.db = new JsonDB(new Config('proxyDB', true, false, '/'));
    this.init();
  }

  private async init() {
    try {
      await this.db.getData('/projects');
    } catch {
      await this.db.push('/projects', {});
    }
  }

  async getProjects(): Promise<ProjectConfig[]> {
    return await this.db.getData('/projects');
  }
  
  async createProject(projectId: string): Promise<ProjectConfig> {
    const project: ProjectConfig = {
      id: projectId,
      routes: []
    };
    
    await this.saveProject(project);
    return project;
  }
  
  async createProjectFromRequest(projectId: string, req: IncomingMessage): Promise<ProjectConfig> {
    const project = await this.getProject(projectId);
    if (!project) {
      return await this.createProject(projectId);
    }
    project.routes.push({
      method: req.method || 'GET',
      path: req.url || '/',
      responses: [],
      isLocked: false,
      hits: 1
    });
    return project;
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

  async findRequest(projectId: string, path: string, method: string): Promise<Route | null> {
    const project = await this.getProject(projectId);
    if (!project) {
      return null;
    }
    return project.routes.find(r => r.method === method && r.path === path) || null;
  }

  async updateRequest(projectId: string, request: Route): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) {
      return;
    }
    const route = project.routes.find(r => r.method === request.method && r.path === request.path);
    if (route) {
      console.log('found route, hits before', route.hits, 'hits after', request.hits);
      route.hits = request.hits;
      await this.saveProject(project);
    }
  }

  async findLastResponse(projectId: string, path: string, method: string): Promise<Response | null> {
    const project = await this.getProject(projectId);
    if (!project) {
      return null;
    }
    const request = await this.findRequest(projectId, path, method);
    return request?.responses[0] || null;
  }

  async findRandomResponse(projectId: string, path: string, method: string): Promise<Response | null> {
    const project = await this.getProject(projectId);
    if (!project) {
      return null;
    }
    const request = await this.findRequest(projectId, path, method);
    return request?.responses[Math.floor(Math.random() * request.responses.length)] || null;
  }

  async getRoutes(): Promise<Route[]> {
    try {
      const projects = await this.getProjects();
      // flatten all projects routes into single array
      const routes = projects.flatMap(p => p.routes);
      return routes;
    } catch {
      return [];
    }
  }
  
  async addRouteResponse(
    projectId: string,
    proxyEvent: ProxyEvent,
    lockRoute?: boolean
  ): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const normalizedResponse = {
      headers: proxyEvent.responseHeaders,
      body: proxyEvent.responseBody,
      status: proxyEvent.responseStatus,
      count: 1
    };

    const route = project.routes.find(r => r.method === proxyEvent.method && r.path === proxyEvent.path);
    if (route) {
      route.hits++;
      route.isLocked = lockRoute || false;
      route.responses.push(normalizedResponse);
    } else {
      project.routes.push({
        method: proxyEvent.method,
        path: proxyEvent.path,
        responses: [normalizedResponse],
        isLocked: lockRoute || false,
        hits: 1
      });
    }

    await this.saveProject(project);
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

  async getLockedRoutes(projectId: string): Promise<Route[]> {
    try {
      const project = await this.getProject(projectId);
      return project?.routes || [];
    } catch {
      return [];
    }
  }




  async incrementResponseCount(projectId: string, method: string, path: string, responseIndex: number): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const route = project.routes.find(r => r.method === method && r.path === path);
    if (route?.responses[responseIndex]) {
      route.responses[responseIndex].count++;
      await this.saveProject(project);
    }
  }

  async setRouteLock(projectId: string, method: string, path: string, isLocked: boolean, lockedResponseIndex?: number): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const route = project.routes.find(r => r.method === method && r.path === path);
    if (!route) {
      throw new Error(`Route ${method} ${path} not found`);
    }

    route.isLocked = isLocked;
    route.lockedResponseIndex = isLocked ? lockedResponseIndex : undefined;
    
    await this.saveProject(project);
  }

  async setCustomResponse(projectId: string, method: string, path: string, response: Omit<Response, 'count'>): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const route = project.routes.find(r => r.method === method && r.path === path);
    if (!route) {
      throw new Error(`Route ${method} ${path} not found`);
    }

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    route.customResponse = {
      ...response,
      headers,
      count: 1
    };
    
    await this.saveProject(project);
  }
}

export const storage = new StorageManager();