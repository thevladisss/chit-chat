import { IChatMessage } from "./IChatMessage.ts";

export type IChat = {
  chatId: string;
  lastMessageTimestamp: number | null;
  name: string;
  lastMessage: IChatMessage | null;
  messages: IChatMessage[];
  users: string[];
  
  online: boolean // remove

  isOnline: boolean
};
