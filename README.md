# Dev Proxy

A development proxy server for API request monitoring and modification with a React-based UI.

## Features

- Real-time API request monitoring and modification
- WebSocket-based request/response tracking
- Response modification capabilities
- Project-based configuration
- Modern React + TypeScript interface

## Installation

You can install Dev Proxy either globally or as a project dependency:

### Global Installation

```bash
npm install -g dev-proxy
# or
yarn global add dev-proxy
```

### Local Installation

```bash
npm install --save-dev dev-proxy
# or
yarn add -D dev-proxy
```

## Usage

### Using Global Installation

Start the proxy server directly:

```bash
dev-proxy --port 3000
```

### Using Local Installation

Add to your `package.json` scripts:

```json
{
  "scripts": {
    "proxy": "dev-proxy --port 3000"
  }
}
```

Then run:

```bash
npm run proxy
# or
yarn proxy
```

### Proxying Requests

Configure your API requests to go through the proxy:

Original: `https://api.example.com/v1/resource`
Proxied: `http://localhost:3000/api.example.com/v1/resource`

## Development

To contribute to Dev Proxy:

```bash
# Clone the repository
git clone https://github.com/yourusername/dev-proxy.git
cd dev-proxy

# Install dependencies
yarn install

# Start development
yarn dev
```

The project uses:
- Vite for fast development
- TypeScript for type safety
- ESLint for code quality
- React 18 for the user interface

## License

MIT
