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
