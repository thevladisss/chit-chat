import "./ChatView.css";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { sendTextMessage } from "../service/chatSerevice";
import SelectedChatMessagesContainer from "../components/SelectedChatMessagesContainer.tsx";
import ChatComposer from "../components/ChatComposer.tsx";
import { useChatStore } from "../hooks/useChatStore.ts";
import { useTimer } from "../hooks/useTimer.ts";
import { useDateTime } from "../hooks/useDateTime.ts";
import { useAudioRecording } from "../hooks/useAudioRecording.ts";
import ChatStatusBar from "../components/ChatStatusBar.tsx";

function ChatView() {
  const { selectedChat, setChats } = useChatStore();

  const selectedChatName = useMemo(
    () => (selectedChat ? selectedChat.name : ""),
    [selectedChat]
  );

  const selectecChatLastOnlineAt = useMemo(() => Date.now() - 1000, []);

  const selectedChatparticipantsCount = useMemo(
    () => (selectedChat ? selectedChat.users.length : null),
    [selectedChat]
  );

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
