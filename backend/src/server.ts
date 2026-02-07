#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app, { sessionParser } from './app';
import debug from 'debug';
import http from 'http';
import WebSocket from 'ws';
import wsHandlers from './ws/ws-handlers';

const debugLog = debug('real-time-chatting:server');

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
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string): string | number | false {
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

function onError(error: NodeJS.ErrnoException): void {
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

function onListening(): void {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;
  debugLog('Listening on ' + bind);

  console.log(`Listening on port ${port}`);
}

/**
 * Websocket Server
 */

const wss = new WebSocket.WebSocketServer({ noServer: true });

const bootApplication = async (): Promise<void> => {
  server.listen(port);

  server.on('error', onError);
  server.on('listening', onListening);

  server.on('upgrade', (request, socket, head) => {
    // sessionParser expects Express Request; upgrade gives IncomingMessage. Cast for WS flow.
    sessionParser(request as any, {} as any, () => {
      if (!request.session?.userId) {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    });
  });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');

    wsHandlers.handleWsConnection(wss, ws, req);
  });
};

bootApplication();
