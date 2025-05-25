# Dev-Proxy Dashboard Design System

## Overview

The Dev-Proxy Dashboard uses a modern, dark-themed design system built on **shadcn/ui** components with **Tailwind CSS**. The system emphasizes clarity, accessibility, and **vertical information density** through compact form layouts and single-line elements for optimal developer productivity.

## Design Principles

### Core Philosophy
- **Developer-First**: Optimized for technical users managing proxy rules and request logs
- **Vertical Efficiency**: Maximize information density through compact, single-line form elements
- **Dark Theme**: Reduces eye strain during extended development sessions
- **Information Density**: Efficiently displays complex technical data in minimal vertical space
- **Accessibility**: WCAG-compliant with proper contrast ratios and keyboard navigation

### New Layout Patterns (2024)
- **Single-line form elements** for simple string/numeric values
- **Compact placement** for form elements to fit more information vertically
- **Horizontal grouping** of related fields to reduce vertical space
- **Minimal spacing** between form sections while maintaining readability

### Technology Stack
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS with CSS Variables
- **Component Library**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Base Color**: Zinc
- **Animation**: tailwindcss-animate

## Color System

### Semantic Color Tokens
```css
/* CSS Variables (Dark Theme) */
--background: 240 10% 3.9%;        /* #0f172a - Main background */
--foreground: 0 0% 98%;             /* #fafafa - Primary text */
--card: 240 10% 3.9%;               /* #0f172a - Card backgrounds */
--muted: 240 3.7% 15.9%;            /* #1e293b - Muted backgrounds */
--muted-foreground: 240 5% 64.9%;   /* #64748b - Secondary text */
--border: 240 3.7% 15.9%;           /* #1e293b - Borders */
--input: 240 3.7% 15.9%;            /* #1e293b - Input backgrounds */
--primary: 0 0% 98%;                /* #fafafa - Primary actions */
--destructive: 0 62.8% 30.6%;       /* #dc2626 - Error/delete actions */
```

### Application-Specific Colors
```css
/* Gray Scale (Primary UI) */
bg-gray-900: #111827    /* Main app background */
bg-gray-800: #1f2937    /* Card/panel backgrounds */
bg-gray-700: #374151    /* Hover states, borders */
bg-gray-600: #4b5563    /* Disabled states */
text-gray-400: #9ca3af  /* Secondary text */
text-gray-300: #d1d5db  /* Tertiary text */

/* Status Colors */
text-green-400: #4ade80   /* Success states */
text-blue-400: #60a5fa    /* Info/links */
text-yellow-400: #facc15  /* Warning states */
text-red-400: #f87171     /* Error states */
text-purple-400: #c084fc  /* Plugin/special features */
text-orange-400: #fb923c  /* Non-terminating rules */
```

### HTTP Method Colors
```css
GET:     bg-emerald-500/20 text-emerald-400
POST:    bg-amber-500/20 text-amber-400
PUT:     bg-orange-500/20 text-orange-400
PATCH:   bg-yellow-500/20 text-yellow-400
DELETE:  bg-red-500/20 text-red-400
OPTIONS: bg-blue-500/20 text-blue-400
HEAD:    bg-blue-500/20 text-blue-400
```

### Status Code Colors
```css
2xx: bg-green-500/20 text-green-400    /* Success */
4xx: bg-yellow-500/20 text-yellow-400  /* Client Error */
5xx: bg-red-500/20 text-red-400        /* Server Error */
```

## Typography

### Font Family
- **Primary**: Inter (via Google Fonts)
- **Monospace**: System monospace for code/technical content

### Type Scale (Compact)
```css
text-2xs:  0.625rem (10px)  /* Micro text, compact badges */
text-xs:   0.75rem  (12px)  /* Helper text, compact labels */
text-sm:   0.875rem (14px)  /* Form labels, secondary text */
text-base: 1rem     (16px)  /* Body text */
text-lg:   1.125rem (18px)  /* Section headers */
text-xl:   1.25rem  (20px)  /* Page headers */
```

### Font Weights
```css
font-normal:  400  /* Body text */
font-medium:  500  /* Form labels, emphasis */
font-semibold: 600 /* Section headers */
```

## Spacing System (Compact)

### Reduced Spacing Scale
```css
space-1:  0.25rem  (4px)   /* Tight spacing */
space-2:  0.5rem   (8px)   /* Compact spacing */
space-3:  0.75rem  (12px)  /* Standard spacing */
space-4:  1rem     (16px)  /* Generous spacing */
space-6:  1.5rem   (24px)  /* Section spacing */
```

### Form Spacing Patterns (New)
```css
/* Compact Form Elements */
mb-1:     4px   /* Label to input (compact) */
mb-2:     8px   /* Standard label to input */
space-y-2: 8px  /* Between form fields (compact) */
space-y-3: 12px /* Between form sections */
space-y-4: 16px /* Between major sections */

/* Horizontal Grouping */
gap-2:    8px   /* Between grouped inputs */
gap-3:    12px  /* Between form sections */
gap-4:    16px  /* Between major groups */
```

## Form System (Updated)

### Single-Line Form Elements

#### Text Inputs (Compact)
```tsx
// Standard single-line input
<div>
  <label className="block text-sm text-gray-400 mb-1">
    Field Name
  </label>
  <input
    type="text"
    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 
               focus:outline-none focus:border-blue-500 h-9"
    placeholder="Value"
  />
</div>
```

#### Number Inputs (Compact)
```tsx
// Numeric input with reduced height
<div>
  <label className="block text-sm text-gray-400 mb-1">
    Response Status
  </label>
  <input
    type="number"
    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 h-9"
    value={200}
  />
</div>
```

#### Select Dropdowns (Compact)
```tsx
// Single-line select with consistent height
<div>
  <label className="block text-sm text-gray-400 mb-1">
    HTTP Method
  </label>
  <select className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 h-9">
    <option value="GET">GET</option>
    <option value="POST">POST</option>
  </select>
</div>
```

### Horizontal Form Grouping

#### Two-Column Layout
```tsx
// Compact horizontal grouping
<div className="grid grid-cols-2 gap-3">
  <div>
    <label className="block text-sm text-gray-400 mb-1">HTTP Method</label>
    <select className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 h-9">
      <option value="GET">GET</option>
    </select>
  </div>
  <div>
    <label className="block text-sm text-gray-400 mb-1">Path Pattern</label>
    <input 
      type="text" 
      className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 h-9"
      placeholder="/api/*" 
    />
  </div>
</div>
```

#### Three-Column Layout (Ultra Compact)
```tsx
// For related short fields
<div className="grid grid-cols-3 gap-2">
  <div>
    <label className="block text-xs text-gray-400 mb-1">Status</label>
    <input type="number" className="w-full px-2 py-1 bg-gray-800 text-white rounded border border-gray-700 h-8 text-sm" />
  </div>
  <div>
    <label className="block text-xs text-gray-400 mb-1">Method</label>
    <select className="w-full px-2 py-1 bg-gray-800 text-white rounded border border-gray-700 h-8 text-sm">
      <option>GET</option>
    </select>
  </div>
  <div>
    <label className="block text-xs text-gray-400 mb-1">Type</label>
    <select className="w-full px-2 py-1 bg-gray-800 text-white rounded border border-gray-700 h-8 text-sm">
      <option>Static</option>
    </select>
  </div>
</div>
```

### Multi-Line Elements (When Necessary)

#### Textarea (Reserved for Complex Content)
```tsx
// Only for JSON, code, or long descriptions
<div>
  <label className="block text-sm text-gray-400 mb-1">
    Response Body (JSON)
  </label>
  <textarea
    className="w-full px-3 py-2 h-24 bg-gray-800 text-white rounded border border-gray-700 font-mono text-sm"
    placeholder='{"key": "value"}'
  />
  <p className="text-xs text-gray-500 mt-1">JSON format required</p>
</div>
```

### Form Section Layout (Compact)

#### Compact Section Headers
```tsx
<div className="space-y-3">
  <h3 className="text-lg text-white border-b border-gray-700 pb-1">
    Configuration
  </h3>
  
  {/* Compact form fields */}
  <div className="space-y-2">
    {/* Single-line inputs */}
  </div>
</div>
```

#### Inline Field Groups
```tsx
// Group related fields horizontally
<div className="flex items-end gap-3">
  <div className="flex-1">
    <label className="block text-sm text-gray-400 mb-1">Target URL</label>
    <input className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 h-9" />
  </div>
  <button className="h-9 px-3 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm">
    Test
  </button>
</div>
```

## Component System

### Buttons (Compact Variants)

#### Size Variants
```tsx
<Button size="xs">Micro</Button>      // h-7 px-2 text-xs (new)
<Button size="sm">Small</Button>      // h-8 px-3 text-xs
<Button size="default">Default</Button> // h-9 px-4 py-2
<Button size="icon-sm">Icon</Button>  // h-7 w-7 (new)
```

#### Inline Action Buttons
```tsx
// Compact buttons for inline actions
<button className="h-8 px-2 bg-green-600 text-white rounded hover:bg-green-500 text-xs">
  Add
</button>
```

### Status Badges (Compact)

#### Micro Badges
```tsx
// Ultra-compact status indicators
<span className="text-2xs bg-green-900 text-green-200 px-1.5 py-0.5 rounded">
  Active
</span>

<span className="text-2xs bg-orange-900 text-orange-200 px-1.5 py-0.5 rounded">
  Non-term
</span>
```

### Information Panels (Compact)

#### Condensed Info Panels
```tsx
// Reduced padding for compact display
<div className="bg-blue-900/20 border border-blue-700 rounded p-2">
  <h4 className="text-blue-300 font-medium mb-1 text-sm">Info</h4>
  <ul className="text-2xs text-blue-200 space-y-0.5">
    <li>• Compact information point</li>
    <li>• Another brief detail</li>
  </ul>
</div>
```

## Layout Patterns (Updated)

### Compact Modal Structure
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto">
    {/* Reduced padding for more content */}
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <h2 className="text-xl text-white">Modal Title</h2>
      <button className="text-gray-400 hover:text-white">×</button>
    </div>
    
    <form className="p-4 space-y-3">
      {/* Compact form content */}
    </form>
  </div>
</div>
```

### Compact Card Layout
```tsx
<div className="bg-gray-800 rounded-lg p-3">
  {/* Reduced padding for density */}
</div>
```

### Dense List Items
```tsx
<div className="p-2 hover:bg-gray-700 rounded">
  {/* Compact list item content */}
</div>
```

## Form Validation (Compact)

### Inline Error Messages
```tsx
// Compact error display
<input className="border-red-500 h-9" />
<p className="text-red-500 text-2xs mt-0.5">Error message</p>
```

### Success States
```tsx
// Compact success indicator
<input className="border-green-500 h-9" />
<p className="text-green-500 text-2xs mt-0.5">✓ Valid</p>
```

## Responsive Behavior

### Mobile Adaptations
```tsx
// Stack horizontal groups on mobile
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  {/* Form fields */}
</div>

// Reduce padding on small screens
<div className="p-2 md:p-4">
  {/* Content */}
</div>
```

## Usage Guidelines

### Do's
- Use single-line inputs for simple string/numeric values
- Group related fields horizontally when space allows
- Minimize vertical spacing between form elements
- Use compact labels and micro text for secondary information
- Maintain consistent heights for form elements (h-8, h-9)
- Reserve textareas only for complex content (JSON, code, descriptions)

### Don'ts
- Don't use textareas for simple string inputs
- Don't add excessive vertical spacing between fields
- Don't break horizontal groupings unnecessarily
- Don't use large padding in compact layouts
- Don't sacrifice readability for extreme compactness
- Don't ignore mobile responsive behavior

### When to Use Multi-Line Elements
- **JSON configuration**: Complex object structures
- **Code templates**: Multi-line code or templates
- **Long descriptions**: Detailed explanations (optional fields)
- **Lists/Arrays**: When displaying multiple items

### Compact Layout Checklist
- [ ] Single-line inputs for simple values
- [ ] Horizontal grouping of related fields
- [ ] Consistent form element heights
- [ ] Minimal vertical spacing (space-y-2, space-y-3)
- [ ] Compact labels (text-sm, mb-1)
- [ ] Micro text for helpers (text-2xs, text-xs)
- [ ] Reduced padding in containers

## Accessibility (Compact)

### Maintaining Accessibility in Dense Layouts
- Ensure minimum 44px touch targets on mobile
- Maintain sufficient color contrast ratios
- Provide clear focus indicators
- Use proper label associations
- Include helpful placeholder text
- Maintain logical tab order

### Keyboard Navigation
- All form elements remain keyboard accessible
- Focus indicators are clearly visible despite compact sizing
- Tab order follows logical flow through grouped elements

---

*This design system prioritizes vertical information density while maintaining usability and accessibility. The compact patterns allow developers to see more configuration options at once, improving productivity in complex proxy rule management scenarios.* 