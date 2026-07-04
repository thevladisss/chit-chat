# TODO

## Backend

### Feat
- [ ] Add ping/pong heartbeat to detect dead WS connections that never fire close

### Fix
- [ ] Filter getAllConnections/getAllConnectionsNoCurrent by readyState OPEN before broadcasting connection events
- [ ] Refresh Redis connection TTL on activity instead of only at creation

### Chore
- [ ] Lower CONNECTION_TTL now that heartbeat covers staleness detection
