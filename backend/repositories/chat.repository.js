const { ChatModel } = require('../models/chat.model');
const { ObjectId } = require('mongoose').Types;
/**

 * @type {Map<string, {
 *   chatId: string
 *   users: string[]
 *   createdTimestamp: number
 * }>}
 */

/**
 *
 * @param userId {string}
 * @return {Promise<Awaited<{chatId: string, users: string[], createdTimestamp: string}[]>>}
 */
const getChatsByParticipants = async (userId) => {
  return ChatModel.find({ users: { $in: userId } }).populate('users').exec();
};

/**
 *
 * @param usersIds {string[]}
 * @return {Promise<Promise<void> | Promise<Awaited<any[]>>>}
 */
const findAllChatsByUsersIds = async (usersIds) => {
  const objectsIds = usersIds.map((userId) => new ObjectId(userId));

  return ChatModel.find({ users: { $in: objectsIds } }).populate('users').exec();
};

/**
 *
 * @param usersIds {string[]}
 * @return {Promise<Promise<void> | Promise<Awaited<any[]>>>}
 */
const findAllChatsIdsByUsersIds = async (usersIds) => {
  const objectsIds = usersIds.map((userId) => new ObjectId(userId));

  return ChatModel.find({ users: { $in: objectsIds } })
    .select({ _id: true })
    .exec();
};

/**
 * Create a new chat with the specified users
 * @param {Object} data - The chat data
 * @param {string[]} data.usersIds - Array of user IDs to include in the chat
 * @return {Promise<{chatId: string, users: string[], createdTimestamp: number}>} - The created chat
 */
const createChat = (data) => {
  const chat = new ChatModel({
    users: data.usersIds.map((userId) => new ObjectId(userId)),
  });

  return chat.save();
};

/**
 * Get all chats in the system
 * @return {Promise<Array<{chatId: string, users: string[], createdTimestamp: number}>>} - All chats
 */
const getAllChats = () => {
  return ChatModel.find({}).populate('users').exec();
};

/**
 * Find a chat by its ID
 * @param {string} chatId - The ID of the chat to find
 * @return {Promise<{chatId: string, users: string[], createdTimestamp: number}|undefined>} - The found chat or undefined
 */
const findById = (chatId) => {
  return ChatModel.findById(chatId).populate('users').exec();
};

/**
 * Finds chats with all users
 * @param usersIds
 * @return {any}
 */
const findByUsersIds = (usersIds) => {
  const objectsIds = usersIds.map((userId) => new ObjectId(userId));

  return ChatModel.findOne({
    users: { $all: objectsIds },
    $expr: { $eq: [{ $size: '$users' }, usersIds.length] },
  }).populate('users').exec();
};

/**
 * Finds IDs of all users who have a chat with the specified user (only chats with exactly 2 users)
 * @param {string} userId - The ID of the user to find chat partners for
 * @return {Promise<string[]>} - Array of user IDs who have a chat with the specified user
 */
const findIdsOfAllUsersHavingChatWithUser = async (userId) => {
  const userObjectId = new ObjectId(userId);

  // Find all chats where the specified user is a participant and there are exactly 2 users
  const chats = await ChatModel.find({
    users: { $all: [userObjectId] },
    $expr: { $eq: [{ $size: '$users' }, 2] }
  }).exec();

  // Extract the IDs of the other users in these chats
  const otherUserIds = [];

  for (const chat of chats) {
    const otherUserId = chat.users.find(id => !id.equals(userObjectId));
    if (otherUserId) {
      otherUserIds.push(otherUserId.toString());
    }
  }

  return otherUserIds;
}

/**
 * Finds all chats containing search value in either username of one of participants,
 * message text, or chat name
 * @param search
 * @return {Promise<any[]>}
 */
const findByUserNameOrChatNameOrMessage = async (search) => {
  // let chats = [...Chat.values()];
  //
  // for (const chat of chats) {
  //   const users = [
  //     ...User.values().filter((user) => {
  //       return chat.users.includes(user.userId);
  //     }),
  //   ];
  //   const messages = await MessageRepository.findAllByChatId(chat.chatId);
  //
  //   chat.users = users;
  //   chat.messages = messages;
  // }
  //
  // //TODO: Add filter by chat name
  // return chats.filter((chat) => {
  //   return (
  //     chat.users.some(({ username }) => username === search) ||
  //     chat.messages.some(({ text }) => text.includes(search))
  //   );
  // });

  const chats = await ChatModel.find({}).exec();

  return chats;
};

module.exports = {
  findByUserNameOrChatNameOrMessage,
  findAllChatsIdsByUsersIds,
  findAllChatsByUsersIds,
  findByUsersIds,
  getAllChats,
  createChat,
  getChatsByParticipants,
  findById,
  findIdsOfAllUsersHavingChatWithUser,
};
