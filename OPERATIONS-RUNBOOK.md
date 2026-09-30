# TrackSentra Operations Runbook

## 1. Monitoring

### Application Logs
- **Backend Logs**: The Express backend uses `morgan` in dev and outputs standard stdout/stderr logs. In staging/production, pipe these to a centralized logging system (e.g., Datadog, AWS CloudWatch, ELK stack).
- **Health Endpoint**: Configure uptime monitoring tools (e.g., Pingdom, UptimeRobot) to ping `GET /api/health` every 1-5 minutes.

### Database Monitoring
- Use MongoDB Atlas built-in monitoring for CPU utilization, connection counts, and slow query tracking.
- Set alerts for connection spikes or sustained >80% CPU usage.

## 2. Backup and Restore

### Backup Schedule
- TrackSentra relies on MongoDB Atlas automated backups.
- **Staging**: Snapshot taken daily. Retention: 7 days.
- **Production**: Continuous cloud backups (Point-in-Time Recovery enabled). Retention: 30 days.

### Restoration Procedure
1. Navigate to MongoDB Atlas Dashboard.
2. Go to the targeted Cluster -> Backups.
3. Select "Restore" and choose the specific point-in-time or snapshot.
4. If restoring to a new cluster, update the backend `MONGODB_URI` environment variable and restart the Node.js server.

## 3. Common Incidents

### High API Latency or Timeout
- **Symptoms**: Frontend loads slowly, API requests timeout (504 Gateway Timeout).
- **Immediate Actions**: 
  1. Check MongoDB Atlas metrics for slow queries or high connection counts.
  2. Check backend server CPU/Memory. If maxed, horizontally scale API instances.

### Email Delivery Failure
- **Symptoms**: Users report not receiving verification or reset password emails.
- **Immediate Actions**:
  1. Check backend logs for SMTP connection errors.
  2. Verify SMTP credentials in the environment variables.
  3. Log into the SMTP provider dashboard (e.g., SendGrid) to check for bounces, blocks, or account suspension.

## 4. Escalation Guidance
- **Severity 1 (System Down)**: Ping the infrastructure team immediately via PagerDuty.
- **Severity 2 (Core Feature Broken - e.g. Patrolling)**: Alert the backend engineering team.
- **Severity 3 (Minor UI Glitch)**: File a Jira/Linear ticket for the standard sprint backlog.
