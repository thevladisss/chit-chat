import "./ChatComposer.css";
import { JSX, useState } from "react";
import ChatInput from "./ChatInputModule.tsx";
import ChatMessage from "./ChatMessage.tsx";
import { useChatStore } from "../hooks/useChatStore.ts";

function ChatComposer({ style }: any): JSX.Element {
  const { selectedChatMessages } = useChatStore();

  return (
    <div className="chat" style={style}>
      {selectedChatMessages.length > 0 ? (
        <>
          <div className="chat-messages-container">
            {selectedChatMessages.map((message) => {
              return (
                <ChatMessage
                  key={message.id}
                  messageId={message.id}
                  chatId={message.chatId}
                  messageText={message.text}
                  isPersonal={message.isPersonal}
                  isSeen={message.isSeen}
                  isDelivered={message.isDelivered}
                  sentTimestamp={message.sentAt}
                />
              );
            })}
          </div>
          <div className="chat-input-container">
            <ChatInput></ChatInput>
          </div>
        </>
      ) : (
        <p>Select chat to start messaging</p>
      )}
    </div>
  );
}

export default ChatComposer;
