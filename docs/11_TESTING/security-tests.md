# Security Test Matrix

- Guard cannot access another guard's records.
- Company A cannot access Company B.
- Supervisor cannot perform admin-only actions.
- Deactivated guard cannot start patrol.
- Invalid/expired session is rejected.
- QR scan cannot bypass route sequence.
- Replay scan is rejected according to policy.
- Audit records cannot be modified through normal application APIs.
