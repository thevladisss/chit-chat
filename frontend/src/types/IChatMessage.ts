export type IChatMessage = {
  sentAt: string;
  messageId: string;
  chatId: string;
  text: string;
  sentBy: string;
  isSeen: boolean;
  isDelivered: boolean;
  isPersonal: boolean;
};
