import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as actions from "./actions.ts";
import { RootState } from "../index.ts";
import { IChat } from "../../types/IChat.ts";
import { IProspectiveChat } from "../../types/IProspectiveChat.ts";

type ChatState = {
  selectedChatId: string | null;
  chats: any[];
};

export const slice = createSlice({
  name: "chats",
  initialState: {
    selectedChatId: null,
    chats: [],
  },
  reducers: {
    setChatsAction(state, action: PayloadAction<any[]>) {
      return {
        ...state,
        chats: action.payload,
      };
    },

    createLocalChat(state, action: PayloadAction<IProspectiveChat>) {
      return {
        ...state,
        selectedChat: {
          userId: action.payload.userId,
          username: action.payload.username,
          chatId: null,
          messages: [],
        },
      };
    },
    setExistingChats: (state, action: PayloadAction<IChat[]>) => {
      return {
        ...state,
        existingChats: action.payload,
      };
    },
    setProspectiveChats: (state, action: PayloadAction<IProspectiveChat[]>) => {
      return {
        ...state,
        prospectiveChats: action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      actions.getChatsAction.fulfilled,
      (state: RootState, action) => {
        return {
          ...state,
          chats: action.payload,
        };
      },
    );

    builder.addCase(actions.startNewChatAction.fulfilled, (state, action) => {
      return {
        ...state,
        chats: action.payload.chats,
        selectedChatId: action.payload.chatId,
      };
    });

    builder.addCase(
      actions.selectChatAction.fulfilled,
      (state: RootState, action) => {
        return {
          ...state,
          selectedChatId: action.payload.chatId,
        };
      },
    );
  },
});

export const {
  setChatsAction,

  setExistingChats,
  setProspectiveChats,
  createLocalChat,
} = slice.actions;

export default slice.reducer;
