import { Home } from "./pages/Home/index.jsx";
import "./index.css";

//TODO: Group all .css files into one file and then import one file here

import "../style/text-utils.css";
import ChatView from "./views/ChatView.tsx";
import SignInView from "./views/SignInView.tsx";
import { useUser } from "./hooks/useUser.tsx";

export function App() {
  const { user } = useUser();
  return <main>{user ? <ChatView /> : <SignInView />}</main>;
}

export default App;
