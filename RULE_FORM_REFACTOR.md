# Rule Form Component Refactor & Storybook Integration

## Overview
Successfully extracted the rule creation/edit form from the Rules component into a dedicated modal-based RuleForm component with comprehensive Storybook stories.

## Key Changes

### 1. New RuleForm Component (`packages/client/src/components/RuleForm.tsx`)
- **Modal-based**: Form now appears as an overlay modal instead of inline
- **Reusable**: Can be used throughout the application for rule creation/editing
- **Type-safe**: Full TypeScript support with proper interfaces
- **Comprehensive**: Supports all rule types including the new "request-modifier" type

#### Supported Rule Types:
1. **Static Response**: Returns predefined static content
2. **Request Forwarding**: Forwards requests to target URLs
3. **Domain Rules**: Pattern-based domain matching
4. **JWT Plugin**: Generates JWT tokens with custom claims
5. **Request Modifier**: Modifies outgoing requests while returning actual responses

#### Form Sections:
- **Basic Information**: Rule name and type selection
- **Request Matching**: HTTP method and path pattern (common to all rules)
- **Response Configuration**: Status codes and response handling
- **Type-specific Configuration**: Dynamic fields based on rule type
- **Advanced Options**: Terminating behavior and descriptions

### 2. Comprehensive Storybook Stories (`packages/client/src/components/RuleForm.stories.tsx`)
Created 13 different story variants showcasing all use cases:

#### Core Rule Types:
- **Default**: Empty form for new rule creation
- **Static Response**: API health check example
- **Forwarding Rule**: API request forwarding
- **JWT Plugin**: Zendesk token generation
- **Request Modifier**: Account ID modification
- **Domain Rule**: Local domain redirects

#### Specific Use Cases:
- **Cache Rule**: Cached responses from live requests
- **Mock Data Rule**: Test data generation
- **Error Response**: Server error simulation
- **Wildcard Rule**: Path-based wildcard rules
- **Complex JWT**: Advanced JWT configuration
- **Multiple Methods**: CRUD operations handling
- **Edit Mode**: Existing rule modification

### 3. Updated Rules Component Integration
- **Modal Integration**: Rules component now uses the RuleForm modal
- **State Management**: Proper handling of form data and edit states
- **Navigation Support**: Maintains compatibility with navigation from request logs
- **Drag & Drop**: Preserved existing rule reordering functionality

### 4. Enhanced Type System
```typescript
export interface RuleFormData {
  name: string;
  type: RuleType;
  method: string | string[];
  pathPattern: string;
  pattern?: string; // For domain rules
  responseStatus?: number;
  responseBody?: string;
  responseTemplate?: string;
  pluginType?: string;
  targetUrl?: string;
  responseHeaders?: Record<string, string>;
  requestModifications?: Record<string, unknown>; // For request modifier rules
  isActive: boolean;
  isTerminating: boolean;
  order: number;
  description?: string;
}
```

## New Rule Type: Request Modifier

Added support for request modification rules that:
- Modify outgoing requests (headers, body, parameters)
- Return actual server responses after modification
- Support dot notation for nested property modification
- Enable testing with modified account IDs, auth tokens, etc.

Example use case:
```json
{
  "account.id": "test-account-123",
  "headers.Authorization": "Bearer test-token",
  "headers.X-User-Role": "admin"
}
```

## Technical Benefits

1. **Maintainability**: Separated concerns with dedicated form component
2. **Testability**: Storybook stories serve as visual tests and documentation
3. **Reusability**: Form can be used in multiple contexts
4. **User Experience**: Modal interface is more intuitive and less cluttered
5. **Developer Experience**: Clear component APIs and TypeScript support

## Storybook Integration

Storybook is now configured and running with:
- All rule type variants represented
- Interactive controls for testing different configurations
- Visual documentation of component states
- Easy testing of form validation and submission flows

## Usage

### Starting Storybook
```bash
cd packages/client
yarn storybook
```

### Using RuleForm Component
```typescript
<RuleForm
  isOpen={showForm}
  onClose={handleCloseForm}
  onSubmit={handleFormSubmit}
  initialData={formData}
  editMode={isEditing}
  title="Create New Rule"
/>
```

## Migration Notes

- All existing functionality preserved
- Form state properly managed with React hooks
- Navigation from request logs continues to work
- Drag-and-drop rule reordering maintained
- Rule highlighting and auto-form population functional

## Future Enhancements

The new architecture enables:
- Easy addition of new rule types
- Component testing with Storybook
- Form field validation improvements
- Better accessibility support
- Mobile-responsive design improvements 