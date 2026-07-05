/**
 * In-memory mock for src/redis.ts used by all tests.
 * Provides a fake Redis client that implements the subset of commands
 * used by connect-redis (sessions) and connection.service (connection metadata).
 */

const store = new Map<string, string>();

function scanIterator(opts: { MATCH: string; COUNT: number }) {
  const pattern = opts.MATCH.replace('*', '');
  return (async function* () {
    const batch: string[] = [];
    for (const key of store.keys()) {
      if (key.startsWith(pattern) || opts.MATCH === '*') {
        batch.push(key);
      }
    }
    if (batch.length > 0) yield batch;
  })();
}

export const redisClient = {
  // String commands (used by connect-redis)
  get: jest.fn(async (key: string) => store.get(key) ?? null),
  set: jest.fn(async (key: string, val: string, _opts?: any) => {
    store.set(key, val);
  }),
  del: jest.fn(async (keys: string | string[]) => {
    const arr = Array.isArray(keys) ? keys : [keys];
    for (const k of arr) store.delete(k);
  }),
  expire: jest.fn(async () => true),
  mGet: jest.fn(async (keys: string[]) => keys.map((k) => store.get(k) ?? null)),
  scanIterator: jest.fn(scanIterator),

  // Hash commands (used by connection.service)
  hSet: jest.fn(async (key: string, fields: Record<string, string>) => {
    store.set(key, JSON.stringify(fields));
  }),
  hGetAll: jest.fn(async (key: string) => {
    const raw = store.get(key);
    return raw ? JSON.parse(raw) : {};
  }),

  // Set commands (used by connection.service)
  sAdd: jest.fn(async (key: string, member: string) => {
    const existing = store.get(key);
    const set: string[] = existing ? JSON.parse(existing) : [];
    if (!set.includes(member)) set.push(member);
    store.set(key, JSON.stringify(set));
  }),
  sRem: jest.fn(async (key: string, member: string) => {
    const existing = store.get(key);
    if (!existing) return;
    const set: string[] = JSON.parse(existing);
    store.set(key, JSON.stringify(set.filter((m) => m !== member)));
  }),
  sMembers: jest.fn(async (key: string) => {
    const existing = store.get(key);
    return existing ? JSON.parse(existing) : [];
  }),

  // Connection lifecycle (no-ops in tests)
  connect: jest.fn(async () => {}),
  disconnect: jest.fn(async () => {}),
  on: jest.fn(),
};

export const connectRedis = jest.fn(async () => {});

export const redisRefreshConnectionTTL = jest.fn(async () => {});

/**
 * Helper to reset the in-memory store between tests.
 */
export const __resetStore = (): void => {
  store.clear();
};

export default { redisClient, connectRedis };
