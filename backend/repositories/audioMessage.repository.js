const { AudioMessageModel } = require('../models/audioMessage.model');

/**
 * Create a new audio message
 * @param {Object} audioMessageData - The audio message data
 * @param {string} audioMessageData.chatId - The ID of the chat
 * @param {string} audioMessageData.userId - The ID of the user who sent the message
 * @param {string} audioMessageData.audioUrl - The URL of the audio file
 * @param {number} audioMessageData.audioDuration - The duration of the audio in seconds
 * @param {string} audioMessageData.audioFormat - The format of the audio file
 * @param {number} audioMessageData.fileSize - The size of the audio file in bytes
 * @param {string} audioMessageData.originalFileName - The original filename of the uploaded file
 * @return {Promise<Object>} - The created audio message
 */
const createAudioMessage = (audioMessageData) => {
  const audioMessage = new AudioMessageModel(audioMessageData);
  return audioMessage.save();
};

/**
 * Find audio messages by chat ID
 * @param {string} chatId - The ID of the chat
 * @return {Promise<Object[]>} - Array of audio messages for the chat
 */
const findByChatId = (chatId) => {
  return AudioMessageModel.find({ chatId }).sort({ sentAt: -1 }).exec();
};

/**
 * Find audio messages by user ID
 * @param {string} userId - The ID of the user
 * @return {Promise<Object[]>} - Array of audio messages by the user
 */
const findByUserId = (userId) => {
  return AudioMessageModel.find({ userId }).sort({ sentAt: -1 }).exec();
};

/**
 * Find audio messages by chat and user IDs
 * @param {string} chatId - The ID of the chat
 * @param {string} userId - The ID of the user
 * @return {Promise<Object[]>} - Array of audio messages
 */
const findByChatAndUserId = (chatId, userId) => {
  return AudioMessageModel.find({ chatId, userId }).sort({ sentAt: -1 }).exec();
};

/**
 * Find an audio message by its ID
 * @param {string} audioMessageId - The ID of the audio message
 * @return {Promise<Object|null>} - The found audio message or null
 */
const findById = (audioMessageId) => {
  return AudioMessageModel.findById(audioMessageId).exec();
};

/**
 * Delete an audio message by its ID
 * @param {string} audioMessageId - The ID of the audio message
 * @return {Promise<Object|null>} - The deleted audio message or null
 */
const deleteById = (audioMessageId) => {
  return AudioMessageModel.findByIdAndDelete(audioMessageId).exec();
};

/**
 * Update an audio message by its ID
 * @param {string} audioMessageId - The ID of the audio message
 * @param {Object} updateData - The data to update
 * @return {Promise<Object|null>} - The updated audio message or null
 */
const updateById = (audioMessageId, updateData) => {
  return AudioMessageModel.findByIdAndUpdate(
    audioMessageId,
    updateData,
    { new: true }
  ).exec();
};

/**
 * Get audio messages with pagination
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Number of items per page (default: 10)
 * @param {Object} options.filter - Filter criteria
 * @return {Promise<{audioMessages: Object[], total: number, page: number, pages: number}>} - Paginated audio messages
 */
const getAudioMessagesWithPagination = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    filter = {}
  } = options;

  const skip = (page - 1) * limit;

  const [audioMessages, total] = await Promise.all([
    AudioMessageModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    AudioMessageModel.countDocuments(filter)
  ]);

  const pages = Math.ceil(total / limit);

  return {
    audioMessages,
    total,
    page,
    pages
  };
};

/**
 * Get audio message statistics
 * @return {Promise<Object>} - Audio message statistics
 */
const getAudioMessageStats = async () => {
  const stats = await AudioMessageModel.aggregate([
    {
      $group: {
        _id: null,
        totalAudioMessages: { $sum: 1 },
        totalFileSize: { $sum: '$fileSize' },
        averageDuration: { $avg: '$audioDuration' },
        averageFileSize: { $avg: '$fileSize' }
      }
    }
  ]);

  return stats[0] || {
    totalAudioMessages: 0,
    totalFileSize: 0,
    averageDuration: 0,
    averageFileSize: 0
  };
};

module.exports = {
  createAudioMessage,
  findByChatId,
  findByUserId,
  findByChatAndUserId,
  findById,
  deleteById,
  updateById,
  getAudioMessagesWithPagination,
  getAudioMessageStats,
};
