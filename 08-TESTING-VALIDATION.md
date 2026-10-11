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

## Issue #18 regression coverage — PR #20

- Added bind-host configuration assertions (aa13f8fa9f2e18397bbe8e6270df3c3242089f2b).
- Added a regression test proving /api/health remains 200 after the public rate-limit bucket is exhausted (b612091b28d6a90da8f422e991bb2d8a5bfe8c9f, corrected by d40929e580571d5600066d521de08f9f75eb7deb).
- Backend CI and frontend build both passed on PR #20's latest head; CodeQL was still running at the time of this update.
- No Docker container runtime test, live TLS deployment test, offline browser fallback test, or production deployment has been performed for PR #20.


### PR #20 validation result — 2026-10-11

PR #20 merged as 56b229a2c0fa1d586f200a41c79826ed92a0446b after Backend CI, Frontend CI build, and CodeQL all passed on PR head a66c7a88eb7a516c25c7bebfb973c24689179a24. Tests include safe bind-host configuration and health endpoint availability after the public rate-limit bucket is exhausted. Docker runtime, offline browser fallback, production deployment, and post-deploy smoke testing remain unverified.


### PR #20 final validation — 2026-10-11

Merge commit 56b229a2c0fa1d586f200a41c79826ed92a0446b passed Backend CI (https://github.com/yashbhoomkar/tech-katta/actions/runs/38137022003), Frontend CI build (https://github.com/yashbhoomkar/tech-katta/actions/runs/38137021910), and CodeQL (https://github.com/yashbhoomkar/tech-katta/actions/runs/38137021951). VPS deployment and production smoke passed (https://github.com/yashbhoomkar/tech-katta/actions/runs/38137021953): content sync succeeded, local health was DB-connected, and 11 endpoint checks plus CORS/security headers passed under standard TLS validation.

Still not verified: actual mobile gesture interaction, offline/API-failure Kafka fallback in a browser, Docker runtime networking, Vercel live deployment state, full-capacity load, Cloudflare/Nginx IP attribution, and overflow routing.


## Issue #18 fixes — CI validation record (2026-10-11)

- PR #19: frontend CI build and CodeQL passed on head a1f3b3a803779f5082e3f8a37d65137dd10fc38e; merge 62c4b3ee59a99a57ec98ad221a34d38f37953eb2. Actual touch-device swipe test not performed.
- PR #20: backend CI and CodeQL passed on corrected backend test commit d40929e580571d5600066d521de08f9f75eb7deb. Vercel status passed on the later PR head and merge 56b229a2c0fa1d586f200a41c79826ed92a0446b. The first backend run failed due to an incorrect test sequence; the test was corrected to send enough public requests to exhaust the configured rate limit before checking health, and the rerun passed.
- Post-merge production deploy status and live API smoke tests are not yet verified in this record.


### Post-merge deployment state (2026-10-11)

- Vercel production deployment for main commit 56b229a2c0fa1d586f200a41c79826ed92a0446b reports READY and includes alias tech.katta.cc.
- This is production frontend deployment evidence. The VPS backend deploy workflow result and post-merge live API health have not yet been independently verified, so do not describe the backend as deployed/healthy based solely on Vercel status.


### PR #21 validation record (2026-10-11)

PR #21 (`9bc56bf28f5005aff71e5e1dac8ff710fd386e5e`) changes the backend deploy workflow to disable the placeholder overflow timer and assert that it is inactive. The PR's CodeRabbit and Vercel status checks reported success, but no submitted CodeRabbit review or inline review thread was present when checked. These checks do not independently validate the live VPS timer state. Verify the merge-triggered deployment job, its service health check, timer-inactive assertion, and public production smoke tests before marking this operational finding complete. No load/stress test was run as part of this change.


### Overflow timer disablement — production validation (2026-10-11)

Deployment run https://github.com/yashbhoomkar/tech-katta/actions/runs/38139715132 passed for `9bc56bf28f5005aff71e5e1dac8ff710fd386e5e`. Verified from workflow logs: timer disable/stop command ran; `tech-katta-api` was active; local health returned `status=ok`, `db=connected`; listener checks passed; public production smoke suite passed 11 endpoint checks plus CORS/security headers. No stress test was part of this deployment.


### Semgrep Community Edition baseline (2026-10-11)

Application PR #22 merge commit `a39d441c8364efc65bfa4f14f944d34cd9e07cff` added `.github/workflows/semgrep.yml`. Run https://github.com/yashbhoomkar/tech-katta/actions/runs/38140326189 passed, scanning 40 JavaScript/Node/React files with 68 rules and reporting 0 findings. SARIF upload to GitHub code scanning succeeded. CodeQL run https://github.com/yashbhoomkar/tech-katta/actions/runs/38140326154 also passed. This is a static-analysis baseline only; it does not replace code review, tests, browser checks, or load tests.


### k6 production baseline results (2026-10-11)

Run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38140625020 — success.

- Duration: 50 seconds; max 5 VUs for frontend browsing and 1 VU for API reads.
- Total: 156 HTTP requests (127 frontend, 29 API), 0 HTTP failures, 312/312 checks passed.
- Frontend p95: 142.67 ms; API p95: 244.61 ms.
- No 429, 5xx, network failures, or threshold failures were reported.
- The API scenario sleeps 1.5 seconds between requests; this deliberately stays below the current per-client rate limit.

Interpretation: this validates a low-load production baseline only. It does not estimate maximum concurrent users or establish stress/capacity limits. A true saturation test requires a staging/test origin or a separately approved, isolated test environment.


### Vercel client consolidation validation (2026-10-11)

PR #24 merge commit `efbc810f08f210e83cff41415280c1a0aaffc8c6` passed Backend CI (https://github.com/yashbhoomkar/tech-katta/actions/runs/38141089657), Semgrep, CodeQL, and VPS deployment (https://github.com/yashbhoomkar/tech-katta/actions/runs/38141089672). The deployment workflow syntax-checked the canonical Vercel client and active adapters, restarted the API, verified local health, and passed the 11-endpoint public smoke suite plus CORS/security headers. This validates the cleanup/deployment, not token-authenticated Vercel API calls.


## Mobile swipe regression browser test — PR #25 (2026-10-11)

PR #25 (`e1f35b765015f182d32aaf645c4c4eb8387f5936`) adds mobile viewport/touch-event checks to the existing Playwright workflow and fixes home left-swipe forward-history navigation. Successful run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38142409155.

The workflow built the PR frontend, served the build locally, and used Chromium with `isMobile: true` and `hasTouch: true` to simulate:
- home right swipe opens the sidebar;
- home left swipe does not navigate, including when a forward-history entry exists;
- article right swipe navigates back and left swipe navigates forward;
- short and mostly vertical swipes are ignored;
- left swipe closes the open sidebar without changing route.

The same run passed the three public SPA route checks and the browser-origin API/CORS contract. Frontend CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38142409162. Semgrep passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38142409170. CodeQL passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38142409178.

Evidence boundary: touch events were simulated in Chromium, not tested on a physical mobile device. This is browser-level regression coverage, not device certification.


## CodeRabbit review configuration — PR #26 (2026-10-11)

Application PR #26 added `.coderabbit.yaml` and merged as `acbc81423a7da3f6e163462ee0667c4ed0aa35ae`. The config enables automatic reviews of non-draft PRs targeting `main` and supplies targeted instructions for backend/security, React/mobile behavior, tests, scripts, and GitHub Actions. The configuration and merge are recorded in `techkatta_history.backend_git_commits`.

**AI-review status remains unverified.** On PR #26, the GitHub review API and inline review-comment API were empty. A manual `@coderabbitai review` request produced no CodeRabbit response or check; the only check observed was Vercel Preview Comments. Therefore, do not claim that CodeRabbit reviewed PR #26 or that the repository has an operational AI review gate. The GitHub app must be installed/authorized for this repository and then tested on a new PR. Continue to distinguish AI review from Semgrep, CodeQL, frontend/backend CI, browser smoke tests, and load tests.


## Structured diagram normalization regression — PR #27 (2026-10-11)

PR #27 (`90ac43818fc34c61dfd7fdcae3baf62f83310350`) passed backend CI (31 tests, 31 passed, 0 failed), CodeQL, and Semgrep. Backend deployment succeeded: https://github.com/yashbhoomkar/tech-katta/actions/runs/38142984733. Production smoke tests passed 11 endpoint checks plus CORS and security headers. The deploy workflow synchronized the changed content source to Atlas; a read-only follow-up query confirmed the live article block is the explicit `distributed-architecture` diagram.

This validates the content-source update and deployment path; it is not a stress/capacity test.


## Audit evidence and open follow-ups (2026-10-11)

- PR #25 mobile gestures: simulated touch tests passed in Chromium; no physical device test was available.
- PR #27 structured diagram normalization: backend CI passed 31/31 tests, CodeQL and Semgrep passed, VPS deployment succeeded, and 11 endpoint smoke checks plus CORS/security headers passed.
- PR #26 CodeRabbit config: configuration is merged, but no substantive AI review was observed; follow-up issue #30 tracks activation and verification.
- Issue #28 tracks the pending Cloudflare/origin cutover; issue #29 tracks future failover once a secondary upstream exists; issue #31 tracks search scalability while preserving substring semantics.

These are distinct evidence types: static analysis, unit/CI checks, browser-emulated interaction tests, production smoke checks, low-load baseline, and future capacity/failover validation must not be conflated.


## k6 capacity-test boundary (2026-10-11)

The existing production k6 run is a low-load baseline only: 156 requests in about 50 seconds (~3.05 req/s), zero HTTP/network errors, thresholds passed. It does not establish stress limits or maximum user capacity. Follow-up issue [#33](https://github.com/yashbhoomkar/tech-katta/issues/33) tracks a bounded, monitored capacity test, preferably on staging, with explicit stop conditions. No unbounded production bot swarm was run.

## Forwarded-IP rate-limit regression test — PR #34 (2026-10-11)

Application PR #34 merged as `16bf385f1f62dbea5d11d38fed64028e99ca7a95` (test commit `fba34153e673e4b72db7e546f7169a1296174189`). The new isolated HTTP integration test simulates the current one-hop proxy chain by supplying an attacker-controlled leftmost `X-Forwarded-For` value and an Nginx-appended rightmost peer address. Changing only the leftmost value remains in the same rate-limit bucket; changing the rightmost peer address creates a separate bucket.

- Backend CI: https://github.com/yashbhoomkar/tech-katta/actions/runs/38143817699 — passed.
- Semgrep: https://github.com/yashbhoomkar/tech-katta/actions/runs/38143817744 — passed.
- CodeQL: https://github.com/yashbhoomkar/tech-katta/actions/runs/38143817712 — verify final status before marking complete.
- VPS deployment and production smoke: https://github.com/yashbhoomkar/tech-katta/actions/runs/38143817747 — deployment passed, 11 endpoint checks plus CORS/security headers passed.

**Evidence boundary:** this test simulates the header chain inside an isolated Express test server. It does not execute through live Nginx, does not validate a Cloudflare-proxied request, and does not complete issue #28. No DNS, Nginx, or firewall change was made.
