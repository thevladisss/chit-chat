import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as actions from "./actions.ts";
import { RootState } from "../index.ts";
import { IChat } from "../../types/IChat.ts";

export const slice = createSlice({
  name: "chats",
  initialState: {
    existingChats: [],
    prospectiveChats: [],
    selectedChat: null,
  },
  reducers: {
    setExistingChats: (state, action: PayloadAction<IChat[]>) => {
      state.existingChats = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      actions.getChatsAction.fulfilled,
      (state: RootState, action) => {
        return {
          ...state,
          existingChats: action.payload.chats,
          prospectiveChats: action.payload.prospectiveChats,
        };
      },
    );

    builder.addCase(
      actions.selectChatAction.fulfilled,
      (state: RootState, action) => {
        return {
          ...state,
          selectedChat: {
            id: action.payload.id,
            messages: action.payload.messages,
          },
        };
      },
    );
    builder.addCase(
      actions.startNewChatAction.fulfilled,
      (state: RootState, action) => {
        return {
          ...state,
          selectedChat: {
            id: action.payload.chatId,
            messages: action.payload.messages,
          },
        };
      },
    );
  },
});

export const { setChats } = slice.actions;

export default slice.reducer;
