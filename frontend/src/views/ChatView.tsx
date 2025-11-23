import "./ChatView.css";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { sendTextMessage } from "../service/chatSerevice";
import SelectedChatMessagesContainer from "../components/SelectedChatMessagesContainer.tsx";
import ChatComposer from "../components/ChatComposer.tsx";
import { useChatStore } from "../hooks/useChatStore.ts";
import { useTimer } from "../hooks/useTimer.ts";
import { useDateTime } from "../hooks/useDateTime.ts";
import { ServerSideEventsEnum } from "../enums/ServerSideEventsEnum.ts";
import { IWSMessageEventData } from "../types/ws/IWSMessageEventData.ts";
import { useAudioRecording } from "../hooks/useAudioRecording.ts";
import ChatStatusBar from "../components/ChatStatusBar.tsx";
import { IUser } from "../types/IUser.ts";

declare global {
  interface Window {
    ws?: WebSocket;
  }
}

const messageSound = new Audio("/sounds/message.mp3");

function ChatView() {
  const playMessageSound = async () => {
    await messageSound.play();
  };

  const { getChats, selectedChat, setChats, setTypingChat, deleteTypingChat } =
    useChatStore();

  const selectedChatName = useMemo(
    () => (selectedChat ? selectedChat.name : ""),
    [selectedChat]
  );

  const selectecChatLastOnlineAt = useMemo(() => Date.now() - 1000, []);

  const selectedChatparticipantsCount = useMemo(
    () => (selectedChat ? selectedChat.users.length : null),
    [selectedChat]
  );

  const typingTimeout = useRef<Record<string, NodeJS.Timeout>>({});

  let ws: WebSocket | null = null;

  useEffect(() => {
    if (!ws) {
      ws = new WebSocket(import.meta.env.VITE_WS_URL || "ws://localhost:3000");
      (window as any).ws = ws;
    }

    ws.onopen = () => {
      requestChats();
    };

    type WsCustomEvent<R = any> = { event: string; data: R };

    const handleConnectionEvent = (e: WsCustomEvent) => {
      setChats(e.data.chats);
    };

    const handleLeaveConnectionEvent = (e: WsCustomEvent) => {
      setChats(e.data.chats);
    };

    const handleNewUserEvent = (e: WsCustomEvent) => {
      requestChats();
    };

    const TYPING_CLEAR_TIMEOUT = 2000;

    const handleTypingInChatEvent = (e: WsCustomEvent) => {
      const chatId = e.data.chatId as string,
        userId = e.data.userId as string,
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

  const requestChats = async () => {
    getChats();
  };

  const [message, setMessageInput] = useState("");

  const resetMessageInput = () => {
    setMessageInput("");
  };

  const sendUserTypingEvent = () => {
    if (window?.ws?.OPEN && selectedChat) {
      window.ws.send(
        JSON.stringify({
          event: "typing_in_chat",
          payload: {
            chatId: selectedChat.chatId,
          },
        })
      );
    }
  };

  const handleInputMessage = (e: ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    sendUserTypingEvent();
  };

  const [pendingSendMessage, setPendingSendMessage] = useState(false);

  //TODO: Add optimistic update for chat messages
  const handleSubmitMessage = async () => {
    if (!selectedChat?.chatId) return;

    try {
      setPendingSendMessage(true);

      const { data } = await sendTextMessage({
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

  const { formatDurationToTime } = useDateTime();

  const [lastVoiceMessage, setLastVoiceMessage] = useState<{
    blob: Blob;
    duration: number;
  } | null>(null);

  const sendVoiceMessageRecording = async (recordingData: {
    blob: Blob;
    duration: number;
  }) => {
    setLastVoiceMessage(recordingData);

    playAudioRecording(recordingData.blob);
  };

  const {
    isRecording: isRecordingVoiceMessage,
    startRecording,
    stopRecording,
    playAudioRecording,
  } = useAudioRecording({
    onStartRecording: () => {
      resetRecordingTimer();
      startRecordingTimer();
    },
    onStopRecording: (recording: Blob) => {
      setLastVoiceMessage({
        blob: recording,
        duration: elapsedRecordingTime,
      });

      stopRecordingTimer();
      resetRecordingTimer();

      sendVoiceMessageRecording({
        blob: recording,
        duration: elapsedRecordingTime,
      });
    },
  });

  const {
    resetTimer: resetRecordingTimer,
    startTimer: startRecordingTimer,
    stopTimer: stopRecordingTimer,
    elapsedTime: elapsedRecordingTime,
  } = useTimer();

  const elapsedRecordingTimeFormatted = useMemo(() => {
    return formatDurationToTime(elapsedRecordingTime);
  }, [elapsedRecordingTime]);

  const handleVoiceRecordingStarted = () => {
    startRecording();
  };

  const handleVoiceRecordingStop = () => {
    stopRecording();
  };

  return (
    <div className="view chat-view">
      {Boolean(selectedChat) && (
        <ChatStatusBar
          lastOnlineAt={selectecChatLastOnlineAt}
          chatName={selectedChatName}
          participantsCount={selectedChatparticipantsCount}
        />
      )}
      <div className="chat-view-content">
        {!Boolean(selectedChat) ? (
          <p className="select-chat-placeholder">Please select chat</p>
        ) : (
          <>
            <SelectedChatMessagesContainer />
            <ChatComposer
              message={message}
              voiceMessageRecordingTimeElapsed={elapsedRecordingTimeFormatted}
              isPendingMessageSend={pendingSendMessage}
              isRecordingVoiceMessage={isRecordingVoiceMessage}
              handleInputMessage={handleInputMessage}
              handleSubmitMessage={handleSubmitMessage}
              handleVoiceMessageRecordingStart={handleVoiceRecordingStarted}
              handleVoiceMessageRecordingCompleted={handleVoiceRecordingStop}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default ChatView;
