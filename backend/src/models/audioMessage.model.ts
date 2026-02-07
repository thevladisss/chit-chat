import mongoose, {
  Schema,
  Document,
  Model,
  Types,
  type HydratedDocument,
} from 'mongoose';

export interface IAudioMessage extends Document {
  chatId: Types.ObjectId;
  userId: Types.ObjectId;
  audioUrl: string;
  audioDuration: number;
  audioFormat: 'webm' | 'mp4' | 'wav' | 'ogg' | 'm4a';
  fileSize: number;
  originalFileName: string;
  sentAt: number;
  isSeen: boolean;
  createdAt: Date;
  id: string;
  audioMessageId: string;
  messageId: string;
  formattedFileSize: string;
  formattedDuration: string;
}

/**
 * Audio message document with all Mongoose document methods and properties
 */
export type AudioMessageDocument = HydratedDocument<IAudioMessage>;

/**
 * Lean audio message document (plain object without Mongoose document methods)
 * Use with .lean() queries for better performance
 */
export type LeanAudioMessage = Omit<IAudioMessage, keyof Document> & {
  _id: mongoose.Types.ObjectId;
};

/**
 * Plain object representation of audio message before transformation
 * This is what the `ret` parameter contains in the toJSON transform function
 */
export interface AudioMessagePlainObject {
  _id: mongoose.Types.ObjectId;
  chatId: Types.ObjectId;
  userId: Types.ObjectId;
  audioUrl: string;
  audioDuration: number;
  audioFormat: 'webm' | 'mp4' | 'wav' | 'ogg' | 'm4a';
  fileSize: number;
  originalFileName: string;
  sentAt: number;
  isSeen: boolean;
  createdAt: Date;
  formattedFileSize?: string;
  formattedDuration?: string;
  [key: string]: any; // Allow for additional properties from virtuals or other schema features
}

/**
 * Transformed audio message as returned by toJSON()
 * This matches the output of the schema's transform function
 */
export interface TransformedAudioMessage {
  id: string;
  audioMessageId: string;
  messageId: string;
  chatId: string;
  userId: string;
  audioUrl: string;
  audioDuration: number;
  audioFormat: 'webm' | 'mp4' | 'wav' | 'ogg' | 'm4a';
  fileSize: number;
  originalFileName: string;
  sentAt: number;
  isSeen: boolean;
  createdAt: string;
  formattedFileSize?: string;
  formattedDuration?: string;
}

const audioMessageSchema = new Schema<IAudioMessage>({
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
  audioUrl: {
    type: String,
    required: true,
  },
  audioDuration: {
    type: Number,
    required: true,
  },
  audioFormat: {
    type: String,
    required: true,
    enum: ['webm', 'mp4', 'wav', 'ogg', 'm4a'],
  },
  fileSize: {
    type: Number,
    required: true,
  },
  originalFileName: {
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

audioMessageSchema.virtual('audioMessageId').get(function () {
  return this._id.toString();
});

// Add indexes for better query performance
audioMessageSchema.index({ chatId: 1 });
audioMessageSchema.index({ userId: 1 });
audioMessageSchema.index({ sentAt: -1 });
audioMessageSchema.index({ createdAt: -1 });

// Transform the output to include virtual fields
audioMessageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (
    _doc: HydratedDocument<IAudioMessage>,
    ret: AudioMessagePlainObject,
  ): TransformedAudioMessage {
    return {
      id: ret._id.toString(),
      audioMessageId: ret._id.toString(),
      messageId: ret._id.toString(), // For backward compatibility
      chatId: ret.chatId.toString(),
      userId: ret.userId.toString(),
      audioUrl: ret.audioUrl,
      audioDuration: ret.audioDuration,
      audioFormat: ret.audioFormat,
      fileSize: ret.fileSize,
      originalFileName: ret.originalFileName,
      sentAt: ret.sentAt,
      isSeen: ret.isSeen,
      createdAt: ret.createdAt.toISOString(),
      formattedFileSize: ret.formattedFileSize,
      formattedDuration: ret.formattedDuration,
    };
  },
});

// Virtual for formatted file size
audioMessageSchema.virtual('formattedFileSize').get(function () {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for formatted duration
audioMessageSchema.virtual('formattedDuration').get(function () {
  const seconds = this.audioDuration;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
});

export const AudioMessageModel: Model<IAudioMessage> = mongoose.model<IAudioMessage>(
  'AudioMessage',
  audioMessageSchema,
);
export { audioMessageSchema };
