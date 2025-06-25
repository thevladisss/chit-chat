import "./ChatView.css";
import { ChangeEvent, use, useEffect, useMemo, useState } from "react";
import { initializeChat, sendMessage } from "../service/chatSerevice";

import ChatComposer from "../components/ChatComposer.tsx";

import UserSidebar from "../components/UserSidebar.tsx";
import { useStore } from "../hooks/useStore.ts";

import { useChatStore } from "../hooks/useChatStore.ts";
import { ServerSideEventsEnum } from "../enums/ServerSideEventsEnum.ts";

function ChatView() {
  const { getChats, selectedChat, setChats } = useChatStore();
  let ws;

  const { dispatch } = useStore();

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

    const handleMessageEvent = (e: WsCustomEvent) => {
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
      //
      // if (eventData.event === ServerSideEventsEnum.NewConnection) {
      //   //TODO: Get data from WS response
      //
      //   const chats = eventData.data.chats,
      //     prospectiveChats = eventData.data.prospectiveChats;
      //
      //   // setChats({
      //   //   chats,
      //   //   prospectiveChats,
      //   // });
      // }
    };
  }, []);

  // const [activeChat, setActiveChat] = useState<string | null>(null);
  //
  // const [isLoadingChats, setLoadingChats] = useState(false);
  //
  const requestChats = async () => {
    getChats();
  };

  const [message, setMessageInput] = useState("");

  const handleInputMessage = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  };
  const handleSubmitMessage = async (message: string) => {
    const { data } = await sendMessage({
      message,
      chatId: selectedChat.chatId,
    });

    setChats(data.chats);
  };

  const handleInitializeChat = () => {};
  const handleSelectChat = () => {};

  return (
    <main className="chat-view">
      <ChatComposer
        message={message}
        handleInputMessage={handleInputMessage}
        handleSubmitMessage={handleSubmitMessage}
        pendingSendMessage={false}
      />
      <UserSidebar
        handleInitializeChat={handleInitializeChat}
        handleSelectChat={handleSelectChat}
      ></UserSidebar>
    </main>
  );
}

export default ChatView;
