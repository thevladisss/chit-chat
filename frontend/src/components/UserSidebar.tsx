import { JSX, BaseSyntheticEvent, useState } from "react";
import { useUser } from "../hooks/useUser.tsx";
import BaseButton from "./base/BaseButton.tsx";
import TextField from "./base/TextField.tsx";
import ChatsList from "./ChatsList.tsx";
import { useChatStore } from "../hooks/useChatStore.ts";
import { IProspectiveChat } from "../types/IProspectiveChat.ts";

function UserSidebar(props: any): JSX.Element {
  const {
    openNewChat,
    startNewChat,
    selectExistingChat,
    existingChats,
    prospectiveChats,
  } = useChatStore();
  const { user } = useUser();

  const handleSearchChats = (event: BaseSyntheticEvent<InputEvent>) => {
    console.log("event", event);
  };

  const handleInitializeChat = (chat: IProspectiveChat) => {
    openNewChat(chat);
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
          {/*<ul className="chats-list"></ul>*/}
          <ChatsList
            chats={existingChats}
            prospectiveChats={prospectiveChats}
            selectedChatId={"1"}
            onInitializeChat={handleInitializeChat}
          />
        </div>
      </div>
    </div>
  );
}

export default UserSidebar;
