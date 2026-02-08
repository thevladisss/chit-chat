import { Request, Response, NextFunction } from 'express';
import authMiddleware from '../../../src/middleware/auth.middleware';
import UserRepository from '../../../src/repositories/user.repository';

const defaultReq = {
  session: {},
} as unknown as Request;

const defaultRes = {
  status: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis(),
} as unknown as Response;

describe('auth.middleware', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 401 when session is missing', async () => {
    const req = { ...defaultReq, session: undefined } as unknown as Request;
    const res = { ...defaultRes, status: jest.fn().mockReturnThis(), end: jest.fn() } as unknown as Response;

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.end).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when session.userId is missing', async () => {
    const req = { ...defaultReq, session: {} } as unknown as Request;
    const res = { ...defaultRes, status: jest.fn().mockReturnThis(), end: jest.fn() } as unknown as Response;

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.end).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when userId exists and user is found in DB', async () => {
    jest.spyOn(UserRepository, 'existsById').mockResolvedValue(true);

    const req = { ...defaultReq, session: { userId: 'user-1' } } as unknown as Request;
    const res = { ...defaultRes, status: jest.fn().mockReturnThis(), end: jest.fn() } as unknown as Response;

    await authMiddleware(req, res, next);

    expect(UserRepository.existsById).toHaveBeenCalledWith('user-1');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 when user does not exist in DB', async () => {
    jest.spyOn(UserRepository, 'existsById').mockResolvedValue(false);

    const req = { ...defaultReq, session: { userId: 'non-existent' } } as unknown as Request;
    const res = { ...defaultRes, status: jest.fn().mockReturnThis(), end: jest.fn() } as unknown as Response;

    await authMiddleware(req, res, next);

    expect(UserRepository.existsById).toHaveBeenCalledWith('non-existent');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.end).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
