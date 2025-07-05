import "./ChatComposer.css";
import { ChangeEvent, HTMLProps, JSX } from "react";
import ChatInput from "./ChatInputModule.tsx";
import ChatMessage from "./ChatMessage.tsx";
import { useChatStore } from "../hooks/useChatStore.ts";
import { IChatMessage } from "../types/IChatMessage.ts";

type Props = HTMLProps<HTMLDivElement> & {
  message: string;
  isPendingMessageSend: boolean;
  handleInputMessage: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmitMessage: () => void;
};

function ChatComposer({
  style,
  message,
  handleInputMessage,
  handleSubmitMessage,
  isPendingMessageSend,
}: Props): JSX.Element {
  const { selectedChat, selectedChatMessages } = useChatStore();

  const getMessageSentTimestamp = (message: IChatMessage) => {
    return new Date(message.sentAt).toLocaleTimeString();
  };

  return (
    <div className="chat" style={style}>
      {selectedChat ? (
        <>
          <div className="chat-messages-container">
            {selectedChatMessages.length > 0 ? (
              selectedChatMessages.map((message) => {
                return (
                  <ChatMessage
                    key={message.messageId}
                    messageId={message.messageId}
                    chatId={message.chatId}
                    text={message.text}
                    isPersonal={message.isPersonal}
                    isSeen={message.isSeen}
                    isDelivered={message.isDelivered}
                    sentTimestamp={getMessageSentTimestamp(message)}
                  />
                );
              })
            ) : (
              <h3 className="no-messages-placeholder">
                {`Start messaging with ${selectedChat.name} `}
              </h3>
            )}
          </div>
          <div className="chat-input-container">
            <ChatInput
              loading={isPendingMessageSend}
              messageInput={message}
              onInputMessage={handleInputMessage}
              onSubmitMessage={handleSubmitMessage}
            ></ChatInput>
          </div>
        </>
      ) : (
        <h3 className="no-chat-selected-placeholder">
          Select chat to start messaging
        </h3>
      )}
    </div>
  );
}

export default ChatComposer;
