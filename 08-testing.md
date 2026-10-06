# 08 — Testing

## Testing philosophy

Tech Katta should distinguish:

1. static/source validation
2. integration/API testing
3. production smoke testing
4. browser interaction testing
5. load/stress testing
6. security testing

Passing one category does not prove another.

## Production smoke tests

Canonical script:

`scripts/production-smoke.mjs`

Coverage:

- home page
- unit page
- article page
- API health
- categories
- articles
- canonical article
- regex-safe search
- invalid slug
- allowed CORS
- attacker-origin CORS behavior
- security headers

## Load testing

k6 was installed locally on Apple Silicon.

A previous 50-VU / 30-second run produced misleading API failure results because the API certificate was rejected by the local k6 client:

```
x509: certificate signed by unknown authority
```

Therefore that run **did not measure API capacity**.

Known metrics from that run included approximately:

- 913 requests
- 27.75 req/s
- average HTTP duration ~12.47 ms
- p95 ~24.18 ms
- failure rate ~29.46%

But the failures were dominated by TLS validation, so these numbers must not be interpreted as Tech Katta's API capacity.

## Corrected k6 approach

For controlled testing only, the API request can use:

```js
http.get(url, {
  insecureSkipTLSVerify: true,
  tags: { type: 'api' },
});
```

This option is for the test client only.

Never disable TLS verification in production.

## Suggested load progression

Do not jump immediately to an arbitrary 1,000-user claim.

Use staged tests:

- 10 VUs
- 50 VUs
- 100 VUs
- 250 VUs
- 500 VUs
- 1,000 VUs

Measure:

- p50
- p95
- p99
- error rate
- throughput
- CPU
- memory
- active connections
- MongoDB latency/connections
- event-loop pressure

## Overflow testing

If implementing VPS-first overflow, test the actual trigger signal rather than assuming:

"1,000 concurrent users = overloaded."

A better trigger considers:

- CPU saturation
- memory pressure
- p95 latency
- error rate
- active connections
- health-check failures

Use hysteresis to prevent:

```
VPS -> secondary -> VPS -> secondary
```

flapping.

## Browser testing

Browser testing is mandatory for interaction-heavy UI.

For mobile swipe navigation, test:

### Home

- right swipe opens sidebar
- left swipe does nothing

### Article

- right swipe goes back
- left swipe goes forward

### Sidebar

- left swipe closes sidebar

### Gesture rejection

- short swipe ignored
- vertical scroll ignored
- diagonal gesture without enough horizontal dominance ignored

### Horizontal content

- code block horizontal scrolling remains usable
- table horizontal scrolling remains usable
- diagram container scrolling remains usable

### Browser history

Test with real history states, not just isolated route loads.

## Known browser-testing limitation

In one ChatGPT session, Vercel MCP returned a 403 for team scope and prevented creation/access of a Vercel sandbox.

Another new ChatGPT session under the same account was able to access Vercel.

This indicates a connector-session issue, not evidence that the production site is broken.

## Testing rule

Never report:

"tested"

when only source inspection occurred.

Use precise language:

- "source-inspected"
- "build-verified"
- "API smoke-tested"
- "production-tested"
- "browser-tested"
- "load-tested"

This distinction is important for future agents.
