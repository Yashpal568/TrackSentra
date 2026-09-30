# TrackSentra Deployment & Operations Guide

## 1. Production Architecture Overview
TrackSentra follows a modern containerized web application architecture:
- **Frontend**: React 19 + Vite (built as static assets), easily hosted on Vercel, Netlify, or any static CDN (AWS S3 + CloudFront).
- **Backend**: Express.js + Node.js REST API with rate-limiting, Helmet security headers, CORS protection, and HPP parameter pollution protection. 
- **Database**: MongoDB Atlas (Cloud Database).

## 2. Environment Variables & Configuration
### Backend Configuration (`backend/.env`)
Must be configured properly before launching the backend process:
- `PORT`: (default: 5000)
- `MONGODB_URI`: The MongoDB Atlas connection string (e.g., `mongodb+srv://<username>:<password>@cluster0...`). Ensure IP allowlisting permits the production server's static IP.
- `JWT_SECRET`: A secure, 64+ character random string for signing JSON Web Tokens.
- `JWT_REFRESH_SECRET`: A secondary secure, 64+ character random string for refresh tokens.
- `FRONTEND_URL`: The production URL of the frontend (e.g., `https://app.tracksentra.com`), used for CORS validation.

### Frontend Configuration (`frontend/.env`)
Built into the static bundle during compilation:
- `VITE_API_URL`: The production URL of the backend API (e.g., `https://api.tracksentra.com/api`).

## 3. Deployment Instructions

### Frontend (Static Site Hosting)
1. **Prepare**: Define `VITE_API_URL` in the environment.
2. **Build**: Run `npm run build` from the `frontend/` directory.
3. **Deploy**: Upload the contents of `frontend/dist/` to your hosting provider (Vercel, AWS S3, Nginx).
4. **Routing**: Configure SPA routing (all 404s route back to `index.html`).

### Backend (Node.js Server)
1. **Prepare**: Define all required environment variables.
2. **Build**: Run `npm run build` from the `backend/` directory.
3. **Deploy**: Start the application using a process manager like PM2:
   ```bash
   npm run start
   # or with pm2:
   pm2 start dist/server.js --name "tracksentra-api"
   ```
4. **Proxy**: Place the Node.js server behind a reverse proxy (Nginx or AWS ALB) and terminate HTTPS/SSL at the proxy.

## 4. Security Controls & Hardening
- **Authentication**: JWT-based with distinct separation between Company Admins, Site Managers, and Guards.
- **Tenant Isolation**: Backend intercepts all endpoints, enforcing that queries attach the `companyId` of the currently authenticated `req.user`.
- **DDoS/Abuse**: Configured `express-rate-limit` per-IP. `15m/100req` global and `15m/20req` for Authentication endpoints.
- **Header Protection**: Uses `helmet()` for Strict-Transport-Security, XSS filters, and hiding fingerprinting headers.
- **Graceful Shutdown**: The Node.js server captures `SIGTERM`/`SIGINT`, halts HTTP listeners, and safely closes the MongoDB socket pool before exiting to prevent transaction corruption.

## 5. Database Backup and Restore
TrackSentra relies on MongoDB Atlas's built-in operational capabilities:
- **Backups**: Configure automated continuous cloud backups in the Atlas Dashboard.
- **Restore**: Use Atlas Point-in-Time recovery for disaster scenarios. 
- **Indexes**: Collections heavily rely on indexes (e.g., `companyId`, `role`, `status`) to avoid collection scans. Ensure `test-db.ts` or database administration strictly respects these structures.

## 6. Rollback Procedures
1. **Frontend**: Quickly revert the `dist/` directory or revert the deployment branch on the CI/CD pipeline (e.g., Vercel Instant Rollback).
2. **Backend**: Scale down the new process version, update the symlink/process runner to the previous artifact version, and restart. 

## 7. Production Readiness Checklist
- [x] Environment variables validated on startup.
- [x] Secrets isolated from frontend bundles.
- [x] Security headers and strict CORS enabled.
- [x] Database connection pooling & socket timeouts configured (maxPool: 50, timeout: 45s).
- [x] Rate limiting preventing brute-force logins.
- [x] Graceful shutdown attached to process signals.
- [x] Frontend lazy-loading/code-splitting implemented (max bundle <260KB).
- [x] HTTPS/TLS strictly enforced at the Reverse Proxy layer (Pending Infrastructure Action).
- [x] Database Cloud Backups enabled (Pending Infrastructure Action).

*Note: The application has been hardened and prepared for production, but physical deployment (DNS mapping, TLS certificates, Cloud provisioning) remains the responsibility of the DevOps operational team.*
