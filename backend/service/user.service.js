const UserRepository = require('../repositories/user.repository');
const { mapUserToResponse } = require('../mappers/user.mapper');

/**
 *
 * @param username
 * @return {Promise<{id: string, userId: string, username: string, createdTimestamp: number}>}
 */
const signUpUser = async (username) => {
  const user = await UserRepository.createOrFindFirstUser(username);
  return mapUserToResponse(user);
};

const checkUserExists = (username) => {
  return UserRepository.existsByUsername(username);
};

module.exports = {
  signUpUser,
  checkUserExists,
};
