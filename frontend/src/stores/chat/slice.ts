import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as actions from "./actions.ts";
import { IChatSliceState } from "../../types/IRootState.ts";

export const slice = createSlice({
  name: "chats",
  initialState: {
    selectedChatId: null,
    pendingLoadChats: false,
    loadChatsError: null,
    chats: [],
  },
  reducers: {
    setChatsAction(state, action) {
      return {
        ...state,
        chats: action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(actions.getChatsAction.fulfilled, (state, action) => {
      return {
        ...state,
        chats: action.payload,
        pendingLoadChats: false,
      };
    });

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
      (state, action) => {
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

    builder.addCase(
      actions.startNewChatAction.fulfilled,
      (
        state,
        action: PayloadAction<{ chats: any[]; chat: any; chatId: string }>,
      ) => {
        return {
          ...state,
          chats: action.payload.chats,
          selectedChatId: action.payload.chatId,
        };
      },
    );

    builder.addCase(
      actions.selectChatAction.fulfilled,
      (state: IChatSliceState, action: PayloadAction<{ chatId: string }>) => {
        return {
          ...state,
          selectedChatId: action.payload.chatId,
        };
      },
    );
  },
});

export const { setChatsAction } = slice.actions;

export default slice.reducer;
