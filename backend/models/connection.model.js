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
    ret.id = ret._id.toString();
    ret.connectionId = ret._id.toString();
  },
});

module.exports = {
  ConnectionModel,
  connectionSchema,
};
