import { WebSocket } from 'ws';

/**
 * Connection document + WebSocket, as returned by connection service.
 */
export interface ConnectionWithSocket {
  id: string;
  connectionId: string;
  sessionId: string;
  createdTimestamp: number;
  userId: string;
  ws?: WebSocket;
}

/**
 * Payload for storing a new connection.
 */
export interface StoreConnectionPayload {
  ws: WebSocket;
  sessionId: string;
  userId: string;
}

/**
 * Raw connection JSON from ConnectionModel.toJSON() (before adding ws).
 */
export interface ConnectionJSON {
  id: string;
  connectionId: string;
  sessionId: string;
  createdTimestamp: number;
  userId: unknown;
}
