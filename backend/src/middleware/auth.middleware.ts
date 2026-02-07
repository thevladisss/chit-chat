import { Request, Response, NextFunction } from 'express';

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.log('Log req.session', req.session);
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).end();
  }
};

export default authMiddleware;
