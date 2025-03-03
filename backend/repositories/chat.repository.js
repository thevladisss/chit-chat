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
const db = new Map();
const getUserChats = async (user) => {
  const chats = [...db.values()];

  return chats.filter((chat) => {
    return chat.users.includes(user.userId);
  });
};

module.exports = {
  getUserChats,
};
