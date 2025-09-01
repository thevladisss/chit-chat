import "./ChatInputModule.css";
import { ChangeEvent, FormEvent, type JSX } from "react";
import BaseTextField from "./base/BaseTextField.tsx";
import BaseButton from "./base/BaseButton.tsx";
import VoiceButton from "./VoiceButton.tsx";

type Props = {
  messageInput: string;
  loading: boolean;
  isRecording: boolean;
  voiceMessageRecordingTimeElapsed: string;

  onSubmitMessage: (message: string) => void;
  onInputMessage: (e: ChangeEvent<HTMLInputElement>) => void;
  onVoiceRecordingStart: () => void;
  onVoiceRecordingComplete: () => void;
};

function ChatInputModule({
  messageInput,
  loading,
  isRecording,
  voiceMessageRecordingTimeElapsed,

  onVoiceRecordingStart,
  onVoiceRecordingComplete,
  onSubmitMessage,
  onInputMessage,
}: Props): JSX.Element {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    onSubmitMessage(messageInput);
  };

  const handleClickVoiceRecordingButton = () => {
    if (!isRecording) {
      onVoiceRecordingStart();
    } else {
      onVoiceRecordingComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-module">
      <div className="input-container">
        {isRecording ? (
          <span className="recording-time">
            {voiceMessageRecordingTimeElapsed}
          </span>
        ) : (
          <BaseTextField
            square
            name="message"
            onInput={onInputMessage}
            placeholder="Text here..."
            value={messageInput}
            disabled={isRecording}
          />
        )}
      </div>
      <div className="actions">
        {messageInput.length > 0 ? (
          <BaseButton type="submit">Send</BaseButton>
        ) : (
          <VoiceButton
            disabled={loading}
            recordingElapsedTime={voiceMessageRecordingTimeElapsed}
            onClick={handleClickVoiceRecordingButton}
            isRecording={isRecording}
          />
        )}
      </div>
    </form>
  );
}

export default ChatInputModule;
