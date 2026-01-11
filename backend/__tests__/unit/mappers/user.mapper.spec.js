const userMapper = require('../../../src/mappers/user.mapper');

describe('user.mapper', () => {
  describe('mapUserToResponse', () => {
    it('should map user to response format by calling toJSON', () => {
      const userJson = {
        id: 'user-1',
        userId: 'user-1',
        username: 'testuser',
        createdTimestamp: 1234567890,
      };

      const user = {
        toJSON: jest.fn().mockReturnValue(userJson),
      };

      const result = userMapper.mapUserToResponse(user);

      expect(user.toJSON).toHaveBeenCalled();
      expect(result).toEqual(userJson);
    });

    it('should return the exact result from toJSON', () => {
      const userJson = {
        id: 'user-2',
        userId: 'user-2',
        username: 'anotheruser',
        createdTimestamp: 9876543210,
      };

      const user = {
        toJSON: jest.fn().mockReturnValue(userJson),
      };

      const result = userMapper.mapUserToResponse(user);

      expect(result).toBe(userJson);
      expect(result.userId).toBe('user-2');
      expect(result.username).toBe('anotheruser');
      expect(result.createdTimestamp).toBe(9876543210);
    });

    it('should handle user with minimal fields', () => {
      const userJson = {
        id: 'user-3',
        userId: 'user-3',
        username: 'minimaluser',
      };

      const user = {
        toJSON: jest.fn().mockReturnValue(userJson),
      };

      const result = userMapper.mapUserToResponse(user);

      expect(user.toJSON).toHaveBeenCalled();
      expect(result).toEqual(userJson);
    });
  });
});
