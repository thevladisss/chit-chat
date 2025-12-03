import { IChat } from "../IChat.ts";

export type IWSMessageEventData = {
  isSenderSelf: boolean;
  sender: string;
  chats: IChat[];
  chat: IChat;
};
