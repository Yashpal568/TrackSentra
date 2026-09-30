# GPS Security

Client GPS data is untrusted.

The backend must validate:
- coordinate format/range
- accuracy
- distance to checkpoint
- session/guard ownership
- event timing
- replay/duplicate patterns

Do not claim GPS is tamper-proof. The system should describe results as validation signals and retain evidence for audit.
