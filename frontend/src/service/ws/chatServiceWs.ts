import { ClientSideEventsEnum } from "../../enums/ClientSideEventsEnum.ts";

export const sendWsMessage = (ws: WebSocket, payload: Record<string, any>) => {
  ws.send(
    JSON.stringify({
      payload: {
        event: ClientSideEventsEnum.SendMessage,
        data: payload,
      },
    }),
  );
};

export const sendChatMessage = (
  ws: WebSocket,
  payload: { message: string; chatId?: string | null; userId?: string | null },
) => {
  return sendWsMessage(ws, payload);
};
