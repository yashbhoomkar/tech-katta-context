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

### Vercel control-layer validation

The Vercel MCP server was locally protocol-tested with:
- `initialize`
- `tools/list`

The server returned a valid JSON-RPC handshake and all six declared Vercel tools.

This does **not** prove:
- the supplied Vercel token is valid
- the token has access to the team scope
- the Vercel REST API is reachable from the runtime
- a real Vercel deployment was successfully inspected through the new MCP

The current environment could not resolve/reach `api.vercel.com`, so token-authenticated remote execution remains pending.

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


## Backend hardening phase 1 validation (2026-10-11)

PR: https://github.com/yashbhoomkar/tech-katta/pull/1.

New native Node test cases cover allowed requests and headers, 429/`Retry-After`, window expiry, and bounded bucket count. `.github/workflows/ci-backend.yml` runs `npm ci` and `npm test` on backend-related PRs and pushes to `main`.

A CI run on commit `c2c37bff7305a8e2aaf8cd793e2e0a7efe3668ed` completed successfully. The branch subsequently changed the backend deployment workflow at `333d7e42a11f2a50ae103cd19ce2e9e16f0c883f`; its CI result must be verified independently. No production deployment or production smoke test has yet been confirmed for this PR.

### Final phase-1 deployment verification — 2026-10-11

- Backend CI push run passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128036905
- VPS deployment and public smoke run passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128036897
- Deployment steps confirmed SSH update to `a9e340cc539519a91617d390a44e98bd0547046d`, dependency installation, syntax checks, MongoDB seeding, systemd service active, local `/api/health` returning `status: ok` and `db: connected`, overflow timer active, and public smoke tests passing (9 endpoints + CORS + security headers).
- This is CI plus production smoke-test verification; it is not a full browser test, load test, or security assessment.

## Phase 2 — database fallback semantics (2026-10-11)

New tests cover: fallback only when disconnected, empty database results remain authoritative, query errors propagate instead of using fallback, and missing-record results remain `null` for route-level 404 handling.

- Backend CI: passed — https://github.com/yashbhoomkar/tech-katta/actions/runs/38128191731
- VPS deployment and production smoke tests: passed — https://github.com/yashbhoomkar/tech-katta/actions/runs/38128191751

The production smoke suite checks normal API behavior; it does not inject MongoDB query failures or simulate Atlas outages.

## Content-route modularization tests in progress (2026-10-11)

Branch `refactor/backend-route-modules`, commit `c0d19ec9403a6dc1deaa37ff0b56985dda6c61eb` adds HTTP-level tests for disconnected fallback, connected-but-empty database results, generic 503 behavior on query errors, and 404 for a missing database article. These tests use an ephemeral local Express server and injected fake database dependencies; they do not require production Atlas credentials. CI/PR validation is pending at this point.

## Phase 3 — route modularization (2026-10-11)

The extracted content router is exercised over HTTP using Node's native `fetch` and an ephemeral Express listener. Tests cover disconnected fallback, authoritative empty results, generic 503 on database query failure, and 404 for a missing article.

- Backend CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128338279
- VPS deployment/public smoke tests passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128338288

No browser UI behavior changed. This is not a load test or a full failure-injection suite.

## Readiness/observability test candidate (2026-10-11)

Commit `6e77efb47d92897a92777bd47e9f9a2bc0384bc0` adds tests for liveness while disconnected, readiness status for connected/disconnected database states, and request-ID/structured-log behavior including a check that query parameters are not logged. Production smoke tests now include `/health/live` and `/health/ready`. Branch `feat/backend-readiness-observability`; CI is pending.

## Phase 4 verification — 2026-10-11

The test suite passed with 16 tests on the PR head. The merged push CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128466934. VPS deployment and expanded public smoke tests passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128466902. New tests verify liveness, readiness for connected/disconnected DB states, request ID generation, structured logging, and query-string exclusion. The production smoke suite now covers 11 endpoint checks plus CORS and security headers.

## Loopback binding candidate validation (2026-10-11)

Branch `fix/backend-loopback-bind` updates the production deployment script to require `127.0.0.1:5000` and fail if `0.0.0.0:5000` is present. Public smoke tests will continue to verify the API through Nginx. The DNS diagnostic workflow will warn rather than stop before SSH diagnostics if public DNS is not Cloudflare-proxied. Commits `4d5bd7de22def2ef42b93aa2b400a38ce022a4a0` and `2fc4cf9f07c576c903e165a802edc2597d66d541` are ledgered; PR validation pending.

### Loopback deployment workflow validation note

GitHub identified an invalid deployment workflow on the unmerged branch after the first socket-check insertion. The issue was indentation only; commit `d41a420c7f973af3626d9de51cd16f34edf94166` corrects the YAML script block. Verify the updated PR and main-branch deployment before considering this change complete.

## Phase 5 loopback security verification — 2026-10-11

- Backend CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987182
- VPS deployment passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987352
- Deployment asserted that the API listens on `127.0.0.1:5000` and does not listen on `0.0.0.0:5000`.
- Production smoke suite passed: 11 endpoint checks + CORS + security headers.
- Read-only diagnostics confirmed public API DNS is direct-to-origin, so no Cloudflare-only firewall restriction was applied.

## Pagination candidate tests (2026-10-11)

The current candidate adds HTTP-level tests for stable page ordering, page metadata headers, and invalid page/limit rejection. The production smoke suite also checks `page=1&limit=5` and that pagination headers are exposed through CORS. Commits `56d6a79b3f9d1c65ea0e152faaa98d673043cf3a` and `41359ab7c5b5acaa65fa2e47565fa10236a56cba` are recorded in MongoDB; PR CI pending.