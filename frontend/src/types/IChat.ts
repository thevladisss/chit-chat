import { IChatMessage } from "./IChatMessage.ts";

export type IChat = {
  chatId: string;
  lastMessageTimestamp: string;
  lastMessage: string;
  messages: IChatMessage[];
  participants: string[];
};
