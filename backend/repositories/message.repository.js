const { v4 } = require('uuid');
const Message = require('../models/message.model');
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

const createMessage = ({ chatId, text, userId }) => {
  const messageId = v4();

  const messageEntity = {
    chatId,
    messageId,
    text,
    userId: userId,
    sentAt: Date.now(),
    isSeen: false,
  };

  Message.set(messageId, messageEntity);

  return messageEntity;
};
/**
 * Find messages by chat ID
 * @param {string} chatId - The ID of the chat to find messages for
 * @return {Promise<Array<{messageId: string, chatId: string, message: string, sentAt: number, isSeen: boolean}>>} - Array of messages for the chat
 */
const findAllByChatId = (chatId) => {
  const messages = [...Message.values()].filter(
    (message) => message.chatId === chatId,
  );
  return Promise.resolve(messages);
};
const getMessagesByChatAndUserId = (chatId, userId) => {};

/**
 * Find a message by its ID
 * @param {string} messageId - The ID of the message to find
 * @return {Promise<{messageId: string, chatId: string, message: string, sentAt: number, isSeen: boolean}|undefined>} - The found message or undefined
 */
const findById = (messageId) => {
  const message = Message.get(messageId);
  return Promise.resolve(message);
};

module.exports = {
  findAllByChatId,
  createMessage,
  findById,
};
