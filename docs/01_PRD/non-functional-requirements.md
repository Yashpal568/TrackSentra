# Non-Functional Requirements

## Reliability
Patrol events must be durable and idempotent.

## Performance
Normal dashboard/API operations should feel responsive. Long-running reports should not block request threads.

## Security
Use secure authentication, authorization, input validation, rate limiting, tenant isolation, secure secrets, and audit logging.

## Availability
Production architecture should support monitoring, health checks, backups, and recovery procedures.

## Scalability
The design must support multiple companies, multiple sites per company, many guards, and high-volume scan events.

## Observability
Capture structured logs, errors, metrics, health status, and important business events.
