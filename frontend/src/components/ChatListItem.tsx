import "./ChatListItem.css";
import { type JSX } from "react";
import classNames from "classnames";

type ChatListItemProps = {
  isSelected?: boolean;
  hasUnseenMessage?: boolean;
  chatName: string;
  lastMessage?: string | null;
  lastMessageTimestamp?: string;

  onSelectChat: () => void;
};
function ChatListItem({
  isSelected,
  chatName,
  lastMessage,
  lastMessageTimestamp,
  hasUnseenMessage,

  onSelectChat,
}: ChatListItemProps): JSX.Element {
  const classes = classNames("chat-list-item", {
    selected: isSelected,
  });

  return (
    <li className={classes} tabIndex={0} onClick={() => onSelectChat()}>
      <a role="button">
        <div className="flex justify-between">
          <span className="chat-name">{chatName}</span>
          <div className="flex">
            <span className="last-message-timestamp">
              {lastMessageTimestamp}
            </span>
            {hasUnseenMessage && <span className={`unread-indicator`}>*</span>}
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
