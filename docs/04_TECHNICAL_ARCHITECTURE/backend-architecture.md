# Backend Architecture

Recommended structure:
- config
- middleware
- modules
- controllers
- services
- repositories/data access
- validators
- policies
- events
- jobs
- notifications
- utils

Controllers remain thin. Domain/business rules live in services/policies.
