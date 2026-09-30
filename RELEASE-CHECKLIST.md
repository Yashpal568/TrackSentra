# TrackSentra Release Checklist

This checklist must be completed by the Release Owner before authorizing a deployment from Staging to Production.

## Phase 1: Pre-Deployment Checks
- [ ] Ensure all pull requests for the release milestone are merged into the `main` branch.
- [ ] Verify that CI/CD pipelines (Unit Tests, E2E Tests, Linting, Building) have passed on `main`.
- [ ] Verify that STAGING environment is fully operational and mirrors production code.
- [ ] Confirm no secrets (API keys, DB URIs) are hardcoded in the codebase.
- [ ] Ensure `NODE_ENV` is set to `production` in the target environment.
- [ ] Verify frontend `VITE_API_URL` points to the production API.

## Phase 2: Database & Infrastructure
- [ ] Create a manual database snapshot of the production MongoDB cluster prior to deployment.
- [ ] Verify that production SMTP credentials are active and verified by the provider.
- [ ] Ensure CORS policy on the backend `FRONTEND_URL` is configured accurately to the production domain.

## Phase 3: Deployment Execution
- [ ] Deploy Backend service via configured pipeline (e.g., ECS, Heroku, Render).
- [ ] Deploy Frontend static assets via configured CDN/Hosting (e.g., Vercel, Netlify, CloudFront).
- [ ] Validate `/api/health` endpoint responds with 200 OK.

## Phase 4: Post-Deployment Verification (Smoke Tests)
- [ ] Load the production marketing website. Ensure no console errors.
- [ ] Perform a test Company Registration (using a real email).
- [ ] Verify receipt of the verification email.
- [ ] Create a test Site, Guard, and Shift.
- [ ] Log in as the test Guard and perform a simulated QR Checkpoint scan.
- [ ] Verify the simulated scan appears in the admin Live Monitoring dashboard.

## Phase 5: Approval
- **Release Owner Name**: _______________
- **Date**: _______________
- **Status**: [ APPROVED / REJECTED ]
