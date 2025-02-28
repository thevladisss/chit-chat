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
 * @param sessionId {string}
 * @return {Promise<{id: string, createdTimestamp: number, ws: *}[]>}
 */
const getAllActiveConnections = async (sessionId) => {
  const conections = await connectionRepository.getAllConnections();

  return conections.filter((c) => c.sessionId !== sessionId);
};

/**
 *
 * @param payload {{
 *   ws: any,
 *   ip: string
 *   sessionId: string
 * }}
 */
const storeConnection = (payload) => {
  const connection = ConnectionRepository.findConnectionByIP(payload.ip);

  if (connection) return connection;

  return ConnectionRepository.createConnection({
    createdTimestamp: Date.now(),
    ip: payload.ip,
    ws: payload.ws,
    sessionId: payload.sessionId,
  });
};

module.exports = {
  storeConnection,
};
