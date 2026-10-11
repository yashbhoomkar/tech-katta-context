# API Origin-Exposure Hardening Plan

**Status:** pending Cloudflare DNS access and a controlled cutover. This document is a runbook, not evidence that any DNS, firewall, or Nginx change has been applied.

## Observed baseline (2026-10-11)

- API hostname: `tech-api.katta.cc`
- Origin: `129.121.133.47`
- Read-only diagnostic: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987241
- DNS resolves directly to `129.121.133.47`, outside Cloudflare proxy ranges.
- Public API traffic currently follows **client → VPS Nginx → Express**.
- Nginx proxies to `127.0.0.1:5000` and forwards `X-Real-IP: $remote_addr` and `X-Forwarded-For: $proxy_add_x_forwarded_for`.
- Express has `trust proxy = 1`; the in-memory rate limiter keys by Express `request.ip`.
- The latest successful VPS deployment run https://github.com/yashbhoomkar/tech-katta/actions/runs/38141089672 verifies the API listens on `127.0.0.1:5000`, not `0.0.0.0:5000`.
- UFW allows inbound 80/443 from anywhere (IPv4 and IPv6). This is required for current direct-origin traffic.

## Safety constraints

1. **Do not restrict ports 80/443 to Cloudflare ranges while DNS is direct-to-origin.** Doing so would break the current public API.
2. Do not change Express proxy trust hops merely because Cloudflare is intended in the future. The current observed topology has one proxy hop.
3. Do not trust `CF-Connecting-IP` from arbitrary peers. Nginx must only use that header when the socket peer belongs to an official Cloudflare IP range.
4. Preserve SSH access (port 22) independently from web-origin changes. Never broadly replace SSH rules during this cutover.
5. Do not enable the overflow timer or introduce an unverified secondary upstream as part of origin hardening.
6. Keep each step reversible and verify the public API after each production change.

## Recommended cutover sequence

### Phase A — prerequisites and baseline

- Confirm Cloudflare account/zone access and the current DNS record for `tech-api.katta.cc`.
- Confirm the origin certificate is valid for `tech-api.katta.cc` and that ordinary TLS verification succeeds. The production smoke workflow must not disable certificate validation.
- Capture the current DNS record type, target, proxy status, TTL, TLS mode, and current API health response for rollback.
- Confirm the API still listens only on `127.0.0.1:5000` and Nginx is the only public HTTP(S) entry point.

### Phase B — enable proxying without changing the firewall

- Enable Cloudflare proxying (orange cloud) for the API DNS record.
- Use Cloudflare **Full (strict)** TLS mode only after the origin certificate chain/hostname has been verified as valid for that mode.
- Keep UFW ports 80/443 open to the public during initial verification. The origin IP remains discoverable and reachable during this transitional phase; this is intentional to avoid an outage.
- Verify from an independent runner that DNS now returns Cloudflare edge addresses, the API health endpoint responds, frontend-to-API CORS still works, and the browser-visible API certificate is valid.
- If verification fails, revert the DNS record to its recorded prior value and re-test the direct-origin route.

### Phase C — normalize client IPs safely at Nginx

Once requests are demonstrably arriving through Cloudflare, configure Nginx's real-IP module with the official Cloudflare IPv4 and IPv6 CIDRs and `real_ip_header CF-Connecting-IP;`. Use `set_real_ip_from` only for those official networks and keep the CIDR list maintainable from Cloudflare's published source.

- Test Nginx configuration with `nginx -t` before reload.
- Reload Nginx only after a successful syntax check.
- Confirm that requests through Cloudflare produce the expected client address in Nginx's real-IP handling.
- Retain Express `trust proxy = 1` only if the verified Nginx-to-Express forwarded chain continues to present the normalized client IP as its rightmost address. Do not switch to `trust proxy = 2` blindly.
- Add a controlled integration test for the exact proxy chain, including an attacker-supplied leftmost `X-Forwarded-For` value, to verify that the rate limiter buckets by the normalized client IP rather than a spoofed value or Cloudflare edge IP.
- Do not log raw client IPs just to make this test easier; use a temporary test harness or privacy-conscious diagnostics.

### Phase D — restrict origin ingress

Only after Phase B and Phase C are verified:

- Add inbound TCP 80/443 allow rules for Cloudflare's official IPv4 and IPv6 ranges, and deny other sources to those ports.
- Keep SSH rules separate. Prefer a known administrative source allowlist only if the current management IP and recovery route are verified; otherwise do not risk locking out administration.
- Account for IPv6 as well as IPv4; a v4-only restriction is incomplete.
- Verify the public hostname still works through Cloudflare and direct requests to the origin IP no longer reach the API vhost from an untrusted source.
- Re-check UFW status and Nginx service health after the change.

## Rollback

If proxying or origin restrictions break API access:

1. Restore the prior UFW 80/443 rules from the recorded baseline if necessary.
2. Restore the recorded DNS proxy setting.
3. Re-test `https://tech-api.katta.cc/api/health`, frontend API access, CORS, and TLS verification.
4. Record the exact failure and rollback outcome before retrying.

## Current blockers

- No Cloudflare DNS/zone management connector is available in this ChatGPT tool session, so the DNS proxy state cannot be changed safely from here.
- The existing diagnostic proves direct-origin DNS, not that the Cloudflare cutover has happened.
- Live spoofed-header requests confirm same-bucket behavior on the current direct-client → Nginx → Express path. Client-IP behavior through Cloudflare has not been tested; the future proxied topology and `CF-Connecting-IP` normalization need explicit verification.
- Origin ingress restriction is therefore **not yet safe to apply**.

## Isolated forwarded-IP regression test added (2026-10-11)

Application PR #34 (`16bf385f1f62dbea5d11d38fed64028e99ca7a95`) adds an integration test that simulates the existing one-hop Nginx forwarding chain. It verifies that changing a spoofed leftmost `X-Forwarded-For` value does not evade the rate limiter if the trusted proxy appends the same rightmost peer address. Backend CI, Semgrep, CodeQL, VPS deployment, and public production smoke tests passed; deployment evidence: https://github.com/yashbhoomkar/tech-katta/actions/runs/38143817747.

This test does **not** traverse the actual VPS Nginx process and does **not** verify Cloudflare proxying or `CF-Connecting-IP` normalization. Keep the current direct-DNS baseline and do not restrict ports 80/443 until Cloudflare access, proxy status, real-IP handling, and public-route verification are available. Issue #28 remains open.

## Live direct-origin forwarded-header smoke test (2026-10-11)

A temporary Vercel sandbox in region `bom1` resolved `tech-api.katta.cc` to `129.121.133.47` (IPv4 only). Three GET requests to `/api/categories` supplied different spoofed `X-Forwarded-For` values. All returned HTTP 200; `X-RateLimit-Remaining` decreased 119 → 118 → 117, and the CORS allow-origin remained `https://tech.katta.cc`. Node's normal TLS validation succeeded.

**Interpretation:** the requests shared the same limiter bucket despite changing the attacker-controlled header. This is live evidence consistent with Nginx appending the actual peer address and Express `trust proxy = 1` selecting the rightmost forwarded address. The test sent only three requests and did not inspect or log the actual IP value.

This does not verify Cloudflare proxying, `CF-Connecting-IP` normalization, or Cloudflare-only origin ingress. DNS still points directly at the origin, and UFW ports 80/443 remain publicly allowed. Do not restrict ingress until the Cloudflare cutover and full verification sequence can be completed.
