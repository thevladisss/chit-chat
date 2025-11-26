import { JSX, BaseSyntheticEvent, useState } from "react";
import BaseTextField from "./base/BaseTextField.tsx";
import ChatsList from "./ChatsList.tsx";
import { useChatStore } from "../hooks/useChatStore.ts";
import "./UserSidebar.css";
import { debounce } from "lodash-es";

function UserSidebar(): JSX.Element {
  const SEARCH_DEBOUNCE_DELAY = 300; // milliseconds

  const [pendingSearchFilteredChats, setSearchFilteredChats] = useState(false);

  const {
    existingChats: chats,
    selectedChat,
    selectChat,
    getFilteredChats,
  } = useChatStore();

  const handleSelectChat = (chatId: string) => {
    if (!selectedChat || selectedChat.chatId != chatId) {
      selectChat(chatId);
    }
  };

  const handleSearchFilteredChats = debounce((search: string) => {
    getFilteredChats(search);
  }, SEARCH_DEBOUNCE_DELAY);

  const handleSearchChats = (event: BaseSyntheticEvent<InputEvent>) => {
    const value = event.target.value;

    handleSearchFilteredChats(value);
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
            loading={pendingSearchFilteredChats}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
        </div>
        <div className="container">
          <ChatsList
            chats={chats}
            selectedChatId={selectedChat ? selectedChat.chatId : null}
            onSelectChat={handleSelectChat}
            isSearchingChats={isFocusedSearchInput}
          />
        </div>
      </div>
    </div>
  );
}

export default UserSidebar;
