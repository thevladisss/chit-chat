import { getRequest, postRequest } from "./index";
import { IChat } from "../types/IChat.ts";
import { ChatMessageTypeEnum } from "../enums/ChatMessageTypeEnum.ts";

export const getAllChats = () => {
  return getRequest<IChat[]>("/api/chats/");
};

export const searchChats = (search: string) => {
  return getRequest<IChat[]>("/api/chats/search", {
    search,
  });
};

export const searchExistingAndProspectiveChats = (pagination: {} = {}) => {
  return getRequest("/api/search/chats", {
    ...pagination,
  });
};

export const getChat = (chatId: string) => {
  return getRequest<IChat>(`/api/chats/${chatId}`);
};

export const sendTextMessage = (payload: {
  chatId: string;
  message: string;
}) => {
  return postRequest<{
    chats: IChat[];
  }>(`/api/chats/${payload.chatId}/messages`, {
    message: payload.message,
    type: ChatMessageTypeEnum.Text,
  });
};
