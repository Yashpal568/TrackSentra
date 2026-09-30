# Patrol API

## Start patrol
POST /patrol-sessions

## Get active patrol
GET /patrol-sessions/:id

## Scan checkpoint
POST /patrol-sessions/:id/scans

Server validates identity, session state, route, checkpoint, sequence, GPS, time, duplicate/replay, and permissions.

## Complete patrol
Completion should be derived from validated checkpoint events rather than blindly trusted from the client.
