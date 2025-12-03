export type IChatMessage = {
  sentAt: number;
  messageId: string;
  chatId: string;
  text: string;
  sentBy: string;
  isSeen: boolean;
  isDelivered: boolean;
  isPersonal: boolean;
};
