import { getRequest, postRequest } from "./index";
import { IChat } from "../types/IChat.ts";
import { IUser } from "../types/IUser.ts";
import { IProspectiveChat } from "../types/IProspectiveChat.ts";
import { IChatMessage } from "../types/IChatMessage.ts";

export const getAllChats = () => {
  return getRequest<{
    chats: IChat[];
    prospectiveChats: IProspectiveChat[];
  }>("/api/chats/");
};

export const initializeChat = (userId: string) => {
  return postRequest("/api/chats/initialize", {
    userId,
  });
};

export const searchExistingAndProspectiveChats = (pagination: {} = {}) => {
  return getRequest("/api/search/chats", {
    ...pagination,
  });
};

export const getChatMessages = (chatId: string) => {
  return getRequest<{
    id: string;
    messages: IChatMessage[];
  }>(`/api/chats/${chatId}`);
};

export const sendMessage = (payload: {
  chatId: string,
  message: string;
}) => {
  return postRequest("/api/chats/", payload);
};
