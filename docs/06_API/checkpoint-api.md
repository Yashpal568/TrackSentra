# Checkpoint API

GET /checkpoints
POST /checkpoints
GET /checkpoints/:id
PATCH /checkpoints/:id
POST /checkpoints/:id/rotate-qr
POST /checkpoints/:id/deactivate

QR rotation/revocation must invalidate the previous identity according to the configured policy.
