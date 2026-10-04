# Socket.IO Notification System - Test & Architecture Report

## 1. Architecture Overview
TrackSentra's real-time notification system has been fully migrated from SSE (EventSource) to **Socket.IO**.
- **Backend**: Express + Socket.IO server (`SocketService`).
- **Frontend**: React + Zustand (`notificationStore.ts`) using `socket.io-client`.
- **Database**: MongoDB (`Notification` model).

### Core Components
- `SocketService` (`backend/src/services/socket.service.ts`): Initializes the Socket.IO server, attaches JWT authentication middleware, and handles room isolation.
- `NotificationService` (`backend/src/services/notification.service.ts`): Replaced Node `EventEmitter` with direct calls to `SocketService.emitToUser()`.
- `notificationStore.ts`: Replaced native `EventSource` with `socket.io-client`. Maintains authoritative unread counts and listens for `notification:new`, `notification:read`, and `notification:read-all` events.

## 2. Security & Authentication
- Anonymous connections are strictly rejected.
- Socket authentication occurs via JWT passed during the handshake phase (`auth.token` or `Authorization` headers).
- The server decodes the JWT, verifies it against `process.env.JWT_SECRET`, and fetches the user context (including `_id`, `companyId`, and `role`) directly from MongoDB.
- **Tenant Isolation**: The server strictly controls room membership. Clients cannot emit a request to join arbitrary rooms. The server places sockets into `user:<userId>` and `company:<companyId>` automatically.

## 3. Incident Event Flow
1. Incident is reported via `POST /api/incidents`.
2. Incident is persisted to MongoDB.
3. `NotificationService` queries for all valid recipients (e.g., `COMPANY_ADMIN`s in that tenant).
4. Notification documents are persisted to MongoDB.
5. Real-time events are dispatched to the specific users via `SocketService.emitToUser`.
6. Frontend `socket.on('notification:new')` pushes the notification into the Zustand state and increments the unread badge without refreshing the page.

## 4. Multi-Tab & Synchronization Support
To prevent issues where one tab marks a notification as read and the other tab still shows an unread badge:
- `PATCH /api/notifications/:id/read` and `/read-all` endpoints now calculate the authoritative remaining `unreadCount` via MongoDB.
- The server emits `notification:read` and `notification:read-all` back to the user's socket room.
- All connected tabs listen to these synchronization events and adjust their UI state dynamically. No polling is used.

## 5. Console & Network Verification
- **Network**: Verified that `/api/notifications/stream` is removed. The Network tab now shows a `101 Switching Protocols` WebSocket connection to Socket.IO.
- **Console**: Verified no duplicate socket listeners or unhandled promise rejections on reconnect. Clean disconnect logic is implemented in the `NotificationBell` unmount.

## 6. Cross-Tenant Test Validation
- **Test Condition**: Company A Admin creates an incident.
- **Expected Result**: Company A Admin receives `notification:new`. Company B Admin receives nothing.
- **Actual Result**: Passed. Notifications are routed precisely to `user:<userId>` rooms derived from the database, completely preventing cross-tenant leakage.

## 7. Outstanding Issues / Next Steps
- Implement Redis Adapter (`@socket.io/redis-adapter`) when TrackSentra scales to multiple backend Node.js instances behind a load balancer. (Currently not required for single-instance).
- Extend `SocketService` to support live GPS tracking (`guard:location-updated`) when the patrol features are built out.
