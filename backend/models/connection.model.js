const mongoose = require('mongoose');
const { Schema } = mongoose;

const connectionSchema = new Schema({
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

// Create a Map-like interface for backward compatibility
const ConnectionModel = mongoose.model('Connection', connectionSchema);

connectionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    const { _id } = ret;

    ret.id = _id.toString();
    ret.connectionId = _id.toString();
    ret.userId = ret.userId.toString();
  },
});

module.exports = {
  ConnectionModel,
  connectionSchema,
};
