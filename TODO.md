# TODO

## Backend

### Feat
- [x] Add ping/pong heartbeat to detect dead WS connections that never fire close

### Fix
- [ ] Filter getAllConnections/getAllConnectionsNoCurrent by readyState OPEN before broadcasting connection events
- [x] Refresh Redis connection TTL on activity instead of only at creation

### Chore
- [x] Lower CONNECTION_TTL now that heartbeat covers staleness detection
