import { createSelector } from "@reduxjs/toolkit";
import { IRootState } from "../../types/IRootState.ts";
import { IChat } from "../../types/IChat.ts";

export const selectLoadingChats = (state: IRootState): boolean => {
  return state.chatState.pendingLoadChats;
};

export const selectExistingChats = createSelector(
  (state: IRootState) => state.chatState.chats,
  (chats): IChat[] => {
    return chats.filter((chat) => {
      return !!chat.chatId;
    });
  },
);

export const selectSelectedChatMessages = createSelector(
  [(state: IRootState) => state.chatState.selectedChat],
  (chat: IChat) => {
    return chat ? chat.messages : [];
  },
);

export const selectSelectedChatId = createSelector(
  [(state: IRootState) => state.chatState.selectedChat],
  (selectedChat: IChat) => {
    return selectedChat ? selectedChat.chatId : null;
  },
);

export const selectSelectedChat = (state: IRootState): IChat | null => {
  return state.chatState.selectedChat;
};

export const selectIsLoggedIn = (state: IRootState): boolean => {
  return state.userState !== null;
};
