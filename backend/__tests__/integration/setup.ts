import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../../src/app';

let mongoServer: MongoMemoryServer;

/**
 * Start in-memory MongoDB and connect mongoose before all tests.
 */
export const setupTestDB = (): void => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });
};

/**
 * Create an authenticated supertest agent by signing up a user.
 * The returned agent preserves the session cookie for subsequent requests.
 */
export const createAuthenticatedAgent = async (
  username = 'testuser',
): Promise<{ agent: ReturnType<typeof supertest.agent>; userId: string }> => {
  const agent = supertest.agent(app);

  const res = await agent
    .post('/api/users')
    .send({ username })
    .expect(200);

  return { agent, userId: res.body.data.id };
};
