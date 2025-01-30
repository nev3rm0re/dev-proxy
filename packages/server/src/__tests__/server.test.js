import request from 'supertest';
import { startServer } from '../index.js';

describe('Server Tests', () => {
  let adminServer;
  let proxyServer;

  beforeAll(async () => {
    const servers = await startServer({ proxyPort: 3100, adminPort: 3101 });
    adminServer = servers.adminServer;
    proxyServer = servers.proxyServer;
  });

  afterAll(async () => {
    return new Promise((resolve) => {
      // Close both servers
      adminServer.close(() => {
        proxyServer.close(() => {
          resolve();
        });
      });
    });
  });

  describe('Admin API', () => {
    it('should serve static files', async () => {
      const response = await request(adminServer).get('/');
      expect(response.status).toBe(200);
      expect(response.type).toMatch(/html/);
    });

    it('should handle API requests', async () => {
      const response = await request(adminServer).get('/api/status');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe('Proxy Server', () => {
    it('should handle proxy requests', async () => {
      const response = await request(proxyServer)
        .get('/test-project/some-path')
        .set('Host', 'localhost:3100');
      
      expect(response.status).toBe(500);
    });
  });
}); 