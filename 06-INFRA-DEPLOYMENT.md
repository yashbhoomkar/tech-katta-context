# Infrastructure and Deployment

## Production domains

Frontend:
`https://tech.katta.cc`

Backend:
`https://tech-api.katta.cc`

## Vercel

Project:
- `tech-katta`

Project ID:
- `prj_7GIELC6DNWbKJSaluZwo373Pn8ZF`

Team:
- ID `team_ESVBoCGScxPRCW4TxwcTeJCg`
- slug `yashbhoomkars-projects`

Frontend is connected to GitHub and production deployments are generated from the repository.

Latest documented production deployment at the time of this context snapshot:
- deployment: `dpl_ChCm2jSLemuXxaqcNKGUBYFNB7xX`
- state: READY
- production
- commit: `6af1c16793d4f4dd3b9e76ce04898a9f84ba07e1`

## Vercel MCP issue

At one point this conversation's Vercel MCP session repeatedly returned:

```
403 Forbidden
Not authorized: Trying to access resource under scope "yashbhoomkars-projects"
```

A separate newly opened ChatGPT conversation using the same account was able to access Vercel, proving the authorization itself was valid and the problem was session-specific.

Do not interpret that 403 as a Tech Katta deployment failure.

## Internal Vercel control

The backend now contains a private environment-authenticated Vercel REST control layer independent of the ChatGPT Vercel MCP:

- `backend/src/vercel/client.js`
- `backend/src/vercel/projects.js`
- `backend/src/vercel/deployments.js`
- `backend/src/vercel/index.js`

Application commits:
- `193a11293b10d43534c34fa8b902d24dd12e6cac` — add Vercel API client
- `102d23221272e861c5ac6ca76aecb08cd5aca5ab` — add control operations and CLI

It uses Node 22 native `fetch` and requires:
- `VERCEL_ACCESS_TOKEN` — secret
- `VERCEL_TEAM_ID` — optional team scope

The token is never stored in Git or documentation and the control layer is not exposed through the public Express API.

Token-authenticated Vercel execution is still pending until the CLI is run from a network-enabled trusted environment with the token configured.

## GitHub Actions

### Frontend CI

`.github/workflows/ci-frontend.yml`

Triggers:
- pushes to main affecting frontend
- pull requests affecting frontend

Runs:
- Node 22
- npm ci
- npm run build

### Backend deployment

`.github/workflows/deploy-backend.yml`

Triggers:
- pushes to main affecting backend/scripts/workflow
- manual workflow dispatch

Pipeline:
1. checkout
2. Node 22
3. npm ci
4. syntax checks
5. overflow script shell check
6. SSH to VPS
7. reset VPS working tree to origin/main
8. npm ci --omit=dev
9. write production systemd environment override
10. seed MongoDB
11. install overflow monitor
12. restart backend
13. local health check
14. timer health check
15. public smoke tests

Production environment override:

```
NODE_ENV=production
FRONTEND_ORIGIN=https://tech.katta.cc
```

## VPS

Origin:
- IP: `129.121.133.47`
- service: `tech-katta-api`
- directory: `/opt/tech-katta`
- user: `techkatta`

The current backend is systemd-managed.

The origin IP being directly reachable is a security concern because attackers could potentially bypass Cloudflare.

## Cloudflare

Cloudflare is used for domain/DNS/edge handling.

Desired architecture is:

```
Internet
   |
Cloudflare
   +--> tech.katta.cc -> Vercel
   +--> tech-api.katta.cc -> VPS
```

A future hardening step should restrict VPS origin traffic to Cloudflare IP ranges where feasible.

## MongoDB Atlas

Application:
- project `tech-katta`
- cluster `Cluster0`
- database `techkatta`

History:
- database `techkatta_history`

Never document credentials.

## Deployment verification

A deployment is not considered fully verified merely because a build succeeded.

Preferred verification layers:
1. CI build
2. service status
3. local health endpoint
4. public API smoke tests
5. frontend route smoke tests
6. browser testing when UI behavior changed

## Rollback

Git is the primary rollback mechanism.

For a bad frontend change:
- identify known-good commit
- revert or restore deliberately
- deploy
- verify

For backend:
- revert source
- deploy workflow
- seed if content changed
- verify health and smoke tests

Do not use force-push as a casual rollback mechanism.
