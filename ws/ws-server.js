const WebSocket = require('ws');

const WS_PORT = process.env.WS_PORT || 3111;

/**
 *
 * @return {WebSocketServer}
 */
const initWebSocketServer = () => {
  const WebSocket = require('ws');

  const wss = new WebSocket.WebSocketServer({
    port: WS_PORT,
  });

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      switch (data.event) {
        case 'REQUEST_FILE_UPLOAD':
          break;
      }
    });
  });

  console.log(`WebSocket server is listening on port: ${WS_PORT}`);

  return wss;
};

module.exports = {
  initWebSocketServer,
};
