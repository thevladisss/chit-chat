import "./ChatView.css";
import { use, useEffect, useMemo, useState } from "react";
import { initializeChat } from "../service/chatSerevice";

import ChatComposer from "../components/ChatComposer.tsx";

import UserSidebar from "../components/UserSidebar.tsx";
import { useStore } from "../hooks/useStore.ts";

import { useChatStore } from "../hooks/useChatStore.ts";

function ChatView() {
  const { getChats } = useChatStore();
  let ws;

  const { dispatch } = useStore();

  useEffect(() => {
    if (!ws) {
      ws = new WebSocket(import.meta.env.VITE_WS_URL);
    }

    ws.onopen = () => {
      requestChats();
    };
  }, []);

  const [activeChat, setActiveChat] = useState<string | null>(null);

  const [chats, setChats] = useState<any[]>([]);
  const [prospectiveChats, setProspectiveChats] = useState<any[]>([]);

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
