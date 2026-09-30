# Realtime Architecture

When a patrol event is accepted or an operational alert is created:
1. Persist event.
2. Emit domain event.
3. Publish to authorized company/site subscribers.
4. Update dashboard.
5. Create notification where configured.

Never emit data to unauthorized tenants.
