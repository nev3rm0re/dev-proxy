import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Rules } from "./Rules";

const meta: Meta<typeof Rules> = {
  title: "Components/Rules",
  component: Rules,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A draggable list of proxy rules with various types including static responses, forwarding, and plugins. 

**Features:**
- Drag & drop reordering
- Inline editing with modal form  
- Rule activation/deactivation
- Terminating vs non-terminating rules
- Rule completeness validation

**Display Improvements:**
- Shows target URLs for forwarding rules: \`* → https://platform.server.eu\`
- Readable domain patterns: \`<domain.name>/* → https://domain.name/*\`
- Only shows "Non-terminating" when rules allow chaining

**Storybook Behavior:**
This component makes real API calls to \`/api/rules\`. In Storybook, you'll see "Failed to fetch rules" error since no server is running. This is expected behavior.

**To see the working component:**
1. Run \`yarn dev\` to start the development servers
2. Visit \`http://localhost:3000/rules\` to see the full functionality

**Example Rule Data Structure:**
\`\`\`json
{
  "id": "1",
  "name": "Health Check",
  "type": "static",
  "method": "GET", 
  "pathPattern": "/health",
  "responseStatus": 200,
  "responseBody": "{\\"status\\": \\"ok\\"}",
  "isActive": true,
  "isTerminating": true,
  "order": 0,
  "description": "Simple health check endpoint"
}
\`\`\`
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-900 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Rules>;

// Default story - will show error state in Storybook
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Default Rules component. Shows "Failed to fetch rules" error in Storybook since there's no running server.

**Expected Display Format Examples:**

**Forwarding Rules:**
- Simple: \`GET /api/* → https://api.example.com\`
- Domain: \`<domain.name>/* → https://domain.name/*\`
- With capture groups: \`/([a-zA-Z0-9.-]+)(.*) → https://$1$2\`

**Static Rules:**
- \`GET /health → Static Response (200)\`

**Plugin Rules:**
- \`GET /auth/token → JWT Plugin\`

**State Indicators:**
- 🟢 Active and complete (default blue/green styling)
- 🔴 Inactive (grayed out with inactive icon)
- ⚠️ Incomplete (yellow badge, missing configuration)
- 🔗 Non-terminating (orange badge, allows rule chaining)
        `,
      },
    },
  },
};

// Documentation of interactions
export const Interactions: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Interactive Features (available in the live app):**

**Drag & Drop Reordering:**
- Grab the grip handle (⋮⋮) on the left of each rule
- Drag to reorder rules - execution order matters!
- Changes are automatically saved to the server

**Rule Management:**
- **Toggle Active**: Click the play/stop icon to activate/deactivate rules
- **Edit**: Click the edit icon to open the modal form with all rule settings
- **Delete**: Click the trash icon to delete (shows confirmation dialog)

**Visual Feedback:**
- Hover effects on all interactive elements
- Loading states during API operations
- Error handling with user-friendly messages

**Responsive Design:**
- Works on desktop and mobile devices
- Touch-friendly drag & drop on mobile
        `,
      },
    },
  },
};

// Architecture documentation
export const Architecture: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Technical Architecture:**

**Rule Types:**
- **Static Response**: Returns predefined response body and status
- **Forwarding**: Proxies requests to external URLs with pattern matching
- **JWT Plugin**: Generates JWT tokens with configurable claims
- **Request Modifier**: Modifies incoming requests (typically non-terminating)
- **Response Modifier**: Modifies responses from other rules

**Display Logic:**
The \`formatRuleDisplay()\` function handles different rule presentations:
- Detects domain patterns in path patterns
- Formats capture groups (\`$1\`, \`$2\`) as readable text
- Shows method + pattern → target format

**Store Integration:**
- Uses Zustand store (\`useRulesStore\`) for state management
- Real-time updates via REST API calls to \`/api/rules\`
- Optimistic updates for better UX during drag & drop
- Error handling and loading states

**Form Integration:**
- Modal-based rule editing with \`RuleForm\` component
- Validates rule completeness before saving
- Supports all rule types with type-specific forms
- Auto-focus and keyboard navigation support

**Server Integration:**
- Rules are persisted in \`rulesDB.json\`
- Rule execution order follows the displayed order
- Terminating rules stop the chain, non-terminating allow fallthrough
        `,
      },
    },
  },
};

// Mock data examples for documentation
export const MockDataExamples: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Example Rule Configurations:**

**1. Health Check (Static Response):**
\`\`\`json
{
  "name": "Health Check",
  "type": "static",
  "method": "GET",
  "pathPattern": "/health",
  "responseStatus": 200,
  "responseBody": "{\\"status\\": \\"ok\\", \\"timestamp\\": \\"2024-01-01T00:00:00Z\\"}",
  "isActive": true,
  "isTerminating": true
}
\`\`\`

**2. API Forwarding:**
\`\`\`json
{
  "name": "API Forwarding", 
  "type": "forwarding",
  "method": "*",
  "pathPattern": "/api/*",
  "targetUrl": "https://api.example.com",
  "isActive": true,
  "isTerminating": true
}
\`\`\`

**3. JWT Token Generator:**
\`\`\`json
{
  "name": "JWT Token Generator",
  "type": "plugin",
  "pluginType": "jwt",
  "method": "GET", 
  "pathPattern": "/auth/token",
  "responseStatus": 200,
  "responseTemplate": "\${jwt}",
  "pluginConfig": {
    "secret": "your-secret-key",
    "exp": 3600,
    "additionalClaims": {
      "userId": "12345",
      "role": "admin"
    }
  },
  "isActive": true,
  "isTerminating": true
}
\`\`\`

**4. Domain Routing:**
\`\`\`json
{
  "name": "Domain Routing",
  "type": "forwarding",
  "method": "*",
  "pathPattern": "/([a-zA-Z0-9.-]+)(.*)",
  "targetUrl": "https://$1$2",
  "isActive": true,
  "isTerminating": true
}
\`\`\`

**5. Non-terminating Request Modifier:**
\`\`\`json
{
  "name": "Add Auth Header",
  "type": "request-modifier", 
  "method": "*",
  "pathPattern": "/api/*",
  "requestModifications": {
    "headers.Authorization": "Bearer {{env.API_TOKEN}}"
  },
  "isActive": true,
  "isTerminating": false
}
\`\`\`
        `,
      },
    },
  },
};
