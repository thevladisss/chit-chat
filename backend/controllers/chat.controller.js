const ChatService = require('../service/chat.service');
const getOnlineUsers = async (req, res) => {
  const user = req.session.user;

  const chats = await ChatService.getUserChats(user);

  return res
    .json({
      data: chats,
    })
    .status(200);
};

const getMessagesHistory = async (req, res) => {};

module.exports = {
  getOnlineUsers,
};
