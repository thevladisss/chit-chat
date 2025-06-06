const { chatModel } = require('./chat.repository');
const { v4 } = require('uuid');
/**
 *
 * @type {Map<string, {
 *   userId: string,
 *   username: string,
 *   createdTimestamp: number
 * }>}
 */
const userModel = new Map();

const createOrFindFirstUser = (username) => {
  const users = [...userModel.values()];

  let user = users.find((u) => u.username === username);

  if (user) return user;

  user = {
    userId: v4(),
    username,
    createdTimestamp: Date.now(),
  };

  userModel.set(user.userId, user);

  return Promise.resolve(user);
};

const getAllUsers = () => {
  return Promise.resolve([...userModel.values()]);
};

const getUsersWithoutChatWithUser = async (user) => {
  const users = [...userModel.values()];

  const chats = [...chatModel.values()];

  const result = users
    .filter((u) => {
      return u.userId !== user.userId;
    })
    .filter((u) => {
      return !chats.some((chat) => {
        return chat.users.includes(u.userId) && chat.users.includes(user);
      });
    });

  return Promise.resolve(result);
};

module.exports = {
  userModel,
  getAllUsers,
  createOrFindFirstUser,
  getUsersWithoutChatWithUser,
};
