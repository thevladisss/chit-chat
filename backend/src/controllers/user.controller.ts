import { Request, Response } from 'express';
import UserService from '../service/user.service';
import ChatService from '../service/chat.service';

export const createUser = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { username } = req.body;

  const exists = await UserService.checkUserExists(username);
  const user = await UserService.signUpUser(username);

  if (user) {
    req.session.userId = user.id;
  }

  if (!exists) {
    await ChatService.createNewChatForAllUsers(user.userId);
  }

  return res.json({ data: user }).status(200);
};

export default {
  createUser,
};
