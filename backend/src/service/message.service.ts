import TextMessageRepository from '../repositories/textMessage.repository';

export const getChatMessagesForUser = async (
  userId: string,
  chatId: string,
): Promise<any[]> => {
  const messages = await TextMessageRepository.findAllByChatId(chatId);

  return messages.map((message) => {
    return {
      ...message,
      isPersonal: message.userId.toString() === userId,
    };
  });
};

export default {
  getChatMessagesForUser,
};
