const UserService = require('../service/user.service');
const ChatService = require('../service/chat.service');

const createUser = async (req, res) => {
  const { username } = req.body;

  const exists = await UserService.checkUserExists(username);

  const user = await UserService.signUpUser(username);

  //TODO: Add handling for scneario when user does not exist

  if (user) {
    req.session.user = user;
  }

  if (!exists) {
    await ChatService.createNewChatForAllUsers(user.userId);
  }

  return res.json({ data: user }).status(200);
};

module.exports = {
  createUser,
};
