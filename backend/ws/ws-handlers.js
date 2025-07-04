const { sessionStore } = require('../session');
const ClientChatEventEnum = require('../enums/ClientChatEventEnum');
const ServerChatEventEnum = require('../enums/ServerChatEventEnum');
const ConnectionService = require('../service/connection.service');
const ChatService = require('../service/chat.service');

/**
 *
 * @param ws - Current WS (new connection WS)
 * @param allConnections - all connection
 */
const notifyOnNewConnection = (ws, allConnections) => {
  allConnections.forEach((connection) => {
    if (connection.ws.readyState === WebSocket.OPEN && connection.ws !== ws) {
      sessionStore.get(connection.sessionId, async (error, session) => {
        if (!error) {
          const chats = await ChatService.getUserChats(session.user.id);

          connection.ws.send(
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
 * @param ws - Current WS (new connection WS)
 * @param allConnections - all connection
 */
const notifyOnLeaveConnection = (allConnections) => {
  allConnections.forEach((connection) => {
    sessionStore.get(connection.sessionId, async (error, session) => {
      if (!error) {
        const chats = await ChatService.getUserChats(session.user.id);

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

const notifyOnConnectionEstablished = (ws, connection, allConnections) => {
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

const handleWsMessage = async (data) => {
  data = JSON.parse(data);

  switch (data.payload.event) {
    case ClientChatEventEnum.SEND_MESSAGE:
      break;
  }
};

const handleWsConnection = async (wss, ws, req) => {
  const connection = await ConnectionService.storeConnection({
    ws,
    sessionId: req.session.id,
    userId: req.session.user.id,
  });

  if (!req.session?.user.wsConnectionId) {
    req.session.wsConnectionId = connection.id;
  }

  const allConnections = await ConnectionService.getAllConnectionsNoCurrent(
    connection.connectionId,
  );

  notifyOnConnectionEstablished(ws, connection, allConnections);

  notifyOnNewConnection(ws, allConnections);

  ws.on('message', () => {
    handleWsMessage();
  });
  ws.on('close', () => {
    handleWsCloseConnection(connection);
  });
};

const handleWsCloseConnection = async (connection) => {
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

module.exports = {
  handleWsConnection,
};
