#!/usr/bin/env node
import { program } from "commander";
import {
  startServer,
  DEFAULT_PROXY_PORT,
  DEFAULT_ADMIN_PORT,
} from "./index.js";
import { readFileSync } from "fs";

// Add better error handling for unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise);
  console.error("Reason:", reason);

  // Print full stack trace with promise chain
  if (reason instanceof Error) {
    console.error("Full stack trace:");
    console.error(reason.stack);

    // If there's a cause or inner error
    const reasonAny = reason as any;
    if (reasonAny.cause || reasonAny.inner) {
      const innerError = reasonAny.cause || reasonAny.inner;
      console.error("Inner error:", innerError);
      if (innerError.stack) console.error(innerError.stack);
    }
  }
});

// Read version from package.json
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
);

program
  .name("dev-proxy")
  .description("Development proxy server for API monitoring")
  .version(packageJson.version)
  .option(
    "-p, --proxy-port <number>",
    "proxy port to run on",
    DEFAULT_PROXY_PORT.toString()
  )
  .option(
    "-a, --admin-port <number>",
    "admin dashboard port to run on",
    DEFAULT_ADMIN_PORT.toString()
  )
  .option("-s, --storage <path>", "storage file path", "./proxyDB.json");

program.parse();

const options = program.opts();

await startServer({
  proxyPort: parseInt(options.proxyPort),
  adminPort: parseInt(options.adminPort),
  storagePath: options.storage,
});
