# Dev-Proxy Documentation

A powerful development proxy server with rule-based request/response manipulation.

## Table of Contents

- [Rules API Reference](./rules-api.md) - Complete reference for all rule types and their properties
- [Use Cases & Examples](./use-cases.md) - Common patterns and real-world examples
- [Getting Started](./getting-started.md) - Quick setup and basic usage
- [Architecture](./architecture.md) - System design and technical details

## Quick Links

### Rule Types
- **[Static Response Rules](./rules-api.md#static-response-rules)** - Return predefined responses
- **[Forwarding Rules](./rules-api.md#forwarding-rules)** - Proxy requests to upstream servers
- **[Plugin Rules](./rules-api.md#plugin-rules)** - Generate dynamic responses (JWT, etc.)
- **[Request Modifier Rules](./rules-api.md#request-modifier-rules)** - Modify requests before processing
- **[Response Modifier Rules](./rules-api.md#response-modifier-rules)** - Enhance responses from any source

### Common Use Cases
- [API Mocking & Testing](./use-cases.md#api-mocking--testing)
- [Development Environment Routing](./use-cases.md#development-environment-routing)
- [Authentication & JWT Generation](./use-cases.md#authentication--jwt-generation)
- [Request/Response Transformation](./use-cases.md#requestresponse-transformation)
- [Error Handling & Recovery](./use-cases.md#error-handling--recovery)

## Features

- 🎯 **Rule-based routing** with pattern matching
- 🔄 **Request/Response modification** with template variables
- 🔐 **JWT token generation** with custom claims
- 🌐 **Domain-based forwarding** with capture groups
- 📝 **Static response mocking** for testing
- 🔗 **Rule chaining** with terminating/non-terminating rules
- 🎨 **Modern UI** with drag-and-drop rule ordering
- 📊 **Request logging** and debugging tools

## Project Structure

```
dev-proxy/
├── packages/
│   ├── client/          # React frontend
│   ├── server/          # Node.js proxy server
│   └── types/           # Shared TypeScript types
└── docs/                # Documentation (this directory)
``` 