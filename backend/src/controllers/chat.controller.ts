import { Request, Response } from 'express';
import ChatService from '../service/chat.service';
import ChatMessageTypeEnum from '../enums/ChatMessageType';
import UserRepository from '../repositories/user.repository';

/**
 * Returns all chats where signed in user is a participant
 */
export const getAllChats = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const userId = req.session?.userId ?? '';

  console.log('Log userId', userId);

  const user = UserRepository.findByIdOrFail(userId);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data = await ChatService.getUserChats(userId);

  return res
    .json({
      data,
    })
    .status(200);
};

/**
 * Returns one single chat by its ID
 */
export const getChat = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { chatId } = req.params;
  const userId = req.session?.userId ?? '';

  const user = await UserRepository.findByIdOrFail(userId);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await ChatService.getChat(user.id, chatId);

  return res.json({
    data: result,
  });
};

/**
 * Returns chats filtered by name, message or name of its participants
 */
export const getFilteredChats = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const userId = req.session?.userId ?? '';

  const user = await UserRepository.findByIdOrFail(userId);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const search = req.query.search as string | undefined;

  let chats;

  if (!search) {
    chats = await ChatService.getUserChats(user.id);
  } else {
    chats = await ChatService.getFilteredChats(user.id, search);
  }

  return res.json({
    data: chats,
  });
};

/**
 * Send text or voice message to the chat
 */
export const sendMessage = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { chatId } = req.params;
  const body = req.body;
  const userId = req.session?.userId ?? '';

  const user = await UserRepository.findByIdOrFail(userId);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (body.type === ChatMessageTypeEnum.TEXT) {
    const data = await ChatService.sendChatMessage(user, {
      chatId: chatId,
      message: body.message,
    });

    return res.json({ data });
  }
  if (body.type === ChatMessageTypeEnum.AUDIO) {
    //TODO: Implement voice message sending
    return res.status(200).end();
  }

  return res.status(200).end();
};

export default {
  sendMessage,
  getFilteredChats,
  getChat,
  getAllChats,
};
