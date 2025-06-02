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

export const useChatStore = () => {
  const { dispatch } = useStore();

  const getChats = () => dispatch(getChatsAction());
  const startNewChat = (userId: string) => dispatch(startNewChatAction(userId));
  const selectExistingChat = (chatId: string) =>
    dispatch(selectChatAction(chatId));

  const existingChats = useSelector<IRootState, IChat[]>((state) => {
    return state.chats.existingChats;
  });
  const prospectiveChats = useSelector<IRootState, IProspectiveChat[]>(
    (state) => {
      return state.chats.prospectiveChats;
    },
  );

  const selectedChat = useSelector<IRootState, any | null>((state) => {
    return state.chats.selectedChat;
  });

  const selectedChatMessages = useSelector<IRootState, IChatMessage[]>(
    (state) => {
      return state.chats.selectedChat ? state.chats.selectedChat.messages : [];
    },
  );

  return {
    getChats,
    startNewChat,
    selectExistingChat,

    existingChats,
    prospectiveChats,
    selectedChat,
    selectedChatMessages,
  };
};
