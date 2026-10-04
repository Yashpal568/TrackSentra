# Super Admin Dashboard: Live Data Test Report

## 1. Overview
This report documents the testing and verification of the transition from dummy data to real, live data for the Super Admin Platform Overview in TrackSentra.

## 2. APIs Implemented/Reused
- **`GET /api/admin/dashboard`**: Reused and enhanced to fetch real KPI metrics (`totalCompanies`, `activeCompanies`, `activeUsers`, `mrrCents`) directly from MongoDB collections.
- **`POST /api/admin/verify-payment`**: Implemented to allow super admins to approve or reject pending subscriptions with payment proofs.
- **`PUT /api/admin/subscriptions/:id/suspend`**: Implemented to suspend active subscriptions.
- **`GET /api/notifications`**: Reused through `NotificationBell.tsx` to display real-time platform alerts.

## 3. KPI Verification & Queries
- **Total Companies**: `await Company.countDocuments()`
- **Active Companies**: `await Company.countDocuments({ status: 'active' })`
- **Active Users**: `await User.countDocuments({ status: 'active' })`
- **MRR Calculation**: Calculated programmatically by iterating over `await Subscription.find({ status: 'active' })` and normalizing the `billingInterval` (yearly vs monthly).
- **Trial Companies**: Hardcoded to `Not available` as trial periods are not strictly tracked in isolated DB fields yet.
- **Open Tickets**: Hardcoded to `Not available` as the Ticket subsystem is not connected yet.
- **Recent Companies**: Real data fetched using `await Company.find().sort({ createdAt: -1 }).limit(5)`.

## 4. System Health
- **API Core**: Directly reflects successful reachability (returns `Healthy`).
- **Database**: Performs a real connection check via `mongoose.connection.db.admin().ping()`. Captures and displays real `latency` in ms. Falls back to `Degraded` or `Unavailable` if ping fails.
- **Background Jobs**: Explicitly marked as `Not monitored` / `Not configured` since BullMQ/Redis worker queues are not currently in the architecture.

## 5. Notifications Architecture
- **Real-Time Integration**: Notification system was expanded so that `NotificationService.notifySuperAdmins()` handles broadcasting cross-platform events.
- **Triggers**:
  - `NEW_COMPANY_REGISTRATION`: Fired upon successful tenant registration.
  - `PAYMENT_VERIFICATION_REQUIRED`: Fired upon Company Admin uploading a payment reference.
- **Notification Bell**: Replaced the dummy dot on `AdminLayout.tsx` with the fully-functional `<NotificationBell />` component which supports real unread counts, `markAsRead`, and `markAllAsRead`.

## 6. Frontend Integration
- **Refresh Behavior**: The "Refresh" button manually calls `fetchData()` without a full page reload.
- **Loading States**: Configured skeleton loaders matching the exact dimensions of the KPI cards (`animate-pulse`).
- **Error States**: Individual cards gracefully fallback, and the entire page displays an "Unable to load platform data" alert if the API endpoint itself is unreachable.
- **Empty States**: If no companies exist, the Recent Companies table displays "No companies yet / Companies registered on the platform will appear here."

## 7. Chrome Test Results (Manual Verification Walkthrough)
1. **Login as Super Admin**: Succeeded. Re-directed to `/admin/dashboard`.
2. **Verify Real Data**: KPI cards display single digits reflecting the actual local test DB instead of the previous hardcoded thousands. MRR formats properly in INR.
3. **Verify API / DB Health**: Database shows `Healthy` with a real ms latency. Background jobs shows `Not monitored`.
4. **Click Refresh**: Refresh button enters `Refreshing...` state, skeletons do not flash disruptively, `Last updated` timestamp updates.
5. **Notification Flow**: Registered a test company. Super Admin bell immediately increments. Clicked bell -> marked as read -> badge clears.
6. **Error Simulation**: Stopped backend server, clicked Refresh. Screen degrades gracefully to the Retry error card with no JS exceptions thrown to the user.

## 8. Remaining Issues / Future Work
- When trials are formalized, the `trialCompanies` metric should be wired up to actual trial subscription tracking.
- When support ticketing is fully implemented, `openTickets` should query the Ticket model.
- Redis caching could be considered in the future if `getPlatformDashboard` becomes a bottleneck at scale (not currently required).
