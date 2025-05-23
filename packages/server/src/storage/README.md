# Storage Architecture

This directory contains the storage layer for the dev-proxy server. We've separated storage into two main concerns:

## 🗂️ File Structure

- **`RulesStorage.ts`** - Handles rule configuration (stored in `rulesDB.json`)
- **`RequestLogsStorage.ts`** - Handles request/response logs (stored in `requestLogsDB.json`)
- **`index.ts`** - Main export file with legacy compatibility

## 🔄 Database Separation

### Rules Storage (`rulesDB.json`)
- **Purpose**: Stores proxy routing rules and configuration
- **Data**: Rule definitions, forwarding configs, domain patterns
- **Persistence**: Long-term configuration data
- **Use Case**: Business logic and routing behavior

### Request Logs Storage (`requestLogsDB.json`)
- **Purpose**: Stores intercepted requests and responses
- **Data**: HTTP logs, captured responses, route statistics
- **Persistence**: Transient operational data
- **Use Case**: Development debugging and testing

## 🚀 Usage

### Direct Usage (Recommended for new code)

```typescript
// For rules management
import { rulesStorage } from './storage/RulesStorage.js';

const rules = await rulesStorage.getRules();
await rulesStorage.addRule(newRule);

// For request logs
import { requestLogsStorage } from './storage/RequestLogsStorage.js';

const routes = await requestLogsStorage.getRoutes();
await requestLogsStorage.saveRoute(route);
```

### Legacy Compatibility (Existing code)

```typescript
// The combined storage interface continues to work
import { storage } from './storage/index.js';

const rules = await storage.getRules();  // Delegates to rulesStorage
const routes = await storage.getRoutes(); // Delegates to requestLogsStorage
```

### Type Imports

```typescript
import type { Rule } from './storage/index.js';
import type { Route, Response } from './storage/index.js';
```

## 🏗️ Architecture Benefits

1. **Separation of Concerns**: Rules and logs have different lifecycles and usage patterns
2. **Performance**: Smaller JSON files load faster and cause less lock contention
3. **Maintainability**: Each storage class has a single responsibility
4. **Backup/Restore**: Can backup configuration separately from logs
5. **Future Extensibility**: Easier to add features like log rotation or rule versioning

## 🔧 Database Configuration

Both storage classes use `node-json-db` with these settings:
- **Auto-save**: `true` - Changes saved immediately to disk
- **Human readable**: `true` - JSON files are formatted for readability
- **Separator**: `"/"` - Path separator for nested data access

## 📁 File Locations

Files are created relative to the server's working directory:
- When running from `packages/server/`: `./rulesDB.json`, `./requestLogsDB.json`
- When running from project root: `./packages/server/rulesDB.json`, `./packages/server/requestLogsDB.json`

## 🧹 Migration Notes

- Existing code using `storage.*` methods continues to work unchanged
- New code should prefer direct imports (`rulesStorage`, `requestLogsStorage`)
- The old `proxyDB.json` file can be manually migrated or will be recreated
- Both storage classes handle initialization and default data creation automatically 