import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';
import {
  redisStoreConnection,
  redisDeleteConnection,
  redisRefreshConnectionTTL,
  redisGetAllConnections,
  redisGetConnectionsByUserId,
  redisGetConnectionsByUserIds,
  type RedisConnection,
} from '../redis';
import type { ConnectionWithSocket, StoreConnectionPayload } from '../types/connection';

const socketMap = new Map<string, WebSocket>();

function toConnectionWithSocket(conn: RedisConnection): ConnectionWithSocket {
  return {
    id: conn.connectionId,
    connectionId: conn.connectionId,
    sessionId: conn.sessionId,
    createdTimestamp: conn.createdTimestamp,
    userId: conn.userId,
    ws: socketMap.get(conn.connectionId),
  };
}

export const storeConnection = async (
  payload: StoreConnectionPayload,
): Promise<ConnectionWithSocket> => {
  const connectionId = uuidv4();

  await redisStoreConnection(connectionId, {
    userId: payload.userId,
    sessionId: payload.sessionId,
    createdTimestamp: Date.now(),
  });

  socketMap.set(connectionId, payload.ws);

  return {
    id: connectionId,
    connectionId,
    sessionId: payload.sessionId,
    createdTimestamp: Date.now(),
    userId: payload.userId,
    ws: payload.ws,
  };
};

export const refreshConnectionTTL = async (
  connectionId: string,
): Promise<void> => {
  await redisRefreshConnectionTTL(connectionId);
};

export const removeConnectionByConnectionId = async (
  connectionId: string,
): Promise<void> => {
  socketMap.delete(connectionId);
  await redisDeleteConnection(connectionId);
};

export const getAllConnections = async (): Promise<ConnectionWithSocket[]> => {
  const conns = await redisGetAllConnections();
  return conns.map(toConnectionWithSocket);
};

export const getAllConnectionsNoCurrent = async (
  connectionId: string,
): Promise<ConnectionWithSocket[]> => {
  const conns = await redisGetAllConnections();
  return conns
    .filter((c) => c.connectionId !== connectionId)
    .map(toConnectionWithSocket);
};

export const getAllConnectionsByUserIds = async (
  userIds: string[],
): Promise<ConnectionWithSocket[]> => {
  const conns = await redisGetConnectionsByUserIds(userIds);
  return conns.map(toConnectionWithSocket);
};

export const getConnectionsByUserId = async (
  userId: string,
): Promise<ConnectionWithSocket[]> => {
  const conns = await redisGetConnectionsByUserId(userId);
  return conns.map(toConnectionWithSocket);
};

export const getAllConnectionsOnline = async (): Promise<ConnectionWithSocket[]> => {
  const all = await getAllConnections();
  return all.filter((c) => c.ws?.readyState === WebSocket.OPEN);
};

export default {
  storeConnection,
  refreshConnectionTTL,
  removeConnectionByConnectionId,
  getAllConnections,
  getAllConnectionsNoCurrent,
  getAllConnectionsByUserIds,
  getConnectionsByUserId,
  getAllConnectionsOnline,
};
