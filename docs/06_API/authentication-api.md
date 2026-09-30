# Authentication API

POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password

Authentication responses must not expose secrets. Refresh-token storage and rotation must follow the selected security architecture.
