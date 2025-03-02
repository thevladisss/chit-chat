/**
 *
 * @type {Map<string, {
 *   chatId: string
 *   userId: string
 *   createdTimestamp: string
 * }>}
 */
const db = new Map();
const getUserChats = async () => {
  const chats = [...db.values()];
};
