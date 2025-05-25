---
layout: default
title: Home
---

# Dev-Proxy Documentation

A powerful development proxy server with rule-based request/response manipulation.

## Quick Start

Dev-Proxy allows you to intercept, modify, and mock HTTP requests during development. Perfect for:
- **API mocking** during frontend development
- **Testing error scenarios** without breaking backend services  
- **JWT token generation** for authentication testing
- **Request/response transformation** for debugging
- **Environment routing** for microservices

## 📖 Documentation

### Core References
- **[Rules API Reference](./rules-api.md)** - Complete reference for all rule types and their properties
- **[Use Cases & Examples](./use-cases.md)** - Common patterns and real-world examples

### Rule Types Overview

| Rule Type | Purpose | Terminating |
|-----------|---------|-------------|
| **[Static Response](./rules-api.md#static-response-rules)** | Return predefined responses | ✅ Always |
| **[Forwarding](./rules-api.md#forwarding-rules)** | Proxy requests to upstream servers | ✅ Usually |
| **[Plugin (JWT)](./rules-api.md#plugin-rules)** | Generate dynamic responses | ✅ Always |
| **[Request Modifier](./rules-api.md#request-modifier-rules)** | Modify requests before processing | ❌ Usually |
| **[Response Modifier](./rules-api.md#response-modifier-rules)** | Enhance responses from any source | ✅ Usually |

## 🚀 Common Use Cases

### API Mocking & Testing
```json
{
  "name": "Mock User API",
  "type": "static",
  "method": "GET",
  "pathPattern": "/api/users",
  "responseStatus": 200,
  "responseBody": "{\"users\": [{\"id\": 1, \"name\": \"Alice\"}]}"
}
```
[→ More API mocking examples](./use-cases.md#api-mocking--testing)

### Environment Routing
```json
{
  "name": "Route API Versions",
  "type": "forwarding", 
  "method": "*",
  "pathPattern": "/api/(v[0-9]+)/(.*)",
  "targetUrl": "https://api-$1.example.com/$2"
}
```
[→ More routing examples](./use-cases.md#development-environment-routing)

### JWT Token Generation
```json
{
  "name": "JWT Token Generator",
  "type": "plugin",
  "pluginType": "jwt",
  "method": "GET", 
  "pathPattern": "/auth/token",
  "responseTemplate": "${jwt}",
  "pluginConfig": {
    "secret": "your-secret-key",
    "additionalClaims": {"userId": "12345", "role": "admin"}
  }
}
```
[→ More JWT examples](./use-cases.md#authentication--jwt-generation)

### Request Enhancement
```json
{
  "name": "Add Auth Headers",
  "type": "request-modifier",
  "method": "*",
  "pathPattern": "/api/*", 
  "requestModifications": {
    "headers.Authorization": "Bearer {{env.API_TOKEN}}",
    "headers.X-Request-Id": "{{randomId}}"
  },
  "isTerminating": false
}
```
[→ More transformation examples](./use-cases.md#requestresponse-transformation)

## ✨ Key Features

- 🎯 **Rule-based routing** with pattern matching and capture groups
- 🔄 **Request/Response modification** with template variables (`{{timestamp}}`, `{{randomId}}`, `{{env.VAR}}`)
- 🔐 **JWT token generation** with custom claims and dynamic values
- 🌐 **Domain-based forwarding** for microservice routing
- 📝 **Static response mocking** for frontend development
- 🔗 **Rule chaining** with terminating/non-terminating rules
- 🎨 **Modern UI** with drag-and-drop rule ordering
- 📊 **Request logging** and debugging tools

## 🔧 Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{timestamp}}` | Current Unix timestamp | `1704067200` |
| `{{randomId}}` | Random UUID | `a1b2c3d4-e5f6-...` |
| `{{env.VAR_NAME}}` | Environment variable | `process.env.VAR_NAME` |
| `{{userId}}` | Current user ID | `user-12345` |

## 📋 Pattern Matching

### Wildcards
- `/api/*` - Matches any path starting with `/api/`
- `/users/*/profile` - Matches user profile paths
- `*` - Matches any path

### Regex with Capture Groups
- `/api/v([0-9]+)/(.*)` - Captures version and path
- `/([a-zA-Z0-9-]+\.local)(.*)` - Captures local domains
- `/services/([^/]+)/(.*)` - Captures service names

Use `$1`, `$2`, etc. in target URLs to substitute captured groups.

## 🏗️ Project Structure

```
dev-proxy/
├── packages/
│   ├── client/          # React frontend with rule management UI
│   ├── server/          # Node.js proxy server
│   └── types/           # Shared TypeScript types
└── docs/                # Documentation (this site)
```

## 📚 Learn More

- **[Complete Rules API Reference](./rules-api.md)** - Detailed documentation for all rule types
- **[Use Cases & Examples](./use-cases.md)** - Practical examples and patterns
- **[GitHub Repository](https://github.com/nev3rm0re/dev-proxy)** - Source code and issues

---

*Built with ❤️ for developers who need powerful request/response manipulation during development.* 