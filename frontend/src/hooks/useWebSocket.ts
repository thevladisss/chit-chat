import { useContext } from "react";
import { WebSocketContext } from "../contexts/websocket.context";

type WebSocketReturn = {
  getWs: () => WebSocket | null;
};

export const useWebSocket = (): WebSocketReturn => {
  const getWs = useContext(WebSocketContext);

  return {
    getWs,
  };
};
