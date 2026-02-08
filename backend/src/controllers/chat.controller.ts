import { Request, Response } from 'express';
import ChatService from '../service/chat.service';
import ChatMessageTypeEnum from '../enums/ChatMessageType';

/**
 * Returns all chats where signed in user is a participant
 */
export const getAllChats = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const userId = req.session.userId!;

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
  const userId = req.session.userId!;

  const result = await ChatService.getChat(userId, chatId);

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
  const userId = req.session.userId!;

  const search = req.query.search as string | undefined;

  let chats;

  if (!search) {
    chats = await ChatService.getUserChats(userId);
  } else {
    chats = await ChatService.getFilteredChats(userId, search);
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
  const userId = req.session.userId!;

  if (body.type === ChatMessageTypeEnum.TEXT) {
    const data = await ChatService.sendChatMessage(userId, {
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
