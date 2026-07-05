import { EventEmitter } from 'events';
import type { WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';
import ConnectionService from '../../../src/service/connection.service';
import { handleWsConnection, startHeartbeat } from '../../../src/ws/ws-handlers';

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
      jest.spyOn(ConnectionService, 'getAllConnectionsNoCurrent').mockResolvedValue([]);
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
});
