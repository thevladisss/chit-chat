# Chit-Chat — Communication Mental Model

## Overview

The application uses two parallel communication channels:

| Channel | Protocol | Purpose |
|---------|----------|---------|
| REST (HTTP) | `axios` → Express | Authentication, fetching/sending data |
| Real-time | Native `WebSocket` → `ws` | Live events: connections, typing, messages |

---

## 1. Transport Layer

### REST

The frontend creates a single `axios` instance (`frontend/src/service/index.ts`) with `withCredentials: true`, which carries the session cookie on every request. All REST traffic goes through `/api/chats/*` and `/api/users/*`.

```
Frontend (axios)  ──cookie──►  Express Router  ──►  Controller  ──►  Service  ──►  Repository  ──►  MongoDB
```

### WebSocket

The connection is opened exactly once per login session inside `App.tsx`:

```ts
// App.tsx — runs when isLoggedIn becomes true
wsRef.current = new WebSocket(import.meta.env.VITE_WS_URL);
```

The raw `WebSocket` instance is stored in a `ref` and exposed app-wide via `WebSocketContext` as a getter (`() => WebSocket | null`). Components access it with `useWebSocket().getWs()`.

```
App (wsRef)
  └── WebSocketContext.Provider (value = getWebSocket)
        └── AppLayout  ─ registers onopen / onmessage
        └── ChatComposer  ─ calls getWs().send(...)
```

---

## 2. Session & Auth

Authentication is cookie-based with an `express-session` session backed by **Redis** (`connect-redis`).

```
POST /api/users
  └── UserService.signUpUser(username)
  └── req.session.userId = user.id   ← session persisted to Redis
  └── returns IUser { userId, username }
```

The same `sessionParser` middleware is reused during the WebSocket **HTTP upgrade**:

```
HTTP UPGRADE request
  └── sessionParser(req, {}, callback)
        ├── session.userId missing → socket.destroy()   [rejected]
        └── session.userId present → wss.handleUpgrade  [accepted]
```

This means **a valid session cookie is required before a WS connection is accepted**.

---

## 3. WebSocket Connection Lifecycle

### On connect (`handleWsConnection`)

```
Client opens WS
  └── session validated (userId present)
  └── ConnectionService.storeConnection()
        ├── MongoDB: insert Connection document { sessionId, userId }
        └── In-memory Map<connectionId, WebSocket>   ← WebSocket objects live here only
  └── → CONNECTION_ESTABLISHED  to the new client (connectionId, connectedAt, other connections)
  └── → NEW_CONNECTION           to all other open clients (updated chats + connections list)
```

### On disconnect (`handleWsCloseConnection`)

```
WS 'close' event
  └── ConnectionService.removeConnectionByConnectionId()
        ├── MongoDB: delete Connection document
        └── In-memory Map: delete entry
  └── sessionStore.destroy(sessionId)
  └── → LEAVE_CONNECTION  to all remaining clients (updated chats + connections list)
```

### In-memory vs. persistent storage

| What | Where |
|------|-------|
| `WebSocket` objects | Process-local `Map<id, WebSocket>` (cannot be serialised) |
| Connection metadata | MongoDB `Connection` collection |
| Sessions | Redis (via `connect-redis`) |

---

## 4. Event Protocol

All WebSocket frames are JSON: `{ event: string, data: any }`.  
Client-sent frames use: `{ payload: { event, data } }` (see `chatServiceWs.ts`).

### Server → Client events

| Event string | Enum (backend) | Enum (frontend) | Payload | When sent |
|---|---|---|---|---|
| `connection_established` | `CONNECTION_ESTABLISHED` | *(not listed — handled implicitly)* | `{ connectionId, connectedAt, connections[] }` | New client connects |
| `new_connection` | `NEW_CONNECTION` | `ServerSideEventsEnum.Connection` | `{ chats[], connections[] }` | Broadcast to all others on connect |
| `leave_connection` | `LEAVE_CONNECTION` | `ServerSideEventsEnum.LeaveConnection` | `{ chats[], connections[] }` | Broadcast to all on disconnect |
| `new_message` | `MESSAGE` | `ServerSideEventsEnum.Message` | `{ sender, isSenderSelf, chats[], chat }` | After message persisted |
| `new_chat_created` | `CHAT_CREATED` | `ServerSideEventsEnum.ChatCreated` | `chats[]` | New user registered → chats created |
| `new_user` | `NEW_USER` | `ServerSideEventsEnum.NewUser` | `chats[]` | Existing users when someone new signs up |
| `typing_in_chat` | `TYPING_IN_CHAT` | `ServerSideEventsEnum.TypingInChat` | `{ userId, user, chatId }` | Chat participant is typing |

### Client → Server events

| Event string | Enum (backend) | Enum (frontend) | Payload | When sent |
|---|---|---|---|---|
| `send_message` | `SEND_MESSAGE` | `ClientSideEventsEnum.SendMessage` | `{ message, chatId, userId }` | User submits a message |
| `typing_in_chat` | `TYPING_IN_CHAT` | `ClientSideEventsEnum.TypingInChat` | `{ chatId }` | User is typing |

> **Note:** `send_message` is routed through REST (`POST /api/chats/:chatId/messages`), not WS, for persistence. The WS `SEND_MESSAGE` handler is a stub (`break` only). The server then pushes `new_message` over WS to all participants.

---

## 5. Key Flows

### Sign-in

```
1. POST /api/users { username }
2. Backend: upsert User, set session.userId, create chats for all user pairs (if new)
3. Backend: WS-push NEW_USER to all connected clients
4. Frontend: stores user in Redux (user/slice), isLoggedIn → true
5. App.tsx effect: opens WebSocket connection
```

### Sending a message

```
1. Frontend: POST /api/chats/:chatId/messages { message, type }
2. Backend: TextMessageRepository.createTextMessage()
3. Backend: ChatService.notifyUsersOnNewChatMessage()
   └── for each chat participant with an open WS → send new_message
4. Frontend (AppLayout.onmessage):
   └── ServerSideEventsEnum.Message → setChats() + setSelectedChat()
   └── if not sender → play message sound
```

### Typing indicator

```
1. Frontend (ChatComposer): ws.send({ payload: { event: typing_in_chat, data: { chatId } } })
2. Backend: looks up chat participants → sends typing_in_chat to each (excluding sender)
3. Frontend (AppLayout): setTypingInChat(chatId, [user])
   └── after 2 000 ms timeout → deleteTypingInChat(chatId)
```

### New user registration

```
1. POST /api/users → new user → ChatService.createNewChatForAllUsers(userId)
2. Backend: creates a 1-on-1 chat between the new user and every existing user
3. Backend: pushes new_user to all connected sockets
4. Frontend: ServerSideEventsEnum.NewUser → dispatch(getChatsAction())  [REST refetch]
```

---

## 6. Frontend State (Redux)

| Slice | Key state | Updated by |
|-------|-----------|-----------|
| `user/slice` | `userId`, `username`, `isLoggedIn` | Sign-in REST response |
| `chat/slice` | `chats[]`, `selectedChat`, `typingInChat{}` | WS events via `AppLayout` dispatcher |

`AppLayout` is the single entry point for all WebSocket → Redux translation. It registers `ws.onmessage` once on mount and fans out to slice actions.

---

## 7. Infrastructure

```
Browser
  │  cookie (connect.sid)
  ├─ HTTPS/REST ──────────────────► Express :3000
  │                                   ├── express-session  ──► Redis :6379
  │                                   ├── REST routes      ──► MongoDB :27017
  │                                   └── static files (frontend build)
  └─ WSS (upgrade) ───────────────► ws.WebSocketServer (noServer, attached to same HTTP server)
                                        └── in-memory Map<id, WebSocket>
```
