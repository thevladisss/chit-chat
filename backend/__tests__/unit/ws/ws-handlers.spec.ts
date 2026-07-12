
import { EventEmitter } from 'events';
import { WebSocket } from 'ws';
import type { WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';
import ConnectionService from '../../../src/service/connection.service';
import ChatService from '../../../src/service/chat.service';
import UserRepository from '../../../src/repositories/user.repository';
import { sessionStore } from '../../../src/session';
import ServerChatEventEnum from '../../../src/enums/ServerChatEventEnum';
import wsHandlers, { handleWsConnection, startHeartbeat } from '../../../src/ws/ws-handlers';

const flushMicrotasks = () => new Promise((resolve) => setImmediate(resolve));

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

  describe('handleWsMessage (via ws.on("message"))', () => {
    const mockConnection = {
      id: 'conn-1',
      connectionId: 'conn-1',
      sessionId: 'session-1',
      userId: 'user-1',
      createdTimestamp: Date.now(),
    };

    // wsConnectionId is pre-set so handleWsConnection skips its session.save() branch,
    // which the fake session object below doesn't implement.
    const buildReq = (): IncomingMessage =>
      ({
        session: { id: 'session-1', userId: 'user-1', wsConnectionId: 'conn-1' },
      }) as unknown as IncomingMessage;

    beforeEach(() => {
      jest.spyOn(ConnectionService, 'storeConnection').mockResolvedValue(mockConnection as any);
      jest.spyOn(ConnectionService, 'getAllConnectionsOnlineNoCurrent').mockResolvedValue([]);
      jest.spyOn(ConnectionService, 'refreshConnectionTTL').mockResolvedValue(undefined);
    });

    it('should drop an invalid frame, log a warning, and send an ERROR event back to the sender', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const getUsersByChatIdSpy = jest.spyOn(ChatService, 'getUsersByChatId');
      const ws = new FakeWebSocket();

      await handleWsConnection({} as WebSocketServer, ws as any, buildReq());
      ws.emit(
        'message',
        Buffer.from(JSON.stringify({ event: 'typing_in_chat', payload: {} })),
      );
      await flushMicrotasks();

      expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid WS payload:', expect.anything());
      expect(ws.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: ServerChatEventEnum.ERROR,
          data: { message: 'Invalid message payload' },
        }),
      );
      expect(getUsersByChatIdSpy).not.toHaveBeenCalled();
    });

    it('should reject an unrecognized event the same way as a malformed one', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const ws = new FakeWebSocket();

      await handleWsConnection({} as WebSocketServer, ws as any, buildReq());
      ws.emit(
        'message',
        Buffer.from(JSON.stringify({ event: 'send_message', payload: { message: 'hi' } })),
      );
      await flushMicrotasks();

      expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid WS payload:', expect.anything());
      expect(ws.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: ServerChatEventEnum.ERROR,
          data: { message: 'Invalid message payload' },
        }),
      );
    });

    it('should dispatch a valid typing_in_chat frame to the other participants', async () => {
      jest.spyOn(UserRepository, 'findByIdOrFail').mockResolvedValue({ id: 'user-1' } as any);
      jest
        .spyOn(ChatService, 'getUsersByChatId')
        .mockResolvedValue([{ id: 'user-1' }, { id: 'user-2' }] as any);
      const otherWs = new FakeWebSocket();
      otherWs.readyState = WebSocket.OPEN;
      jest.spyOn(ConnectionService, 'getAllConnectionsByUserIds').mockResolvedValue([
        { userId: 'user-2', ws: otherWs as any },
      ] as any);

      const ws = new FakeWebSocket();
      await handleWsConnection({} as WebSocketServer, ws as any, buildReq());
      ws.emit(
        'message',
        Buffer.from(
          JSON.stringify({ event: 'typing_in_chat', payload: { chatId: 'chat-1' } }),
        ),
      );
      await flushMicrotasks();

      expect(otherWs.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: ServerChatEventEnum.TYPING_IN_CHAT,
          data: { userId: 'user-1', user: { id: 'user-1' }, chatId: 'chat-1' },
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
