# Current State Snapshot

**Snapshot date:** 2026-10-07

This file records what was actually observed during context creation.

## Application repository

`yashbhoomkar/tech-katta`

Branch:
`main`

Current HEAD:
`f66350c1ae71a6008bd738eaeb5f617d5a292f17`

Latest backend commit extends the custom Vercel REST/MCP control layer with deployment cancellation. The token is not stored in Git.

Vercel control tooling:
- REST client: `backend/src/vercelClient.js`
- CLI: `backend/scripts/vercel-control.mjs`
- MCP: `backend/scripts/vercel-mcp.mjs`
- runtime secret: `VERCEL_ACCESS_TOKEN`
- optional team scope: `VERCEL_TEAM_ID`

Local protocol testing previously passed for MCP initialization and tool discovery. The effective implementation is `backend/src/vercelClient.js` + `backend/scripts/vercel-control.mjs` + `backend/scripts/vercel-mcp.mjs`; the MCP is allowlisted rather than a generic endpoint proxy. Deployment cancellation is now available through the CLI and MCP. No Vercel credential was committed. Real token-authenticated Vercel API execution remains unverified from this ChatGPT runtime because its direct outbound network path cannot reach `api.vercel.com`.

Latest application commit:
`f66350c1ae71a6008bd738eaeb5f617d5a292f17` — extend custom Vercel control layer with deployment cancellation.

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
