const ChatRepository = require('../repositories/chat.repository');
const getUserChats = async (user) => {
  const chats = await ChatRepository.getUserChats(user);

  return chats;
};

module.exports = {
  getUserChats,
};
