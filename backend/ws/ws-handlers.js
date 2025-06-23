const { sessionParser, sessionStore } = require('../app');
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
    if (
      connection.ws.readyState === WebSocket.OPEN &&
      connection.ws !== ws
    ) {
      sessionStore.get(connection.sessionId, async (error, session) => {
        if (!error) {
          const chats = await ChatService.getUserChats(session.user);

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
}

const handleWsMessage = async (data) => {
  data = JSON.parse(data);

  switch (data.payload.event) {
    case ClientChatEventEnum.SEND_MESSAGE:
      // handleSendChatMessage(ws, data);
      break;
  }
}

const handleWsConnection = async (wss, ws, req) => {
  ws.onclose = async () => {
    if (req.session.user.wsConnectionId) {

      const allConnections = await ConnectionService.getAllConnectionsNoCurrent(
        connection.connectionId,
      );

      //TODO: Remove chat with user

      await ConnectionService.removeConnection(req.session.user.wsConnectionId);

      notifyOnNewConnection(ws, allConnections)
    }
  };

  const connection = await ConnectionService.storeConnection({
    ws,
    sessionId: req.session.id,
    userId: req.session.user.userId
  });

  if (!req.session?.user.wsConnectionId) {
    req.session.user.wsConnectionId = connection.connectionId;
  }

  const allConnections = await ConnectionService.getAllConnectionsNoCurrent(
    connection.connectionId,
  );

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

  notifyOnNewConnection(ws, allConnections);

  ws.on('message', handleWsMessage);
};

const handleWsCloseConnection = (wss, event) => {
  console.log('ws close', event);
};

module.exports = {
  handleWsConnection,
  handleWsCloseConnection,
};
