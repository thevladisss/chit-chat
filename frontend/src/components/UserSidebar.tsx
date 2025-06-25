import { JSX, BaseSyntheticEvent, useState } from "react";
import { useUser } from "../hooks/useUser.tsx";
import BaseButton from "./base/BaseButton.tsx";
import TextField from "./base/TextField.tsx";
import ChatsList from "./ChatsList.tsx";
import { useChatStore } from "../hooks/useChatStore.ts";
import { IProspectiveChat } from "../types/IProspectiveChat.ts";

function UserSidebar(props: {
  handleInitializeChat: any;
  handleSelectChat: any;
}): JSX.Element {
  const {
    selectChat,
    selectedChat,
    initializeChat,
    existingChats,
    prospectiveChats,
  } = useChatStore();
  const { user } = useUser();

  const handleSearchChats = (event: BaseSyntheticEvent<InputEvent>) => {
    console.log("event", event);
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
      <div
        className="flex justify-between align-center"
        style={{ padding: "8px" }}
      >
        <h2>
          👉 Hello, <strong>{user.username}</strong>
        </h2>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "1",
          padding: "4px 8px",
        }}
      >
        <TextField
          onInput={handleSearchChats}
          type="search"
          size="large"
          placeholder="Search chat"
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
