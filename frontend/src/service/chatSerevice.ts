import {getRequest} from "./index";
import {IChat} from "../types/Chat";

export const getAllChats = () => {
  return getRequest<IChat[]>('/api/chats/')
}
