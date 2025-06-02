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

/**
 * @param currentUser
 * @param userData {{userId: string}}
 * @return {Promise<*|Awaited<*>>}
 */
const initializeChatForCurrentUser = async (currentUser, userData) => {
  const participants = [currentUser.id, userData.userId];

  const chat = await ChatRepository.createChat({
    participants,
  });

  const data = {
    ...chat,
    messages: [],
  };

  return data;
};

const getChat = () => {};
module.exports = {
  initializeChatForCurrentUser,
  getUserChats,
};
