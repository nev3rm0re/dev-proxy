// packages/server/src/websocket/index.ts
import { WebSocket, WebSocketServer } from 'ws';
import { ProxyEvent } from '../types/index.js';

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Set<WebSocket>;

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Set();

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      
      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });
  }

  broadcast(event: ProxyEvent) {
    const message = JSON.stringify(event);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}