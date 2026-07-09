import ChatRepository from '../../../src/repositories/chat.repository';
import UserRepository from '../../../src/repositories/user.repository';
import TextMessageRepository from '../../../src/repositories/textMessage.repository';
import ConnectionService from '../../../src/service/connection.service';
import * as ChatService from '../../../src/service/chat.service';
import ChatMapper from '../../../src/mappers/chat.mapper';
import { NotFoundError } from '../../../src/errors/NotFoundError';

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
      } as any;

      const connectionsMock = [
        { userId: 'user-2' },
        { userId: 'user-3' },
      ] as any[];

      const getAllConnectionsSpy = jest
        .spyOn(ConnectionService, 'getAllConnectionsOnline')
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
      expect(getAllConnectionsSpy).toHaveBeenCalled();

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
        .spyOn(ConnectionService, 'getAllConnectionsOnline')
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
      expect(getAllConnectionsSpy).toHaveBeenCalled();
    });
  });

  describe('getUsersByChatId', () => {
    it('should return users participating in the chat', async () => {
      const chatId = 'chat-123';
      const mockUsers = [
        { _id: { toString: () => 'user-1' }, username: 'User 1' },
        { _id: { toString: () => 'user-2' }, username: 'User 2' },
      ];
      const mockChat = { users: mockUsers } as any;
      const mockUserDocuments = [
        { userId: 'user-1', username: 'User 1', createdAt: '2020-01-01', updatedAt: '2020-01-01' },
        { userId: 'user-2', username: 'User 2', createdAt: '2020-01-01', updatedAt: '2020-01-01' },
      ];

      const findByIdSpy = jest
        .spyOn(ChatRepository, 'findById')
        .mockResolvedValue(mockChat);

      const findAllByIdSpy = jest
        .spyOn(UserRepository, 'findAllById')
        .mockResolvedValue(mockUserDocuments as any);

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
      const mockChat = { users: [] } as any;

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
      } as any;

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
      } as any;

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
        users: [
          { id: userId, username: 'User 1' },
          { id: 'user-2', username: 'User 2' },
        ],
        messages: [],
        lastMessage: null,
      } as any;

      jest
        .spyOn(ChatRepository, 'findById')
        .mockResolvedValue(mockChat);

      const result = await ChatService.getChat(userId, chatId);

      expect(result).toMatchObject(
        ChatMapper.mapChatToResponse(userId, mockChat),
      );
    });

    it('should return null when the authenticated user is not a participant of the chat', async () => {
      const userId = 'user-1';
      const chatId = 'chat-123';
      const mockChat = {
        toJSON: jest.fn(() => ({ chatId: 'chat-123', users: [], messages: [] })),
        users: [
          { id: 'user-2', username: 'User 2' },
          { id: 'user-3', username: 'User 3' },
        ],
        messages: [],
        lastMessage: null,
      } as any;

      const findByIdSpy = jest
        .spyOn(ChatRepository, 'findById')
        .mockResolvedValue(mockChat);

      const result = await ChatService.getChat(userId, chatId);

      expect(findByIdSpy).toHaveBeenCalledWith(chatId);
      expect(result).toBeNull();
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
      } as any;
      const connectionsMock = [{ userId: 'user-2' }] as any[];

      const findAllChatsByUsersIdsSpy = jest
        .spyOn(ChatRepository, 'findAllChatsByUsersIds')
        .mockResolvedValue([mockChat]);

      const getAllConnectionsSpy = jest
        .spyOn(ConnectionService, 'getAllConnectionsOnline')
        .mockResolvedValue(connectionsMock);

      const result = await ChatService.getUserChats(userId);

      expect(findAllChatsByUsersIdsSpy).toHaveBeenCalledWith([userId]);
      expect(getAllConnectionsSpy).toHaveBeenCalled();

      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject(
        ChatMapper.mapChatToListResponse(userId, mockChat, connectionsMock),
      );
    });

    it('should return empty array if user has no chats', async () => {
      const userId = 'user-1';

      jest
        .spyOn(ChatRepository, 'findAllChatsByUsersIds')
        .mockResolvedValue([]);

      jest
        .spyOn(ConnectionService, 'getAllConnectionsOnline')
        .mockResolvedValue([]);

      const result = await ChatService.getUserChats(userId);

      expect(result).toEqual([]);
    });
  });

  describe('sendChatMessage', () => {
    it('should create text message', async () => {
      const sender = { id: 'user-1', userId: 'user-1', _id: { toString: () => 'user-1' } } as any;
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
          { id: 'user-1', username: 'User 1' },
          { id: 'user-2', username: 'User 2' },
        ],
        messages: [],
        lastMessage: null,
      } as any;

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
              sentAt: 1234567890,
            }),
            userId: { toString: () => 'user-1' },
          },
        ],
      } as any;

      const createTextMessageSpy = jest
        .spyOn(TextMessageRepository, 'createTextMessage')
        .mockResolvedValue({} as any);

      jest
        .spyOn(ChatRepository, 'findById')
        .mockResolvedValue(mockChat);
      jest
        .spyOn(ChatRepository, 'findByIdOrFail')
        .mockResolvedValue(mockChat);

      jest
        .spyOn(ChatRepository, 'findAllChatsByUsersIds')
        .mockResolvedValue([mockGetUserChats1]);
      jest
        .spyOn(ConnectionService, 'getAllConnectionsOnline')
        .mockResolvedValue([]);
      jest.spyOn(UserRepository, 'findByIdOrFail').mockResolvedValue(sender);

      jest
        .spyOn(ConnectionService, 'getAllConnectionsByUserIds')
        .mockResolvedValue([]);

      const result = await ChatService.sendChatMessage(sender.id, data);

      expect(createTextMessageSpy).toHaveBeenCalledWith({
        chatId: data.chatId,
        text: data.message,
        userId: 'user-1',
      });
      expect(result.chatId).toBe('chat-123');
      expect(result.chat).toBeDefined();
      expect(result.chats).toBeDefined();
    });

    it('should throw NotFoundError and not persist a message when the sender is not a participant', async () => {
      const data = {
        chatId: 'chat-123',
        message: 'Hello world',
      };
      const mockChat = {
        chatId: 'chat-123',
        toJSON: jest.fn(() => ({ chatId: 'chat-123' })),
        users: [
          { id: 'user-2', username: 'User 2' },
          { id: 'user-3', username: 'User 3' },
        ],
        messages: [],
        lastMessage: null,
      } as any;

      const findByIdSpy = jest
        .spyOn(ChatRepository, 'findById')
        .mockResolvedValue(mockChat);
      const createTextMessageSpy = jest
        .spyOn(TextMessageRepository, 'createTextMessage')
        .mockResolvedValue({} as any);
      const findByIdOrFailSpy = jest.spyOn(UserRepository, 'findByIdOrFail');

      await expect(ChatService.sendChatMessage('user-1', data)).rejects.toThrow(
        NotFoundError,
      );

      expect(findByIdSpy).toHaveBeenCalledWith(data.chatId);
      expect(createTextMessageSpy).not.toHaveBeenCalled();
      expect(findByIdOrFailSpy).not.toHaveBeenCalled();
    });
  });

  describe('createNewChatForAllUsers', () => {
    it.skip('should create chats for all users', async () => {
      const userId = 'user-1';
      const mockChats = [
        { chatId: 'chat-1', users: [userId, 'user-2'], messages: [] },
        { chatId: 'chat-2', users: [userId, 'user-3'], messages: [] },
      ] as any[];
      const mockConnections = [
        { userId: 'user-2', ws: { send: jest.fn() } },
        { userId: 'user-3', ws: { send: jest.fn() } },
      ] as any[];

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
      } as any;
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
      } as any;

      const createChatForUsersSpy = jest
        .spyOn(ChatRepository, 'createChatForUsers')
        .mockResolvedValue(mockChats);

      const getAllConnectionsNoCurrentSpy = jest
        .spyOn(ConnectionService, 'getAllConnectionsNoCurrent')
        .mockResolvedValue(mockConnections);

      const findAllChatsByUsersIdsSpy = jest
        .spyOn(ChatRepository, 'findAllChatsByUsersIds')
        .mockImplementation(async (userIds: string[]) => {
          if (userIds[0] === 'user-2') return [mockGetUserChats2];
          if (userIds[0] === 'user-3') return [mockChatForUser3];
          return [];
        });

      jest
        .spyOn(ConnectionService, 'getAllConnectionsOnline')
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
