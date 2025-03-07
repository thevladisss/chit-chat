import {getRequest} from "./index";
import {IChat} from "../types/IChat.ts";
import {IUser} from "../types/IUser.ts";

export const getAllChats = () => {
  return getRequest<{
    chats: IChat[],
    prospectiveChats: IUser[]
  }>('/api/chats/')
}
