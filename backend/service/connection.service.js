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
 * }}
 */
const storeConnection = async (payload) => {
  const connection = await ConnectionRepository.findConnectionByIP(payload.ip);

  if (connection) return connection;

  return ConnectionRepository.createConnection({
    createdTimestamp: Date.now(),
    ws: payload.ws,
    sessionId: payload.sessionId,
  });
};

const removeConnection = (id) => {
  return ConnectionRepository.deleteConnection(id);
};

module.exports = {
  removeConnection,
  getAllConnectionsNoCurrent,
  getAllConnections,
  storeConnection,
};
