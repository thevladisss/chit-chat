import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as actions from "./actions.ts";
import { RootState } from "../index.ts";
import { IChat } from "../../types/IChat.ts";
import { IProspectiveChat } from "../../types/IProspectiveChat.ts";

export const slice = createSlice({
  name: "chats",
  initialState: {
    existingChats: [],
    prospectiveChats: [],
    selectedChat: null,
  },
  reducers: {
    createLocalChat(
      state,
      action: PayloadAction<IProspectiveChat>,
    ) {
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

export const { setExistingChats, setProspectiveChats, createLocalChat } =
  slice.actions;

export default slice.reducer;
