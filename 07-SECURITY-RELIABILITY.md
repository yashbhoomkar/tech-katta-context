# Security, Reliability and Threat Model

## Current security posture

Tech Katta has meaningful baseline hardening, but it is not "hack-proof".

Strong areas:
- Vercel frontend hosting
- Cloudflare edge protection
- CORS restriction
- HTTP security headers
- input bounds
- regex escaping
- slug validation
- graceful shutdown
- rate limiting
- CI syntax checks
- production smoke tests

Remaining areas:
- origin exposure
- firewall configuration
- SSH hardening
- Nginx configuration
- Cloudflare origin restriction
- centralized logging/alerting
- backup and recovery validation
- dependency scanning over time
- penetration testing
- stronger distributed rate limiting if multiple instances are deployed

## API threat model

Relevant risks include:
- denial of service
- unrestricted resource consumption
- malicious search input
- security misconfiguration
- dependency vulnerabilities
- origin bypass
- MongoDB exposure
- accidental secret leakage

## Search safety

Search input is capped at 100 characters.

Regex metacharacters are escaped before being passed to MongoDB.

This prevents a user from turning the search parameter into an arbitrary regular expression.

## CORS

Production frontend origin is explicitly:

`https://tech.katta.cc`

The backend must not reflect arbitrary Origin headers.

## Rate limiting

Current:
- 120 requests per IP per minute
- in-memory

Limitation:
- not shared across processes
- not shared across machines
- IP extraction depends on trusted proxy configuration

If horizontal scaling is introduced, move this protection to Cloudflare/API gateway or shared storage.

## DDoS

Cloudflare can absorb substantial network/application-layer abuse, but Cloudflare protection does not eliminate the need to protect the origin.

The major architecture concern is:

```
Attacker
  |
  +--> Cloudflare -> protected path
  |
  +--> direct VPS IP -> potential bypass
```

Preferred target:

```
Cloudflare
   |
   +--> origin
       |
       +--> firewall accepts only Cloudflare traffic where practical
```

## MongoDB

MongoDB Atlas should not be publicly open to the entire Internet without a deliberate access-control policy.

Use:
- least-privilege database user
- network access restrictions
- rotated credentials
- no credentials in Git
- no credentials in context documentation

## Secrets

This context repository must never contain actual:
- passwords
- connection strings containing passwords
- private SSH keys
- API tokens

If a secret has been exposed in chat or logs, treat it as potentially compromised and rotate it.

## Backend process resilience

Graceful shutdown is implemented for:
- SIGTERM
- SIGINT
- uncaught exceptions

MongoDB reconnect behavior stops during shutdown.

## Failure containment

The distributed-system content and Tech Katta architecture should explicitly reason about:
- timeouts
- retries
- backoff
- circuit breakers
- rate limiting
- backpressure
- load shedding
- database saturation

Do not add retries blindly. Retries can amplify a failing dependency.

## Priority hardening backlog

1. Firewall VPS.
2. Restrict origin to Cloudflare where practical.
3. Harden SSH.
4. Audit Nginx.
5. Verify MongoDB Atlas network rules.
6. Verify backup and restore procedure.
7. Add centralized logs/alerts.
8. Add dependency vulnerability monitoring.
9. Add a controlled security test plan.
10. If multi-instance backend becomes real, replace in-memory rate limiting.

## Security reporting rule

When discussing security with the user, distinguish:
- protection currently implemented
- protection provided by infrastructure
- protection merely recommended
- protection not yet verified

Never describe a recommendation as already deployed.


## Rate-limiter hardening status (2026-10-11)

PR: https://github.com/yashbhoomkar/tech-katta/pull/1 (not merged/deployed at the time of this note).

The proposed middleware bounds in-memory client buckets, removes expired windows periodically, and derives the client key from Express's `request.ip` instead of manually trusting the first `X-Forwarded-For` value. The configured `trust proxy` hop count must match the real Cloudflare/reverse-proxy path; at the time of that change; final verification below confirms the current Cloudflare/Nginx path.

This remains a single-process limiter, not distributed rate limiting. A bounded map can evict older buckets during unusually high client-IP cardinality, which is a memory-safety trade-off and must not be presented as a hard abuse-proof guarantee. Cloudflare/origin firewalling and origin bypass prevention were completed on 2026-10-11; centralized alerting remains a separate backlog item.

### Deployment validation — 2026-10-11

The rate-limiter change is deployed as part of `a9e340cc539519a91617d390a44e98bd0547046d`. Backend deployment and production smoke tests passed. This verifies the service stayed healthy and public endpoint/CORS/security-header checks passed. At the time it did not prove visitor IP attribution; the final Cloudflare proxy/rate-limit verification below completes that follow-up.

## Explicit database failure semantics — 2026-10-11

Deployed in commit `3155342dc66bdf1e001bbfc54749f63daf1e4062`. Connected database query errors now return a generic 503 with `Retry-After: 5` and `Cache-Control: no-store`; details remain in server logs. Successful empty results and missing records are no longer masked by fallback content. Fallback is retained for known MongoDB-disconnected operation. Production smoke tests passed after deployment, but this is not a database chaos test or full failure-injection test.

## Readiness and request logging candidate (2026-10-11)

Branch `feat/backend-readiness-observability`, commit `6e77efb47d92897a92777bd47e9f9a2bc0384bc0` (not yet deployed). The proposed access log emits a generated request ID, method, path only, response status, and duration; it excludes query strings and IP addresses. `/health/live` is independent of MongoDB, while `/health/ready` reports 503 when MongoDB is disconnected. The readiness endpoint is deliberately outside the general rate limiter so monitoring is not blocked by rate-limit saturation.

## Request logging and health checks — deployed (2026-10-11)

Commit `b8a705eec61af7deb7ca47ebd36d06025df2ad22` adds a generated request correlation ID and structured access logs that deliberately exclude query strings and client IP addresses. Liveness is independent of MongoDB; readiness returns 503 when MongoDB is disconnected. Health probes bypass the general request limiter. CI and production smoke tests passed. This earlier deployment smoke did not resolve origin exposure at the time; final origin-hardening verification is recorded below.

## Proxy/origin verification step (2026-10-11)

A read-only workflow is proposed in branch `chore/inspect-vps-proxy-security` to inspect Nginx forwarding headers, exposed listening ports, UFW state, and service status over the existing GitHub Actions SSH path. Commits `5de8af322b09619b2c6f11d27770af6e26ab38fd` and `a014eb19d0241b49ce2b4b3ce6530375b4fced7a` are recorded in the MongoDB backend ledger. No firewall or proxy changes are included; hardening should be based on the observed configuration to avoid accidental lockout.

## VPS origin/proxy findings — 2026-10-11 (pre-cutover baseline; superseded below)

Read-only SSH diagnostics succeeded (https://github.com/yashbhoomkar/tech-katta/actions/runs/38128608567).

Observed configuration: Nginx forwards to `127.0.0.1:5000`, sets `X-Real-IP $remote_addr` and appends the incoming chain with `X-Forwarded-For $proxy_add_x_forwarded_for`. Express currently trusts one proxy hop. If the request path is Cloudflare → Nginx → Express, one trusted hop likely attributes `request.ip` to a Cloudflare edge IP instead of the visitor. Verify public DNS/proxy status before changing to two trusted hops.

UFW is active with default deny incoming, but 80/443 are open from any IPv4/IPv6 source, so direct-origin requests can bypass Cloudflare. Port 5000 listens on all interfaces but has no UFW allow rule; loopback binding is preferable defense-in-depth. SSH 22 is open globally and must not be restricted without a known, reliable admin source IP or alternate access path.

Cloudflare's official documentation recommends allowlisting its current origin IP ranges and blocking other direct HTTP/HTTPS sources for proxied hostnames: https://developers.cloudflare.com/fundamentals/concepts/cloudflare-ip-addresses/. Before applying rules, verify DNS is proxied and ensure both IPv4 and IPv6 Cloudflare ranges are covered.

### Verify Cloudflare proxy before origin firewall changes

A workflow update (`1d6b5e5b885226dfc37e1fb2ada68fcfad2a4dd7`, ledgered in MongoDB) will verify that every public `tech-api.katta.cc` DNS address belongs to the official Cloudflare proxy ranges before origin restrictions are applied. It downloads the current ranges from Cloudflare's official `ips-v4` and `ips-v6` endpoints rather than embedding a stale list. It is read-only.

### Cloudflare range check adjustment (2026-10-11)

The first range-check run failed because `www.cloudflare.com/ips-v4` returned HTTP 403 to the GitHub runner, before the DNS answers were printed. No firewall or proxy changes occurred. Commit `095eb973a467610b0e4b51bba3aaae5462ac7442` updates the workflow to use Cloudflare's documented `/client/v4/ips` API and prints DNS answers first. Wait for its result before making origin restrictions.

## Loopback bind candidate and Cloudflare status (2026-10-11)

The DNS check found `tech-api.katta.cc` resolves to the VPS origin address rather than a Cloudflare edge IP. Therefore Cloudflare proxying is currently not active for this API hostname, and origin firewall restrictions to Cloudflare ranges would break traffic. Do not apply those rules yet.

Branch `fix/backend-loopback-bind` proposes binding Express to `127.0.0.1:5000` and verifying that binding in deployment. This is defense-in-depth independent of Cloudflare and matches Nginx's configured upstream. The existing `trust proxy: 1` is appropriate for the currently observed direct-client → Nginx → Express path, where Nginx appends the direct peer address to XFF. Revisit trust hops if Cloudflare proxying is enabled later. Commits `4d5bd7de22def2ef42b93aa2b400a38ce022a4a0` and `2fc4cf9f07c576c903e165a802edc2597d66d541` are recorded in MongoDB; PR/deployment pending.

### Loopback deployment check review

The initial branch revision accidentally placed socket assertions outside the YAML SSH script and caused GitHub to mark the workflow invalid. Commit `d41a420c7f973af3626d9de51cd16f34edf94166` corrects the indentation. No production deployment was triggered from the branch because the deployment workflow is configured for `main` pushes only.

## Loopback listener hardening — deployed (2026-10-11)

Commit `5e09088ba40b8060a81813e766202fcf4bb07884` now binds Node to `127.0.0.1:5000`. The deployment pipeline checks the listener and public smoke tests passed. This removes the direct network listener on port 5000 while preserving Nginx access.

This was the pre-cutover state observed on 2026-10-11. It is superseded by the completed proxy/firewall cutover and verification below. Official Cloudflare origin-protection guidance: https://developers.cloudflare.com/fundamentals/concepts/cloudflare-ip-addresses/.

## TLS verification and Vercel scope — PR #20 candidate

- Production smoke tests no longer disable Node TLS verification (7eb09e8ce1b418590f0444d8f0db888cca4cde95). This relies on the already repaired public certificate and deliberately fails if trust validation regresses.
- The legacy Vercel control CLI no longer embeds a fixed team ID (67355276f3f8eb88c002c7255849f0164c1985a7). It uses an explicit VERCEL_TEAM_ID when configured and otherwise relies on the token's default scope.

Both are pending PR #20 review/merge; no production rollout is claimed.


### TLS and Vercel scope hardening merged — 2026-10-11

PR #20 merged as 56b229a2c0fa1d586f200a41c79826ed92a0446b. Production smoke checks now use standard certificate validation, and the legacy Vercel CLI no longer embeds a team ID. Backend CI and CodeQL passed on the PR head. Production deployment and a fresh public TLS smoke test have not yet been verified.


### TLS verification hardening deployed — 2026-10-11

PR #20 merge 56b229a2c0fa1d586f200a41c79826ed92a0446b deployed successfully. Production smoke tests passed 11 endpoint checks plus CORS/security headers without NODE_TLS_REJECT_UNAUTHORIZED override: https://github.com/yashbhoomkar/tech-katta/actions/runs/38137021953. This confirms the public API TLS chain validated during the smoke run. It does not resolve origin exposure or prove Cloudflare/Nginx client-IP handling.


### Cloudflare proxy/IP attribution rechecked before cutover (2026-10-11)

Read-only diagnostic run https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987241 resolved `tech-api.katta.cc` to the VPS origin `129.121.133.47`, outside Cloudflare's published proxy ranges. Cloudflare proxying is not active for this hostname in the observed state. Nginx sets `X-Real-IP $remote_addr` and `X-Forwarded-For $proxy_add_x_forwarded_for`; Express trusting one Nginx hop is consistent with the current direct-client → Nginx → Express topology. Do not configure Cloudflare-only trusted ranges or change hop count until DNS/proxy state actually changes.

This paragraph records the pre-cutover risk. The controlled DNS/Cloudflare migration and origin-hardening change were completed and independently verified below.


## Audit follow-up issue map (2026-10-11)

- **Issue #28 — Cloudflare proxy cutover and origin ingress restriction:** closed as completed after verified Cloudflare proxying, strict TLS, Nginx real-IP normalization, spoofed-XFF rate-limit attribution, Cloudflare-only UFW ingress, SSH preservation, and direct-origin blocking.
- **Issue #29 — Real overflow failover:** the placeholder timer remains disabled. No secondary upstream or working failover path exists.
- **Issue #30 — Free AI code review:** `.coderabbit.yaml` is configured, but the GitHub app has not produced substantive review evidence. Do not count CI/static analysis as AI review.
- **Issue #31 — Search scalability:** preserve case-insensitive substring semantics; reconsider indexing only when scale or measured latency justifies it.

Issue #18 remains open as the umbrella audit. Its resolved items are tracked in the issue comments; do not close it until the remaining work is genuinely complete.


## Final Cloudflare origin protection state (2026-10-11)

Production hardening completed in workflow run https://github.com/yashbhoomkar/tech-katta/actions/runs/38165442874.

- DNS for tech-api.katta.cc is proxied through Cloudflare. SSL/TLS is Full (strict), Always Use HTTPS is enabled, and minimum TLS is 1.2.
- Nginx uses the official Cloudflare IPv4/IPv6 CIDRs for set_real_ip_from, sets real_ip_header to CF-Connecting-IP, and enables real_ip_recursive. Nginx config test, reload, and local API health passed.
- Three requests with different spoofed X-Forwarded-For values stayed in one rate-limit bucket (118 → 117 → 116).
- UFW default incoming policy is deny. Ports 80/443 allow only 15 official Cloudflare IPv4 and 7 IPv6 CIDRs. Broad Anywhere web rules are absent; IPv4 and IPv6 SSH/22 rules are preserved.
- Public API health/database/CORS checks passed after firewall application. Independent Vercel Mumbai checks returned HTTP 200 through Cloudflare and confirmed direct-origin ports 80 and 443 time out.
- Cloudflare CIDRs are refreshed weekly. Issue #28 is closed. The umbrella issue #18 remains open for other findings, including capacity, search scalability, and actual overflow failover.


## Runtime MongoDB credential rotation preparation — PR #75 (2026-10-12)

Read-only Atlas inspection found one database user in project `tech-katta`: `bhoomkar04`, with the broad `atlasAdmin` role on `admin`. The previous credential was exposed during earlier experimentation and must be treated as compromised until rotated.

PR #75 added a guarded, manual-only workflow using repository secret `TECH_KATTA_MONGODB_URI_ROTATED`. Before touching the VPS env file, its helper connects with the candidate URI, requires exactly one `readWrite` role on `techkatta`, and verifies database access. It then atomically replaces only the `MONGODB_URI` line, retains a mode-0600 rollback file, restarts the API, verifies readiness/categories/articles, and rolls back on failure. Backend CI and CodeQL passed; no new alerts remain.

**This is preparation, not a completed rotation.** No Atlas user was created, no credential changed, and no production file was modified by the PR. An authorized operator must create/rotate the least-privilege user in Atlas and save the new URI directly as the GitHub Actions repository secret. Do not paste the URI/password into chat or GitHub issues. Only after the guarded workflow passes should the old broad credential be revoked.

Issue #70 remains open until the rotation is verified. The overflow timer remains disabled and issue #29 remains blocked.


## Additional credential boundary: ledger maintenance (2026-10-12)

The app runtime URI must be least-privilege: exactly `readWrite` on `techkatta`. The ledger migration/repair/inspection/index-verification workflows are a separate trust boundary because they access `techkatta_history` and some can create/drop indexes or modify backup/ledger documents.

Before the old `atlasAdmin` credential is revoked, provision a separate maintenance identity scoped to `readWrite` + `dbAdmin` on `techkatta_history` only, store it as GitHub Actions secret `TECH_KATTA_LEDGER_MAINTENANCE_URI`, and update the manual maintenance workflows to use that secret rather than loading the VPS runtime `.env`. Do not run those workflows after the app runtime URI has been rotated until the separation is implemented and verified. The secret has not yet been created; issue #70 remains open.
