const ChatRepository = require('../repositories/chat.repository');
const UserRepository = require('../repositories/user.repository');
const MessageRepository = require('../repositories/message.repository');
const UserService = require('./user.service');
const ConnectionService = require('./connection.service');
const MessageService = require('../service/message.service');
const ServerChatEventEnum = require('../enums/ServerChatEventEnum');

const getUserChats = async (userId) => {
  const chats = await ChatRepository.findAllChatsByUsersIds([userId]);

  const prospectiveChatUsers =
    await UserRepository.getUsersWithoutChatWithUser(userId);

  const results = [];

  for (const item of [...chats, ...prospectiveChatUsers]) {
    let chatName = '';

    if (item.chatId) {
      const participantIdsNoCurrent = item.users.filter(
        (participantId) => participantId !== userId,
      );

      const chatParticipantsNoCurrent = await UserRepository.findAllById(
        participantIdsNoCurrent,
      );

      chatName = chatParticipantsNoCurrent
        .map((user) => user.username)
        .join(', ');
    } else {
      chatName = item.username;
    }

    const messages = await MessageService.getChatMessagesForUser(
      userId,
      item.chatId,
    );

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
 * @param firstUser {{userId: string}}
 * @param secondUser {{userId: string}}
 * @return {Promise<*|Awaited<*>>}
 */
const initializeChatForCurrentUser = async (firstUser, secondUser) => {
  const usersIds = [firstUser.userId, secondUser.userId];

  let chat = await ChatRepository.findByUsersIds(usersIds);

  if (!chat) {
    chat = await ChatRepository.createChat({
      participantsIds: usersIds,
    });
  }

  const connections = await ConnectionService.getAllConnectionsByUserIds([
    secondUser.userId,
  ]);

  const chats = await getUserChats(secondUser.userId);

  for (const con of connections) {
    const conChats = await getUserChats(con.userId);

    con.ws.send(
      JSON.stringify({
        event: ServerChatEventEnum.CHAT_CREATED,
        data: conChats,
      }),
    );
  }

  return {
    ...chat,
    name: 'Test',
    messages: [],
  };
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
    participantsIds: data.usersIds,
    name: '',
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

  // Get all participants' usernames to create the chat name
  const chatParticipants = await UserRepository.findAllById(chat.users);
  const chatName = chatParticipants.map((user) => user.username).join(', ');

  // Get messages for the chat
  const messages = await MessageRepository.findAllByChatId(chatId);

  // Return the chat with additional information
  return {
    ...chat,
    messages,
    lastMessage: messages.length > 0 ? messages.at(-1).text : null,
    lastMessageTimestamp:
      messages.length > 0 ? messages.at(-1).createdTimestamp : null,
    name: chatName,
  };
};

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
    chat,
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
          chats: conChats,
        },
      }),
    );
  }

  return result;
};

const getFilteredChats = async (search) => {
  return ChatRepository.findByUserNameOrChatNameOrMessage(search);
};

module.exports = {
  getFilteredChats,
  createChat,
  sendChatMessage,
  initializeChatForCurrentUser,
  getUserChats,
  getChat,
};
