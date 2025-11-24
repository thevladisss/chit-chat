import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllChats,
  getChat,
  searchChats,
} from "../../service/chatSerevice.ts";
import { IChat } from "../../types/IChat.ts";

export const getChatsAction = createAsyncThunk<IChat[]>(
  "chats/getChats",
  async () => {
    const { data } = await getAllChats();

    return data;
  }
);

export const getFilteredChatsAction = createAsyncThunk<IChat[], string>(
  "chats/getFilteredChats",
  async (search: string) => {
    const { data } = await searchChats(search);

    return data;
  }
);

export const selectChatAction = createAsyncThunk<IChat, string>(
  "chats/selectChat",
  async (chatId: string) => {
    const { data } = await getChat(chatId);

    return data;
  }
);
