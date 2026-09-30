# Database Schema

Core collections:
- companies
- users
- sites
- guards
- shifts
- patrolRoutes
- checkpoints
- patrolSessions
- checkpointScans
- alerts
- notifications
- auditLogs
- devices/sessions

All tenant-owned collections should include companyId. Site-scoped resources should include siteId.

Use immutable event records for scan history.
