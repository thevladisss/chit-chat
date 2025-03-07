const ChatRepository = require('../repositories/chat.repository');
const UserRepository = require('../repositories/user.repository');
const getUserChats = async (user) => {
  const chats = await ChatRepository.getChatsByParticipants(user);

  const prospectiveChatUsers =
    await UserRepository.getUsersWithoutChatWithUser(user);

  return {
    chats,
    prospectiveChats: prospectiveChatUsers,
  };
};

module.exports = {
  getUserChats,
};
