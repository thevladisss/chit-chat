import "./ChatListItem.css";
import { useMemo, type JSX } from "react";
import classNames from "classnames";
import { IUser } from "../types/IUser";

type ChatListItemProps = {
  id: string;
  isSelected?: boolean;
  isOnline: boolean;
  typingUsers: IUser[];
  hasUnseenMessage?: boolean;
  chatName: string;
  lastMessage?: string | null;
  lastMessageTimestamp?: string;

  onSelectChat: () => void;
};
function ChatListItem({
  isSelected,
  isOnline,
  typingUsers,
  chatName,
  lastMessage,
  lastMessageTimestamp,
  hasUnseenMessage,

  onSelectChat,
}: ChatListItemProps): JSX.Element {
  const classes = classNames("chat-list-item", {
    selected: isSelected,
    online: isOnline,
  });

  const typingUsersPlaceholder = useMemo(() => {
    return typingUsers.length === 1
      ? `${typingUsers[0].username} is typing`
      : `${typingUsers.map(({ username }) => username).join(",")} are typing...`;
  }, [typingUsers]);

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
        {typingUsers.length > 0 ? (
          <span className="typing-placeholder">{typingUsersPlaceholder}</span>
        ) : lastMessage ? (
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
