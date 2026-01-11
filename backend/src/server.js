#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('./app');
const sessionParser = require('./app').sessionParser;
const debug = require('debug')('real-time-chatting:server');
const http = require('http');
const WebSocket = require('ws');
const wsHandlers = require('./ws/ws-handlers');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');

app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);

  console.log(`Listening on port ${port}`);
}

/**
 * Websocket Server
 */

const wss = new WebSocket.WebSocketServer({ noServer: true });

const bootApplication = async () => {
  server.listen(port);

  server.on('error', onError);
  server.on('listening', onListening);

  server.on('upgrade', (request, socket, head) => {
    sessionParser(request, {}, () => {
      if (!request.session || !request.session.user) {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    });
  });

  wss.on('connection', (ws, req) => {
    wsHandlers.handleWsConnection(wss, ws, req);
  });
  wss.on('close', (event) => {
    wsHandlers.handleWsCloseConnection(wss, event);
  });
};

bootApplication();
