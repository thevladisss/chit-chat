const TextMessageRepository = require('../repositories/textMessage.repository');

const getChatMessagesForUser = async (userId, chatId) => {
  const messages = await TextMessageRepository.findAllByChatId(chatId);

  return messages.map((message) => {
    return {
      ...message,
      isPersonal: message.userId === userId,
    };
  });
};

module.exports = {
  getChatMessagesForUser,
};
