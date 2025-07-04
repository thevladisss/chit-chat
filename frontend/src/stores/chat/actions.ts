import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllChats,
  getChatMessages,
  initializeChat,
  searchChats,
} from "../../service/chatSerevice.ts";
import { IChat } from "../../types/IChat.ts";
import { IChatMessage } from "../../types/IChatMessage.ts";

export const getChatsAction = createAsyncThunk<IChat[]>(
  "chats/getChats",
  async () => {
    const { data } = await getAllChats();

    return data;
  },
);

export const getFilteredChatsAction = createAsyncThunk<IChat[], string>(
  "chats/getFilteredChats",
  async (search: string) => {
    const { data } = await searchChats(search);

    return data;
  },
);

export const selectChatAction = createAsyncThunk<
  {
    id: string;
    messages: IChatMessage[];
  },
  string
>("chats/selectChat", async (chatId: string) => {
  const { data } = await getChatMessages(chatId);

  return data;
});

export const startNewChatAction = createAsyncThunk<IChat, string>(
  "chats/startChat",
  async (userId: string) => {
    const { data } = await initializeChat(userId);

    return data;
  },
);
