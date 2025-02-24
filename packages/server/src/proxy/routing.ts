// packages/server/src/proxy/routing.ts
import type { IncomingMessage } from "http";
import { storage } from "../storage/index.js";

const isDomainLike = (str: string): boolean => {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9-]+)+$/.test(str);
};

export async function determineTargetUrl(req: IncomingMessage): Promise<{
  targetUrl: string;
  hostname: string | null;
  isServerName: boolean;
  resolvedPath: string;
}> {
  const urlPath = req.url || "/";
  const [firstPart, ...restParts] = urlPath.split("/").filter(Boolean);

  let targetUrl: string = "";
  let hostname: string | null = firstPart;
  let isServerName = false;
  let resolvedPath: string = urlPath; // Default to the original path

  // Get all servers to check for server name or default
  const servers = await storage.getServers();

  const serverByName = servers.find((s) => s.name === firstPart);

  if (serverByName) {
    // Case 1: Server name match (/myserver/...)
    targetUrl = serverByName.url;
    hostname = new URL(serverByName.url).hostname;
    isServerName = true;
    resolvedPath = `/${restParts.join("/")}`; // Construct resolved path
  } else if (isDomainLike(firstPart)) {
    // Case 2: Domain-like path (/api.example.com/...)
    targetUrl = `https://${firstPart}`;
    hostname = new URL(targetUrl).hostname;
    resolvedPath = `/${restParts.join("/")}`; // Keep the original path
  } else if (servers.length > 0) {
    // Case 3: Default server fallback (/resource/...)
    const defaultServer = servers.find((s) => s.isDefault);
    if (defaultServer) {
      targetUrl = defaultServer.url;
      hostname = new URL(defaultServer.url).hostname;
      resolvedPath = urlPath; // original path
    }
  } else {
    console.log("no servers");
  }

  // If no servers and not domain-like, return nulls to indicate stopping the routing process
  if (!targetUrl) {
    hostname = null;
  }

  return { targetUrl, hostname, isServerName, resolvedPath };
}
