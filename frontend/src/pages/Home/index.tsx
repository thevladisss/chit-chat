import './style.css';
import { useEffect, useMemo, useState } from 'react';
import SignInDialog from "../../components/SignInDialog";

import {getRequest} from "../../service";
import SignInForm from "../../components/LoginForm";



export function Home() {

  let ws;

  useEffect(() => {
  if (!ws) {
    ws = new WebSocket(import.meta.env.VITE_WS_URL)
  }

  ws.onopen = () => {


    ws.send(JSON.stringify({
      event: "join_room",
      data: {
        connectionIds: ['1']
      }
    }))
    getRequest('/api/chat/online').then((c) => {
      console.log(c)
    })
  }

  }, []);

  const [user, setUser] = useState<{
    userId: string;
    createdTimestamp: string
  } | null>(null);

  const handleUserAuthenticate = (user: { userId: string, createdTimestamp: string }) => {
    setUser(user)
  }

  return (
    <div class="home-view">
      {
        !user ?
          <SignInForm onUserAuthenticate={handleUserAuthenticate}></SignInForm>
          :
        "Chat"
      }
    </div>
  );
}
