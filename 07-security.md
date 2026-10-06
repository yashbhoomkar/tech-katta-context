# 07 — Security

## Current posture

Tech Katta has received meaningful baseline hardening, but it is not "hack-proof".

The security model has three major layers:

1. edge/network protection
2. application/API hardening
3. database and infrastructure controls

## Cloudflare

Cloudflare is the intended edge layer.

Cloudflare can absorb/mitigate large classes of DDoS traffic, but origin exposure still matters.

A major architectural concern is the publicly reachable VPS origin IP:

`129.121.133.47`

If an attacker can bypass Cloudflare and hit the origin directly, Cloudflare's edge protections do not protect that direct path.

Long-term goal:

- only Cloudflare should reach the public API origin
- firewall should restrict inbound traffic where practical
- Nginx/proxy should validate expected traffic
- origin IP should not be casually exposed

## OWASP-style API threats

Relevant classes include:

- broken object-level authorization
- broken authentication
- unrestricted resource consumption
- security misconfiguration
- improper API inventory
- unsafe consumption of APIs
- SSRF where applicable

The current API is primarily read-oriented, which reduces some risk, but it does not eliminate abuse.

## Current Express hardening

Implemented:

- strict CORS
- security headers
- body-size limit
- rate limiting
- search regex escaping
- input caps
- slug validation
- graceful shutdown
- controlled methods

## Rate limiting limitation

The limiter is in-memory.

It works for one process, but if Tech Katta becomes multi-instance or uses overflow routing, each instance can have an independent counter.

A future distributed limiter could use:

- Cloudflare rate limiting
- Redis
- another shared edge store

Do not add Redis merely because it is fashionable; add it when the traffic architecture requires shared state.

## MongoDB Atlas

MongoDB should not be exposed broadly to the Internet.

Preferred controls:

- strong unique credentials
- least-privilege database user
- network access restrictions
- TLS
- audit/logging where appropriate
- tested backups

The connection string must never be committed.

## Credential incident

A database password was explicitly pasted into an earlier chat.

Do not document the password itself.

Treat the credential as compromised and rotate it if that has not already happened.

## SSH

The VPS should be hardened separately from Express:

- key-based authentication
- disable password SSH where appropriate
- restrict root login
- firewall
- patching
- fail2ban or equivalent where justified
- minimal exposed ports

These items are recommendations unless the live VPS configuration confirms implementation.

## Secrets

Never put production secrets in:

- Git
- Markdown context files
- frontend code
- client-side environment variables
- logs
- screenshots

Use deployment secret stores/environment variables.

## Backups

A backup that has never been restored is not a verified recovery strategy.

Future hardening should include:

1. automated MongoDB backups
2. retention policy
3. restore test
4. documented RTO/RPO
5. VPS recovery procedure
6. DNS recovery procedure

## Security testing

A future serious security pass should test:

- direct origin access
- CORS behavior
- malformed slugs
- regex abuse
- rate-limit exhaustion
- oversized JSON
- HTTP method abuse
- header injection
- dependency vulnerabilities
- MongoDB network exposure
- SSH exposure
- Nginx configuration
- Cloudflare origin rules
- backup restoration

Do not perform destructive security testing against production without explicit authorization and a controlled plan.
