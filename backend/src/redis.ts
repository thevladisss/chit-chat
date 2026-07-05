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

const CONNECTION_TTL = 90; // refreshed on every heartbeat pong; crash safety net otherwise

export interface RedisConnection {
  connectionId: string;
  userId: string;
  sessionId: string;
  createdTimestamp: number;
}

export const redisStoreConnection = async (
  connectionId: string,
  data: Omit<RedisConnection, 'connectionId'>,
): Promise<void> => {
  await redisClient.hSet(`conn:${connectionId}`, {
    userId: data.userId,
    sessionId: data.sessionId,
    createdTimestamp: String(data.createdTimestamp),
  });
  await redisClient.expire(`conn:${connectionId}`, CONNECTION_TTL);
  await redisClient.sAdd('conns', connectionId);
  await redisClient.sAdd(`user:conns:${data.userId}`, connectionId);
};

export const redisGetConnection = async (
  connectionId: string,
): Promise<RedisConnection | null> => {
  const data = await redisClient.hGetAll(`conn:${connectionId}`);
  if (!data.userId) return null;
  return {
    connectionId,
    userId: data.userId,
    sessionId: data.sessionId,
    createdTimestamp: Number(data.createdTimestamp),
  };
};

export const redisRefreshConnectionTTL = async (
  connectionId: string,
): Promise<void> => {
  await redisClient.expire(`conn:${connectionId}`, CONNECTION_TTL);
};

export const redisDeleteConnection = async (
  connectionId: string,
): Promise<void> => {
  const data = await redisClient.hGetAll(`conn:${connectionId}`);
  if (data.userId) {
    await redisClient.sRem(`user:conns:${data.userId}`, connectionId);
  }
  await redisClient.sRem('conns', connectionId);
  await redisClient.del(`conn:${connectionId}`);
};

export const redisGetAllConnections = async (): Promise<RedisConnection[]> => {
  const ids = await redisClient.sMembers('conns');
  const results = await Promise.all(ids.map(redisGetConnection));
  return results.filter(Boolean) as RedisConnection[];
};

export const redisGetConnectionsByUserId = async (
  userId: string,
): Promise<RedisConnection[]> => {
  const ids = await redisClient.sMembers(`user:conns:${userId}`);
  const results = await Promise.all(ids.map(redisGetConnection));
  return results.filter(Boolean) as RedisConnection[];
};

export const redisGetConnectionsByUserIds = async (
  userIds: string[],
): Promise<RedisConnection[]> => {
  const perUser = await Promise.all(userIds.map(redisGetConnectionsByUserId));
  const flat = perUser.flat();
  const seen = new Set<string>();
  return flat.filter((c) => {
    if (seen.has(c.connectionId)) return false;
    seen.add(c.connectionId);
    return true;
  });
};

export default { redisClient, connectRedis };
