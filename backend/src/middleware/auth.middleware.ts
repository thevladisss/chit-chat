import { Request, Response, NextFunction } from 'express';
import UserRepository from '../repositories/user.repository';

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.session?.userId) {
    res.status(401).end();
    return;
  }

  const exists = await UserRepository.existsById(req.session.userId);

  if (!exists) {
    res.status(401).end();
    return;
  }

  next();
};

export default authMiddleware;
