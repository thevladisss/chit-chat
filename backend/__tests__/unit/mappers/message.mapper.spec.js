const messageMapper = require('../../../mappers/message.mapper');

describe('message.mapper', () => {
  describe('mapMessageToResponse', () => {
    const currentUserId = 'user-1';

    it('should map message to response format with isPersonal flag set to true for current user', () => {
      const messageJson = {
        id: 'msg-1',
        messageId: 'msg-1',
        text: 'Hello',
        userId: currentUserId,
        chatId: 'chat-1',
        sentAt: 1234567890,
        isSeen: false,
      };

      const message = {
        toJSON: jest.fn().mockReturnValue(messageJson),
        userId: { toString: () => currentUserId },
      };

      const result = messageMapper.mapMessageToResponse(currentUserId, message);

      expect(message.toJSON).toHaveBeenCalled();
      expect(result).toEqual({
        ...messageJson,
        isPersonal: true,
      });
    });

    it('should map message to response format with isPersonal flag set to false for other user', () => {
      const otherUserId = 'user-2';
      const messageJson = {
        id: 'msg-2',
        messageId: 'msg-2',
        text: 'Hi back',
        userId: otherUserId,
        chatId: 'chat-1',
        sentAt: 1234567891,
        isSeen: true,
      };

      const message = {
        toJSON: jest.fn().mockReturnValue(messageJson),
        userId: { toString: () => otherUserId },
      };

      const result = messageMapper.mapMessageToResponse(currentUserId, message);

      expect(message.toJSON).toHaveBeenCalled();
      expect(result).toEqual({
        ...messageJson,
        isPersonal: false,
      });
    });

    it('should handle message with string userId', () => {
      const otherUserId = 'user-3';
      const messageJson = {
        id: 'msg-3',
        messageId: 'msg-3',
        text: 'Test message',
        userId: otherUserId,
      };

      const message = {
        toJSON: jest.fn().mockReturnValue(messageJson),
        userId: otherUserId,
      };

      const result = messageMapper.mapMessageToResponse(currentUserId, message);

      expect(result.isPersonal).toBe(false);
    });

    it('should correctly identify personal message when userId matches', () => {
      const messageJson = {
        id: 'msg-4',
        text: 'My message',
        userId: currentUserId,
      };

      const message = {
        toJSON: jest.fn().mockReturnValue(messageJson),
        userId: { toString: () => currentUserId },
      };

      const result = messageMapper.mapMessageToResponse(currentUserId, message);

      expect(result.isPersonal).toBe(true);
    });

    it('should handle message with minimal fields', () => {
      const messageJson = {
        id: 'msg-5',
        text: 'Minimal message',
      };

      const message = {
        toJSON: jest.fn().mockReturnValue(messageJson),
        userId: { toString: () => 'user-other' },
      };

      const result = messageMapper.mapMessageToResponse(currentUserId, message);

      expect(result).toEqual({
        ...messageJson,
        isPersonal: false,
      });
    });
  });

  describe('mapMessagesToResponse', () => {
    const currentUserId = 'user-1';

    it('should map array of messages to response format', () => {
      const messages = [
        {
          toJSON: jest.fn().mockReturnValue({
            id: 'msg-1',
            text: 'Hello',
            userId: currentUserId,
          }),
          userId: { toString: () => currentUserId },
        },
        {
          toJSON: jest.fn().mockReturnValue({
            id: 'msg-2',
            text: 'Hi back',
            userId: 'user-2',
          }),
          userId: { toString: () => 'user-2' },
        },
      ];

      const result = messageMapper.mapMessagesToResponse(currentUserId, messages);

      expect(result).toHaveLength(2);
      expect(result[0].isPersonal).toBe(true);
      expect(result[1].isPersonal).toBe(false);
      expect(result[0].text).toBe('Hello');
      expect(result[1].text).toBe('Hi back');
    });

    it('should handle empty array', () => {
      const messages = [];

      const result = messageMapper.mapMessagesToResponse(currentUserId, messages);

      expect(result).toEqual([]);
    });

    it('should map multiple messages with correct isPersonal flags', () => {
      const messages = [
        {
          toJSON: jest.fn().mockReturnValue({
            id: 'msg-1',
            text: 'Message 1',
            userId: currentUserId,
          }),
          userId: { toString: () => currentUserId },
        },
        {
          toJSON: jest.fn().mockReturnValue({
            id: 'msg-2',
            text: 'Message 2',
            userId: 'user-2',
          }),
          userId: { toString: () => 'user-2' },
        },
        {
          toJSON: jest.fn().mockReturnValue({
            id: 'msg-3',
            text: 'Message 3',
            userId: currentUserId,
          }),
          userId: { toString: () => currentUserId },
        },
      ];

      const result = messageMapper.mapMessagesToResponse(currentUserId, messages);

      expect(result).toHaveLength(3);
      expect(result[0].isPersonal).toBe(true);
      expect(result[1].isPersonal).toBe(false);
      expect(result[2].isPersonal).toBe(true);
    });

    it('should call toJSON on each message', () => {
      const message1 = {
        toJSON: jest.fn().mockReturnValue({
          id: 'msg-1',
          text: 'Test 1',
        }),
        userId: { toString: () => currentUserId },
      };

      const message2 = {
        toJSON: jest.fn().mockReturnValue({
          id: 'msg-2',
          text: 'Test 2',
        }),
        userId: { toString: () => 'user-2' },
      };

      messageMapper.mapMessagesToResponse(currentUserId, [message1, message2]);

      expect(message1.toJSON).toHaveBeenCalled();
      expect(message2.toJSON).toHaveBeenCalled();
    });
  });
});

