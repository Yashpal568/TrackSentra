# Multi-Tenancy

The product is designed as a multi-tenant SaaS.

Tenant hierarchy:
Platform → Company → Site → Operational resources

Company data must be isolated logically through server-side authorization and query scoping.

Future enterprise options may include dedicated infrastructure, but MVP uses logical tenant isolation.
