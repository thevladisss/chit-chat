import AuthView from "../views/AuthView.tsx";
import ChatView from "../views/ChatView.tsx";
import SelectChatView from "../views/SelectChatView.tsx";
import AppLayout from "../layouts/AppLayout.tsx";
import {
  AUTH_PATH,
  SELECT_CHAT_VIEW_PATH,
  CHAT_VIEW_PATH,
} from "../constants/route-paths.ts";

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
  public?: boolean;
  children?: RouteConfig[];
}

export const routes: RouteConfig[] = [
  {
    path: AUTH_PATH,
    element: AuthView,
    public: true,
  },
  {
    path: "",
    element: AppLayout,
    protected: true,
    children: [
      {
        path: SELECT_CHAT_VIEW_PATH,
        element: SelectChatView,
      },
      {
        path: CHAT_VIEW_PATH,
        element: ChatView,
      },
    ],
  },
];
