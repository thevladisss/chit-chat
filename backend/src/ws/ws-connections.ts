import { WebSocket } from 'ws';

/**
 * Process-local registry of active WebSocket instances.
 * WebSocket objects cannot be serialised, so they live here rather than in Redis.
 */

const connections = new Map<string, WebSocket>();

export const setWs = (connectionId: string, ws: WebSocket): void => {
  connections.set(connectionId, ws);
};

export const getWs = (connectionId: string): WebSocket | undefined => {
  return connections.get(connectionId);
};

export const deleteWs = (connectionId: string): void => {
  connections.delete(connectionId);
};

export default { setWs, getWs, deleteWs };
