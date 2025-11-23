import {
  getChatsAction,
  getFilteredChatsAction,
  selectChatAction,
  startNewChatAction,
} from "../stores/chat/actions.ts";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteTypingInChat,
  setChatsAction,
  setTypingInChat,
} from "../stores/chat/slice.ts";
import {
  selectLoadingChats,
  selectExistingChats,
  selectProspectiveChats,
  selectSelectedChat,
  selectSelectedChatMessages,
} from "../stores/user/selectors.ts";
import { IUser } from "../types/IUser.ts";

// TODO: Fix the type for dispatch calls below. Currently using 'any' which is not type-safe.
// Should use proper AppDispatch type from the store.

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

  const setTypingChat = (chatId: string, users: IUser[]) => {
    dispatch<any>(setTypingInChat({ chatId, users: users }));
  };

  const deleteTypingChat = (chatId: string) => {
    dispatch<any>(deleteTypingInChat({ chatId }));
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
    deleteTypingChat,
    initializeChat,
    selectChat,
    setTypingChat,

    loadingChats,
    existingChats,
    prospectiveChats,
    selectedChat,
    selectedChatMessages,
  };
};
