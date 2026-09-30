# AGENTS.md — AI Development Rules

## 1. Source of truth
Before implementing a feature:
1. Read this file.
2. Read the relevant PRD/module document.
3. Read the technical architecture document.
4. Read the relevant milestone.
5. Read the corresponding UI/UX specification.
6. Inspect existing code before modifying it.

## 2. Do not invent requirements
If behavior is undefined and materially affects architecture, stop and request clarification. For minor implementation details, follow established project conventions.

## 3. Architecture
- Use a modular MERN architecture.
- Keep frontend, backend, database, and infrastructure responsibilities separated.
- Prefer incremental changes over rewrites.
- Reuse existing components and utilities.
- Avoid duplicate business logic.

## 4. Multi-tenancy
Every tenant-owned resource must be scoped to the authenticated company/tenant.
Never trust tenant IDs supplied by the browser.
Authorization must be enforced server-side.

## 5. Security
- Never expose secrets in client code.
- Validate all API input.
- Apply authentication and authorization to protected endpoints.
- Maintain audit logs for security-sensitive actions.
- Treat QR, GPS, timestamps, and device metadata as untrusted client input.

## 6. Patrol validation
A valid checkpoint event requires server-side validation of:
- authenticated guard
- active patrol session
- assigned site
- checkpoint
- route sequence
- QR/checkpoint identity
- GPS proximity where enabled
- acceptable GPS accuracy
- time window
- duplicate/replay conditions

GPS alone is never proof of patrol completion.

## 7. UI/UX
The approved UI/UX documentation is authoritative.
Do not redesign screens, colors, spacing, navigation, typography, component patterns, or interaction flows without an explicit product decision.

## 8. Milestones
Work on the current milestone only unless explicitly instructed otherwise.
A milestone is complete only when implementation, validation, tests, acceptance criteria, documentation, and regression checks are complete.

## 9. Definition of done
A feature is not complete merely because the UI exists. It requires:
Frontend + Backend + Database + Validation + Security + Tests + Documentation.

## 10. Safe changes
Do not rewrite working modules simply to make them look cleaner. Refactors require a clear technical reason and regression coverage.
