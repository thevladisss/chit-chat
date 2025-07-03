import "./ChatsList.css";
import { JSX, HTMLProps, useMemo } from "react";
import ChatListItem from "./ChatListItem.tsx";
import { IChat } from "../types/IChat.ts";
import classNames from "classnames";

type Props = HTMLProps<HTMLDivElement> & {
  existingChats: IChat[];
  prospectiveChats: any[];
  selectedChatId: string | null;
  onSelectExistingChat: (chaId: string) => void;
  onInitializeChat: (userId: string) => void;
};
function ChatsList({
  className,
  style,
  existingChats,
  prospectiveChats,
  selectedChatId,
  onInitializeChat,
  onSelectExistingChat,
}: Props): JSX.Element {
  const classes = classNames("chat-list", className);

  const handleInitializeChat = (userId: string) => {
    onInitializeChat(userId);
  };

  const sortedCurrentChats = useMemo(() => {
    return existingChats.toSorted((a, b) => {
      if (a.lastMessageTimestamp < b.lastMessageTimestamp) return -1;
      return 1;
    });
  }, [existingChats]);

  const sortedProspectiveChats = useMemo(() => {
    return prospectiveChats.toSorted((a, b) => {
      if (a.lastMessageTimestamp < b.lastMessageTimestamp) return -1;
      return 1;
    });
  }, [prospectiveChats]);

  const hasChats = useMemo(() => {
    return sortedCurrentChats.length > 0 || sortedProspectiveChats.length > 0;
  }, [sortedCurrentChats, sortedProspectiveChats]);

  const getChatLastMessageTimestamp = (chat: IChat) => {
    return chat.lastMessageTimestamp
      ? new Date(chat.lastMessageTimestamp).toLocaleTimeString()
      : "";
  };

  return (
    <div style={style} className={classes}>
      {hasChats ? (
        <ul>
          {sortedCurrentChats.map((chat) => {
            return (
              <ChatListItem
                id={chat.chatId}
                lastMessage={chat.lastMessage ? chat.lastMessage.text : ""}
                lastMessageTimestamp={getChatLastMessageTimestamp(chat)}
                chatName={chat.name}
                key={chat.chatId}
                onSelectChat={() => onSelectExistingChat(chat.chatId)}
                hasUnseenMessage={false}
                isSelected={chat.chatId === selectedChatId}
              ></ChatListItem>
            );
          })}
          {sortedProspectiveChats.map((chat) => {
            return (
              <ChatListItem
                id={chat.userId}
                chatName={chat.name}
                key={chat.userId}
                onSelectChat={() => handleInitializeChat(chat.userId)}
              ></ChatListItem>
            );
          })}
        </ul>
      ) : (
        <div className="no-history-placeholder">
          You do not have any chatting history
        </div>
      )}
    </div>
  );
}

export default ChatsList;
