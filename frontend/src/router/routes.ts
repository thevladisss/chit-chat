import AuthView from "../views/AuthView.tsx";
import ChatView from "../views/ChatView.tsx";
import { AUTH_PATH, CHAT_PATH } from "../constants/route-paths.ts";

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    path: AUTH_PATH,
    element: AuthView,
    public: true,
  },
  {
    path: CHAT_PATH,
    element: ChatView,
    protected: true,
  },
];
