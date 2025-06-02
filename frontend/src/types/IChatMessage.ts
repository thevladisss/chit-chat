export type IChatMessage = {
  sentAt: string;
  id: string;
  chatId: string;
  text: string;
  sentBy: string;
  isSeen: boolean;
  isDelivered: boolean;
  isPersonal: boolean;
};
