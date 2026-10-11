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


## Backend hardening PR and deployment workflow correction (2026-10-11)

PR: https://github.com/yashbhoomkar/tech-katta/pull/1, branch `refactor/backend-hardening-phase-1`.

The PR is not merged and its backend changes have not been deployed to the VPS. A stale syntax-check command in `.github/workflows/deploy-backend.yml` referenced `backend/src/vercelClient.js`, while the current module layout is `backend/src/vercel/{client,projects,deployments,index}.js`. The branch corrects the workflow to validate the actual module paths before deployment.

After merge, the expected production path is the existing GitHub Actions SSH deployment workflow. Deployment is only considered successful after the workflow completes its service health checks and public smoke tests. Direct SSH access from the ChatGPT runtime is not established.

### 2026-10-11 deployment result

Backend deployment run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128036897 — **success** for application commit `a9e340cc539519a91617d390a44e98bd0547046d`. GitHub Actions connected to the VPS over SSH, reset `/opt/tech-katta` to `origin/main`, installed production dependencies, seeded MongoDB (5 categories and 11 articles), restarted `tech-katta-api`, confirmed the local health endpoint reported MongoDB connected, and passed public smoke tests (9 endpoint checks plus CORS and security headers). The backend CI push run also passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128036905.

## Database fallback change deployed — 2026-10-11

Commit `3155342dc66bdf1e001bbfc54749f63daf1e4062` was deployed through GitHub Actions run https://github.com/yashbhoomkar/tech-katta/actions/runs/38128191751. The deployment, service health check, and public production smoke suite succeeded. Backend CI also passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128191731.

The API now uses fallback content only when MongoDB is disconnected. Connected-but-empty query results remain empty; connected database query errors return HTTP 503 rather than stale fallback data. The existing seed step completed during deployment, and the smoke suite passed.

## Content-route modularization deployment — 2026-10-11

Commit `a806fab3f94a00172d55fafdb73ea9ca7dc71810` deployed successfully through https://github.com/yashbhoomkar/tech-katta/actions/runs/38128338288. Backend CI passed at https://github.com/yashbhoomkar/tech-katta/actions/runs/38128338279. The existing VPS deployment pipeline, seeding step, health checks, and public smoke tests all completed successfully.

## Readiness checks candidate (2026-10-11)

Branch `feat/backend-readiness-observability`, commit `6e77efb47d92897a92777bd47e9f9a2bc0384bc0`, adds `/health/live` and `/health/ready` and expands the public smoke test to check both. The deployment workflow continues to use the legacy local `/api/health` check; the new readiness endpoint is checked by the public smoke suite after deployment. Not yet merged/deployed.

## Readiness/observability deployment — 2026-10-11

Commit `b8a705eec61af7deb7ca47ebd36d06025df2ad22` deployed successfully. CI: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128466934. VPS deployment and production smoke tests: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128466902. The expanded smoke suite includes `/health/live` and `/health/ready`; deployment succeeded with MongoDB connected.

## Read-only VPS proxy diagnostics workflow candidate (2026-10-11)

Branch `chore/inspect-vps-proxy-security` contains:
- `5de8af322b09619b2c6f11d27770af6e26ab38fd` — add a read-only SSH diagnostics workflow
- `a014eb19d0241b49ce2b4b3ce6530375b4fced7a` — correct its listener-port filter

Both application/workflow commits are recorded in the MongoDB backend ledger. The workflow is designed to run on merge (and support manual dispatch) and report only selected Nginx proxy directives, listening ports, UFW status, and service state. It does not change firewall or Nginx configuration. PR/diagnostic output is pending.

## VPS proxy/firewall inspection — 2026-10-11

Read-only diagnostics ran successfully through GitHub Actions: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128608567.

Observed on the VPS:
- Nginx and `tech-katta-api` are active.
- `tech-api.katta.cc` Nginx vhost listens on 443 (IPv4 and IPv6) and proxies to `http://127.0.0.1:5000`.
- Nginx sets `X-Real-IP $remote_addr` and `X-Forwarded-For $proxy_add_x_forwarded_for`.
- UFW is active with default incoming deny, but allows ports 22, 80, and 443 from anywhere (IPv4 and IPv6).
- Node listens on `0.0.0.0:5000`; UFW has no allow rule for 5000, but binding to loopback would add defense in depth.

These findings confirm that the current Express `trust proxy: 1` likely uses the Cloudflare edge address as `request.ip` for proxied requests when Nginx appends its peer address to X-Forwarded-For. Verify public DNS resolves to Cloudflare proxy addresses before changing trust hops or firewall rules. Do not remove SSH access as part of origin hardening.

### Cloudflare DNS verification candidate (2026-10-11)

Branch `chore/verify-cloudflare-dns`, commit `1d6b5e5b885226dfc37e1fb2ada68fcfad2a4dd7` (recorded in the MongoDB backend ledger) extends the read-only VPS diagnostic workflow to resolve `tech-api.katta.cc` and compare every resolved address with the official Cloudflare IPv4/IPv6 ranges fetched at runtime. This is a diagnostic check only; it makes no DNS, firewall, or proxy changes. PR and execution result are pending.