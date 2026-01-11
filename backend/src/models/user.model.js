const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  createdTimestamp: {
    type: Number,
    default: Date.now,
  },
});

// Create a Map-like interface for backward compatibility
const UserModel = mongoose.model('User', userSchema);

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    const { _id } = ret;

    ret.id = _id.toString();
    ret.userId = ret._id.toString();
  },
});


module.exports = {
  UserModel,
  userSchema,
};
