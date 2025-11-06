const UserService = require('../service/user.service');
const ChatService = require('../service/chat.service');

const createUser = async (req, res) => {
  const { username } = req.body;

  const user = await UserService.signUpUser(username);

  if (user) {
    req.session.user = user.toJSON();
  }

  await ChatService.createNewChatForAllUsers(user._id);

  return res.json({ data: user.toJSON() }).status(200);
};

module.exports = {
  createUser,
};
