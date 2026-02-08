import { Request, Response, NextFunction } from 'express';
import authMiddleware from '../../../src/middleware/auth.middleware';
import UserRepository from '../../../src/repositories/user.repository';
import type { TransformedUser } from '../../../src/models/user.model';

const mockUser: TransformedUser = {
  id: 'user-1',
  userId: 'user-1',
  username: 'alice',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

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

  it('should fetch user from DB and populate session.user when not cached', async () => {
    const userDocument = { toJSON: jest.fn(() => mockUser) };
    jest
      .spyOn(UserRepository, 'findByIdOrFail')
      .mockResolvedValue(userDocument as any);

    const req = { ...defaultReq, session: { userId: 'user-1' } } as unknown as Request;
    const res = { ...defaultRes, status: jest.fn().mockReturnThis(), end: jest.fn() } as unknown as Response;

    await authMiddleware(req, res, next);

    expect(UserRepository.findByIdOrFail).toHaveBeenCalledWith('user-1');
    expect(req.session.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it('should skip DB query when session.user is already cached', async () => {
    jest.spyOn(UserRepository, 'findByIdOrFail');

    const req = { ...defaultReq, session: { userId: 'user-1', user: mockUser } } as unknown as Request;
    const res = { ...defaultRes, status: jest.fn().mockReturnThis(), end: jest.fn() } as unknown as Response;

    await authMiddleware(req, res, next);

    expect(UserRepository.findByIdOrFail).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 when user is not found in DB', async () => {
    jest
      .spyOn(UserRepository, 'findByIdOrFail')
      .mockRejectedValue(new Error('Document not found'));

    const req = { ...defaultReq, session: { userId: 'non-existent' } } as unknown as Request;
    const res = { ...defaultRes, status: jest.fn().mockReturnThis(), end: jest.fn() } as unknown as Response;

    await authMiddleware(req, res, next);

    expect(UserRepository.findByIdOrFail).toHaveBeenCalledWith('non-existent');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.end).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
