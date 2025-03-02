const ClientChatEventEnum = require('../enums/ClientChatEventEnum');
const ServerChatEventEnum = require('../enums/ServerChatEventEnum');
const ConnectionService = require('../service/connection.service');
const handleWsConnection = async (wss, ws, req) => {
  const connection = await ConnectionService.storeConnection({
    ws,
    sessionId: '1',
  });

  const allConnections = await ConnectionService.getAllConnectionsNoCurrent(
    connection.id,
  );

  ws.send(
    JSON.stringify({
      event: ServerChatEventEnum.CONNECTION_ESTABLISHED,
      data: {
        connectionId: connection.id,
        connectedAt: connection.createdTimestamp,
        connections: allConnections,
      },
    }),
  );

  allConnections.forEach((connection) => {

    if (connection.ws.readyState === WebSocket.OPEN && connection.ws !== ws) {

      connection.ws.send(
        JSON.stringify({
          event: ServerChatEventEnum.NEW_CONNECTION,
          data: {
            connections: allConnections,
          },
        }),
      );
    }
  });

  ws.on('message', async (data) => {
    data = JSON.parse(data);

    switch (data.event) {
      case ClientChatEventEnum.CREATE_ROOM:
        /*
          expected: {
            connectionIds: string[];
          }
         */
        break;
    }
  });
};

module.exports = {
  handleWsConnection,
};
