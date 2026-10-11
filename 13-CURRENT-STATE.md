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