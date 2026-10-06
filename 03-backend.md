# 03 — Backend

## Stack

The backend is Node.js + Express with MongoDB Atlas.

Production service:

- domain: `https://tech-api.katta.cc`
- VPS: `129.121.133.47`
- directory: `/opt/tech-katta`
- systemd: `tech-katta-api`
- service user: `techkatta`
- DB: `techkatta`

## Core files

Important backend files:

- `backend/src/server.js`
- `backend/src/db.js`
- `backend/src/seed.js`
- `backend/src/data.js`
- `backend/src/contentSchema.js`
- `backend/src/distributedSystemsConcepts.js`
- `backend/src/distributedSystemComponents.js`
- `backend/src/kafkaAdvancedContent.js`
- `backend/package.json`
- `backend/package-lock.json`
- `backend/Dockerfile`
- `scripts/production-smoke.mjs`
- `scripts/vps-overflow-router.sh`

## CORS

Production requires:

`FRONTEND_ORIGIN=https://tech.katta.cc`

The server fails startup in production if this variable is absent.

Development fallback:

`http://localhost:5173`

Allowed methods are restricted to GET and OPTIONS.

Allowed headers are restricted to Content-Type.

## Security headers

The API sets:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Cross-Origin-Resource-Policy: same-site`

It also disables Express's `X-Powered-By`.

## Request limits

JSON body limit:

`50kb`

Rate limiting:

- 120 requests per IP per minute
- 429 response when exceeded
- Retry-After header
- X-RateLimit-Limit
- X-RateLimit-Remaining
- stale in-memory buckets are periodically cleaned

This is an in-memory limiter and is acceptable for the current single-process deployment. It is not sufficient as a distributed limiter across multiple API instances.

## Search hardening

Search input is trimmed and capped at 100 characters.

Regex metacharacters are escaped before building MongoDB regex queries.

The search checks fields such as:

- title
- eyebrow
- description
- tags

This prevents user-controlled search text from becoming an unintended regex program.

## Slug validation

Slugs must match:

```
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Invalid slugs return 404.

## Graceful shutdown

The backend handles SIGTERM/SIGINT by:

1. stopping acceptance of new HTTP work
2. closing the HTTP server
3. closing MongoDB
4. allowing up to 10 seconds for graceful termination

Startup failures are caught and logged.

Unhandled rejections and uncaught exceptions are logged.

## Health endpoint

Known health endpoint:

`GET /api/health`

Known production response included:

```json
{
  "status": "ok",
  "service": "tech-katta-api",
  "version": "2026.10.05-production",
  "db": "connected"
}
```

Do not assume the version remains current; verify live state before relying on it.

## Content normalization

`backend/src/contentSchema.js` contains compatibility logic.

A legacy ASCII architecture code block in the Distributed Systems Concepts article is recognized by structural markers such as:

- Before:
- Client
- Load Balancer
- API servers
- Cache
- Queue
- Workers

For slug `distributed-systems-concepts`, that legacy block is normalized into:

```js
{ type: 'diagram', name: 'distributed-architecture' }
```

This means MongoDB does not need to be mutated merely to use the static diagram.

## Deployment workflow

`.github/workflows/deploy-backend.yml`:

1. installs Node 22
2. runs `npm ci`
3. syntax checks server/db/seed
4. SSHes to VPS
5. installs production systemd environment configuration
6. seeds content
7. restarts service
8. verifies service active
9. checks local health endpoint
10. runs public production smoke tests

Production environment drop-in:

```
Environment=NODE_ENV=production
Environment=FRONTEND_ORIGIN=https://tech.katta.cc
```

## Smoke tests

`scripts/production-smoke.mjs` covers:

- frontend home
- frontend unit route
- frontend article route
- API health
- API categories
- API articles
- canonical article endpoint
- regex-safe search
- invalid slug
- allowed CORS
- attacker-origin non-reflection
- security headers

GitHub Actions successfully ran the hardened smoke suite in the known historical deployment sequence.

## Important backend deployment commits

- `61d446573bc8edc1617b73b2dc592b579c5a7740` — install VPS-first overflow monitor during backend deployments
- `8afd3a54a3f219878f7cc9c5c3151796e69f6f12` — successful production smoke test state
- `382f8ff23d50074321999434645d92f300bc4419` — cleanup after smoke-test harness issue
- `bdef2d1cc4a2a74e7736811d0dcc0c49cbee8d75` — final overflow-router script state

Use the live repository before treating these as exact current code.
