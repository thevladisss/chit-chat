const { v4 } = require('uuid');
const db = new Map();
const ws = require('ws');

/**
 *
 * @param payload {{
 *   createdTimestamp: number
 *   ws: any
 *   sessionId: string
 * }}
 * @return {
 * Promise<{
 *   connectionId: string;
 *   sessionId: string;
 *   createdTimestamp: number;
 *   ws: any;
 *   ip: string
 *  }>
 * }
 */
const createConnection = (payload) => {
  const connectionId = v4().toString();

  const object = {
    connectionId,
    ...payload,
  };

  db.set(connectionId, object);

  return Promise.resolve(object);
};

/**
 *
 * @return {
 * Promise<{
 *   connectionId: string
 *   createdTimestamp: number,
 *   ws: any
 *   sessionId: string,
 *   ip: string
 *  }[]>
 *  }
 */
const getAllConnections = () => {
  return Promise.resolve([...db.values()]);
};

const findConnectionByIP = async (ip) => {
  const connection = (await getAllConnections()).find((c) => {
    return c.ip === ip;
  });

  return Promise.resolve();
};

const deleteConnection = (connectionId) => {

  db.delete(connectionId)

  return Promise.resolve()
}

module.exports = {
  deleteConnection,
  getAllConnections,
  createConnection,
  findConnectionByIP,
};
