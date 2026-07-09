
import { EventEmitter } from 'events';
import { WebSocket } from 'ws';
import type { WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';
import ConnectionService from '../../../src/service/connection.service';
import ChatService from '../../../src/service/chat.service';
import { sessionStore } from '../../../src/session';
import ServerChatEventEnum from '../../../src/enums/ServerChatEventEnum';
import wsHandlers, { handleWsConnection, startHeartbeat } from '../../../src/ws/ws-handlers';

class FakeWebSocket extends EventEmitter {
  send = jest.fn();
  ping = jest.fn();
  terminate = jest.fn();
  readyState = 1;
  isAlive?: boolean;
}

describe('ws-handlers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('startHeartbeat', () => {
    let intervalHandle: NodeJS.Timeout;

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      clearInterval(intervalHandle);
      jest.useRealTimers();
    });

    it('should ping sockets still marked alive and flip them to not-alive', () => {
      const aliveSocket = { isAlive: true, ping: jest.fn(), terminate: jest.fn() };
      const wss = { clients: new Set([aliveSocket]) } as unknown as WebSocketServer;

      intervalHandle = startHeartbeat(wss);
      jest.advanceTimersByTime(30_000);

      expect(aliveSocket.ping).toHaveBeenCalled();
      expect(aliveSocket.terminate).not.toHaveBeenCalled();
      expect(aliveSocket.isAlive).toBe(false);
    });

    it('should terminate sockets that never responded since the previous sweep', () => {
      const deadSocket = { isAlive: false, ping: jest.fn(), terminate: jest.fn() };
      const wss = { clients: new Set([deadSocket]) } as unknown as WebSocketServer;

      intervalHandle = startHeartbeat(wss);
      jest.advanceTimersByTime(30_000);

      expect(deadSocket.terminate).toHaveBeenCalled();
      expect(deadSocket.ping).not.toHaveBeenCalled();
    });
  });

  describe('handleWsConnection heartbeat wiring', () => {
    const mockConnection = {
      id: 'conn-1',
      connectionId: 'conn-1',
      sessionId: 'session-1',
      userId: 'user-1',
      createdTimestamp: Date.now(),
    };

    const buildReq = (): IncomingMessage =>
      ({ session: { id: 'session-1', userId: 'user-1' } }) as unknown as IncomingMessage;

    beforeEach(() => {
      jest.spyOn(ConnectionService, 'storeConnection').mockResolvedValue(mockConnection as any);
      jest.spyOn(ConnectionService, 'getAllConnectionsOnlineNoCurrent').mockResolvedValue([]);
      jest.spyOn(ConnectionService, 'refreshConnectionTTL').mockResolvedValue(undefined);
    });

    it('should mark the socket alive as soon as the connection is established', async () => {
      const ws = new FakeWebSocket();

      await handleWsConnection({} as WebSocketServer, ws as any, buildReq());

      expect(ws.isAlive).toBe(true);
    });

    it('should mark the socket alive and refresh the connection TTL when a pong is received', async () => {
      const ws = new FakeWebSocket();

      await handleWsConnection({} as WebSocketServer, ws as any, buildReq());
      ws.isAlive = false;

      ws.emit('pong');

      expect(ws.isAlive).toBe(true);
      expect(ConnectionService.refreshConnectionTTL).toHaveBeenCalledWith('conn-1');
    });

    it('should log and swallow the error if refreshing the TTL fails', async () => {
      const error = new Error('redis unavailable');
      jest.spyOn(ConnectionService, 'refreshConnectionTTL').mockRejectedValue(error);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const ws = new FakeWebSocket();

      await handleWsConnection({} as WebSocketServer, ws as any, buildReq());
      ws.emit('pong');
      await new Promise(process.nextTick);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error refreshing connection TTL:',
        error,
      );
    });
  });

  describe('notifyOnNewConnection (via handleWsConnection)', () => {
    const mockConnection = {
      id: 'conn-1',
      connectionId: 'conn-1',
      sessionId: 'session-1',
      userId: 'user-1',
      createdTimestamp: Date.now(),
    };

    const buildReq = (): IncomingMessage =>
      ({ session: { id: 'session-1', userId: 'user-1' } }) as unknown as IncomingMessage;

    it('derives chats from connection.userId directly, without querying the session store', async () => {
      const otherWs = new FakeWebSocket();
      otherWs.readyState = WebSocket.OPEN;
      const otherConnection = {
        id: 'conn-2',
        connectionId: 'conn-2',
        sessionId: 'session-other',
        userId: 'user-other',
        createdTimestamp: Date.now(),
        ws: otherWs as any,
      };

      jest.spyOn(ConnectionService, 'storeConnection').mockResolvedValue(mockConnection as any);
      jest
        .spyOn(ConnectionService, 'getAllConnectionsOnlineNoCurrent')
        .mockResolvedValue([otherConnection] as any);
      jest.spyOn(ConnectionService, 'refreshConnectionTTL').mockResolvedValue(undefined);
      const getUserChatsSpy = jest
        .spyOn(ChatService, 'getUserChats')
        .mockResolvedValue([{ id: 'chat-1' }] as any);
      const sessionGetSpy = jest.spyOn(sessionStore, 'get');

      const ws = new FakeWebSocket();
      await handleWsConnection({} as WebSocketServer, ws as any, buildReq());
      await new Promise(process.nextTick);

      expect(getUserChatsSpy).toHaveBeenCalledWith('user-other');
      expect(sessionGetSpy).not.toHaveBeenCalled();
      expect(otherWs.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: ServerChatEventEnum.NEW_CONNECTION,
          data: { chats: [{ id: 'chat-1' }], connections: [otherConnection] },
        }),
      );
    });
  });

  describe('notifyOnLeaveConnection (via handleWsCloseConnection)', () => {
    it('derives chats from connection.userId directly, without querying the session store', async () => {
      const otherWs = new FakeWebSocket();
      otherWs.readyState = WebSocket.OPEN;
      const otherConnection = {
        id: 'conn-2',
        connectionId: 'conn-2',
        sessionId: 'session-other',
        userId: 'user-other',
        createdTimestamp: Date.now(),
        ws: otherWs as any,
      };
      const closingConnection = {
        id: 'conn-1',
        connectionId: 'conn-1',
        sessionId: 'session-closing',
        userId: 'user-closing',
        createdTimestamp: Date.now(),
      };

      jest.spyOn(ConnectionService, 'removeConnectionByConnectionId').mockResolvedValue(undefined);
      jest.spyOn(ConnectionService, 'getAllConnectionsOnline').mockResolvedValue([otherConnection] as any);
      jest.spyOn(sessionStore, 'destroy').mockImplementation((_sid, cb: any) => cb());
      const getUserChatsSpy = jest
        .spyOn(ChatService, 'getUserChats')
        .mockResolvedValue([{ id: 'chat-2' }] as any);

      await wsHandlers.handleWsCloseConnection(closingConnection as any);
      await new Promise(process.nextTick);

      expect(getUserChatsSpy).toHaveBeenCalledWith('user-other');
      expect(otherWs.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: ServerChatEventEnum.LEAVE_CONNECTION,
          data: { chats: [{ id: 'chat-2' }], connections: [otherConnection] },
        }),
      );
    });
  });
});
