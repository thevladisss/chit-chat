import mongoose, {
  Schema,
  Document,
  Model,
  Types,
  type HydratedDocument,
} from 'mongoose';
import { IUser } from './user.model';

export interface IChat extends Document {
  name: string[];
  /** ObjectIds when unpopulated; IUser[] when populated via .populate('users') */
  users: Types.ObjectId[] | IUser[];
  createdTimestamp: number;
  id: string;
  chatId: string;
  lastMessage?: any;
  isGroupChat: boolean;
  messages?: any[];
  audioMessages?: any[];
}

/**
 * Chat document with all Mongoose document methods and properties
 */
export type ChatDocument = HydratedDocument<IChat>;

/**
 * Lean chat document (plain object without Mongoose document methods)
 * Use with .lean() queries for better performance
 */
export type LeanChat = Omit<IChat, keyof Document> & {
  _id: mongoose.Types.ObjectId;
};

/**
 * Plain object representation of chat before transformation
 * This is what the `ret` parameter contains in the toJSON transform function
 */
export interface ChatPlainObject {
  _id: mongoose.Types.ObjectId;
  name: string[];
  users: Types.ObjectId[] | IUser[];
  createdTimestamp: number;
  lastMessage?: any;
  isGroupChat?: boolean;
  messages?: any[];
  audioMessages?: any[];
  [key: string]: any; // Allow for additional properties from virtuals or other schema features
}

/**
 * Transformed chat as returned by toJSON()
 * This matches the output of the schema's transform function
 */
export interface TransformedChat {
  id: string;
  chatId: string;
  name: string[];
  users: Types.ObjectId[] | IUser[];
  createdTimestamp: number;
  lastMessage?: any;
  isGroupChat?: boolean;
  messages?: any[];
  audioMessages?: any[];
}

const chatSchema = new Schema<IChat>({
  name: [
    {
      type: String,
      required: false,
      default: '',
    },
  ],
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdTimestamp: {
    type: Number,
    default: Date.now,
  },
});

/* Virtuals */

chatSchema.virtual('lastMessage').get(function () {
  return this.messages && this.messages.length
    ? this.messages[this.messages.length - 1]
    : null;
});

chatSchema.virtual('isGroupChat').get(function () {
  return this.users && this.users.length > 2;
});

chatSchema.virtual('messages', {
  ref: 'TextMessage',
  localField: '_id',
  foreignField: 'chatId',
  get: function (messages: any[]) {
    return messages && messages.length ? messages : [];
  },
});

chatSchema.virtual('audioMessages', {
  ref: 'AudioMessage',
  localField: '_id',
  foreignField: 'chatId',
  get: function (audioMessages: any[]) {
    return audioMessages && audioMessages.length ? audioMessages : [];
  },
});

chatSchema.virtual('chatId').get(function () {
  return this._id.toString();
});

chatSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (
    _doc: HydratedDocument<IChat>,
    ret: ChatPlainObject,
  ): TransformedChat {
    return {
      id: ret._id.toString(),
      chatId: ret._id.toString(),
      name: ret.name,
      users: ret.users,
      createdTimestamp: ret.createdTimestamp,
      lastMessage: ret.lastMessage,
      isGroupChat: ret.isGroupChat,
      messages: ret.messages,
      audioMessages: ret.audioMessages,
    };
  },
});

export const ChatModel: Model<IChat> = mongoose.model<IChat>(
  'Chat',
  chatSchema,
);
