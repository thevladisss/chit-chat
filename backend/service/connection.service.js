const ConnectionRepository = require('../repositories/connection.repository');

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

  return conections;
};
/**
 * @param id {string}
 * @return {Promise<{id: string, createdTimestamp: number, ws: *}[]>}
 */
const getAllConnectionsNoCurrent = async (id) => {
  const conections = await ConnectionRepository.getAllConnections();

  return conections.filter((c) => c.id !== id);
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
  return ConnectionRepository.createConnection({
    createdTimestamp: Date.now(),
    ws: payload.ws,
    sessionId: payload.sessionId,
    userId: payload.userId
  });
};

const removeConnection = (id) => {
  return ConnectionRepository.deleteConnection(id);
};

const getAllConnectionsByUserIds = async (userIds) => {
  return ConnectionRepository.findAllByUserIds(userIds);
};

const getConnectionByUserId = async (userId) => {
  return ConnectionRepository.findByUserId(userId);
};

module.exports = {
  getConnectionByUserId,
  removeConnection,
  getAllConnectionsNoCurrent,
  getAllConnections,
  storeConnection,
  getAllConnectionsByUserIds,
};
