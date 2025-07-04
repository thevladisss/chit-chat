import "./ChatMessage.css";
import { type JSX } from "react";

type Props = {
  messageId: string;
  chatId: string;
  text: string;
  isPersonal: boolean;
  isSeen: boolean;
  isDelivered: boolean;
  sentTimestamp: string;
}

function ChatMessage({
  isPersonal,
  isSeen,
  sentTimestamp,
  text,
}: Props): JSX.Element {
  return (
    <div
      className={`chat-message ${isPersonal ? "chat-message--personal" : ""}`}
    >
      <div className="flex justify-between gap-4">
        <span>{text}</span>
        <div>
          <span className="sent-timestamp">{sentTimestamp}</span>
          <span>{isSeen ? <span>*</span> : ""}</span>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
