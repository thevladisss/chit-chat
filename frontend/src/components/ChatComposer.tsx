import "./ChatComposer.css";
import { ChangeEvent, FormEvent, JSX } from "react";
import BaseTextField from "./base/BaseTextField.tsx";
import BaseButton from "./base/BaseButton.tsx";

type Props = {
  message: string;
  isPendingMessageSend: boolean;
  voiceMessageRecordingTimeElapsed: string;
  isRecordingVoiceMessage: boolean;
  handleInputMessage: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmitMessage: () => void;
  handleVoiceMessageRecordingStart: () => void;
  handleVoiceMessageRecordingCompleted: () => void;
};

function ChatComposer({
  message,
  isRecordingVoiceMessage,
  isPendingMessageSend,
  voiceMessageRecordingTimeElapsed,
  handleInputMessage,
  handleSubmitMessage,
  handleVoiceMessageRecordingStart,
  handleVoiceMessageRecordingCompleted,
}: Props): JSX.Element {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmitMessage();
  };

  const handleClickVoiceRecordingButton = () => {
    if (!isRecordingVoiceMessage) {
      handleVoiceMessageRecordingStart();
    } else {
      handleVoiceMessageRecordingCompleted();
    }
  };

  return (
    <div className="chat-composer">
      <form onSubmit={handleSubmit} className="chat-input-module">
        <div className="input-container">
          {isRecordingVoiceMessage ? (
            <span className="recording-time">
              {voiceMessageRecordingTimeElapsed}
            </span>
          ) : (
            <BaseTextField
              square
              name="message"
              onInput={handleInputMessage}
              placeholder="Text here..."
              value={message}
              size="large"
              disabled={isRecordingVoiceMessage}
            />
          )}
        </div>
        <div className="actions">
          <BaseButton type="submit">Send</BaseButton>

          {/* TODO: Uncomment when voice messages are supported */}
          {/* {message.length > 0 ? (
            <BaseButton type="submit">Send</BaseButton>
          ) : (
            <VoiceButton
              disabled={isPendingMessageSend}
              recordingElapsedTime={voiceMessageRecordingTimeElapsed}
              onClick={handleClickVoiceRecordingButton}
              isRecording={isRecordingVoiceMessage}
            />
          )
          } */}
        </div>
      </form>
    </div>
  );
}

export default ChatComposer;
