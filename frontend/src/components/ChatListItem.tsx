import "./ChatListItem.css";
import { type JSX, useState } from "react";
import { buildClasses } from "../utils/classes.ts";

type ChatListItemProps = {
  id: string;
  isSelected: boolean;
  isDelivered: boolean;
  isSeen: boolean;
  isPersonal: boolean;
  chatName: string;
  lastMessage: string | null;
  lastMessageTimestamp: string;

  onSelectChat: () => void;
};
function ChatListItem({
  id,
  isSelected,
  chatName,
  lastMessage,
  lastMessageTimestamp,
  isDelivered,
  isSeen,

  onSelectChat,
}: ChatListItemProps): JSX.Element {
  const classes = buildClasses("chat-list-item", {
    "chat-list-item--active": isSelected,
  });

  return (
    <li className={classes} tabIndex={0}>
      <a role="button" onClick={() => onSelectChat()}>
        <div className="flex justify-between">
          <span className="chat-name">{chatName}</span>
          <div className="flex">
            <span className="last-message-timestamp">
              {lastMessageTimestamp}
            </span>
            <span className={`status`}>*</span>
          </div>
        </div>
        {lastMessage ? (
          <span className="last-message">{lastMessage}</span>
        ) : (
          <span className="no-messages-placeholder">
            No messages in this chat yet...
          </span>
        )}
      </a>
    </li>
  );
}

export default ChatListItem;
