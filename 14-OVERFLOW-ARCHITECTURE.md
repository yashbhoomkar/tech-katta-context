# VPS-Primary / Render-Overflow Architecture

## User's intended model

The desired architecture is:

- VPS is the fast primary.
- Render is a slower secondary.
- Normal operation sends 100% of traffic to VPS.
- Render receives traffic only when VPS is overloaded or unhealthy.
- If VPS fails, Render may act as failover.
- When VPS recovers, traffic returns to VPS.

This is **overflow/failover**, not ordinary load balancing.

Do not describe it as:
- 70/30 traffic splitting
- round-robin load balancing
- active-active balancing

## Why not use a simple "1,000 users" threshold?

Concurrent users are not a reliable saturation signal.

Better signals:
- CPU
- memory
- API p95 latency
- API error rate
- active connections
- health endpoint failures
- MongoDB latency/pool saturation

The system should use hysteresis so it does not repeatedly switch between primary and overflow.

## Current script

`scripts/vps-overflow-router.sh`

Important defaults:
- primary health URL: `http://127.0.0.1:5000/api/health`
- enter CPU: 85%
- exit CPU: 65%
- failures to enter overflow: 3
- healthy checks to exit: 5
- check interval: 30 seconds

The script calculates CPU using `/proc/stat`.

It checks the local API with curl and stores state in:

`/run/tech-katta-overflow.state`

## Safety behavior

The critical safety feature is:

If `OVERFLOW_UPSTREAM` is empty, the script exits without changing routing.

This means the monitor can be deployed before a secondary exists without accidentally sending traffic somewhere.

## Systemd

The deployment workflow installs:
- `tech-katta-overflow.service`
- `tech-katta-overflow.timer`

Timer:
- starts after boot
- runs every 30 seconds

## Important current limitation

The script currently **does not modify Nginx**.

Therefore, installing the monitor does not by itself route traffic to Render.

A future implementation needs:
1. a real Render Tech Katta-compatible backend
2. routing/proxy integration
3. a safe mechanism to switch upstreams
4. validation that MongoDB state is shared correctly
5. failover testing
6. recovery testing
7. hysteresis validation
8. observability

## Render service history

A separate Render service was explored:
- `lifewithyash`
- repo `yashbhoomkar/life-withyash`
- branch `working`
- root `backend/`

Tech Katta backend files were temporarily copied there during experimentation.

This service originally belonged to Life With Yash. It must **not** be treated as a production Tech Katta overflow target merely because Tech Katta-compatible files were copied into it.

A separate Tech Katta Render service creation was attempted but blocked by platform safety checks around the supplied MongoDB credential.

## Credential safety

A MongoDB URI/password was previously pasted into chat during Render experimentation.

Do not reproduce it here.

Treat exposed credentials as potentially compromised and rotate them if they have not already been rotated.

## Future routing design

Preferred conceptual flow:

```
Internet
   |
Cloudflare
   |
tech-api.katta.cc
   |
edge/proxy
   |
   +-- primary: VPS
   |
   +-- overflow: Render
```

Routing state:
- PRIMARY
- OVERFLOW

Entry:
- sustained CPU saturation
- repeated local health failures
- preferably API latency/error signals too

Exit:
- healthy API
- CPU below lower threshold
- several consecutive healthy checks

## Failure modes to test

1. VPS CPU saturation.
2. VPS process crash.
3. VPS network failure.
4. MongoDB latency.
5. Render backend unavailable.
6. Proxy configuration failure.
7. State flapping.
8. recovery to VPS.
9. shared database consistency.
10. cache differences between backends.

## Do not deploy overflow routing until

- the secondary is actually Tech Katta-compatible
- secrets are configured securely
- health checks are meaningful
- routing changes are atomic/safe
- recovery is tested
- direct-origin access is considered
- monitoring exists
