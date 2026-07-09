# TODO

## Backend

### Feat
- [x] Add ping/pong heartbeat to detect dead WS connections that never fire close

### Fix
- [x] Filter getAllConnections/getAllConnectionsNoCurrent by readyState OPEN before broadcasting connection events
- [x] Refresh Redis connection TTL on activity instead of only at creation
- [ ] Require credential verification on sign-up instead of trusting username alone (createOrFindFirstUser) — anyone can log in as any existing user
- [ ] Verify session.userId is a participant of chatId in getChat and sendMessage before allowing read/write (chat.controller.ts)
- [ ] Wrap handleWsMessage's JSON.parse in try/catch and await/catch its call from ws.on('message') to avoid unhandled rejections on malformed frames — wire in the unused parseMessageToJson helper
- [ ] Escape user-supplied search input before building RegExp in findByUserNameOrChatNameOrMessage/findUsersWhereUsernameContains to prevent ReDoS
- [ ] Wire validateMessageRequest/handleValidationErrors into chat.route.ts — POST /:chatId/messages currently accepts unvalidated bodies
- [ ] Harden session cookie config in app.ts — secure:false is hardcoded, no sameSite, and SESSION_SECRET falls back to a hardcoded dev value
- [ ] Stop destroying the whole session on a single WS close in handleWsCloseConnection — logs out every tab/device sharing that session
- [ ] Strip the raw ws socket field from ConnectionWithSocket before broadcasting connections in notifyOnNewConnection/notifyOnLeaveConnection/notifyOnConnectionEstablished — currently leaks internal Node socket internals to every client
- [ ] Verify session writes made during the WS upgrade handler (server.ts) actually persist — sessionParser is called with a fake res object, so wsConnectionId may never save to Redis
- [ ] Add .catch/error handling to fire-and-forget notify promises in ws-handlers.ts and chat.service.ts to avoid unhandled rejections
- [ ] Fix check-then-act race between checkUserExists and createNewChatForAllUsers in createUser that can duplicate chats for concurrent sign-ups

### Chore
- [x] Lower CONNECTION_TTL now that heartbeat covers staleness detection
- [ ] Remove the empty commented-out middleware/session.middleware.ts stub
- [ ] Remove the dead empty SEND_MESSAGE case in the WS message switch (ws-handlers.ts) since sending goes through REST
- [ ] Remove or wire up unused message.service.ts::getChatMessagesForUser
