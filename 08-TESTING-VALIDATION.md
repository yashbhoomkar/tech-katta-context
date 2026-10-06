# Testing and Validation

## Validation hierarchy

Tech Katta uses several different validation layers.

### 1. Frontend CI

GitHub Actions:
- npm ci
- npm run build

This proves the frontend compiles.

It does not prove:
- visual correctness
- touch behavior
- browser interactions
- mobile layout correctness

### 2. Backend syntax validation

CI runs:
- node --check src/server.js
- node --check src/db.js
- node --check src/seed.js

### 3. Deployment validation

Backend deployment verifies:
- systemd service active
- local API health
- overflow timer active

### 4. Public smoke tests

`scripts/production-smoke.mjs` tests:
- frontend home
- frontend unit route
- frontend article route
- API health
- API categories
- API articles
- canonical article endpoint
- regex-safe search
- invalid slug returns 404
- allowed CORS origin
- attacker CORS origin is not reflected
- security headers

The CI runner previously encountered TLS interception, so the smoke-test workflow uses:

`NODE_TLS_REJECT_UNAUTHORIZED=0`

This is a **test-runner workaround only**. It must never become a production setting.

## Known successful backend validation

A successful deployment/smoke-test sequence was previously recorded:
- backend deployment workflow succeeded
- dependencies installed
- syntax validation succeeded
- VPS service restarted
- local health passed
- public smoke tests passed
- security-header checks passed
- CORS checks passed

## Load testing

A k6 test was run against the production site.

The initial 50-VU / 30-second run did **not** measure API capacity correctly because API requests failed TLS validation:

`x509: certificate signed by unknown authority`

Observed metrics from that run included:
- ~913 requests
- ~27.75 requests/sec
- ~12.47 ms average HTTP duration
- ~18.27 ms p90
- ~24.18 ms p95
- ~29.46% failed

Those failure numbers must **not** be interpreted as API capacity because the API TLS problem affected the test.

The frontend itself had approximately 99.8% request/check success in that run.

Recommended k6 API test option for the test client:

```js
http.get(url, {
  insecureSkipTLSVerify: true,
  tags: { type: 'api' },
});
```

This is strictly a controlled load-test client setting.

## Recommended load-test progression

After fixing the test client:
1. 10 VUs
2. 50 VUs
3. 100 VUs
4. 500 VUs
5. 1,000 VUs

Measure:
- p50
- p95
- p99
- error rate
- throughput
- CPU
- memory
- active connections
- MongoDB latency
- MongoDB connection pool
- API saturation

Do not define capacity solely as "number of concurrent users".

## Browser testing

When a UI behavior changes, source inspection is not enough.

For mobile gestures, actual touch simulation/browser testing should verify:
- start/end coordinates
- navigation state
- sidebar state
- scroll containers
- vertical gestures
- short gestures
- history boundaries

If Vercel sandbox/browser access is unavailable, report the limitation.

## Testing rule

Never turn a static inference into a test result.

Use language such as:
- "source inspection indicates"
- "CI verified"
- "HTTP smoke test verified"
- "browser interaction verified"

rather than claiming all four mean the same thing.
