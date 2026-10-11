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


### Request parsing and shared error boundary hardening — CI passed

Application commit: `e08dae0345100ba3ccc8b7efbd8690db1644cfbf`, draft PR #10.

- Request IDs and structured request logging now run before JSON body parsing, so malformed and oversized bodies are observable.
- The shared error handler returns JSON 400 for malformed JSON and JSON 413 for bodies exceeding the existing 50 KB limit.
- Added integration assertions for request IDs on parser failures and for the oversized-body response.

CI passed on this exact commit: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133527724 — 28/28 tests passed. PR #10 remains draft/open, unmerged and undeployed. Production remains at `5e09088ba40b8060a81813e766202fcf4bb07884`; no production smoke/browser/load test was run for this candidate.


### Backend documentation and environment example — CI passed

Application commit: `3e57fc39d0f23ca6a71e604be3d0e7290a74f995`, draft PR #10.

Added `backend/README.md` documenting the layered monolith, request flow, module responsibilities, error/fallback behavior, health endpoints, local development, and operational constraints. Updated `backend/.env.example` to distinguish Node's `PORT` from Docker Compose's host-side `BACKEND_PORT`, and document `MONGODB_URI`/`MONGODB_DB` without credentials. Updated the root README to describe the current production topology rather than the stale planned architecture.

Latest backend CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133683299. All 28 tests passed. PR #10 remains draft/open and has not been merged or deployed. Production remains at `5e09088ba40b8060a81813e766202fcf4bb07884`.


### Rate limiting before JSON parsing — candidate (2026-10-11)

Application commit: `ca69308663ec007bc5c0c7275510872dc8cff7a9` on the existing draft PR #10 branch. The request pipeline now assigns a request ID, serves liveness/readiness probes outside the public limiter, applies the rate limiter, and only then parses JSON. This closes a bypass where malformed/oversized JSON could cause the parser to short-circuit routing before rate-limit middleware. Added a regression test: a malformed JSON request consumes the request's rate-limit slot, and the next public request receives 429.

MongoDB ledger entry recorded in `techkatta_history.backend_git_commits`. CI status at documentation time: running at https://github.com/yashbhoomkar/tech-katta/actions/runs/38133934601. Do not merge/deploy until CI completes and CodeRabbit review findings are checked. Production remains at `5e09088ba40b8060a81813e766202fcf4bb07884`.


### Deployment safety: skip seed for code-only releases — candidate (2026-10-11)

Application commit: `ca0df6f1b50a1cddcb56fc9711f2f4f6c530e7f2` on draft PR #10. The existing deploy workflow seeded MongoDB on every backend deployment, even when no content changed; the seed script upserts article/category documents and can delete the legacy slug. The workflow now compares the pushed commit range and runs the seed only when content source/schema/seed files change. A manual `workflow_dispatch` input `sync_content=true` permits an explicit sync. Checkout now fetches full history so the change-range comparison is available.

Application commit recorded in MongoDB `techkatta_history.backend_git_commits`. Backend CI for this workflow-only change is pending. The refactor remains unmerged and undeployed; do not treat workflow logic as production-verified until it has run in GitHub Actions.


### Candidate CI result — 29 tests passed (2026-10-11)

Latest application head: `ca0df6f1b50a1cddcb56fc9711f2f4f6c530e7f2`. Backend CI passed on this head: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134049543 — `npm ci` succeeded and all 29 tests passed (0 failures). The PR is now marked ready for review; CodeRabbit has been asked to review this exact head. No production deployment or production HTTP smoke test has run. Production remains at `5e09088ba40b8060a81813e766202fcf4bb07884`.


### PR #10 merged; production deployment running (2026-10-11)

Merged `refactor/backend-clean-architecture-phase-1` into `main` via merge commit `a1dcc18ec649bc8c1d36ff491043d45b26de1b5d`. Merge commit recorded in MongoDB `techkatta_history.backend_git_commits`. The merge triggered GitHub Actions workflow `Deploy Backend to VPS` run https://github.com/yashbhoomkar/tech-katta/actions/runs/38134143493 and main-branch Backend CI run https://github.com/yashbhoomkar/tech-katta/actions/runs/38134143426. Both were in progress at the time of this entry. Do not mark production verified until the VPS deploy, content-sync decision, local health checks, and production smoke tests complete successfully.


### Deployment blocked: systemd configuration step failed (2026-10-11)

Merge `a1dcc18ec649bc8c1d36ff491043d45b26de1b5d` is on GitHub `main`, and the VPS deploy workflow fetched it and installed production dependencies. The SSH script then exited with status 1 immediately after logging `Enforcing production runtime configuration...`, before content-sync decision, service restart, or production smoke tests. Rerunning the job reproduced the same failure. Deployment run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134143493. Do not claim the refactored service is live.

Created hotfix PR #11 https://github.com/yashbhoomkar/tech-katta/pull/11 at commit `6d9fe2653a578fc51e73080ac606c0354c4ff084` to make sudo/systemd configuration failures explicit and diagnostic. This application commit is recorded in MongoDB `techkatta_history.backend_git_commits`. Next: inspect PR #11, merge the diagnostics, rerun deployment, and only report success if local health + public production smoke checks pass.


### Deployment diagnostics hotfix merged; retry running (2026-10-11)

PR #11 merged as `7a43a798407861b0a8f4b3fc9826da0a2b7f9581`, recorded in MongoDB `techkatta_history.backend_git_commits`. The deployment workflow is retrying with explicit non-interactive sudo checks and step-specific systemd diagnostics: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134334813. Wait for the SSH step output before deciding whether the issue is sudo authorization, directory/write permissions, or systemd reload. Production smoke verification remains pending.


### Deployment content-sync handoff fix merged (2026-10-11)

PR #12 merged as `cf0c9851934eb3cb8603a1e63a35109f4f9d8fb2`, recorded in MongoDB `techkatta_history.backend_git_commits`. The SSH action no longer relies on remote environment forwarding for `CONTENT_SYNC_REQUIRED`; it interpolates the validated `true/false` output directly into the remote script and logs the selected path. This addresses the likely point of failure after the systemd configuration step, where the prior workflow exited before the content-sync branch log.

New deployment run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134427671 (in progress at time of entry). Wait for explicit `Content sync required: false`, service restart, local health checks, and public production smoke tests before marking the deployment complete.


### Deployment workflow split merged; new deployment running (2026-10-11)

PR #13 merged as `9d545de3c6e2048dd851bb43a8782bf388544486`, recorded in MongoDB `techkatta_history.backend_git_commits`. The deploy workflow now uses three explicit SSH steps: prepare checkout/dependencies/runtime config, optionally seed content only when GitHub Actions says sync is required, and restart/verify the API. The remote SSH script no longer evaluates the content-sync conditional itself.

Deployment run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134546986 (in progress at time of entry). Confirm the prepare step completes, the content-sync step is skipped for this code-only change, the restart/local health/socket checks pass, and the public smoke tests pass before declaring production healthy.


### Production deployment verified — backend refactor live (2026-10-11)

The deploy workflow completed successfully for main commit `9d545de3c6e2048dd851bb43a8782bf388544486`: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134546986. VPS preparation and runtime configuration succeeded; the optional MongoDB content-sync step was skipped because this was a code-only release, so the deploy did not reseed article/category documents. The API restarted successfully and local health returned `{"status":"ok","service":"tech-katta-api","version":"2026.10.05-production","db":"connected"}`. Production smoke tests passed: 11 endpoint checks plus CORS and security-header assertions.

Main-branch backend CI also passed on merge commit `a1dcc18ec649bc8c1d36ff491043d45b26de1b5d`: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134143426. This establishes CI + VPS deployment + HTTP smoke validation. A real browser/E2E test and load/stress test have not been run.


## Browser and TLS verification — 2026-10-11 (in progress)

Application repository main now includes workflow-only diagnostic merges through `e52f8da2efbad98dcac6b4c9f4bcd45a0901ccfe`; the deployed backend application code remains `9d545de3c6e2048dd851bb43a8782bf388544486`. These workflow-only merges did not trigger a backend deployment.

PR #14 is open: https://github.com/yashbhoomkar/tech-katta/pull/14. Its current branch head is `dcba89f7499ba9cecc5cc4117896b33651096990`. It adds Chromium browser checks, a maximum-60-request/concurrency-3 GET-only production load probe, and CodeQL analysis. The branch also contains a one-time certificate repair step that first runs Certbot's HTTP-01 dry run and only then requests a trusted certificate for `tech-api.katta.cc`; the repair step's execution has not yet been verified. Do not merge this PR or claim the TLS issue is fixed until the workflow and tests are verified.

Browser run https://github.com/yashbhoomkar/tech-katta/actions/runs/38135114290 failed on the browser-origin API request. The three SPA routes returned HTTP 200 and rendered content, but the API hostname presents a self-signed certificate (OpenSSL verify code 18; curl error 60; Chromium `ERR_CERT_AUTHORITY_INVALID`). The bounded load job was skipped because browser verification failed. No load/stress result is available yet.

CodeQL passed on the earlier PR head in run https://github.com/yashbhoomkar/tech-katta/actions/runs/38135114213; the latest PR head still requires a fresh successful check. CodeRabbit review was manually triggered and was still marked in progress at the last check. The shared read-only VPS TLS diagnostic workflow was added through PRs #15 and #16; these workflow-only changes do not change application runtime.

Next action: verify the Certbot repair step runs, confirm `https://tech-api.katta.cc/api/health` validates with a trusted chain, rerun Chromium tests, then run the bounded load probe only after browser/API checks pass. Update the context again with measured results; do not call this a full capacity benchmark or penetration test.


## Browser and load verification — successful follow-up (2026-10-11)

Update to the earlier TLS-blocker note: the branch-scoped Certbot repair completed successfully in workflow run https://github.com/yashbhoomkar/tech-katta/actions/runs/38135493017. The API certificate is now issued by Let's Encrypt (issuer YE2); OpenSSL verification returned `Verify return code: 0 (ok)`, and `https://tech-api.katta.cc/api/health` returned HTTP 200. This was a real VPS Nginx certificate change; the backend application code was not redeployed.

The latest full verification run passed:
- Browser + bounded load: https://github.com/yashbhoomkar/tech-katta/actions/runs/38135694798
- CodeQL: https://github.com/yashbhoomkar/tech-katta/actions/runs/38135694821

Chromium passed the homepage, distributed-systems unit, and canonical article route (all HTTP 200), then passed the browser-origin API request and canonical article contract with no uncaught page exceptions. The bounded read-only load probe completed 60 GET requests at concurrency 3: 60 HTTP 200 responses, minimum 231 ms, median 235 ms, p95 757 ms, maximum 839 ms, zero 429 responses, and zero 5xx/network errors. This is a bounded smoke-load result, not a capacity benchmark or penetration test.

Latest PR #14 branch head at this note: `afa5abd8f1c71c104b6eaa8ce0a7b98a2dd83a18`. PR #14 remains open pending final CodeRabbit review and merge decision. Qodo/CodiumAI's public `@CodiumAI-Agent /review` command was attempted but no bot response was observed; it is not yet an enabled review integration. CodeQL is enabled and passed for the latest head.


## Final browser, TLS, load, and review status (2026-10-11)

This final status supersedes the earlier in-progress notes above.

- The public API TLS issue is fixed. The one-time repair workflow run https://github.com/yashbhoomkar/tech-katta/actions/runs/38135484266 passed its Certbot HTTP-01 dry run, backed up Nginx configuration to `/root/nginx-pre-tech-api-cert-20261011T112533Z.tar.gz`, deployed the existing valid Let's Encrypt certificate for `tech-api.katta.cc`, validated/reloaded Nginx, and verified the TLS chain with OpenSSL `Verify return code: 0 (ok)`. A standard, certificate-validating `curl` to `/api/health` returned HTTP 200 and MongoDB connected. No backend application code was deployed for this fix.
- PR #14 merged as `e4d4f92eee0b033ccbfb5d53928684c0d797bf93`: https://github.com/yashbhoomkar/tech-katta/pull/14. It adds Playwright/Chromium production smoke checks, a bounded GET-only load probe, and GitHub CodeQL security/quality analysis. This is test/CI workflow code only; the backend runtime revision remains `9d545de3c6e2048dd851bb43a8782bf388544486`.
- Real Chromium tests passed on https://github.com/yashbhoomkar/tech-katta/actions/runs/38135690786 and https://github.com/yashbhoomkar/tech-katta/actions/runs/38135694798: homepage, Distributed Systems unit, canonical article, and browser-origin API/CORS plus canonical article response contract. All three SPA routes returned HTTP 200; no uncaught browser exceptions were reported. A separate mobile browser check also confirmed that opening the learning sidebar and swiping left closes it.
- The bounded production load probe passed: 60 GET requests, concurrency 3, 10-second timeout, all HTTP 200, zero 429s, zero 5xx/network errors. Run https://github.com/yashbhoomkar/tech-katta/actions/runs/38135690786 measured min 233 ms, median 239 ms, p95 750 ms, max 807 ms. A second concurrent verification run also passed 60/60 HTTP 200 (min 231 ms, median 235 ms, p95 757 ms, max 839 ms). This is a low-volume smoke-load check, not a capacity benchmark or penetration test.
- After the TLS fix, the existing production smoke script passed all 11 endpoint checks plus CORS and security-header assertions using standard TLS validation.
- Free review/security tools: CodeQL `security-extended,security-and-quality` passed on the final PR head (run https://github.com/yashbhoomkar/tech-katta/actions/runs/38135694821). A manual Semgrep default-rules scan reported zero findings. CodeRabbit remains an additional review integration; no extra paid reviewer was enabled.
- All application-repository commits for this work, including the PR #14 merge commit, are recorded in MongoDB `techkatta_history.backend_git_commits`. See `10-GIT-HISTORY.md` for the commit list and workflow links.


## Final outcome — PR #14 merged and verification passed (2026-10-11)

Correction to the prior "PR #14 remains open" note: PR #14 was merged automatically after the verification jobs passed. Merge commit: `e4d4f92eee0b033ccbfb5d53928684c0d797bf93`. This merge commit is recorded in MongoDB `techkatta_history.backend_git_commits`.

Successful verification:
- Browser + bounded load run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38135694798
- CodeQL security/quality run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38135694821

The TLS issue was fixed by issuing/configuring a Let's Encrypt certificate on the VPS. The browser suite now passes all three SPA routes and the browser-origin API/CORS/article contract. The bounded probe returned 60/60 HTTP 200 with concurrency 3; min 231 ms, median 235 ms, p95 757 ms, max 839 ms, no 429s, no 5xx/network errors. This remains a bounded smoke-load check, not a capacity benchmark. CodeQL passed for the final candidate head.

The app repository main now includes merge commit `e4d4f92eee0b033ccbfb5d53928684c0d797bf93`. No backend application source was changed by PR #14 and no backend code deployment was triggered by it; deployed application code remains at `9d545de3c6e2048dd851bb43a8782bf388544486`. The separate TLS certificate configuration was changed on the VPS and verified by the browser/load run.


### Post-merge deployment verification (2026-10-11)

Merging PR #14 as `e4d4f92eee0b033ccbfb5d53928684c0d797bf93` triggered the backend deployment workflow run https://github.com/yashbhoomkar/tech-katta/actions/runs/38135786631. The run passed backend JavaScript validation, dependency install, syntax checks, VPS preparation/runtime configuration, API restart/health verification, and production smoke tests. MongoDB content sync was skipped because this was a workflow/test-only change. The VPS deployment workflow is now green on the latest main SHA, while backend application source remains unchanged from `9d545de3c6e2048dd851bb43a8782bf388544486`. The merge commit is recorded in MongoDB `techkatta_history.backend_git_commits`.


## Issue #18 follow-up — frontend fixes in review (2026-10-11)

PR #19: https://github.com/yashbhoomkar/tech-katta/pull/19

- `f1e657c21673bf64ff71f6d067f1231e72d1956f` — refresh the mobile swipe handler when `location.pathname` changes.
- `a1f3b3a803779f5082e3f8a37d65137dd10fc38e` — restore article metadata on effect cleanup.

Both commits are recorded in MongoDB `techkatta_history.frontend_git_commits`. PR is open and not deployed. Frontend CI/build and actual mobile gesture behavior remain pending verification.


### Frontend audit fixes merged — 2026-10-11

PR #19 https://github.com/yashbhoomkar/tech-katta/pull/19 was squash-merged as `62c4b3ee59a99a57ec98ad221a34d38f37953eb2`. It fixes stale mobile swipe route state and restores article metadata on cleanup. Frontend CI build and CodeQL passed on PR head `a1f3b3a803779f5082e3f8a37d65137dd10fc38e`. Merge SHA recorded in MongoDB `techkatta_history.frontend_git_commits`. Mobile gesture testing remains pending.


## Issue #18 hardening candidate — PR #20 (2026-10-11)

PR: https://github.com/yashbhoomkar/tech-katta/pull/20 — open, not merged/deployed.

Changes in the branch:
- Configurable backend bind host with loopback default; Docker explicitly binds inside the container and still publishes only on host loopback.
- Health endpoints bypass the general rate limiter and report the package version.
- Production smoke checks now verify TLS normally, without disabling certificate verification.
- Article category index added to the seed routine.
- Legacy Vercel CLI no longer embeds a team ID.
- Frontend local Kafka fallback includes the advanced sections already used by the backend.

Application commits are recorded in their respective techkatta_history.backend_git_commits and frontend_git_commits collections. Backend CI and frontend build passed on the latest PR head; CodeQL was pending. No production deployment is claimed. Regex-to-text search migration, proxy IP semantics, overflow routing, Vercel client consolidation, and diagram normalization remain deferred pending additional verification/design.


## Issue #18 fixes merged — 2026-10-11

PR #19 merged as 62c4b3ee59a99a57ec98ad221a34d38f37953eb2: mobile swipe route state and article metadata cleanup. Frontend CI and CodeQL passed; actual mobile touch testing remains pending.

PR #20 merged as 56b229a2c0fa1d586f200a41c79826ed92a0446b: configurable safe bind host/Docker binding, health checks outside rate limiting with dynamic package version, TLS smoke validation without certificate bypass, article category index, removal of hardcoded Vercel team ID, and complete local Kafka fallback sections. Backend CI, frontend build, and CodeQL passed on PR head. Both merge commits are recorded in the respective MongoDB ledgers and context docs.

Production deployment and post-deploy verification for PR #20 are pending. Remaining issue #18 findings requiring more evidence/design: search query strategy, Cloudflare/Nginx client-IP trust, overflow routing, Vercel client consolidation, and content-schema diagram migration. The diagnostic workflow permission/stdout allegation is stale: the current workflow already uses capture_stdout and issues:write, which is sufficient for the issue-comment endpoint.


### PR #20 deployed successfully — 2026-10-11

Merge commit 56b229a2c0fa1d586f200a41c79826ed92a0446b is deployed on the VPS. Run https://github.com/yashbhoomkar/tech-katta/actions/runs/38137021953 succeeded: MongoDB content sync completed (5 categories, 11 articles), systemd API restarted, local health reported DB connected and version 0.1.0, and production smoke passed 11 endpoint checks plus CORS/security headers using standard TLS verification. Backend CI, frontend build, and CodeQL all passed on the merge commit.

PR #19 frontend fixes are merged as 62c4b3ee59a99a57ec98ad221a34d38f37953eb2. PR #20 fixes are merged as 56b229a2c0fa1d586f200a41c79826ed92a0446b. Both merge SHAs are recorded in MongoDB and this context repository. A live Vercel deployment and actual mobile/offline-browser interaction have not been independently verified.

Remaining issue #18 work: decide/benchmark search semantics before changing regex search; verify Cloudflare/Nginx client-IP attribution and origin exposure on VPS; inspect actual overflow timer and Nginx routing before changing it; map all Vercel client callers before consolidation; and plan a DB content migration before removing the diagram normalization compatibility layer. Multi-origin CORS remains intentionally restricted to explicit needs.


## Issue #18 — scoped fixes merged (2026-10-11)

- PR #19 merged as 62c4b3ee59a99a57ec98ad221a34d38f37953eb2: fixed stale mobile swipe route closure and article metadata cleanup. Frontend CI and CodeQL passed on PR head; mobile device gesture verification remains pending.
- PR #20 merged as 56b229a2c0fa1d586f200a41c79826ed92a0446b: exempted health endpoints from rate limiting, sourced health version from package metadata, added explicit bind-host config (loopback default; Docker container interface), removed TLS verification bypass from production smoke tests, added category index, removed hardcoded Vercel team ID, and aligned frontend Kafka fallback content.
- Both merge commits recorded in the corresponding techkatta_history commit-ledger collections.
- Backend CI and CodeQL passed on corrected backend test commit d40929e580571d5600066d521de08f9f75eb7deb; Vercel preview status passed on the latest PR head and merge commit. Full post-merge production deployment/health verification is not yet confirmed.

### Still requires separate verification/follow-up

- Live VPS/Nginx/Cloudflare forwarded-IP and trust proxy behavior.
- VPS-primary/Render-overflow routing against actual systemd configuration and recovery behavior.
- Regex search query performance and semantics before changing indexes/search implementation.
- Duplicate Vercel client call sites and removal of legacy clients only after reference audit.
- Any remaining CORS requirements for preview domains; do not widen without a defined origin policy.
- Browser/mobile gesture test on a real touch device.


### Production frontend deployment confirmed (2026-10-11)

Vercel deployment for main commit 56b229a2c0fa1d586f200a41c79826ed92a0446b is READY with target=production and alias tech.katta.cc. This confirms the frontend deployment only. Backend VPS deployment status and live API health after the merge have not been independently confirmed in this session.


## Overflow timer disabled pending real routing (2026-10-11)

Application PR #21 was merged as `9bc56bf28f5005aff71e5e1dac8ff710fd386e5e`. The backend deployment workflow now stops/disables `tech-katta-overflow.timer` instead of installing and enabling a 30-second no-op timer. The deployment also verifies the timer is inactive. The VPS API remains the primary service; no Render overflow/failover is active. The script does not configure Nginx, and no secondary upstream is provisioned. The merge-triggered VPS deployment and its public smoke tests must be checked before calling this operational change deployed. MongoDB backend commit ledger entry was inserted for the merge SHA.

This supersedes older statements in this file that backend deployment for commit `56b229a2c0fa1d586f200a41c79826ed92a0446b` was unconfirmed: that deployment was verified successfully in Actions run https://github.com/yashbhoomkar/tech-katta/actions/runs/38137021953.

### Overflow timer deployment verified (2026-10-11)

Deployment run https://github.com/yashbhoomkar/tech-katta/actions/runs/38139715132 completed successfully for application merge commit `9bc56bf28f5005aff71e5e1dac8ff710fd386e5e`. The VPS logs confirm the placeholder timer was stopped/disabled, the API remained active and loopback-bound, and the production smoke suite passed 11 endpoint checks plus CORS/security headers. The no-op timer finding is resolved. Actual overflow/failover remains unimplemented by design.


### Proxy trust topology evidence (2026-10-11)

Read-only diagnostic run https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987241 found public DNS for `tech-api.katta.cc` points directly to `129.121.133.47`, not Cloudflare proxy ranges. The current topology is direct client → Nginx → Express, so do not change Express trust hops or configure Cloudflare-only real-IP trust based on an assumed Cloudflare edge hop. The distinct origin-exposure issue remains: UFW permits 80/443 from any source. Restricting origin ingress must wait until Cloudflare proxying is deliberately enabled and verified.
