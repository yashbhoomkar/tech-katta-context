# Backend Implementation

## Stack

- Node.js
- Express 5.1
- MongoDB driver 7.7
- CORS
- dotenv

Production runs Node 22.

## Runtime

Entry point:

`backend/src/server.js`

Port:
- environment `PORT`
- default 5000

Host:
- `0.0.0.0`

## MongoDB connection

`backend/src/db.js`

Environment:
- `MONGODB_URI`
- `MONGODB_DB`, default `techkatta`

MongoClient:
- `maxPoolSize: 10`
- `serverSelectionTimeoutMS: 5000`

If MongoDB is unavailable:
- backend marks DB disconnected
- background reconnect attempts occur every 15 seconds
- API endpoints can fall back to local data

Graceful shutdown:
- clears reconnect timer
- closes MongoDB
- closes HTTP server
- 10-second shutdown timeout

## API

### GET /

Operational JSON response.

### GET /health

Health response.

### GET /api/health

Primary production health endpoint.

Expected production shape includes:
- `status: ok`
- `service: tech-katta-api`
- `version: 2026.10.05-production`
- `db: connected` when MongoDB is available

### GET /api/categories

Returns category documents.

If DB query fails or no DB data is available, returns fallback categories.

### GET /api/articles

Supports:
- `category`
- `search`

Search is bounded to 100 characters and regex-escaped before MongoDB use.

This is important: user-controlled search must not be treated as an arbitrary regular expression.

### GET /api/articles/:slug

Slug must match:

`^[a-z0-9]+(?:-[a-z0-9]+)*$`

Invalid slugs return 404.

Article content is normalized before being returned.

## Internal Vercel control layer

Application commits:
- `193a11293b10d43534c34fa8b902d24dd12e6cac` — add environment-authenticated Vercel REST client
- `102d23221272e861c5ac6ca76aecb08cd5aca5ab` — add internal Vercel control layer and CLI

Implementation:
- `backend/src/vercel/client.js`
- `backend/src/vercel/projects.js`
- `backend/src/vercel/deployments.js`
- `backend/src/vercel/index.js`

This is a private server-side control layer using Node 22's native `fetch`. It talks directly to the Vercel REST API and is independent of the ChatGPT Vercel MCP integration.

Supported operations:
- list projects
- inspect a project
- list deployments
- inspect a deployment with Git repository metadata
- list project domains

CLI:

`cd backend && VERCEL_ACCESS_TOKEN=... node src/vercel/index.js projects`

Other commands:
- `project <project-id-or-name>`
- `deployments [project-id] [limit]`
- `inspect <deployment-id-or-url>`
- `domains <project-id-or-name>`

Runtime configuration:
- `VERCEL_ACCESS_TOKEN` — required secret
- `VERCEL_TEAM_ID` — optional team scope

The token is read only from the process environment. It is not stored in Git, MongoDB, or this context repository.

The control layer is intentionally not exposed as a public Express route. It is an internal administrative capability that can later be wrapped by an authenticated MCP/admin process.

### Verification status

The code has been committed and recorded in the MongoDB backend ledger. The token-authenticated Vercel API has **not yet been executed from this ChatGPT runtime**. Execution requires a network-enabled trusted environment with `VERCEL_ACCESS_TOKEN` configured. Do not claim token-authenticated API verification until that execution succeeds.

## HTTP hardening

Production requires:
- `FRONTEND_ORIGIN`

CORS is restricted to that origin.

Express:
- `app.disable('x-powered-by')`
- `app.set('trust proxy', 1)`

Security headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera/microphone/geolocation disabled
- Cross-Origin-Resource-Policy: same-site

JSON body limit:
- 50 KB

## Rate limiting

Current implementation:
- in-memory
- 120 requests/IP/minute
- 429 after limit
- Retry-After header
- X-RateLimit-Limit
- X-RateLimit-Remaining

Stale buckets are cleaned once the map grows beyond 10,000 entries.

This is acceptable for the current single-process VPS deployment, but it is not a distributed rate limiter. If the architecture becomes multi-instance, move rate limiting to the edge or shared state.

## Content normalization

`backend/src/contentSchema.js` accepts both:
- current block schema
- legacy section fields

Block types are explicitly whitelisted.

For the distributed systems article, a legacy ASCII architecture code block is presentation-mapped to:

`{ type: 'diagram', name: 'distributed-architecture' }`

This mapping is presentation-only. It does not mutate the MongoDB document.

## Seed process

`backend/src/seed.js`:
- connects to MongoDB
- creates unique category ID index
- creates unique article slug index
- migrates legacy slug `distributed-system-components`
- removes duplicate legacy article if canonical article already exists
- upserts categories
- upserts articles
- normalizes article content
- sets `contentSchemaVersion: 2`
- sets `updatedAt`

## Fallback

`backend/src/data.js` contains:
- categories
- article metadata
- article content fallback

Article-specific modules:
- `distributedSystemsConcepts.js`
- `distributedSystemComponents.js`
- `kafkaAdvancedContent.js`

## Docker

`backend/Dockerfile`:
- node:22-alpine
- production environment
- npm install --omit=dev
- runs as `node`
- exposes 5000

`backend/docker-compose.yml`:
- localhost-only host binding
- health check
- restart unless-stopped

The VPS production service is systemd-based rather than dependent on Docker Compose.

## Do not change silently

Do not:
- remove fallback data without a migration plan
- expose MongoDB directly
- loosen CORS to `*` in production
- remove slug validation
- remove regex escaping
- remove security headers
- turn off graceful shutdown
- store secrets in Git
- expose Vercel administrative functions through the public API


## Backend hardening phase 1 — PR in progress (2026-10-11)

Pull request: https://github.com/yashbhoomkar/tech-katta/pull/1
Branch: `refactor/backend-hardening-phase-1` (not merged; not deployed to production).

- Extracted the process-local rate limiter into `backend/src/middleware/rateLimit.js`.
- Keeps the existing default of 120 requests per client IP per 60-second window and returns 429 with `Retry-After` when exceeded.
- Adds a bounded bucket map, periodic expired-bucket cleanup, injectable clock for tests, and test-only lifecycle/introspection helpers.
- Middleware uses Express's resolved `request.ip`; it no longer parses `X-Forwarded-For` itself. `app.set('trust proxy', 1)` remains in `server.js`; confirm the actual Cloudflare/Nginx forwarding chain before treating client-IP attribution as production-verified.
- Added `node --test` coverage and `.github/workflows/ci-backend.yml`.
- The limiter is still process-local. Do not claim distributed enforcement or multi-instance protection.
- Corrected the deployment workflow's stale `src/vercelClient.js` syntax-check path to check the existing `src/vercel/*.js` modules instead.

Validation status: the backend CI run on the prior branch head passed; CI for the latest commit must be checked separately. Production deployment is pending PR merge and successful deployment/smoke tests.

### Production deployment outcome — 2026-10-11

The merge commit `a9e340cc539519a91617d390a44e98bd0547046d` was deployed by GitHub Actions run https://github.com/yashbhoomkar/tech-katta/actions/runs/38128036897. The SSH deployment, backend syntax checks, service restart, local `/api/health` check, and public production smoke suite all passed. The local health response reported `db: connected`; the public smoke suite passed 9 endpoint checks plus CORS and security-header checks. The exact proxy/client-IP attribution is still not separately verified.

## Database fallback semantics — production (2026-10-11)

Application merge/deployment commit: `3155342dc66bdf1e001bbfc54749f63daf1e4062`.

- Local fallback content is used only when `isDBConnected()` is false.
- A successful MongoDB query is authoritative even when it returns an empty array or `null`; empty category/article lists remain empty and an absent article returns 404 rather than being silently supplied from local data.
- If MongoDB is marked connected but a content query fails, the route logs the server-side error and returns generic HTTP 503 with `Retry-After: 5` and `Cache-Control: no-store`.
- Added `backend/src/contentSource.js` and native tests for disconnected fallback, empty results, missing records, and query-error propagation.

CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128191731
VPS deployment and production smoke tests passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128191751

This makes database failures visible instead of disguising them as successful stale content. Local fallback remains available when MongoDB is known to be disconnected.

## Content-route modularization in progress (2026-10-11)

Application branch `refactor/backend-route-modules`, commit `c0d19ec9403a6dc1deaa37ff0b56985dda6c61eb` (recorded in the MongoDB backend ledger; not yet merged or deployed).

The `/api/categories`, `/api/articles`, and `/api/articles/:slug` handlers have been extracted from `server.js` into `backend/src/routes/content.js` via `createContentRouter({ getDB, isDBConnected })`. `server.js` retains process startup, middleware, health endpoints, and shutdown. Added HTTP-level native Node tests using an ephemeral Express server and fake database dependencies. The route contract is intended to remain unchanged except for the database fallback semantics already deployed.

## Content-route modularization — deployed (2026-10-11)

Merge/deployment commit: `a806fab3f94a00172d55fafdb73ea9ca7dc71810`.

Content endpoints now live in `backend/src/routes/content.js`, registered by `server.js` with injected `getDB` and `isDBConnected` dependencies. `server.js` is slimmer and retains app-wide middleware, health endpoints, process startup, and graceful shutdown. Added HTTP-level tests with an ephemeral Express server and fake DB dependencies.

Backend CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128338279
VPS deployment and production smoke tests passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128338288

This is an incremental route extraction, not a full controller/service/repository rewrite.

## Readiness and request observability candidate (2026-10-11)

Branch `feat/backend-readiness-observability`, application commit `6e77efb47d92897a92777bd47e9f9a2bc0384bc0` (recorded in MongoDB backend ledger; not yet merged/deployed).

- Added `/health/live` for process liveness (HTTP 200 while the process can answer).
- Added `/health/ready` for content-service readiness (HTTP 200 when MongoDB is connected; HTTP 503 with `Cache-Control: no-store` otherwise).
- Added `X-Request-Id` and one-line JSON access logs containing method, path without query string, status, and duration. Query strings and client IPs are intentionally not logged.
- Added HTTP-level tests and expanded `scripts/production-smoke.mjs` to check both endpoints.

Legacy `/health` and `/api/health` responses are preserved for compatibility. CI and production verification are pending.

## Readiness and request observability — deployed (2026-10-11)

Merge/deployment commit: `b8a705eec61af7deb7ca47ebd36d06025df2ad22`.

- `/health/live` returns 200 while the process can answer.
- `/health/ready` returns 200 only while MongoDB is connected, otherwise 503 with `Cache-Control: no-store`.
- Existing `/health` and `/api/health` routes remain for compatibility.
- Each request gets a generated `X-Request-Id`; structured JSON access logs include method, path without query string, status, and duration. Query parameters and client IP are not logged.
- Health probes are registered before the general rate limiter.

Backend CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128466934
VPS deployment and expanded public smoke tests passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128466902

## Loopback binding security candidate (2026-10-11)

Branch `fix/backend-loopback-bind` currently includes:
- `4d5bd7de22def2ef42b93aa2b400a38ce022a4a0` — bind the API to `127.0.0.1` and assert the socket binding during deployment
- `2fc4cf9f07c576c903e165a802edc2597d66d541` — fix the DNS diagnostic warning branch

Both commits are recorded in MongoDB. The Node service will listen only on loopback, matching Nginx's existing `proxy_pass http://127.0.0.1:5000`. The deploy workflow will verify the loopback listener and fail if the API is bound to `0.0.0.0:5000`. No firewall rules are changed. CI/PR/deployment status is pending.

### Deployment assertion correction (2026-10-11)

Commit `d41a420c7f973af3626d9de51cd16f34edf94166` (MongoDB-ledgered) fixes the indentation of the loopback socket assertions inside the SSH script block. The initial PR branch version placed them outside the YAML script block and GitHub marked the deployment workflow invalid; this was caught before merging. PR validation should be checked on the updated head.

## Loopback binding security hardening — deployed (2026-10-11)

Merge/deployment commit: `5e09088ba40b8060a81813e766202fcf4bb07884`.

- Node now listens on `127.0.0.1:5000`, matching the Nginx upstream, instead of binding `0.0.0.0`.
- The VPS deployment workflow asserts that `127.0.0.1:5000` is listening and fails if `0.0.0.0:5000` is present.
- Existing public API endpoints remain reachable through Nginx.
- The Cloudflare diagnostic warns that `tech-api.katta.cc` currently resolves directly to origin `129.121.133.47`; the API hostname is not Cloudflare-proxied. No firewall rules were changed.

Backend CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987182
VPS deployment and 11 endpoint smoke checks + CORS/security headers passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987352

## Opt-in article pagination candidate (2026-10-11)

Branch `feat/backend-pagination-indexes` currently contains:
- `56d6a79b3f9d1c65ea0e152faaa98d673043cf3a` — add opt-in pagination, metadata headers, and `{ category: 1, slug: 1 }` index
- `41359ab7c5b5acaa65fa2e47565fa10236a56cba` — correct numeric pagination parsing

Both commits are recorded in MongoDB. Existing `GET /api/articles` behavior remains unchanged when neither `page` nor `limit` is supplied. Opt-in pagination sorts by slug, caps `limit` at 100, returns an array, and exposes `X-Total-Count`, `X-Page`, `X-Page-Size`, and `X-Total-Pages`. Seed now creates a compound `{ category: 1, slug: 1 }` index in addition to the unique slug index. PR/CI/deployment status pending.

## App construction and process lifecycle separation — candidate (2026-10-11)

PR: https://github.com/yashbhoomkar/tech-katta/pull/10
Application commit: `7f669b872561c809ae8ae501d94d86e26f4473ff` (branch `refactor/backend-clean-architecture-phase-1`; not merged/deployed).

Candidate structure:
- `backend/src/app.js`: Express app factory; middleware and route registration; dependency injection for DB access, rate limiter, and logger.
- `backend/src/server.js`: process entry point; dotenv setup, MongoDB startup, loopback HTTP listener, and graceful shutdown.
- `backend/test/app.test.js`: HTTP-level verification of app assembly, health endpoints, CORS, and security headers.

This isolates HTTP construction from process lifecycle so application behavior can be tested without starting the production process or opening a production database connection. Existing endpoint paths and response shapes are preserved by intent. The next architectural phase should separate content request handling, business logic, and MongoDB access into controller/service/repository layers only after this structural step passes CI. No deployment is authorized by this candidate branch.


### App factory separation — CI result (2026-10-11)

Application commit `7f669b872561c809ae8ae501d94d86e26f4473ff` passed backend CI: https://github.com/yashbhoomkar/tech-katta/actions/runs/38132846227. All 17 native Node tests passed. This is CI verification only; no production deployment, public smoke test, browser test, or load test was performed for this candidate. PR #10 remains draft/open. The next phase should introduce controller/service/repository separation incrementally and preserve the existing public API contract.


### Content module layering — candidate (2026-10-11)

Application commit `1219adb49f9b1235b7623de6fcbf23a4a45b688e` (draft PR #10, not merged/deployed) introduces a small layered architecture:
- Controller: HTTP parameters, status codes, and response serialization.
- Service: application-level operations and content normalization.
- Repository: MongoDB reads, query construction, and disconnected fallback reads.
- Route module: wires controller, service, and repository dependencies.

No new runtime dependency or database migration is introduced. The public API contract is intended to remain unchanged. CI is queued/pending; do not deploy until the current PR head passes tests and is reviewed.


### Layered content architecture — CI result (2026-10-11)

The latest candidate commit `1219adb49f9b1235b7623de6fcbf23a4a45b688e` passed backend CI: https://github.com/yashbhoomkar/tech-katta/actions/runs/38132969830. All 17 tests passed. PR #10 remains draft/open and not deployed. Verification is CI-only; production HTTP smoke, browser, and load tests are pending for this refactor.


### Content-layer test coverage (2026-10-11)

Added `backend/test/contentLayers.test.js` on candidate commit `1c1ff5ce50a0556e955b34825b113cc1634ff4a5`. It verifies repository fallback and query behavior, escaped search patterns, projection of article content out of list results, service normalization without source mutation, controller filter forwarding, safe 503 responses, and invalid slug rejection.

CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133163151 — 23/23 tests passed. Candidate is in draft PR #10 and has not been deployed. Production smoke/load/browser validation remains pending.


### Runtime configuration module — candidate (2026-10-11)

Added `backend/src/config.js` on candidate commit `c9411681a0f940256c8999e22cfc85f01ed295a9`. It parses and validates the port and frontend origin at startup, requires `FRONTEND_ORIGIN` in production, rejects invalid ports and non-origin frontend URLs, and returns an immutable config object. `server.js` passes the validated config into `createApp()`, which no longer reads `process.env` directly.

CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133257583 — 28/28 tests passed. PR #10 remains draft/open; no production deployment or smoke test has been performed for this candidate.


### Runtime configuration and MongoDB injection — candidate

Commit `723a234193644d382c42a34494bb43c014924fac` extends `loadConfig()` to include the MongoDB URI and database name. The process entry point injects these into `connectDB({ uri, dbName })`; reconnect attempts reuse the active options. Missing `MONGODB_URI` continues to mean local fallback mode, preserving existing behavior.

CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133337413 — 28/28 tests passed. Draft PR #10 is unmerged and undeployed. Production smoke/browser/load validation remains pending.


### Centralized HTTP error handling — candidate (2026-10-11)

Candidate commit `b4fd021f18a98ee77700455da8e7d6a4b98861ae` introduces `src/errors.js` and `src/middleware/errorHandler.js`. Controllers forward typed errors to the shared Express boundary. Responses are JSON and consistent for 404, malformed JSON 400, content query 503 (Retry-After: 5 and Cache-Control: no-store), and unexpected 500. Internal DB details are not returned to clients.

CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133451417 — 28/28 tests passed. This candidate remains in draft PR #10 and is not deployed. Production smoke/browser/load tests are pending.


### Request parsing and error-boundary coverage — candidate

Commit `e08dae0345100ba3ccc8b7efbd8690db1644cfbf` moves request ID/logging middleware ahead of JSON parsing and adds consistent JSON handling for malformed JSON (400) and oversized bodies (413), preserving the existing 50 KB body limit.

CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133527724 — 28/28 tests passed. The changes are still in draft PR #10 and have not been deployed.


### Backend architecture documentation

Added `backend/README.md` on candidate commit `3e57fc39d0f23ca6a71e604be3d0e7290a74f995`, documenting module responsibilities, the request lifecycle, fallback/error contracts, environment variables, local commands, health endpoints, and operational limits. Updated `.env.example` to distinguish container `PORT` from host-side `BACKEND_PORT`, and updated root README to reflect the actual topology.

CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133683299 — 28/28 tests passed. Candidate remains in draft PR #10 and is not deployed.


### Rate-limit middleware ordering

Candidate commit `ca69308663ec007bc5c0c7275510872dc8cff7a9` moves the general rate limiter before JSON body parsing while preserving health probes outside the limiter. This prevents malformed or oversized JSON from short-circuiting the middleware chain before rate limiting. A regression test checks that malformed JSON consumes the rate-limit slot.

CI is pending at https://github.com/yashbhoomkar/tech-katta/actions/runs/38133934601. The candidate is in draft PR #10 and has not been deployed.


### Deployment content-sync guard — candidate

Commit `ca0df6f1b50a1cddcb56fc9711f2f4f6c530e7f2` changes the VPS deploy workflow so MongoDB seeding is skipped for code-only releases. Seeding is selected when tracked content source/schema/seed files change, or by explicitly choosing `sync_content=true` for manual workflow dispatch. This avoids rewriting article/category data and `updatedAt` timestamps on unrelated backend releases.

CI/deployment workflow verification for this change is pending. PR #10 is still draft and has not been deployed.


### Latest candidate validation

Backend CI passed on candidate head `ca0df6f1b50a1cddcb56fc9711f2f4f6c530e7f2`: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134049543 — 29 tests passed, 0 failed. The PR is ready for review. CodeRabbit review was requested for this exact head; no review findings have been received yet. Production deployment and smoke verification are still pending.


### Merge and deployment status

PR #10 has been merged to `main` as `a1dcc18ec649bc8c1d36ff491043d45b26de1b5d`. The merge commit was recorded in MongoDB `techkatta_history.backend_git_commits`. VPS deployment run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134143493. Main-branch CI: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134143426. Both runs were in progress when this note was added; production verification is pending.


### Deployment failure and diagnostic hotfix

The deploy workflow fetched merge commit `a1dcc18ec649bc8c1d36ff491043d45b26de1b5d` and installed production dependencies, then failed immediately after `Enforcing production runtime configuration...`. Service restart and production smoke tests were skipped; a retry reproduced the same failure. Do not assume the new backend is running.

Hotfix PR #11: https://github.com/yashbhoomkar/tech-katta/pull/11 — commit `6d9fe2653a578fc51e73080ac606c0354c4ff084` adds non-interactive sudo preflight and explicit failure diagnostics for systemd configuration. Recorded in the MongoDB commit ledger. Deployment and public smoke verification are pending.


### Deployment diagnostic retry

PR #11 merged as `7a43a798407861b0a8f4b3fc9826da0a2b7f9581`; the merge commit is recorded in the MongoDB commit ledger. Deployment retry with explicit sudo/systemd diagnostics: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134334813. The cause of the previous failure and production status remain unconfirmed until this run completes.


### Deployment content-sync handoff fix

PR #12 merged as `cf0c9851934eb3cb8603a1e63a35109f4f9d8fb2`, recorded in the MongoDB commit ledger. The deployment script now uses direct GitHub Actions expression interpolation for the content-sync decision rather than passing it through the SSH action's remote environment forwarding.

Deployment run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134427671. Awaiting the run's output, service health checks, and public smoke tests.


### Deployment workflow split

PR #13 merged as `9d545de3c6e2048dd851bb43a8782bf388544486`, recorded in the MongoDB commit ledger. Deployment is now split into prepare, optional content sync (GitHub Actions step condition), and restart/verify steps, avoiding conditional control flow in the remote shell.

Deployment run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134546986. Production verification remains pending until all steps and smoke tests pass.


### Production deployment and verification

The backend refactor is deployed. Deployment run https://github.com/yashbhoomkar/tech-katta/actions/runs/38134546986 passed for main commit `9d545de3c6e2048dd851bb43a8782bf388544486`. The content-sync step was skipped for this code-only release, avoiding a MongoDB seed/write. The service restarted and local health returned `status=ok`, `service=tech-katta-api`, `db=connected`. Public production smoke tests passed: 11 endpoint checks plus CORS and security headers.

Main backend CI passed on merge commit `a1dcc18ec649bc8c1d36ff491043d45b26de1b5d`: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134143426. No browser automation or load/stress test has been run yet.


## Browser/E2E verification and public TLS finding — 2026-10-11

PR #14 adds real Chromium checks for the homepage, distributed-systems unit, canonical article route, and a browser-origin API request. The first browser run passed the three SPA routes (HTTP 200; rendered root content lengths 1,470 / 1,740 / 24,675 characters) but failed the API request because `tech-api.katta.cc:443` presents a self-signed certificate. OpenSSL reports `verify error:num=18:self-signed certificate`; curl reports error 60; Chromium reports `ERR_CERT_AUTHORITY_INVALID`. This is an externally observable production TLS problem, not a test assertion to suppress.

The load probe has a strict ceiling of 60 read-only GET requests, concurrency 3, and a 10-second per-request timeout. It has not run because the browser/API prerequisite failed. Do not report capacity or stress-test results until the probe actually completes.

PR #14 now includes a branch-scoped Certbot step that first runs an HTTP-01 dry run, then requests/configures a trusted certificate and validates/reloads Nginx. This is a production infrastructure mutation and must be confirmed in the actual Actions logs before claiming remediation. If issuance fails, use the read-only diagnostic workflow and inspect DNS/port-80 challenge reachability before changing DNS or firewall policy.

CodeQL security-extended/security-and-quality analysis passed on the earlier test branch head. A successful scan of the final PR head remains required. No backend application deployment was performed by the browser/load/CodeQL PR.
