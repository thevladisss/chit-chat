import { IChatMessage } from "./IChatMessage.ts";

export type IChat = {
  chatId: string;
  lastMessageTimestamp: string;
  lastMessage: IChatMessage | null;
  messages: IChatMessage[];
  participants: string[];
};
