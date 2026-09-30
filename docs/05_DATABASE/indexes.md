# Database Indexes

Recommended indexes:
- companyId + status
- companyId + siteId
- siteId + active
- guardId + createdAt
- patrolSessionId + sequence
- checkpointId + scannedAt
- companyId + scannedAt
- companyId + alert status
- audit actor + createdAt

Indexes must be validated against actual query patterns before production.
