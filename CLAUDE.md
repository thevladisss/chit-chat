# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chit-Chat is a real-time chat application using a Node.js/Express backend with WebSockets and a React 19 frontend. It is structured as an npm workspaces monorepo with `backend` and `frontend` packages.

## Commands

### Running the app

```bash
# Start Redis + MongoDB via Docker, then both backend and frontend
npm start

# Start only the backend (requires Redis and MongoDB already running)
npm run start:server

# Start only the frontend dev server
npm run start:client
```

Backend runs on port 3000, frontend dev server on port 5173.

### Testing

```bash
# Run all tests across workspaces
npm test

# Backend: unit tests only (Jest)
cd backend && npm run test:unit

# Backend: integration tests only (hits real MongoDB via mongodb-memory-server)
cd backend && npm run test:integration

# Backend: watch mode
cd backend && npm run test:watch

# Frontend: unit tests (Vitest)
cd frontend && npm run test:unit
```

### Type checking and linting

```bash
# Backend
cd backend && npm run type-check

# Frontend
cd frontend && npm run type-check
cd frontend && npm run lint
```

### Build

```bash
cd backend && npm run build   # tsc output to dist/
cd frontend && npm run build  # tsc + vite build
```

### Database

```bash
# Start infrastructure only (required before running backend locally)
docker compose up redis mongo -d

# Drop and reseed the database
cd backend && npm run db:drop
```

## Architecture

### Backend (`backend/src/`)

Layered architecture: **controllers → services → repositories → models**

- **`server.ts`** — entry point; connects MongoDB and Redis, starts HTTP server, creates the WebSocket server (`ws`, `noServer: true`), wires the HTTP `upgrade` event to validate session before accepting WS connections
- **`app.ts`** — Express app setup; session middleware (`express-session` backed by Redis via `connect-redis`), CORS, routes
- **`session.ts`** — exports `sessionStore` (RedisStore); shared between HTTP session middleware and the WS upgrade handler
- **`redis.ts`** — Redis client singleton used by `session.ts`
- **`ws/ws-handlers.ts`** — WebSocket event handling: on connection, stores a Connection document in MongoDB, sends `CONNECTION_ESTABLISHED` to the new client and `NEW_CONNECTION` to all others; dispatches `typing_in_chat` events to participants
- **`ws/ws-connections.ts`** — process-local `Map<connectionId, WebSocket>` because WebSocket objects cannot be serialised to Redis or MongoDB

**Authentication flow**: Sessions are cookie-based. The WS upgrade handler reads the session via `sessionParser` — if `session.userId` is absent, the socket is destroyed immediately.

**Connection tracking**: A `Connection` MongoDB document is created per WS connection (stores `sessionId`, `userId`, `createdTimestamp`). When a WS closes, the Connection document is deleted and the session is destroyed, which triggers `LEAVE_CONNECTION` notifications to remaining clients.

### Frontend (`frontend/src/`)

- **`main.tsx`** — mounts the app, wraps it in Redux `Provider` and `WebSocketContext.Provider` (which supplies a `() => WebSocket | null` getter)
- **`router/`** — React Router v7; routes are configured in `routes.ts` with `protected` and `public` flags; `guards.tsx` enforces auth
- **`layouts/AppLayout.tsx`** — the authenticated shell; owns WebSocket event dispatch logic (`ws.onmessage`). All server events are handled here and translated into Redux actions.
- **`stores/`** — Redux Toolkit slices:
  - `chat/slice.ts` — selected chat, chat list, typing indicators per chat
  - `user/slice.ts` — authenticated user state
- **`contexts/websocket.context.ts`** — `WebSocketContext` holds `() => WebSocket | null`; components call `useWebSocket().getWs()` to send messages
- **`views/`** — page-level components: `AuthView`, `ChatView`, `SelectChatView`

### WebSocket Event Protocol

| Direction | Enum file | Key events |
|-----------|-----------|------------|
| Client → Server | `enums/ClientChatEventEnum.ts` | `typing_in_chat`, `send_message` |
| Server → Client | `enums/ServerChatEventEnum.ts` (backend) / `ServerSideEventsEnum.ts` (frontend) | `CONNECTION_ESTABLISHED`, `NEW_CONNECTION`, `LEAVE_CONNECTION`, `TYPING_IN_CHAT`, `MESSAGE`, `CHAT_CREATED`, `NEW_USER` |

### Required Environment Variables (backend)

Copy `.env.example` to `.env.development` before running locally:

```
MONGODB_URI=mongodb://localhost:27017/chit-chat
MONDODB_DATABASE=chit-chat
PORT=3000
CLIENT_URL=http://localhost:5173
SESSION_SECRET=dev-secret
REDIS_URL=redis://localhost:6379
```

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>
```

Include scope if the commit affects a specific area of the codebase (e.g., `frontend`, `backend` - `feat(backend)`).

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Scopes: `frontend`, `backend`, `auth`, `chat`

Rules: lowercase, imperative mood, no trailing period, subject line under 72 characters.
