const { v4 } = require('uuid');
const { messageModel } = require('../models/message.model');
/**
 *
 * @type {Map<string, {
 *   messageId: string,
 *   chatId: string,
 *   userId: string,
 *   text: string
 *   createdTimestamp: string
 * }>}
 */

const createMessage = ({ chatId, message }) => {
  const messageId = v4();

  const messageEntity = {
    chatId,
    messageId,
    message,
    sentAt: Date.now(),
    isSeen: false,
  };

  messageModel.set(messageId, messageEntity);

  return messageEntity;
};
const getMessagesByChatId = (chatId) => {};
const getMessagesByChatAndUserId = (chatId, userId) => {};

module.exports = { createMessage };
