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

The proposed middleware bounds in-memory client buckets, removes expired windows periodically, and derives the client key from Express's `request.ip` instead of manually trusting the first `X-Forwarded-For` value. The configured `trust proxy` hop count must match the real Cloudflare/reverse-proxy path; until verified, client-IP attribution is an open production-validation item.

This remains a single-process limiter, not distributed rate limiting. A bounded map can evict older buckets during unusually high client-IP cardinality, which is a memory-safety trade-off and must not be presented as a hard abuse-proof guarantee. Cloudflare/origin firewalling, centralized alerting, and origin bypass prevention remain separate backlog items.

### Deployment validation — 2026-10-11

The rate-limiter change is deployed as part of `a9e340cc539519a91617d390a44e98bd0547046d`. Backend deployment and production smoke tests passed. This verifies the service stayed healthy and public endpoint/CORS/security-header checks passed; it does **not** independently prove that `request.ip` maps to the actual visitor IP through every Cloudflare/reverse-proxy path. Keep that topology verification as an explicit follow-up.

## Explicit database failure semantics — 2026-10-11

Deployed in commit `3155342dc66bdf1e001bbfc54749f63daf1e4062`. Connected database query errors now return a generic 503 with `Retry-After: 5` and `Cache-Control: no-store`; details remain in server logs. Successful empty results and missing records are no longer masked by fallback content. Fallback is retained for known MongoDB-disconnected operation. Production smoke tests passed after deployment, but this is not a database chaos test or full failure-injection test.

## Readiness and request logging candidate (2026-10-11)

Branch `feat/backend-readiness-observability`, commit `6e77efb47d92897a92777bd47e9f9a2bc0384bc0` (not yet deployed). The proposed access log emits a generated request ID, method, path only, response status, and duration; it excludes query strings and IP addresses. `/health/live` is independent of MongoDB, while `/health/ready` reports 503 when MongoDB is disconnected. The readiness endpoint is deliberately outside the general rate limiter so monitoring is not blocked by rate-limit saturation.