import "./ChatsList.css";
import { JSX, HTMLProps, useMemo } from "react";
import { buildClasses } from "../utils/classes.ts";
import { IChatListItem } from "../types/IChatListItem.ts";
import ChatListItem from "./ChatListItem.tsx";
import { IChat } from "../types/IChat.ts";

type Props = HTMLProps<HTMLDivElement> & {
  existingChats: IChat[];
  prospectiveChats: any[];
  selectedChatId: string | null;
  onSelectExistingChat: (chat: IChatListItem) => void;
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
  const classes = buildClasses("chat-list", className ?? "");
  // const getLiClasses = (chat: IChatListItem) => {
  //   return (
  //     "chat-list-item" +
  //     (chat.chatId === selectedChatId ? " chat-list-item--active" : "")
  //   );
  // };

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
                isPersonal={chat.isPersonal}
                isSelected={chat.chatId === selectedChatId}
              ></ChatListItem>
            );
          })}
          {sortedProspectiveChats.map((chat) => {
            return (
              <ChatListItem
                id={chat.userId}
                lastMessage={null}
                lastMessageTimestamp={"10:05 PM"}
                chatName={chat.name}
                key={chat.userId}
                isDelivered={false}
                isSeen={false}
                isSelected={false}
                isPersonal={chat.isPersonal}
                onSelectChat={() => handleInitializeChat(chat.userId)}
              ></ChatListItem>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ChatsList;
