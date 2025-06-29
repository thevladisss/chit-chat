import { JSX, BaseSyntheticEvent } from "react";
import { useUser } from "../hooks/useUser.tsx";
import TextField from "./base/TextField.tsx";
import ChatsList from "./ChatsList.tsx";
import { useChatStore } from "../hooks/useChatStore.ts";
import SidebarUserInformation from "./SidebarUserInformation.tsx";

function UserSidebar(props: {
  handleInitializeChat: any;
  handleSelectChat: any;
}): JSX.Element {
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
    <div
      style={{
        width: "380px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: " var(--app-bg-light-1)",
      }}
    >
      <SidebarUserInformation username={user ? user.username : ""} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "1",
        }}
      >
        <TextField
          onInput={handleSearchChats}
          type="search"
          size="large"
          square
          placeholder="Search chat"
          loading={loadingChats}
        />
        <div
          className="chats-container"
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "1",
            marginTop: "16px",
          }}
        >
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
