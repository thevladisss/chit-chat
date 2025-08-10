import SignInView from "../views/SignInView.tsx";
import ChatView from "../views/ChatView.tsx";
import { SIGN_IN_PATH, CHAT_PATH } from "../constants/route-paths.ts";

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    path: SIGN_IN_PATH,
    element: SignInView,
    public: true,
  },
  {
    path: CHAT_PATH,
    element: ChatView,
    protected: true,
  },
];
