---
name: add-api-endpoint
description: Use when adding or modifying a REST endpoint in the backend (a new route under /api/chats or /api/users, or a change to an existing one). Covers the full layered path — route → express-validator middleware → handleValidationErrors → controller → service → repository → mapper → response type — plus the unit and integration tests that go with it.
---

Add a REST endpoint following the backend's layered architecture. The argument is the endpoint
being added (method, path, purpose).

## Core principle

Each layer has exactly one job and only talks to the layer directly beneath it. Skipping a
layer — a controller querying a Mongoose model directly, a repository shaping a response — is
the thing this skill exists to prevent.

| Layer | Responsibility | Must NOT |
|-------|---------------|----------|
| Route | Wire path → validators → `handleValidationErrors` → controller | Contain logic |
| Middleware | Declare express-validator chains | Send responses |
| Controller | Read `req`, call one service, return `res.json({ data })` | Touch models or build queries |
| Service | Business logic, orchestration, WS fan-out, `NotFoundError` | Know about `req`/`res` |
| Repository | Mongoose queries only | Shape API responses |
| Mapper | Model → response DTO | Query the DB |

## Steps

### 1. Route — `src/routes/{chat,user}.route.ts`

Order matters. Validators come first, then `handleValidationErrors`, then the controller:

```ts
router.get('/search', validateGetFilteredChatsRequest, handleValidationErrors, ChatController.getFilteredChats);
```

`AuthMiddleware` is already applied router-wide via `router.use(AuthMiddleware)` in
`chat.route.ts` — don't re-add it per route. Place literal paths (`/search`) **before**
parameterised ones (`/:chatId`) or Express will match the param route first.

New router? Mount it in `src/app.ts` under `/api/...`, above the SPA catch-all and the
`errorHandler`.

### 2. Validation — `src/middleware/{chat,user}.middleware.ts`

Export a named array of express-validator chains, each with `.withMessage(...)`:

```ts
export const validateGetChatRequest = [
  param('chatId')
    .notEmpty()
    .withMessage('Chat ID is required')
    .isMongoId()
    .withMessage('Invalid chat ID format'),
];
```

Use `body` / `param` / `query` / `oneOf` as appropriate. `handleValidationErrors`
(`src/middleware/validation.middleware.ts`) throws `ValidationError`, which `errorHandler`
renders as **422** with `{ error: 'Validation failed', details: [...] }`. Never hand-roll
`res.status(400)` for validation.

### 3. Controller — `src/controllers/*.controller.ts`

Thin. Read params/body/`req.session.userId!`, call one service method, return
`res.json({ data })`. Every response body is wrapped in a `data` key — the frontend reads
`res.body.data` everywhere. Add a JSDoc one-liner above each handler and register the export
in the file's `export default { ... }` block.

Throw domain errors (`NotFoundError`, `ValidationError`) — never `res.status(500)`. The
`errorHandler` in `src/middleware/error.middleware.ts` catches them.

### 4. Service — `src/service/*.service.ts`

Business logic lives here: participant checks (`isChatParticipant`), orchestration across
repositories, and WS fan-out to connected clients via `ConnectionService`. If the endpoint
should push a live update, emit it here — see `notifyUsersOnNewChatMessage` in
`chat.service.ts` — and follow the `add-ws-event` skill for the client side.

### 5. Repository — `src/repositories/*.repository.ts`

Mongoose only. Return model documents (`IChat`, `IUser`, …), never response DTOs. Use
`.populate()` where the caller needs related documents.

### 6. Mapper + response type

Add the DTO interface to `src/types/responses.ts`, then a `mapXToResponse(userId, doc)`
function in `src/mappers/*.mapper.ts`. Mappers take `userId` when the shape is
viewer-dependent (e.g. `isPersonal`, chat `name` derived from the *other* participant).

### 7. Tests

- Unit tests per layer — use the `unit-test` skill.
- An integration test for the route — use the `integration-test` skill. At minimum: the 401
  case without a session, the happy path, and one validation-failure case.

## Verification

```bash
cd backend && npm run type-check && npm run test:unit && npm run test:integration
```

## Output

Report the route added, the files touched layer by layer, and the test count.
