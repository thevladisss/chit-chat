# Chit-Chat 🌐⚡

A real-time 1-on-1 chat application — Node.js/Express + WebSockets on the backend, React 19 on the frontend. Built as a portfolio project to explore the architecture problems real-time systems run into: session-authenticated WebSocket upgrades, keeping a live socket registry in sync with persisted state, and the tradeoffs between HTTP and WS as write paths.

<img width="1717" height="898" alt="Chit-Chat screenshot" src="https://github.com/user-attachments/assets/bddcdcac-da39-42bf-9eb0-5bbb7984eb9e" />

> **Note for reviewers:** this is a learning/portfolio project, not production software. Sign-in is username-only (no passwords) and several features are deliberately half-built to demonstrate specific patterns. See [What's Not Supported](#whats-not-supported) — it's the most honest part of this document.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Design Notes](#design-notes)
- [What's Not Supported](#whats-not-supported)

## Features

- **Real-time messaging** over a session-authenticated WebSocket connection, with message persistence via REST
- **Live presence** — see other users come online/go offline as `Connection` documents are created/removed
- **Typing indicators**, relayed WebSocket → WebSocket with no database write
- **Session-based auth** backed by Redis (`express-session` + `connect-redis`), shared between HTTP requests and the WS upgrade handshake
- **Chat auto-provisioning** — a 1-on-1 chat is created between every pair of users at registration (Telegram-style "always have a chat with anyone in your contacts")

## Tech Stack

| | |
|---|---|
| **Frontend** | React 19 · TypeScript · Vite · Redux Toolkit · React Router v7 · native `WebSocket` · Vitest + Testing Library |
| **Backend** | Node.js · Express 5 · `ws` · MongoDB (Mongoose) · Redis (sessions + `connect-redis`) · Zod (WS payload validation) · express-validator (REST) · Jest + Supertest + `mongodb-memory-server` |
| **Infra** | Docker Compose (Redis + MongoDB), npm workspaces monorepo |

## Architecture

Layered backend: **controllers → services → repositories → models**. Two transport layers are deliberately separated:

- **REST (HTTP)** — durable writes: sign-in, creating chats, sending messages. Every write is confirmed against MongoDB before the client sees a response.
- **WebSocket** — real-time notifications only: presence, typing, "a message arrived." No WS message ever writes to the database directly — see [Design Notes](#design-notes) for why.

```
Browser                         Server
  |                               |
  |-- WS upgrade (cookie) ------> |  session validated via shared sessionParser
  |                               |  Connection doc created in MongoDB
  |                               |  WebSocket stored in a process-local Map
  |<-- CONNECTION_ESTABLISHED --- |  (sockets can't be serialized to Redis/Mongo)
  |                               |
  |                        notifies all OTHER
  |                        open connections via NEW_CONNECTION
```

Full request/event reference, sequence diagrams for message send / typing / sign-in, and the Redux data flow are documented in [`COMMUNICATION.md`](COMMUNICATION.md).

## Getting Started

### Prerequisites

- Node.js v22+
- Docker (for Redis + MongoDB)

### Installation

```bash
git clone https://github.com/thevladisss/chit-chat.git
cd chit-chat
npm install
```

This installs root, `backend`, and `frontend` dependencies together via npm workspaces.

### Environment variables

Copy the example env files before running locally:

```bash
cp backend/.env.example backend/.env.development
cp frontend/.env.example frontend/.env.development
```

`backend/.env.development` needs:

```
MONGODB_URI=mongodb://localhost:27017/chit-chat
MONDODB_DATABASE=chit-chat
PORT=3000
CLIENT_URL=http://localhost:5173
SESSION_SECRET=dev-secret
REDIS_URL=redis://localhost:6379
```

### Running

```bash
# Starts Redis + MongoDB via Docker, then both backend and frontend
npm start

# Or individually (requires Redis + MongoDB already running):
npm run start:server   # backend on :3000
npm run start:client    # frontend on :5173
```

## Testing

```bash
# All workspaces
npm test

# Backend — unit only (Jest)
cd backend && npm run test:unit

# Backend — integration (real MongoDB via mongodb-memory-server)
cd backend && npm run test:integration

# Frontend — component/unit tests (Vitest + Testing Library)
cd frontend && npm run test:unit
```

Coverage includes: services, repositories, mappers, WS middleware and payload validation on the backend; forms, chat components, and hooks on the frontend.

### Type checking & linting

```bash
cd backend && npm run type-check
cd frontend && npm run type-check
cd frontend && npm run lint
```

## Project Structure

```
backend/src/
  controllers/    → HTTP request handlers
  service/        → business logic
  repositories/   → data access (Mongoose)
  models/         → Mongoose schemas
  ws/             → WebSocket connection + event handlers
  validation/     → Zod schemas for WS payloads
  validators/     → express-validator chains for REST

frontend/src/
  stores/         → Redux Toolkit slices (chat, user)
  contexts/       → WebSocketContext (raw WebSocket, outside Redux)
  layouts/        → AppLayout — single point of WS → Redux dispatch
  views/          → page-level components (Auth, Chat, SelectChat)
  router/         → React Router v7 config + auth guards
```

## Design Notes

A few decisions worth knowing about if you're reviewing this codebase:

- **Why WebSocket objects live in a process-local `Map` instead of Redis.** A live socket holds an open file descriptor and can't be serialized — only connection *metadata* goes to MongoDB/Redis. The tradeoff (and the migration path to Socket.io + `socket.io-redis-adapter` for horizontal scaling) is written up in [`backend/TRADEOFF.md`](backend/TRADEOFF.md).
- **Why messages are sent over HTTP, not WS.** WS has no built-in request/response semantics — an HTTP POST gives a status code for free, where a WS send would need a hand-rolled ack protocol to know if it succeeded. Full reasoning in the same tradeoff doc.
- **How WS payloads are validated without crashing the server.** `ws.on('message', ...)` is a raw `EventEmitter` callback with no Express-style error middleware to catch a rejected promise. Validating with a Zod discriminated union at the top of the handler turns "malformed frame kills the process" into "drop the frame and emit an `ERROR` event." Details in [`backend/ws-validation.md`](backend/ws-validation.md).

## What's Not Supported

Documented here deliberately, rather than left for a reviewer to discover:

| Area | Status |
|---|---|
| **Password auth** | Sign-in is username-only — no password, no hashing. Anyone who knows a username can sign in as that user. |
| **Voice/audio messages** | Infrastructure exists end-to-end (model, hook, UI component) but isn't wired together; the backend save step is a no-op. |
| **Leaving a chat** | UI navigates away, but no server-side removal happens — the user stays a participant in MongoDB. |
| **Optimistic message updates** | Sent messages don't appear until the HTTP response returns. |
| **Group chats** | Data model supports `isGroupChat`, but there's no creation flow — all chats are 1-on-1. |
| **Multi-tab / multi-device** | A session is tied 1-to-1 with a single WS connection; closing one tab logs out every tab. |
| **Horizontal scaling** | The socket registry is a process-local `Map` — a second backend instance can't reach sockets held by the first. See [Design Notes](#design-notes). |
| **File attachments** | `multer` is a dependency but no upload endpoint exists. |
| **Message delivery status** | No read receipts or delivered/seen indicators. |

---

Built by [Vladyslav Nosal](https://github.com/thevladisss).
