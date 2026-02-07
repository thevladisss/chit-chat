import mongoose, {
  Schema,
  Document,
  Model,
  Types,
  type HydratedDocument,
} from 'mongoose';

export interface IConnection extends Document {
  sessionId: string;
  userId: Types.ObjectId;
  createdTimestamp: number;
  id: string;
  connectionId: string;
}

/**
 * Connection document with all Mongoose document methods and properties
 */
export type ConnectionDocument = HydratedDocument<IConnection>;

/**
 * Lean connection document (plain object without Mongoose document methods)
 * Use with .lean() queries for better performance
 */
export type LeanConnection = Omit<IConnection, keyof Document> & {
  _id: mongoose.Types.ObjectId;
};

/**
 * Plain object representation of connection before transformation
 * This is what the `ret` parameter contains in the toJSON transform function
 */
export interface ConnectionPlainObject {
  _id: mongoose.Types.ObjectId;
  sessionId: string;
  userId: Types.ObjectId;
  createdTimestamp: number;
  [key: string]: any; // Allow for additional properties from virtuals or other schema features
}

/**
 * Transformed connection as returned by toJSON()
 * This matches the output of the schema's transform function
 */
export interface TransformedConnection {
  id: string;
  connectionId: string;
  sessionId: string;
  userId: string;
  createdTimestamp: number;
}

const connectionSchema = new Schema<IConnection>({
  sessionId: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: false,
  },
  createdTimestamp: {
    type: Number,
    default: Date.now,
  },
});

connectionSchema.virtual('connectionId').get(function () {
  return this._id.toString();
});

connectionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (
    _doc: HydratedDocument<IConnection>,
    ret: ConnectionPlainObject,
  ): TransformedConnection {
    return {
      id: ret._id.toString(),
      connectionId: ret._id.toString(),
      sessionId: ret.sessionId,
      userId: ret.userId.toString(),
      createdTimestamp: ret.createdTimestamp,
    };
  },
});

export const ConnectionModel: Model<IConnection> = mongoose.model<IConnection>(
  'Connection',
  connectionSchema,
);
export { connectionSchema };
