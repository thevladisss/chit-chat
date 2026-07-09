import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../../src/middleware/error.middleware';
import { AppError } from '../../../src/errors/AppError';
import { NotFoundError } from '../../../src/errors/NotFoundError';

const defaultReq = {} as Request;

const buildRes = (): Response =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }) as unknown as Response;

describe('error.middleware', () => {
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should respond with the status code and message of an AppError', () => {
    const res = buildRes();
    const error = new NotFoundError('Chat not found');

    errorHandler(error, defaultReq, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Chat not found' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should respect a custom AppError subclass status code', () => {
    const res = buildRes();
    class TeapotError extends AppError {
      constructor() {
        super('I am a teapot', 418);
      }
    }

    errorHandler(new TeapotError(), defaultReq, res, next);

    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith({ error: 'I am a teapot' });
  });

  it('should respond with a generic 500 and log unexpected errors without leaking details', () => {
    const res = buildRes();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('some internal secret detail');

    errorHandler(error, defaultReq, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    expect(res.json).not.toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('secret') }),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
  });

  it('should respond with a generic 500 for a non-Error thrown value', () => {
    const res = buildRes();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler('not an Error instance', defaultReq, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
