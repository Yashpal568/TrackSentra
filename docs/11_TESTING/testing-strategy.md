# Testing Strategy

## Unit
Distance calculations, patrol state transitions, permission policies, validation functions.

## Integration
API authentication, tenant isolation, patrol scans, checkpoint validation, alert generation.

## E2E
Admin creates site → guard assigned → route configured → guard completes patrol → dashboard/report reflects result.

## Mobile
Permission denied, GPS unavailable, poor accuracy, camera denial, network loss, retry.

## Security
Cross-tenant access, privilege escalation, replay attempts, invalid QR, unauthorized scan submission.
