import { AppError } from '../../../src/errors/AppError';
import { NotFoundError } from '../../../src/errors/NotFoundError';

describe('NotFoundError', () => {
  it('should default to a "Not found" message', () => {
    const error = new NotFoundError();

    expect(error.message).toBe('Not found');
  });

  it('should accept a custom message', () => {
    const error = new NotFoundError('Chat not found');

    expect(error.message).toBe('Chat not found');
  });

  it('should always have a 404 status code', () => {
    const error = new NotFoundError('Chat not found');

    expect(error.statusCode).toBe(404);
  });

  it('should be an instance of AppError and Error', () => {
    const error = new NotFoundError();

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should set name to NotFoundError', () => {
    const error = new NotFoundError();

    expect(error.name).toBe('NotFoundError');
  });
});
