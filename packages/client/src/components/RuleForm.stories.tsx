import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { RuleForm, type RuleFormData } from "./RuleForm";
import type { JwtPluginConfig } from "@/types/proxy";

const meta: Meta<typeof RuleForm> = {
  title: "Components/RuleForm",
  component: RuleForm,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A modal form for creating and editing proxy rules. Supports various rule types including static responses, forwarding, JWT generation, request modification, response modification, and plugin-based rules.",
      },
    },
  },
  args: {
    isOpen: true,
    onClose: action("close"),
    onSubmit: async (formData: RuleFormData, jwtConfig?: JwtPluginConfig) => {
      action("submit")(formData, jwtConfig);
    },
  },
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Controls whether the modal is open",
    },
    editMode: {
      control: "boolean",
      description: "Whether the form is in edit mode",
    },
    title: {
      control: "text",
      description: "Custom title for the modal",
    },
  },
};

export default meta;
type Story = StoryObj<typeof RuleForm>;

// Default/Empty Form
export const Default: Story = {
  args: {},
};

// Closed Modal (for documentation)
export const ClosedModal: Story = {
  args: {
    isOpen: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modal is closed - this shows how the component behaves when not visible.",
      },
    },
  },
};

// Static Response Rule
export const StaticResponse: Story = {
  args: {
    title: "Static Response Rule",
    initialData: {
      name: "API Health Check",
      type: "static",
      method: "GET",
      pathPattern: "/health",
      responseStatus: 200,
      responseBody: JSON.stringify(
        {
          status: "healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        },
        null,
        2
      ),
      description: "Returns a static health check response",
      isTerminating: true,
    },
  },
};

// Forwarding Rule
export const ForwardingRule: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Forwarding rules pass requests to upstream servers and return the upstream response as-is. No response status configuration is needed as it passes through from the upstream server.",
      },
    },
  },
  args: {
    title: "Request Forwarding Rule",
    initialData: {
      name: "Forward API Requests",
      type: "forwarding",
      method: "*",
      pathPattern: "/api/(.*)",
      targetUrl: "https://api.example.com/$1",
      description:
        "Forward all API requests to the production server (response status passed through)",
      isTerminating: true,
    },
  },
};

// JWT Generation Plugin
export const JWTPlugin: Story = {
  args: {
    title: "JWT Token Generator",
    initialData: {
      name: "Zendesk JWT Token",
      type: "plugin",
      pluginType: "jwt",
      method: "GET",
      pathPattern: "/auth/zendesk/token",
      responseStatus: 200,
      responseTemplate: '{"token": "${jwt}"}',
      description: "Generates JWT tokens for Zendesk authentication",
      isTerminating: true,
    },
  },
};

// Request Modifier Rule
export const RequestModifier: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Request modifier rules modify requests before passing them to other rules. They are typically non-terminating to allow the modified request to be processed by subsequent rules.",
      },
    },
  },
  args: {
    title: "Request Modification Rule",
    initialData: {
      name: "Add Authentication Headers",
      type: "request-modifier",
      method: "*",
      pathPattern: "/api/*",
      requestModifications: {
        "headers.Authorization": "Bearer {{env.API_TOKEN}}",
        "headers.X-User-Id": "{{userId}}",
        "headers.X-Request-Id": "{{randomId}}",
        "query.version": "v2",
        "body.metadata.timestamp": "{{timestamp}}",
      },
      description:
        "Adds authentication and metadata to API requests before forwarding",
      isTerminating: false, // Non-terminating to allow further processing
    },
  },
};

// Response Modifier Rule
export const ResponseModifier: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Response modifier rules can augment responses from various sources (cached rules, upstream servers, static responses) with additional metadata and conditional transformations.",
      },
    },
  },
  args: {
    title: "Response Modification Rule",
    initialData: {
      name: "Enhance API Responses",
      type: "response-modifier",
      method: "*",
      pathPattern: "/api/*",
      responseModifications: {
        "headers.X-Proxy-Modified": "true",
        "headers.X-Timestamp": "{{timestamp}}",
        "body.metadata.processedBy": "dev-proxy",
        "body.metadata.version": "1.0",
      },
      conditionalRules: [
        {
          condition: "response.status === 404",
          modifications: {
            status: 200,
            "body.error": null,
            "body.message": "Resource not found, returning default data",
            "body.data": { id: "default", name: "Default Item" },
          },
        },
        {
          condition: "response.body.error && response.status >= 500",
          modifications: {
            status: 200,
            "body.error": null,
            "body.message": "Server error handled gracefully",
            "headers.X-Error-Handled": "true",
          },
        },
      ],
      description:
        "Enhances responses with metadata and handles errors gracefully",
      isTerminating: true,
    },
  },
};

// Domain Forwarding Rule (replaces old DomainRule)
export const DomainForwarding: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Domain-based forwarding using capture groups to extract domain and path components. Demonstrates advanced path pattern matching.",
      },
    },
  },
  args: {
    title: "Domain-based Forwarding Rule",
    initialData: {
      name: "Local Domain Forwarding",
      type: "forwarding",
      method: "*",
      pathPattern: "/([a-zA-Z0-9-]+\\.local)(.*)",
      targetUrl: "http://$1$2",
      description:
        "Forwards .local domains to actual local servers (preserves upstream response)",
      isTerminating: true,
    },
  },
};

// API Version Forwarding
export const APIVersionForwarding: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Forwards different API versions to different upstream servers. Shows how to use capture groups for version routing.",
      },
    },
  },
  args: {
    title: "API Version Forwarding",
    initialData: {
      name: "Route API Versions",
      type: "forwarding",
      method: "*",
      pathPattern: "/api/(v[0-9]+)/(.*)",
      targetUrl: "https://api-$1.example.com/$2",
      description:
        "Routes /api/v1/* to api-v1.example.com and /api/v2/* to api-v2.example.com",
      isTerminating: true,
    },
  },
};

// Microservice Forwarding
export const MicroserviceForwarding: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Forwards requests to different microservices based on the service name in the path. Demonstrates service-based routing.",
      },
    },
  },
  args: {
    title: "Microservice Forwarding",
    initialData: {
      name: "Microservice Router",
      type: "forwarding",
      method: "*",
      pathPattern: "/services/([^/]+)/(.*)",
      targetUrl: "http://$1-service.internal:8080/$2",
      description:
        "Routes /services/users/* to users-service.internal:8080/* etc.",
      isTerminating: true,
    },
  },
};

// Development Environment Forwarding
export const DevEnvironmentForwarding: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Forwards requests to different development environments. Useful for testing against different backend versions.",
      },
    },
  },
  args: {
    title: "Development Environment Forwarding",
    initialData: {
      name: "Dev Environment Router",
      type: "forwarding",
      method: "*",
      pathPattern: "/dev/([^/]+)/(.*)",
      targetUrl: "https://$1.dev.example.com/$2",
      description:
        "Routes /dev/staging/* to staging.dev.example.com/* and /dev/testing/* to testing.dev.example.com/*",
      isTerminating: true,
    },
  },
};

// Simple Proxy Forwarding (showcases ForwardingRuleForm behavior panel)
export const SimpleProxyForwarding: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A simple proxy forwarding example that showcases the ForwardingRuleForm's behavior information panel and demonstrates how upstream responses are passed through unchanged.",
      },
    },
  },
  args: {
    title: "Simple Proxy Forwarding",
    initialData: {
      name: "Proxy to Production API",
      type: "forwarding",
      method: "GET",
      pathPattern: "/api/health",
      targetUrl: "https://api.production.com/health",
      description:
        "Simple proxy that forwards health checks to production (status, headers, and body passed through)",
      isTerminating: true,
    },
  },
};

// Cache Rule (Static with specific response from logs)
export const CacheRule: Story = {
  args: {
    title: "Cache Response Rule",
    initialData: {
      name: "Cache: GET /users/profile",
      type: "static",
      method: "GET",
      pathPattern: "/users/profile",
      responseStatus: 200,
      responseBody: JSON.stringify(
        {
          id: "user-123",
          name: "John Doe",
          email: "john@example.com",
          avatar: "https://example.com/avatar.jpg",
        },
        null,
        2
      ),
      responseHeaders: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=3600",
      },
      description: "Cached response from live request",
      isTerminating: true,
    },
  },
};

// Mock/Test Data Rule
export const MockDataRule: Story = {
  args: {
    title: "Mock Data Generator",
    initialData: {
      name: "Mock User List",
      type: "static",
      method: "GET",
      pathPattern: "/api/users",
      responseStatus: 200,
      responseBody: JSON.stringify(
        {
          users: [
            { id: 1, name: "Alice Johnson", role: "admin" },
            { id: 2, name: "Bob Smith", role: "user" },
            { id: 3, name: "Carol Wilson", role: "moderator" },
          ],
          total: 3,
          page: 1,
        },
        null,
        2
      ),
      description: "Returns mock user data for testing",
      isTerminating: true,
    },
  },
};

// Error Response Rule
export const ErrorResponse: Story = {
  args: {
    title: "Error Response Rule",
    initialData: {
      name: "Simulate Server Error",
      type: "static",
      method: "*",
      pathPattern: "/api/error",
      responseStatus: 500,
      responseBody: JSON.stringify(
        {
          error: "Internal Server Error",
          message: "Something went wrong on our end",
          code: "ERR_INTERNAL",
        },
        null,
        2
      ),
      description: "Simulates server errors for testing",
      isTerminating: true,
    },
  },
};

// Wildcard Rule (from path click)
export const WildcardRule: Story = {
  args: {
    title: "Wildcard Path Rule",
    initialData: {
      name: "Wildcard rule for /dashboard/*",
      type: "static",
      method: "*",
      pathPattern: "/dashboard/*",
      responseStatus: 200,
      responseBody: "",
      description: "Wildcard rule created from path",
      isTerminating: true,
    },
  },
};

// Edit Mode
export const EditMode: Story = {
  args: {
    editMode: true,
    title: "Edit Existing Rule",
    initialData: {
      name: "Updated API Endpoint",
      type: "forwarding",
      method: "POST",
      pathPattern: "/api/v2/data",
      targetUrl: "https://api-v2.example.com/data",
      description:
        "Updated forwarding rule for v2 API (passes through upstream response)",
      isTerminating: true,
    },
  },
};

// Complex JWT Configuration
export const ComplexJWT: Story = {
  args: {
    title: "Advanced JWT Configuration",
    initialData: {
      name: "Advanced JWT with Custom Claims",
      type: "plugin",
      pluginType: "jwt",
      method: "POST",
      pathPattern: "/auth/custom-token",
      responseStatus: 201,
      responseTemplate: JSON.stringify(
        {
          access_token: "${jwt}",
          token_type: "Bearer",
          expires_in: 3600,
        },
        null,
        2
      ),
      description: "Advanced JWT token with custom claims and response format",
      isTerminating: true,
    },
  },
};

// Multiple Methods Rule
export const MultipleMethodsRule: Story = {
  args: {
    title: "Multiple HTTP Methods",
    initialData: {
      name: "CRUD Operations Mock",
      type: "static",
      method: "*",
      pathPattern: "/api/items/*",
      responseStatus: 200,
      responseBody: JSON.stringify(
        {
          message: "Operation successful",
          data: { id: 123, name: "Test Item" },
        },
        null,
        2
      ),
      description: "Handles all CRUD operations for items endpoint",
      isTerminating: true,
    },
  },
};

// Chained Request Modifier (Non-terminating)
export const ChainedRequestModifier: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "This demonstrates a non-terminating request modifier that can be chained with other rules. Multiple request modifiers can be used in sequence to build up request context.",
      },
    },
  },
  args: {
    title: "Chained Request Modifier",
    initialData: {
      name: "Add User Context",
      type: "request-modifier",
      method: "*",
      pathPattern: "/api/user/*",
      requestModifications: {
        "headers.X-User-Context": "authenticated",
        "headers.X-Session-Id": "{{randomId}}",
        "body.audit.modifiedBy": "dev-proxy",
        "body.audit.timestamp": "{{timestamp}}",
      },
      description:
        "Adds user context to requests (non-terminating for chaining with other rules)",
      isTerminating: false,
    },
  },
};

// Error Recovery Response Modifier
export const ErrorRecoveryModifier: Story = {
  args: {
    title: "Error Recovery Response Modifier",
    initialData: {
      name: "Graceful Error Handling",
      type: "response-modifier",
      method: "*",
      pathPattern: "/api/*",
      responseModifications: {
        "headers.X-Error-Recovery": "enabled",
      },
      conditionalRules: [
        {
          condition: "response.status >= 400 && response.status < 500",
          modifications: {
            "body.error.recoverable": true,
            "body.error.suggestion": "Please check your request parameters",
            "headers.X-Error-Type": "client-error",
          },
        },
        {
          condition: "response.status >= 500",
          modifications: {
            status: 503,
            "body.error.message": "Service temporarily unavailable",
            "body.error.retryAfter": 30,
            "headers.Retry-After": "30",
          },
        },
      ],
      description:
        "Provides graceful error recovery and user-friendly error messages",
      isTerminating: true,
    },
  },
};
