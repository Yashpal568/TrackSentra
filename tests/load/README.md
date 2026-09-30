# Load Testing Strategy

## Target Environment
Load tests should only be executed against isolated **STAGING** environments. Do NOT run heavy concurrency load tests against Production.

## Execution
We use `k6` for load testing.

### Prerequisites
1. Install k6 (https://k6.io/docs/get-started/installation/)
2. Point to the correct environment via `API_URL`

### Running the Test
```bash
k6 run -e API_URL=http://staging.tracksentra.com/api tests/load/k6-load-test.js
```

### Metrics Monitored
- `requests/sec`
- `p50`, `p95`, `p99` latency
- `error rate`
- `HTTP status distribution`

### Stop Conditions
Tests will automatically abort if:
- Error rate exceeds 1% (`http_req_failed: ['rate<0.01']`)
- 95th percentile latency exceeds 500ms (`http_req_duration: ['p(95)<500']`)

### Execution Status
**BLOCKED** - Currently awaiting a formal staging environment to execute safe, non-destructive load tests. Local testing does not accurately reflect production MongoDB or Load Balancer behaviors.
