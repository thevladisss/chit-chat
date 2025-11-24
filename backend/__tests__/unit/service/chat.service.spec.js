const ChatRepository = require('../../../repositories/chat.repository');
const ConnectionRepository = require('../../../repositories/connection.repository');
const ChatService = require('../../../service/chat.service');

describe('chat.service', () => {
  describe('getFilteredChats', () => {
    const authenticatedUserId = 'user-1';

    afterEach(() => {
      jest.restoreAllMocks();
    });

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

      expect(findByUserNameOrChatNameOrMessageSpy).toHaveBeenCalledWith('Second');
      expect(getAllConnectionsSpy).toHaveBeenCalledWith({
        userId: 1,
        _id: 0,
      });

      expect(results).toEqual([
        {
          ...chatJson,
          online: true,
          name: 'Second User',
          lastMessage: null,
          messages: [
            {
              id: 'msg-1',
              text: 'hello',
              userId: authenticatedUserId,
              isPersonal: true,
            },
            {
              id: 'msg-2',
              text: 'hi back',
              userId: 'user-2',
              isPersonal: false,
            },
          ],
        },
      ]);
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
      expect(findByUserNameOrChatNameOrMessageSpy).toHaveBeenCalledWith('unknown');
      expect(getAllConnectionsSpy).toHaveBeenCalledWith({
        userId: 1,
        _id: 0,
      });
    });
  });
});

