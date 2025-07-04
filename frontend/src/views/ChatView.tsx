import "./ChatView.css";
import { ChangeEvent, useEffect, useState } from "react";
import { sendMessage } from "../service/chatSerevice";
import ChatComposer from "../components/ChatComposer.tsx";
import UserSidebar from "../components/UserSidebar.tsx";

import { useChatStore } from "../hooks/useChatStore.ts";
import { ServerSideEventsEnum } from "../enums/ServerSideEventsEnum.ts";
import { IWSMessageEventData } from "../types/ws/IWSMessageEventData.ts";

const messageSound = new Audio("/sounds/message.mp3");

function ChatView() {
  const playMessageSound = async () => {
    await messageSound.play();
  };

  const {
    getChats,
    selectedChat,
    setChats,
    initializeChat,
    selectChat,
    getFilteredChats,
  } = useChatStore();
  let ws;

  useEffect(() => {
    if (!ws) {
      ws = new WebSocket(import.meta.env.VITE_WS_URL);
    }

    ws.onopen = () => {
      requestChats();
    };

    type WsCustomEvent<R = any> = { event: string; data: R };

    const handleConnectionEvent = (e: WsCustomEvent) => {
      setChats(e.data.chats);
    };

    const handleChatCreatedEvent = (e: WsCustomEvent) => {
      setChats(e.data);
    };

    const handleMessageEvent = (e: WsCustomEvent<IWSMessageEventData>) => {
      if (!e.data.isSenderSelf) {
        playMessageSound();
      }

      setChats(e.data.chats);
    };

    ws.onmessage = (e: MessageEvent) => {
      const payload = JSON.parse(e.data) as WsCustomEvent;

      switch (payload.event) {
        case ServerSideEventsEnum.Connection:
          handleConnectionEvent(payload);
          break;
        case ServerSideEventsEnum.Message:
          handleMessageEvent(payload);
          break;
        case ServerSideEventsEnum.ChatCreated:
          handleChatCreatedEvent(payload);
          break;
      }
    };
  }, []);

  const requestChats = async () => {
    getChats();
  };

  const [message, setMessageInput] = useState("");

  const resetMessageInput = () => {
    setMessageInput("");
  };

  const handleInputMessage = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  };

  const [pendingSendMesage, setPendingSendMessage] = useState(false);

  //TODO: Add optimistic update for chat messages
  const handleSubmitMessage = async () => {
    if (!selectedChat?.chatId) return;

    try {
      setPendingSendMessage(true);

      const { data } = await sendMessage({
        message,
        chatId: selectedChat.chatId,
      });

      resetMessageInput();
      setChats(data.chats);
    } catch (e) {
    } finally {
      setPendingSendMessage(false);
    }
  };

  const handleInitializeChat = (userId: string) => {
    initializeChat(userId);
  };
  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
  };

  const handleSearchFilteredChats = (search: string) => {
    getFilteredChats(search);
  };

  return (
    <main className="chat-view">
      <ChatComposer
        message={message}
        handleInputMessage={handleInputMessage}
        handleSubmitMessage={handleSubmitMessage}
        isPendingMessageSend={pendingSendMesage}
      />
      <UserSidebar
        onSearchFilteredChats={handleSearchFilteredChats}
        onInitializeChat={handleInitializeChat}
        onSelectExistingChat={handleSelectChat}
        pendingSearchFilteredChats={false}
      ></UserSidebar>
    </main>
  );
}

export default ChatView;
