// packages/server/src/storage/index.ts
import { RulesStorage, Rule } from "./RulesStorage.js";
import { RequestLogsStorage } from "./RequestLogsStorage.js";

// Re-export types and instances for easier imports
export type { Rule } from "./RulesStorage.js";
export type { ProxyEvent, Route, Response } from "../types/index.js";

// Export storage instances
export { rulesStorage } from "./RulesStorage.js";
export { requestLogsStorage } from "./RequestLogsStorage.js";

// Legacy compatibility - create a combined interface for existing code
// This allows existing code to continue working while we migrate
export class StorageManager {
  private rulesStorage: RulesStorage;
  private requestLogsStorage: RequestLogsStorage;

  constructor() {
    this.rulesStorage = new RulesStorage();
    this.requestLogsStorage = new RequestLogsStorage();
  }

  // Rules methods - delegate to RulesStorage
  async getRules() {
    return this.rulesStorage.getRules();
  }

  async getRule(id: string) {
    return this.rulesStorage.getRule(id);
  }

  async addRule(rule: Rule) {
    return this.rulesStorage.addRule(rule);
  }

  async updateRule(id: string, updates: Partial<Rule>) {
    return this.rulesStorage.updateRule(id, updates);
  }

  async deleteRule(id: string) {
    return this.rulesStorage.deleteRule(id);
  }

  async reorderRules(orderedIds: string[]) {
    return this.rulesStorage.reorderRules(orderedIds);
  }

  // Request logs methods - delegate to RequestLogsStorage
  async setRoutes(path: string, data: any) {
    return this.requestLogsStorage.setRoutes(path, data);
  }

  async createRoute(data: any) {
    return this.requestLogsStorage.createRoute(data);
  }

  async saveRoute(data: any) {
    return this.requestLogsStorage.saveRoute(data);
  }

  async getRoute(shortId: string) {
    return this.requestLogsStorage.getRoute(shortId);
  }

  async getRouteByUrlMethod(urlPath: string, method: string) {
    return this.requestLogsStorage.getRouteByUrlMethod(urlPath, method);
  }

  async createRouteFromRequest(data: any) {
    return this.requestLogsStorage.createRouteFromRequest(data);
  }

  async toggleResponseLock(requestId: string, responseId: string) {
    return this.requestLogsStorage.toggleResponseLock(requestId, responseId);
  }

  async findRandomResponse(route: any) {
    return this.requestLogsStorage.findRandomResponse(route);
  }

  async findLockedResponse(route: any) {
    return this.requestLogsStorage.findLockedResponse(route);
  }

  async getRoutes() {
    return this.requestLogsStorage.getRoutes();
  }

  async addRouteResponse(route: any, proxyEvent: any, lockRoute?: boolean) {
    return this.requestLogsStorage.addRouteResponse(
      route,
      proxyEvent,
      lockRoute
    );
  }

  async findRoute(routeId: string) {
    return this.requestLogsStorage.findRoute(routeId);
  }

  async toggleRouteLock(routeId: string) {
    return this.requestLogsStorage.toggleRouteLock(routeId);
  }

  clearEvents() {
    return this.requestLogsStorage.clearEvents();
  }
}

export const storage = new StorageManager();
