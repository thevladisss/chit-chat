const UserRepository = require('../repositories/user.repository');

const signUpUser = async (username) => {
  return UserRepository.createOrFindFirstUser(username)
};


module.exports = {
  signUpUser,
};
