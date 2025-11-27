const ChatController = require('../../../controllers/chat.controller');
const ChatMessageTypeEnum = require('../../../enums/ChatMessageType');
const ChatService = require('../../../service/chat.service');

describe('chat.controller.spec.js', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendMessage', () => {
    it('should call send chat text mesage if param is "text"', async () => {
      const mockResult = { messageId: 'msg123', chatId: 'chat123' };
      const sendChatMessageSpy = jest
        .spyOn(ChatService, 'sendChatMessage')
        .mockResolvedValue(mockResult);

      const request = {
        params: {
          chatId: 'chat123',
        },
        body: {
          type: ChatMessageTypeEnum.TEXT,
          message: 'Test message',
        },
        session: {
          user: {
            id: 'user123',
            username: 'testuser',
          },
        },
      };

      const response = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      };

      await ChatController.sendMessage(request, response);

      expect(sendChatMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendChatMessageSpy).toHaveBeenCalledWith(request.session.user, {
        chatId: 'chat123',
        message: 'Test message',
      });
      expect(response.json).toHaveBeenCalledWith({
        data: mockResult,
      });
      expect(response.status).not.toHaveBeenCalled();
    });

    it('should send voice message if param is "audio""', async () => {
      const mockResult = { messageId: 'msg456', chatId: 'chat123' };
      const sendVoiceMessageSpy = jest
        .spyOn(ChatService, 'sendVoiceMessage')
        .mockResolvedValue(mockResult);

      const request = {
        params: {
          chatId: 'chat123',
        },
        body: {
          type: ChatMessageTypeEnum.AUDIO,
          audioUrl: 'https://example.com/audio.mp3',
          audioDuration: 5.5,
          audioFormat: 'mp3',
          fileSize: 102400,
          originalFileName: 'audio.mp3',
        },
        session: {
          user: {
            id: 'user123',
            username: 'testuser',
          },
        },
      };

      const response = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      };

      await ChatController.sendMessage(request, response);

      expect(sendVoiceMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendVoiceMessageSpy).toHaveBeenCalledWith(request.session.user, {
        chatId: 'chat123',
        audioUrl: 'https://example.com/audio.mp3',
        audioDuration: 5.5,
        audioFormat: 'mp3',
        fileSize: 102400,
        originalFileName: 'audio.mp3',
      });
      expect(response.json).toHaveBeenCalledWith({
        data: mockResult,
      });
      expect(response.status).not.toHaveBeenCalled();
    });
  });

  describe('getAllChats', () => {
    //TODO: Implement
  });

  describe('getFilteredChats', () => {
    //TODO: Implement
  });

  describe('initializeChat', () => {
    //TODO: Implement
  });
});
