import "./SelectedChatMessagesContainer.css";
import { HTMLProps, JSX, useMemo } from "react";
import ChatMessage from "./ChatMessage.tsx";
import { useChatStore } from "../hooks/useChatStore.ts";

type Props = HTMLProps<HTMLDivElement>;

function SelectedChatMessagesContainer({ style }: Props): JSX.Element {
  const { selectedChat, selectedChatMessages } = useChatStore();

  const selectedChatName = useMemo(() => {
    return selectedChat ? selectedChat.name : "";
  }, [selectedChat]);

  return (
    <div className="selected-chat-messages-container" style={style}>
      {selectedChatMessages.length > 0 ? (
        <div className="chat-messages-container">
          {selectedChatMessages.map((message) => (
            <ChatMessage
              key={message.messageId}
              messageId={message.messageId}
              chatId={message.chatId}
              text={message.text}
              isPersonal={message.isPersonal}
              isSeen={message.isSeen}
              isDelivered={message.isDelivered}
              sentTimestamp={message.sentAt}
            />
          ))}
        </div>
      ) : (
        <h3 className="no-messages-placeholder">
          {`Start messaging with ${selectedChatName} `}
        </h3>
      )}
    </div>
  );
}

export default SelectedChatMessagesContainer;
