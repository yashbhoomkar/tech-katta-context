# Current State Snapshot

**Snapshot date:** 2026-10-07

This file records what was actually observed during context creation.

## Application repository

`yashbhoomkar/tech-katta`

Branch:
`main`

Current HEAD:
`58dd2890658299f72ac11d8ebccf17d1fdc37341`

Latest backend commit adds `backend/src/vercel-control.js`, an internal environment-authenticated Vercel REST client/CLI. It is independent of the ChatGPT Vercel MCP integration and does not expose Vercel control through the public API.

Vercel control:
- token: `VERCEL_ACCESS_TOKEN` (environment only)
- team: `VERCEL_TEAM_ID`, defaulting to the Tech Katta team
- supported: projects, deployments, deployment inspection, deployment cancellation, access check

The application commit is recorded in the MongoDB backend ledger.

The application commit was deployed to the VPS successfully by GitHub Actions run `37721404338`: syntax checks, SSH deployment, service verification, and production smoke tests all passed. The control file itself has not yet been token-authenticated against the live Vercel API because this ChatGPT runtime cannot reach `api.vercel.com`. Treat Vercel API execution as pending until the file is run on the VPS with `VERCEL_ACCESS_TOKEN` configured.

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
