import "./ChatView.css";
import { use, useEffect, useMemo, useState } from "react";
import { initializeChat } from "../service/chatSerevice";

import ChatComposer from "../components/ChatComposer.tsx";

import UserSidebar from "../components/UserSidebar.tsx";
import { useStore } from "../hooks/useStore.ts";

import { useChatStore } from "../hooks/useChatStore.ts";
import { ServerSideEventsEnum } from "../enums/ServerSideEventsEnum.ts";

function ChatView() {
  const { getChats, setChats } = useChatStore();
  let ws;

  const { dispatch } = useStore();

  useEffect(() => {
    if (!ws) {
      ws = new WebSocket(import.meta.env.VITE_WS_URL);
    }

    ws.onopen = () => {
      requestChats();
    };

    ws.onmessage = (e) => {
      const eventData = JSON.parse(e.data);

      if (eventData.event === ServerSideEventsEnum.NewConnection) {
        //TODO: Get data from WS response

        const chats = eventData.data.chats,
          prospectiveChats = eventData.data.prospectiveChats;

        setChats({
          chats,
          prospectiveChats,
        });
      }
    };
  }, []);

  const [activeChat, setActiveChat] = useState<string | null>(null);

  const [isLoadingChats, setLoadingChats] = useState(false);

  const requestChats = async () => {
    getChats();
  };

  const handleSelectExistingChat = (chat: any) => {};

  const [pendingInitializeChat, setInitializeChatPendingStatus] =
    useState(false);
  const handleInitializeChat = async (username: string) => {
    try {
      setInitializeChatPendingStatus(true);

      await initializeChat(username);
    } catch (e) {
      // TODO: Handle error
    } finally {
      setInitializeChatPendingStatus(false);
    }
  };

  return (
    <main className="chat-view">
      <ChatComposer />
      {/*<ChatsList*/}
      {/*  prospectiveChats={prospectiveChats}*/}
      {/*  chats={chats}*/}
      {/*  selectedChatId={null}*/}
      {/*  onSelectExistingChat={handleSelectExistingChat}*/}
      {/*  onInitializeChat={handleInitializeChat}*/}
      {/*/>*/}
      <UserSidebar></UserSidebar>
    </main>
  );
}

export default ChatView;
