import "./ChatInputModule.css";
import { type JSX, useState } from "react";
import TextField from "./base/TextField.tsx";
import BaseButton from "./base/BaseButton.tsx";

function ChatInputModule(props: any): JSX.Element {
  const [value, setValue] = useState("React Component");

  return (
    <form onSubmit={(e) => e.preventDefault()} className="chat-input-module">
      <div className="input-container">
        <TextField placeholder="Text here..."></TextField>
      </div>
      <div className="actions">
        <BaseButton type="submit">Send</BaseButton>
      </div>
    </form>
  );
}

export default ChatInputModule;
