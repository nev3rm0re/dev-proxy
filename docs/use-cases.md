# Use Cases & Examples

This document provides practical examples and common patterns for using dev-proxy rules in real-world scenarios.

## Table of Contents

- [API Mocking & Testing](#api-mocking--testing)
- [Development Environment Routing](#development-environment-routing)
- [Authentication & JWT Generation](#authentication--jwt-generation)
- [Request/Response Transformation](#requestresponse-transformation)
- [Error Handling & Recovery](#error-handling--recovery)
- [Caching & Performance](#caching--performance)
- [Debugging & Development](#debugging--development)
- [Rule Chaining Patterns](#rule-chaining-patterns)

---

## API Mocking & Testing

### Health Check Endpoints

Create reliable health check endpoints for testing:

```json
{
  "name": "API Health Check",
  "type": "static",
  "method": "GET",
  "pathPattern": "/health",
  "responseStatus": 200,
  "responseBody": "{\"status\": \"healthy\", \"timestamp\": \"2024-01-01T00:00:00Z\", \"version\": \"1.0.0\"}",
  "responseHeaders": {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache"
  },
  "isTerminating": true
}
```

### Mock User Data for Frontend Development

```json
{
  "name": "Mock User List",
  "type": "static",
  "method": "GET",
  "pathPattern": "/api/users",
  "responseStatus": 200,
  "responseBody": "{\"users\": [{\"id\": 1, \"name\": \"Alice Johnson\", \"role\": \"admin\"}, {\"id\": 2, \"name\": \"Bob Smith\", \"role\": \"user\"}], \"total\": 2}",
  "isTerminating": true
}
```

### Error Simulation for Testing

```json
{
  "name": "Simulate Server Error",
  "type": "static",
  "method": "*",
  "pathPattern": "/api/error",
  "responseStatus": 500,
  "responseBody": "{\"error\": \"Internal Server Error\", \"message\": \"Something went wrong\", \"code\": \"ERR_INTERNAL\"}",
  "isTerminating": true
}
```

### Rate Limiting Simulation

```json
{
  "name": "Rate Limit Response",
  "type": "static",
  "method": "*",
  "pathPattern": "/api/rate-limited/*",
  "responseStatus": 429,
  "responseBody": "{\"error\": \"Rate limit exceeded\", \"retryAfter\": 60, \"limit\": 100, \"remaining\": 0}",
  "responseHeaders": {
    "Retry-After": "60",
    "X-RateLimit-Limit": "100",
    "X-RateLimit-Remaining": "0"
  },
  "isTerminating": true
}
```

---

## Development Environment Routing

### API Version Routing

Route different API versions to different servers:

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

**Examples:**
- `/api/v1/users` → `https://api-v1.example.com/users`
- `/api/v2/orders` → `https://api-v2.example.com/orders`

### Microservice Routing

Route requests to different microservices:

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

**Examples:**
- `/services/users/profile` → `http://users-service.internal:8080/profile`
- `/services/orders/list` → `http://orders-service.internal:8080/list`

### Environment-based Routing

Route to different environments based on path:

```json
{
  "name": "Environment Router",
  "type": "forwarding",
  "method": "*",
  "pathPattern": "/env/([^/]+)/(.*)",
  "targetUrl": "https://$1.example.com/$2",
  "isTerminating": true
}
```

**Examples:**
- `/env/staging/api/users` → `https://staging.example.com/api/users`
- `/env/testing/api/orders` → `https://testing.example.com/api/orders`

### Local Development Proxy

Forward to local development servers:

```json
{
  "name": "Local Dev Proxy",
  "type": "forwarding",
  "method": "*",
  "pathPattern": "/dev/(.*)",
  "targetUrl": "http://localhost:8080/$1",
  "isTerminating": true
}
```

---

## Authentication & JWT Generation

### Simple JWT Token Generation

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

### OAuth-style JWT Response

```json
{
  "name": "OAuth JWT Response",
  "type": "plugin",
  "pluginType": "jwt",
  "method": "POST",
  "pathPattern": "/auth/login",
  "responseStatus": 201,
  "responseTemplate": "{\"access_token\": \"${jwt}\", \"token_type\": \"Bearer\", \"expires_in\": 3600}",
  "pluginConfig": {
    "secret": "oauth-secret-key",
    "exp": 3600,
    "additionalClaims": {
      "userId": "user-{{randomId}}",
      "scope": "read write",
      "client_id": "my-app"
    }
  },
  "isTerminating": true
}
```

### Zendesk JWT Integration

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

### JWT with Dynamic Claims

```json
{
  "name": "Dynamic JWT Claims",
  "type": "plugin",
  "pluginType": "jwt",
  "method": "POST",
  "pathPattern": "/auth/dynamic-token",
  "responseStatus": 200,
  "responseTemplate": "${jwt}",
  "pluginConfig": {
    "secret": "dynamic-secret",
    "exp": 7200,
    "additionalClaims": {
      "userId": "user-{{randomId}}",
      "sessionId": "{{randomId}}",
      "timestamp": "{{timestamp}}",
      "environment": "{{env.NODE_ENV}}",
      "permissions": ["read", "write", "delete"]
    }
  },
  "isTerminating": true
}
```

---

## Request/Response Transformation

### Add Authentication Headers

```json
{
  "name": "Add Auth Headers",
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

### Add Request Metadata

```json
{
  "name": "Request Metadata",
  "type": "request-modifier",
  "method": "*",
  "pathPattern": "/api/user/*",
  "requestModifications": {
    "headers.X-User-Context": "authenticated",
    "body.audit.modifiedBy": "dev-proxy",
    "body.audit.timestamp": "{{timestamp}}",
    "query.version": "v2"
  },
  "isTerminating": false
}
```

### Response Enhancement

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

### CORS Headers Addition

```json
{
  "name": "Add CORS Headers",
  "type": "response-modifier",
  "method": "*",
  "pathPattern": "/api/*",
  "responseModifications": {
    "headers.Access-Control-Allow-Origin": "*",
    "headers.Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "headers.Access-Control-Allow-Headers": "Content-Type, Authorization"
  },
  "isTerminating": true
}
```

---

## Error Handling & Recovery

### Graceful 404 Handling

```json
{
  "name": "404 Error Recovery",
  "type": "response-modifier",
  "method": "*",
  "pathPattern": "/api/*",
  "responseModifications": {},
  "conditionalRules": [
    {
      "condition": "response.status === 404",
      "modifications": {
        "status": 200,
        "body.error": null,
        "body.message": "Resource not found, returning default data",
        "body.data": {"id": "default", "name": "Default Item"}
      }
    }
  ],
  "isTerminating": true
}
```

### Server Error Handling

```json
{
  "name": "Server Error Handler",
  "type": "response-modifier",
  "method": "*",
  "pathPattern": "/api/*",
  "responseModifications": {
    "headers.X-Error-Recovery": "enabled"
  },
  "conditionalRules": [
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

### Client Error Enhancement

```json
{
  "name": "Client Error Enhancement",
  "type": "response-modifier",
  "method": "*",
  "pathPattern": "/api/*",
  "responseModifications": {},
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

## Caching & Performance

### Cache Static Responses

```json
{
  "name": "Cached User Profile",
  "type": "static",
  "method": "GET",
  "pathPattern": "/users/profile",
  "responseStatus": 200,
  "responseBody": "{\"id\": \"user-123\", \"name\": \"John Doe\", \"email\": \"john@example.com\"}",
  "responseHeaders": {
    "Content-Type": "application/json",
    "Cache-Control": "max-age=3600",
    "ETag": "\"user-123-v1\""
  },
  "isTerminating": true
}
```

### Add Cache Headers

```json
{
  "name": "Add Cache Headers",
  "type": "response-modifier",
  "method": "GET",
  "pathPattern": "/api/static/*",
  "responseModifications": {
    "headers.Cache-Control": "max-age=3600",
    "headers.X-Cache-Added": "dev-proxy"
  },
  "isTerminating": true
}
```

---

## Debugging & Development

### Debug Request Enhancement

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

### Request Logging

```json
{
  "name": "Request Logger",
  "type": "request-modifier",
  "method": "*",
  "pathPattern": "/api/*",
  "requestModifications": {
    "headers.X-Request-Logged": "true",
    "headers.X-Log-Timestamp": "{{timestamp}}",
    "headers.X-Log-Id": "{{randomId}}"
  },
  "isTerminating": false
}
```

### Response Debugging

```json
{
  "name": "Response Debug Info",
  "type": "response-modifier",
  "method": "*",
  "pathPattern": "/api/*",
  "responseModifications": {
    "headers.X-Debug-Response": "true",
    "headers.X-Response-Time": "{{timestamp}}",
    "body.debug.processedAt": "{{timestamp}}",
    "body.debug.proxyVersion": "1.0.0"
  },
  "isTerminating": true
}
```

---

## Rule Chaining Patterns

### Authentication + Forwarding Chain

**Step 1: Add Authentication (Non-terminating)**
```json
{
  "name": "Add Auth Headers",
  "type": "request-modifier",
  "method": "*",
  "pathPattern": "/api/secure/*",
  "requestModifications": {
    "headers.Authorization": "Bearer {{env.API_TOKEN}}",
    "headers.X-User-Id": "{{userId}}"
  },
  "isTerminating": false,
  "order": 1
}
```

**Step 2: Forward to API (Terminating)**
```json
{
  "name": "Forward Secure API",
  "type": "forwarding",
  "method": "*",
  "pathPattern": "/api/secure/*",
  "targetUrl": "https://secure-api.example.com",
  "isTerminating": true,
  "order": 2
}
```

### Request Modification + Response Enhancement Chain

**Step 1: Modify Request (Non-terminating)**
```json
{
  "name": "Add Request Context",
  "type": "request-modifier",
  "method": "*",
  "pathPattern": "/api/enhanced/*",
  "requestModifications": {
    "headers.X-Request-Id": "{{randomId}}",
    "body.metadata.timestamp": "{{timestamp}}"
  },
  "isTerminating": false,
  "order": 1
}
```

**Step 2: Forward Request (Terminating)**
```json
{
  "name": "Forward Enhanced Request",
  "type": "forwarding",
  "method": "*",
  "pathPattern": "/api/enhanced/*",
  "targetUrl": "https://api.example.com",
  "isTerminating": true,
  "order": 2
}
```

**Step 3: Enhance Response (Terminating)**
```json
{
  "name": "Enhance Response",
  "type": "response-modifier",
  "method": "*",
  "pathPattern": "/api/enhanced/*",
  "responseModifications": {
    "headers.X-Enhanced": "true",
    "body.metadata.enhanced": true
  },
  "isTerminating": true,
  "order": 3
}
```

### Fallback Pattern

**Step 1: Try Primary API (Terminating)**
```json
{
  "name": "Primary API",
  "type": "forwarding",
  "method": "*",
  "pathPattern": "/api/data/*",
  "targetUrl": "https://primary-api.example.com",
  "isTerminating": true,
  "order": 1
}
```

**Step 2: Fallback to Mock (Terminating)**
```json
{
  "name": "Fallback Mock Data",
  "type": "static",
  "method": "*",
  "pathPattern": "/api/data/*",
  "responseStatus": 200,
  "responseBody": "{\"data\": \"fallback\", \"source\": \"mock\"}",
  "isTerminating": true,
  "order": 2
}
```

### Multi-stage Processing

**Step 1: Authentication Check (Non-terminating)**
```json
{
  "name": "Auth Check",
  "type": "request-modifier",
  "method": "*",
  "pathPattern": "/api/protected/*",
  "requestModifications": {
    "headers.X-Auth-Checked": "true"
  },
  "isTerminating": false,
  "order": 1
}
```

**Step 2: Rate Limiting (Non-terminating)**
```json
{
  "name": "Rate Limit Check",
  "type": "request-modifier",
  "method": "*",
  "pathPattern": "/api/protected/*",
  "requestModifications": {
    "headers.X-Rate-Limited": "false"
  },
  "isTerminating": false,
  "order": 2
}
```

**Step 3: Forward Request (Terminating)**
```json
{
  "name": "Forward Protected Request",
  "type": "forwarding",
  "method": "*",
  "pathPattern": "/api/protected/*",
  "targetUrl": "https://protected-api.example.com",
  "isTerminating": true,
  "order": 3
}
```

**Step 4: Add Security Headers (Terminating)**
```json
{
  "name": "Add Security Headers",
  "type": "response-modifier",
  "method": "*",
  "pathPattern": "/api/protected/*",
  "responseModifications": {
    "headers.X-Content-Type-Options": "nosniff",
    "headers.X-Frame-Options": "DENY",
    "headers.X-XSS-Protection": "1; mode=block"
  },
  "isTerminating": true,
  "order": 4
}
``` 