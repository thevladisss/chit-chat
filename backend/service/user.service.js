const UserRepository = require('../repositories/user.repository');

/**
 *
 * @param username
 * @return {Promise<import("mongoose").Document>}
 */
const signUpUser = async (username) => {
  return UserRepository.createOrFindFirstUser(username)
};


module.exports = {
  signUpUser,
};
