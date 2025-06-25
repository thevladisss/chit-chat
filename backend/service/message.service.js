const MessageRepository = require('../repositories/message.repository');

const getChatMessagesForUser = async (userId, chatId) => {

  const messages = await MessageRepository.findAllByChatId(chatId);

  return messages.map((message) => {

    return {
      ...message,
      isPersonal: message.userId === userId,
    }
  })
}

module.exports = {
  getChatMessagesForUser,
}
