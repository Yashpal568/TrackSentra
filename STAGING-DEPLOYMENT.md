# TrackSentra Staging Deployment Guide

This document outlines the steps required to deploy TrackSentra to a staging environment (e.g., AWS, Render, DigitalOcean, or Heroku).

## 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (M0 or higher for staging)
- A domain name for routing (e.g., `staging.tracksentra.com` and `api-staging.tracksentra.com`)
- SMTP provider credentials (SendGrid, Postmark, etc.)

## 2. Environment Configuration

### Backend (`/backend/.env`)
Create a `.env` file for the backend process:
```env
PORT=5000
NODE_ENV=staging
MONGODB_URI=mongodb+srv://<staging_user>:<pwd>@cluster0.mongodb.net/tracksentra_staging?retryWrites=true&w=majority
JWT_SECRET=<32_byte_secure_random_string>
JWT_REFRESH_SECRET=<32_byte_secure_random_string>
FRONTEND_URL=https://staging.tracksentra.com

# SMTP settings for emails
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your_sendgrid_api_key>
SMTP_FROM=no-reply@tracksentra.com
```

### Frontend (`/frontend/.env`)
Create a `.env` file for the frontend build:
```env
VITE_API_URL=https://api-staging.tracksentra.com/api
```

## 3. Build and Deployment Commands

### Backend
The backend runs as a standard Node.js Express server.
```bash
cd backend
npm install
npm run build
# Start the server (recommend using PM2 or Docker)
npm start
```

### Frontend
The frontend is a Vite React SPA that needs to be statically hosted (e.g., Vercel, Netlify, CloudFront, Nginx).
```bash
cd frontend
npm install
npm run build
# The /dist folder will contain the static assets to be served.
```

## 4. Database Setup
1. Create a dedicated `tracksentra_staging` database in your MongoDB cluster.
2. The application will automatically create necessary collections and indexes on startup via Mongoose models.

## 5. Health Checks
- Backend Liveness: `GET https://api-staging.tracksentra.com/api/health`
- Frontend: Ensure `https://staging.tracksentra.com` returns the Landing Page and that the browser console shows no CORS errors.

## 6. Rollback Procedure
If staging deployment fails:
1. Revert the repository to the previous stable Git commit tag.
2. Re-run frontend and backend CI build pipelines.
3. If database schema migrations caused failure, restore the staging MongoDB database from the automatic snapshot taken prior to deployment.
