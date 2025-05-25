---
layout: default
title: Rules API Reference
---

# Rules API Reference

This document provides a complete reference for all rule types available in dev-proxy. Each rule type has specific properties and behaviors that determine how requests are processed.

## Table of Contents

- [Rule Basics](#rule-basics)
- [Static Response Rules](#static-response-rules)
- [Forwarding Rules](#forwarding-rules)
- [Plugin Rules](#plugin-rules)
- [Request Modifier Rules](#request-modifier-rules)
- [Response Modifier Rules](#response-modifier-rules)
- [Template Variables](#template-variables)
- [Pattern Matching](#pattern-matching)

## Rule Basics

All rules share a common base structure and follow these principles:

### Base Properties

```typescript
interface BaseRule {
  id?: string;                    // Auto-generated unique identifier
  name: string;                   // Human-readable rule name
  order: number;                  // Execution order (lower = earlier)
  isActive: boolean;              // Whether the rule is enabled
  isTerminating: boolean;         // Stop processing after this rule matches
  description?: string;           // Optional description
}
```

### Rule Execution

1. **Order**: Rules are processed in ascending order (0, 1, 2, ...)
2. **Matching**: Each rule checks if the request matches its criteria
3. **Terminating**: If a terminating rule matches, processing stops
4. **Non-terminating**: Non-terminating rules modify the request/response and continue

### Rule States

- **Active**: Rule is enabled and will be evaluated
- **Inactive**: Rule is disabled and will be skipped
- **Complete**: Rule has all required properties configured
- **Incomplete**: Rule is missing required configuration

---

## Static Response Rules

Return predefined responses without forwarding to upstream servers.

### TypeScript Interface

```typescript
interface StaticResponseRule extends BaseRule {
  type: "static";
  method: string | string[];              // HTTP method(s) to match
  pathPattern: string;                    // Path pattern to match
  responseStatus: number;                 // HTTP status code to return
  responseBody: string;                   // Response body content
  responseHeaders?: Record<string, string>; // Optional response headers
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `method` | `string \| string[]` | ✅ | HTTP method(s): `"GET"`, `"POST"`, `"*"` (any), `["GET", "POST"]` |
| `pathPattern` | `string` | ✅ | Path pattern with wildcards: `/api/*`, `/users/123` |
| `responseStatus` | `number` | ✅ | HTTP status code: `200`, `404`, `500`, etc. |
| `responseBody` | `string` | ✅ | Response content (JSON, HTML, plain text) |
| `responseHeaders` | `Record<string, string>` | ❌ | Custom response headers |

### Behavior

- **Terminating**: Always terminating (stops rule processing)
- **Use Cases**: API mocking, error simulation, health checks
- **Performance**: Fastest response type (no network calls)

### Examples

#### Health Check Endpoint
```json
{
  "name": "API Health Check",
  "type": "static",
  "method": "GET",
  "pathPattern": "/health",
  "responseStatus": 200,
  "responseBody": "{\"status\": \"healthy\", \"timestamp\": \"2024-01-01T00:00:00Z\"}",
  "responseHeaders": {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache"
  },
  "isTerminating": true
}
```

#### Error Simulation
```json
{
  "name": "Simulate Server Error",
  "type": "static",
  "method": "*",
  "pathPattern": "/api/error",
  "responseStatus": 500,
  "responseBody": "{\"error\": \"Internal Server Error\", \"code\": \"ERR_INTERNAL\"}",
  "isTerminating": true
}
```

#### Mock User Data
```json
{
  "name": "Mock User List",
  "type": "static",
  "method": "GET",
  "pathPattern": "/api/users",
  "responseStatus": 200,
  "responseBody": "{\"users\": [{\"id\": 1, \"name\": \"Alice\"}, {\"id\": 2, \"name\": \"Bob\"}]}",
  "isTerminating": true
}
```

---

## Forwarding Rules

Proxy requests to upstream servers and return the upstream response unchanged.

### TypeScript Interface

```typescript
interface ForwardingRule extends BaseRule {
  type: "forwarding";
  method: string | string[];              // HTTP method(s) to match
  pathPattern: string;                    // Path pattern to match
  targetUrl: string;                      // URL to forward requests to
  pathTransformation?: string;            // How to transform the path
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `method` | `string \| string[]` | ✅ | HTTP method(s) to match |
| `pathPattern` | `string` | ✅ | Path pattern with capture groups |
| `targetUrl` | `string` | ✅ | Target URL with optional capture group substitution |
| `pathTransformation` | `string` | ❌ | Custom path transformation logic |

### Behavior

- **Response Passthrough**: Status, headers, and body from upstream are returned as-is
- **Capture Groups**: Use `$1`, `$2`, etc. to substitute captured path segments
- **Terminating**: Usually terminating (but can be non-terminating for middleware)
- **Use Cases**: API proxying, environment routing, load balancing

### Capture Groups

Forwarding rules support regex capture groups for dynamic URL construction:

```
Pattern: /api/v([0-9]+)/(.*)
Target:  https://api-v$1.example.com/$2

Request: /api/v2/users/123
Result:  https://api-v2.example.com/users/123
```

### Examples

#### Simple API Forwarding
```json
{
  "name": "Forward API Requests",
  "type": "forwarding",
  "method": "*",
  "pathPattern": "/api/*",
  "targetUrl": "https://api.example.com",
  "isTerminating": true
}
```

#### Version-based Routing
```json
{
  "name": "Route API Versions",
  "type": "forwarding",
  "method": "*",
  "pathPattern": "/api/(v[0-9]+)/(.*)",
  "targetUrl": "https://api-$1.example.com/$2",
  "isTerminating": true
}
```

#### Microservice Routing
```json
{
  "name": "Microservice Router",
  "type": "forwarding",
  "method": "*",
  "pathPattern": "/services/([^/]+)/(.*)",
  "targetUrl": "http://$1-service.internal:8080/$2",
  "isTerminating": true
}
```

#### Domain-based Forwarding
```json
{
  "name": "Local Domain Forwarding",
  "type": "forwarding",
  "method": "*",
  "pathPattern": "/([a-zA-Z0-9-]+\\.local)(.*)",
  "targetUrl": "http://$1$2",
  "isTerminating": true
}
```

#### Development Environment Routing
```json
{
  "name": "Dev Environment Router",
  "type": "forwarding",
  "method": "*",
  "pathPattern": "/dev/([^/]+)/(.*)",
  "targetUrl": "https://$1.dev.example.com/$2",
  "isTerminating": true
}
```

---

## Plugin Rules

Generate dynamic responses using plugins (currently supports JWT generation).

### TypeScript Interface

```typescript
interface PluginRule extends BaseRule {
  type: "plugin";
  pluginType: string;                     // Plugin type: "jwt"
  method: string | string[];              // HTTP method(s) to match
  pathPattern: string;                    // Path pattern to match
  responseStatus: number;                 // HTTP status code to return
  responseTemplate: string;               // Response template with plugin variables
  pluginConfig: Record<string, unknown>;  // Plugin-specific configuration
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `pluginType` | `string` | ✅ | Plugin type: `"jwt"` |
| `method` | `string \| string[]` | ✅ | HTTP method(s) to match |
| `pathPattern` | `string` | ✅ | Path pattern to match |
| `responseStatus` | `number` | ✅ | HTTP status code to return |
| `responseTemplate` | `string` | ✅ | Template with `${jwt}` placeholder |
| `pluginConfig` | `Record<string, unknown>` | ✅ | Plugin configuration |

### JWT Plugin Configuration

```typescript
interface JwtPluginConfig {
  secret: string;                         // JWT signing secret
  kid?: string;                          // Key ID for JWT header
  exp?: number;                          // Expiration time in seconds
  additionalClaims: Record<string, unknown>; // Custom JWT claims
  responseFormat?: "raw" | "json";       // Response format
  jsonProperty?: string;                 // Property name for JSON format
}
```

### JWT Plugin Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `secret` | `string` | ✅ | - | Secret key for signing JWT tokens |
| `kid` | `string` | ❌ | - | Key ID included in JWT header |
| `exp` | `number` | ❌ | `3600` | Token expiration in seconds |
| `additionalClaims` | `Record<string, unknown>` | ❌ | `{}` | Custom claims to include in JWT |
| `responseFormat` | `"raw" \| "json"` | ❌ | `"raw"` | How to format the response |
| `jsonProperty` | `string` | ❌ | `"jwt"` | Property name when using JSON format |

### Behavior

- **Dynamic Generation**: Creates fresh tokens on each request
- **Template Variables**: Use `${jwt}` in response template
- **Custom Claims**: Support for dynamic claims with template variables
- **Terminating**: Always terminating

### Examples

#### Simple JWT Token
```json
{
  "name": "JWT Token Generator",
  "type": "plugin",
  "pluginType": "jwt",
  "method": "GET",
  "pathPattern": "/auth/token",
  "responseStatus": 200,
  "responseTemplate": "${jwt}",
  "pluginConfig": {
    "secret": "your-secret-key",
    "exp": 3600,
    "additionalClaims": {
      "userId": "12345",
      "role": "admin"
    }
  },
  "isTerminating": true
}
```

#### JWT with JSON Response
```json
{
  "name": "JWT API Response",
  "type": "plugin",
  "pluginType": "jwt",
  "method": "POST",
  "pathPattern": "/auth/login",
  "responseStatus": 201,
  "responseTemplate": "{\"access_token\": \"${jwt}\", \"token_type\": \"Bearer\", \"expires_in\": 3600}",
  "pluginConfig": {
    "secret": "super-secret-key",
    "exp": 7200,
    "additionalClaims": {
      "userId": "user-{{randomId}}",
      "role": "admin",
      "permissions": ["read", "write"],
      "tenant": "{{env.TENANT_ID}}"
    },
    "responseFormat": "json",
    "jsonProperty": "access_token"
  },
  "isTerminating": true
}
```

#### Zendesk JWT Token
```json
{
  "name": "Zendesk JWT Token",
  "type": "plugin",
  "pluginType": "jwt",
  "method": "GET",
  "pathPattern": "/auth/zendesk/token",
  "responseStatus": 200,
  "responseTemplate": "{\"token\": \"${jwt}\"}",
  "pluginConfig": {
    "secret": "zendesk-secret",
    "kid": "zendesk-key-1",
    "exp": 3600,
    "additionalClaims": {
      "iss": "your-app",
      "sub": "user@example.com",
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "isTerminating": true
}
```

---

## Request Modifier Rules

Modify incoming requests before they are processed by subsequent rules.

### TypeScript Interface

```typescript
interface RequestModifierRule extends BaseRule {
  type: "request-modifier";
  method: string | string[];              // HTTP method(s) to match
  pathPattern: string;                    // Path pattern to match
  requestModifications: Record<string, unknown>; // Modifications to apply
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `method` | `string \| string[]` | ✅ | HTTP method(s) to match |
| `pathPattern` | `string` | ✅ | Path pattern to match |
| `requestModifications` | `Record<string, unknown>` | ✅ | Modifications using dot notation |

### Behavior

- **Non-terminating**: Typically non-terminating to allow rule chaining
- **Dot Notation**: Use dot notation to modify nested properties
- **Template Variables**: Support for dynamic values
- **Use Cases**: Authentication, request enrichment, debugging

### Modification Targets

| Target | Example | Description |
|--------|---------|-------------|
| Headers | `headers.Authorization` | Add/modify request headers |
| Query Parameters | `query.version` | Add/modify query parameters |
| Body Properties | `body.metadata.timestamp` | Modify request body (JSON) |
| URL | `url` | Modify the request URL |

### Examples

#### Add Authentication Headers
```json
{
  "name": "Add Authentication Headers",
  "type": "request-modifier",
  "method": "*",
  "pathPattern": "/api/*",
  "requestModifications": {
    "headers.Authorization": "Bearer {{env.API_TOKEN}}",
    "headers.X-User-Id": "{{userId}}",
    "headers.X-Request-Id": "{{randomId}}"
  },
  "isTerminating": false
}
```

#### Add Request Metadata
```json
{
  "name": "Add Request Metadata",
  "type": "request-modifier",
  "method": "*",
  "pathPattern": "/api/user/*",
  "requestModifications": {
    "headers.X-User-Context": "authenticated",
    "headers.X-Session-Id": "{{randomId}}",
    "body.audit.modifiedBy": "dev-proxy",
    "body.audit.timestamp": "{{timestamp}}",
    "query.version": "v2"
  },
  "isTerminating": false
}
```

#### Debug Request Enhancement
```json
{
  "name": "Debug Request Enhancement",
  "type": "request-modifier",
  "method": "*",
  "pathPattern": "/debug/*",
  "requestModifications": {
    "headers.X-Debug-Mode": "true",
    "headers.X-Debug-Timestamp": "{{timestamp}}",
    "body.debug.enabled": true,
    "body.debug.requestId": "{{randomId}}"
  },
  "isTerminating": false
}
```

---

## Response Modifier Rules

Enhance responses from any source (static rules, forwarding rules, cached responses).

### TypeScript Interface

```typescript
interface ResponseModifierRule extends BaseRule {
  type: "response-modifier";
  method: string | string[];              // HTTP method(s) to match
  pathPattern: string;                    // Path pattern to match
  responseModifications: Record<string, unknown>; // Base modifications
  conditionalRules?: Array<{             // Conditional modifications
    condition: string;                   // JavaScript condition
    modifications: Record<string, unknown>;
  }>;
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `method` | `string \| string[]` | ✅ | HTTP method(s) to match |
| `pathPattern` | `string` | ✅ | Path pattern to match |
| `responseModifications` | `Record<string, unknown>` | ✅ | Base modifications applied to all responses |
| `conditionalRules` | `Array<ConditionalRule>` | ❌ | Conditional modifications based on response |

### Conditional Rules

```typescript
interface ConditionalRule {
  condition: string;                      // JavaScript expression
  modifications: Record<string, unknown>; // Modifications to apply if condition is true
}
```

### Behavior

- **Response Sources**: Works with responses from static rules, forwarding rules, cached responses
- **Conditional Logic**: Apply different modifications based on response properties
- **Terminating**: Usually terminating (applied after response generation)
- **Use Cases**: Error handling, response enrichment, debugging

### Available Variables in Conditions

| Variable | Type | Description |
|----------|------|-------------|
| `response.status` | `number` | HTTP status code |
| `response.headers` | `Record<string, string>` | Response headers |
| `response.body` | `any` | Response body (parsed if JSON) |
| `request.method` | `string` | Request HTTP method |
| `request.path` | `string` | Request path |
| `request.headers` | `Record<string, string>` | Request headers |

### Examples

#### Basic Response Enhancement
```json
{
  "name": "Enhance API Responses",
  "type": "response-modifier",
  "method": "*",
  "pathPattern": "/api/*",
  "responseModifications": {
    "headers.X-Proxy-Modified": "true",
    "headers.X-Timestamp": "{{timestamp}}",
    "body.metadata.processedBy": "dev-proxy",
    "body.metadata.version": "1.0"
  },
  "isTerminating": true
}
```

#### Error Recovery
```json
{
  "name": "Graceful Error Handling",
  "type": "response-modifier",
  "method": "*",
  "pathPattern": "/api/*",
  "responseModifications": {
    "headers.X-Error-Recovery": "enabled"
  },
  "conditionalRules": [
    {
      "condition": "response.status === 404",
      "modifications": {
        "status": 200,
        "body.error": null,
        "body.message": "Resource not found, returning default data",
        "body.data": {"id": "default", "name": "Default Item"}
      }
    },
    {
      "condition": "response.status >= 500",
      "modifications": {
        "status": 503,
        "body.error.message": "Service temporarily unavailable",
        "body.error.retryAfter": 30,
        "headers.Retry-After": "30"
      }
    }
  ],
  "isTerminating": true
}
```

#### Client Error Enhancement
```json
{
  "name": "Client Error Enhancement",
  "type": "response-modifier",
  "method": "*",
  "pathPattern": "/api/*",
  "responseModifications": {
    "headers.X-Error-Handler": "dev-proxy"
  },
  "conditionalRules": [
    {
      "condition": "response.status >= 400 && response.status < 500",
      "modifications": {
        "body.error.recoverable": true,
        "body.error.suggestion": "Please check your request parameters",
        "headers.X-Error-Type": "client-error"
      }
    }
  ],
  "isTerminating": true
}
```

---

## Template Variables

Template variables provide dynamic values in rule configurations.

### Available Variables

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{{timestamp}}` | Current Unix timestamp | `1704067200` |
| `{{randomId}}` | Random UUID | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| `{{env.VAR_NAME}}` | Environment variable | Value of `process.env.VAR_NAME` |
| `{{userId}}` | Current user ID | `user-12345` |

### Usage Examples

```json
{
  "headers.X-Request-Id": "{{randomId}}",
  "headers.X-Timestamp": "{{timestamp}}",
  "body.metadata.apiKey": "{{env.API_KEY}}",
  "body.user.id": "{{userId}}"
}
```

---

## Pattern Matching

Path patterns support wildcards and regex for flexible request matching.

### Wildcard Patterns

| Pattern | Matches | Examples |
|---------|---------|----------|
| `/api/*` | Any path starting with `/api/` | `/api/users`, `/api/v1/data` |
| `/users/*/profile` | User profile paths | `/users/123/profile`, `/users/abc/profile` |
| `*` | Any path | `/`, `/api`, `/users/123` |

### Regex Patterns

| Pattern | Description | Matches |
|---------|-------------|---------|
| `/api/v([0-9]+)/(.*)` | API version with capture | `/api/v1/users` → `$1=1`, `$2=users` |
| `/([a-zA-Z0-9-]+\\.local)(.*)` | Local domains | `/app.local/api` → `$1=app.local`, `$2=/api` |
| `/services/([^/]+)/(.*)` | Service routing | `/services/users/list` → `$1=users`, `$2=list` |

### Capture Groups

Use `$1`, `$2`, etc. in target URLs to substitute captured groups:

```
Pattern: /api/v([0-9]+)/(.*)
Target:  https://api-v$1.example.com/$2
Request: /api/v2/users/123
Result:  https://api-v2.example.com/users/123
``` 