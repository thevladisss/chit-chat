import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as actions from "./actions.ts";
import { RootState } from "../index.ts";

export const slice = createSlice({
  name: "chats",
  initialState: {
    selectedChatId: null,
    pendingLoadChats: false,
    loadChatsError: null,
    chats: [],
  },
  reducers: {
    setChatsAction(state, action: PayloadAction<any[]>) {
      return {
        ...state,
        chats: action.payload,
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

    builder.addCase(actions.getChatsAction.pending, (state) => {
      return {
        ...state,
        pendingLoadChats: true,
      };
    });

    builder.addCase(actions.getChatsAction.rejected, (state, action) => {
      return {
        ...state,
        loadChatsError: action.payload,
      };
    });

    builder.addCase(
      actions.getFilteredChatsAction.fulfilled,
      (state: RootState, action) => {
        return {
          ...state,
          chats: action.payload,
        };
      },
    );

    builder.addCase(actions.getFilteredChatsAction.pending, (state) => {
      return {
        ...state,
        pendingLoadChats: true,
      };
    });

    builder.addCase(
      actions.getFilteredChatsAction.rejected,
      (state, action) => {
        return {
          ...state,
          loadChatsError: action.payload,
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
