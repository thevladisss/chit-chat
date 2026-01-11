const ConnectionRepository = require('../repositories/connection.repository');

const memoryDb = new Map();

/**
 *
 * @return { {
 *   connectionId: string;
 *   connectedAt: string
 *   hostname: string
 * }[]
 * }
 */

/**
 *
 * @return {Promise<{id: string, createdTimestamp: number, ws: *; sessionId:string}[]>}
 */
const getAllConnections = async () => {
  const conections = await ConnectionRepository.getAllConnections();

  return conections.map((con) => {
    return {
      ...con.toJSON(),
      ws: memoryDb.get(con.id),
    };
  });
};
/**
 * @param id {string}
 * @return {Promise<{id: string, createdTimestamp: number, ws: *}[]>}
 */
const getAllConnectionsNoCurrent = async (id) => {
  const conections = await ConnectionRepository.getAllConnectionsWhereIdNotIn([
    id,
  ]);

  return conections.map((con) => {
    return {
      ...con.toJSON(),
      ws: memoryDb.get(con.id),
    };
  });
};

/**
 *
 * @param payload {{
 *   ws: any,
 *   sessionId: string
 *   userId: string
 * }}
 */
const storeConnection = async (payload) => {
  const connection = await ConnectionRepository.createConnection({
    createdTimestamp: Date.now(),
    sessionId: payload.sessionId,
    userId: payload.userId,
  });

  memoryDb.set(connection.id, payload.ws);

  return {
    ...connection.toJSON(),
    ws: payload.ws,
  };
};

const removeConnection = (id) => {
  memoryDb.delete(id);

  return ConnectionRepository.deleteConnection(id);
};

const removeConnectionByConnectionId = (connectionId) => {
  memoryDb.delete(connectionId);

  return ConnectionRepository.deleteByConnectionId(connectionId);
};

const getAllConnectionsByUserIds = async (userIds) => {
  const connections = await ConnectionRepository.findAllByUserIds(userIds);

  return connections.map((con) => {
    return {
      ...con.toJSON(),
      ws: memoryDb.get(con.id),
    };
  });
};

const getConnectionByUserId = async (userId) => {
  const connection = await ConnectionRepository.findByUserId(userId);

  if (connection) {
    return {
      ...connection,
      ws: memoryDb.get(connection.id),
    };
  }

  return null;
};

const getAllConnectionsOnline = async () => {
  const connections = await ConnectionRepository.getAllConnections();

  return connections.filter((con) => {
    const ws = memoryDb.get(con.id);

    return ws.readyState === WebSocket.OPEN;
  });
};

module.exports = {
  getConnectionByUserId,
  removeConnection,
  removeConnectionByConnectionId,
  getAllConnectionsNoCurrent,
  getAllConnections,
  storeConnection,
  getAllConnectionsByUserIds,
};
