import "./ChatsList.css";
import { useState, JSX, HTMLProps, useMemo } from "react";
import { buildClasses } from "../utils/classes.ts";
import { IChatListItem } from "../types/IChatListItem.ts";
import ChatListItem from "./ChatListItem.tsx";

type Props = HTMLProps<HTMLDivElement> & {
  chats: IChatListItem[];
  prospectiveChats: any[];
  selectedChatId: string | null;
  onSelectExistingChat: (chat: IChatListItem) => void;
  onInitializeChat: (userId: string) => void;
};
function ChatsList({
  className,
  style,
  chats,
  prospectiveChats,
  selectedChatId,
  onInitializeChat,
}: Props): JSX.Element {
  const classes = buildClasses("chat-list", className ?? "");
  const getLiClasses = (chat: IChatListItem) => {
    return (
      "chat-list-item" +
      (chat.id === selectedChatId ? " chat-list-item--active" : "")
    );
  };

  const handleInitializeChat = (username: string) => {
    onInitializeChat(username);
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
                id={chat.id}
                lastMessage={"How are you"}
                lastMessageTimestamp={""}
                chatName={""}
                key={chat.id}
                onSelectChat={() => {}}
                isDelivered={false}
                isSeen={false}
                isSelected={false}
              ></ChatListItem>
            );
          })}
          {sortedProspectiveChats.map((user) => {
            return (
              <ChatListItem
                id={user.id}
                lastMessage={"How are you?"}
                lastMessageTimestamp={"10:05 PM"}
                chatName={user.username}
                key={user.id}
                isDelivered={false}
                isSeen={false}
                isSelected={false}
                onSelectChat={() => handleInitializeChat(user.id)}
              ></ChatListItem>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ChatsList;
