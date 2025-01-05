#!/usr/bin/env node
import { program } from 'commander';
import { startServer } from './index.js';

program
  .name('dev-proxy')
  .description('Development proxy server for API monitoring')
  .version('0.1.0')
  .option('-p, --port <number>', 'port to run on', '3000')
  .option('-s, --storage <path>', 'storage file path', './dev-proxy-storage.json');

program.parse();

const options = program.opts();

startServer({
  port: parseInt(options.port),
  storagePath: options.storage
});

console.log(`Dev Proxy running on port ${options.port}`);
console.log(`Storage file: ${options.storage}`);