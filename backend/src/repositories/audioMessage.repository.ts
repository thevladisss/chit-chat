import { AudioMessageModel, type IAudioMessage } from '../models/audioMessage.model';
import { Types } from 'mongoose';

interface CreateAudioMessageData {
  chatId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  audioUrl: string;
  audioDuration: number;
  audioFormat: 'webm' | 'mp4' | 'wav' | 'ogg' | 'm4a';
  fileSize: number;
  originalFileName: string;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  filter?: Record<string, any>;
}

interface PaginatedResult {
  audioMessages: IAudioMessage[];
  total: number;
  page: number;
  pages: number;
}

interface AudioMessageStats {
  totalAudioMessages: number;
  totalFileSize: number;
  averageDuration: number;
  averageFileSize: number;
}

export const createAudioMessage = (
  audioMessageData: CreateAudioMessageData,
): Promise<IAudioMessage> => {
  const audioMessage = new AudioMessageModel({
    ...audioMessageData,
    chatId:
      typeof audioMessageData.chatId === 'string'
        ? new Types.ObjectId(audioMessageData.chatId)
        : audioMessageData.chatId,
    userId:
      typeof audioMessageData.userId === 'string'
        ? new Types.ObjectId(audioMessageData.userId)
        : audioMessageData.userId,
  });
  return audioMessage.save();
};

export const findByChatId = (chatId: string): Promise<IAudioMessage[]> => {
  return AudioMessageModel.find({ chatId: new Types.ObjectId(chatId) })
    .sort({ sentAt: -1 })
    .exec();
};

export const findByUserId = (userId: string): Promise<IAudioMessage[]> => {
  return AudioMessageModel.find({ userId: new Types.ObjectId(userId) })
    .sort({ sentAt: -1 })
    .exec();
};

export const findByChatAndUserId = (
  chatId: string,
  userId: string,
): Promise<IAudioMessage[]> => {
  return AudioMessageModel.find({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(userId),
  })
    .sort({ sentAt: -1 })
    .exec();
};

export const findById = (audioMessageId: string): Promise<IAudioMessage | null> => {
  return AudioMessageModel.findById(audioMessageId).exec();
};

export const deleteById = (audioMessageId: string): Promise<IAudioMessage | null> => {
  return AudioMessageModel.findByIdAndDelete(audioMessageId).exec();
};

export const updateById = (
  audioMessageId: string,
  updateData: Partial<IAudioMessage>,
): Promise<IAudioMessage | null> => {
  return AudioMessageModel.findByIdAndUpdate(audioMessageId, updateData, {
    new: true,
  }).exec();
};

export const getAudioMessagesWithPagination = async (
  options: PaginationOptions = {},
): Promise<PaginatedResult> => {
  const { page = 1, limit = 10, filter = {} } = options;
  const skip = (page - 1) * limit;

  const [audioMessages, total] = await Promise.all([
    AudioMessageModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    AudioMessageModel.countDocuments(filter),
  ]);

  const pages = Math.ceil(total / limit);

  return {
    audioMessages,
    total,
    page,
    pages,
  };
};

export const getAudioMessageStats = async (): Promise<AudioMessageStats> => {
  const stats = await AudioMessageModel.aggregate([
    {
      $group: {
        _id: null,
        totalAudioMessages: { $sum: 1 },
        totalFileSize: { $sum: '$fileSize' },
        averageDuration: { $avg: '$audioDuration' },
        averageFileSize: { $avg: '$fileSize' },
      },
    },
  ]);

  return (
    stats[0] || {
      totalAudioMessages: 0,
      totalFileSize: 0,
      averageDuration: 0,
      averageFileSize: 0,
    }
  );
};

export default {
  createAudioMessage,
  findByChatId,
  findByUserId,
  findByChatAndUserId,
  findById,
  deleteById,
  updateById,
  getAudioMessagesWithPagination,
  getAudioMessageStats,
};
