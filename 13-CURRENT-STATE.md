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