const UserRepository = require('../repositories/user.repository');

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

module.exports = {
  signUpUser,
  checkUserExists,
};
