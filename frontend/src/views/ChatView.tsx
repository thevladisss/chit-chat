import "./ChatView.css"
import {use, useEffect, useMemo, useState} from 'react';
import SignInForm from "../components/SignInForm.tsx";
import {getAllChats} from "../service/chatSerevice";
import {type IChat} from "../types/IChat.ts";
import {type IUser} from "../types/IUser.ts";
import Chat from "../components/Chat.tsx";
import ChatsList from "../components/ChatsList.tsx";
import {IChatListItem} from "../types/IChatListItem.ts";



function ChatView() {

  let ws;

  useEffect(() => {
    if (!ws) {
      ws = new WebSocket(import.meta.env.VITE_WS_URL)
    }

    ws.onopen = () => {
    }

  }, []);

  const [activeChat, setActiveChat] = useState<string | null>(null)

  const [chats, setChats] = useState<any[]>([])
  const [prospectiveChats, setProspectiveChats] = useState<any[]>([])

  const [isLoadingChats, setLoadingChats] = useState(false)

  const requestChats = async () => {
    try {
      setLoadingChats(true);

      const { data } = await getAllChats();

      setChats(data.chats)
      setProspectiveChats(data.prospectiveChats)
    }
    catch(e) {
      //todo: handle error
    }
    finally {
      setLoadingChats(false)
    }
  }

  const handleSelectExistingChat = (chat: any) => {}
  const handleSelectProspectiveChat = (chat: any) => {}


  return (
    <div className="chat-view">
          <Chat style={{flex: "1"}} />
          <ChatsList
            style={{flex: "0 0 27.5%"}}
            prospectiveChats={prospectiveChats}
            chats={chats}
            selectedChatId={null}
            onSelectExistingChat={handleSelectExistingChat}
            onSelectProspectiveChat={handleSelectProspectiveChat}
          />
    </div>
  );
}

export default ChatView;
