# PRD Gap Report

## Overview
This report documents the gaps between the original PRD requirements and the current implementation state.

## Gaps

### 1. External Push Notifications
- **Requirement:** Exceptions create alerts (Missed checkpoints, SOS, etc).
- **Original Gap:** External notification delivery such as Email/SMS/Push/Webhook missing.
- **Resolution Status:** ALREADY RESOLVED / NOT REQUIRED FOR CURRENT SCOPE.
- **Details:** The original PRD (`complete-prd.md`) only specifies "Support: missed checkpoint, late checkpoint..." and does not mandate off-platform external delivery for MVP. The system successfully generates internal `Incident` records and emits real-time Server-Sent Events (SSE) to the Live Monitoring dashboard. 
- **Future Action:** Integration with external notification webhooks or email/SMS alerting remains an OPTIONAL future enhancement.

### 2. Comprehensive Load Testing
- **Requirement:** M13 Production Launch - rate limiting, scalability validation.
- **Original Gap:** Load testing untested against staging.
- **Resolution Status:** REQUIRES EXTERNAL INFRASTRUCTURE (BLOCKED)
- **Details:** The baseline load testing framework using `k6` has been implemented at `tests/load/k6-load-test.js` along with execution instructions in `tests/load/README.md`. Execution is currently BLOCKED pending a formal staging environment.
- **Action:** Execute the `k6` tests when staging infrastructure is provisioned.

### 3. Rate Limiting Limits in Scaled Environments
- **Requirement:** Abuse prevention.
- **Original Gap:** Instance-local rate limits.
- **Resolution Status:** REQUIRES USER/PROVIDER CONFIGURATION
- **Details:** The application currently implements rate limiting via `express-rate-limit` (in-memory). For horizontal scaling (e.g., PM2 cluster mode or multiple container replicas behind a load balancer), this in-memory store will result in per-instance limits rather than global limits.
- **Future Action:** Switch to `rate-limit-redis` when horizontal scaling is physically implemented, if strict global rate limits are required.

### 4. Graceful Offline Support for Guard PWA
- **Requirement:** Guard PWA offline/retry behavior.
- **Original Gap:** Lack of deep offline IndexedDB syncing.
- **Resolution Status:** NOT REQUIRED FOR CURRENT SCOPE.
- **Details:** The PRD does not strictly mandate offline-first PWA sync capabilities. Standard browser caching and network resilience are deemed acceptable for the current launch.
