import "./ChatListItem.css";
import { useMemo, type JSX } from "react";
import classNames from "classnames";
import { IUser } from "../types/IUser";
import { formatUnixTimestamp } from "../utils/dateTimeUtil";

type ChatListItemProps = {
  id: string;
  isSelected?: boolean;
  isOnline: boolean;
  typingUsers: IUser[];
  hasUnseenMessage?: boolean;
  chatName: string;
  lastMessage?: string | null;
  lastMessageTimestamp: number | null;

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
        <div className="logo-container">
          <img
            height="44"
            width="44"
            src="/images/user_default_avatar.png"
            alt={chatName}
            className="chat-logo"
          />
        </div>
        <div>
          <div className="flex justify-between">
            <span className="chat-name">{chatName}</span>
            <div className="flex">
              {lastMessageTimestamp && (
                <span className="last-message-timestamp">
                  {formatUnixTimestamp(lastMessageTimestamp)}
                </span>
              )}
              {hasUnseenMessage && (
                <span className={`unread-indicator`}>*</span>
              )}
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
        </div>
      </a>
    </li>
  );
}

export default ChatListItem;
