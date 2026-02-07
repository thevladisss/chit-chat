import { Types } from 'mongoose';
import { ChatModel, type IChat } from '../models/chat.model';
import { type IUser, UserModel } from '../models/user.model';
import { TextMessageModel } from '../models/textMessage.model';
import UserRepository from './user.repository';

export const getChatsByParticipants = async (
  userId: string,
): Promise<IChat[]> => {
  return ChatModel.find({ users: { $in: userId } })
    .populate('users')
    .exec();
};

export const findAllChatsByUsersIds = async (
  usersIds: string[],
): Promise<IChat[]> => {
  const objectsIds = usersIds.map((userId) => new Types.ObjectId(userId));
  return ChatModel.find({ users: { $in: objectsIds } })
    .populate('users')
    .populate('messages')
    .exec();
};

export const findAllChatsIdsByUsersIds = async (
  usersIds: string[],
): Promise<string[]> => {
  const objectsIds = usersIds.map((userId) => new Types.ObjectId(userId));
  const chats = await ChatModel.find({ users: { $in: objectsIds } })
    .select({ _id: true })
    .populate('users')
    .populate('messages')
    .exec();
  return chats.map((chat) => chat._id.toString());
};

interface CreateChatData {
  usersIds: string[];
}

export const createChat = (data: CreateChatData): Promise<IChat> => {
  const chat = new ChatModel({
    users: data.usersIds.map((userId) => new Types.ObjectId(userId)),
  });
  return chat.save();
};

export const createChatForUsers = async (userId: string): Promise<IChat[]> => {
  const users = await UserRepository.findAllExcludingId(userId);
  const chats = await ChatModel.insertMany(
    users.map((user) => ({
      users: [user._id, new Types.ObjectId(userId)],
    })),
  );
  return chats;
};

export const getAllChats = (): Promise<IChat[]> => {
  return ChatModel.find({}).populate('users').populate('messages').exec();
};

export const findById = (chatId: string): Promise<IChat | null> => {
  return ChatModel.findById(chatId)
    .populate('users')
    .populate('messages')
    .exec();
};

/**
 * Find a chat by its ID, throws if not found
 */
export const findByIdOrFail = (chatId: string): Promise<IChat> => {
  return ChatModel.findById(chatId)
    .populate('users')
    .populate('messages')
    .orFail()
    .exec();
};

export const findByUsersIds = (usersIds: string[]): Promise<IChat | null> => {
  const objectsIds = usersIds.map((userId) => new Types.ObjectId(userId));
  return ChatModel.findOne({
    users: { $all: objectsIds },
    $expr: { $eq: [{ $size: '$users' }, usersIds.length] },
  })
    .populate('users')
    .populate('messages')
    .exec();
};

export const findIdsOfAllUsersHavingChatWithUser = async (
  userId: string,
): Promise<string[]> => {
  const userObjectId = new Types.ObjectId(userId);
  const chats = await ChatModel.find({
    users: { $all: [userObjectId] },
    $expr: { $eq: [{ $size: '$users' }, 2] },
  })
    .populate('users')
    .populate('messages')
    .exec();

  const otherUserIds: string[] = [];

  for (const chat of chats) {
    // users is always populated (see .populate('users') above)
    const other = (chat.users as IUser[]).find(
      (user) => !user._id.equals(userObjectId),
    );

    if (other) {
      otherUserIds.push(other._id.toString());
    }
  }
  return otherUserIds;
};

export const findByUserNameOrChatNameOrMessage = async (
  search: string,
): Promise<IChat[]> => {
  if (!search || typeof search !== 'string') {
    return [];
  }

  const searchRegex = new RegExp(search, 'i');

  const chatsByName = await ChatModel.find({
    name: { $regex: searchRegex },
  })
    .populate('users')
    .populate('messages')
    .exec();

  const usersByUsername = await UserModel.find({
    username: { $regex: searchRegex },
  }).exec();

  const userIds = usersByUsername.map((user) => user._id);

  const chatsByParticipant = await ChatModel.find({
    users: { $in: userIds },
  })
    .populate('users')
    .populate('messages')
    .exec();

  const messagesByContent = await TextMessageModel.find({
    text: { $regex: searchRegex },
  }).exec();

  const chatIdsByMessage = [
    ...new Set(messagesByContent.map((message) => message.chatId.toString())),
  ];

  const chatsByMessage = await ChatModel.find({
    _id: { $in: chatIdsByMessage.map((id) => new Types.ObjectId(id)) },
  })
    .populate('users')
    .populate('messages')
    .exec();

  const allChats = [...chatsByName, ...chatsByParticipant, ...chatsByMessage];
  const uniqueChats = new Map<string, IChat>();

  for (const chat of allChats) {
    if (!uniqueChats.has(chat._id.toString())) {
      uniqueChats.set(chat._id.toString(), chat);
    }
  }

  return [...uniqueChats.values()];
};

export default {
  createChatForUsers,
  findByUserNameOrChatNameOrMessage,
  findAllChatsIdsByUsersIds,
  findAllChatsByUsersIds,
  findByUsersIds,
  getAllChats,
  createChat,
  getChatsByParticipants,
  findById,
  findByIdOrFail,
  findIdsOfAllUsersHavingChatWithUser,
};
