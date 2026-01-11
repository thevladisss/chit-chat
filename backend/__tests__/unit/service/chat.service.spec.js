const ChatRepository = require('../../../src/repositories/chat.repository');
const ConnectionRepository = require('../../../src/repositories/connection.repository');
const UserRepository = require('../../../src/repositories/user.repository');
const TextMessageRepository = require('../../../src/repositories/textMessage.repository');
const AudioMessageRepository = require('../../../src/repositories/audioMessage.repository');
const ConnectionService = require('../../../src/service/connection.service');
const ChatService = require('../../../src/service/chat.service');
const ServerChatEventEnum = require('../../../src/enums/ServerChatEventEnum');
const ChatMapper = require('../../../src/mappers/chat.mapper');

describe('chat.service', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getFilteredChats', () => {
    const authenticatedUserId = 'user-1';

    it('should map chats returned from repository into view model', async () => {
      const chatJson = {
        chatId: 'chat-1',
        metadata: 'value',
      };

      const chatDocument = {
        toJSON: jest.fn(() => chatJson),
        users: [
          {
            id: authenticatedUserId,
            _id: { toString: () => authenticatedUserId },
            username: 'Authenticated User',
          },
          {
            id: 'user-2',
            _id: { toString: () => 'user-2' },
            username: 'Second User',
          },
        ],
        messages: [
          {
            toJSON: () => ({
              id: 'msg-1',
              text: 'hello',
              userId: authenticatedUserId,
            }),
            userId: { toString: () => authenticatedUserId },
          },
          {
            toJSON: () => ({
              id: 'msg-2',
              text: 'hi back',
              userId: 'user-2',
            }),
            userId: { toString: () => 'user-2' },
          },
        ],
      };

      const connectionsMock = [
        { userId: { toString: () => 'user-2' } },
        { userId: { toString: () => 'user-3' } },
      ];

      const getAllConnectionsSpy = jest
        .spyOn(ConnectionRepository, 'getAllConnections')
        .mockResolvedValue(connectionsMock);

      const findByUserNameOrChatNameOrMessageSpy = jest
        .spyOn(ChatRepository, 'findByUserNameOrChatNameOrMessage')
        .mockResolvedValue([chatDocument]);

      const results = await ChatService.getFilteredChats(
        authenticatedUserId,
        'Second',
      );

      expect(findByUserNameOrChatNameOrMessageSpy).toHaveBeenCalledWith(
        'Second',
      );
      expect(getAllConnectionsSpy).toHaveBeenCalledWith({
        userId: 1,
        _id: 0,
      });

      expect(results.length).toBe(1);
      expect(results[0]).toMatchObject(
        ChatMapper.mapChatToListResponse(
          authenticatedUserId,
          chatDocument,
          connectionsMock,
        ),
      );
    });

    it('should return empty collection if repository yields nothing', async () => {
      const getAllConnectionsSpy = jest
        .spyOn(ConnectionRepository, 'getAllConnections')
        .mockResolvedValue([]);

      const findByUserNameOrChatNameOrMessageSpy = jest
        .spyOn(ChatRepository, 'findByUserNameOrChatNameOrMessage')
        .mockResolvedValue([]);

      const results = await ChatService.getFilteredChats(
        authenticatedUserId,
        'unknown',
      );

      expect(results).toEqual([]);
      expect(findByUserNameOrChatNameOrMessageSpy).toHaveBeenCalledWith(
        'unknown',
      );
      expect(getAllConnectionsSpy).toHaveBeenCalledWith({
        userId: 1,
        _id: 0,
      });
    });
  });

  describe('getUsersByChatId', () => {
    it('should return users participating in the chat', async () => {
      const chatId = 'chat-123';
      const mockUsers = [
        { _id: { toString: () => 'user-1' }, username: 'User 1' },
        { _id: { toString: () => 'user-2' }, username: 'User 2' },
      ];
      const mockChat = {
        users: mockUsers,
      };
      const mockUserDocuments = [
        { userId: 'user-1', username: 'User 1', createdTimestamp: 123456 },
        { userId: 'user-2', username: 'User 2', createdTimestamp: 123457 },
      ];

      const findByIdSpy = jest
        .spyOn(ChatRepository, 'findById')
        .mockResolvedValue(mockChat);

      const findAllByIdSpy = jest
        .spyOn(UserRepository, 'findAllById')
        .mockResolvedValue(mockUserDocuments);

      const result = await ChatService.getUsersByChatId(chatId);

      expect(findByIdSpy).toHaveBeenCalledWith(chatId);
      expect(findAllByIdSpy).toHaveBeenCalledWith(['user-1', 'user-2']);
      expect(result).toEqual(mockUserDocuments);
    });

    it('should return empty array if chat does not exist', async () => {
      const chatId = 'non-existent-chat';

      const findByIdSpy = jest
        .spyOn(ChatRepository, 'findById')
        .mockResolvedValue(null);

      const result = await ChatService.getUsersByChatId(chatId);

      expect(findByIdSpy).toHaveBeenCalledWith(chatId);
      expect(result).toEqual([]);
    });

    it('should return empty array if chat has no users', async () => {
      const chatId = 'chat-123';
      const mockChat = {
        users: [],
      };

      const findByIdSpy = jest
        .spyOn(ChatRepository, 'findById')
        .mockResolvedValue(mockChat);

      const result = await ChatService.getUsersByChatId(chatId);

      expect(findByIdSpy).toHaveBeenCalledWith(chatId);
      expect(result).toEqual([]);
    });
  });

  describe('createChat', () => {
    it('should create a new chat with provided user IDs', async () => {
      const usersIds = ['user-1', 'user-2'];
      const mockChat = {
        chatId: 'chat-123',
        users: usersIds,
        createdTimestamp: Date.now(),
      };

      const createChatSpy = jest
        .spyOn(ChatRepository, 'createChat')
        .mockResolvedValue(mockChat);

      const result = await ChatService.createChat({ usersIds });

      expect(createChatSpy).toHaveBeenCalledWith({ usersIds });
      expect(result).toEqual(mockChat);
    });
  });

  describe('getChat', () => {
    it('should return chat with name and last message information', async () => {
      const userId = 'user-1';
      const chatId = 'chat-123';
      const chatJson = {
        chatId: 'chat-123',
        users: [],
        messages: [],
      };
      const mockChat = {
        toJSON: jest.fn(() => chatJson),
        users: [
          { id: userId, username: 'User 1' },
          { id: 'user-2', username: 'User 2' },
        ],
        messages: [],
        lastMessage: {
          text: 'Last message',
          createdTimestamp: 1234567890,
        },
      };

      const findByIdSpy = jest
        .spyOn(ChatRepository, 'findById')
        .mockResolvedValue(mockChat);

      const result = await ChatService.getChat(userId, chatId);

      expect(findByIdSpy).toHaveBeenCalledWith(chatId);
      expect(result).toMatchObject(
        ChatMapper.mapChatToResponse(userId, mockChat),
      );
    });

    it('should return null if chat does not exist', async () => {
      const userId = 'user-1';
      const chatId = 'non-existent-chat';

      const findByIdSpy = jest
        .spyOn(ChatRepository, 'findById')
        .mockResolvedValue(null);

      const result = await ChatService.getChat(userId, chatId);

      expect(findByIdSpy).toHaveBeenCalledWith(chatId);
      expect(result).toBeNull();
    });

    it('should return chat with null last message if no last message exists', async () => {
      const userId = 'user-1';
      const chatId = 'chat-123';
      const chatJson = {
        chatId: 'chat-123',
        users: [],
        messages: [],
      };
      const mockChat = {
        toJSON: jest.fn(() => chatJson),
        users: [{ id: 'user-2', username: 'User 1' }],
        messages: [],
        lastMessage: null,
      };

      const findByIdSpy = jest
        .spyOn(ChatRepository, 'findById')
        .mockResolvedValue(mockChat);

      const result = await ChatService.getChat(userId, chatId);

      expect(result).toMatchObject(
        ChatMapper.mapChatToResponse(userId, mockChat),
      );
    });
  });

  describe('getUserChats', () => {
    it('should return user chats with online status and mapped messages', async () => {
      const userId = 'user-1';
      const chatJson = {
        chatId: 'chat-1',
        metadata: 'value',
      };
      const mockChat = {
        toJSON: jest.fn(() => chatJson),
        users: [
          {
            id: userId,
            _id: { toString: () => userId },
            username: 'User 1',
          },
          {
            id: 'user-2',
            _id: { toString: () => 'user-2' },
            username: 'User 2',
          },
        ],
        messages: [
          {
            toJSON: () => ({
              id: 'msg-1',
              text: 'hello',
              userId: userId,
            }),
            userId: { toString: () => userId },
          },
        ],
      };
      const connectionsMock = [{ userId: { toString: () => 'user-2' } }];

      const findAllChatsByUsersIdsSpy = jest
        .spyOn(ChatRepository, 'findAllChatsByUsersIds')
        .mockResolvedValue([mockChat]);

      const getAllConnectionsSpy = jest
        .spyOn(ConnectionRepository, 'getAllConnections')
        .mockResolvedValue(connectionsMock);

      const result = await ChatService.getUserChats(userId);

      expect(findAllChatsByUsersIdsSpy).toHaveBeenCalledWith([userId]);
      expect(getAllConnectionsSpy).toHaveBeenCalledWith({
        userId: 1,
        _id: 0,
      });

      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject(
        ChatMapper.mapChatToListResponse(userId, mockChat, connectionsMock),
      );
    });

    it('should return empty array if user has no chats', async () => {
      const userId = 'user-1';

      const findAllChatsByUsersIdsSpy = jest
        .spyOn(ChatRepository, 'findAllChatsByUsersIds')
        .mockResolvedValue([]);

      const getAllConnectionsSpy = jest
        .spyOn(ConnectionRepository, 'getAllConnections')
        .mockResolvedValue([]);

      const result = await ChatService.getUserChats(userId);

      expect(result).toEqual([]);
    });
  });

  describe('sendChatMessage', () => {
    it('should create text message', async () => {
      const sender = { userId: 'user-1' };
      const data = {
        chatId: 'chat-123',
        message: 'Hello world',
      };
      const chatJson = {
        chatId: 'chat-123',
        users: ['user-1', 'user-2'],
      };
      const mockChat = {
        chatId: 'chat-123',
        toJSON: jest.fn(() => chatJson),
        users: [
          {
            id: 'user-1',
            username: 'User 1',
          },
          {
            id: 'user-2',
            username: 'User 2',
          },
        ],
        messages: [],
        lastMessage: null,
      };

      // Mock chat document for getUserChats (called internally)
      const chatJsonForGetUserChats = {
        chatId: 'chat-123',
        metadata: 'value',
      };
      const mockGetUserChats1 = {
        toJSON: jest.fn(() => chatJsonForGetUserChats),
        users: [
          {
            id: 'user-1',
            _id: { toString: () => 'user-1' },
            username: 'User 1',
          },
          {
            id: 'user-2',
            _id: { toString: () => 'user-2' },
            username: 'User 2',
          },
        ],
        messages: [
          {
            toJSON: () => ({
              id: 'msg-1',
              text: 'Hello world',
              userId: 'user-1',
            }),
            userId: { toString: () => 'user-1' },
          },
        ],
      };

      const connectionsMock = [
        {
          userId: {
            toString: () => 'user-2',
            ws: {
              send: jest.fn(),
            },
          },
        },
      ];
      const mockConnection = {
        userId: 'user-2',
        ws: {
          send: jest.fn(),
        },
      };

      const createTextMessageSpy = jest
        .spyOn(TextMessageRepository, 'createTextMessage')
        .mockResolvedValue({});

      jest.spyOn(ChatRepository, 'findById').mockResolvedValue(mockChat);

      // Mock getUserChats dependencies (same pattern as getUserChats describe block)
      jest
        .spyOn(ChatRepository, 'findAllChatsByUsersIds')
        .mockResolvedValue([mockGetUserChats1]);

      jest
        .spyOn(ConnectionRepository, 'getAllConnections')
        .mockResolvedValue(connectionsMock);

      jest
        .spyOn(ConnectionService, 'getAllConnectionsByUserIds')
        .mockResolvedValue([mockConnection]);

      await ChatService.sendChatMessage(sender, data);

      expect(createTextMessageSpy).toHaveBeenCalledWith({
        chatId: data.chatId,
        text: data.message,
        userId: sender.userId,
      });
    });

    it.todo('should notify chat participants on a new message');

    it('should return expected data', async () => {
      const sender = { userId: 'user-1' };
      const data = {
        chatId: 'chat-123',
        message: 'Hello world',
      };
      const chatJson = {
        chatId: 'chat-123',
        users: ['user-1', 'user-2'],
      };
      const mockChat = {
        chatId: 'chat-123',
        toJSON: jest.fn(() => chatJson),
        users: [
          {
            id: 'user-1',
            username: 'User 1',
          },
          {
            id: 'user-2',
            username: 'User 2',
          },
        ],
        messages: [],
        lastMessage: null,
      };

      // Mock chat document for getUserChats (called internally)
      const chatJsonForGetUserChats = {
        chatId: 'chat-123',
        metadata: 'value',
      };
      const mockGetUserChats1 = {
        toJSON: jest.fn(() => chatJsonForGetUserChats),
        users: [
          {
            id: 'user-1',
            _id: { toString: () => 'user-1' },
            username: 'User 1',
          },
          {
            id: 'user-2',
            _id: { toString: () => 'user-2' },
            username: 'User 2',
          },
        ],
        messages: [
          {
            toJSON: () => ({
              id: 'msg-1',
              text: 'Hello world',
              userId: 'user-1',
            }),
            userId: { toString: () => 'user-1' },
          },
        ],
      };

      const connectionsMock = [{ userId: { toString: () => 'user-2' } }];
      const mockConnection = {
        userId: 'user-2',
        ws: {
          send: jest.fn(),
        },
      };

      const createTextMessageSpy = jest
        .spyOn(TextMessageRepository, 'createTextMessage')
        .mockResolvedValue({});

      const findByIdSpy = jest
        .spyOn(ChatRepository, 'findById')
        .mockResolvedValue(mockChat);

      // Mock getUserChats dependencies (same pattern as getUserChats describe block)
      const findAllChatsByUsersIdsSpy = jest
        .spyOn(ChatRepository, 'findAllChatsByUsersIds')
        .mockResolvedValue([mockGetUserChats1]);

      const getAllConnectionsSpy = jest
        .spyOn(ConnectionRepository, 'getAllConnections')
        .mockResolvedValue(connectionsMock);

      jest
        .spyOn(ConnectionService, 'getAllConnectionsByUserIds')
        .mockResolvedValue([mockConnection]);

      const result = await ChatService.sendChatMessage(sender, data);

      expect(result.chatId).toBe(mockChat.chatId);
      expect(result.chat).toMatchObject(
        ChatMapper.mapChatToResponse(sender.userId, mockChat),
      );
      expect(result.chats).toBeDefined();
      expect(Array.isArray(result.chats)).toBe(true);
      expect(result.chats.length).toBe(1);
      expect(result.chats[0]).toMatchObject(
        ChatMapper.mapChatToListResponse(
          sender.userId,
          mockGetUserChats1,
          connectionsMock,
        ),
      );
    });
  });

  describe('sendVoiceMessage', () => {
    it('should create audio message', async () => {
      const sender = { userId: 'user-1' };
      const data = {
        chatId: 'chat-123',
        audioUrl: 'https://example.com/audio.webm',
        audioDuration: 5.5,
        audioFormat: 'webm',
        fileSize: 102400,
        originalFileName: 'audio.webm',
      };

      const mockChat = {
        _id: 'chat-123',
        chatId: 'chat-123',
        users: ['user-1', 'user-2'],
        toJSON: jest.fn(() => ({
          chatId: 'chat-123',
          users: ['user-1', 'user-2'],
          messages: [],
        })),
        messages: [],
      };

      const connectionsMock = [{ userId: { toString: () => 'user-2' } }];
      const mockConnection = {
        userId: 'user-2',
        ws: {
          send: jest.fn(),
        },
      };

      const createAudioMessageSpy = jest
        .spyOn(AudioMessageRepository, 'createAudioMessage')
        .mockResolvedValue({});

      jest
        .spyOn(ConnectionRepository, 'getAllConnections')
        .mockResolvedValue(connectionsMock);

      const getAllConnectionsByUserIdsSpy = jest
        .spyOn(ConnectionService, 'getAllConnectionsByUserIds')
        .mockResolvedValue([mockConnection]);

      const mockGetUserChats1 = [
        {
          toJSON: jest.fn(() => ({
            chatId: 'chat-123',
            metadata: 'value',
            lastMessage: 'First chat test message',
          })),
          chatId: 'chat-123',
          name: 'User 1',
          users: [
            {
              id: 'user-1',
              _id: { toString: () => 'user-1' },
              username: 'User 1',
            },
            {
              id: 'user-2',
              _id: { toString: () => 'user-2' },
              username: 'User 2',
            },
          ],
          messages: [
            {
              toJSON: () => ({
                id: 'msg-1',
                text: 'First chat test message',
                userId: 'user-1',
                sentAt: 1234567890,
              }),
              userId: { toString: () => 'user-1' },
            },
          ],
        },
      ];

      const mockGetUserChats2 = [
        {
          toJSON: jest.fn(() => ({ chatId: 'chat-123', name: 'User 1' })),
          chatId: 'chat-123',
          name: 'User 1',
          users: [
            {
              id: 'user-2',
              _id: { toString: () => 'user-2' },
              username: 'User 2',
            },
            {
              id: 'user-1',
              _id: { toString: () => 'user-1' },
              username: 'User 1',
            },
          ],
          messages: [],
        },
      ];

      jest
        .spyOn(ChatRepository, 'findAllChatsByUsersIds')
        .mockResolvedValueOnce(mockGetUserChats1)
        .mockResolvedValueOnce(mockGetUserChats2);

      jest.spyOn(ChatRepository, 'findById').mockResolvedValue(mockChat);

      jest
        .spyOn(AudioMessageRepository, 'createAudioMessage')
        .mockResolvedValue({});

      await ChatService.sendVoiceMessage(sender, data);

      expect(createAudioMessageSpy).toHaveBeenCalledWith({
        chatId: data.chatId,
        userId: sender.userId,
        audioUrl: data.audioUrl,
        audioDuration: data.audioDuration,
        audioFormat: data.audioFormat,
        fileSize: data.fileSize,
        originalFileName: data.originalFileName,
      });
    });

    it.todo('should notify chat participants on a new message');

    it('should use default values for optional audio message fields', async () => {
      const sender = { userId: 'user-1' };
      const data = {
        chatId: 'chat-123',
        audioUrl: 'https://example.com/audio.webm',
        audioDuration: 5.5,
      };
      const chatJson = {
        chatId: 'chat-123',
        users: ['user-1'],
      };
      const mockChat = {
        chatId: 'chat-123',
        toJSON: jest.fn(() => chatJson),
        users: ['user-1'],
        messages: [],
      };

      const createAudioMessageSpy = jest
        .spyOn(AudioMessageRepository, 'createAudioMessage')
        .mockResolvedValue({});

      jest.spyOn(ChatRepository, 'findById').mockResolvedValue(mockChat);

      // Mock getUserChats dependencies (same pattern as getUserChats describe block)
      jest
        .spyOn(ChatRepository, 'findAllChatsByUsersIds')
        .mockResolvedValue([]);
      jest
        .spyOn(ConnectionRepository, 'getAllConnections')
        .mockResolvedValue([]);
      jest
        .spyOn(ConnectionService, 'getAllConnectionsByUserIds')
        .mockResolvedValue([]);

      await ChatService.sendVoiceMessage(sender, data);

      expect(createAudioMessageSpy).toHaveBeenCalledWith({
        chatId: data.chatId,
        userId: sender.userId,
        audioUrl: data.audioUrl,
        audioDuration: data.audioDuration,
        audioFormat: 'webm',
        fileSize: 0,
        originalFileName: 'audio.webm',
      });
    });

    it('should return expected data', async () => {
      const sender = { userId: 'user-1' };
      const data = {
        chatId: 'chat-123',
        audioUrl: 'https://example.com/audio.webm',
        audioDuration: 5.5,
        audioFormat: 'webm',
        fileSize: 102400,
        originalFileName: 'audio.webm',
      };

      const chatJson = {
        chatId: 'chat-123',
        users: ['user-1', 'user-2'],
        createdTimestamp: 1234567890,
      };

      const mockChat = {
        chatId: 'chat-123',
        toJSON: jest.fn(() => chatJson),
        users: [
          {
            id: 'user-1',
            username: 'User 1',
          },
          {
            id: 'user-2',
            username: 'User 2',
          },
        ],
        messages: [],
        lastMessage: null,
      };

      const connectionsMock = [{ userId: { toString: () => 'user-2' } }];
      const mockConnection = {
        userId: 'user-2',
        ws: {
          send: jest.fn(),
        },
      };

      const mockChatForGetUserChats = {
        toJSON: jest.fn(() => ({
          chatId: 'chat-123',
          metadata: 'value',
        })),
        users: [
          {
            id: 'user-1',
            _id: { toString: () => 'user-1' },
            username: 'User 1',
          },
          {
            id: 'user-2',
            _id: { toString: () => 'user-2' },
            username: 'User 2',
          },
        ],
        messages: [
          {
            toJSON: () => ({
              id: 'msg-1',
              text: 'Audio message',
              userId: 'user-1',
            }),
            userId: { toString: () => 'user-1' },
          },
        ],
      };

      jest
        .spyOn(AudioMessageRepository, 'createAudioMessage')
        .mockResolvedValue({});

      jest.spyOn(ChatRepository, 'findById').mockResolvedValue(mockChat);

      jest
        .spyOn(ChatRepository, 'findAllChatsByUsersIds')
        .mockResolvedValue([mockChatForGetUserChats]);

      jest
        .spyOn(ConnectionRepository, 'getAllConnections')
        .mockResolvedValue(connectionsMock);

      jest
        .spyOn(ConnectionService, 'getAllConnectionsByUserIds')
        .mockResolvedValue([mockConnection]);

      const result = await ChatService.sendVoiceMessage(sender, data);

      expect(result).toHaveProperty('chatId');
      expect(result).toHaveProperty('chat');
      expect(result).toHaveProperty('chats');

      expect(result.chatId).toBe('chat-123');
      expect(result.chat).toMatchObject(
        ChatMapper.mapChatToResponse(sender.userId, mockChat),
      );
      expect(Array.isArray(result.chats)).toBe(true);
      expect(result.chats.length).toBe(1);
      expect(result.chats[0]).toMatchObject(
        ChatMapper.mapChatToListResponse(
          sender.userId,
          mockChatForGetUserChats,
          connectionsMock,
        ),
      );
    });
  });

  describe.only('createNewChatForAllUsers', () => {
    //TODO: Fix this test
    it.skip('should create chats for all users', async () => {
      const userId = 'user-1';
      const mockChats = [
        { chatId: 'chat-1', users: [userId, 'user-2'], messages: [] },
        { chatId: 'chat-2', users: [userId, 'user-3'], messages: [] },
      ];
      const mockConnections = [
        {
          userId: 'user-2',
          ws: { send: jest.fn() },
        },
        {
          userId: 'user-3',
          ws: { send: jest.fn() },
        },
      ];

      // Mock chat documents for getUserChats (called internally for each user)
      const mockGetUserChats2 = {
        toJSON: jest.fn(() => ({ chatId: 'chat-1' })),
        users: [
          {
            id: 'user-2',
            _id: { toString: () => 'user-2' },
            username: 'User 2',
          },
        ],
        messages: [],
      };
      const mockChatForUser3 = {
        toJSON: jest.fn(() => ({ chatId: 'chat-2' })),
        users: [
          {
            id: 'user-3',
            _id: { toString: () => 'user-3' },
            username: 'User 3',
          },
        ],
        messages: [],
      };

      const createChatForUsersSpy = jest
        .spyOn(ChatRepository, 'createChatForUsers')
        .mockResolvedValue(mockChats);

      const getAllConnectionsNoCurrentSpy = jest
        .spyOn(ConnectionService, 'getAllConnectionsNoCurrent')
        .mockResolvedValue(mockConnections);

      // Mock getUserChats dependencies (same pattern as getUserChats describe block)
      const findAllChatsByUsersIdsSpy = jest
        .spyOn(ChatRepository, 'findAllChatsByUsersIds')
        .mockImplementation(async (userIds) => {
          if (userIds[0] === 'user-2') {
            return [mockGetUserChats2];
          }
          if (userIds[0] === 'user-3') {
            return [mockChatForUser3];
          }
          return [];
        });

      jest
        .spyOn(ConnectionRepository, 'getAllConnections')
        .mockResolvedValue([]);

      const result = await ChatService.createNewChatForAllUsers(userId);

      expect(createChatForUsersSpy).toHaveBeenCalledWith(userId);
      expect(getAllConnectionsNoCurrentSpy).toHaveBeenCalledWith(userId);
      expect(findAllChatsByUsersIdsSpy).toHaveBeenCalledWith(['user-2']);
      expect(findAllChatsByUsersIdsSpy).toHaveBeenCalledWith(['user-3']);
      expect(mockConnections[0].ws.send).toHaveBeenCalled();
      expect(mockConnections[1].ws.send).toHaveBeenCalled();
      expect(result).toEqual(mockChats);
    });
  });
});
