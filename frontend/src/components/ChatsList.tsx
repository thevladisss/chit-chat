import "./ChatsList.css";
import { useState, JSX, HTMLProps, useMemo } from "react";
import { buildClasses } from "../utils/classes.ts";
import { IChatListItem } from "../types/IChatListItem.ts";
import ChatListItem from "./ChatListItem.tsx";
import { IProspectiveChat } from "../types/IProspectiveChat.ts";

type Props = HTMLProps<HTMLDivElement> & {
  chats: IChatListItem[];
  prospectiveChats: IProspectiveChat[];
  selectedChatId: string | null;
  onSelectExistingChat: (chat: IChatListItem) => void;
  onInitializeChat: (chat: IProspectiveChat) => void;
};
function ChatsList({
  className,
  style,
  chats,
  prospectiveChats,
  selectedChatId,
  onInitializeChat,
  onSelectExistingChat,
}: Props): JSX.Element {
  const classes = buildClasses("chat-list", className ?? "");
  const getLiClasses = (chat: IChatListItem) => {
    return (
      "chat-list-item" +
      (chat.chatId === selectedChatId ? " chat-list-item--active" : "")
    );
  };

  const handleInitializeChat = (chat: IProspectiveChat) => {
    onInitializeChat(chat.userId);
  };

  const sortedCurrentChats = useMemo(() => {
    return chats.toSorted((a, b) => {
      if (a.lastMessageTimestamp < b.lastMessageTimestamp) return -1;
      return 1;
    });
  }, [chats]);
  //
  const sortedProspectiveChats = useMemo(() => {
    return prospectiveChats.toSorted((a, b) => {
      if (a.lastMessageTimestamp < b.lastMessageTimestamp) return -1;
      return 1;
    });
  }, [prospectiveChats]);

  return (
    <div style={style} className={classes}>
      {sortedCurrentChats.length < 0 && sortedProspectiveChats.length < 0 ? (
        <div>You do not have any chatting history</div>
      ) : (
        <ul>
          {sortedCurrentChats.map((chat) => {
            return (
              <ChatListItem
                id={chat.chatId}
                lastMessage={chat.lastMessage ?? ""}
                lastMessageTimestamp={""}
                chatName={chat.name}
                key={chat.chatId}
                onSelectChat={() => onSelectExistingChat(chat.chatId)}
                isDelivered={false}
                isSeen={false}
                isSelected={false}
              ></ChatListItem>
            );
          })}
          {sortedProspectiveChats.map((user) => {
            return (
              <ChatListItem
                id={user.userId}
                lastMessage={null}
                lastMessageTimestamp={"10:05 PM"}
                chatName={user.username}
                key={user.userId}
                isDelivered={false}
                isSeen={false}
                isSelected={false}
                onSelectChat={() => handleInitializeChat(user)}
              ></ChatListItem>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ChatsList;
