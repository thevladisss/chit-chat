import supertest from 'supertest';
import app from '../../src/app';
import { setupTestDB, createAuthenticatedAgent } from './setup';

describe('/api/chats', () => {
  setupTestDB();

  describe('GET /api/chats', () => {
    it('should return 401 without a session', async () => {
      const res = await supertest(app).get('/api/chats');

      expect(res.status).toBe(401);
    });

    it('should return an empty list when no other users exist', async () => {
      const { agent } = await createAuthenticatedAgent('alice');

      const res = await agent.get('/api/chats');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('should return chats created when a second user joins', async () => {
      await createAuthenticatedAgent('alice');
      const { agent } = await createAuthenticatedAgent('bob');

      const res = await agent.get('/api/chats');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toHaveProperty('chatId');
      expect(res.body.data[0].name).toBe('alice');
    });

    it('should return chats for all users the authenticated user has a chat with', async () => {
      await createAuthenticatedAgent('alice');
      await createAuthenticatedAgent('bob');
      const { agent } = await createAuthenticatedAgent('carol');

      const res = await agent.get('/api/chats');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);

      const chatNames = res.body.data.map((c: any) => c.name).sort();
      expect(chatNames).toEqual(['alice', 'bob']);
    });
  });

  describe('GET /api/chats/:chatId', () => {
    it('should return 401 without a session', async () => {
      const res = await supertest(app).get('/api/chats/507f1f77bcf86cd799439011');

      expect(res.status).toBe(401);
    });

    it('should return a single chat by id', async () => {
      await createAuthenticatedAgent('alice');
      const { agent } = await createAuthenticatedAgent('bob');

      // Get the chat list to find the chatId
      const listRes = await agent.get('/api/chats');
      const chatId = listRes.body.data[0].chatId;

      const res = await agent.get(`/api/chats/${chatId}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('chatId', chatId);
      expect(res.body.data).toHaveProperty('name', 'alice');
      expect(res.body.data).toHaveProperty('messages');
    });
  });

  describe('GET /api/chats/search', () => {
    it('should return 401 without a session', async () => {
      const res = await supertest(app).get('/api/chats/search');

      expect(res.status).toBe(401);
    });

    it('should return all chats when no search query is provided', async () => {
      await createAuthenticatedAgent('alice');
      await createAuthenticatedAgent('bob');
      const { agent } = await createAuthenticatedAgent('carol');

      const res = await agent.get('/api/chats/search');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('should filter chats by participant username', async () => {
      await createAuthenticatedAgent('alice');
      await createAuthenticatedAgent('bob');
      const { agent } = await createAuthenticatedAgent('carol');

      const res = await agent.get('/api/chats/search').query({ search: 'alice' });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const names = res.body.data.map((c: any) => c.name);
      expect(names).toContain('alice');
    });

    it('should return empty list when search matches no one', async () => {
      await createAuthenticatedAgent('alice');
      const { agent } = await createAuthenticatedAgent('bob');

      const res = await agent.get('/api/chats/search').query({ search: 'zzzzz' });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('POST /api/chats/:chatId/messages', () => {
    it('should return 401 without a session', async () => {
      const res = await supertest(app)
        .post('/api/chats/507f1f77bcf86cd799439011/messages')
        .send({ type: 'text', message: 'hello' });

      expect(res.status).toBe(401);
    });

    it('should send a text message and return chat data', async () => {
      await createAuthenticatedAgent('alice');
      const { agent } = await createAuthenticatedAgent('bob');

      // Get the chat to find chatId
      const listRes = await agent.get('/api/chats');
      const chatId = listRes.body.data[0].chatId;

      const res = await agent
        .post(`/api/chats/${chatId}/messages`)
        .send({ type: 'text', message: 'hello alice' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('chatId', chatId);
      expect(res.body.data).toHaveProperty('chat');
      expect(res.body.data).toHaveProperty('chats');
    });

    it('should persist the message so it appears in the chat', async () => {
      await createAuthenticatedAgent('alice');
      const { agent } = await createAuthenticatedAgent('bob');

      const listRes = await agent.get('/api/chats');
      const chatId = listRes.body.data[0].chatId;

      await agent
        .post(`/api/chats/${chatId}/messages`)
        .send({ type: 'text', message: 'hi there' });

      // Fetch the chat again and verify the message is present
      const chatRes = await agent.get(`/api/chats/${chatId}`);

      expect(chatRes.body.data.messages).toHaveLength(1);
      expect(chatRes.body.data.messages[0].text).toBe('hi there');
    });

    it('should mark sent messages as personal for the sender', async () => {
      await createAuthenticatedAgent('alice');
      const { agent } = await createAuthenticatedAgent('bob');

      const listRes = await agent.get('/api/chats');
      const chatId = listRes.body.data[0].chatId;

      await agent
        .post(`/api/chats/${chatId}/messages`)
        .send({ type: 'text', message: 'my message' });

      const chatRes = await agent.get(`/api/chats/${chatId}`);

      expect(chatRes.body.data.messages[0].isPersonal).toBe(true);
    });

    it('should return 200 with empty body for audio type (not yet implemented)', async () => {
      await createAuthenticatedAgent('alice');
      const { agent } = await createAuthenticatedAgent('bob');

      const listRes = await agent.get('/api/chats');
      const chatId = listRes.body.data[0].chatId;

      const res = await agent
        .post(`/api/chats/${chatId}/messages`)
        .send({ type: 'audio' });

      expect(res.status).toBe(200);
    });
  });
});
