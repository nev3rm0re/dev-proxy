import request from 'supertest';
import path from 'path';
import fs from 'fs/promises';
import { startServer } from '../index.js';

describe('Static File Serving', () => {
  const publicDir = path.join(process.cwd(), 'public');
  
  beforeAll(async () => {
    // Create temporary public directory and test files
    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(path.join(publicDir, 'index.html'), '<html>Test</html>');
    await fs.writeFile(path.join(publicDir, 'style.cs   s'), 'body { color: red; }');
  });

  afterAll(async () => {
    // Clean up test files
    await fs.rm(publicDir, { recursive: true, force: true });
  });

  it('should serve static files from public directory', async () => {
    const server = startServer({ port: 0 });
    
    try {
      const cssResponse = await request(server)
        .get('/style.css')
        .expect(200)
        .expect('Content-Type', /css/);
      
      expect(cssResponse.text).toBe('body { color: red; }');
    } finally {
      server.close();
    }
  });

  it('should serve index.html for SPA routes', async () => {
    const server = startServer({ port: 0 });
    
    try {
      // Test various SPA routes
      const routes = ['/', '/about', '/dashboard'];
      
      for (const route of routes) {
        await request(server)
          .get(route)
          .expect(200)
          .expect('Content-Type', /html/)
          .expect((res) => {
            expect(res.text).toBe('<html>Test</html>');
          });
      }
    } finally {
      server.close();
    }
  });

  it('should prioritize API routes over static files', async () => {
    const server = startServer({ port: 0 });
    
    try {
      await request(server)
        .get('/api/test')
        .expect(404)
        .expect('Content-Type', /html/);
    } finally {
      server.close();
    }
  });
}); 