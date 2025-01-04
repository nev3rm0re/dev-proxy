# Dev Proxy

A development proxy server for API request monitoring and modification.

## Installation

```bash
npm install -g dev-proxy
# or
yarn global add dev-proxy
```

## Usage

Start the proxy server:

```bash
dev-proxy --port 3000
```

Configure your API requests to go through the proxy:

Original: https://api.example.com/v1/resource

Proxied: http://localhost:3000/api.example.com/v1/resource

## Features

- Proxy API requests with real-time monitoring
- WebSocket-based request/response tracking
- Response modification capabilities
- Project-based configuration

## Development

Clone the repository:

```bash
git clone https://github.com/yourusername/dev-proxy.git
cd dev-proxy
yarn install
yarn dev
```

License
MIT