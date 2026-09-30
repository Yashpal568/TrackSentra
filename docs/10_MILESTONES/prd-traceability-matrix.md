# PRD Traceability Matrix

| ID | PRD Requirement | PRD Section | Official Milestone | Implementation Status | Code/API/UI Evidence | Test Evidence | Gap | Priority |
|---|---|---|---|---|---|---|---|---|
| REQ-01 | Company Admin creates/updates company profile | Core | M03 | IMPLEMENTED | `Company.ts`, `company.controller.ts`, `/company/profile` | `company.test.ts` | None | Low |
| REQ-02 | Manage Sites | Core | M03 | IMPLEMENTED | `Site.ts`, `site.controller.ts`, UI Site List | `site.test.ts` | None | Low |
| REQ-03 | Manage Guards | Core | M04 | IMPLEMENTED | `Guard.ts`, `guard.controller.ts` | `guard.test.ts` | None | Low |
| REQ-04 | Assign Guards to Shifts & Routes | Core | M04 | IMPLEMENTED | `Shift.ts`, `shift.controller.ts` | `shift.test.ts` | None | Low |
| REQ-05 | Create Patrol Route | Core | M06 | IMPLEMENTED | `PatrolRoute.ts`, `patrol.controller.ts` | `patrol.test.ts` | None | Low |
| REQ-06 | Create Checkpoints & QR Identity | Core | M05 | IMPLEMENTED | `Checkpoint.ts`, `checkpoint.controller.ts` | `checkpoint.test.ts` | None | Low |
| REQ-07 | Guard Logs In | Core | M02 | IMPLEMENTED | `auth.controller.ts` | `auth.test.ts` | None | Low |
| REQ-08 | Guard Starts Assigned Patrol | Core | M06 | IMPLEMENTED | `startPatrolSession` in `patrol.controller.ts` | `patrol.test.ts` | None | Low |
| REQ-09 | Guard Scans Checkpoint QR | Core | M06 | IMPLEMENTED | `scanCheckpoint` in `patrol.controller.ts` | `patrol.test.ts` | None | Low |
| REQ-10 | Browser/App obtains location | Core | M07 | IMPLEMENTED | `scanCheckpoint` reads `latitude/longitude` | `patrol.test.ts` | None | Low |
| REQ-11 | Backend validates the event | Core | M06 | IMPLEMENTED | Checks in `patrol.controller.ts` | `patrol.test.ts` | None | Low |
| REQ-12 | Dashboard receives activity | Core | M09 | IMPLEMENTED | Server-Sent Events via `livePatrolEvents` | `patrol.test.ts` | None | Low |
| REQ-13 | Guard continues sequence | Core | M06 | IMPLEMENTED | Checks `out_of_sequence` | `patrol.test.ts` | None | Low |
| REQ-14 | Patrol completed event | Core | M06 | IMPLEMENTED | `completePatrolSession` | `patrol.test.ts` | None | Low |
| REQ-15 | Exceptions create alerts | Core | M10 | PARTIALLY_IMPLEMENTED | `Incident.ts`, SSE emits events, lacking comprehensive external push alerts | `incident.test.ts` | Missing push notification delivery | Medium |
| REQ-16 | Inspect reports & audit history | Core | M11 | IMPLEMENTED | `AuditLog.ts`, `/api/audit` | Manual validation | None | Low |
| REQ-17 | Secure Guard Email Activation | M04 | M04 | IMPLEMENTED | `guard.controller.ts` uses VerificationToken & bcrypt | `guard.test.ts` | None | Low |
| REQ-18 | QR Attack Prevention | Security | M12 | IMPLEMENTED | Backend ignores client IDs, validates via `user.companyId` & session | `patrol.test.ts` | None | Low |
| REQ-19 | Tenant Isolation | Security | M03 | IMPLEMENTED | Every controller enforces `companyId: user.companyId` | Architecture Audit | None | Low |
| REQ-20 | Marketing/Public Site | SaaS | M14 | IMPLEMENTED | `LandingPage.tsx`, `/api/subscriptions/plans/public` | Manual E2E | None | Low |
