# Dev Proxy

A development proxy server for API request monitoring and modification with a React-based UI.

Github: https://github.com/nev3rm0re/dev-proxy
NPM: https://www.npmjs.com/package/@4ev3rm0re/dev-proxy-server

## Features

- Real-time API request monitoring and modification
- WebSocket-based request/response tracking
- Response modification capabilities
- Project-based configuration
- Modern React + TypeScript interface with shadcn/ui components

## Installation

You can install Dev Proxy either globally or as a project dependency:

### Global Installation

```bash
npm install -g @4ev3rm0re/dev-proxy-server
# or
yarn global add @4ev3rm0re/dev-proxy-server
```

### Local Installation

```bash
npm install --save-dev @4ev3rm0re/dev-proxy-server
# or
yarn add -D @4ev3rm0re/dev-proxy-server
```

## Usage

### Command Line Options

Start the proxy server with various configuration options:

```bash
dev-proxy [options]

Options:
  -p, --proxy-port <number>  Set the proxy server port (default: 9001)
  -a, --admin-port <number>  Set the admin dashboard port (default: 9000)
  -s, --storage <path>       Set storage file path (default: "./proxyDB.json")
  -V, --version             Output version number
  -h, --help                Display help information
```

### Proxying Requests

Configure your API requests to go through the proxy:

Original: `https://api.example.com/v1/resource`
Proxied: `http://localhost:9001/api.example.com/v1/resource`

## Development

To contribute to Dev Proxy:

```bash
# Clone the repository
git clone https://github.com/nev3rm0re/dev-proxy.git
cd dev-proxy

# Install dependencies
yarn install

# Build the project
yarn build

# Link for local development
yarn link

# Start development
yarn dev
```

The project uses:
- Turborepo for monorepo management
- Vite for fast development
- TypeScript for type safety
- ESLint for code quality
- React 18 with shadcn/ui components
- WebSocket for real-time updates

## License

MIT
