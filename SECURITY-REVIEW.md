# TrackSentra Security Review (M18)

## 1. Security Checks Performed
A practical application-level security and tenant isolation review was performed on the TrackSentra codebase. The review encompassed the following critical areas:
- Password hashing and authentication enforcement.
- Session architecture (JWT tokens + secure HttpOnly cookies).
- Cross-tenant authorization limits and Resource scoping.
- Rate limiting on public unauthenticated endpoints.
- Error handling and stack trace suppression in production.

## 2. Findings and Severity

### Finding 1: Tenant Isolation & RBAC
- **Severity**: Low (Informational)
- **Component**: Express Route Middleware / Controllers
- **Status**: **PASS**. 
- **Details**: All tenant resources (Sites, Guards, Shifts, Incidents, Reports, Tickets) are strictly isolated by evaluating `req.user.companyId`. Cross-tenant queries are actively prevented. RBAC tests successfully confirmed `GUARD` roles cannot access `COMPANY_ADMIN` functions.

### Finding 2: Password Storage
- **Severity**: Low (Informational)
- **Component**: `User.ts` Mongoose Schema
- **Status**: **PASS**. 
- **Details**: Passwords are appropriately hashed utilizing `bcryptjs`. Explicit checks ensure raw passwords are never returned in queries.

### Finding 3: Token Handling and Expiration
- **Severity**: Low (Informational)
- **Component**: Authentication Controller
- **Status**: **PASS**.
- **Details**: Access Tokens are short-lived. Refresh Tokens are stored securely in HttpOnly, Secure, SameSite=Strict cookies to defend against XSS. Logouts successfully revoke Refresh Tokens in the database.

### Finding 4: Endpoint Rate Limiting
- **Severity**: Low (Informational)
- **Component**: `rateLimiter.ts`
- **Status**: **PASS**.
- **Details**: Dedicated auth limits (`authLimiter`) are implemented across login, register, forgot-password, and reset-password endpoints to prevent brute forcing and enumeration.

### Finding 5: Generic Recovery Messages
- **Severity**: Low (Informational)
- **Component**: Forgot Password Controller
- **Status**: **PASS**.
- **Details**: Forgot password endpoints do not reveal whether an email exists in the system to prevent user enumeration attacks.

## 3. Remaining Risks
- **Hardware/Device Integrity**: The QR scanning model assumes guard devices are not spoofing GPS locations. Without advanced MDM (Mobile Device Management) app restrictions, guards can potentially mock GPS coordinates using developer tools.
- **DDoS Vulnerability**: While application-level rate limiting exists, network-level protection (e.g., Cloudflare, AWS WAF) is required before production deployment.

## 4. Tests Not Performed
- **Automated Penetration Testing**: No third-party automated scanner (e.g., Burp Suite Pro, Nessus) was run against a live infrastructure.
- **Dependency Vulnerability Scanning**: Deep automated audits on nested NPM dependencies via dedicated tooling (Snyk) have not been formally documented here, though standard updates were applied.
