import { createSelector } from "@reduxjs/toolkit";
import { type RootState } from "../index.ts";
import { IChat } from "../../types/IChat.ts";

export const selectLoadingChats = (state: RootState): boolean => {
  return state.chatState.pendingLoadChats;
};

export const selectExistingChats = createSelector(
  (state: RootState) => state.chatState.chats,
  (chats): IChat[] => {
    return chats.filter((chat) => {
      return !!chat.chatId;
    });
  }
);

export const selectSelectedChatMessages = createSelector(
  [(state: RootState) => state.chatState.selectedChat],
  (chat: IChat | null) => {
    return chat ? chat.messages : [];
  }
);

export const selectSelectedChatId = createSelector(
  [(state: RootState) => state.chatState.selectedChat],
  (selectedChat: IChat | null) => {
    return selectedChat ? selectedChat.chatId : null;
  }
);

export const selectSelectedChat = (state: RootState): IChat | null => {
  return state.chatState.selectedChat;
};

export const selectIsLoggedIn = (state: RootState): boolean => {
  return state.userState !== null;
};
