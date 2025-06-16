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
 *   userId: string;
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
 *   userId: string
 *   ws: any
 *   sessionId: string,
 *   ip: string
 *  }[]>
 *  }
 */
const getAllConnections = () => {
  return Promise.resolve([...db.values()]);
};

const deleteConnection = (connectionId) => {
  db.delete(connectionId);

  return Promise.resolve();
};

const findAllByUserIds = (userIds) => {
  return [...db.values()].filter((con) => userIds.includes(con.userId));
};
const findByUserId = (userId) => {
  return [...db.values()].find((con) => con.userId === userId);
};

module.exports = {
  findByUserId,
  findAllByUserIds,
  deleteConnection,
  getAllConnections,
  createConnection,
};
