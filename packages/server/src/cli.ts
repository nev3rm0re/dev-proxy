#!/usr/bin/env node
import { program } from 'commander';
import { startServer } from './index.js';
import path from 'path';
import { readFileSync } from 'fs';

// Read version from package.json
const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

program
  .name('dev-proxy')
  .description('Development proxy server for API monitoring')
  .version(packageJson.version)
  .option('-p, --proxy-port <number>', 'proxy port to run on', '3000')
  .option('-a, --admin-port <number>', 'admin dashboard port to run on', '3001')
  .option('-s, --storage <path>', 'storage file path', './proxyDB.json');

program.parse();

const options = program.opts();

await startServer({
  proxyPort: parseInt(options.proxyPort),
  adminPort: parseInt(options.adminPort),
  storagePath: options.storage
});