
# Prompt to continue development on dev-proxy

I'm working on a Node.js proxy server project called "dev-proxy" with the following context:

Project Overview:
- Purpose: Development proxy server for REST API requests with real-time monitoring
- Main features: Request proxying, WebSocket-based monitoring, response modification/locking
- Tech stack: Node.js, TypeScript, React, Tailwind CSS, shadcn/ui
- Structure: Monorepo using Turborepo with server and client packages

Current Implementation:
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
  /client (React frontend, to be implemented)

Current Working Features:
- Basic proxy routing (e.g., http://localhost:3000/[project-id]/[path])
- Project configuration storage
- WebSocket broadcasting of proxy events
- Error handling for proxy requests

Development Environment:
- Package manager: Yarn
- TypeScript for type safety
- ts-node-dev for development server
- Project uses proper TypeScript configurations and build setup

Last Implementation Details:
- Successfully implemented proxy routing with project-based URL rewriting
- Added WebSocket integration for real-time request monitoring
- Implemented storage system for project configurations
- Set up basic error handling and request/response transformation

Next Steps:
[Specify what you'd like to work on next, e.g., "implement the React frontend", "add response locking", etc.]

Please help me continue development on this project, focusing on [your specific focus area].
```

>  When using this prompt, replace the [your specific focus area] with whatever aspect you want to work on next, such as:
>   - Implementing the React frontend dashboard
>   - Adding response locking functionality
>   - Enhancing the storage system
>   - Adding authentication
>   - Implementing response modification features
>   - Adding request/response filtering
>   - Implementing request history
>   - Adding request search/filtering capabilities