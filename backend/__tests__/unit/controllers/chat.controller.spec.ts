import * as ChatController from '../../../src/controllers/chat.controller';
import ChatMessageTypeEnum from '../../../src/enums/ChatMessageType';
import ChatService from '../../../src/service/chat.service';
import UserRepository from '../../../src/repositories/user.repository';
import { Request, Response } from 'express';

const mockUser = { id: 'user123', userId: 'user123', _id: { toString: () => 'user123' } };

describe('chat.controller.spec.ts', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(UserRepository, 'findByIdOrFail').mockResolvedValue(mockUser as any);
  });

  describe('sendMessage', () => {
    it('should call send chat text mesage if param is "text"', async () => {
      const mockResult = { messageId: 'msg123', chatId: 'chat123' };
      const sendChatMessageSpy = jest
        .spyOn(ChatService, 'sendChatMessage')
        .mockResolvedValue(mockResult);

      const request = {
        params: { chatId: 'chat123' },
        body: {
          type: ChatMessageTypeEnum.TEXT,
          message: 'Test message',
        },
        session: {
          userId: 'user123',
        },
      } as unknown as Request;

      const response = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await ChatController.sendMessage(request, response);

      expect(sendChatMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendChatMessageSpy).toHaveBeenCalledWith(mockUser, {
        chatId: 'chat123',
        message: 'Test message',
      });
      expect(response.json).toHaveBeenCalledWith({ data: mockResult });
      expect(response.status).not.toHaveBeenCalled();
    });

    it.skip('should send voice message if param is "audio" (sendVoiceMessage not yet implemented)', async () => {
      const mockResult = { messageId: 'msg456', chatId: 'chat123' };
      const sendVoiceMessageSpy = jest
        .spyOn(ChatService as any, 'sendVoiceMessage')
        .mockResolvedValue(mockResult as any);

      const request = {
        params: { chatId: 'chat123' },
        body: {
          type: ChatMessageTypeEnum.AUDIO,
          audioUrl: 'https://example.com/audio.mp3',
          audioDuration: 5.5,
          audioFormat: 'mp3',
          fileSize: 102400,
          originalFileName: 'audio.mp3',
        },
        session: { userId: 'user123' },
      } as unknown as Request;

      const response = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await ChatController.sendMessage(request, response);

      expect(sendVoiceMessageSpy).toHaveBeenCalledTimes(1);
      expect(sendVoiceMessageSpy).toHaveBeenCalledWith(mockUser, {
          chatId: 'chat123',
          audioUrl: 'https://example.com/audio.mp3',
          audioDuration: 5.5,
          audioFormat: 'mp3',
          fileSize: 102400,
          originalFileName: 'audio.mp3',
        },
      );
      expect(response.json).toHaveBeenCalledWith({ data: mockResult });
      expect(response.status).not.toHaveBeenCalled();
    });
  });

  describe('getAllChats', () => {
    // TODO: Implement
  });

  describe('getFilteredChats', () => {
    // TODO: Implement
  });

  describe('initializeChat', () => {
    // TODO: Implement
  });
});
