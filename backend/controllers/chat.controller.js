const ChatService = require('../service/chat.service');
const ChatMessageTypeEnum = require('../enums/ChatMessageType');

const getAllChats = async (req, res) => {
  const user = req.session.user;

  const data = await ChatService.getUserChats(user.id);

  return res
    .json({
      data,
    })
    .status(200);
};

const initializeChat = async (req, res) => {
  const secondUserId = req.body.userId;

  const user = req.session.user;

  const chat = await ChatService.initializeChatForCurrentUser(
    user.id,
    secondUserId,
  );

  const chats = await ChatService.getUserChats(user.id);

  return res.json({
    data: {
      chatId: chat.chatId,
      chats: chats,
    },
  });
};

const getChat = async (req, res) => {
  const { chatId } = req.params;

  const result = await ChatService.getChat(chatId);

  return res.json({
    data: result,
  });
};

const getFilteredChats = async (req, res) => {
  const user = req.session.user;

  /**
   * @var {string} search
   */
  const search = req.query.search;

  let chats;

  if (!search) {
    chats = await ChatService.getUserChats(user.id);
  } else {
    chats = await ChatService.getFilteredChats(user.id, search);
  }

  return res.json({
    data: chats,
  });
};

const sendMessage = async (req, res) => {
  /** @var  {{chatId: string; type: string }} req.params */
  const { chatId, type } = req.params;

  /** @var {{message: string, audioUrl: string, audioDuration: number}} req.body */
  const body = req.body;

  const user = req.session.user;

  let result;

  if (type === ChatMessageTypeEnum.TEXT) {
    result = await ChatService.sendChatMessage(user, {
      chatId: chatId,
      message: body.message,
    });
  } else if (type === ChatMessageTypeEnum.AUDIO) {
    result = await ChatService.sendVoiceMessage(user, {
      chatId: chatId,
      audioUrl: body.audioUrl,
      audioDuration: body.audioDuration,
      audioFormat: body.audioFormat,
      fileSize: body.fileSize,
      originalFileName: body.originalFileName,
    });
  } else {
    return res.status(400).json({
      error: `Invalid message type. Must be "${ChatMessageTypeEnum.TEXT}" or "${ChatMessageTypeEnum.AUDIO}"`,
    });
  }

  return res.json({
    data: result,
  });
};

module.exports = {
  sendMessage,
  getFilteredChats,
  initializeChat,
  getChat,
  getAllChats,
};
