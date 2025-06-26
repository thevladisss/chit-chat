import { IChat } from "./IChat.ts";
import { AxiosError } from "axios";

export type IRootState = {
  user: any;
  chats: {
    pendingLoadChats: boolean;
    loadChatsError: AxiosError | null;
    chats: IChat[];
    selectedChatId: string | null;
  };
};
