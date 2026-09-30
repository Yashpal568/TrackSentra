# Security Patrol Management SaaS — Documentation

This repository is the source of truth for the Security Patrol Management SaaS.

## Product
A multi-tenant SaaS platform for industrial companies to monitor security guard patrols using QR checkpoints, GPS validation, patrol routes, shifts, alerts, reports, and audit trails.

## Core flow
Company → Site → Guard → Shift → Patrol Route → Checkpoint → QR Scan → GPS Validation → Patrol Event → Dashboard/Alerts/Reports

## Documentation rule
Implementation must follow the relevant PRD, architecture, API, security, UI/UX, and milestone documents. Do not invent product behavior when the documentation already defines it.

## Related UI/UX
The approved UI/UX package belongs in `docs/14_UI_UX/`.

## Local Development Instructions
1. Ensure Node.js 20+ and MongoDB are installed.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` in `backend` and `frontend`.
4. Run development servers: `npm run dev`
5. Run tests: `npm run test`
6. Build project: `npm run build`
