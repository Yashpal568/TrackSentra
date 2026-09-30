# GPS Architecture

## Capture
Guard client requests device/browser location after QR detection.

## Payload
latitude, longitude, accuracy, timestamp, checkpoint, patrol session, device/session reference.

## Validation
Backend calculates geodesic distance between submitted position and stored checkpoint coordinate.

## Rules
- Require acceptable accuracy.
- Use configurable radius.
- Record both measured distance and decision.
- Reject obviously invalid coordinates.
- Do not rely on client timestamps for authoritative ordering.
- Server receipt time is authoritative for audit ordering.

## MVP limitation
This is checkpoint-time location validation, not continuous background tracking.
