# 11 — Current State

## Snapshot

This document records the latest known state from the project history available when this context repository was created.

Date of context creation:

2026-10-06

Because the main repository can change independently, this is a snapshot, not a guarantee of live state.

## Frontend

Production:

`https://tech.katta.cc`

Known latest production deployment for the current mobile navigation state:

`dpl_ChCm2jSLemuXxaqcNKGUBYFNB7xX`

Known commit:

`6af1c16793d4f4dd3b9e76ce04898a9f84ba07e1`

State was recorded as READY.

## Mobile navigation

Implemented behavior:

- home right swipe -> sidebar opens
- home left swipe -> no navigation
- inner right swipe -> back
- inner left swipe -> forward
- sidebar-open left swipe -> closes
- short/vertical swipes -> ignored
- horizontal overflow content -> protected

Source fix history:

1. `13c11e23898af5b5a61d6098edfc540a691cc065`
2. `f3a4058c48f928c33e939bce9762040e6602711a`
3. `6af1c16793d4f4dd3b9e76ce04898a9f84ba07e1`

## Backend

Known production API:

`https://tech-api.katta.cc`

Known health version at one point:

`2026.10.05-production`

The API has the hardened CORS, headers, rate limit, search, slug, and graceful-shutdown controls documented in `03-backend.md`.

## Content

Distributed Systems content is active.

Canonical components overview:

`distributed-system-components-overview`

Static diagrams are active for the known Kafka and distributed-systems architecture content.

## SEO

Known files exist:

- `frontend/public/robots.txt`
- `frontend/public/sitemap.xml`
- `frontend/public/og-image.svg`

Article pages have dynamic metadata.

## Overflow

A disabled-by-default VPS-first overflow monitor exists.

Do not treat Render as a verified production overflow target unless a live, independently controlled Render Tech Katta service has been deployed and tested.

## Known unresolved / future work

These are not claims that the work is currently broken; they are areas that need live verification before relying on them:

- Vercel MCP team-scope authorization can be session-specific
- actual browser/touch testing of mobile swipes should be performed with an interactive browser
- API load capacity has not yet been correctly established at 1,000 VUs
- origin firewall/Cloudflare-only access should be verified
- VPS SSH hardening should be verified
- MongoDB backup/restore should be verified
- a real secondary overflow service should be established before enabling routing to it
- security testing should be expanded as public traffic grows

## Do not assume

Do not assume:

- the latest production deployment is still the same
- the API version is still `2026.10.05-production`
- the Render migration is a valid production failover
- the current MongoDB content is identical to historical snapshots
- a source-level gesture implementation has been browser-tested
- a successful old GitHub Actions run means today's deployment is healthy

Always verify live state for operational claims.
