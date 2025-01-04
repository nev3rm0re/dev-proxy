// packages/server/src/storage/index.ts
import { JsonDB, Config } from 'node-json-db';
import { ProjectConfig, LockedRoute } from '../types';

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

  async getLockedRoutes(projectId: string): Promise<LockedRoute[]> {
    try {
      const project = await this.getProject(projectId);
      return project?.routes || [];
    } catch {
      return [];
    }
  }

  async addLockedRoute(projectId: string, route: LockedRoute): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    
    project.routes = [...(project.routes || []), route];
    await this.saveProject(project);
  }
}

export const storage = new StorageManager();