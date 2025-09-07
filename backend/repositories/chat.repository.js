const mongoose = require('mongoose');
const { ChatModel } = require('../models/chat.model');
const { ObjectId } = mongoose.Types;
const { UserModel } = require('../models/user.model');
const { TextMessageModel } = require('../models/textMessage.model');
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
  return ChatModel.find({ users: { $in: userId } })
    .populate('users')
    .exec();
};

/**
 *
 * @param usersIds {string[]}
 * @return {Promise<Promise<void> | Promise<Awaited<any[]>>>}
 */
const findAllChatsByUsersIds = async (usersIds) => {
  const objectsIds = usersIds.map((userId) => new ObjectId(userId));

  return ChatModel.find({ users: { $in: objectsIds } })
    .populate('users')
    .populate('messages')
    .exec();
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
    .populate('users')
    .populate('messages')
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
  return ChatModel.find({}).populate('users').populate('messages').exec();
};

/**
 * Find a chat by its ID
 * @param {string} chatId - The ID of the chat to find
 * @return {Promise<{chatId: string, users: string[], createdTimestamp: number}|undefined>} - The found chat or undefined
 */
const findById = (chatId) => {
  return ChatModel.findById(chatId)
    .populate('users')
    .populate('messages')
    .exec();
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
  })
    .populate('users')
    .populate('messages')
    .exec();
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
    $expr: { $eq: [{ $size: '$users' }, 2] },
  })
    .populate('users')
    .populate('messages')
    .exec();

  // Extract the IDs of the other users in these chats
  const otherUserIds = [];

  for (const chat of chats) {
    const otherUserId = chat.users.find((id) => !id.equals(userObjectId));
    if (otherUserId) {
      otherUserIds.push(otherUserId.toString());
    }
  }

  return otherUserIds;
};

/**
 * Finds all chats containing search value in either username of one of participants,
 * message text, or chat name
 * @param {string} search - The search term to look for
 * @return {Promise<{
 *   chatId: string | null;
 *   userId: string | null;
 *   messages: any[];
 *   name: string;
 *   lastMessage: string;
 *   lastMessageTimestamp: string;
 *   username: string | null;
 * }[]>} - Array of chats matching the search criteria
 */
const findByUserNameOrChatNameOrMessage = async (search) => {
  if (!search || typeof search !== 'string') {
    return [];
  }

  // Create a case-insensitive regex for the search term
  const searchRegex = new RegExp(search, 'i');

  // Find chats by name
  const chatsByName = await ChatModel.find({
    name: { $regex: searchRegex }
  })
    .populate('users')
    .populate('messages')
    .exec();

  // Find users by username
  const usersByName = await UserModel.find({
    username: { $regex: searchRegex }
  }).exec();

  // Get user IDs
  const userIds = usersByName.map(user => user._id);

  // Find chats where these users are participants
  const chatsByParticipant = await ChatModel.find({
    users: { $in: userIds }
  })
    .populate('users')
    .populate('messages')
    .exec();

  // Find messages containing the search term
  const messagesByContent = await TextMessageModel.find({
    text: { $regex: searchRegex }
  }).exec();

  // Get chat IDs from these messages
  const chatIdsByMessage = [...new Set(messagesByContent.map(message => message.chatId))];

  // Find chats by these IDs
  const chatsByMessage = await ChatModel.find({
    _id: { $in: chatIdsByMessage }
  })
    .populate('users')
    .populate('messages')
    .exec();

  // Combine results and remove duplicates
  const allChats = [...chatsByName, ...chatsByParticipant, ...chatsByMessage];

  // Remove duplicates by creating a Map with chat ID as key
  const uniqueChats = new Map();

  for (const chat of allChats) {
    if (!uniqueChats.has(chat._id.toString())) {
      uniqueChats.set(chat._id.toString(), chat);
    }
  }

  // Format the results to match the expected return type
  const results = [];

  for (const chat of uniqueChats.values()) {
    const chatData = {
      chatId: chat._id.toString(),
      userId: null,
      messages: chat.messages.map(message => ({
        ...message.toJSON(),
        isPersonal: false, // We don't have the current user ID here to determine if it's personal
      })),
      name: chat.name || (chat.users.length > 0 ? chat.users.map(user => user.username).join(', ') : ''),
      lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : null,
      lastMessageTimestamp: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].sentAt : null,
      username: null,
    };

    results.push(chatData);
  }

  return results;
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
