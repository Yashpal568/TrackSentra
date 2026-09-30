# Complete Product Requirements Document

## 1. Objective
Build a production-grade multi-tenant Security Patrol Management SaaS.

## 2. Core user journey
1. Company admin creates a site.
2. Admin creates guards.
3. Admin creates shift.
4. Admin creates patrol route.
5. Admin creates checkpoints and assigns unique QR identities.
6. Guard logs in.
7. Guard starts assigned patrol.
8. Guard scans checkpoint QR.
9. Browser/app obtains location.
10. Backend validates the event.
11. Dashboard receives activity.
12. Guard continues in configured sequence.
13. Completion creates a patrol-completed event.
14. Exceptions create alerts.
15. Management can inspect reports and audit history.

## 3. Functional requirements

### Company
- Create/update company profile.
- Manage sites.
- Manage company users.
- View organization-level metrics.

### Site
- Create site.
- Configure site timezone.
- Configure geofence defaults.
- Assign guards and routes.

### Guard
- Create/activate/deactivate guard.
- Assign site and shift.
- Assign route eligibility.
- View patrol history.

### Shift
- Define start/end time.
- Define patrol frequency.
- Define grace periods.
- Assign guards.

### Patrol route
- Name route.
- Configure ordered checkpoints.
- Configure expected duration.
- Configure route-specific rules.

### Checkpoint
- Unique checkpoint ID.
- Physical location.
- Latitude/longitude.
- Allowed radius.
- QR identity.
- Active/inactive status.
- Optional notes/photo reference.

### Patrol session
- Start timestamp.
- Guard.
- Site.
- Route.
- Expected checkpoints.
- Scan events.
- Completion status.
- Exceptions.

### Scan event
Store:
- guard
- company
- site
- patrol session
- checkpoint
- timestamp
- latitude
- longitude
- accuracy
- device/session metadata
- sequence position
- validation result
- rejection reason when applicable

### Alerts
Support:
- missed checkpoint
- late checkpoint
- missed patrol
- invalid sequence
- GPS outside radius
- poor GPS accuracy
- duplicate/replay scan
- emergency alert

### Reports
- patrol completion
- checkpoint compliance
- guard performance
- missed/late patrols
- exception history
- audit logs
