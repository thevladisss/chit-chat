const chatMapper = require('../../../mappers/chat.mapper');

describe('chat.mapper', () => {
  describe('mapChatToResponse', () => {
    const currentUserId = 'user-1';

    it('should map chat to response format with all fields', () => {
      const chatJson = {
        chatId: 'chat-1',
        id: 'chat-1',
        createdTimestamp: 1234567890,
      };

      const lastMessage = {
        text: 'Last message text',
        createdTimestamp: 1234567891,
      };

      const chat = {
        toJSON: jest.fn().mockReturnValue(chatJson),
        users: [
          {
            id: currentUserId,
            username: 'Current User',
          },
          {
            id: 'user-2',
            username: 'Other User',
          },
        ],
        messages: [
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
        ],
        lastMessage,
      };

      const result = chatMapper.mapChatToResponse(currentUserId, chat);

      expect(chat.toJSON).toHaveBeenCalled();
      expect(result).toEqual({
        ...chatJson,
        lastMessage: 'Last message text',
        lastMessageTimestamp: 1234567891,
        name: 'Other User',
        messages: [
          {
            id: 'msg-1',
            text: 'Hello',
            userId: currentUserId,
            isPersonal: true,
          },
          {
            id: 'msg-2',
            text: 'Hi back',
            userId: 'user-2',
            isPersonal: false,
          },
        ],
      });
    });

    it('should set isPersonal flag correctly for messages', () => {
      const chatJson = { chatId: 'chat-1' };

      const chat = {
        toJSON: jest.fn().mockReturnValue(chatJson),
        users: [
          { id: currentUserId, username: 'Current User' },
          { id: 'user-2', username: 'Other User' },
        ],
        messages: [
          {
            toJSON: jest.fn().mockReturnValue({
              id: 'msg-1',
              userId: currentUserId,
            }),
            userId: { toString: () => currentUserId },
          },
          {
            toJSON: jest.fn().mockReturnValue({
              id: 'msg-2',
              userId: 'user-2',
            }),
            userId: { toString: () => 'user-2' },
          },
        ],
        lastMessage: null,
      };

      const result = chatMapper.mapChatToResponse(currentUserId, chat);

      expect(result.messages[0].isPersonal).toBe(true);
      expect(result.messages[1].isPersonal).toBe(false);
    });

    it('should handle null lastMessage', () => {
      const chatJson = { chatId: 'chat-1' };

      const chat = {
        toJSON: jest.fn().mockReturnValue(chatJson),
        users: [
          { id: currentUserId, username: 'Current User' },
          { id: 'user-2', username: 'Other User' },
        ],
        messages: [],
        lastMessage: null,
      };

      const result = chatMapper.mapChatToResponse(currentUserId, chat);

      expect(result.lastMessage).toBeNull();
      expect(result.lastMessageTimestamp).toBeNull();
    });

    it('should generate chat name by filtering out current user', () => {
      const chatJson = { chatId: 'chat-1' };

      const chat = {
        toJSON: jest.fn().mockReturnValue(chatJson),
        users: [
          { id: currentUserId, username: 'Current User' },
          { id: 'user-2', username: 'User Two' },
          { id: 'user-3', username: 'User Three' },
        ],
        messages: [],
        lastMessage: null,
      };

      const result = chatMapper.mapChatToResponse(currentUserId, chat);

      expect(result.name).toBe('User Two, User Three');
    });

    it('should handle empty messages array', () => {
      const chatJson = { chatId: 'chat-1' };

      const chat = {
        toJSON: jest.fn().mockReturnValue(chatJson),
        users: [
          { id: currentUserId, username: 'Current User' },
          { id: 'user-2', username: 'Other User' },
        ],
        messages: [],
        lastMessage: null,
      };

      const result = chatMapper.mapChatToResponse(currentUserId, chat);

      expect(result.messages).toEqual([]);
    });

    it('should handle chat with only current user (edge case)', () => {
      const chatJson = { chatId: 'chat-1' };

      const chat = {
        toJSON: jest.fn().mockReturnValue(chatJson),
        users: [{ id: currentUserId, username: 'Current User' }],
        messages: [],
        lastMessage: null,
      };

      const result = chatMapper.mapChatToResponse(currentUserId, chat);

      expect(result.name).toBe('');
    });
  });

  describe('mapChatToListResponse', () => {
    const currentUserId = 'user-1';
    const otherUserId = 'user-2';

    it('should map chat to list response format with online status', () => {
      const chatJson = {
        chatId: 'chat-1',
        id: 'chat-1',
        createdTimestamp: 1234567890,
      };

      const chat = {
        toJSON: jest.fn().mockReturnValue(chatJson),
        users: [
          {
            id: currentUserId,
            _id: { toString: () => currentUserId },
            username: 'Current User',
          },
          {
            id: otherUserId,
            _id: { toString: () => otherUserId },
            username: 'Other User',
          },
        ],
        messages: [
          {
            toJSON: jest.fn().mockReturnValue({
              id: 'msg-1',
              text: 'Hello',
              userId: currentUserId,
            }),
            userId: { toString: () => currentUserId },
          },
        ],
      };

      const connections = [
        {
          userId: { toString: () => otherUserId },
        },
      ];

      const result = chatMapper.mapChatToListResponse(
        currentUserId,
        chat,
        connections,
      );

      expect(chat.toJSON).toHaveBeenCalled();
      expect(result).toEqual({
        ...chatJson,
        online: true,
        name: 'Other User',
        messages: [
          {
            id: 'msg-1',
            text: 'Hello',
            userId: currentUserId,
            isPersonal: true,
          },
        ],
      });
    });

    it('should set online status to false when user is not connected', () => {
      const chatJson = { chatId: 'chat-1' };

      const chat = {
        toJSON: jest.fn().mockReturnValue(chatJson),
        users: [
          {
            id: currentUserId,
            _id: { toString: () => currentUserId },
            username: 'Current User',
          },
          {
            id: otherUserId,
            _id: { toString: () => otherUserId },
            username: 'Other User',
          },
        ],
        messages: [],
      };

      const connections = [
        {
          userId: { toString: () => 'user-3' },
        },
      ];

      const result = chatMapper.mapChatToListResponse(
        currentUserId,
        chat,
        connections,
      );

      expect(result.online).toBe(false);
    });

    it('should set online status to false when connections array is empty', () => {
      const chatJson = { chatId: 'chat-1' };

      const chat = {
        toJSON: jest.fn().mockReturnValue(chatJson),
        users: [
          {
            id: currentUserId,
            _id: { toString: () => currentUserId },
            username: 'Current User',
          },
          {
            id: otherUserId,
            _id: { toString: () => otherUserId },
            username: 'Other User',
          },
        ],
        messages: [],
      };

      const connections = [];

      const result = chatMapper.mapChatToListResponse(
        currentUserId,
        chat,
        connections,
      );

      expect(result.online).toBe(false);
    });

    it('should set isPersonal flag correctly for messages', () => {
      const chatJson = { chatId: 'chat-1' };

      const chat = {
        toJSON: jest.fn().mockReturnValue(chatJson),
        users: [
          {
            id: currentUserId,
            _id: { toString: () => currentUserId },
            username: 'Current User',
          },
          {
            id: otherUserId,
            _id: { toString: () => otherUserId },
            username: 'Other User',
          },
        ],
        messages: [
          {
            toJSON: jest.fn().mockReturnValue({
              id: 'msg-1',
              userId: currentUserId,
            }),
            userId: { toString: () => currentUserId },
          },
          {
            toJSON: jest.fn().mockReturnValue({
              id: 'msg-2',
              userId: otherUserId,
            }),
            userId: { toString: () => otherUserId },
          },
        ],
      };

      const connections = [];

      const result = chatMapper.mapChatToListResponse(
        currentUserId,
        chat,
        connections,
      );

      expect(result.messages[0].isPersonal).toBe(true);
      expect(result.messages[1].isPersonal).toBe(false);
    });

    it('should extract name from other user', () => {
      const chatJson = { chatId: 'chat-1' };

      const chat = {
        toJSON: jest.fn().mockReturnValue(chatJson),
        users: [
          {
            id: currentUserId,
            _id: { toString: () => currentUserId },
            username: 'Current User',
          },
          {
            id: otherUserId,
            _id: { toString: () => otherUserId },
            username: 'Other User',
          },
        ],
        messages: [],
      };

      const connections = [];

      const result = chatMapper.mapChatToListResponse(
        currentUserId,
        chat,
        connections,
      );

      expect(result.name).toBe('Other User');
    });

    it('should handle multiple connections and match correct user', () => {
      const chatJson = { chatId: 'chat-1' };

      const chat = {
        toJSON: jest.fn().mockReturnValue(chatJson),
        users: [
          {
            id: currentUserId,
            _id: { toString: () => currentUserId },
            username: 'Current User',
          },
          {
            id: otherUserId,
            _id: { toString: () => otherUserId },
            username: 'Other User',
          },
        ],
        messages: [],
      };

      const connections = [
        {
          userId: { toString: () => 'user-3' },
        },
        {
          userId: { toString: () => otherUserId },
        },
        {
          userId: { toString: () => 'user-4' },
        },
      ];

      const result = chatMapper.mapChatToListResponse(
        currentUserId,
        chat,
        connections,
      );

      expect(result.online).toBe(true);
    });

    it('should handle empty messages array', () => {
      const chatJson = { chatId: 'chat-1' };

      const chat = {
        toJSON: jest.fn().mockReturnValue(chatJson),
        users: [
          {
            id: currentUserId,
            _id: { toString: () => currentUserId },
            username: 'Current User',
          },
          {
            id: otherUserId,
            _id: { toString: () => otherUserId },
            username: 'Other User',
          },
        ],
        messages: [],
      };

      const connections = [];

      const result = chatMapper.mapChatToListResponse(
        currentUserId,
        chat,
        connections,
      );

      expect(result.messages).toEqual([]);
    });
  });
});

