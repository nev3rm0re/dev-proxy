#!/usr/bin/env node
import { program } from "commander";
import {
  startServer,
  DEFAULT_PROXY_PORT,
  DEFAULT_ADMIN_PORT,
} from "./index.js";
import { readFileSync } from "fs";

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
