import { JSX, BaseSyntheticEvent, useState } from "react";
import { useUserStore } from "../hooks/useUserStore.tsx";
import BaseTextField from "./base/BaseTextField.tsx";
import ChatsList from "./ChatsList.tsx";
import { useChatStore } from "../hooks/useChatStore.ts";
import SidebarUserInformation from "./SidebarUserInformation.tsx";
import "./UserSidebar.css";

type Props = {
  pendingSearchFilteredChats: boolean;
  onSearchFilteredChats: (searchValue: string) => void;
  onInitializeChat: (userId: string) => void;
  onSelectExistingChat: (chatId: string) => void;
};

function UserSidebar({
  onInitializeChat,
  onSelectExistingChat,
  onSearchFilteredChats,
  pendingSearchFilteredChats,
}: Props): JSX.Element {
  const { user } = useUserStore();
  const { existingChats, prospectiveChats, selectedChat } = useChatStore();

  const handleSearchChats = (event: BaseSyntheticEvent<InputEvent>) => {
    const value = event.target.value;

    onSearchFilteredChats(value);
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
      <SidebarUserInformation username={user ? user.username : ""} />
      <div className="user-sidebar-content">
        <BaseTextField
          onInput={handleSearchChats}
          type="search"
          size="large"
          square
          placeholder="Search chat"
          loading={pendingSearchFilteredChats}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
        <div className="container">
          <ChatsList
            existingChats={existingChats}
            prospectiveChats={prospectiveChats}
            selectedChatId={selectedChat ? selectedChat.chatId : null}
            onInitializeChat={onInitializeChat}
            onSelectExistingChat={onSelectExistingChat}
            isSearchingChats={isFocusedSearchInput}
          />
        </div>
      </div>
    </div>
  );
}

export default UserSidebar;
