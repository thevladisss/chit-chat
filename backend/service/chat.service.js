const ChatRepository = require('../repositories/chat.repository');
const UserRepository = require('../repositories/user.repository');
const MessageRepository = require('../repositories/message.repository');
const UserService = require('./user.service');
const ConnectionService = require('./connection.service');
const MessageService = require('../service/message.service');
const ServerChatEventEnum = require('../enums/ServerChatEventEnum');
const { ChatModel } = require('../models/chat.model');
const { UserModel } = require('../models/user.model');

/**
 *
 * @param userId {string}
 * @return {Promise<{
 *   chatId: string | null;
 *   userId: string | null;
 *   messages: any[];
 *   name: string;
 *   lastMessage: string;
 *   lastMessageTimestamp: string;
 *   username: string | null;
 * }[]>}
 */
const getUserChats = async (userId) => {
  const chats = await ChatRepository.findAllChatsByUsersIds([userId]);

  const prospectiveChatters =
    await UserRepository.findUsersNotHavingChatWithUser(userId);

  const results = [];

  for (const item of [...chats, ...prospectiveChatters]) {
    const shared = {
      chatId: null,
      messages: [],
      lastMessage: null,
      ...item.toJSON(),
    };

    if (item instanceof ChatModel) {
      shared.messages = item.messages.map((item) => ({
        ...item.toJSON(),
        isPersonal: item.userId.toString() === userId,
      }));
      shared.name = item.users.find((user) => user.id !== userId)?.username;
    } else {
      shared.name = item.username;
    }

    results.push(shared);
  }

  return results;
};

/**
 *
 * @param initiatorUserId {string}
 * @param secondUserId {string}
 * @return {Promise<*>}
 */
const initializeChatForCurrentUser = async (initiatorUserId, secondUserId) => {
  const usersIds = [initiatorUserId, secondUserId];

  let chat = await ChatRepository.findByUsersIds(usersIds);

  if (!chat) {
    chat = await ChatRepository.createChat({
      usersIds,
    });
  }

  const connections = await ConnectionService.getAllConnectionsByUserIds([
    secondUserId,
  ]);

  for (const con of connections) {
    const chats = await getUserChats(con.userId);

    con.ws.send(
      JSON.stringify({
        event: ServerChatEventEnum.CHAT_CREATED,
        data: chats,
      }),
    );
  }

  return chat.toJSON();
};

/**
 *
 * @param data {{ usersIds: string[] }}
 * @return {Promise<{
 *   chatId: string
 * }>}
 */
const createChat = async (data) => {
  const chat = await ChatRepository.createChat({
    usersIds: data.usersIds,
  });

  return chat;
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

  const chatName = chat.users.map((user) => user.username).join(', ');

  // Return the chat with additional information
  return {
    ...chat.toJSON(),
    lastMessage: chat.lastMessage ? chat.lastMessage.text : null,
    lastMessageTimestamp: chat.lastMessage
      ? chat.lastMessage.createdTimestamp
      : null,

    name: chatName,
  };
};

/**
 * Send a chat message from a user to a chat
 * @param {Object} sender - The user sending the message
 * @param {string} sender.userId - The ID of the user sending the message
 * @param {Object} data - The message data
 * @param {string} data.chatId - The ID of the chat to send the message to
 * @param {string} data.message - The message text
 * @return {Promise<{chatId: string, chat: Object, chats: Array}>} - The updated chat information
 */
const sendChatMessage = async (sender, data) => {
  await MessageRepository.createMessage({
    chatId: data.chatId,
    text: data.message,
    userId: sender.userId,
  });

  const chat = await ChatRepository.findById(data.chatId);

  const chats = await getUserChats(sender.userId);

  const chatParticipantsNoSender = chat.users.filter((userId) => {
    return userId !== sender.userId;
  });

  const result = {
    chatId: chat.chatId,
    chat: chat.toJSON(),
    chats,
  };

  const connections = await ConnectionService.getAllConnectionsByUserIds(
    chatParticipantsNoSender,
  );

  for (const con of connections) {
    const conChats = await getUserChats(con.userId);

    con.ws.send(
      JSON.stringify({
        event: ServerChatEventEnum.MESSAGE,
        data: {
          sender: sender.userId,
          isSenderSelf: sender.userId === con.userId,
          chats: conChats,
        },
      }),
    );
  }

  return result;
};

/**
 *
 * @param userId {string}
 * @param search
 * @return {Promise<*[]>}
 */
const getFilteredChats = async (userId, search) => {
  const chats = await ChatRepository.findByUserNameOrChatNameOrMessage(search);

  const prospectiveChatters =
    await UserRepository.findUsersWhereUsernameContainsExcludingUserId(
      search,
      userId,
    );

  const results = [];

  for (const item of [...chats, ...prospectiveChatters]) {
    const shared = {
      chatId: null,
      messages: [],
      lastMessage: null,
      ...item.toJSON(),
    };

    if (item instanceof ChatModel) {
      shared.messages = item.messages.map((item) => ({
        ...item.toJSON(),
        isPersonal: item.userId.toString() === userId,
      }));
      shared.name = item.users.find((user) => user.id !== userId)?.username;
    } else {
      shared.name = item.username;
    }

    results.push(shared);
  }

  return results;
};

module.exports = {
  getFilteredChats,
  createChat,
  sendChatMessage,
  initializeChatForCurrentUser,
  getUserChats,
  getChat,
};
