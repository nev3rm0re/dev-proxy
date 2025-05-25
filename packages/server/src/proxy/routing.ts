// packages/server/src/proxy/routing.ts
import type { IncomingMessage } from "http";
import { storage, type Rule } from "../storage/index.js";

const isDomainLike = (str: string): boolean => {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)+$/.test(str);
};

/**
 * Checks if a rule applies to a given request
 * @returns { matches: boolean, targetUrl?: string, resolvedPath?: string } match result with optional URL transformation
 */
function ruleMatchesRequest(
  rule: Rule,
  method: string,
  path: string
): {
  matches: boolean;
  targetUrl?: string;
  resolvedPath?: string;
} {
  // Handle forwarding rules
  if (rule.type === "forwarding") {
    // Check if method matches
    const methodMatches =
      rule.method === "*" ||
      rule.method === method ||
      (Array.isArray(rule.method) && rule.method.includes(method));

    if (!methodMatches) {
      return { matches: false };
    }

    // Check if path matches pattern with support for capture groups
    const pathPattern = rule.pathPattern;

    try {
      const pathRegex = new RegExp(`^${pathPattern}$`);
      const match = path.match(pathRegex);

      if (match) {
        // If we have a target URL with capture group placeholders, replace them
        let targetUrl = rule.targetUrl || "";
        let resolvedPath = path;

        if (targetUrl && match.length > 1) {
          // Replace $1, $2, etc. with captured groups
          for (let i = 1; i < match.length; i++) {
            targetUrl = targetUrl.replace(
              new RegExp(`\\$${i}`, "g"),
              match[i] || ""
            );
          }

          // For domain-based routing, extract the path after domain
          if (pathPattern.includes("(.*")) {
            const pathCaptureIndex = pathPattern.split("(").length - 1; // Last capture group is typically the path
            resolvedPath = match[pathCaptureIndex] || "/";
            if (!resolvedPath.startsWith("/")) {
              resolvedPath = "/" + resolvedPath;
            }
          }
        }

        return { matches: true, targetUrl, resolvedPath };
      }
    } catch (error) {
      console.error(
        `Invalid regex pattern in rule ${rule.name}: ${pathPattern}`,
        error
      );
    }

    // Fallback to simple wildcard matching
    const simplePattern = pathPattern.replace(/\*/g, ".*");
    const simpleRegex = new RegExp(`^${simplePattern}$`);
    if (simpleRegex.test(path)) {
      return { matches: true, targetUrl: rule.targetUrl, resolvedPath: path };
    }
  }

  // For other rule types, return false as they don't affect routing
  return { matches: false };
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

  // Find active rules first, sorted by order
  const activeRules = rules
    .filter((rule) => rule.isActive)
    .sort((a, b) => a.order - b.order);

  // Look for matching rules
  for (const rule of activeRules) {
    const matchResult = ruleMatchesRequest(rule, method, urlPath);
    if (matchResult.matches) {
      targetUrl = matchResult.targetUrl || "";
      resolvedPath = matchResult.resolvedPath || urlPath;

      try {
        hostname = new URL(targetUrl).hostname;

        // If the rule is terminating, return immediately
        if (rule.isTerminating) {
          return {
            targetUrl,
            hostname,
            isServerName: false,
            resolvedPath,
          };
        }
      } catch (error) {
        console.error(`Invalid targetUrl in rule ${rule.name}: ${targetUrl}`);
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
