import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as actions from "./actions.ts";
import { IChat } from "../../types/IChat.ts";

export type ChatSliceState = {
  selectedChat: IChat | null;
  selectedChatId: string | null;
  chats: IChat[];
  pendingLoadChats: boolean;
  loadChatsError: Error | null;
  pendingSelectChat: boolean;
  selectChatError: Error | null;
  typingChats: Record<string, string[]>;
};

const initialState = {
  selectedChat: null,
  selectedChatId: null,
  pendingSelectChat: false,
  selectChatError: null,
  pendingLoadChats: false,
  loadChatsError: null,
  chats: [],
  typingChats: {},
} satisfies ChatSliceState;

export const slice = createSlice({
  name: "chatState",
  initialState,
  reducers: {
    setTypingInChat(state, action) {
      return {
        ...state,
        typingChats: {
          ...state.typingChats,
          [action.payload.chatId]: action.payload.users,
        },
      };
    },
    deleteTypingInChat(state, action) {
      if (action.payload.chatId in state.typingChats) {
        const map = state.typingChats as Record<string, string[]>;

        delete map[action.payload.chatId];
      }
    },
    setSelectedChatAction(state, action) {
      return {
        ...state,
        selectedChat: action.payload,
      };
    },
    setChatsAction(state, action) {
      return {
        ...state,
        chats: action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    /* Get Chats */
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
        pendingLoadChats: false,
      };
    });

    /* Get filtered chats */
    builder.addCase(
      actions.getFilteredChatsAction.fulfilled,
      (state, action) => {
        return {
          ...state,
          chats: action.payload,
          pendingLoadChats: false,
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
          pendingLoadChats: false,
        };
      },
    );

    /* Select active chat */
    builder.addCase(
      actions.selectChatAction.fulfilled,
      (state: ChatSliceState, action: PayloadAction<IChat>) => {
        return {
          ...state,
          selectedChat: action.payload,
        };
      },
    );

    builder.addCase(
      actions.leaveSelecteChatAction.fulfilled,
      (state: ChatSliceState) => {
        return {
          ...state,
          selectedChat: null,
        };
      },
    );

    //TODO: Add rejected and pending hanlding for Select active chat
  },
});

export const {
  setSelectedChatAction,
  deleteTypingInChat,
  setChatsAction,
  setTypingInChat,
} = slice.actions;

export default slice.reducer;
