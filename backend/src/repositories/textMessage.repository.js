const { TextMessageModel } = require('../models/textMessage.model');

/**
 * Create a new text message
 * @param {Object} messageData - The message data
 * @param {string} messageData.chatId - The ID of the chat the message belongs to
 * @param {string} messageData.text - The message text
 * @param {string} messageData.userId - The ID of the user who sent the message
 * @return {Promise<{messageId: string, chatId: string, text: string, userId: string, sentAt: number, isSeen: boolean}>} - The created message
 */
const createTextMessage = ({ chatId, text, userId }) => {
  const messageData = {
    chatId,
    userId,
    text,
    sentAt: Date.now(),
    isSeen: false,
  };

  const message = new TextMessageModel(messageData);
  return message.save();
};

/**
 * Find text messages by chat ID
 * @param {string} chatId - The ID of the chat to find messages for
 * @return {Promise<Array<{messageId: string, chatId: string, text: string, sentAt: number, isSeen: boolean}>>} - Array of messages for the chat
 */
const findAllByChatId = (chatId) => {
  return TextMessageModel.find({ chatId }).sort({ sentAt: -1 }).exec();
};

/**
 * Find a text message by its ID
 * @param {string} messageId - The ID of the message to find
 * @return {Promise<{messageId: string, chatId: string, text: string, sentAt: number, isSeen: boolean}|undefined>} - The found message or undefined
 */
const findById = (messageId) => {
  return TextMessageModel.findById(messageId).exec();
};

/**
 * Find text messages by user ID
 * @param {string} userId - The ID of the user
 * @return {Promise<Array<{messageId: string, chatId: string, text: string, sentAt: number, isSeen: boolean}>>} - Array of messages by the user
 */
const findByUserId = (userId) => {
  return TextMessageModel.find({ userId }).sort({ sentAt: -1 }).exec();
};

/**
 * Find text messages by chat and user IDs
 * @param {string} chatId - The ID of the chat
 * @param {string} userId - The ID of the user
 * @return {Promise<Array<{messageId: string, chatId: string, text: string, sentAt: number, isSeen: boolean}>>} - Array of messages
 */
const findByChatAndUserId = (chatId, userId) => {
  return TextMessageModel.find({ chatId, userId }).sort({ sentAt: -1 }).exec();
};

/**
 * Update a text message by its ID
 * @param {string} messageId - The ID of the message
 * @param {Object} updateData - The data to update
 * @return {Promise<{messageId: string, chatId: string, text: string, sentAt: number, isSeen: boolean}|null>} - The updated message or null
 */
const updateById = (messageId, updateData) => {
  return TextMessageModel.findByIdAndUpdate(messageId, updateData, { new: true }).exec();
};

/**
 * Delete a text message by its ID
 * @param {string} messageId - The ID of the message
 * @return {Promise<{messageId: string, chatId: string, text: string, sentAt: number, isSeen: boolean}|null>} - The deleted message or null
 */
const deleteById = (messageId) => {
  return TextMessageModel.findByIdAndDelete(messageId).exec();
};

module.exports = {
  createTextMessage,
  findAllByChatId,
  findById,
  findByUserId,
  findByChatAndUserId,
  updateById,
  deleteById,
};
