// packages/server/src/proxy/routing.ts
import type { IncomingMessage } from "http";
import { storage, type Rule } from "../storage/index.js";

const isDomainLike = (str: string): boolean => {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)+$/.test(str);
};

/**
 * Checks if a rule applies to a given request
 * @returns true if the rule matches the request
 */
function ruleMatchesRequest(rule: Rule, method: string, path: string): boolean {
  // Handle different rule types
  if (rule.type === "forwarding") {
    // Check if method matches
    const methodMatches =
      rule.method === "*" ||
      rule.method === method ||
      (Array.isArray(rule.method) && rule.method.includes(method));

    // Check if path matches pattern
    // Simple wildcard replacement for now; could be enhanced with regex
    const pathPattern = rule.pathPattern.replace("/*", ".*");
    const pathRegex = new RegExp(`^${pathPattern}$`);
    const pathMatches = pathRegex.test(path);

    return methodMatches && pathMatches;
  }

  if (rule.type === "domain") {
    // For domain rules, we check if the first part of the path matches the domain pattern
    const urlParts = path.split("/").filter(Boolean);
    const firstPart = urlParts[0] || "";

    // Simple check - match domain-like URLs
    return isDomainLike(firstPart);
  }

  // For other rule types, return false as they don't affect routing
  return false;
}

export async function determineTargetUrl(req: IncomingMessage): Promise<{
  targetUrl: string;
  hostname: string | null;
  isServerName: boolean;
  resolvedPath: string;
}> {
  const urlPath = req.url || "/";
  const method = req.method || "GET";
  const [firstPart, ...restParts] = urlPath.split("/").filter(Boolean);

  let targetUrl: string = "";
  let hostname: string | null = firstPart;
  let isServerName = false;
  let resolvedPath: string = urlPath; // Default to the original path

  // Check for matching rules
  const rules = await storage.getRules();

  console.debug("RULES", rules);
  // Find active rules first, sorted by order
  const activeRules = rules
    .filter((rule) => rule.isActive)
    .sort((a, b) => a.order - b.order);

  // Look for matching rules
  for (const rule of activeRules) {
    if (
      rule.type === "forwarding" &&
      ruleMatchesRequest(rule, method, urlPath)
    ) {
      // If we found a matching rule with a target URL, use it
      if ("targetUrl" in rule && rule.targetUrl) {
        targetUrl = rule.targetUrl as string;

        try {
          hostname = new URL(targetUrl).hostname;

          // If the rule is terminating, return immediately
          if (rule.isTerminating) {
            return {
              targetUrl,
              hostname,
              isServerName: false,
              resolvedPath: urlPath,
            };
          }
        } catch (error) {
          console.error(`Invalid targetUrl in rule ${rule.name}: ${targetUrl}`);
        }
      }
    }

    // Handle domain rules
    if (rule.type === "domain" && isDomainLike(firstPart)) {
      // For domain rules, rewrite to target the actual domain as hostname
      targetUrl = `https://${firstPart}`;
      hostname = firstPart;
      resolvedPath = `/${restParts.join("/")}`;

      console.log(`Matched domain rule: ${rule.name} -> ${targetUrl}`);

      // If the rule is terminating, return immediately
      if (rule.isTerminating) {
        return { targetUrl, hostname, isServerName: false, resolvedPath };
      }
    }
  }

  // If no rule matched and the first part looks like a domain, use domain-based routing
  if (!targetUrl && isDomainLike(firstPart)) {
    targetUrl = `https://${firstPart}`;
    hostname = firstPart;
    resolvedPath = `/${restParts.join("/")}`;
    console.log(`Using automatic domain routing: ${firstPart} -> ${targetUrl}`);
  }

  // If no rules matched and no domain-like URL, return empty to indicate no valid target
  if (!targetUrl) {
    console.log("No rules matched and no domain-like URL found");
    hostname = null;
  }

  return { targetUrl, hostname, isServerName, resolvedPath };
}
