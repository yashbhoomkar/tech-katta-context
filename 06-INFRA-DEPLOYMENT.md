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
11. stop/disable placeholder overflow timer until routing exists
12. restart backend
13. local health check and verify placeholder timer is inactive
14. public smoke tests

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

### DNS verification workflow correction (2026-10-11)

The first attempt to download plain-text Cloudflare IP lists returned HTTP 403 from the runner and failed before printing DNS answers (run https://github.com/yashbhoomkar/tech-katta/actions/runs/38128721365). Branch `fix/diagnose-cloudflare-dns-api`, commit `095eb973a467610b0e4b51bba3aaae5462ac7442` (ledgered in MongoDB), switches the check to Cloudflare's documented `/client/v4/ips` API and prints DNS answers before checking ranges. It remains read-only; the rerun result is pending.

## Loopback binding hardening candidate (2026-10-11)

Branch `fix/backend-loopback-bind` contains a change to bind Node only to `127.0.0.1:5000`, matching Nginx's current upstream, and to assert the expected listener during the SSH deployment. It also changes the DNS diagnostic from a hard failure to a warning when the record is not Cloudflare-proxied, allowing the SSH inspection to continue. Commits `4d5bd7de22def2ef42b93aa2b400a38ce022a4a0` and `2fc4cf9f07c576c903e165a802edc2597d66d541` are ledgered in MongoDB. No firewall rules are changed. Not yet merged/deployed.

### Loopback deployment workflow syntax correction

Commit `d41a420c7f973af3626d9de51cd16f34edf94166` fixes YAML/script indentation after GitHub marked the branch's deployment workflow invalid. This was detected before merge and recorded in the MongoDB ledger. Recheck PR status and syntax before merge.

## Loopback binding deployment result — 2026-10-11

Commit `5e09088ba40b8060a81813e766202fcf4bb07884` deployed successfully: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987352. Backend CI passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987182. Deployment verified the service health endpoint, checked that `127.0.0.1:5000` is listening and `0.0.0.0:5000` is not, and passed 11 public endpoint checks plus CORS/security headers.

Cloudflare DNS diagnostic: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987241. It confirmed `tech-api.katta.cc` resolves directly to `129.121.133.47`, outside Cloudflare's proxy ranges. UFW was not modified; ports 80/443 must remain reachable until Cloudflare proxying is enabled and verified.

## Optional pagination and index candidate (2026-10-11)

Branch `feat/backend-pagination-indexes`, commits `56d6a79b3f9d1c65ea0e152faaa98d673043cf3a` and `41359ab7c5b5acaa65fa2e47565fa10236a56cba` (both ledgered) add opt-in article pagination and a compound index. Production smoke coverage will verify pagination headers and CORS exposure. Default article API responses remain unchanged to avoid breaking the current frontend. CI/PR/deployment pending.

## Issue #18 deployment safeguards — PR #20 candidate

- 7eb09e8ce1b418590f0444d8f0db888cca4cde95 removes NODE_TLS_REJECT_UNAUTHORIZED=0 from the production smoke command. The public API has a valid Let's Encrypt certificate from the separate prior VPS repair; this workflow change ensures future certificate regressions fail validation instead of being ignored.
- c7210d28cfe3c7d4c6757435a767667a47d4e34e sets HOST=0.0.0.0 inside Docker, while its published host port remains bound to 127.0.0.1. The application default remains loopback for the current systemd/VPS deployment.

These changes are in open PR #20 and have not been deployed. Backend and frontend CI passed on the latest PR head; CodeQL was still running at the time of this note.


### PR #20 merged — deployment safeguards (2026-10-11)

Application merge commit 56b229a2c0fa1d586f200a41c79826ed92a0446b removes the TLS verification bypass from production smoke checks and configures HOST=0.0.0.0 only inside Docker; host port publishing remains loopback-only, and the VPS systemd default remains 127.0.0.1. Backend CI, frontend build, and CodeQL passed on the PR head. The merge is recorded in MongoDB ledgers. Deployment and post-deploy smoke checks are still pending verification.


### PR #20 production rollout — 2026-10-11

Deployment run https://github.com/yashbhoomkar/tech-katta/actions/runs/38137021953 succeeded for merge commit 56b229a2c0fa1d586f200a41c79826ed92a0446b. MongoDB content sync ran successfully (5 categories, 11 articles), the systemd API restarted, local health returned 200 with DB connected and version 0.1.0, and production smoke tests passed 11 endpoint checks plus CORS/security headers using normal TLS verification. The VPS systemd listener remains loopback by default; Docker-only HOST configuration is not part of the VPS runtime. This verifies backend deployment, not a live Vercel deployment.


## Issue #18 merge deployment check (2026-10-11)

Vercel reports the deployment built from main commit 56b229a2c0fa1d586f200a41c79826ed92a0446b as READY, target=production, with alias tech.katta.cc. This verifies frontend production deployment. It does not verify the separate VPS backend deployment or live API health; check the deploy workflow and https://tech-api.katta.cc/api/health before asserting backend rollout success.


### Placeholder overflow timer disabled — 2026-10-11

PR #21 merged as `9bc56bf28f5005aff71e5e1dac8ff710fd386e5e`. Backend deployments now stop/disable `tech-katta-overflow.timer` and verify it remains inactive. The previous timer ran every 30 seconds while the script exited immediately with no `OVERFLOW_UPSTREAM`; Nginx does not consume the script's state file. This is intentionally not failover. The workflow's next main-branch deployment should apply this change to the VPS; verify that deployment run before claiming the live timer has been disabled.

### Placeholder overflow timer disablement deployed (2026-10-11)

Deployment run https://github.com/yashbhoomkar/tech-katta/actions/runs/38139715132 succeeded for `9bc56bf28f5005aff71e5e1dac8ff710fd386e5e`. Logs verify the placeholder timer was stopped/disabled, `tech-katta-api` remained active and loopback-bound, local health reported MongoDB connected, and production smoke tests passed (11 endpoint checks plus CORS/security headers).

### Direct-to-origin DNS confirmed (2026-10-11)

Diagnostic run https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987241 resolved `tech-api.katta.cc` to `129.121.133.47`, outside Cloudflare proxy ranges. Nginx proxies to `127.0.0.1:5000` and forwards `$remote_addr`/ `$proxy_add_x_forwarded_for`; the direct-client → Nginx → Express topology matches the current one-hop Express trust setting. No proxy hop or real-IP configuration was changed. UFW currently allows ports 80/443 globally, so origin restriction remains unresolved and must not be applied until Cloudflare proxying is enabled and validated.


### Static-analysis CI additions (2026-10-11)

PR #22 merged as `a39d441c8364efc65bfa4f14f944d34cd9e07cff`, adding `.github/workflows/semgrep.yml`. The workflow runs Semgrep Community Edition for JavaScript/Node/React and uploads SARIF to GitHub code scanning. Initial main-branch run passed with 0 findings across 40 files and 68 rules: https://github.com/yashbhoomkar/tech-katta/actions/runs/38140326189. CodeQL also passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38140326154.


### k6 baseline workflow added (2026-10-11)

PR #23 merged as `4d3e285b28b4356922ea016afc3838b4f1d17732`. The workflow `.github/workflows/k6-production-baseline.yml` validates the script on pull requests without sending traffic and runs a bounded baseline on main pushes that change the test/workflow files, or on explicit manual opt-in. Initial run https://github.com/yashbhoomkar/tech-katta/actions/runs/38140625020 succeeded with 156 requests, no HTTP failures, frontend p95 142.67 ms, and API p95 244.61 ms. It is not a stress/capacity test.
