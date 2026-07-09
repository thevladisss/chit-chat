import ChatRepository from '../repositories/chat.repository';
import UserRepository from '../repositories/user.repository';
import TextMessageRepository from '../repositories/textMessage.repository';
import ConnectionService from './connection.service';
import ServerChatEventEnum from '../enums/ServerChatEventEnum';
import ChatMapper from '../mappers/chat.mapper';
import { IChat } from '../models/chat.model';
import { WebSocket } from 'ws';
import type { IUser } from '../models/user.model';
import { Types } from 'mongoose';
import { NotFoundError } from '../errors/NotFoundError';

interface SendChatMessageData {
  chatId: string;
  message: string;
}

const isChatParticipant = (userId: string, chat: IChat): boolean => {
  const users = chat.users as (Types.ObjectId | IUser)[];
  return users.some((user) =>
    user instanceof Types.ObjectId ? user.toString() === userId : user.id === userId,
  );
};

const notifyUsersOnNewChatMessage = async (
  chat: IChat,
  sender: IUser,
): Promise<void> => {
  const chatParticipantsIds: string[] = chat.users.map(
    (item: IUser | Types.ObjectId) => {
      // Handle both ObjectId and populated user objects
      if (item instanceof Types.ObjectId) {
        return item.toString();
      }

      return item.id.toString();
    },
  );

  const connections =
    await ConnectionService.getAllConnectionsByUserIds(chatParticipantsIds);

  const senderUserId = sender._id.toString();

  for (const con of connections) {
    if (con.ws && con.ws.readyState === WebSocket.OPEN) {
      const conChats = await getUserChats(con.userId);

      con.ws.send(
        JSON.stringify({
          event: ServerChatEventEnum.MESSAGE,
          data: {
            sender: senderUserId,
            isSenderSelf: senderUserId === con.userId,
            chats: conChats,
            chat: ChatMapper.mapChatToResponse(con.userId, chat),
          },
        }),
      );
    }
  }
};

const notifyUsersOnNewChat = async (
  authenticatedUserId: string,
): Promise<void> => {
  const connections =
    await ConnectionService.getAllConnectionsNoCurrent(authenticatedUserId);

  for (const con of connections) {
    if (con.ws && con.ws.readyState === WebSocket.OPEN) {
      const chats = await getUserChats(con.userId);

      con.ws.send(
        JSON.stringify({
          event: ServerChatEventEnum.NEW_USER,
          data: chats,
        }),
      );
    }
  }
};

export const createNewChatForAllUsers = async (
  userId: string,
): Promise<IChat[]> => {
  const chats = await ChatRepository.createChatForUsers(userId);
  notifyUsersOnNewChat(userId);
  return chats;
};

export const getUserChats = async (userId: string): Promise<any[]> => {
  const chats = await ChatRepository.findAllChatsByUsersIds([userId]);

  const connections = await ConnectionService.getAllConnectionsOnline();

  const results = [];

  for (const item of chats) {
    results.push(ChatMapper.mapChatToListResponse(userId, item, connections));
  }

  return results;
};

interface CreateChatData {
  usersIds: string[];
}

export const createChat = async (data: CreateChatData): Promise<IChat> => {
  const chat = await ChatRepository.createChat({
    usersIds: data.usersIds,
  });
  return chat;
};

export const getChat = async (
  userId: string,
  chatId: string,
): Promise<any | null> => {
  const chat = await ChatRepository.findById(chatId);

  // Returns null (not a thrown NotFoundError) for both "doesn't exist" and "not
  // a participant" so the two are indistinguishable to the caller. Intentionally
  // NOT migrated to throw NotFoundError like sendChatMessage below: the frontend's
  // selectChatAction thunk has no .rejected handling yet, so switching this to a
  // real 404 would leave a stale selectedChat in the UI with no error surfaced.
  if (!chat || !isChatParticipant(userId, chat)) {
    return null;
  }

  return ChatMapper.mapChatToResponse(userId, chat);
};

export const sendChatMessage = async (
  userId: string,
  data: SendChatMessageData,
): Promise<any> => {
  const chat = await ChatRepository.findById(data.chatId);

  if (!chat || !isChatParticipant(userId, chat)) {
    throw new NotFoundError('Chat not found');
  }

  await TextMessageRepository.createTextMessage({
    chatId: data.chatId,
    text: data.message,
    userId,
  });

  const updatedChat = await ChatRepository.findByIdOrFail(data.chatId);

  const chats = await getUserChats(userId);

  const result = {
    chatId: updatedChat.chatId,
    chat: ChatMapper.mapChatToResponse(userId, updatedChat),
    chats,
  };

  const senderUser = await UserRepository.findByIdOrFail(userId);

  await notifyUsersOnNewChatMessage(updatedChat, senderUser);

  return result;
};

export const getFilteredChats = async (
  userId: string,
  search: string,
): Promise<any[]> => {
  const chats = await ChatRepository.findByUserNameOrChatNameOrMessage(search);

  const connections = await ConnectionService.getAllConnectionsOnline();

  const results = [];

  for (const item of chats) {
    results.push(ChatMapper.mapChatToListResponse(userId, item, connections));
  }

  return results;
};

export const getUsersByChatId = async (chatId: string): Promise<any[]> => {
  const chat = await ChatRepository.findById(chatId);

  if (!chat || !chat.users || chat.users.length === 0) {
    return [];
  }

  // Extract user IDs (handles both ObjectId and populated user objects)
  const userIds = chat.users.map((user: any) => {
    return user._id ? user._id.toString() : user.toString();
  });
  // Fetch the actual user documents
  return UserRepository.findAllById(userIds);
};

export default {
  notifyUsersOnNewChatMessage,
  getUsersByChatId,
  getFilteredChats,
  createChat,
  sendChatMessage,
  getUserChats,
  getChat,
  createNewChatForAllUsers,
};
