const ChatRepository = require('../repositories/chat.repository');
const UserRepository = require('../repositories/user.repository');
const MessageRepository = require('../repositories/message.repository');
const UserService = require('./user.service');
const ConnectionService = require('./connection.service');
const ServerChatEventEnum = require('../enums/ServerChatEventEnum');

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

/**
 *
 * @param chatId {string}
 * @param data {
 *   message: string
 * }}
 * @return {Promise<void>}
 */
const sendMessageToExistingChat = async (chatId, data) => {};

/**
 *
 * @param data {{ usersIds: string[] }}
 * @return {Promise<{
 *   chatId: string
 * }>}
 */
const createChat = async (data) => {
  const chat = await ChatRepository.createChat({
    participants: data.usersIds,
  });

  return chat;
};

/**
 *
 * @param initiator {any}
 * @param data {{
 *   chatId?: string | null;
 *   userId?: string | null;
 *   message: string
 * }}
 * @return {Promise<void>}
 */
const sendMessageInNewOrExistingChat = async (initiator, data) => {
  if (data.chatId) {
    const message = await sendMessageToExistingChat(data.chatId, {
      message: data.message,
    });

    return message;
  } else {
    const usersIds = [initiator.userId, data.userId];

    const chat = await createChat({
      usersIds,
    });

    const message = await MessageRepository.createMessage({
      chatId: chat.chatId,
      message: data.message,
    });

    const connections =
      await ConnectionService.getAllConnectionsByUserIds(usersIds);

    connections.forEach((con) => {
      con.ws.send(
        JSON.stringify({
          event: ServerChatEventEnum.ROOM_JOIN_SUCCESS,
          data: {
            chatId: chat.chatId,
            messages: [message],
            participants: usersIds,
          },
        }),
      );
    });

    return message;
  }
};

const getChat = () => {};

module.exports = {
  sendMessageInNewOrExistingChat,
  createChat,
  sendMessageToExistingChat,
  initializeChatForCurrentUser,
  getUserChats,
};
