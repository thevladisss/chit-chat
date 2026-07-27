# Validating WS Payloads

## Why the HTTP pattern (`chat.controller.ts`) doesn't transfer directly

In `chat.controller.ts`, a controller can just `throw new NotFoundError('Chat not found')` and it works, because Express 5's router automatically catches a rejected promise returned from an async handler and forwards it to `next(err)` → `error.middleware.ts`, which inspects `err instanceof AppError` and turns it into `res.status(...).json(...)`. Express is doing the catching for you — no `.catch()` appears anywhere in the controller because the framework wraps every route handler in that machinery.

`ws.on('message', ...)` is a raw Node `EventEmitter` callback. There is no framework wrapping it. Currently, in `ws-handlers.ts`:

```js
ws.on('message', (data) => {
  handleWsMessage(req, ws, data); // fire-and-forget, nothing catches this
});
```

If `handleWsMessage` throws or rejects — from `JSON.parse`, a validation failure, or a `throw new NotFoundError(...)` added deeper in the call stack — that rejection has no listener. It becomes an unhandled promise rejection, and on this repo's Node version (22), an unhandled rejection kills the whole process. So "throw and let it bubble like the controller" is exactly the anti-pattern causing the current crash risk (see `TODO.md`, "Wrap handleWsMessage's JSON.parse..." and the `notifyOnUserTyping` crash entry) — there's nothing on the WS side playing the role of Express's router + error middleware. That role has to be built explicitly.

## The WS-equivalent flow

Two layers, mirroring HTTP's two layers (router catches the rejection, then error middleware formats the response):

### 1. The "router" layer — a catch at the call site

Non-negotiable, independent of whether validation is added:

```js
ws.on('message', (data) => {
  handleWsMessage(req, ws, data).catch((error) => {
    console.error('WS message error:', error);
    // decide here whether to tell the client anything
  });
});
```

This `.catch` is the direct analog of Express's automatic promise handling. Without it, any bug anywhere downstream — not just bad payloads — can still take the server down.

### 2. The "error middleware" layer — validate early, decide the response shape yourself

```js
const handleWsMessage = async (req, ws, data) => {
  const raw = ...;

  let json;
  try {
    json = JSON.parse(raw.toString());
  } catch {
    return; // or ws.send(...) an error frame, then return
  }

  const result = MessageSchema.safeParse(json); // discriminated union on `event`
  if (!result.success) {
    console.warn('Invalid WS payload:', result.error);
    return; // drop the frame — no HTTP status code exists to give it
  }

  switch (result.data.event) {
    case ClientChatEventEnum.TYPING_IN_CHAT:
      await notifyOnUserTyping(req, ws, result.data.payload);
      break;
  }
};
```

## Key mental shift from HTTP

There is no request/response pairing to hang a status code on. "Handling an error" for a WS message means *log it and drop the frame* (optionally pushing an `ERROR` event back down the same socket if the client needs to know) — not "return a 400."

You can still throw `AppError`/`NotFoundError` subclasses deeper in the call stack for readability (e.g. inside `notifyOnUserTyping` if a chat doesn't exist) — but the `.catch` in layer 1 is what has to receive them, since there is no automatic router forwarding on the WS side.

## Recommended validation approach

A schema-validation library like **Zod**, with a discriminated union on the `event` field, validated once at the top of `handleWsMessage` before any handler runs. This catches both known crash paths at once: malformed JSON *and* valid-but-wrong-shaped payloads (e.g. a `typing_in_chat` missing `chatId`).

Tradeoff: defining a schema per event type is more boilerplate than the current ad-hoc `data.chatId` access, but it turns "crashes the whole server" into "silently drops/logs one bad frame" — an asymmetry large enough to be worth it in a single-process WS server with no per-connection isolation. Lighter alternative if a new dependency isn't wanted: hand-rolled type guards per event, less safe but zero new deps.
