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

Application commit:
- `58dd2890658299f72ac11d8ebccf17d1fdc37341` — add internal Vercel REST control client

Implementation:
- `backend/src/vercel-control.js`

This is a server-side JavaScript module plus one-shot CLI. It uses Node 22's native `fetch` and talks directly to the Vercel REST API, independently of the ChatGPT Vercel MCP integration.

Supported operations:
- `listProjects()`
- `getProject(idOrName)`
- `listDeployments({ projectId })`
- `getDeployment(idOrUrl)`
- `cancelDeployment(id)`
- `checkAccess()`

CLI usage:

`cd backend && VERCEL_ACCESS_TOKEN=... node src/vercel-control.js check`

Other commands:
- `projects`
- `project <project-id-or-name>`
- `deployments [project-id-or-name]`
- `deployment <deployment-id-or-url>`
- `cancel <deployment-id>`

Runtime configuration:
- `VERCEL_ACCESS_TOKEN` — required secret
- `VERCEL_TEAM_ID` — optional; defaults to the Tech Katta Vercel team

The token is read only from the process environment and is not stored in Git, MongoDB, or the context repository.

The control layer is intentionally not exposed as a public Express endpoint. This keeps Vercel administrative capability out of the public Tech Katta API surface.

### Verification status

The application commit was successfully created and recorded in the MongoDB backend commit ledger.

The control file itself has been syntax-designed for Node 22 native `fetch`, but token-authenticated Vercel API execution has **not** been performed from this ChatGPT runtime because this runtime has no outbound DNS/network path to `api.vercel.com`. Do not describe the Vercel API as verified until the file is run on the VPS or another network-enabled environment with `VERCEL_ACCESS_TOKEN` configured.

## HTTP hardening

Production requires:
- `FRONTEND_ORIGIN`

CORS is restricted to that origin.

Express:
- `app.disable('x-powered-by')`
- `app.set('trust proxy', 1)

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
