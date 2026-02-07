import ConnectionRepository from '../repositories/connection.repository';
import { WebSocket } from 'ws';
import type {
  ConnectionWithSocket,
  ConnectionJSON,
  StoreConnectionPayload,
} from '../types/connection';

const memoryDb = new Map<string, WebSocket>();

function toConnectionWithSocket(
  json: ConnectionJSON,
  ws: WebSocket | undefined,
): ConnectionWithSocket {
  return {
    id: json.id,
    connectionId: json.connectionId,
    sessionId: json.sessionId,
    createdTimestamp: json.createdTimestamp,
    userId: String(json.userId),
    ws,
  };
}

export const getAllConnections = async (): Promise<ConnectionWithSocket[]> => {
  const connections = await ConnectionRepository.getAllConnections();
  return connections.map((con) =>
    toConnectionWithSocket(con.toJSON() as ConnectionJSON, memoryDb.get(con.id)),
  );
};

export const getAllConnectionsNoCurrent = async (
  id: string,
): Promise<ConnectionWithSocket[]> => {
  const connections = await ConnectionRepository.getAllConnectionsWhereIdNotIn([id]);
  return connections.map((con) =>
    toConnectionWithSocket(con.toJSON() as ConnectionJSON, memoryDb.get(con.id)),
  );
};

export const storeConnection = async (
  payload: StoreConnectionPayload,
): Promise<ConnectionWithSocket> => {
  const connection = await ConnectionRepository.createConnection({
    sessionId: payload.sessionId,
    userId: payload.userId,
  });

  memoryDb.set(connection.id, payload.ws);
  return toConnectionWithSocket(connection.toJSON() as ConnectionJSON, payload.ws);
};

export const removeConnection = async (id: string): Promise<void> => {
  memoryDb.delete(id);
  return ConnectionRepository.deleteConnection(id);
};

export const removeConnectionByConnectionId = async (
  connectionId: string,
): Promise<void> => {
  memoryDb.delete(connectionId);
  return ConnectionRepository.deleteByConnectionId(connectionId);
};

export const getAllConnectionsByUserIds = async (
  userIds: string[],
): Promise<ConnectionWithSocket[]> => {
  const connections = await ConnectionRepository.findAllByUserIds(userIds);
  return connections.map((con) =>
    toConnectionWithSocket(con.toJSON() as ConnectionJSON, memoryDb.get(con.id)),
  );
};

export const getConnectionByUserId = async (
  userId: string,
): Promise<ConnectionWithSocket | null> => {
  const connection = await ConnectionRepository.findByUserId(userId);

  if (connection) {
    return toConnectionWithSocket(
      connection.toJSON() as ConnectionJSON,
      memoryDb.get(connection.id),
    );
  }
  return null;
};

export const getAllConnectionsOnline = async (): Promise<ConnectionWithSocket[]> => {
  const connections = await ConnectionRepository.getAllConnections();
  return connections
    .map((con) =>
      toConnectionWithSocket(con.toJSON() as ConnectionJSON, memoryDb.get(con.id)),
    )
    .filter((con) => con.ws != null && con.ws.readyState === WebSocket.OPEN);
};

export default {
  getConnectionByUserId,
  removeConnection,
  removeConnectionByConnectionId,
  getAllConnectionsNoCurrent,
  getAllConnections,
  storeConnection,
  getAllConnectionsByUserIds,
};
