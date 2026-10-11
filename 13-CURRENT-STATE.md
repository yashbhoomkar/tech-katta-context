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