import { redisRefreshConnectionTTL } from '../../../src/redis';
import ConnectionService from '../../../src/service/connection.service';

describe('connection.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshConnectionTTL', () => {
    it('should refresh the Redis TTL for the given connection', async () => {
      await ConnectionService.refreshConnectionTTL('conn-1');

      expect(redisRefreshConnectionTTL).toHaveBeenCalledWith('conn-1');
    });
  });
});
