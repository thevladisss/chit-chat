import { JSX, BaseSyntheticEvent } from "react";
import { useUser } from "../hooks/useUser.tsx";
import BaseTextField from "./base/BaseTextField.tsx";
import ChatsList from "./ChatsList.tsx";
import { useChatStore } from "../hooks/useChatStore.ts";
import SidebarUserInformation from "./SidebarUserInformation.tsx";
import "./UserSidebar.css";

type Props = {
  handleInitializeChat: any;
  handleSelectChat: any;
};

function UserSidebar(props: Props): JSX.Element {
  const {
    getFilteredChats,
    selectChat,
    selectedChat,
    initializeChat,
    existingChats,
    prospectiveChats,
    loadingChats,
  } = useChatStore();
  const { user } = useUser();

  const handleSearchChats = (event: BaseSyntheticEvent<InputEvent>) => {
    const value = event.target.value;

    getFilteredChats(value);
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
  };

  const handleInitializeChat = (userId: string) => {
    initializeChat(userId);
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
          loading={loadingChats}
        />
        <div className="container">
          <ChatsList
            existingChats={existingChats}
            prospectiveChats={prospectiveChats}
            selectedChatId={selectedChat ? selectedChat.id : null}
            onInitializeChat={handleInitializeChat}
            onSelectExistingChat={handleSelectChat}
          />
        </div>
      </div>
    </div>
  );
}

export default UserSidebar;
