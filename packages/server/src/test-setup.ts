// packages/server/src/test-setup.ts
import { storage } from './storage';

async function setupTestProject() {
    await storage.saveProject({
        id: 'api.api-ninjas.com',
        targetUrl: 'https://api.api-ninjas.com',
        routes: []
    });
    console.log('Test project created');
}

setupTestProject().catch(console.error);