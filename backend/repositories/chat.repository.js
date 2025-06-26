const { v4 } = require('uuid');
const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const MessageRepository = require('./message.repository');
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
 * @param usersIds {number[]}
 * @return {Promise<Promise<void> | Promise<Awaited<any[]>>>}
 */
const findAllChatsByUsersIds = async (usersIds) => {
  const chats = [...Chat.values()];

  const result = chats.filter((chat) => {
    return usersIds.every((userId) => chat.users.includes(userId));
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
};

/**
 * Find a chat by its ID
 * @param {string} chatId - The ID of the chat to find
 * @return {Promise<{chatId: string, users: string[], createdTimestamp: number}|undefined>} - The found chat or undefined
 */
const findById = (chatId) => {
  const chat = Chat.get(chatId);
  return Promise.resolve(chat);
};

/**
 * Finds chats with all users
 * @param usersIds
 * @return {any}
 */
const findByUsersIds = (usersIds) => {
  return Promise.resolve(
    [...Chat.values()].find((chat) => {
      return usersIds.every((userId) => chat.users.includes(userId));
    }),
  );
};

/**
 * Finds all chats containing search value in either username of one of participants,
 * message text, or chat name
 * @param search
 * @return {Promise<any[]>}
 */
const findByUserNameOrChatNameOrMessage = async (search) => {
  let chats = [...Chat.values()];

  for (const chat of chats) {
    const users = [
      ...User.values().filter((user) => {
        return chat.users.includes(user.userId);
      }),
    ];
    const messages = await MessageRepository.findAllByChatId(chat.chatId);

    chat.users = users;
    chat.messages = messages;
  }

  //TODO: Add filter by chat name
  return chats.filter((chat) => {
    return (
      chat.users.some(({ username }) => username === search) ||
      chat.messages.some(({ text }) => text.includes(search))
    );
  });
};

module.exports = {
  Chat,

  findByUserNameOrChatNameOrMessage,
  findAllChatsByUsersIds,
  findByUsersIds,
  getAllChats,
  createChat,
  getChatsByParticipants,
  findById,
};
