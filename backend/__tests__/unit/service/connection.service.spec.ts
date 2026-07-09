import { WebSocket } from 'ws';
import { redisRefreshConnectionTTL } from '../../../src/redis';
import { __resetStore } from '../../__mocks__/redis';
import ConnectionService from '../../../src/service/connection.service';

const fakeSocket = (readyState: number): WebSocket =>
  ({ readyState }) as unknown as WebSocket;

describe('connection.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
    __resetStore();
  });

  describe('refreshConnectionTTL', () => {
    it('should refresh the Redis TTL for the given connection', async () => {
      await ConnectionService.refreshConnectionTTL('conn-1');

      expect(redisRefreshConnectionTTL).toHaveBeenCalledWith('conn-1');
    });
  });

  describe('getAllConnectionsOnline', () => {
    it('excludes connections whose socket is not open', async () => {
      await ConnectionService.storeConnection({
        ws: fakeSocket(WebSocket.OPEN),
        sessionId: 'session-open',
        userId: 'user-open',
      });
      await ConnectionService.storeConnection({
        ws: fakeSocket(WebSocket.CLOSED),
        sessionId: 'session-closed',
        userId: 'user-closed',
      });

      const online = await ConnectionService.getAllConnectionsOnline();

      expect(online.map((c) => c.userId)).toEqual(['user-open']);
    });

    it('excludes connections with no socket in the local map', async () => {
      await ConnectionService.storeConnection({
        ws: fakeSocket(WebSocket.OPEN),
        sessionId: 'session-open',
        userId: 'user-open',
      });
      // Simulates a connection whose Redis record still exists but whose
      // socket has already disappeared from the local socketMap.
      await ConnectionService.storeConnection({
        ws: undefined as unknown as WebSocket,
        sessionId: 'session-orphan',
        userId: 'user-orphan',
      });

      const online = await ConnectionService.getAllConnectionsOnline();

      expect(online.map((c) => c.userId)).toEqual(['user-open']);
    });
  });

  describe('getAllConnectionsOnlineNoCurrent', () => {
    it('excludes the current connection as well as closed sockets', async () => {
      const current = await ConnectionService.storeConnection({
        ws: fakeSocket(WebSocket.OPEN),
        sessionId: 'session-1',
        userId: 'user-1',
      });
      await ConnectionService.storeConnection({
        ws: fakeSocket(WebSocket.CLOSED),
        sessionId: 'session-2',
        userId: 'user-2',
      });
      const other = await ConnectionService.storeConnection({
        ws: fakeSocket(WebSocket.OPEN),
        sessionId: 'session-3',
        userId: 'user-3',
      });

      const result = await ConnectionService.getAllConnectionsOnlineNoCurrent(
        current.connectionId,
      );

      expect(result.map((c) => c.connectionId)).toEqual([other.connectionId]);
    });
  });
});
