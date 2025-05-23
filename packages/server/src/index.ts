/// <reference types="node" />

// packages/server/src/index.ts
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { WebSocketManager } from "./websocket/index.js";
import { createProxyHandler } from "./proxy/index.js";
import apiRouter from "./routes/api.js";
import { fileURLToPath } from "url";
import path from "path";
import open from "open";
import http from "http";
import type { ErrorRequestHandler } from "express";
import type { ServerOptions } from "./types/server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_ADMIN_PORT = 9000;
export const DEFAULT_PROXY_PORT = 9001;

async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.listen(startPort, () => {
      const { port } = server.address() as { port: number };
      server.close(() => resolve(port));
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.log(`Port ${startPort} in use, trying next port`);
        // Try the next port pair (increment by 10)
        resolve(findAvailablePort(startPort + 10));
      } else {
        reject(err);
      }
    });
  });
}

async function isUrlAccessible(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    http
      .get(url, (res) => {
        resolve(res.statusCode === 200);
        res.resume();
      })
      .on("error", () => {
        resolve(false);
      });
  });
}

export async function startServer(options: ServerOptions = {}) {
  const proxyPort = options.proxyPort || DEFAULT_PROXY_PORT;
  const adminPort = options.adminPort || DEFAULT_ADMIN_PORT;

  // Find available ports
  const actualProxyPort = await findAvailablePort(proxyPort);
  const actualAdminPort = await findAvailablePort(adminPort);

  // Admin/Frontend application
  const adminApp = express();
  const adminServer = createServer(adminApp);

  adminApp.use(cors());
  adminApp.use(express.json());

  adminApp.use("/api", apiRouter); // Server's own API endpoints

  adminApp.use(express.static(path.join(__dirname, "../public")));

  adminApp.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
  });

  // Attach WebSocket to the admin server
  const wsManager = new WebSocketManager(adminServer);

  // Proxy application
  const proxyApp = express();
  const proxyServer = createServer(proxyApp);

  // Add handler for root path
  proxyApp.get("/", (req, res) => {
    res.send(`
      <html>
        <head><title>Proxy Server</title></head>
        <body>
          <h1>Welcome to the Proxy Server</h1>
          <p>This is a proxy server. To use it correctly, you should:</p>
          <ul>
            <li>Access specific project endpoints using the project ID in the path</li>
            <li>Example: http://localhost:${actualProxyPort}/[server.or.hostname]/your-path</li>
          </ul>
          <p>Direct access to the root path is not supported.</p>
        </body>
      </html>
    `);
  });

  // Setup proxy middleware with error handling for all other paths
  proxyApp.use("/", (req, res, next) => {
    // Ignore favicon.ico requests
    if (req.url === "/favicon.ico") {
      res.status(404).end();
      return;
    }

    createProxyHandler(wsManager)(req, res, (err) => {
      if (err?.message?.includes("No target URL found for project")) {
        res.status(404).json({ error: "Not Found", message: err.message });
      } else {
        next(err);
      }
    });
  });

  // Error handling middleware for both servers
  const errorHandler: ErrorRequestHandler = (err, req, res) => {
    console.error(err.stack);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  };

  adminApp.use(errorHandler);
  proxyApp.use(errorHandler);

  // Start the servers using the HTTP server instances
  proxyServer.listen(actualProxyPort, () => {
    console.log(`Proxy server running on port ${actualProxyPort}`);
  });

  adminServer.listen(actualAdminPort, async () => {
    console.log(
      `Admin dashboard available at: http://localhost:${actualAdminPort}`
    );

    // Wait a short moment for the server to be fully ready
    setTimeout(async () => {
      const adminUrl = `http://localhost:${actualAdminPort}`;

      // Check if the dashboard is already open by trying to connect to it
      const isOpen = await isUrlAccessible(adminUrl);

      if (!isOpen) {
        // If not open, launch the browser
        await open(adminUrl, {
          wait: false, // Don't wait for the browser window to close
          app: {
            name: "chrome", // Prefer Chrome if available
            arguments: ["--new-window"],
          },
        }).catch((err: Error) => {
          console.error("Failed to open browser:", err);
        });
      }
    }, 1000); // Wait 1 second before checking
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise);
    console.error("Reason:", reason);

    if (reason instanceof Error) {
      console.error("Full stack trace:");
      console.error(reason.stack);

      if ((reason as any).cause || (reason as any).inner) {
        const innerError = (reason as any).cause || (reason as any).inner;
        console.error("Inner error:", innerError);
        if (innerError.stack) console.error(innerError.stack);
      }
    }
  });

  return { adminServer, proxyServer };
}
