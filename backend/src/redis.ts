import { createClient, type RedisClientType } from 'redis';

const redisUrl = process.env.REDIS_URL;

export const redisClient: RedisClientType = createClient({ url: redisUrl });

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
    process.exit(1);
  }
};

/**
 * No-op in production. Overridden in tests to clear the in-memory mock store.
 */
export const __resetStore = (): void => {};

export default { redisClient, connectRedis };
