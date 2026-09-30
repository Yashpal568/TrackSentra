# API Overview

Base:
`/api/v1`

Core groups:
- /auth
- /companies
- /sites
- /users
- /guards
- /shifts
- /patrol-routes
- /checkpoints
- /patrol-sessions
- /checkpoint-scans
- /alerts
- /reports
- /audit-logs
- /notifications

Every protected request passes authentication, authorization, tenant scope, validation, and rate limiting where appropriate.
