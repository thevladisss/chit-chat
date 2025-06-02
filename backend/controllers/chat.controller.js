const ChatService = require('../service/chat.service');
const getOnlineUsers = async (req, res) => {
  const user = req.session.user;

  const data = await ChatService.getUserChats(user);

  return res
    .json({
      data,
    })
    .status(200);
};

const getMessagesHistory = async (req, res) => {};

const initializeChat = async (req, res) => {
  const body = req.body;

  const chat = await ChatService.initializeChatForCurrentUser(
    req.session.user,
    body,
  );

  return res.json({
    data: chat,
  });
};

const getChat = async (req, res) => {
  const { chatId } = req.params;

  const chat = await ChatService.getChat(chat);

  return res.json({
    data: chat,
  });
};

const getFilteredChats = async (req, res) => {
  /**
   * @var {{value: string}} body
   */
  const body = req.body;

  const chats = await ChatService.getFilteredChats(body.value);

  return res.json({
    data: chats,
  });
};

module.exports = {
  getFilteredChats,
  initializeChat,
  getChat,
  getOnlineUsers,
};
