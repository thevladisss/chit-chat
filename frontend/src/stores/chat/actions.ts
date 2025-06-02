import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllChats,
  getChatMessages,
  initializeChat,
} from "../../service/chatSerevice.ts";
import { IChat } from "../../types/IChat.ts";
import { IProspectiveChat } from "../../types/IProspectiveChat.ts";
import { IChatMessage } from "../../types/IChatMessage.ts";

export const getChatsAction = createAsyncThunk<{
  chats: IChat[];
  prospectiveChats: IProspectiveChat[];
}>("chats/getChats", async () => {
  const { data } = await getAllChats();

  return data;
});

export const selectChatAction = createAsyncThunk<{
  id: string;
  messages: IChatMessage[];
}>("chats/selectChat", async (chatId: string) => {
  const { data } = await getChatMessages(chatId);

  return data;
});
export const startNewChatAction = createAsyncThunk<{
  id: string;
  messages: IChatMessage[];
}>("chats/startChat", async (userId: string) => {
  const { data } = await initializeChat(userId);

  return data;
});
