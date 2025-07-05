import "./ChatInputModule.css";
import { ChangeEvent, FormEvent, type JSX } from "react";
import BaseTextField from "./base/BaseTextField.tsx";
import BaseButton from "./base/BaseButton.tsx";

type Props = {
  onSubmitMessage: (message: string) => void;
  onInputMessage: (e: ChangeEvent<HTMLInputElement>) => void;
  messageInput: string;
  loading: boolean;
};

function ChatInputModule({
  onSubmitMessage,
  onInputMessage,
  messageInput,
  loading,
}: Props): JSX.Element {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    onSubmitMessage(messageInput);
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-module">
      <div className="input-container">
        <BaseTextField
          square
          onInput={onInputMessage}
          placeholder="Text here..."
          value={messageInput}
        ></BaseTextField>
      </div>
      <div className="actions">
        <BaseButton type="submit">Send</BaseButton>
      </div>
    </form>
  );
}

export default ChatInputModule;
