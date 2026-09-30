import http from 'k6/http';
import { check, sleep } from 'k6';

// Configurable Options
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp-up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 min
    { duration: '30s', target: 0 },  // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api';

export default function () {
  // Public API Check
  const res = http.get(`${BASE_URL}/subscriptions/plans/public`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has plans': (r) => JSON.parse(r.body).plans !== undefined,
  });

  // Since authentication requires valid credentials and rate-limiting prevents 
  // brute forcing, complex authentication load testing should use a pre-generated 
  // pool of JWT tokens passed via __ENV variables.
  
  sleep(1);
}
