import { z } from 'zod';
import ClientChatEventEnum from '../../enums/ClientChatEventEnum';

const typingInChatSchema = z.object({
  event: z.literal(ClientChatEventEnum.TYPING_IN_CHAT),
  payload: z.object({
    chatId: z.string().min(1),
  }),
});

export const WsMessageSchema = z.discriminatedUnion('event', [
  typingInChatSchema,
]);

export type WsMessage = z.infer<typeof WsMessageSchema>;

export default WsMessageSchema;
