import { ConnectionModel, type IConnection } from '../models/connection.model';
import { Types } from 'mongoose';

interface CreateConnectionPayload {
  sessionId: string;
  socket?: any;
  userId: string | Types.ObjectId;
}

export const createConnection = async (
  payload: CreateConnectionPayload,
): Promise<IConnection> => {
  const connection = new ConnectionModel({
    sessionId: payload.sessionId,
    userId:
      typeof payload.userId === 'string'
        ? new Types.ObjectId(payload.userId)
        : payload.userId,
  });
  return connection.save();
};

export const getAllConnections = async (
  projection?: string | Record<string, number>,
): Promise<IConnection[]> => {
  let query = ConnectionModel.find({});

  if (projection) {
    query = query.select(projection);
  }

  return query.exec();
};

export const getAllConnectionsWhereIdNotIn = async (
  connectionsIds: string[],
): Promise<IConnection[]> => {
  const objectsIds = connectionsIds.map((id) => new Types.ObjectId(id));
  return ConnectionModel.find({
    _id: { $nin: objectsIds },
  }).exec();
};

export const deleteConnection = async (connectionId: string): Promise<void> => {
  await ConnectionModel.deleteOne({ _id: new Types.ObjectId(connectionId) });
};

export const deleteByConnectionId = async (connectionId: string): Promise<void> => {
  await ConnectionModel.deleteOne({ _id: new Types.ObjectId(connectionId) });
};

export const findAllByUserIds = async (userIds: string[]): Promise<IConnection[]> => {
  const objectsIds = userIds.map((id) => new Types.ObjectId(id));
  return ConnectionModel.find({ userId: { $in: objectsIds } }).exec();
};

export const findByUserId = async (userId: string): Promise<IConnection | null> => {
  const connection = await ConnectionModel.findOne({
    userId: new Types.ObjectId(userId),
  }).exec();
  return connection;
};

export const findById = async (connectionId: string): Promise<IConnection | null> => {
  const connection = await ConnectionModel.findById(connectionId);
  return connection;
};

export default {
  findByUserId,
  deleteByConnectionId,
  findAllByUserIds,
  deleteConnection,
  getAllConnections,
  getAllConnectionsWhereIdNotIn,
  createConnection,
  findById,
};
