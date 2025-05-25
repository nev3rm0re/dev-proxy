import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { RulesStorage, type Rule } from "../storage/RulesStorage.js";
import { determineTargetUrl } from "../proxy/routing.js";
import { storage } from "../storage/index.js";
import { IncomingMessage } from "http";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

// Mock the storage methods
jest.mock("../storage/index.js", () => ({
  storage: {
    getRules: jest.fn(),
  },
}));

// Get the mocked storage
const mockedStorage = jest.mocked(storage);

describe("RulesStorage", () => {
  let rulesStorage: RulesStorage;
  const testDbPath = path.resolve("test-rules.json");

  beforeEach(() => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    rulesStorage = new RulesStorage();
  });

  afterEach(() => {
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe("Rule CRUD Operations", () => {
    test("should create and retrieve rules", async () => {
      const rule: Rule = {
        id: uuidv4(),
        name: "Test Rule",
        type: "static",
        method: "GET",
        pathPattern: "/test",
        responseStatus: 200,
        responseBody: "Test response",
        isActive: true,
        isTerminating: true,
        order: 1,
      };

      await rulesStorage.addRule(rule);
      const retrievedRule = await rulesStorage.getRule(rule.id);

      expect(retrievedRule).toEqual(rule);
    });

    test("should update existing rules", async () => {
      const rule: Rule = {
        id: uuidv4(),
        name: "Original Rule",
        type: "static",
        method: "GET",
        pathPattern: "/original",
        responseStatus: 200,
        responseBody: "Original response",
        isActive: true,
        isTerminating: true,
        order: 1,
      };

      await rulesStorage.addRule(rule);

      const updates = {
        name: "Updated Rule",
        responseBody: "Updated response",
        isActive: false,
      };

      const updatedRule = await rulesStorage.updateRule(rule.id, updates);

      expect(updatedRule).toMatchObject({
        ...rule,
        ...updates,
      });
    });

    test("should delete rules", async () => {
      const rule: Rule = {
        id: uuidv4(),
        name: "Rule to Delete",
        type: "static",
        method: "GET",
        pathPattern: "/delete",
        responseStatus: 200,
        responseBody: "Delete me",
        isActive: true,
        isTerminating: true,
        order: 1,
      };

      await rulesStorage.addRule(rule);
      const deleted = await rulesStorage.deleteRule(rule.id);
      const retrievedRule = await rulesStorage.getRule(rule.id);

      expect(deleted).toBe(true);
      expect(retrievedRule).toBeNull();
    });

    test("should reorder rules", async () => {
      const rule1: Rule = {
        id: "rule1",
        name: "Rule 1",
        type: "static",
        method: "GET",
        pathPattern: "/1",
        responseStatus: 200,
        responseBody: "Response 1",
        isActive: true,
        isTerminating: true,
        order: 0,
      };

      const rule2: Rule = {
        id: "rule2",
        name: "Rule 2",
        type: "static",
        method: "GET",
        pathPattern: "/2",
        responseStatus: 200,
        responseBody: "Response 2",
        isActive: true,
        isTerminating: true,
        order: 1,
      };

      await rulesStorage.addRule(rule1);
      await rulesStorage.addRule(rule2);

      // Reorder: rule2 first, then rule1
      const reorderedRules = await rulesStorage.reorderRules([
        "rule2",
        "rule1",
      ]);

      expect(reorderedRules[0].id).toBe("rule2");
      expect(reorderedRules[0].order).toBe(0);
      expect(reorderedRules[1].id).toBe("rule1");
      expect(reorderedRules[1].order).toBe(1);
    });
  });

  describe("Rule Types", () => {
    test("should handle static response rules", async () => {
      const staticRule: Rule = {
        id: uuidv4(),
        name: "Static API Response",
        type: "static",
        method: ["GET", "POST"],
        pathPattern: "/api/static",
        responseStatus: 200,
        responseBody: JSON.stringify({ message: "Static response" }),
        responseHeaders: { "Content-Type": "application/json" },
        isActive: true,
        isTerminating: true,
        order: 1,
        description: "Returns static JSON response",
      };

      await rulesStorage.addRule(staticRule);
      const retrieved = await rulesStorage.getRule(staticRule.id);

      expect(retrieved?.type).toBe("static");
      expect(retrieved?.responseBody).toBe(staticRule.responseBody);
      expect(retrieved?.responseHeaders).toEqual(staticRule.responseHeaders);
    });

    test("should handle forwarding rules", async () => {
      const forwardingRule: Rule = {
        id: uuidv4(),
        name: "API Forwarding",
        type: "forwarding",
        method: "*",
        pathPattern: "/api/*",
        responseStatus: 200,
        targetUrl: "https://api.example.com",
        isActive: true,
        isTerminating: true,
        order: 1,
        description: "Forward API requests",
      };

      await rulesStorage.addRule(forwardingRule);
      const retrieved = await rulesStorage.getRule(forwardingRule.id);

      expect(retrieved?.type).toBe("forwarding");
      expect(retrieved?.targetUrl).toBe(forwardingRule.targetUrl);
    });

    test("should handle plugin rules", async () => {
      const pluginRule: Rule = {
        id: uuidv4(),
        name: "JWT Generator",
        type: "plugin",
        pluginType: "jwt",
        method: "GET",
        pathPattern: "/auth/token",
        responseStatus: 200,
        responseTemplate: '{"token": "${jwt}"}',
        pluginConfig: {
          secret: "test-secret",
          exp: 3600,
          additionalClaims: { scope: "user" },
        },
        isActive: true,
        isTerminating: true,
        order: 1,
        description: "Generate JWT tokens",
      };

      await rulesStorage.addRule(pluginRule);
      const retrieved = await rulesStorage.getRule(pluginRule.id);

      expect(retrieved?.type).toBe("plugin");
      expect(retrieved?.pluginType).toBe("jwt");
      expect(retrieved?.pluginConfig).toEqual(pluginRule.pluginConfig);
    });
  });

  describe("Default Rules", () => {
    test("should create default rules when none exist", async () => {
      const rules = await rulesStorage.getRules();

      expect(rules.length).toBeGreaterThan(0);

      // Should have a domain-based forwarding rule
      const domainRule = rules.find((r) => r.name.includes("Domain-based"));
      expect(domainRule).toBeDefined();
      expect(domainRule?.type).toBe("forwarding");
      expect(domainRule?.pathPattern).toContain("([a-zA-Z0-9-]+");
    });
  });
});

describe("Routing Logic", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  function createMockRequest(
    url: string,
    method: string = "GET"
  ): IncomingMessage {
    return {
      url,
      method,
      headers: {},
    } as IncomingMessage;
  }

  describe("Static Response Rules", () => {
    test("should not affect routing for static rules", async () => {
      const staticRule: Rule = {
        id: "static-1",
        name: "Static Rule",
        type: "static",
        method: "GET",
        pathPattern: "/api/health",
        responseStatus: 200,
        responseBody: "OK",
        isActive: true,
        isTerminating: true,
        order: 1,
      };

      mockedStorage.getRules.mockResolvedValue([staticRule]);

      const req = createMockRequest("/api/health");
      const result = await determineTargetUrl(req);

      // Static rules don't affect routing
      expect(result.targetUrl).toBe("");
      expect(result.hostname).toBeNull();
    });
  });

  describe("Forwarding Rules", () => {
    test("should handle simple forwarding", async () => {
      const forwardingRule: Rule = {
        id: "forward-1",
        name: "API Forwarding",
        type: "forwarding",
        method: "*",
        pathPattern: "/api/*",
        responseStatus: 200,
        targetUrl: "https://api.example.com",
        isActive: true,
        isTerminating: true,
        order: 1,
      };

      mockedStorage.getRules.mockResolvedValue([forwardingRule]);

      const req = createMockRequest("/api/users");
      const result = await determineTargetUrl(req);

      expect(result.targetUrl).toBe("https://api.example.com");
      expect(result.hostname).toBe("api.example.com");
    });

    test("should handle domain-based forwarding with capture groups", async () => {
      const domainRule: Rule = {
        id: "domain-1",
        name: "Domain Forwarding",
        type: "forwarding",
        method: "*",
        pathPattern: "/([a-zA-Z0-9.-]+)(.*)",
        responseStatus: 200,
        targetUrl: "https://$1$2",
        isActive: true,
        isTerminating: true,
        order: 1,
      };

      mockedStorage.getRules.mockResolvedValue([domainRule]);

      const req = createMockRequest("/api.example.com/users");
      const result = await determineTargetUrl(req);

      expect(result.targetUrl).toBe("https://api.example.com/users");
      expect(result.hostname).toBe("api.example.com");
      expect(result.resolvedPath).toBe("/users");
    });

    test("should handle complex domain patterns with ports", async () => {
      const domainRule: Rule = {
        id: "domain-2",
        name: "Domain with Port",
        type: "forwarding",
        method: "*",
        pathPattern: "/([a-zA-Z0-9.-]+:[0-9]+)(.*)",
        responseStatus: 200,
        targetUrl: "http://$1$2",
        isActive: true,
        isTerminating: true,
        order: 1,
      };

      mockedStorage.getRules.mockResolvedValue([domainRule]);

      const req = createMockRequest("/localhost:3000/api/data");
      const result = await determineTargetUrl(req);

      expect(result.targetUrl).toBe("http://localhost:3000/api/data");
      expect(result.hostname).toBe("localhost");
      expect(result.resolvedPath).toBe("/api/data");
    });

    test("should respect rule order and terminating behavior", async () => {
      const rule1: Rule = {
        id: "rule-1",
        name: "First Rule",
        type: "forwarding",
        method: "*",
        pathPattern: "/api/*",
        responseStatus: 200,
        targetUrl: "https://first.example.com",
        isActive: true,
        isTerminating: false, // Non-terminating
        order: 1,
      };

      const rule2: Rule = {
        id: "rule-2",
        name: "Second Rule",
        type: "forwarding",
        method: "*",
        pathPattern: "/api/*",
        responseStatus: 200,
        targetUrl: "https://second.example.com",
        isActive: true,
        isTerminating: true, // Terminating
        order: 2,
      };

      mockedStorage.getRules.mockResolvedValue([rule1, rule2]);

      const req = createMockRequest("/api/test");
      const result = await determineTargetUrl(req);

      // Should use the second rule's target since first is non-terminating
      expect(result.targetUrl).toBe("https://second.example.com");
    });

    test("should handle method-specific rules", async () => {
      const getRule: Rule = {
        id: "get-rule",
        name: "GET Only",
        type: "forwarding",
        method: "GET",
        pathPattern: "/api/*",
        responseStatus: 200,
        targetUrl: "https://get.example.com",
        isActive: true,
        isTerminating: true,
        order: 1,
      };

      const postRule: Rule = {
        id: "post-rule",
        name: "POST Only",
        type: "forwarding",
        method: "POST",
        pathPattern: "/api/*",
        responseStatus: 200,
        targetUrl: "https://post.example.com",
        isActive: true,
        isTerminating: true,
        order: 2,
      };

      mockedStorage.getRules.mockResolvedValue([getRule, postRule]);

      // Test GET request
      const getReq = createMockRequest("/api/data", "GET");
      const getResult = await determineTargetUrl(getReq);
      expect(getResult.targetUrl).toBe("https://get.example.com");

      // Test POST request
      const postReq = createMockRequest("/api/data", "POST");
      const postResult = await determineTargetUrl(postReq);
      expect(postResult.targetUrl).toBe("https://post.example.com");
    });

    test("should handle array of methods", async () => {
      const multiMethodRule: Rule = {
        id: "multi-method",
        name: "GET and POST",
        type: "forwarding",
        method: ["GET", "POST"],
        pathPattern: "/api/*",
        responseStatus: 200,
        targetUrl: "https://multi.example.com",
        isActive: true,
        isTerminating: true,
        order: 1,
      };

      mockedStorage.getRules.mockResolvedValue([multiMethodRule]);

      // Test GET request
      const getReq = createMockRequest("/api/data", "GET");
      const getResult = await determineTargetUrl(getReq);
      expect(getResult.targetUrl).toBe("https://multi.example.com");

      // Test POST request
      const postReq = createMockRequest("/api/data", "POST");
      const postResult = await determineTargetUrl(postReq);
      expect(postResult.targetUrl).toBe("https://multi.example.com");

      // Test PUT request (should not match)
      const putReq = createMockRequest("/api/data", "PUT");
      const putResult = await determineTargetUrl(putReq);
      expect(putResult.targetUrl).toBe("");
    });

    test("should handle inactive rules", async () => {
      const inactiveRule: Rule = {
        id: "inactive",
        name: "Inactive Rule",
        type: "forwarding",
        method: "*",
        pathPattern: "/api/*",
        responseStatus: 200,
        targetUrl: "https://inactive.example.com",
        isActive: false, // Inactive
        isTerminating: true,
        order: 1,
      };

      mockedStorage.getRules.mockResolvedValue([inactiveRule]);

      const req = createMockRequest("/api/test");
      const result = await determineTargetUrl(req);

      // Should not match inactive rule
      expect(result.targetUrl).toBe("");
      expect(result.hostname).toBeNull();
    });
  });

  describe("Fallback Behavior", () => {
    test("should use automatic domain routing when no rules match", async () => {
      mockedStorage.getRules.mockResolvedValue([]);

      const req = createMockRequest("/api.example.com/users");
      const result = await determineTargetUrl(req);

      expect(result.targetUrl).toBe("https://api.example.com");
      expect(result.hostname).toBe("api.example.com");
      expect(result.resolvedPath).toBe("/users");
    });

    test("should return empty when no rules match and no domain-like URL", async () => {
      mockedStorage.getRules.mockResolvedValue([]);

      const req = createMockRequest("/just/a/path");
      const result = await determineTargetUrl(req);

      expect(result.targetUrl).toBe("");
      expect(result.hostname).toBeNull();
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid regex patterns gracefully", async () => {
      const invalidRule: Rule = {
        id: "invalid",
        name: "Invalid Regex",
        type: "forwarding",
        method: "*",
        pathPattern: "[invalid(regex", // Invalid regex
        responseStatus: 200,
        targetUrl: "https://example.com",
        isActive: true,
        isTerminating: true,
        order: 1,
      };

      mockedStorage.getRules.mockResolvedValue([invalidRule]);

      const req = createMockRequest("/test");
      const result = await determineTargetUrl(req);

      // Should not crash and should not match
      expect(result.targetUrl).toBe("");
    });

    test("should handle invalid target URLs gracefully", async () => {
      const invalidTargetRule: Rule = {
        id: "invalid-target",
        name: "Invalid Target",
        type: "forwarding",
        method: "*",
        pathPattern: "/test",
        responseStatus: 200,
        targetUrl: "not-a-valid-url",
        isActive: true,
        isTerminating: true,
        order: 1,
      };

      mockedStorage.getRules.mockResolvedValue([invalidTargetRule]);

      const req = createMockRequest("/test");
      const result = await determineTargetUrl(req);

      // Should handle invalid URL gracefully
      expect(result.hostname).toBeNull();
    });
  });
});
