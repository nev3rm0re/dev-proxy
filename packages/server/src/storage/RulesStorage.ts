import { JsonDB, Config } from "node-json-db";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export interface Rule {
  id: string;
  name: string;
  type: string;
  method: string | string[];
  pathPattern: string;
  responseStatus: number;
  responseBody?: string;
  responseTemplate?: string;
  pluginType?: string;
  pluginConfig?: Record<string, unknown>;
  isActive: boolean;
  isTerminating: boolean;
  order: number;
  description?: string;
  targetUrl?: string; // For forwarding rules
}

export class RulesStorage {
  private db: JsonDB;
  private initialized: Promise<void>;

  constructor() {
    // Use absolute path for rules database
    const dbPath = process.cwd().includes("packages/server")
      ? "rulesDB" // If we're in packages/server, use local path
      : "packages/server/rulesDB"; // Otherwise use path from project root

    const realPath = path.resolve(dbPath);
    console.log(`Using rules database at: ${realPath}`);

    try {
      this.db = new JsonDB(new Config(realPath, true, true, "/"));
    } catch (error) {
      console.error("Error initializing rules database", error);
      throw error;
    }

    this.initialized = this.init();
  }

  private async init() {
    try {
      await this.db.getData("/rules");
    } catch {
      await this.db.push("/rules", []);
    }

    // Create default rules if none exist
    await this.createDefaultRulesIfNeeded();
  }

  private async createDefaultRulesIfNeeded() {
    // Use direct database access to avoid circular dependency
    let rules: Rule[];
    try {
      rules = (await this.db.getData("/rules")) || [];
    } catch (error) {
      console.error("Error getting rules during init", error);
      rules = [];
    }

    // If we already have rules, don't create defaults
    if (rules.length > 0) {
      return;
    }

    console.debug("No rules found - creating default rules");

    // Add a default "forward all requests" rule (initially disabled)
    const forwardAllRule: Rule = {
      id: uuidv4(),
      name: "Forward all requests",
      type: "forwarding",
      method: "*",
      pathPattern: "/*",
      responseStatus: 200,
      targetUrl: "",
      isActive: false,
      isTerminating: true,
      order: 1,
      description: "Forward all requests to the target server",
    };

    const domainRule: Rule = {
      id: uuidv4(),
      name: "Domain routing",
      type: "domain",
      method: "*",
      pathPattern: "/([a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*(:\\d+)?)/.*",
      responseStatus: 200,
      targetUrl: "https://$1",
      isActive: true,
      isTerminating: true,
      order: 0,
      description:
        "Route requests based on domain in the path, preserving the rest of the path",
    };

    // Use direct database access to avoid circular dependency
    rules.push(forwardAllRule);
    rules.push(domainRule);
    await this.db.push("/rules", rules);
  }

  async getRules(): Promise<Rule[]> {
    await this.initialized;
    try {
      return (await this.db.getData("/rules")) || [];
    } catch (error) {
      console.error("Error getting rules", error);
      return [];
    }
  }

  async getRule(id: string): Promise<Rule | null> {
    try {
      const rules = await this.getRules();
      return rules.find((rule) => rule.id === id) || null;
    } catch (error) {
      console.error("Error getting rule", error);
      return null;
    }
  }

  async addRule(rule: Rule): Promise<Rule> {
    try {
      const rules = await this.getRules();
      rules.push(rule);
      await this.db.push("/rules", rules);
      return rule;
    } catch (error) {
      console.error("Error adding rule", error);
      throw error;
    }
  }

  async updateRule(id: string, updates: Partial<Rule>): Promise<Rule | null> {
    await this.initialized;
    try {
      const rules = await this.getRules();
      const ruleIndex = rules.findIndex((rule) => rule.id === id);

      if (ruleIndex === -1) {
        console.log(`Rule with ID ${id} not found`);
        return null;
      }

      rules[ruleIndex] = {
        ...rules[ruleIndex],
        ...updates,
      };

      await this.db.push("/rules", rules);
      return rules[ruleIndex];
    } catch (error) {
      console.error("Error updating rule", error);
      throw error;
    }
  }

  async deleteRule(id: string): Promise<boolean> {
    try {
      const rules = await this.getRules();
      const updatedRules = rules.filter((rule) => rule.id !== id);

      if (rules.length === updatedRules.length) {
        return false; // No rule was deleted
      }

      await this.db.push("/rules", updatedRules);
      return true;
    } catch (error) {
      console.error("Error deleting rule", error);
      throw error;
    }
  }

  async reorderRules(orderedIds: string[]): Promise<Rule[]> {
    try {
      const rules = await this.getRules();

      // Map the rules to their new order
      const reorderedRules = orderedIds
        .map((id, index) => {
          const rule = rules.find((r) => r.id === id);
          if (rule) {
            return { ...rule, order: index };
          }
          return null;
        })
        .filter((rule): rule is Rule => rule !== null);

      await this.db.push("/rules", reorderedRules);
      return reorderedRules;
    } catch (error) {
      console.error("Error reordering rules", error);
      throw error;
    }
  }
}

export const rulesStorage = new RulesStorage();
