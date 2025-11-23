import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser.tsx";
import { AUTH_PATH } from "../constants/route-paths.ts";
import UserSidebar from "../components/UserSidebar.tsx";
import "./AppLayout.css";
import { useEffect, useRef } from "react";
import { ServerSideEventsEnum } from "../enums/ServerSideEventsEnum.ts";
import { useChatStore } from "../hooks/useChatStore.ts";
import { IUser } from "../types/IUser.ts";
import { IWSMessageEventData } from "../types/ws/IWSMessageEventData.ts";

const messageSound = new Audio("/sounds/message.mp3");

function AppLayout() {
  const playMessageSound = async () => {
    await messageSound.play();
  };

  const { getChats, setChats, setTypingChat, deleteTypingChat } =
    useChatStore();

  const typingTimeout = useRef<Record<string, NodeJS.Timeout>>({});

  let ws: WebSocket | null = null;

  useEffect(() => {
    if (!ws) {
      ws = new WebSocket(import.meta.env.VITE_WS_URL || "ws://localhost:3000");
      window.ws = ws;
    }

    ws.onopen = () => {
      getChats();
    };

    type WsCustomEvent<R = any> = { event: string; data: R };

    const handleConnectionEvent = (e: WsCustomEvent) => {
      setChats(e.data.chats);
    };

    const handleLeaveConnectionEvent = (e: WsCustomEvent) => {
      setChats(e.data.chats);
    };

    const handleNewUserEvent = (e: WsCustomEvent) => {
      getChats();
    };

    const TYPING_CLEAR_TIMEOUT = 2000;

    const handleTypingInChatEvent = (e: WsCustomEvent) => {
      const chatId = e.data.chatId as string,
        user = e.data.user as IUser;

      setTypingChat(chatId, [user]);

      if (typingTimeout.current[chatId]) {
        clearTimeout(typingTimeout.current[chatId]);
      }

      typingTimeout.current[chatId] = setTimeout(() => {
        deleteTypingChat(chatId);
      }, TYPING_CLEAR_TIMEOUT);
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
        case ServerSideEventsEnum.LeaveConnection:
          handleLeaveConnectionEvent(payload);
          break;
        case ServerSideEventsEnum.Message:
          handleMessageEvent(payload);
          break;
        case ServerSideEventsEnum.ChatCreated:
          handleChatCreatedEvent(payload);
          break;
        case ServerSideEventsEnum.NewUser:
          handleNewUserEvent(payload);
          break;
        case ServerSideEventsEnum.TypingInChat:
          handleTypingInChatEvent(payload);
          break;
      }
    };
  }, []);

  return (
    <div className="app-layout">
      <header className="app-layout-header">
        <h1>Chit-Chat</h1>
      </header>

      <div className="app-layout-content">
        <div>
          <UserSidebar></UserSidebar>
        </div>
        <main className="app-layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
