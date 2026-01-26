import { JSX, BaseSyntheticEvent, useState, useMemo, useEffect, useCallback } from "react";
import BaseTextField from "./base/BaseTextField.tsx";
import ChatsList from "./ChatsList.tsx";
import { useSelector, useDispatch } from "react-redux";
import "./UserSidebar.css";
import { debounce } from "lodash-es";
import {
  selectExistingChats,
  selectSelectedChat,
  selectLoadingChats
} from "../stores/user/selectors.ts";
import {
  getFilteredChatsAction,
selectChatAction,
} from "../stores/chat/actions.ts";
import type { AppDispatch } from "../stores";

function UserSidebar(): JSX.Element {
  const SEARCH_DEBOUNCE_DELAY = 500; // milliseconds

  const dispatch = useDispatch<AppDispatch>();
  const chats = useSelector(selectExistingChats);
  const selectedChat = useSelector(selectSelectedChat);

  const selectChat = (chatId: string) => dispatch(selectChatAction(chatId));
  

  const pendingLoadChats = useSelector(selectLoadingChats)

  const getFilteredChats = useCallback((search: string) => {
    dispatch(getFilteredChatsAction(search));
  }, [dispatch]);

  const handleSelectChat = (chatId: string) => {
    if (!selectedChat || selectedChat.chatId != chatId) {
      selectChat(chatId);
    }
  };

  const debouncedGetFilteredChats = useMemo(
    () => debounce(getFilteredChats, SEARCH_DEBOUNCE_DELAY),
    [getFilteredChats]
  );

  const [hasFiredSearch, setHasFiredSearch] = useState(false) 

  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (hasFiredSearch) {
      debouncedGetFilteredChats(searchValue);
    }

  }, [searchValue, debouncedGetFilteredChats]);

  useEffect(() => {
    return () => debouncedGetFilteredChats.cancel();
  }, [debouncedGetFilteredChats]);


  const handleSearchChats = (event: BaseSyntheticEvent<InputEvent>) => {
    const value = event.target.value;

    setSearchValue(value);

    if (!hasFiredSearch) {
      setHasFiredSearch(true);
    }
  };

  const [isFocusedSearchInput, setIsFocusedSearchInput] = useState(false);

  const handleSearchFocus = () => {
    setIsFocusedSearchInput(true);
  };
  const handleSearchBlur = () => {
    setIsFocusedSearchInput(false);
  };

  return (
    <div className="user-sidebar">
      {/* <SidebarUserInformation username={user ? user.username : ""} /> */}
      <div className="user-sidebar-content">
        <div className="chat-search-container">
          <BaseTextField
            onInput={handleSearchChats}
            type="search"
            size="large"
            placeholder="Search chat"
            loading={pendingLoadChats}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
        </div>
        <div className="container">
          <ChatsList
            chats={chats}
            selectedChatId={selectedChat ? selectedChat.chatId : null}
            onSelectChat={handleSelectChat}
            isSearchingChats={Boolean(searchValue)}
          />
        </div>
      </div>
    </div>
  );
}

export default UserSidebar;
