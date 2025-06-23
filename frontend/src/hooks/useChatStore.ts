import { useStore } from "./useStore.ts";
import {
  getChatsAction,
  selectChatAction,
  startNewChatAction,
} from "../stores/chat/actions.ts";
import { useSelector } from "react-redux";
import { IRootState } from "../types/IRootState.ts";
import { IChat } from "../types/IChat.ts";
import { IProspectiveChat } from "../types/IProspectiveChat.ts";
import { IChatMessage } from "../types/IChatMessage.ts";
import {
  createLocalChat,
  setChatsAction,
  setExistingChats,
  setProspectiveChats,
} from "../stores/chat/slice.ts";

export const useChatStore = () => {
  const { dispatch } = useStore();

  /* Actions */

  const getChats = () => dispatch(getChatsAction());

  const setChats = (chats: any[]) => {
    dispatch(setChatsAction(chats));
  };

  const initializeChat = (userId: string) => {
    dispatch(startNewChatAction(userId));
  };
  const startNewChat = (userId: string) => {
    dispatch(startNewChatAction(userId));
  };
  const selectExistingChat = (chatId: string) => {
    dispatch(selectChatAction(chatId));
  };

  const selectChat = (chatId: string) => {
    dispatch(selectChatAction(chatId));
  };

  /* Getters */

  const existingChats = useSelector<IRootState, IChat[]>((state) => {
    return state.chats.chats.filter((chat) => {
      return !!chat.chatId;
    });
  });

  const prospectiveChats = useSelector<IRootState, IChat[]>((state) => {
    return state.chats.chats.filter((chat) => {
      return !chat.chatId;
    });
  });

  const selectedChat = useSelector<IRootState, any | null>((state) => {
    //TODO: Optimize
    return state.chats.selectedChatId
      ? state.chats.chats.find((chat) => {
          return chat.chatId === state.chats.selectedChatId;
        })
      : null;
  });

  const selectedChatMessages = useSelector<IRootState, IChatMessage[]>(() => {
    return selectedChat ? selectedChat.messages : [];
  });

  return {
    getChats,
    startNewChat,
    selectExistingChat,
    setChats,
    initializeChat,
    selectChat,

    existingChats,
    prospectiveChats,
    selectedChat,
    selectedChatMessages,
  };
};
