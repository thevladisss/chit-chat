import "./ChatComposer.css";
import { ChangeEvent, JSX, useState } from "react";
import ChatInput from "./ChatInputModule.tsx";
import ChatMessage from "./ChatMessage.tsx";
import { useChatStore } from "../hooks/useChatStore.ts";
import * as React from "react";

function ChatComposer({ style, message, handleInputMessage, handleSubmitMessage, pendingSendMessage }: {
  style: React.CSSProperties;
  message: string;
  handleInputMessage: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmitMessage: () => void;
  pendingSendMessage: boolean
}): JSX.Element {
  const { selectedChat, selectedChatMessages } = useChatStore();


  return (
    <div className="chat" style={style}>
      {selectedChat ? (
        <>
          <div className="chat-messages-container">
            {selectedChatMessages.length > 0
              ? selectedChatMessages.map((message) => {
                  return (
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
                  );
                })
              : `Start messaging with ${selectedChat.name} `}
          </div>
          <div className="chat-input-container">
            <ChatInput
              messageInput={message}
              onInputMessage={handleInputMessage}
              onSubmitMessage={handleSubmitMessage}
            ></ChatInput>
          </div>
        </>
      ) : (
        <p>Select chat to start messaging</p>
      )}
    </div>
  );
}

export default ChatComposer;
