const ChatService = require('../service/chat.service');

const getAllChats = async (req, res) => {
  const user = req.session.user;

  const data = await ChatService.getUserChats(user.id);

  return res
    .json({
      data,
    })
    .status(200);
};

const initializeChat = async (req, res) => {
  const secondUserId = req.body.userId;

  const user = req.session.user;

  const chat = await ChatService.initializeChatForCurrentUser(
    user.id,
    secondUserId,
  );

  const chats = await ChatService.getUserChats(user.id);

  return res.json({
    data: {
      chatId: chat.chatId,
      chats: chats,
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
  const user = req.session.user;

  /**
   * @var {string} search
   */
  const search = req.query.search;

  let chats;

  if (!search) {
    chats = await ChatService.getUserChats(user.id);
  } else {
    chats = await ChatService.getFilteredChats(user.id, search);
  }

  return res.json({
    data: chats,
  });
};

const sendMessage = async (req, res) => {
  /** @var  {{chatId: string}} req.params */
  const { chatId } = req.params;

  /** @var {{message: string}} req.body */
  const body = req.body;

  const user = req.session.user;

  const result = await ChatService.sendChatMessage(user, {
    chatId: chatId,
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
  getAllChats,
};
