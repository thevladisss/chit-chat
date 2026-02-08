import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { setupTestDB } from './setup';
import { ChatModel } from '../../src/models/chat.model';
import { UserModel } from '../../src/models/user.model';

describe('POST /api/users', () => {
  setupTestDB();

  it('should return 200 with user data for a new sign-up', async () => {
    const res = await supertest(app)
      .post('/api/users')
      .send({ username: 'alice' });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      username: 'alice',
    });
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('userId');
    expect(res.body.data).toHaveProperty('createdAt');
    expect(res.body.data).toHaveProperty('updatedAt');
  });

  it('should return the same user when signing up with an existing username', async () => {
    const first = await supertest(app)
      .post('/api/users')
      .send({ username: 'bob' });

    const second = await supertest(app)
      .post('/api/users')
      .send({ username: 'bob' });

    expect(second.status).toBe(200);
    expect(second.body.data.id).toBe(first.body.data.id);
    expect(second.body.data.username).toBe('bob');
  });

  it('should set a session cookie so subsequent requests are authenticated', async () => {
    const agent = supertest.agent(app);

    const res = await agent.post('/api/users').send({ username: 'carol' });

    expect(res.status).toBe(200);

    // The session cookie should allow access to a protected route
    const chatsRes = await agent.get('/api/chats');
    expect(chatsRes.status).toBe(200);
  });

  it('should return 401 on protected routes without a session', async () => {
    const res = await supertest(app).get('/api/chats');

    expect(res.status).toBe(401);
  });

  it('should create chats with all existing users when a new user joins', async () => {
    // Sign up two users first
    await supertest(app).post('/api/users').send({ username: 'dave' });

    await supertest(app).post('/api/users').send({ username: 'eve' });

    // A third user joins — should create chats with dave and eve
    await supertest(app).post('/api/users').send({ username: 'frank' });

    const frank = await UserModel.findOne({ username: 'frank' });
    const chats = await ChatModel.find({ users: frank!._id });

    expect(chats).toHaveLength(2);
  });

  it('should not create duplicate chats when an existing user signs in again', async () => {
    await supertest(app).post('/api/users').send({ username: 'grace' });

    await supertest(app).post('/api/users').send({ username: 'heidi' });

    // grace signs in again
    await supertest(app).post('/api/users').send({ username: 'grace' });

    const grace = await UserModel.findOne({ username: 'grace' });
    const chats = await ChatModel.find({ users: grace!._id });

    // Should still only have one chat (grace <-> heidi), not duplicated
    expect(chats).toHaveLength(1);
  });

  it('should persist the user in the database', async () => {
    await supertest(app).post('/api/users').send({ username: 'ivan' });

    const user = await UserModel.findOne({ username: 'ivan' });

    expect(user).not.toBeNull();
    expect(user!.username).toBe('ivan');
  });

  it('should return a valid MongoDB ObjectId as the user id', async () => {
    const res = await supertest(app)
      .post('/api/users')
      .send({ username: 'judy' });

    expect(mongoose.Types.ObjectId.isValid(res.body.data.id)).toBe(true);
  });
});
