/**
 * @param user {
 *   {
 *     userId: string
 *     createdTimestamp: string
 *   }
 *  }
 * @type {Map<string, {
 *   chatId: string
 *   users: string[]
 *   createdTimestamp: string
 * }>}
 */
const chatModel = new Map();
const getChatsByParticipants = async (user) => {
  const chats = [...chatModel.values()];

  const result = chats.filter((chat) => {
    return chat.users.includes(user.userId);
  });

  return Promise.resolve(result);
};

module.exports = {
  chatModel,
  getChatsByParticipants,
};
