# Technical Architecture

## Recommended stack
Frontend: React + Vite + TypeScript + Tailwind CSS
Backend: Node.js + Express + TypeScript
Database: MongoDB + Mongoose
Realtime: WebSocket or Socket.IO
Authentication: short-lived access token + secure refresh strategy
Guard interface: responsive PWA for MVP
Deployment: cloud-hosted frontend + backend + managed database

## Logical layers
Presentation → API → Authentication/Authorization → Domain Services → Persistence → Events/Notifications

## Principle
Business validation belongs on the backend. Frontend improves UX but is never the security authority.
