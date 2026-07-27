---
name: add-ws-event
description: Use when adding, renaming, or removing a WebSocket event in Chit-Chat — any change to what the server emits or what the client sends over the WS channel. Walks the full end-to-end wiring across both workspaces (backend enum, zod schema, ws-handlers, frontend enum, AppLayout dispatch, Redux slice, COMMUNICATION.md) so no touchpoint is silently skipped.
---

Add (or change) a WebSocket event end to end. The argument is the event being added and
its direction; if unclear, ask which direction it flows before starting.

## Core principle

A WS event is only "done" when both ends agree. The two sides of this app keep **separate,
independently named enums** that are not generated from a shared source — nothing type-checks
one against the other. A missed touchpoint fails silently at runtime: the server emits, the
client's `switch` has no matching `case`, and the event is dropped with no error anywhere.

Treat the checklist below as mandatory, not advisory.

## The two envelope shapes

These are different and easy to mix up:

| Direction | Envelope | Parsed by |
|-----------|----------|-----------|
| Server → Client | `{ event, data }` | `AppLayout.tsx` — `WsCustomEvent` |
| Client → Server | `{ event, payload }` | `ws-message.schema.ts` — zod `discriminatedUnion('event')` |

The discriminator `event` must be at the **top level** for client→server messages. Nesting it
inside `payload` will fail `safeParse` and the server will reply with `ERROR`.

## Naming convention across the enum pair

Same string value, different key casing:

```ts
// backend/src/enums/ServerChatEventEnum.ts   — SCREAMING_SNAKE keys
TYPING_IN_CHAT = 'typing_in_chat',

// frontend/src/enums/ServerSideEventsEnum.ts — PascalCase keys
TypingInChat = "typing_in_chat",
```

The **string value is the contract**. Keys may differ in case; values must match exactly.

---

## Checklist: Server → Client event

1. **`backend/src/enums/ServerChatEventEnum.ts`** — add the member.
2. **Emit site** — usually `backend/src/ws/ws-handlers.ts` (connection lifecycle, typing) or
   `backend/src/service/chat.service.ts` (message fan-out). Follow the existing pattern:
   iterate connections, guard `con.ws && con.ws.readyState === WebSocket.OPEN`, then
   `con.ws.send(JSON.stringify({ event: ServerChatEventEnum.X, data: { ... } }))`.
   Skip the originating socket when the event shouldn't echo back to its sender.
3. **`frontend/src/enums/ServerSideEventsEnum.ts`** — add the mirrored member (PascalCase key,
   identical string value).
4. **`frontend/src/layouts/AppLayout.tsx`** — add a `handleXEvent` function *and* a `case` in
   the `handleWsMessage` switch. Both: adding one without the other is the most common miss.
5. **Redux** — if the event changes app state, dispatch through the existing slice actions
   (`setChatsAction`, `setSelectedChatAction`, `setTypingInChat`, …) rather than mutating in
   the layout. Add a new reducer to `frontend/src/stores/chat/slice.ts` only if no existing
   action fits.
6. **Types** — if `data` has a non-trivial shape, add an interface under
   `frontend/src/types/ws/` (see `IWSMessageEventData.ts`) instead of leaving it `any`.
7. **`COMMUNICATION.md`** — add the event to the protocol tables and the relevant flow.
8. **Tests** — `backend/__tests__/unit/ws/ws-handlers.spec.ts` for the emit; the
   `component-unit-test` skill covers any frontend handler you extract.

## Checklist: Client → Server event

1. **`backend/src/enums/ClientChatEventEnum.ts`** — add the member.
2. **`backend/src/validation/schemas/ws-message.schema.ts`** — define a schema object for the
   event and add it to the `WsMessageSchema` discriminated union. Every client→server event
   must be in this union; anything absent is rejected wholesale:

   ```ts
   const xSchema = z.object({
     event: z.literal(ClientChatEventEnum.X),
     payload: z.object({ /* fields */ }),
   });

   export const WsMessageSchema = z.discriminatedUnion('event', [
     typingInChatSchema,
     xSchema,
   ]);
   ```
3. **`backend/src/ws/ws-handlers.ts`** — add a `case` to the `switch (result.data.event)` in
   `handleWsMessage`, calling a dedicated `notifyOnX` / `handleX` function. `result.data` is
   already narrowed and validated at that point — don't re-check fields.
4. **`frontend/src/enums/ClientSideEventsEnum.ts`** — add the mirrored member.
5. **Send site** — add a helper in `frontend/src/service/ws/chatServiceWs.ts` and call it from
   the component. Use the enum member, never a raw string literal.
6. **`COMMUNICATION.md`** and **`backend/__tests__/unit/validation/schemas/ws-message.schema.spec.ts`**
   — a valid-payload case and an invalid-payload case.

---

## Known drift — check before assuming the code is consistent

These already exist in the repo. If your change touches any of them, fix it as part of the work
rather than copying the broken pattern:

- `ServerChatEventEnum` has `CONNECTION_ESTABLISHED`, `ROOM_JOIN_SUCCESS`, and `ERROR`; the
  frontend `ServerSideEventsEnum` has none of them — so the server's `ERROR` reply to an invalid
  payload is currently dropped silently by the client.
- Frontend `ServerSideEventsEnum` has a `Disconnect` member the backend never emits.
- `frontend/src/service/ws/chatServiceWs.ts` builds `{ payload: { event, data } }` — the
  discriminator is nested one level too deep, so it can never pass `WsMessageSchema`. The
  backend also has no `SEND_MESSAGE` case, making that path dead on both ends.
- `frontend/src/views/ChatView.tsx` sends the literal string `"typing_in_chat"` instead of
  `ClientSideEventsEnum.TypingInChat`.

## Verification

Run all of these — a missed enum mirror is a type-check pass and a runtime failure, so tests
alone won't catch it:

```bash
cd backend && npm run type-check && npm run test:unit
cd frontend && npm run type-check && npm run lint && npm run test:unit
```

Then manually confirm the enum pair: every member of `ServerChatEventEnum` that the client is
expected to act on has a matching value in `ServerSideEventsEnum` *and* a `case` in
`AppLayout.tsx`.

## Output

Report the event name, its direction, and the list of files touched — explicitly noting any
checklist step you deliberately skipped and why.
