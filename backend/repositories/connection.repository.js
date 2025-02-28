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
 *   id: string;
 *   sessionId: string;
 *   createdTimestamp: number;
 *   ws: any;
 *   ip: string
 *  }>
 * }
 */
const createConnection = (payload) => {
  const id = v4().toString();

  const object = {
    id,
    ...payload,
  };

  db.set(id, object);

  return Promise.resolve(object);
};

/**
 *
 * @return {
 * Promise<{
 *   id: string
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

module.exports = {
  getAllConnections,
  createConnection,
  findConnectionByIP,
};
