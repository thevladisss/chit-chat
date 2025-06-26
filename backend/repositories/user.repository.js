const User = require('../models/user.model');
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

const createOrFindFirstUser = (username) => {
  const users = [...User.values()];

  let user = users.find((u) => u.username === username);

  if (user) return user;

  user = {
    userId: v4(),
    username,
    createdTimestamp: Date.now(),
  };

  User.set(user.userId, user);

  return Promise.resolve(user);
};

const getAllUsers = () => {
  return Promise.resolve([...User.values()]);
};

const getUsersWithoutChatWithUser = async (userId) => {
  const users = [...User.values()];

  const chats = await ChatRepository.getAllChats();

  const result = users
    .filter((u) => {
      return u.userId !== userId;
    })
    .filter((u) => {
      return !chats.some((chat) => {
        return chat.users.includes(u.userId) && chat.users.includes(userId);
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
  const user = User.get(userId);
  return Promise.resolve(user);
};

/**
 * Find multiple users by their IDs
 * @param {string[]} userIds - Array of user IDs to find
 * @return {Promise<Array<{userId: string, username: string, createdTimestamp: number}>>} - Array of found users
 */
const findAllById = (userIds) => {
  const users = userIds
    .map((userId) => User.get(userId))
    .filter((user) => user !== undefined);

  return Promise.resolve(users);
};

module.exports = {
  User,
  getAllUsers,
  createOrFindFirstUser,
  getUsersWithoutChatWithUser,
  findById,
  findAllById,
};
