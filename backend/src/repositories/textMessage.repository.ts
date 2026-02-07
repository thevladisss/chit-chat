import { TextMessageModel, type ITextMessage } from '../models/textMessage.model';
import { Types } from 'mongoose';

interface CreateTextMessageData {
  chatId: string | Types.ObjectId;
  text: string;
  userId: string | Types.ObjectId;
}

export const createTextMessage = ({
  chatId,
  text,
  userId,
}: CreateTextMessageData): Promise<ITextMessage> => {
  const messageData = {
    chatId: typeof chatId === 'string' ? new Types.ObjectId(chatId) : chatId,
    userId: typeof userId === 'string' ? new Types.ObjectId(userId) : userId,
    text,
    sentAt: Date.now(),
    isSeen: false,
  };

  const message = new TextMessageModel(messageData);
  return message.save();
};

export const findAllByChatId = (chatId: string): Promise<ITextMessage[]> => {
  return TextMessageModel.find({ chatId: new Types.ObjectId(chatId) })
    .sort({ sentAt: -1 })
    .exec();
};

export const findById = (messageId: string): Promise<ITextMessage | null> => {
  return TextMessageModel.findById(messageId).exec();
};

export const findByUserId = (userId: string): Promise<ITextMessage[]> => {
  return TextMessageModel.find({ userId: new Types.ObjectId(userId) })
    .sort({ sentAt: -1 })
    .exec();
};

export const findByChatAndUserId = (
  chatId: string,
  userId: string,
): Promise<ITextMessage[]> => {
  return TextMessageModel.find({
    chatId: new Types.ObjectId(chatId),
    userId: new Types.ObjectId(userId),
  })
    .sort({ sentAt: -1 })
    .exec();
};

export const updateById = (
  messageId: string,
  updateData: Partial<ITextMessage>,
): Promise<ITextMessage | null> => {
  return TextMessageModel.findByIdAndUpdate(messageId, updateData, { new: true }).exec();
};

export const deleteById = (messageId: string): Promise<ITextMessage | null> => {
  return TextMessageModel.findByIdAndDelete(messageId).exec();
};

export default {
  createTextMessage,
  findAllByChatId,
  findById,
  findByUserId,
  findByChatAndUserId,
  updateById,
  deleteById,
};
