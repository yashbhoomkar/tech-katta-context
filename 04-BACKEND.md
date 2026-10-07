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

## Vercel control layer

The backend contains an internal Vercel REST client at:

- `backend/src/vercelClient.js`

It uses Node 22's native `fetch` and Vercel's REST API directly rather than the ChatGPT Vercel MCP connection.

The backend also contains a stdio MCP server at:

- `backend/scripts/vercel-mcp.mjs`

It exposes allowlisted read/control tools for projects, deployments, deployment events, and project domains. It is intentionally not exposed through the public Express API.

Required runtime secret:
- `VERCEL_ACCESS_TOKEN`

Optional team scope:
- `VERCEL_TEAM_ID`

The access token is read only from the environment and must never be committed.

The MCP process communicates over stdin/stdout using JSON-RPC and can be launched with:

`npm run vercel:mcp`

The existing one-shot CLI remains available through:

`npm run vercel:control -- projects`

The control layer now also exposes `cancelDeployment(idOrUrl)`, with the CLI command:

`npm run vercel:control -- cancel <deployment-id>`

The stdio MCP exposes this as `vercel_cancel_deployment`. This is an explicit control operation; arbitrary Vercel endpoints are intentionally not exposed.

Application commits:
- `c3ef3c23e5c7450ef4e409765f2b767eb60071c5` — environment-backed Vercel REST client
- `5c2e975d9c1a43a29dff9f781df1bfcc3d4cf4e3` — stdio Vercel MCP server

The MCP protocol handshake and tool listing were locally syntax/protocol tested. Token-authenticated remote execution from this ChatGPT environment remains unverified because its outbound network path cannot reach the Vercel API directly.

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

This mapping is **presentation-only**. It does not mutate the MongoDB document.

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
