const mongoose = require('mongoose');
const { Schema } = mongoose;

const audioMessageSchema = new Schema({
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

// Add indexes for better query performance
audioMessageSchema.index({ chatId: 1 });
audioMessageSchema.index({ userId: 1 });
audioMessageSchema.index({ sentAt: -1 });
audioMessageSchema.index({ createdAt: -1 });

// Transform the output to include virtual fields
audioMessageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    const { _id } = ret;
    ret.id = _id.toString();
    ret.audioMessageId = ret._id.toString();
    ret.messageId = ret._id.toString(); // For backward compatibility
    delete ret._id;
    return ret;
  },
});

// Virtual for formatted file size
audioMessageSchema.virtual('formattedFileSize').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for formatted duration
audioMessageSchema.virtual('formattedDuration').get(function() {
  const seconds = this.audioDuration;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
});

const AudioMessageModel = mongoose.model('AudioMessage', audioMessageSchema);

module.exports = {
  AudioMessageModel,
  audioMessageSchema,
};
