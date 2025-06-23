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

  const results = [];

  for (const item of [...chats, ...prospectiveChatUsers]) {


    let chatName = '';

    if (item.chatId) {
      const participantIdsNoCurrent = item.users.filter(
        (userId) => userId !== user.userId,
      );

      const chatParticipantsNoCurrent = await UserRepository.findAllById(
        participantIdsNoCurrent,
      );

      chatName = chatParticipantsNoCurrent
        .map((user) => user.username)
        .join(', ');
    }
    else {
      chatName = item.username;
    }

    const messages = await MessageRepository.findAllByChatId(item.chatId);

    const shared = {
      chatId: null,
      messages,
      lastMessage: messages.length > 0 ? messages.at(-1).text : null,
      name: chatName,
      ...item,
    };

    results.push(shared);
  }

  return results;
};

/**
 * @param currentUser
 * @param userData {{userId: string}}
 * @return {Promise<*|Awaited<*>>}
 */
const initializeChatForCurrentUser = async (currentUser, userData) => {
  const usersIds = [currentUser.userId, userData.userId];

  const chat = await ChatRepository.createChat({
    participantsIds: usersIds,
  });

  const data = {
    ...chat,
    name: 'Test',
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
    participantsIds: data.usersIds,
    name: '',
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
      text: data.message,
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

/**
 * Get a chat by its ID, including messages and chat name
 * @param {string} chatId - The ID of the chat to retrieve
 * @return {Promise<{chatId: string, users: string[], messages: Array, name: string, lastMessage: string|null}>} - The chat with messages and name
 */
const getChat = async (chatId) => {
  const chat = await ChatRepository.findById(chatId);

  if (!chat) {
    return null;
  }

  // Get all participants' usernames to create the chat name
  const chatParticipants = await UserRepository.findAllById(chat.users);
  const chatName = chatParticipants
    .map((user) => user.username)
    .join(', ');

  // Get messages for the chat
  const messages = await MessageRepository.findAllByChatId(chatId);

  // Return the chat with additional information
  return {
    ...chat,
    messages,
    lastMessage: messages.length > 0 ? messages.at(-1).text : null,
    name: chatName,
  };
};

const sendChatMessage = async (sender, data) => {
  await MessageRepository.createMessage({
    chatId: data.chatId,
    text: data.message,
  });

  const chat = await ChatRepository.findById(data.chatId);

  const chats = await ChatRepository.getChatsByParticipants(sender);

  const chatParticipantsNoSender = chat.users.filter((userId) => {
    return userId !== sender.userId;
  });

  const connections = await ConnectionService.getAllConnectionsByUserIds(
    chatParticipantsNoSender,
  );

  const result = {
    chats: [],
  };

  for (const item of chats) {
    const messages = await MessageRepository.findAllByChatId(item.chatId);

    const shared = {
      ...item,
      messages,
      lastMessage: messages.length > 0 ? messages.at(-1).text : null,
      name: 'Test Name',
    };

    if (chat.chatId === item.chatId) {
      result.chatId = item.chatId;
      result.chat = { ...item, ...shared };
    }

    result.chats.push({ ...item, ...shared });
  }

  connections.forEach((con) => {
    con.ws.send(
      JSON.stringify({
        event: ServerChatEventEnum.MESSAGE,
        data: result,
      }),
    );
  });

  return result;
};

module.exports = {
  createChat,
  sendChatMessage,
  sendMessageToExistingChat,
  initializeChatForCurrentUser,
  getUserChats,
  getChat,
};
