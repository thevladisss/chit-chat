import WsMessageSchema from '../../../../src/validation/schemas/ws-message.schema';

describe('WsMessageSchema', () => {
  it('should accept a valid typing_in_chat frame', () => {
    const result = WsMessageSchema.safeParse({
      event: 'typing_in_chat',
      payload: { chatId: 'chat-1' },
    });

    expect(result.success).toBe(true);
  });

  it('should reject a typing_in_chat frame missing chatId', () => {
    const result = WsMessageSchema.safeParse({
      event: 'typing_in_chat',
      payload: {},
    });

    expect(result.success).toBe(false);
  });

  it('should reject a typing_in_chat frame with a non-string chatId', () => {
    const result = WsMessageSchema.safeParse({
      event: 'typing_in_chat',
      payload: { chatId: 123 },
    });

    expect(result.success).toBe(false);
  });

  it('should reject a frame with no event', () => {
    const result = WsMessageSchema.safeParse({
      payload: { chatId: 'chat-1' },
    });

    expect(result.success).toBe(false);
  });

  it('should reject an unrecognized event, including send_message', () => {
    const result = WsMessageSchema.safeParse({
      event: 'send_message',
      payload: { message: 'hello' },
    });

    expect(result.success).toBe(false);
  });

  it('should reject a non-object frame', () => {
    const result = WsMessageSchema.safeParse('not an object');

    expect(result.success).toBe(false);
  });
});
