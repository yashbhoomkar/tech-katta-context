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