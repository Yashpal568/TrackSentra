# Functional Requirements

## FR-001 Authentication
Users authenticate according to their role.

## FR-002 RBAC
Permissions must be enforced server-side.

## FR-003 Tenant isolation
A company can access only its own data.

## FR-004 Patrol start
A guard can start only an assigned and currently eligible patrol.

## FR-005 QR scan
A scan identifies a checkpoint and submits a validation request.

## FR-006 GPS validation
The system compares reported coordinates with checkpoint coordinates using a configurable radius and accuracy rules.

## FR-007 Sequence validation
Checkpoints must be completed according to the configured route sequence unless the route explicitly permits flexible ordering.

## FR-008 Real-time updates
Valid and invalid patrol events appear in management interfaces without requiring a full page refresh.

## FR-009 Alerts
Configured exceptions create alerts and notification events.

## FR-010 Auditability
Security-sensitive changes and patrol events must be auditable.
