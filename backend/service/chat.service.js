const ChatRepository = require('../repositories/chat.repository');
const UserRepository = require('../repositories/user.repository');
const ConnectionRepository = require('../repositories/connection.repository');
const TextMessageRepository = require('../repositories/textMessage.repository');
const AudioMessageRepository = require('../repositories/audioMessage.repository');
const ConnectionService = require('./connection.service');
const ServerChatEventEnum = require('../enums/ServerChatEventEnum');

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

const notifyUsersOnNewChat = async (authenticatedUserId) => {
  const connections =
    await ConnectionService.getAllConnectionsNoCurrent(authenticatedUserId);

  for (const con of connections) {
    const chats = await getUserChats(con.userId);

    con.ws.send(
      JSON.stringify({
        event: ServerChatEventEnum.NEW_USER,
        data: chats,
      }),
    );
  }
};

const createNewChatForAllUsers = async (userId) => {
  const chats = await ChatRepository.createChatForUsers(userId);

  notifyUsersOnNewChat(userId);

  return chats;
};

const getUserChats = async (userId) => {
  const chats = await ChatRepository.findAllChatsByUsersIds([userId]);

  const connections = await ConnectionRepository.getAllConnections({
    userId: 1,
    _id: 0,
  });

  const onlineUsersIds = connections.map(({ userId }) => userId);

  const results = [];

  for (const item of chats) {
    const otherUserId = item.users.find((user) => user.id !== userId)._id;

    const messages = item.messages.map((item) => ({
      ...item.toJSON(),
      isPersonal: item.userId.toString() === userId,
    }));

    const online = onlineUsersIds.some(
      (id) => id.toString() === otherUserId.toString(),
    );

    const name = item.users.find(
      (user) => user._id.toString() !== userId,
    )?.username;

    results.push({
      online,
      lastMessage: null,
      ...item.toJSON(),
      messages,
      name,
    });
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
  await TextMessageRepository.createTextMessage({
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
 * Send a voice message from a user to a chat
 * @param {Object} sender - The user sending the message
 * @param {string} sender.userId - The ID of the user sending the message
 * @param {Object} data - The message data
 * @param {string} data.chatId - The ID of the chat to send the message to
 * @param {string} data.audioUrl - The URL of the uploaded audio file
 * @param {number} data.audioDuration - The duration of the audio in seconds
 * @param {string} data.audioFormat - The format of the audio file
 * @param {number} data.fileSize - The size of the audio file in bytes
 * @param {string} data.originalFileName - The original filename of the uploaded file
 * @return {Promise<{chatId: string, chat: Object, chats: Array}>} - The updated chat information
 */
const sendVoiceMessage = async (sender, data) => {
  // Create the audio message record directly
  const audioMessage = await AudioMessageRepository.createAudioMessage({
    chatId: data.chatId,
    userId: sender.userId,
    audioUrl: data.audioUrl,
    audioDuration: data.audioDuration,
    audioFormat: data.audioFormat || 'webm',
    fileSize: data.fileSize || 0,
    originalFileName: data.originalFileName || 'audio.webm',
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

  const connections = await ConnectionRepository.getAllConnections({
    userId: 1,
    _id: 0,
  });

  const onlineUsersIds = connections.map(({ userId }) => userId);

  const results = [];

  for (const item of chats) {
    const otherUserId = item.users.find((user) => user.id !== userId)._id;

    const messages = item.messages.map((item) => ({
      ...item.toJSON(),
      isPersonal: item.userId.toString() === userId,
    }));

    const online = onlineUsersIds.some(
      (id) => id.toString() === otherUserId.toString(),
    );

    const name = item.users.find(
      (user) => user._id.toString() !== userId,
    )?.username;

    results.push({
      online,
      lastMessage: null,
      ...item.toJSON(),
      messages,
      name,
    });
  }

  return results;
};

/**
 * Get all users who are participants in a specific chat
 * @param {string} chatId - The ID of the chat
 * @return {Promise<Array<{userId: string, username: string, createdTimestamp: number}>>} - Array of users participating in the chat
 */
const getUsersByChatId = async (chatId) => {
  const chat = await ChatRepository.findById(chatId);

  if (!chat || !chat.users || chat.users.length === 0) {
    return [];
  }

  // Extract user IDs (handles both ObjectId and populated user objects)
  const userIds = chat.users.map((user) => {
    return user._id ? user._id.toString() : user.toString();
  });
  // Fetch the actual user documents
  return UserRepository.findAllById(userIds);
};

module.exports = {
  getUsersByChatId,
  getFilteredChats,
  createChat,
  sendChatMessage,
  sendVoiceMessage,
  initializeChatForCurrentUser,
  getUserChats,
  getChat,
  createNewChatForAllUsers,
};
