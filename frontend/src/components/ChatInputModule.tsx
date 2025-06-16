import "./ChatInputModule.css";
import { ChangeEvent, FormEvent, type JSX, useState } from "react";
import TextField from "./base/TextField.tsx";
import BaseButton from "./base/BaseButton.tsx";

function ChatInputModule({
  onSubmitMessage,
  onInputMessage,
  messageInput,
}: any): JSX.Element {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    onSubmitMessage(messageInput);
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-module">
      <div className="input-container">
        <TextField
          onInput={onInputMessage}
          placeholder="Text here..."
        ></TextField>
      </div>
      <div className="actions">
        <BaseButton type="submit">Send</BaseButton>
      </div>
    </form>
  );
}

export default ChatInputModule;
