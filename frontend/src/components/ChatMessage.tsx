import "./ChatMessage.css";
import { type JSX } from "react";

function ChatMessage({
  isPersonal,
  isSeen,
  isDelivered,
  sentTimestamp,
  messageText,
}: {
  messageText: string;
  isPersonal: boolean;
  isSeen: boolean;
  isDelivered: boolean;
  sentTimestamp: string;
}): JSX.Element {
  return (
    <div
      className={`chat-message ${isPersonal ? "chat-message--personal" : ""}`}
    >
      <div className="flex justify-between gap-4">
        <span>{messageText}</span>
        <div>
          <span className="sent-timestamp">{sentTimestamp}</span>
          <span>{isSeen ? <span>*</span> : ""}</span>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
