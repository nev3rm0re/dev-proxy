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
  .option('-p, --port <number>', 'port to run on', '3000')
  .option('-s, --storage <path>', 'storage file path', './proxyDB.json');

program.parse();

const options = program.opts();

startServer({
  port: parseInt(options.port),
  storagePath: options.storage
});

console.log(`Dev Proxy running on port ${options.port}`);
console.log(`Storage file: ${path.resolve(options.storage)}`);
