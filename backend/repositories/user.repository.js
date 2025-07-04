const { UserModel } = require('../models/user.model');
const ChatRepository = require('./chat.repository');
const { ChatModel } = require('../models/chat.model');
const { ObjectId } = require('mongoose').Types;

/**
 * Create a new user with the given username or find an existing one
 * @param {string} username - The username to create or find
 * @return {Promise<{userId: string, username: string, createdTimestamp: number}>} - The created or found user
 */
const createOrFindFirstUser = async (username) => {
  let user = await UserModel.findOne({ username }).exec();

  if (!user) {
    const model = new UserModel({ username });

    user = await model.save();
  }

  return user;
};

/**
 * Get all users in the system
 * @return {Promise<Array<{userId: string, username: string, createdTimestamp: number}>>} - All users
 */
const getAllUsers = () => {
  return UserModel.find({}).exec();
};

/**
 * Get all users who are not in a chat with the provided user
 * @param {string} userId - The ID of the user to check against
 * @return {Promise<Array<{userId: string, username: string, createdTimestamp: number}>>} - Users not in chat with the provided user
 */
const getAllUsersNotInChatWithProvidedUser = async (userId) => {
  const chatsIds = await ChatRepository.findAllChatsIdsByUsersIds([userId]);

  const objectsIds = chatsIds.map((chatId) => new ObjectId(chatId));

  return UserModel.find({ _id: { $nin: objectsIds } }).exec();
};

/**
 * Find a user by its ID
 * @param {string} userId - The ID of the user to find
 * @return {Promise<{userId: string, username: string, createdTimestamp: number}|undefined>} - The found user or undefined
 */
const findById = (userId) => {
  return UserModel.findById(userId).exec();
};

/**
 * Find multiple users by their IDs
 * @param {string[]} userIds - Array of user IDs to find
 * @return {Promise<Array<{userId: string, username: string, createdTimestamp: number}>>} - Array of found users
 */
const findAllById = (usersIds) => {
  const objectsIds = usersIds.map((userId) => new ObjectId(userId));

  return UserModel.find({ _id: { $all: objectsIds } }).exec();
};

/**
 * Find all users who have a chat with the specified user (only chats with exactly 2 users)
 * @param {string} userId - The ID of the user to find chat partners for
 * @return {Promise<Array<{userId: string, username: string, createdTimestamp: number}>>} - Array of user models who have a chat with the specified user
 */
const findUsersHavingChatWithUser = async (userId) => {
  const userObjectId = new ObjectId(userId);

  // Find all chats where the specified user is a participant and there are exactly 2 users
  const chats = await ChatModel.find({
    users: { $all: [userObjectId] },
    $expr: { $eq: [{ $size: '$users' }, 2] },
  }).exec();

  // Extract the IDs of the other users in these chats
  const otherUserIds = [];

  for (const chat of chats) {
    const otherUserId = chat.users.find((id) => !id.equals(userObjectId));

    if (otherUserId) {
      otherUserIds.push(otherUserId.toString());
    }
  }

  // Fetch and return the actual user models
  return findAllById(otherUserIds);
};

/**
 * Find all users that are not second participants of a chat with the supplied user and not the user himself
 * @param {string} userId - The ID of the user to find non-chat partners for
 * @return {Promise<Array<{userId: string, username: string, createdTimestamp: number}>>} - Array of user models who are not chat partners with the specified user and not the user himself
 */
const findUsersNotHavingChatWithUser = async (userId) => {
  // Get all users who have a chat with the specified user
  const usersWithChat = await findUsersHavingChatWithUser(userId);
  const usersWithChatIds = usersWithChat.map((user) => user.id);

  // Add the user's own ID to the exclusion list
  const excludeIds = [...usersWithChatIds, userId];

  // Convert string IDs to ObjectIds
  const objectIds = excludeIds.map((id) => new ObjectId(id));

  // Find all users except those in the exclusion list
  return UserModel.find({ _id: { $nin: objectIds } }).exec();
};

const findUsersWhereUsernameContains = (search) => {
  return UserModel.find({ username: { $regex: search, $options: 'i' } }).exec();
};

const findUsersWhereUsernameContainsExcludingUserId = (
  search,
  excludedUserId,
) => {
  return UserModel.find({ username: { $regex: search, $options: 'i' } })
    .where('_id')
    .ne(excludedUserId)
    .exec();
};

module.exports = {
  getAllUsers,
  createOrFindFirstUser,
  getUsersWithoutChatWithUser: getAllUsersNotInChatWithProvidedUser,
  getAllUsersNotInChatWithProvidedUser,
  findById,
  findAllById,
  findUsersHavingChatWithUser,
  findUsersNotHavingChatWithUser,
  findUsersWhereUsernameContains,
  findUsersWhereUsernameContainsExcludingUserId,
};
