const { v4 } = require('uuid');
const Chat = require('../models/chat.model');
/**

 * @type {Map<string, {
 *   chatId: string
 *   users: string[]
 *   createdTimestamp: number
 * }>}
 */

/**
 *
 * @param user {
 *   {
 *     userId: string
 *     createdTimestamp: string
 *   }
 *  }
 * @return {Promise<Awaited<{chatId: string, users: string[], createdTimestamp: string}[]>>}
 */
const getChatsByParticipants = async (user) => {
  const chats = [...Chat.values()];

  const result = chats.filter((chat) => {
    return chat.users.includes(user.userId);
  });

  return Promise.resolve(result);
};

/**
 *
 * @param data {
 *   {
 *     participantsIds: number[],
 *   }
 * }
 *
 */
const createChat = (data) => {
  const chatId = v4();

  const chat = {
    chatId,
    users: data.participantsIds,
    createdTimestamp: Date.now(),
  };

  Chat.set(chatId, chat);

  return Promise.resolve(chat);
};

const getAllChats = () => {
  return Promise.resolve([...Chat.values()]);
}

/**
 * Find a chat by its ID
 * @param {string} chatId - The ID of the chat to find
 * @return {Promise<{chatId: string, users: string[], createdTimestamp: number}|undefined>} - The found chat or undefined
 */
const findById = (chatId) => {
  const chat = Chat.get(chatId);
  return Promise.resolve(chat);
};

module.exports = {
  Chat,

  getAllChats,
  createChat,
  getChatsByParticipants,
  findById,
};
