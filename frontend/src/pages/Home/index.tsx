import './style.css';
import { useEffect, useState } from 'react';
import SignInForm from "../../components/SignInForm.tsx";
import {getAllChats} from "../../service/chatSerevice";
import {IChat} from "../../types/IChat.ts";
import {IUser} from "../../types/IUser.ts";



export function Home() {

  let ws;

  useEffect(() => {
  if (!ws) {
    ws = new WebSocket(import.meta.env.VITE_WS_URL)
  }

  ws.onopen = () => {


    // ws.send(JSON.stringify({
    //   event: "join_room",
    //   data: {
    //     connectionIds: ['1']
    //   }
    // }))
  }

  }, []);

  const [user, setUser] = useState<IUser | null>(null);


  const [onlineUsers, setOnlineUsers] = useState<IChat[]>([])
  const [isLoadingOnlineUsers, setLoadingOnlineUsers] = useState(false)

  const requestOnlineUsers = async () => {
    try {
      setLoadingOnlineUsers(true);

      const { data } = await getAllChats();

      setOnlineUsers(data)
    }
    catch(e) {
      //todo: handle error
    }
    finally {
      setLoadingOnlineUsers(false)
    }
  }


  const [chats, setChats] = useState<IChat[]>([])
  const [isLoadingChats, setChatsLoading] = useState(false)

  const requestChats = async () => {
    try {
      setChatsLoading(true);

      const { data } = await getAllChats();

      setChats(data)
    }
    catch(e) {
      //todo: handle error
    }
    finally {
      setChatsLoading(false)
    }
  }

  const handleUserAuthenticate = (user: IUser) => {
    setUser(user)
    requestOnlineUsers()
    requestChats()
  }

  return (
    <div className="home-view">
      {
        !user ?
          <SignInForm onUserAuthenticate={handleUserAuthenticate}></SignInForm>
          :
        "Chat"
      }
    </div>
  );
}
