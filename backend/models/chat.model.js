const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema({
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

const ChatModel = mongoose.model('Chat', chatSchema);

/* Virtuals */
chatSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id', // Chat._id
  foreignField: 'chatId', // Message.chatId,
  // Add getter to handle default value
  get: function (messages) {
    return messages && messages.length ? messages : [];
  },
});

chatSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    const { _id } = ret;

    ret.id = _id.toString();
    ret.chatId = ret._id.toString();
  },
});

module.exports.ChatModel = ChatModel;
