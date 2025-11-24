import { IChat } from "./IChat.ts";
import { AxiosError } from "axios";
import { IUser } from "./IUser.ts";

export type IChatSliceState = {
  selectedChat: IChat | null;
  pendingSelectChat: boolean
  selectChatError: AxiosError | null;

  chats: IChat[];
  pendingLoadChats: boolean;
  loadChatsError: AxiosError | null;

};

export type IUserSliceState = IUser | null;

export type IRootState = {
  userState: IUserSliceState;
  chatState: IChatSliceState;
};
