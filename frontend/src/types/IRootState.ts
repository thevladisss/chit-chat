import { IChat } from "./IChat.ts";
import { AxiosError } from "axios";
import { IUser } from "./IUser.ts";

export type IChatSliceState = {
  pendingLoadChats: boolean;
  loadChatsError: AxiosError | null;
  chats: IChat[];
  selectedChatId: string | null;
};

export type IUserSliceState = IUser | null;

export type IRootState = {
  user: IUserSliceState;
  chats: IChatSliceState;
};
