import type { IChat, TransformedChat } from '../models/chat.model';
import type { IUser } from '../models/user.model';
import { mapMessagesToResponse } from './message.mapper';
import type { ChatResponse, ChatListItemResponse } from '../types/responses';
import { Types } from 'mongoose';
import type { ITextMessage } from '../models/textMessage.model';
import type { IAudioMessage } from '../models/audioMessage.model';

export const mapChatToResponse = (
  userId: string,
  chat: IChat,
): ChatResponse => {
  const users = chat.users as (Types.ObjectId | IUser)[];
  const chatName = users
    .filter(
      (user): user is IUser =>
        !(user instanceof Types.ObjectId) && user.id !== userId,
    )
    .map((user) => user.username)
    .join(', ');

  const lastMessage = chat.lastMessage as
    | { text?: string; createdTimestamp?: number }
    | undefined;
  const messages = (chat.messages || []) as (ITextMessage | IAudioMessage)[];

  return {
    ...(chat.toJSON() as TransformedChat),
    lastMessage: lastMessage?.text ?? null,
    lastMessageTimestamp: lastMessage?.createdTimestamp ?? null,
    name: chatName,
    messages: mapMessagesToResponse(userId, messages),
  };
};

export const mapChatToListResponse = (
  userId: string,
  chat: IChat,
  connections: { userId: string }[],
): ChatListItemResponse => {
  const users = chat.users as (Types.ObjectId | IUser)[];
  const otherUser = users.find(
    (user): user is IUser =>
      !(user instanceof Types.ObjectId) && user.id !== userId,
  );
  const otherUserId = otherUser
    ? (otherUser as IUser & { _id?: Types.ObjectId })._id
    : null;

  const online = connections.some(
    (connection) => connection.userId.toString() === otherUserId?.toString(),
  );

  const user = users.find(
    (user): user is IUser =>
      !(user instanceof Types.ObjectId) &&
      (user as IUser & { _id?: Types.ObjectId })._id?.toString() !== userId,
  );

  const messages = (chat.messages || []) as (ITextMessage | IAudioMessage)[];

  return {
    ...(chat.toJSON() as TransformedChat),
    online,
    messages: mapMessagesToResponse(userId, messages),
    name: user && user.username ? user.username : '',
  };
};

export default {
  mapChatToResponse,
  mapChatToListResponse,
};
