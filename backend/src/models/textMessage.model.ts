import mongoose, {
  Schema,
  Document,
  Model,
  Types,
  type HydratedDocument,
} from 'mongoose';

export interface ITextMessage extends Document {
  chatId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  sentAt: number;
  isSeen: boolean;
  id: string;
  messageId: string;
}

/**
 * Text message document with all Mongoose document methods and properties
 */
export type TextMessageDocument = HydratedDocument<ITextMessage>;

/**
 * Lean text message document (plain object without Mongoose document methods)
 * Use with .lean() queries for better performance
 */
export type LeanTextMessage = Omit<ITextMessage, keyof Document> & {
  _id: mongoose.Types.ObjectId;
};

/**
 * Plain object representation of text message before transformation
 * This is what the `ret` parameter contains in the toJSON transform function
 */
export interface TextMessagePlainObject {
  _id: mongoose.Types.ObjectId;
  chatId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  sentAt: number;
  isSeen: boolean;
  [key: string]: any; // Allow for additional properties from virtuals or other schema features
}

/**
 * Transformed text message as returned by toJSON()
 * This matches the output of the schema's transform function
 */
export interface TransformedTextMessage {
  id: string;
  messageId: string;
  chatId: string;
  userId: string;
  text: string;
  sentAt: number;
  isSeen: boolean;
}

const textMessageSchema = new Schema<ITextMessage>({
  chatId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Chat',
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  text: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Number,
    default: Date.now,
  },
  isSeen: {
    type: Boolean,
    default: false,
  },
});

textMessageSchema.virtual('messageId').get(function () {
  return this._id.toString();
});

textMessageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (
    _doc: HydratedDocument<ITextMessage>,
    ret: TextMessagePlainObject,
  ): TransformedTextMessage {
    return {
      id: ret._id.toString(),
      messageId: ret._id.toString(),
      chatId: ret.chatId.toString(),
      userId: ret.userId.toString(),
      text: ret.text,
      sentAt: ret.sentAt,
      isSeen: ret.isSeen,
    };
  },
});

export const TextMessageModel: Model<ITextMessage> = mongoose.model<ITextMessage>(
  'TextMessage',
  textMessageSchema,
);
export { textMessageSchema };
