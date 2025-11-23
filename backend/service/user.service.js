const UserRepository = require('../repositories/user.repository');
const ConnectionRepository = require('../repositories/connection.repository');

/**
 *
 * @param username
 * @return {Promise<import("mongoose").Document>}
 */
const signUpUser = async (username) => {
  return UserRepository.createOrFindFirstUser(username);
};

const checkUserExists = (username) => {
  return UserRepository.existsByUsername(username);
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
  signUpUser,
  checkUserExists,
};
