import "./ChatsList.css";
import { JSX, HTMLProps, useMemo } from "react";
import ChatListItem from "./ChatListItem.tsx";
import { IChat } from "../types/IChat.ts";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { RootState } from "../stores/index.ts";

type Props = HTMLProps<HTMLDivElement> & {
  chats: IChat[];
  selectedChatId: string | null;
  isSearchingChats?: boolean;

  onSelectChat: (chaId: string) => void;
};
function ChatsList({
  className,
  style,
  chats,
  selectedChatId,
  isSearchingChats,

  onSelectChat,
}: Props): JSX.Element {
  const classes = classNames("chat-list", className);

  const typingInChat = useSelector(
    (state: RootState) => state.chatState.typingChats,
  );

  const sortedCurrentChats = useMemo(() => {
    //TODO: Revisit sorting logic.
    // Add sortin by name for chats without messages
    
    return chats.toSorted((a, b) => {
      const areChatsWithMessages = Boolean(
        a.messages.length && b.messages.length,
      );

      if (areChatsWithMessages) {
        if (
          (a.lastMessageTimestamp as number) <
          (b.lastMessageTimestamp as number)
        )
          return -1;
      }

      return 1;
    });
  }, [chats]);

  const hasChats = useMemo(() => {
    return sortedCurrentChats.length > 0;
  }, [sortedCurrentChats]);

  const getTypingsUsersInChat = (chatId: string) => {
    return chatId in typingInChat ? typingInChat[chatId] : [];
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
                lastMessageTimestamp={chat.lastMessageTimestamp}
                chatName={chat.name}
                key={chat.chatId}
                onSelectChat={() => onSelectChat(chat.chatId)}
                hasUnseenMessage={false}
                typingUsers={getTypingsUsersInChat(chat.chatId)}
                isSelected={chat.chatId === selectedChatId}
                isOnline={chat.online}
              ></ChatListItem>
            );
          })}
        </ul>
      ) : isSearchingChats ? (
        <div className="no-chats-found-placeholder">No chats found</div>
      ) : (
        <p className="no-history-placeholder">
          You do not have any chatting history
        </p>
      )}
    </div>
  );
}

export default ChatsList;
