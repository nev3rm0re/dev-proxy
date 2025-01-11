/**
 * This script is used to migrate the data from the old format to the new format.
 * 
 * It's for development purposes only, no need to commit it.
 */

import { shortId } from './dist/utils/hash.js';
// Load storage
import { storage } from './dist/storage/index.js';

async function setResponseIdForResponses() {
    // Load routes
    const routes = await storage.getRoutes();
    const migratedRoutes = Object.entries(routes).reduce((acc, [routeId, route]) => {
        route.responses.forEach(response => {
            response.responseId = shortId(
                response.body,
                response.statusCode, 
                response.headers, 
                response.statusMessage
            );
            response.isLocked = false;
        })
        acc[routeId] = route;
        return acc;
    }, {});
    // console.log(migratedRoutes['5pn7re'].responses);
    storage.setRoutes('/routes', migratedRoutes);
}

setResponseIdForResponses();
