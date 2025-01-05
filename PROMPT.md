
# Dev-Proxy Project Context

## Project Overview
- Purpose: Development proxy server for REST API requests with real-time monitoring
- Main features: Request proxying, WebSocket-based monitoring, response modification/locking
- Monorepo (Turborepo) with server and client packages
- Tech stack: Node.js, TypeScript, React, Tailwind CSS, shadcn/ui

## Current Implementation

### Server (/packages/server):
- Express + http-proxy-middleware for request proxying
- WebSocket server for real-time monitoring
- node-json-db for project configuration storage
- TypeScript with proper type definitions
- Core features: request proxying, WebSocket broadcasting, project configuration

### Client (/packages/client):
- React + Vite setup
- TypeScript + ESLint configuration
- Tailwind CSS + shadcn/ui for styling
- Zustand for state management
- Basic project structure ready for component implementation
- Server package implements proxy functionality using http-proxy-middleware
- WebSocket integration for real-time request monitoring
- Storage system for managing project configurations
- Basic error handling and request/response transformation

Project Structure:
/packages
  /server
    /src
      /proxy - Proxy handling logic
      /storage - Project configuration storage
      /websocket - WebSocket management
      /types - TypeScript definitions
      index.ts - Main server entry
  /client 
    /src
      /components - React components
      /hooks - React hooks
      /store - Zustand store
      /types - TypeScript definitions
      /main.tsx - Main client entry

### Key Features Working:
- Basic proxy routing (http://localhost:3000/[project-id]/[path])
- Project configuration storage
- WebSocket broadcasting of proxy events
- Error handling for proxy requests
- Request response locking

### Development Environment:
- Package manager: Yarn
- TypeScript for type safety
- Development server: ts-node-dev (server), Vite (client)
- Proper TypeScript and build configurations

## Current Focus Areas:
[Specify your current focus, e.g., "Implementing frontend components", "Adding authentication", etc.]

Next Steps:
[Specify what you'd like to work on next, e.g., "implement the React frontend", "add response locking", etc.]

## Additional Context:
- I'm a full stack developer with 25 years experience
- Working remotely for a property management platform
- Experienced in PHP, JavaScript/TypeScript, Node.js, React, Vue
- ADHD, autistic, sometimes have communication challenges
- Fast learner, prefer clear, structured responses
```

>  When using this prompt, replace the [your specific focus area] with whatever aspect you want to work on next, such as:
>   - [x] Implementing the React frontend dashboard
>   - [x] Adding response locking functionality
>   - [ ] Enhancing the storage system
>   - [ ] Adding authentication
>   - [ ] Implementing response modification features
>   - [ ] Adding request/response filtering
>   - [ ] Implementing request history
>   - [ ] Adding request search/filtering capabilities
