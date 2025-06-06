import "./ChatComposer.css";
import { JSX, useState } from "react";
import ChatInput from "./ChatInputModule.tsx";
import ChatMessage from "./ChatMessage.tsx";
import { useChatStore } from "../hooks/useChatStore.ts";

function ChatComposer({ style }: any): JSX.Element {
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
                      messageText={message.text}
                      isPersonal={message.isPersonal}
                      isSeen={message.isSeen}
                      isDelivered={message.isDelivered}
                      sentTimestamp={message.sentAt}
                    />
                  );
                })
              : `Start messaging with ${selectedChat.username} `}
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
