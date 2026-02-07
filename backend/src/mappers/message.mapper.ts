import type { ITextMessage, TransformedTextMessage } from '../models/textMessage.model';
import type { IAudioMessage, TransformedAudioMessage } from '../models/audioMessage.model';
import type { MessageResponse } from '../types/responses';

export const mapMessageToResponse = (
  userId: string,
  message: ITextMessage | IAudioMessage,
): MessageResponse => {
  const json = message.toJSON() as TransformedTextMessage | TransformedAudioMessage;
  return {
    ...json,
    isPersonal: message.userId.toString() === userId,
  };
};

export const mapMessagesToResponse = (
  userId: string,
  messages: (ITextMessage | IAudioMessage)[],
): MessageResponse[] => {
  return messages.map((message) => mapMessageToResponse(userId, message));
};

export default {
  mapMessageToResponse,
  mapMessagesToResponse,
};
