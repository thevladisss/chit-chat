import {
  getChatsAction,
  getFilteredChatsAction,
  selectChatAction,
  startNewChatAction,
} from "../stores/chat/actions.ts";
import { useSelector, useDispatch } from "react-redux";
import { setChatsAction } from "../stores/chat/slice.ts";
import {
  selectLoadingChats,
  selectExistingChats,
  selectProspectiveChats,
  selectSelectedChat,
  selectSelectedChatMessages,
} from "../stores/user/selectors.ts";

export const useChatStore = () => {
  const dispatch = useDispatch();

  /* Actions */

  const getChats = () => dispatch<any>(getChatsAction());

  const getFilteredChats = (search: string) =>
    dispatch<any>(getFilteredChatsAction(search));

  const setChats = (chats: any[]) => {
    dispatch(setChatsAction(chats));
  };

  const initializeChat = (userId: string) => {
    dispatch<any>(startNewChatAction(userId));
  };
  const startNewChat = (userId: string) => {
    dispatch<any>(startNewChatAction(userId));
  };
  const selectExistingChat = (chatId: string) => {
    dispatch<any>(selectChatAction(chatId));
  };

  const selectChat = (chatId: string) => {
    dispatch<any>(selectChatAction(chatId));
  };

  /* Getters */

  const loadingChats = useSelector(selectLoadingChats);
  const existingChats = useSelector(selectExistingChats);
  const prospectiveChats = useSelector(selectProspectiveChats);
  const selectedChat = useSelector(selectSelectedChat);
  const selectedChatMessages = useSelector(selectSelectedChatMessages);

  return {
    getChats,
    getFilteredChats,
    startNewChat,
    selectExistingChat,
    setChats,
    initializeChat,
    selectChat,

    loadingChats,
    existingChats,
    prospectiveChats,
    selectedChat,
    selectedChatMessages,
  };
};
