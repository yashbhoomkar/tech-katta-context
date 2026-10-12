# Current State Snapshot

**Snapshot date:** 2026-10-12

This file records the latest application/context state known to this session.

## Application repository

`yashbhoomkar/tech-katta`

Branch:
`main`

Current HEAD:
`d0aa934e87ad5ed9e0c1cc723de0a8f8b0e8fc2b`

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
- frontend ledger: 168 docs observed (2026-10-12)
- backend ledger: 229 docs observed (2026-10-12)
- legacy/general `git_commits`: 16 docs, still exists

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

- Cloudflare-only origin ingress is in place and direct-origin ports 80/443 timed out in external probes (issue #28 closed).
- credential rotation and least-privilege MongoDB runtime access are not verified; the VPS runtime connection currently has a broad Atlas role. Do not provision overflow until the exposed credential is rotated and the app connection is safely updated/tested.
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

Completed security work (2026-10-11): Cloudflare proxying and strict TLS are enabled for tech-api.katta.cc; Nginx normalizes CF-Connecting-IP only from official Cloudflare IPv4/IPv6 ranges; spoofed-XFF rate-limit attribution passed; UFW restricts ports 80/443 to Cloudflare ranges and preserves SSH/22. Node already binds to 127.0.0.1:5000. Issue #28 is closed.

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

Security status (verified 2026-10-11): public DNS for tech-api.katta.cc resolves to Cloudflare edge IPs. The A record retains origin target 129.121.133.47 but is proxied. UFW now allows TCP 80/443 only from official Cloudflare IPv4/IPv6 ranges; SSH/22 rules remain unchanged. See 15-ORIGIN-EXPOSURE-HARDENING.md for the final run evidence.

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

Historical pre-cutover diagnostic: run https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987241 found direct-origin DNS before the Cloudflare change. That observation was valid at the time; the final verified topology and firewall state are recorded in the completed origin-hardening section below.


### Semgrep static analysis added and verified (2026-10-11)

Application PR #22 merged as `a39d441c8364efc65bfa4f14f944d34cd9e07cff`. New workflow `.github/workflows/semgrep.yml` runs Semgrep Community Edition for JavaScript, Node.js, and React on relevant pull requests, main pushes, and manual dispatch, and uploads SARIF findings to GitHub code scanning. Run https://github.com/yashbhoomkar/tech-katta/actions/runs/38140326189 succeeded: 40 JS/Node/React files scanned with 68 rules and 0 findings. CodeQL also passed on this merge commit: https://github.com/yashbhoomkar/tech-katta/actions/runs/38140326154. The application commit is recorded in `techkatta_history.backend_git_commits`.


### k6 production baseline completed (2026-10-11)

Application PR #23 merged as `4d3e285b28b4356922ea016afc3838b4f1d17732`. The main-branch workflow run https://github.com/yashbhoomkar/tech-katta/actions/runs/38140625020 passed the 50-second low-load baseline: 156 HTTP requests total (127 frontend route requests, 29 API requests), 0 failed requests, 0 failed checks out of 312, frontend p95 142.67 ms, API p95 244.61 ms. Peak frontend concurrency was 5 VUs; API used 1 VU with a 1.5-second think time to stay under the current per-client rate limit. This is a baseline/smoke load test, not a saturation or capacity test. The merge commit is recorded in `techkatta_history.backend_git_commits`.


### Vercel client consolidation deployed (2026-10-11)

Application PR #24 merged as `efbc810f08f210e83cff41415280c1a0aaffc8c6`. `backend/src/vercelClient.js` is now the canonical Vercel REST client shared by `backend/scripts/vercel-control.mjs` and `backend/scripts/vercel-mcp.mjs`. The unused `backend/src/vercel-control.js` and unreferenced `backend/src/vercel/` implementation tree were removed; deployment syntax checks now validate the canonical client and active adapters. Backend CI, Semgrep, CodeQL, and VPS deployment all passed. Deployment run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38141089672. Merge SHA recorded in `techkatta_history.backend_git_commits`.


## Mobile swipe audit update — PR #25 (2026-10-11)

PR #25 merged as `e1f35b765015f182d32aaf645c4c4eb8387f5936`. A real browser regression test exposed that home-page left swipes could navigate forward if the browser history contained a forward entry. The frontend now explicitly ignores home left swipes after preserving horizontal-scroll handling.

The branch-local built frontend passed mobile-emulated Chromium touch checks for sidebar open/close, back/forward gestures, home forward-history protection, short swipes, and mostly vertical gestures. The browser workflow also passed three public SPA route checks and the browser-origin API/CORS contract. Frontend CI, Semgrep, and CodeQL passed. Run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38142409155.

This does not constitute a physical-device test. Verify the production Vercel deployment after the merge; the successful run used a locally built branch frontend for gesture tests and production only for public routes/API contract checks. Issue #18 remains open because origin exposure and other audit findings remain unresolved.


## AI code review status — PR #26 (2026-10-11)

The repository now contains `.coderabbit.yaml`, merged in PR #26 as `acbc81423a7da3f6e163462ee0667c4ed0aa35ae`. It defines automatic review intent and Tech Katta-specific instructions. The source commit and merge SHA are recorded in `techkatta_history.backend_git_commits`.

The actual AI reviewer is **not yet verified operational**: PR #26 had no CodeRabbit review or inline comments, and the manual `@coderabbitai review` request produced no CodeRabbit response/check. Do not treat the config file as proof of an active review service. The repository's CodeRabbit GitHub App integration needs to be installed/authorized and verified on a new PR. This remains an open item for issue #18.


## Structured diagram normalization finding resolved — PR #27 (2026-10-11)

The slug-specific ASCII-to-diagram heuristic has been removed. Backend fallback content and the live MongoDB article now both use the explicit `distributed-architecture` diagram block. The deploy workflow seeded content because the source file changed; the follow-up Atlas query confirmed the live block type/name. Backend CI (31/31), CodeQL, Semgrep, VPS deployment, and production smoke checks passed. Deployment evidence: https://github.com/yashbhoomkar/tech-katta/actions/runs/38142984733.

Issue #18 remains open for other audit findings, including direct-origin exposure and the unverified CodeRabbit integration.


## Umbrella audit status and follow-up issues (2026-10-11)

Issue #18 remains open. Current resolved items and evidence are recorded in its latest issue comment. Current status as of 2026-10-12:

- [#28 — Cloudflare proxy cutover and origin ingress restriction](https://github.com/yashbhoomkar/tech-katta/issues/28): **closed** after strict TLS, Nginx real-IP normalization, spoofed-XFF rate-limit verification, Cloudflare-only UFW ingress, SSH preservation, public API/CORS checks, and independent direct-origin blocking.
- [#29 — Design real overflow failover after a secondary upstream exists](https://github.com/yashbhoomkar/tech-katta/issues/29): **open / blocked**. No dedicated Tech Katta Render secondary exists; do not repurpose the Life With Yash backend or enable the placeholder timer. Confirm the previously exposed MongoDB credential has been rotated before provisioning a secondary.
- [#30 — Enable and verify a free AI pull-request review integration](https://github.com/yashbhoomkar/tech-katta/issues/30): **closed**. PR #62 received a completed CodeRabbit walkthrough and a substantive inline review thread; the finding was fixed and the thread resolved.
- [#31 — Revisit article search indexing without changing substring semantics](https://github.com/yashbhoomkar/tech-katta/issues/31): **open as a revisit trigger**. A fresh read-only Atlas explain on 2026-10-12 examined 11 documents, returned 4, used a COLLSCAN, and reported 0 ms. Preserve substring behavior; optimize only when corpus growth or measured query cost justifies it.
- [#32 — Deduplicate legacy commit ledger rows and enforce unique SHA keys](https://github.com/yashbhoomkar/tech-katta/issues/32): **closed** after the six-row backup, exact duplicate removal, unique-index enforcement, zero-duplicate aggregation, and independent post-migration verification.
- [#33 — Run a bounded k6 capacity test with explicit safety limits](https://github.com/yashbhoomkar/tech-katta/issues/33): **open / blocked**. The current run is only a low-load baseline, and no dedicated Tech Katta staging backend exists. PR #65 removed the automatic production-load trigger and requires two manual confirmations; this is a safety improvement, not a capacity test.

The earlier deployment details below are historical verification from 2026-10-11, not the current application HEAD. Current application main HEAD is `513c99a31a49f802a64c567be45d01c9d2628059` (PR #65), recorded in the latest audit section below. The home left-swipe regression remains fixed with browser-emulated checks; physical-device verification has not been performed in this session. Do not close issue #18 while #29 and #33 remain blocked and #31 remains a measurement-based revisit trigger.


## Commit-ledger reconciliation — 2026-10-11

At the time of the original 2026-10-11 check, 111 unique full SHAs referenced by the then-current history/state documents were present in at least one canonical ledger collection. Duplicate rows were subsequently handled under issue #32 with a verified six-row backup and unique-index enforcement; see the 2026-10-12 final acceptance section below.

Remaining audit follow-ups are #29 (real failover), #31 (search scalability revisit), and #33 (bounded capacity test). Issues #28, #30, and #32 are closed. Issue #18 remains open.


## Load-test status (2026-10-11)

The k6 production run remains a low-load baseline, not a stress test or capacity estimate. Follow-up [#33 — bounded k6 capacity test](https://github.com/yashbhoomkar/tech-katta/issues/33) tracks staged ramp-up and explicit safety limits. Do not report a maximum supported user count from the baseline alone.

## Rate-limit forwarded-IP regression coverage — PR #34 (2026-10-11)

Application PR #34 merged as `16bf385f1f62dbea5d11d38fed64028e99ca7a95`. The isolated Express integration test verifies that an attacker-controlled leftmost `X-Forwarded-For` value does not create a new rate-limit bucket when a trusted one-hop proxy appends the same rightmost peer address. Backend CI, Semgrep, CodeQL, VPS deployment, and production smoke checks passed.

This improves regression coverage for the currently observed client → Nginx → Express topology; it is not proof of the live Nginx path or a future Cloudflare path. No DNS or firewall changes were made. Issue #28 and umbrella issue #18 remain open.

## Live forwarded-IP verification — 2026-10-11

After application PR #34, a temporary Vercel sandbox made three GET requests to the production API using three different spoofed `X-Forwarded-For` values. DNS still resolved `tech-api.katta.cc` directly to `129.121.133.47`. All three responses were HTTP 200, the rate-limit remaining counter decreased consecutively (119 → 118 → 117), CORS remained restricted to `https://tech.katta.cc`, and standard TLS validation succeeded.

Historical note: this describes the isolated direct-origin regression test before the Cloudflare cutover. The later live Cloudflare/Nginx/rate-limit/firewall verification supersedes its interim security status; umbrella issue #18 remains open for other findings.

## Commit-ledger duplicate backup status — 2026-10-11

The six known duplicate ledger rows are backed up and verified in `techkatta_history.commit_ledger_duplicate_backup_20261011`, preserving source collection, original `_id`, key, and original description. Canonical GitHub commit messages have been identified for the two affected SHAs. No original row was deleted or modified.

Historical status as of 2026-10-11: the Atlas connector's `create_index` operation did not honor `unique: true`. This limitation was resolved through the VPS runtime credentials in PR #68; see the latest ledger-integrity verification at the end of this file.

## Capacity-test environment status — 2026-10-11

A fresh Render workspace inspection found no Tech Katta staging service; the available services are for Life Katta. The existing 156-request, ~3.05 req/s production run remains a low-load baseline only. No larger production load was run without a representative staging target or a bounded monitored production plan. Issue #33 remains open; no maximum supported user count is claimed.


## Cloudflare API proxy cutover (2026-10-11)

Cloudflare access is now connected. The `katta.cc` zone is active. The existing `tech-api.katta.cc` A record still targets origin `129.121.133.47`, but its proxy status is now enabled. Cloudflare zone settings are confirmed by API read-back: SSL/TLS `strict`, Always Use HTTPS `on`, minimum TLS `1.2`.

Independent smoke checks from a Vercel sandbox in Mumbai passed with standard TLS validation:
- DNS resolved to Cloudflare edge IPs `104.21.13.85` and `172.67.132.164`.
- `GET https://tech-api.katta.cc/api/health` returned HTTP 200 and `db: connected`.
- `GET https://tech-api.katta.cc/api/categories` returned HTTP 200.
- HTTP health request returned 301 to HTTPS.
- Direct-origin certificate hostname and chain verification succeeded for `tech-api.katta.cc`.

**Security follow-up completed (2026-10-11):** the Cloudflare origin-hardening workflow passed end-to-end at https://github.com/yashbhoomkar/tech-katta/actions/runs/38165442874. Nginx trusts CF-Connecting-IP only from official Cloudflare ranges; the spoofed-XFF rate-limit test passed with remaining counts 118 → 117 → 116; UFW permits 80/443 only from 15 official IPv4 and 7 IPv6 Cloudflare CIDRs; IPv4/IPv6 SSH/22 remains allowed; public health/database/CORS checks passed; and direct-origin ports 80/443 timed out from the GitHub runner and an independent Vercel Mumbai sandbox. The workflow refreshes Cloudflare ranges weekly. Issue #28 is closed; umbrella #18 remains open for other audit findings.


## Final Cloudflare origin-hardening state (2026-10-11)

- Application main HEAD: f6ffb10ceca94a3fc2791056eb25480b430a7d92 (PR #52).
- Cloudflare proxy for tech-api.katta.cc: enabled; SSL/TLS Full (strict), Always Use HTTPS on, minimum TLS 1.2.
- Nginx real-IP config is generated from official Cloudflare IPv4/IPv6 ranges; Nginx syntax, reload, and local API health passed.
- Live rate-limit attribution with three different spoofed X-Forwarded-For values passed: 118 → 117 → 116.
- UFW default incoming policy is deny. Ports 80/443 allow only official Cloudflare ranges (15 IPv4 and 7 IPv6 CIDRs); broad Anywhere web rules are absent. Existing SSH/22 rules remain unchanged.
- Workflow run 38165442874 passed post-firewall health/database/CORS checks and direct-origin isolation probes.
- Independent Vercel Mumbai verification returned HTTP 200 through Cloudflare and confirmed direct-origin ports 80 and 443 time out.
- Weekly CIDR refresh is configured for Mondays at 05:17 UTC.


## Article search audit follow-up — PR #53 (2026-10-12)

- Application main HEAD: `34d0d4db2aae0234b2e45d6fc427a75fe4a21653`.
- PR #53 added regression tests for case-insensitive substring matching across title, eyebrow, description, and tags; category-plus-search composition; whitespace trimming; blank search; and fallback behavior.
- Backend CI, Semgrep Community Edition, and CodeQL passed. This was a backend test-only change; no production runtime code, Atlas content/index, or production configuration changed.
- Live Atlas still contains 11 articles with `_id_`, `slug_1`, and `category_1` indexes. Search regex still scans the collection; no measured production bottleneck currently justifies changing semantics.
- Issue [#31](https://github.com/yashbhoomkar/tech-katta/issues/31) remains open until article growth, interactive backend search, or measured query cost triggers a benchmarked optimization. Umbrella issue #18 remains open.


## Issue #32 ledger repair — current status (2026-10-12)

- Application main HEAD: `56bb3bd33481cd836885d0ede744f8639770a381` (PR #57).
- The VPS runtime capability probe passed in run https://github.com/yashbhoomkar/tech-katta/actions/runs/38197243213: temporary unique index metadata reported `unique: true`, duplicate insertion was rejected with code 11000, and the temporary collection was removed.
- Guarded migration run https://github.com/yashbhoomkar/tech-katta/actions/runs/38197586906 stopped at the backup preflight for `frontend_git_commits:6acb79744d4d384f7be306f8`. No canonical rows or indexes were changed by the migration run.
- The Atlas connector sees the expected backup record and matching canonical duplicate, but the VPS-runtime preflight did not match it. Treat the connection/database view discrepancy as unresolved; do not bypass the check or rerun deletion until the discrepancy is explained.
- Duplicate backup `techkatta_history.commit_ledger_duplicate_backup_20261011` remains intact (six records). Canonical duplicate rows remain intact. The ordinary `key_unique` indexes have not been replaced by the migration.
- PR #54–#57 application source/merge SHAs are recorded in `techkatta_history.backend_git_commits`; the context history and ledger docs have been updated with evidence and run links.
- Historical interim status before PRs #67–#68; superseded by the latest ledger-integrity verification at the end of this file. No production application deployment was triggered by these maintenance workflows.


## Issue #32 read-only reconciliation update (2026-10-12)

- Application main HEAD: `c4829f939a0162cbb3f5ac3619d7f70e7c7aa28e` (PR #58).
- PR #58's read-only workflow passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38197871440.
- The VPS runtime and Atlas connector agree on the six-row backup and the exact values/IDs for the three duplicate rows. The VPS view reports frontend 169 documents, backend 203 documents, the same duplicate groups, and non-unique `key_unique` indexes.
- The prior guarded migration run failed backup validation for the first duplicate row, but the read-only inspector subsequently verified every expected field. No canonical data or indexes were changed by either run. The preflight discrepancy is unexplained and must not be bypassed; add field-level diagnostics and rerun the guarded check.
- PR #54–#58 source and merge SHAs are recorded in `techkatta_history.backend_git_commits`; context history/ledger docs are updated.
- Historical interim status before PRs #67–#68; superseded by the latest ledger-integrity verification at the end of this file.


## Issue #32 — deduplication and unique-index enforcement completed (2026-10-12)

- Application main HEAD: `c597e7f416a9c4b9c1c7268c936845755d916720` (PR #61).
- Successful guarded migration: https://github.com/yashbhoomkar/tech-katta/actions/runs/38198144807.
- Successful independent read-only verification: https://github.com/yashbhoomkar/tech-katta/actions/runs/38198308593.
- Removed exactly three backed-up duplicate rows: frontend `6acb79744d4d384f7be306f8`; backend `6acb7969c1d086df8c89e02a` and `6acb7378c0d34c06a4bdbc98`.
- The six-row backup remains intact. The three intended canonical rows remain unchanged. Both `frontend_git_commits.key_unique` and `backend_git_commits.key_unique` report `unique: true`; duplicate-group aggregations return zero groups.
- Migration checks confirmed expected document counts and preservation of the union of SHA keys. Current Atlas connector counts after adding PR #61 SHAs: frontend 168, backend 210.
- Source and merge SHAs from PRs #54–#61 are recorded in `techkatta_history.backend_git_commits`. History and ledger docs record migration evidence.
- Historical checklist completed on 2026-10-12; see the latest ledger-integrity verification at the end of this file. Umbrella issue #18 remains open for the other tracked findings.


## Issue #32 closed — final acceptance (2026-10-12)

- Issue [#32](https://github.com/yashbhoomkar/tech-katta/issues/32) is closed as completed.
- Migration run https://github.com/yashbhoomkar/tech-katta/actions/runs/38198144807 succeeded; independent read-only post-migration verification https://github.com/yashbhoomkar/tech-katta/actions/runs/38198308593 succeeded.
- The three exact duplicate rows are absent from canonical collections and preserved in the six-row backup. Three intended canonical rows remain intact.
- Both canonical `key_unique` indexes report `unique: true`; duplicate aggregations return zero groups.
- Final documentation reconciliation checked 139 unique SHAs referenced by `10-GIT-HISTORY.md` and `13-CURRENT-STATE.md` against both canonical collections: 139/139 accounted for, zero missing.
- Current counts: frontend 168, backend 210; backup collection count six.
- Current application main HEAD at this historical entry: `513c99a31a49f802a64c567be45d01c9d2628059` (PR #65). This was superseded by PR #68; the current HEAD is recorded in the latest entry at the end of this file. Source and merge SHAs through PR #65 are present in `techkatta_history.backend_git_commits`. The commit-ledger repair workflow is manual-dispatch only and requires `confirm_repair: true`; the production k6 baseline is also manual-dispatch only and requires two explicit confirmations.
- Umbrella issue #18 remains open. Issue #30 is closed after a completed CodeRabbit review on PR #62. Next evaluate #29 failover feasibility (blocked by lack of a dedicated Tech Katta secondary and credential-safety prerequisites) and #33 bounded capacity testing (blocked by lack of staging or an approved monitored production window). Issue #31 remains a measurement-based revisit trigger, not a current bottleneck.


## Remaining audit blockers after issue #32 (2026-10-12)

### Issue #30 — AI review integration verified and closed

- PR [#62](https://github.com/yashbhoomkar/tech-katta/pull/62) received a completed CodeRabbit review submission visible through the GitHub review API (`COMMENTED`), with a full walkthrough and one substantive inline review thread on `.github/maintenance/README.md`.
- The actionable finding about the automatic ledger-repair trigger was fixed in commit `ba79429afdc095d9fb3725ab7ccc23f0813da98c`; the inline thread was resolved.
- PR #62 was merged as `f6998eb941ca49ca7ee5b0e72d61288e25b6d8c2`. Vercel preview feedback check passed. No paid API token or new secret was introduced.
- Issue [#30](https://github.com/yashbhoomkar/tech-katta/issues/30) is closed. This proves AI review evidence separately from CI, Vercel, Semgrep, and CodeQL.

### Issue #29 — real overflow/failover remains unimplemented

- `scripts/vps-overflow-router.sh` computes CPU and local health state and writes a state file; it does not alter Nginx routing.
- The deployment workflow keeps the placeholder timer disabled.
- Live Render inventory was checked on 2026-10-12: the workspace has only Life Katta-related services (`life`, `life.yash`, `yash`, `lifewithyash`); no Tech Katta secondary service exists. The `lifewithyash` service is not a safe substitute. A separate Tech Katta Render service was previously blocked during setup due to credential-safety checks. Do not provision or route production traffic to a substitute until the MongoDB credential exposure noted in `14-OVERFLOW-ARCHITECTURE.md` is confirmed rotated and a dedicated secondary is configured.
- No Tech Katta-compatible secondary upstream or staging route has been verified. Do not enable the timer or claim failover works until a secondary exists and routing/recovery are tested.

### Issue #33 — bounded capacity test remains open

- The existing k6 run remains a low-load baseline (156 requests, about 3.05 req/s), not a capacity estimate.
- PR [#65](https://github.com/yashbhoomkar/tech-katta/pull/65) is merged as `513c99a31a49f802a64c567be45d01c9d2628059`: the k6 workflow no longer triggers a production baseline on pushes to `main`; production traffic requires both `run_production_baseline: true` and `confirm_production_target: true` via manual dispatch. PR validation passed with the production job skipped; no production requests were sent.
- No Tech Katta staging service has been verified. Do not run a larger production test without a maintenance window, explicit rate/concurrency caps, hard stop thresholds, and CPU/memory/MongoDB monitoring.
- Issue #18 remains open. Issue #31 is a revisit trigger rather than a measured current bottleneck.


## Follow-up security hardening — PR #64 (2026-10-12)

- The destructive `.github/workflows/repair-commit-ledger-duplicates.yml` workflow previously had a `push` trigger for changes to itself or its repair script. This was removed because routine maintenance commits should not launch a production database migration.
- PR [#64](https://github.com/yashbhoomkar/tech-katta/pull/64) merged as `8dfb94b265a97954c9f996f32175aa6eb62235ca`. The workflow now runs only via `workflow_dispatch` and its repair job is gated on the boolean input `confirm_repair == true` (default false).
- Post-merge inspection confirmed the main-branch workflow has no `push` trigger and no repair workflow run was created by the PR #64 merge. Existing exact-backup, exact-ID, rollback, unique-index, count, and SHA-union guards remain.
- Live canonical ledger counts after adding PR #62 and PR #64 source/merge SHAs: frontend 168, backend 216. Aggregation still returns zero duplicate-key groups in both collections. The six-row backup remains intact. The Atlas index connector does not expose the unique flag, but the independent runtime verification confirmed both `key_unique` indexes enforce uniqueness after migration.
- Umbrella issue #18 remains open. Outstanding tracked work: issue #29 (real failover requires a dedicated secondary and staging), issue #33 (bounded capacity test requires staging or an approved monitored production window), and issue #31 (search optimization is a measurement-based revisit trigger).


## Follow-up k6 workflow safety — PR #65 (2026-10-12)

- Source commit: `d72ed677a9e52f2b01fe016a5c91257c94a3b3a0`.
- Squash merge commit: `513c99a31a49f802a64c567be45d01c9d2628059`.
- Removed the `push` trigger from `.github/workflows/k6-production-baseline.yml`. Pull requests still run `k6 inspect` only; no requests are sent during validation.
- Production baseline now requires a manual `workflow_dispatch` with both `run_production_baseline: true` and `confirm_production_target: true`. The PR validation run passed and skipped the production job as expected; post-merge inspection found no production-baseline run for the merge.
- This safety change does not turn the low-load baseline into a capacity test. Issue #33 remains open pending staging or an approved monitored production test plan.
- Current canonical ledger counts after recording PR #65: frontend 168, backend 218. Issue #18 remains open.


## Latest ledger-integrity verification — 2026-10-12

- Current application main HEAD: `d5f8f8c16d98ed775fa0937a022ddc1230610c68` (PR #68).
- PR #53 merged article-search regression tests only; no runtime search change was justified by the current 11-article dataset. Issue #31 remains a measurement-based revisit trigger.
- PRs #54, #55, and #67 corrected and verified the VPS-runtime capability probe. Successful probe run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38205085520. MongoDB 8.0.34 confirmed a real unique index rejects duplicate insertion with code 11000; temporary collection was removed.
- PR #68 merged the guarded index enforcement workflow. Successful migration run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38205375184. It verified the six expected backup records, zero duplicate-key groups and zero non-string keys in both canonical collections, and the expected surviving rows for all three historical duplicate SHAs. It then verified `unique: true` on the `key` index in both canonical collections. No ledger documents were deleted or modified by PR #68.
- The six-row backup `commit_ledger_duplicate_backup_20261011` remains intact. Canonical counts: frontend 168, backend 224; legacy `git_commits` remains present with 16 records. Duplicate-key aggregations return zero groups.
- Final SHA reconciliation extracted 156 unique 40-character SHAs referenced by `10-GIT-HISTORY.md` and `13-CURRENT-STATE.md`; all 156 are present in at least one canonical ledger collection, with zero missing.
- PR #53, #54, #55, #67, and #68 source/merge SHAs are reconciled in `techkatta_history.backend_git_commits`; six missing records for PR #67/#68 were inserted and the PR #55 merge description was corrected.
- Issue #32 is closed after the context update and final ledger/issue synchronization. Umbrella issue #18 remains open. Remaining tracked work: #29 (real failover requires a dedicated secondary and credential-safety prerequisites), #31 (search revisit trigger), and #33 (capacity testing needs staging or an approved monitored production window).


## Latest audit continuation — 2026-10-12 (PR #69)

- Current application main HEAD: `4ce8403a9fc610ab9840479d29aabed162d0aeb6` (PR #69).
- PR #69 added `.github/workflows/k6-local-integration.yml` and `tests/load/tech-katta-local-smoke.js`. Successful local-only run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38205978125.
- The workflow started an isolated MongoDB 8.0 service, seeded the app database, started the Express API and Vite preview on localhost, and ran k6 for 60 seconds. Results: 442 requests (~7.37 req/s overall), 0 HTTP failures, 884/884 checks passed, zero dropped iterations; API-read p95 3.69 ms, frontend p95 1.31 ms, health p95 1.32 ms. The API-read scenario was capped at one request/second; health routes were tested separately because they are intentionally outside the rate limiter.
- These are local GitHub-runner integration-smoke results, not production capacity measurements. They do not include the VPS, Nginx, Cloudflare, or Atlas network path. No production traffic was sent. Issue #33 remains open until staging or an approved monitored production plan exists.
- Issue #29 remains blocked: router script only writes a state file; timer remains disabled; no Tech Katta secondary exists. Atlas inventory shows the VPS runtime connection has a broad role, and rotation history cannot be verified through the available connector. A secure runtime-secret update path is still required before a secondary can be provisioned; see [issue #70](https://github.com/yashbhoomkar/tech-katta/issues/70). No secondary or production routing was changed.
- Latest canonical ledger counts: frontend 168, backend 227, legacy `git_commits` 16. PR #69's two source SHAs and merge SHA are recorded in `backend_git_commits`.
- Issues #28, #30, and #32 are closed. Issues #29 and #33 remain open blockers; #31 remains a measurement-based revisit trigger. Umbrella issue #18 remains open.


## Latest production browser verification — PR #71 (2026-10-12)

- Current application main HEAD: `d0aa934e87ad5ed9e0c1cc723de0a8f8b0e8fc2b` (PR #71).
- PR #71 added a dedicated read-only production browser smoke workflow. Successful run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38206729819.
- Chromium verified the three live SPA routes (home, distributed-systems unit, canonical article), browser-origin API/CORS and canonical article contract, and mobile-emulated touch behavior: right swipe opens the sidebar, home left swipe does not navigate, article right/left swipes navigate back/forward, short/vertical swipes are ignored, and left swipe closes an open sidebar. No uncaught page exceptions occurred.
- This was a handful of GET requests, not a load test. No production configuration was changed and no production capacity claim is made.
- PR #71 source/merge SHAs are recorded in `techkatta_history.backend_git_commits`; backend ledger count is 229.
- Issues #28, #30, and #32 remain closed. #29 is blocked by issue #70 and lack of a dedicated secondary; #33 remains open pending staging or an approved monitored capacity plan; #31 remains a measurement-based revisit trigger. Umbrella #18 remains open.


## Latest ledger verification follow-up — PR #73 and PR #74 (2026-10-12)

- Current application main HEAD: `a66df730143e7bf44d2206ce44dbdd6a890ffe63` (PR #74).
- PR #73 introduced a VPS-executed isolated unique-index capability probe; PR #74 corrected cleanup and removed the exact stale temporary collection from the earlier failed probe.
- Successful run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38244494719. It connected as the existing VPS runtime, verified a real `unique: true` index, confirmed duplicate insertion fails with MongoDB error 11000, removed the stale probe collection, and removed its own temporary collection.
- Read-only Atlas aggregation after the run returned zero duplicate-key groups in both `frontend_git_commits` and `backend_git_commits`. The temporary probe collection is absent; the six-row duplicate backup remains intact.
- The actual canonical duplicate migration and independent read-only verification had already passed in runs https://github.com/yashbhoomkar/tech-katta/actions/runs/38198144807 and https://github.com/yashbhoomkar/tech-katta/actions/runs/38198308593. No canonical ledger rows were modified by PRs #73 or #74.
- Latest canonical ledger counts after recording PR #73 and #74: frontend 168, backend 233, legacy `git_commits` 16.
- Issue #32 is closed. Issue #29 remains blocked by issue #70 and the absence of a dedicated secondary; #33 remains open pending staging or an approved monitored capacity plan; #31 remains a measurement-based revisit trigger. Umbrella issue #18 remains open.
