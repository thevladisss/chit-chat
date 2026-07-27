# WebSocket Connection Storage: Tradeoff

## Decision

WebSocket socket objects are stored in a **process-local `Map<string, WebSocket>`** inside `connection.service.ts`. Connection metadata (userId, sessionId, createdTimestamp) is stored in **Redis**.

## Why a local Map is unavoidable

WebSocket objects are live TCP connections — they hold an open file descriptor, event emitters, and internal buffer state. None of that can be serialised or transmitted, so they cannot go into Redis, a database, or any shared store. A process-local Map is the only option.

## The tradeoff: single instance only

The `socketMap` is local to the process. If you run two backend instances (horizontal scaling), instance A's Map has no knowledge of sockets on instance B. A message intended for a user whose socket lives on instance B would silently fail.

## Fix when scaling is needed: Redis Pub/Sub

Each instance subscribes to a Redis channel. When instance A needs to reach a user it cannot find in its local Map, it publishes to the channel. Instance B receives the event and routes it to its local socket. This is the standard pattern used by Socket.io and similar frameworks.

This is not implemented now — the app runs as a single instance. The architecture does not need to change when the time comes; only the fan-out logic in `connection.service.ts` needs a Pub/Sub layer added.

## Update: Migrating from raw WS to Socket.io

### Reason: scalability

The single-instance limitation above is the deciding factor. `socketMap` in `connection.service.ts` only ever knows about sockets accepted by its own process. Connection metadata already lives in Redis and is visible to every instance, but the live `WebSocket` object is not — so `getAllConnectionsOnline()` filters down to whatever sockets happen to exist in the current process's memory.

Concretely: with two or more backend instances behind a load balancer, if User A is connected to instance 1 and User B is connected to instance 2, instance 1 has no way to reach User B's socket. Any broadcast (`notifyOnNewConnection`, `notifyOnLeaveConnection`, `notifyOnUserTyping`, message delivery) that needs to reach User B is silently dropped whenever it's computed on instance 1. This isn't a bug that surfaces in local development (always one instance) — it only appears once the app is scaled horizontally, which makes it easy to ship and easy to miss until production traffic requires a second instance.

Rather than hand-rolling the Redis Pub/Sub fan-out described above, we're migrating to Socket.io, which solves this with the same underlying pattern (`socket.io-redis-adapter`) but as a maintained library instead of custom code: rooms and broadcasts are automatically fanned out across every instance subscribed to the adapter's Redis channels, so a broadcast issued on instance 1 reaches sockets held open on instance 2 without any per-feature Pub/Sub wiring.

## Message Sending: HTTP vs WebSocket

### Decision

Messages are sent via `POST /:chatId/messages` (HTTP), not over the WS connection. WS is used only to broadcast a persisted message out to the chat's other participants after the HTTP write succeeds.

### Why not send via `ws.send`

**We already tried this, and it's the dead code we found.** `frontend/src/service/ws/chatServiceWs.ts` (`sendChatMessage`/`sendWsMessage`) is exactly a send-via-WS implementation — unused, and its envelope (`{ payload: { event, data } }`) doesn't even match what the backend's `handleWsMessage` switch reads (`{ event, payload }` at the top level). This is the natural failure mode for WS sends: there's no response to catch the mismatch, so it silently rotted instead of erroring loudly the way a broken REST call would.

**WS has no request/response semantics.** An HTTP `POST` gives a status code and body for free. Over WS, "did my send succeed" would require hand-rolling an ack protocol — a client-generated correlation ID, a `MESSAGE_SENT`/`ERROR` event carrying it back — just to reach parity with what HTTP already provides.

**Validation would need to be duplicated.** The REST path already validates through `validateMessageRequest` (express-validator: `chatId` as a Mongo ID, a `oneOf` branch for text vs. audio, message length, audio URL/duration/format/size). Moving sends to WS means duplicating that logic in the Zod WS schema (see `backend/src/validation/schemas/ws-message.schema.ts`) — two validation surfaces for one concept, with the drift risk `chatServiceWs.ts` already demonstrated.

**Audio messages need HTTP regardless.** File/audio messages go through `multer`, which needs multipart HTTP upload. A WS-only send path would still have to fall back to HTTP for audio, so a full migration wouldn't actually remove the REST path — it would just add a second, thinner one for text.

**Scaling.** Per the section above, the WS layer only knows about sockets on its own process until the Socket.io migration lands. HTTP writes don't care which backend instance handles them; a WS-based write path would inherit that same single-instance fragility.

### Where WS is the right tool

Broadcasting the persisted message to other participants after the HTTP write succeeds — which is what the current architecture already does. WS is well suited to server-initiated push; it's client-to-server writes that need confirmation (sends) where it falls short of HTTP without extra protocol work.

