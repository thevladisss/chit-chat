import { createSelector } from "@reduxjs/toolkit";
import { IRootState } from "../../types/IRootState.ts";
import { IChat } from "../../types/IChat.ts";

export const selectLoadingChats = (state: IRootState): boolean => {
  return state.chats.pendingLoadChats;
};

export const selectExistingChats = createSelector(
  (state: IRootState) => state.chats.chats,
  (chats): IChat[] => {
    return chats.filter((chat) => {
      return !!chat.chatId;
    });
  },
);

export const selectProspectiveChats = createSelector(
  (state: IRootState) => state.chats.chats,
  (chats): IChat[] => {
    return chats.filter((chat) => {
      return !chat.chatId;
    });
  },
);

export const selectSelectedChat = createSelector(
  [
    (state: IRootState) => state.chats.chats,
    (state: IRootState) => state.chats.selectedChatId,
  ],
  (chats, selectedId) => {
    return selectedId
      ? chats.find((chat) => {
          return chat.chatId === selectedId;
        })
      : null;
  },
);

export const selectSelectedChatMessages = createSelector(
  [
    (state: IRootState) => state.chats.chats,
    (state: IRootState) => state.chats.selectedChatId,
  ],
  (chats, selectedChatId) => {
    const chat = chats.find((chat) => chat.chatId === selectedChatId);
    return chat ? chat.messages : [];
  },
);
