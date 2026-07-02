import { WebSocket } from 'ws';

export interface ConnectionWithSocket {
  id: string;
  connectionId: string;
  sessionId: string;
  createdTimestamp: number;
  userId: string;
  ws?: WebSocket;
}

export interface StoreConnectionPayload {
  ws: WebSocket;
  sessionId: string;
  userId: string;
}
