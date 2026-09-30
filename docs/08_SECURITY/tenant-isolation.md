# Tenant Isolation

Every company-owned record is scoped to companyId.

Never accept companyId from the browser as the authority. Derive tenant context from the authenticated identity and server-side membership.

All list/get/update/delete operations must enforce tenant ownership.

Add automated cross-tenant authorization tests before production.
