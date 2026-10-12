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

**Current state (2026-10-11):** PR #21 changes backend deployments to stop and disable `tech-katta-overflow.timer` rather than installing/enabling the no-op timer. Deployment verification fails if that placeholder timer remains active. The existing unit files may remain on disk but are not intended to be enabled.

The timer was disabled because the monitor exits when `OVERFLOW_UPSTREAM` is unset, and even when configured it only writes a state file that Nginx does not consume. It is not a working traffic router. Keep the primary VPS API running normally; do not enable this timer until a compatible secondary and real proxy integration are implemented and tested.

Application merge commit: `9bc56bf28f5005aff71e5e1dac8ff710fd386e5e`. The merge-triggered VPS deployment is verified: https://github.com/yashbhoomkar/tech-katta/actions/runs/38139715132 completed successfully. Logs confirm the placeholder timer was disabled/stopped and the primary API remained healthy. The no-op timer finding is resolved; real overflow routing remains unimplemented and must not be enabled until the secondary and proxy integration are ready.

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


## Render inventory re-check (2026-10-12)

The connected Render workspace was queried again. It contains only these Life Katta / Life With Yash services:

- `life` — static frontend, suspended.
- `life.yash` — static frontend.
- `yash` — static frontend, suspended.
- `lifewithyash` — Life With Yash backend, free plan, Singapore region.

There is no dedicated Tech Katta Render service. The existing `lifewithyash` backend must not be repurposed as an overflow target: its repository and ownership are for Life With Yash, and it is not a verified Tech Katta deployment. A new secondary remains blocked until the previously exposed MongoDB credential is confirmed rotated, the dedicated service has correct secrets and health checks, and the VPS-to-secondary failover path is validated in staging. Do not enable the overflow timer or route traffic to the Life With Yash service.
