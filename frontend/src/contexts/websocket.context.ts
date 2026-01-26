import { createContext, useContext } from "react";

export const WebSocketContext = createContext<() => WebSocket | null>(
  () => null
);

export const useWebSocketContext = () => {
  return useContext(WebSocketContext);
};
