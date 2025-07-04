const { ConnectionModel } = require('../models/connection.model');
const { ObjectId } = require('mongoose').Types;
/**
 * Create a new connection
 * @param {Object} payload - The connection data
 * @param {string} payload.sessionId - The session ID
 * @param {Object} payload.ws - The WebSocket connection
 * @param {string} payload.userId - The user ID
 * @return {Promise<{connectionId: string, sessionId: string, userId: string, createdTimestamp: number, ws: Object}>} - The created connection
 */
const createConnection = async (payload) => {
  const connection = new ConnectionModel({
    sessionId: payload.sessionId,
    ws: payload.ws,
    userId: payload.userId,
  });

  return connection.save();
};

/**
 * Get all connections in the system
 * @return {Promise<Array<{connectionId: string, sessionId: string, userId: string, createdTimestamp: number, ws: Object}>>} - All connections
 */
const getAllConnections = async () => {
  const connections = await ConnectionModel.find({}).exec();

  return connections;
};

/**
 * Get all connections except those with IDs in the provided array
 * @param {string[]} connectionsIds - Array of connection IDs to exclude
 * @return {Promise<Array<{connectionId: string, sessionId: string, userId: string, createdTimestamp: number, ws: Object}>>} - Filtered connections
 */
const getAllConnectionsWhereIdNotIn = async (connectionsIds) => {
  const objectsIds = connectionsIds.map((id) => new ObjectId(id));

  const connections = await ConnectionModel.find({
    _id: { $nin: objectsIds },
  }).exec();

  return connections;
};

/**
 * Delete a connection by its ID
 * @param {string} connectionId - The ID of the connection to delete
 * @return {Promise<void>}
 */
const deleteConnection = async (connectionId) => {
  await ConnectionModel.deleteOne({ _id: connectionId });
};

/**
 * Delete a connection by its connection ID field
 * @param {string} connectionId - The connection ID field value
 * @return {Promise<void>}
 */
const deleteByConnectionId = async (connectionId) => {
  await ConnectionModel.deleteOne({ _id: connectionId });
};

/**
 * Find all connections for the specified user IDs
 * @param {string[]} userIds - Array of user IDs to find connections for
 * @return {Promise<Array<{connectionId: string, sessionId: string, userId: string, createdTimestamp: number, ws: Object}>>} - Array of connections
 */
const findAllByUserIds = async (userIds) => {
  const objectsIds = userIds.map((id) => new ObjectId(id));

  return ConnectionModel.find({ userId: { $in: objectsIds } }).exec();
};

/**
 * Find a connection by user ID
 * @param {string} userId - The user ID to find connection for
 * @return {Promise<{connectionId: string, sessionId: string, userId: string, createdTimestamp: number, ws: Object}|null>} - The found connection or null
 */
const findByUserId = async (userId) => {
  const connection = await ConnectionModel.findOne({ userId }).exec();

  if (!connection) return null;
  return connection;
};

/**
 * Find a connection by its ID
 * @param {string} connectionId - The ID of the connection to find
 * @return {Promise<{connectionId: string, sessionId: string, userId: string, createdTimestamp: number, ws: any, ip: string}|undefined>} - The found connection or undefined
 */
const findById = async (connectionId) => {
  const connection = await ConnectionModel.findById(connectionId);

  return connection;
};

module.exports = {
  findByUserId,
  deleteByConnectionId,
  findAllByUserIds,
  deleteConnection,
  getAllConnections,
  getAllConnectionsWhereIdNotIn,
  createConnection,
  findById,
};
