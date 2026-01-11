const mongoose = require('mongoose');
const { Schema } = mongoose;

const textMessageSchema = new Schema({
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
const TextMessageModel = mongoose.model('TextMessage', textMessageSchema);

// Create a wrapper that mimics the Map interface
const textMessageMap = {
  get: async (messageId) => {
    return await TextMessageModel.findOne({ messageId });
  },
  set: async (messageId, messageData) => {
    return await TextMessageModel.findOneAndUpdate({ messageId }, messageData, {
      upsert: true,
      new: true,
    });
  },
  values: async () => {
    return await TextMessageModel.find({});
  },
};

textMessageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    const { _id } = ret;

    ret.id = _id.toString();
    ret.messageId = ret._id.toString();
  },
});

module.exports = textMessageMap;
module.exports.TextMessageModel = TextMessageModel;

module.exports = {
  TextMessageModel,
  textMessageSchema,
};
