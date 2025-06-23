const { Chat } = require('./chat.repository');
const ChatRepository = require('./chat.repository');
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

  const chats = await ChatRepository.getAllChats()

  const result = users
    .filter((u) => {
      return u.userId !== user.userId;
    })
    .filter((u) => {
      return !chats.some((chat) => {
        return chat.users.includes(u.userId) && chat.users.includes(user.userId);
      });
    });

  return Promise.resolve(result);
};

/**
 * Find a user by its ID
 * @param {string} userId - The ID of the user to find
 * @return {Promise<{userId: string, username: string, createdTimestamp: number}|undefined>} - The found user or undefined
 */
const findById = (userId) => {
  const user = userModel.get(userId);
  return Promise.resolve(user);
};

/**
 * Find multiple users by their IDs
 * @param {string[]} userIds - Array of user IDs to find
 * @return {Promise<Array<{userId: string, username: string, createdTimestamp: number}>>} - Array of found users
 */
const findAllById = (userIds) => {
  const users = userIds
    .map(userId => userModel.get(userId))
    .filter(user => user !== undefined);

  return Promise.resolve(users);
};

module.exports = {
  userModel,
  getAllUsers,
  createOrFindFirstUser,
  getUsersWithoutChatWithUser,
  findById,
  findAllById,
};
