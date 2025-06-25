import { IChat } from "./IChat.ts";

export type IRootState = {
  user: any;
  chats: {
    chats: IChat[];
    selectedChatId: string | null;
  };
};
