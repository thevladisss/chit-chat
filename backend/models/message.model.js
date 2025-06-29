const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
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

// Create a Map-like interface for backward compatibility
const MessageModel = mongoose.model('Message', messageSchema);

// Create a wrapper that mimics the Map interface
const messageMap = {
  get: async (messageId) => {
    return await MessageModel.findOne({ messageId });
  },
  set: async (messageId, messageData) => {
    return await MessageModel.findOneAndUpdate({ messageId }, messageData, {
      upsert: true,
      new: true,
    });
  },
  values: async () => {
    return await MessageModel.find({});
  },
};

messageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    const { _id } = ret;

    ret.id = _id.toString();
    ret.messageId = ret._id.toString();
  },
});


module.exports = messageMap;
module.exports.MessageModel = MessageModel;

module.exports = {
  MessageModel,
  messageSchema,
};
