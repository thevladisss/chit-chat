const ChatService = require('../service/chat.service');
const ChatMessageTypeEnum = require('../enums/ChatMessageType');

/**
 * Returns all chats where signed in user is a participant
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
const getAllChats = async (req, res) => {
  const user = req.session.user;

  const data = await ChatService.getUserChats(user.id);

  return res
    .json({
      data,
    })
    .status(200);
};

/**
 * Returns one signle chat by its ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
const getChat = async (req, res) => {
  const { chatId } = req.params;

  const result = await ChatService.getChat(chatId);

  return res.json({
    data: result,
  });
};

/**
 * Returns chats filtered by name, message or name of its participants
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
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

/**
 * Send text or voice message to the chat
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
const sendMessage = async (req, res) => {
  /** @var  {{chatId: string; type: string }} req.params */
  const { chatId } = req.params;

  /** @var {{message: string, audioUrl: string, audioDuration: number}} req.body */
  const body = req.body;

  const user = req.session.user;

  let result;

  if (body.type === ChatMessageTypeEnum.TEXT) {
    result = await ChatService.sendChatMessage(user, {
      chatId: chatId,
      message: body.message,
    });
  } else if (body.type === ChatMessageTypeEnum.AUDIO) {
    result = await ChatService.sendVoiceMessage(user, {
      chatId: chatId,
      audioUrl: body.audioUrl,
      audioDuration: body.audioDuration,
      audioFormat: body.audioFormat,
      fileSize: body.fileSize,
      originalFileName: body.originalFileName,
    });
  }

  return res.json({
    data: result,
  });
};

module.exports = {
  sendMessage,
  getFilteredChats,
  getChat,
  getAllChats,
};
