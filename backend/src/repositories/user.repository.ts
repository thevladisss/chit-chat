import { UserModel, type IUser } from '../models/user.model';
import ChatRepository from './chat.repository';
import { ChatModel } from '../models/chat.model';
import { Types } from 'mongoose';

/**
 * Check if a user exists by username
 */
export const existsById = async (userId: string): Promise<boolean> => {
  const result = await UserModel.exists({ _id: userId }).exec();
  return !!result;
};

export const existsByUsername = async (username: string): Promise<boolean> => {
  const result = await UserModel.exists({ username }).exec();
  return !!result;
};

/**
 * Create a new user with the given username or find an existing one
 */
export const createOrFindFirstUser = async (username: string): Promise<IUser> => {
  let user = await UserModel.findOne({ username }).exec();

  if (!user) {
    const model = new UserModel({ username });
    user = await model.save();
  }

  return user;
};

/**
 * Get all users in the system
 */
export const getAllUsers = (): Promise<IUser[]> => {
  return UserModel.find({}).exec();
};

/**
 * Get all users who are not in a chat with the provided user
 */
export const getAllUsersNotInChatWithProvidedUser = async (
  userId: string,
): Promise<IUser[]> => {
  const chatsIds = await ChatRepository.findAllChatsIdsByUsersIds([userId]);
  const objectsIds = chatsIds.map((chatId) => new Types.ObjectId(chatId));
  return UserModel.find({ _id: { $nin: objectsIds } }).exec();
};

/**
 * Find a user by its ID
 */
export const findById = (userId: string): Promise<IUser | null> => {
  return UserModel.findById(userId).exec();
};

/**
 * Find a user by its ID, throws if not found
 */
export const findByIdOrFail = (userId: string): Promise<IUser> => {
  return UserModel.findById(userId).orFail().exec();
};

/**
 * Find multiple users by their IDs
 */
export const findAllById = (usersIds: string[]): Promise<IUser[]> => {
  const objectsIds = usersIds.map((userId) => new Types.ObjectId(userId));
  return UserModel.find({ _id: { $in: objectsIds } }).exec();
};

/**
 * Find multiple users by their IDs
 */
export const findAllExcludingId = (excludedId: string): Promise<IUser[]> => {
  return UserModel.find({
    _id: { $ne: new Types.ObjectId(excludedId) },
  }).exec();
};

/**
 * Find all users who have a chat with the specified user (only chats with exactly 2 users)
 */
export const findUsersHavingChatWithUser = async (userId: string): Promise<IUser[]> => {
  const userObjectId = new Types.ObjectId(userId);

  // Find all chats where the specified user is a participant and there are exactly 2 users
  const chats = await ChatModel.find({
    users: { $all: [userObjectId] },
    $expr: { $eq: [{ $size: '$users' }, 2] },
  }).exec();

  // Extract the IDs of the other users in these chats
  const otherUserIds: string[] = [];

  for (const chat of chats) {
    // users is NOT populated here (no .populate('users') call), so they are ObjectIds
    const otherUserId = (chat.users as Types.ObjectId[]).find(
      (id) => !id.equals(userObjectId),
    );
    if (otherUserId) {
      otherUserIds.push(otherUserId.toString());
    }
  }

  // Fetch and return the actual user models
  return findAllById(otherUserIds);
};

/**
 * Find all users that are not second participants of a chat with the supplied user and not the user himself
 */
export const findUsersNotHavingChatWithUser = async (
  userId: string,
): Promise<IUser[]> => {
  // Get all users who have a chat with the specified user
  const usersWithChat = await findUsersHavingChatWithUser(userId);
  const usersWithChatIds = usersWithChat.map((user) => user.id);

  // Add the user's own ID to the exclusion list
  const excludeIds = [...usersWithChatIds, userId];

  // Convert string IDs to ObjectIds
  const objectIds = excludeIds.map((id) => new Types.ObjectId(id));

  // Find all users except those in the exclusion list
  return UserModel.find({ _id: { $nin: objectIds } }).exec();
};

export const findUsersWhereUsernameContains = (search: string): Promise<IUser[]> => {
  return UserModel.find({ username: { $regex: search, $options: 'i' } }).exec();
};

export const findUsersWhereUsernameContainsExcludingUserId = (
  search: string,
  excludedUserId: string,
): Promise<IUser[]> => {
  return UserModel.find({ username: { $regex: search, $options: 'i' } })
    .where('_id')
    .ne(excludedUserId)
    .exec();
};

export default {
  getAllUsers,
  createOrFindFirstUser,
  getUsersWithoutChatWithUser: getAllUsersNotInChatWithProvidedUser,
  getAllUsersNotInChatWithProvidedUser,
  findById,
  findByIdOrFail,
  findAllById,
  findAllExcludingId,
  findUsersHavingChatWithUser,
  findUsersNotHavingChatWithUser,
  findUsersWhereUsernameContains,
  findUsersWhereUsernameContainsExcludingUserId,
  existsById,
  existsByUsername,
};
