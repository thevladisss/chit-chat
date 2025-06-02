const { v4 } = require('uuid');
/**

 * @type {Map<string, {
 *   chatId: string
 *   users: string[]
 *   createdTimestamp: number
 * }>}
 */
const chatModel = new Map();

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
  const chats = [...chatModel.values()];

  const result = chats.filter((chat) => {
    return chat.users.includes(user.userId);
  });

  return Promise.resolve(result);
};

/**
 *
 * @param data {
 *   {
 *     participants: User[],
 *   }
 * }
 *
 */
const createChat = (data) => {
  const chatId = v4();

  const chat = {
    chatId,
    users: data.participants.map(({ id }) => id),
    createdTimestamp: Date.now(),
  };

  chatModel.set(chatId, chat);

  return Promise.resolve(chat);
};

module.exports = {
  chatModel,

  createChat,
  getChatsByParticipants,
};
