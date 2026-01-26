let ws: WebSocket | null = null;

type WebSocketReturn = {
  getWs: () => WebSocket | null;
};

export const useWebSocket = (): WebSocketReturn => {
  if (!ws) {
    ws = new WebSocket(import.meta.env.VITE_WS_URL);
  }

  const getWs = () => {
    return ws;
  };

  return {
    getWs,
  };
};
