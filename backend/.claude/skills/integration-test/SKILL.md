---
name: integration-test
description: Use when writing or updating a backend integration test — an end-to-end test of a REST route through the real Express app, real Mongoose models, and an in-memory MongoDB. Lives in backend/__tests__/integration/, uses supertest with setupTestDB() and createAuthenticatedAgent(), and runs under jest.integration.config.ts. Not for unit tests (use the unit-test skill).
---

Write an integration test for the route or feature provided as the argument.

## Core principle

The opposite of a unit test: **mock nothing you can run for real.** The request goes through the
real router, real validators, real controller, service, repository, and Mongoose models, against
a real (in-memory) MongoDB. Assert on the HTTP contract — status code and `res.body` — not on
which internal functions were called.

If you find yourself reaching for `jest.spyOn`, you probably want a unit test instead.

## What is and isn't real

| Dependency | In integration tests |
|-----------|---------------------|
| MongoDB | **Real** — `mongodb-memory-server`, started by `setupTestDB()` |
| Express app + middleware | **Real** — imported from `src/app` |
| Sessions | **Real** — cookie-backed, preserved by `supertest.agent` |
| Redis | **Mocked** — `jest.config.ts` maps `.*/redis$` to `__tests__/__mocks__/redis.ts` |
| WebSockets | Not exercised — `app.ts` has no WS server; that lives in `server.ts` |

The Redis mapping is inherited by `jest.integration.config.ts` (it spreads `jest.config`), so
session storage and connection metadata run against the in-memory fake. Don't try to undo this.

## File location

`backend/__tests__/integration/{resource}.api.spec.ts` — one file per API resource, named after
the route prefix (`/api/chats` → `chat.api.spec.ts`).

## Skeleton

```ts
import supertest from 'supertest';
import app from '../../src/app';
import { setupTestDB, createAuthenticatedAgent } from './setup';

describe('/api/chats', () => {
  setupTestDB();

  describe('GET /api/chats/:chatId', () => {
    it('should return 401 without a session', async () => {
      const res = await supertest(app).get('/api/chats/507f1f77bcf86cd799439011');

      expect(res.status).toBe(401);
    });

    it('should return a single chat by id', async () => {
      await createAuthenticatedAgent('alice');
      const { agent } = await createAuthenticatedAgent('bob');

      const res = await agent.get('/api/chats');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('chatId');
    });
  });
});
```

## The two helpers (`__tests__/integration/setup.ts`)

- **`setupTestDB()`** — call once at the top of the outermost `describe`, not inside a hook. It
  registers `beforeAll` (start server, connect mongoose), `afterAll` (disconnect, stop), and
  `afterEach` (wipe every collection). Because it clears collections between tests, **each test
  must create its own data** — never rely on state from a previous `it`.
- **`createAuthenticatedAgent(username)`** — signs up a user via `POST /api/users` and returns
  `{ agent, userId }`. The agent keeps the session cookie, so subsequent calls on it are
  authenticated. Use a plain `supertest(app)` (no agent) when you want the unauthenticated case.

Note the app's behavior: signing up a user auto-creates a chat with every existing user. So
`createAuthenticatedAgent('alice')` then `createAuthenticatedAgent('bob')` yields exactly one
alice–bob chat — order of creation determines how many chats each user sees.

## What to assert

- **Status code** — `expect(res.status).toBe(200)`.
- **Response shape** — every success body is wrapped in `data`: `res.body.data`.
- **Auth** — every protected route gets a "401 without a session" test using bare
  `supertest(app)`.
- **Validation** — failures return **422** with `{ error: 'Validation failed', details: [...] }`:

  ```ts
  expect(res.status).toBe(422);
  expect(res.body.error).toBe('Validation failed');
  expect(res.body.details).toEqual(
    expect.arrayContaining([expect.objectContaining({ field: 'username' })]),
  );
  ```
- **Persistence** — where it matters, re-query through the API (a follow-up GET) rather than
  reaching into Mongoose directly.
- **Authorization** — that a user cannot read another user's resource. Assert the actual current
  behavior; if it returns `200` with `data: null` rather than `403`, assert that and flag it as a
  finding rather than silently writing the test you wish were true.

## What NOT to assert

- That a service or repository function was called — that's a unit test's job.
- Internal document shape straight from Mongoose, bypassing the mapper.
- Anything requiring a live WebSocket connection.

## Coverage per route

At minimum, per endpoint: the 401 case, the happy path, one validation-failure case, and one
"not found / not a participant" case where applicable.

## Running

```bash
cd backend && npm run test:integration
```

Integration tests are excluded from `npm run test:unit` via `testPathIgnorePatterns`. The
timeout is 30s (`jest.integration.config.ts`) because the in-memory Mongo binary may download on
first run.

## Output

- Write the test file. Do not modify source files to make a test pass unless it caught a real
  bug — say so and ask first.
- Run `npm run test:integration` and fix failures.
- Report the test count and anything you asserted as current-behavior that looks like a bug.
