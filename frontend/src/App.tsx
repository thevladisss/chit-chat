import { Home } from "./pages/Home/index.jsx";
import "./index.css";

//TODO: Group all .css files into one file and then import one file here

import "../style/text-utils.css";
import "../style/layout-utils.css";
import ChatView from "./views/ChatView.tsx";
import SignInView from "./views/SignInView.tsx";
import { useUserStore } from "./hooks/useUserStore.tsx";

export function App() {
  const { user } = useUserStore();

  return <div>{user ? <ChatView /> : <SignInView />}</div>;
}

export default App;
