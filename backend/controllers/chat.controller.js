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

const initializeChat = async (req, res) => {
  const body = req.body;

  const user = req.session.user;

  const chat = await ChatService.initializeChatForCurrentUser(user, body);

  const chats = await ChatService.getUserChats(user);

  return res.json({
    data: {
      chatId: chat.chatId,
      chat,
      chats,
    },
  });
};

const getChat = async (req, res) => {
  const { chatId } = req.params;

  const result = await ChatService.getChat(chatId);

  return res.json({
    data: result,
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

const sendMessage = async (req, res) => {
  /**
   * @var {{chatId?: string | null; userId?: string; message: string}} body
   */
  const body = req.body;

  const user = req.session.user;

  const result = await ChatService.sendChatMessage(user, {
    userId: body.userId,
    chatId: body.chatId,
    message: body.message,
  });


  return res.json({
    data: result,
  });
};

module.exports = {
  sendMessage,
  getFilteredChats,
  initializeChat,
  getChat,
  getOnlineUsers,
};
