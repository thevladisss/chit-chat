import { RedisStore } from 'connect-redis';
import { redisClient } from './redis';

export const sessionStore = new RedisStore({ client: redisClient });
