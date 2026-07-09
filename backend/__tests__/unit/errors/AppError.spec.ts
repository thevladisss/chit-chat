import { AppError } from '../../../src/errors/AppError';

describe('AppError', () => {
  it('should set the message and statusCode', () => {
    const error = new AppError('Something went wrong', 400);

    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(400);
  });

  it('should be an instance of Error', () => {
    const error = new AppError('Something went wrong', 400);

    expect(error).toBeInstanceOf(Error);
  });

  it('should set name to the constructor name of a subclass', () => {
    class TeapotError extends AppError {
      constructor() {
        super('I am a teapot', 418);
      }
    }

    const error = new TeapotError();

    expect(error.name).toBe('TeapotError');
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(TeapotError);
  });

  it('should set name to AppError when instantiated directly', () => {
    const error = new AppError('Something went wrong', 400);

    expect(error.name).toBe('AppError');
  });

  it('should produce a useful stack trace', () => {
    const error = new AppError('Something went wrong', 400);

    expect(error.stack).toContain('AppError');
  });
});
