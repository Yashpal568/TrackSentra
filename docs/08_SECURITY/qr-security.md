# QR Security

QR codes identify physical checkpoints; they are not authentication credentials.

Mitigations:
- authenticated guard required
- route/session validation
- sequence validation
- GPS validation
- server timestamp
- replay/duplicate detection
- QR rotation/revocation
- audit logging

A photograph of a QR should not be sufficient to produce a valid patrol event from an unrelated location.
