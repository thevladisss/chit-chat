import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import { sessionStore } from '../session';
import ClientChatEventEnum from '../enums/ClientChatEventEnum';
import ServerChatEventEnum from '../enums/ServerChatEventEnum';
import ConnectionService from '../service/connection.service';
import ChatService from '../service/chat.service';
import type { ConnectionWithSocket } from '../types/connection';
import UserRepository from '../repositories/user.repository';

/**
 *
 * @param ws - Current WS (new connection WS)
 * @param allConnections - all connection
 */
const notifyOnNewConnection = (
  ws: WebSocket,
  allConnections: ConnectionWithSocket[],
): void => {
  allConnections.forEach((connection) => {
    if (
      connection.ws &&
      connection.ws.readyState === WebSocket.OPEN &&
      connection.ws !== ws
    ) {
      sessionStore.get(connection.sessionId, async (error, session) => {
        if (!error && session?.userId) {
          const chats = await ChatService.getUserChats(session.userId);

          connection.ws?.send(
            JSON.stringify({
              event: ServerChatEventEnum.NEW_CONNECTION,
              data: {
                chats,
                connections: allConnections,
              },
            }),
          );
        }
      });
    }
  });
};

/**
 *
 * @param allConnections - all connection
 */
const notifyOnLeaveConnection = (
  allConnections: ConnectionWithSocket[],
): void => {
  allConnections.forEach((connection) => {
    sessionStore.get(connection.sessionId, async (error, session) => {
      if (
        !error &&
        connection.ws &&
        connection.ws.readyState === WebSocket.OPEN &&
        session?.userId
      ) {
        const chats = await ChatService.getUserChats(session.userId);

        connection.ws.send(
          JSON.stringify({
            event: ServerChatEventEnum.LEAVE_CONNECTION,
            data: {
              chats,
              connections: allConnections,
            },
          }),
        );
      }
    });
  });
};

const notifyOnConnectionEstablished = (
  ws: WebSocket,
  connection: ConnectionWithSocket,
  allConnections: ConnectionWithSocket[],
): void => {
  ws.send(
    JSON.stringify({
      event: ServerChatEventEnum.CONNECTION_ESTABLISHED,
      data: {
        connectionId: connection.connectionId,
        connectedAt: connection.createdTimestamp,
        connections: allConnections,
      },
    }),
  );
};

const notifyOnUserTyping = async (
  req: IncomingMessage,
  _ws: WebSocket,
  data: any,
): Promise<void> => {
  const chatId = data.chatId;

  const userId = req.session?.userId ?? '';

  const user = await UserRepository.findByIdOrFail(userId);

  if (!user) {
    return;
  }

  const users = await ChatService.getUsersByChatId(chatId);

  const ids = users.map((user: any) => user._id?.toString() || user.id);

  const connections = await ConnectionService.getAllConnectionsByUserIds(ids);

  for (const con of connections) {
    if (
      con.userId !== userId &&
      con.ws &&
      con.ws.readyState === WebSocket.OPEN
    ) {
      con.ws.send(
        JSON.stringify({
          event: ServerChatEventEnum.TYPING_IN_CHAT,
          data: {
            userId,
            user,
            chatId,
          },
        }),
      );
    }
  }
};

const handleWsMessage = async (
  req: IncomingMessage,
  ws: WebSocket,
  data: Buffer | ArrayBuffer | Buffer[],
): Promise<void> => {
  const raw = Buffer.isBuffer(data)
    ? data
    : Array.isArray(data)
      ? Buffer.concat(data)
      : Buffer.from(data);
  const parsedData = JSON.parse(raw.toString());

  console.log('Got message', req, ws, parsedData);

  switch (parsedData.event) {
    case ClientChatEventEnum.SEND_MESSAGE:
      break;
    case ClientChatEventEnum.TYPING_IN_CHAT:
      await notifyOnUserTyping(req, ws, parsedData.payload || parsedData.data);
      break;
  }
};

export const handleWsConnection = async (
  _wss: WebSocketServer,
  ws: WebSocket,
  req: IncomingMessage,
): Promise<void> => {
  if (!req.session?.userId) {
    return;
  }

  const connection = await ConnectionService.storeConnection({
    ws,
    sessionId: req.session.id,
    userId: req.session.userId,
  });

  if (!req.session.wsConnectionId) {
    req.session.wsConnectionId = connection.id;
  }

  const allConnections = await ConnectionService.getAllConnectionsNoCurrent(
    connection.connectionId,
  );

  notifyOnConnectionEstablished(ws, connection, allConnections);

  notifyOnNewConnection(ws, allConnections);

  ws.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => {
    handleWsMessage(req, ws, data);
  });
  ws.on('close', () => {
    handleWsCloseConnection(connection);
  });
};

const handleWsCloseConnection = async (
  connection: ConnectionWithSocket,
): Promise<void> => {
  await ConnectionService.removeConnectionByConnectionId(
    connection.connectionId,
  );

  sessionStore.destroy(connection.sessionId, async (error) => {
    if (error) {
      console.error('Error destroying session:', error);
    } else {
      const allConnections = await ConnectionService.getAllConnections();

      notifyOnLeaveConnection(allConnections);
    }
  });
};

export default {
  handleWsConnection,
  handleWsCloseConnection,
};
