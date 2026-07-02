import "./ChatView.css";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sendTextMessage } from "../service/chatSerevice";
import SelectedChatMessagesContainer from "../components/SelectedChatMessagesContainer.tsx";
import ChatComposer from "../components/ChatComposer.tsx";
import { useSelector, useDispatch } from "react-redux";
import { useTimer } from "../hooks/useTimer.ts";
import { useDateTime } from "../hooks/useDateTime.ts";
import { useAudioRecording } from "../hooks/useAudioRecording.ts";
import ChatStatusBar from "../components/ChatStatusBar.tsx";
import {
  leaveSelecteChatAction,
  selectChatAction,
} from "../stores/chat/actions.ts";
import { setChatsAction } from "../stores/chat/slice.ts";
import { selectSelectedChat } from "../stores/user/selectors.ts";
import { SELECT_CHAT_VIEW_PATH } from "../constants/route-paths.ts";
import type { AppDispatch } from "../stores";
import { useWebSocket } from "../hooks/useWebSocket.ts";

interface RouteParams {
  id: string;
  [key: string]: string;
}

function ChatView() {
  const { id } = useParams<RouteParams>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const selectedChat = useSelector(selectSelectedChat);

  useEffect(() => {
    if (id) {
      dispatch(selectChatAction(id));
    }
  }, [id, dispatch]);

  const setChats = (chats: any[]) => dispatch(setChatsAction(chats));

  const selectedChatName = useMemo(
    () => (selectedChat ? selectedChat.name : ""),
    [selectedChat],
  );

  const selectecChatLastOnlineAt = useMemo(() => Date.now() - 1000, []);

  const selectedChatparticipantsCount = useMemo(
    () => (selectedChat ? selectedChat.users.length : null),
    [selectedChat],
  );

  const [message, setMessageInput] = useState("");

  const resetMessageInput = () => {
    setMessageInput("");
  };

  const { getWs } = useWebSocket();

  const sendUserTypingEvent = () => {
    const ws = getWs();

    if (ws?.OPEN && selectedChat) {
      ws.send(
        JSON.stringify({
          event: "typing_in_chat",
          payload: {
            chatId: selectedChat.chatId,
          },
        }),
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
      console.error(e);
    } finally {
      setPendingSendMessage(false);
    }
  };

  const { formatDurationToTime } = useDateTime();

  const [, setLastVoiceMessage] = useState<{
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

  const handleLeaveChat = async () => {
    await dispatch(leaveSelecteChatAction());
    navigate(SELECT_CHAT_VIEW_PATH);
  };

  return (
    <div className="view chat-view">
      {Boolean(selectedChat) && (
        <ChatStatusBar
          lastOnlineAt={selectecChatLastOnlineAt as number}
          chatName={selectedChatName}
          participantsCount={selectedChatparticipantsCount as number}
          onLeaveChat={handleLeaveChat}
        />
      )}
      <div className="chat-view-content">
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
      </div>
    </div>
  );
}

export default ChatView;
