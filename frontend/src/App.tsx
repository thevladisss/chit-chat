import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./index.css";
import "../style/text-utils.css";
import "../style/layout-utils.css";
import { routes, RouteGuard } from "./router";
import {
  ROOT_PATH,
  AUTH_PATH,
  WILDCARD_PATH,
} from "./constants/route-paths.ts";
import classNames from "classnames";
import { useScreen } from "./hooks/useScreen.ts";
import { useSelector } from "react-redux";
import { type IRootState } from "./types/IRootState.ts";
import { useEffect, useRef } from "react";
import { WebSocketContext } from "./contexts/websocket.context.ts";
import { selectIsLoggedIn } from "./stores/user/selectors.ts";

export function App() {
  const { smAndSmaller } = useScreen();

  const isLoggedIn = useSelector(selectIsLoggedIn);

  const isInChat = useSelector((state: IRootState) =>
    Boolean(state.chatState.selectedChat),
  );

  const wsRef = useRef<WebSocket | null>(null);

  const getWebSocket = () => {
    return wsRef.current;
  };

  useEffect(() => {
    if (isLoggedIn && !wsRef.current) {
      wsRef.current = new WebSocket(import.meta.env.VITE_WS_URL);
    }

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [isLoggedIn]);

  return (
    <div
      className={classNames("root", {
        mobile: smAndSmaller,
        "in-chat": isInChat,
      })}
    >
      <WebSocketContext.Provider value={getWebSocket}>
        <Router>
          <Routes>
            {/* Default route redirect */}
            <Route
              path={ROOT_PATH}
              element={<Navigate to={AUTH_PATH} replace />}
            />

            {/* Dynamic routes from configuration */}
            {routes.map(
              ({
                path,
                element: Element,
                protected: isProtected,
                public: isPublic,
                children,
              }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    isProtected ? (
                      <RouteGuard type="protected">
                        <Element />
                      </RouteGuard>
                    ) : isPublic ? (
                      <RouteGuard type="public">
                        <Element />
                      </RouteGuard>
                    ) : (
                      <Element />
                    )
                  }
                >
                  {children?.map((child) => (
                    <Route
                      key={child.path}
                      path={child.path}
                      element={<child.element />}
                    />
                  ))}
                </Route>
              ),
            )}

            {/* Catch all route */}
            <Route
              path={WILDCARD_PATH}
              element={<Navigate to={AUTH_PATH} replace />}
            />
          </Routes>
        </Router>
      </WebSocketContext.Provider>
    </div>
  );
}

export default App;
