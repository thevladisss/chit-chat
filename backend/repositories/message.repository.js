const { MessageModel } = require('../models/message.model');

/**
 * Create a new message
 * @param {Object} messageData - The message data
 * @param {string} messageData.chatId - The ID of the chat the message belongs to
 * @param {string} messageData.text - The message text
 * @param {string} messageData.userId - The ID of the user who sent the message
 * @return {Promise<{messageId: string, chatId: string, text: string, userId: string, sentAt: number, isSeen: boolean}>} - The created message
 */
const createMessage = ({ chatId, text, userId }) => {
  const message = new MessageModel({
    chatId,
    text,
    userId,
    sentAt: Date.now(),
    isSeen: false,
  });

  return message.save();
};
/**
 * Find messages by chat ID
 * @param {string} chatId - The ID of the chat to find messages for
 * @return {Promise<Array<{messageId: string, chatId: string, message: string, sentAt: number, isSeen: boolean}>>} - Array of messages for the chat
 */
const findAllByChatId = (chatId) => {
  return MessageModel.find({ chatId }).exec();
};

/**
 * Find a message by its ID
 * @param {string} messageId - The ID of the message to find
 * @return {Promise<{messageId: string, chatId: string, message: string, sentAt: number, isSeen: boolean}|undefined>} - The found message or undefined
 */
const findById = (messageId) => {
  return MessageModel.find({ _id: messageId }).exec();
};

module.exports = {
  findAllByChatId,
  createMessage,
  findById,
};
