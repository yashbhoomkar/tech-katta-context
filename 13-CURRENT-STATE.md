# Current State Snapshot

**Snapshot date:** 2026-10-08

This file records the latest application/context state known to this session.

## Application repository

`yashbhoomkar/tech-katta`

Branch:
`main`

Current HEAD:
`102d23221272e861c5ac6ca76aecb08cd5aca5ab`

Latest backend work adds a private Vercel REST control layer:
- `193a11293b10d43534c34fa8b902d24dd12e6cac` — environment-authenticated Vercel client
- `102d23221272e861c5ac6ca76aecb08cd5aca5ab` — projects/deployments operations, CLI, and documentation

The client reads `VERCEL_ACCESS_TOKEN` and optional `VERCEL_TEAM_ID` from the environment. No Vercel credential is committed.

The application commits were recorded in the MongoDB backend commit ledger.

The Vercel API has not yet been token-authenticated from this ChatGPT runtime. The code is ready to run from a network-enabled trusted environment; do not describe live Vercel API execution as verified until it succeeds.

## Frontend

Production:
`https://tech.katta.cc`

Hosting:
Vercel.

Current production deployment known to this context:
`dpl_ChCm2jSLemuXxaqcNKGUBYFNB7xX`

State:
READY / production at the time it was recorded.

## Backend

API:
`https://tech-api.katta.cc`

VPS:
`129.121.133.47`

systemd:
`tech-katta-api`

Application path:
`/opt/tech-katta`

User:
`techkatta`

Health endpoint:
`/api/health`

Production version string:
`2026.10.05-production`

## Database

Application:
- Atlas project `tech-katta`
- cluster `Cluster0`
- DB `techkatta`

Ledger:
- DB `techkatta_history`
- frontend ledger: 152 docs observed
- backend ledger: 41 docs observed
- legacy/general `git_commits`: still exists

## Published content

Published:
- Distributed Systems Concepts
- Distributed System Components: An Overview
- Kafka Fundamentals

Upcoming:
- Kafka
- Cassandra
- ClickHouse
- RAG pipelines
- Solr
- Nginx
- Docker
- Kubernetes

## Current mobile feature

Latest behavior:
- home right swipe opens sidebar
- home left swipe does nothing
- article right swipe goes back
- article left swipe goes forward
- sidebar-open left swipe closes sidebar
- short/vertical gestures are ignored
- horizontally scrollable article regions are protected

## Current unresolved verification item

The mobile swipe feature has been source-inspected.

A full browser/mobile interactive verification should still be treated as pending unless performed by a browser/sandbox-capable session.

## Current infrastructure direction

VPS remains the primary backend.

Render overflow/failover is a planned architecture and has a disabled-by-default monitoring foundation, but it should not be described as live traffic overflow until the secondary service and proxy routing are actually configured and verified.

## Current known security gaps

- VPS origin exposure
- need for firewall/origin restriction
- need for stronger centralized monitoring
- need for tested backups/recovery
- in-memory rate limiter only
- no claim of full penetration testing

## Context maintenance

When a future session changes any of these facts, update this file and the relevant detailed file.


## Backend hardening phase 1 — current PR state (2026-10-11)

Application `main` remains at `102d23221272e861c5ac6ca76aecb08cd5aca5ab` until PR #1 is merged. The working branch is `refactor/backend-hardening-phase-1`, latest known head `333d7e42a11f2a50ae103cd19ce2e9e16f0c883f`.

PR: https://github.com/yashbhoomkar/tech-katta/pull/1 — open, not merged. The PR adds an extracted bounded process-local rate limiter, native Node tests, and backend CI; it also fixes a stale Vercel module path in the backend deployment workflow. A prior CI run passed at `c2c37bff7305a8e2aaf8cd793e2e0a7efe3668ed`; the final head's CI and mergeability must be verified. No VPS deployment from this PR has been confirmed.

Open validation item: verify that Express `trust proxy: 1` resolves the real client IP correctly through the deployed Cloudflare/reverse-proxy chain before treating rate-limit identity as production-verified.

### Phase-1 production outcome — 2026-10-11

Current application `main` and deployed VPS commit: `a9e340cc539519a91617d390a44e98bd0547046d`.

Backend CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128036905
VPS deployment and production smoke tests passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128036897

The deployment restarted `tech-katta-api`, reseeded 5 categories and 11 articles, confirmed `/api/health` returned `status: ok` and `db: connected`, verified the overflow timer, and passed 9 public endpoint checks plus CORS/security-header checks. Direct browser and load testing were not performed. Rate-limit client IP attribution through Cloudflare/reverse proxies remains a follow-up validation item.

The next planned backend phase is to correct database fallback semantics so a connected-but-empty or failing database is not silently represented as authoritative fallback content.

### Phase 2 production outcome — 2026-10-11

Current deployed application commit: `3155342dc66bdf1e001bbfc54749f63daf1e4062`.

Backend CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128191731
VPS deployment and public smoke tests passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128191751

Database fallback behavior is now explicit: local fallback is used only when MongoDB is known to be disconnected; successful empty results remain empty; missing articles return 404; and content-query failures return a generic 503 with `Retry-After: 5` and `Cache-Control: no-store`. MongoDB seeding completed and the public smoke suite passed.

Next planned phase: modularize the backend app/route structure while preserving the existing API contract and deployment behavior.

### Phase 3 candidate — route modularization

Production remains on `3155342dc66bdf1e001bbfc54749f63daf1e4062` until the next PR passes CI and is merged. Branch `refactor/backend-route-modules` currently points to `c0d19ec9403a6dc1deaa37ff0b56985dda6c61eb`.

This change extracts content routes into `backend/src/routes/content.js` and adds HTTP-level route tests using injected database dependencies. The application commit is recorded in MongoDB. PR/CI/production validation is pending; do not describe this change as deployed yet.

### Phase 3 production outcome — 2026-10-11

Current deployed application commit: `a806fab3f94a00172d55fafdb73ea9ca7dc71810`.

Backend CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128338279
VPS deployment and production smoke tests passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128338288

The content API handlers are extracted into `backend/src/routes/content.js`; `server.js` mounts the router and retains process lifecycle and health endpoints. HTTP-level tests cover the fallback/empty/error/missing-record semantics. No public API paths were intentionally changed.

Next: improve readiness/liveness semantics and operational observability without exposing sensitive diagnostics.

### Phase 4 candidate — readiness and request observability

Production remains on `a806fab3f94a00172d55fafdb73ea9ca7dc71810` until the next PR passes CI and is merged. Branch `feat/backend-readiness-observability` points to `6e77efb47d92897a92777bd47e9f9a2bc0384bc0`, recorded in MongoDB.

The candidate adds `/health/live`, `/health/ready`, generated `X-Request-Id` headers, structured request logs that exclude query strings, and two additional production smoke checks. CI/merge/deployment status is pending.

### Phase 4 production outcome — 2026-10-11

Current deployed application commit: `b8a705eec61af7deb7ca47ebd36d06025df2ad22`.

Backend CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128466934
VPS deployment and expanded production smoke tests passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128466902

The API now has distinct `/health/live` and `/health/ready` endpoints, generated request IDs, and structured request logs that omit query strings and client IPs. Legacy health endpoints remain compatible. Production smoke coverage is 11 endpoint checks plus CORS/security headers.

Next: review the production proxy trust/client-IP chain and origin exposure before claiming rate-limit attribution or origin isolation is fully hardened.

### Proxy/origin diagnostic candidate

Production remains on `b8a705eec61af7deb7ca47ebd36d06025df2ad22`. Branch `chore/inspect-vps-proxy-security` has two ledgered commits (`5de8af322b09619b2c6f11d27770af6e26ab38fd`, `a014eb19d0241b49ce2b4b3ce6530375b4fced7a`) adding a read-only SSH diagnostic workflow. It is not merged yet and has not changed VPS configuration. The intent is to verify the real proxy chain and firewall posture before any hardening changes.

### VPS security diagnostics — observed state (2026-10-11)

Read-only diagnostics succeeded: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128608567. The current production app remains `b8a705eec61af7deb7ca47ebd36d06025df2ad22`; the diagnostic workflow merge `a703011c9d84c34ee7cf640d1a8d84f2b2166b59` did not deploy application code.

Observed: Nginx and API service active; `tech-api.katta.cc` proxies to `127.0.0.1:5000`; XFF is `$proxy_add_x_forwarded_for`; Express trusts one hop; UFW default incoming policy is deny but 22/80/443 are allowed globally (IPv4 and IPv6); Node listens on `0.0.0.0:5000`.

Open security work: verify DNS is Cloudflare-proxied, then restrict 80/443 to official Cloudflare IPv4/IPv6 ranges and bind Node to loopback. Adjust Express trust hops only after the proxy chain and origin restriction are verified. Preserve SSH access until an alternate admin path is established.

### Cloudflare DNS verification candidate

Branch `chore/verify-cloudflare-dns` has commit `1d6b5e5b885226dfc37e1fb2ada68fcfad2a4dd7`, recorded in MongoDB. It extends the read-only diagnostic workflow to compare public API DNS answers against Cloudflare's live official IPv4/IPv6 ranges. No production configuration is changed. PR/run result is pending.

### Cloudflare range verification status

The first diagnostic attempt failed with HTTP 403 while fetching `www.cloudflare.com/ips-v4`, before any DNS addresses were printed. No VPS configuration was changed. Branch `fix/diagnose-cloudflare-dns-api` has ledgered commit `095eb973a467610b0e4b51bba3aaae5462ac7442`, which uses Cloudflare's official `/client/v4/ips` API and prints DNS answers before validating them. Rerun status is pending.

### Phase 5 candidate — loopback binding

Production remains on `b8a705eec61af7deb7ca47ebd36d06025df2ad22`. Branch `fix/backend-loopback-bind` contains ledgered commits `4d5bd7de22def2ef42b93aa2b400a38ce022a4a0` and `2fc4cf9f07c576c903e165a802edc2597d66d541`. It binds the Node service to loopback and verifies that deployment does not expose port 5000 on all interfaces. No firewall changes are included. Cloudflare DNS is currently direct-to-origin, so do not restrict 80/443 to Cloudflare until proxying is enabled and verified.

The loopback-binding PR's first revision had an invalid deployment workflow because the socket assertions were outside the SSH script block. This was caught before merge and fixed in ledgered commit `d41a420c7f973af3626d9de51cd16f34edf94166`. Validate the updated PR head before merging.

### Phase 5 production outcome — 2026-10-11

Current deployed application commit: `5e09088ba40b8060a81813e766202fcf4bb07884`.

Backend CI: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987182
VPS deployment and production smoke tests: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987352

Node binds only to `127.0.0.1:5000`; deployment asserts the loopback listener and rejects `0.0.0.0:5000`. The public smoke suite passed 11 endpoint checks plus CORS/security headers.

Security limitation: `tech-api.katta.cc` resolves directly to origin `129.121.133.47`; Cloudflare proxying is not active for this hostname. UFW allows 80/443 from all sources, and no firewall changes have been made. Enabling Cloudflare proxying requires a working Cloudflare DNS management path; only then should origin ingress be restricted to official Cloudflare ranges. SSH remains globally allowed to avoid accidental lockout.

### Phase 6 candidate — pagination and query indexes

Production remains on `5e09088ba40b8060a81813e766202fcf4bb07884` until the pagination PR passes CI and is merged. Branch `feat/backend-pagination-indexes` currently points to `41359ab7c5b5acaa65fa2e47565fa10236a56cba`.

The change adds opt-in pagination to `GET /api/articles`, stable slug ordering for paginated requests, a 100-item maximum limit, CORS-exposed pagination headers, and a compound `{ category: 1, slug: 1 }` index created by seeding. The default unpaginated response remains unchanged for the current frontend. CI/PR/deployment status pending.

## Session reconciliation — 2026-10-11

This session re-read `00-SESSION-BOOTSTRAP.md`, `12-OPERATING-RULES.md`, `11-MONGODB-COMMIT-LEDGER.md`, and the backend/architecture/deployment/security/testing/overflow notes. The key operating requirements are: inspect live source before each change; prefer small reversible changes; for every application commit, update the appropriate MongoDB ledger and this context repository; never claim a test that was not performed; and verify production before calling a deployment complete.

### Current application source of truth

Application `main`: `5e09088ba40b8060a81813e766202fcf4bb07884` (verified against GitHub after deployment). This is also the deployed VPS application commit from successful workflow https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987352. Backend CI passed at https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987182 and the smoke suite passed 11 endpoint checks plus CORS/security headers.

### Security state

The API Node process binds to `127.0.0.1:5000` and the deployment asserts that it is not exposed on `0.0.0.0:5000`. However, `tech-api.katta.cc` resolves directly to origin IP `129.121.133.47`, not a Cloudflare edge address. UFW currently allows ports 22, 80 and 443 from anywhere (IPv4 and IPv6). No firewall changes were made. Do not apply Cloudflare-only ingress restrictions until the DNS proxy state has been changed and independently verified. SSH must remain accessible during any later firewall work.

### Pagination proposal — paused, not deployed

PR #9 (`feat(backend): add opt-in article pagination and query indexes`) is closed without merging: https://github.com/yashbhoomkar/tech-katta/pull/9. Its branch candidate passed backend CI (16 tests on its then-current head), but the expanded public smoke script and final pagination edge cases were not verified against production. Application `main` and the VPS were not changed by the proposal. The two candidate application commits are present in `techkatta_history.backend_git_commits`; preserve them for history, but do not describe them as merged or deployed. Reopen a revised proposal only after a complete diff review, explicit tests for query filtering/counts/page bounds/fallback parity/CORS metadata, and a successful smoke test using a preview or local test service that supports pagination.

### Process correction

Earlier in this session, several PRs were merged quickly and context changes were appended across many files without first completing the full project-state reconciliation. This fell short of the intent of `12-OPERATING-RULES.md`, especially the source-first and one-change-at-a-time discipline. Future work should follow the mandatory sequence precisely: inspect current source and rollback point; make one coherent change; run the appropriate tests; commit application code; update the MongoDB ledger; update and commit context docs; deploy if required; verify; then record the actual outcome. Avoid another phase until the current proposal and documentation state are coherent.


## Backend clean-architecture phase 1 — candidate (2026-10-11)

Application commit: `7f669b872561c809ae8ae501d94d86e26f4473ff` on branch `refactor/backend-clean-architecture-phase-1`.
PR #10: https://github.com/yashbhoomkar/tech-katta/pull/10 — open as draft; not merged and not deployed.

This first structural step moves Express middleware and route assembly into `backend/src/app.js`, exported as an injectable `createApp()` factory. `backend/src/server.js` is reduced to environment loading, database connection startup, loopback listener startup, and graceful process shutdown. A new HTTP-level test covers app assembly, liveness/readiness, CORS, and security headers.

The existing API routes, response shapes, database behavior, and production deployment are intended to remain unchanged. Backend CI is pending at the time of this entry. This is an incremental refactor, not yet the full controller/service/repository architecture. Do not deploy until CI passes and the PR has been reviewed.


### Backend clean-architecture phase 1 — CI result

For application commit `7f669b872561c809ae8ae501d94d86e26f4473ff`, GitHub Actions backend CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38132846227. The job ran `npm ci` and `npm test`; all 17 tests passed, including the new app-construction HTTP test. PR #10 remains draft/open, and no VPS deployment or production smoke test was performed for this candidate. Production remains at `5e09088ba40b8060a81813e766202fcf4bb07884` until the refactor is reviewed, merged, and deployed through the normal workflow.


### Backend clean-architecture phase 2 — candidate (2026-10-11)

Application commit: `1219adb49f9b1235b7623de6fcbf23a4a45b688e`, on the same branch and draft PR #10: https://github.com/yashbhoomkar/tech-katta/pull/10.

The content API is now split into:
- `src/modules/content/contentController.js` — HTTP request/response mapping and safe 503 handling.
- `src/modules/content/contentService.js` — application-level article normalization and service operations.
- `src/modules/content/contentRepository.js` — MongoDB collection access and local fallback data access.
- `src/routes/content.js` — route registration and dependency wiring.

This is an incremental layered-monolith design, not microservices. Existing route paths, slug validation, regex escaping, fallback semantics, and response contracts are intended to remain intact. The new commit's CI run is queued/pending as of this update. No production deployment or public smoke test has been performed for this candidate. Production remains on `5e09088ba40b8060a81813e766202fcf4bb07884`.


### Backend clean-architecture phase 2 — CI passed

Latest application candidate: `1219adb49f9b1235b7623de6fcbf23a4a45b688e`. Backend CI passed at https://github.com/yashbhoomkar/tech-katta/actions/runs/38132969830. All 17 tests passed. Draft PR #10 has been updated to describe the app factory and controller/service/repository layers: https://github.com/yashbhoomkar/tech-katta/pull/10. The PR remains open and unmerged. No VPS deployment, production smoke test, load test, or browser test was performed for this candidate. Production remains at `5e09088ba40b8060a81813e766202fcf4bb07884`.


### Backend content-layer tests — CI passed (2026-10-11)

Application commit: `1c1ff5ce50a0556e955b34825b113cc1634ff4a5` on branch `refactor/backend-clean-architecture-phase-1`, draft PR #10: https://github.com/yashbhoomkar/tech-katta/pull/10.

Added `backend/test/contentLayers.test.js` to verify repository fallback behavior, search regex escaping and content projection, service-level content normalization without mutating source objects, controller filter forwarding, generic retryable 503 responses without leaking database details, and malformed-slug rejection before service invocation.

Backend CI passed on this exact commit: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133163151. All 23 tests passed. This remains CI-only validation; no production deployment, production smoke test, browser test, or load test was run. PR #10 remains draft/open and unmerged. Production stays at `5e09088ba40b8060a81813e766202fcf4bb07884`.


### Runtime configuration validation — CI passed (2026-10-11)

Application commit: `c9411681a0f940256c8999e22cfc85f01ed295a9`, branch `refactor/backend-clean-architecture-phase-1`, draft PR #10.

Added `backend/src/config.js` with immutable configuration parsing for `PORT` and `FRONTEND_ORIGIN`. Invalid ports fail startup; production requires an explicit frontend origin; frontend origins must be HTTP(S) origins without credentials or paths. `server.js` loads/validates config once and passes it into `createApp()`; app construction no longer reads environment variables directly. Added configuration unit tests.

Backend CI passed on this exact commit: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133257583. All 28 tests passed. This candidate remains in draft PR #10 and has not been deployed. No production smoke, browser, or load test was run for this candidate. Production remains at `5e09088ba40b8060a81813e766202fcf4bb07884`.


### MongoDB runtime configuration injection — CI passed (2026-10-11)

Application commit: `723a234193644d382c42a34494bb43c014924fac` on branch `refactor/backend-clean-architecture-phase-1`, draft PR #10.

Runtime config now includes `MONGODB_URI` and `MONGODB_DB` (database name defaults to `techkatta`). `server.js` passes these explicitly to `connectDB()`; the database module retains those connection options for reconnect attempts rather than independently re-reading environment variables on each retry. An absent URI still preserves the established local-fallback mode.

Backend CI passed on this exact commit: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133337413. All 28 tests passed. Candidate is not merged or deployed; production remains at `5e09088ba40b8060a81813e766202fcf4bb07884`. No production smoke/browser/load test has been run for the candidate.


### Central HTTP error boundary — CI passed (2026-10-11)

Application commit: `b4fd021f18a98ee77700455da8e7d6a4b98861ae` on branch `refactor/backend-clean-architecture-phase-1`, draft PR #10.

Added `src/errors.js` typed errors and `src/middleware/errorHandler.js` as the final Express error boundary. Content controllers forward failures instead of building error responses. The boundary returns JSON for unmatched routes (404), malformed JSON (400), content query failures (503 with Retry-After and no-store), and unexpected server errors (generic 500). Internal database error details are logged server-side and not returned to clients. Tests cover the shared error boundary and public response shapes.

Backend CI passed on this exact commit: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133451417. All 28 tests passed. Candidate is not merged or deployed; production remains at `5e09088ba40b8060a81813e766202fcf4bb07884`. Production smoke/browser/load verification has not been run for the candidate.
