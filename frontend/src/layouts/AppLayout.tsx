import { Outlet } from "react-router-dom";

import UserSidebar from "../components/UserSidebar.tsx";
import "./AppLayout.css";
import { useEffect, useRef } from "react";
import { ServerSideEventsEnum } from "../enums/ServerSideEventsEnum.ts";
import { IUser } from "../types/IUser.ts";
import { IWSMessageEventData } from "../types/ws/IWSMessageEventData.ts";
import {
  setSelectedChatAction,
  setChatsAction,
  setTypingInChat,
  deleteTypingInChat,
} from "../stores/chat/slice.ts";
import { useSelector, useDispatch } from "react-redux";
import { useWebSocketContext } from "../contexts/websocket.context.ts";
import { selectUserName } from "../stores/chat/selectors.ts";
import { getChatsAction } from "../stores/chat/actions.ts";
import type { AppDispatch } from "../stores";

const messageSound = new Audio("/sounds/message.mp3");

type WsCustomEvent<R = any> = { event: string; data: R };

function AppLayout() {
  const playMessageSound = async () => {
    await messageSound.play();
  };

  const username = useSelector(selectUserName);
  const dispatch = useDispatch<AppDispatch>();

  const getChats = () => dispatch(getChatsAction());
  const setChats = (chats: any[]) => dispatch(setChatsAction(chats));
  const setTypingChat = (chatId: string, users: IUser[]) =>
    dispatch(setTypingInChat({ chatId, users }));
  const deleteTypingChat = (chatId: string) =>
    dispatch(deleteTypingInChat({ chatId }));

  const typingTimeout = useRef<Record<string, NodeJS.Timeout>>({});

  const getWebSocket = useWebSocketContext();

  const handleWsOpen = () => {
    getChats();
  };

  const handleConnectionEvent = (e: WsCustomEvent) => {
    setChats(e.data.chats);
  };

  const handleLeaveConnectionEvent = (e: WsCustomEvent) => {
    setChats(e.data.chats);
  };

  const handleNewUserEvent = (e: WsCustomEvent) => {
    getChats();
  };

  const handleChatCreatedEvent = (e: WsCustomEvent) => {
    setChats(e.data);
  };

  const handleMessageEvent = (e: WsCustomEvent<IWSMessageEventData>) => {
    if (!e.data.isSenderSelf) {
      playMessageSound();
    }

    setChats(e.data.chats);
    dispatch(setSelectedChatAction(e.data.chat));
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

  const handleWsMessage = (e: MessageEvent) => {
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

  useEffect(() => {
    const ws = getWebSocket();

    if (ws) {
      ws.onopen = () => {
        handleWsOpen();
      };

      ws.onmessage = (e: MessageEvent) => {
        handleWsMessage(e);
      };
    } else {
      console.error("WebSocket connection not established");
    }
  }, []);

  return (
    <div className="app-layout">
      <header className="app-layout-header">
        <h1>
          Chit-Chat - <span>{username}</span>
        </h1>
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
