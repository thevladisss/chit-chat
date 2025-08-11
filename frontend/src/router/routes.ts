import AuthView from "../views/AuthView.tsx";
import ChatView from "../views/ChatView.tsx";
import AppLayout from "../layouts/AppLayout.tsx";
import { AUTH_PATH, CHAT_PATH } from "../constants/route-paths.ts";

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
        path: CHAT_PATH,
        element: ChatView,
      },
    ],
  },
];
