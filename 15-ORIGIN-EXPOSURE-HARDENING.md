# API Origin-Exposure Hardening Plan

**Status (completed 2026-10-11):** Cloudflare proxying, strict TLS, Nginx real-client IP normalization, spoofed-XFF rate-limit verification, and Cloudflare-only UFW ingress restrictions are implemented and independently verified. Security issue [#28](https://github.com/yashbhoomkar/tech-katta/issues/28) is closed. See the final production verification section below.

## Observed baseline (2026-10-11)

- API hostname: `tech-api.katta.cc`
- Origin: `129.121.133.47`
- Read-only diagnostic: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128987241
- Before cutover, DNS resolved directly to `129.121.133.47`, outside Cloudflare proxy ranges. On 2026-10-11 the A record was changed to proxied (`proxied: true`); independent Vercel sandbox DNS lookup then returned Cloudflare edge IPv4 addresses `104.21.13.85` and `172.67.132.164`.
- Public API traffic currently follows **client → VPS Nginx → Express**.
- Nginx proxies to `127.0.0.1:5000` and forwards `X-Real-IP: $remote_addr` and `X-Forwarded-For: $proxy_add_x_forwarded_for`.
- Express has `trust proxy = 1`; the in-memory rate limiter keys by Express `request.ip`.
- The latest successful VPS deployment run https://github.com/yashbhoomkar/tech-katta/actions/runs/38141089672 verifies the API listens on `127.0.0.1:5000`, not `0.0.0.0:5000`.
- Pre-cutover baseline: UFW allowed inbound 80/443 from anywhere (IPv4 and IPv6). The final state below replaces those broad web rules with Cloudflare-only CIDR allow rules.

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

## Historical blockers before final cutover (superseded by the final verification below)

- Cloudflare DNS/zone access is now available. The `tech-api.katta.cc` record was safely switched to proxied after verifying the exact record ID, A-record target, and prior `proxied: false` state.
- Cloudflare zone settings were changed and read back successfully: SSL/TLS mode `strict`, Always Use HTTPS `on`, minimum TLS version `1.2`.
- An independent Vercel sandbox in `bom1` confirmed public DNS resolves to Cloudflare edge IPs, `https://tech-api.katta.cc/api/health` returns HTTP 200 with `db: connected`, `/api/categories` returns HTTP 200, the public certificate validates with normal TLS verification, and HTTP redirects with 301 to HTTPS. Direct-origin TLS hostname/chain verification against `129.121.133.47:443` also returned `Verify return code: 0 (ok)`.
- Three requests with differing spoofed `X-Forwarded-For` headers returned HTTP 200, but rate-limit remaining was `119 → 118 → 119`; therefore this is **not proof** of correct real-client attribution. The requests traversed Cloudflare, but Nginx real-IP normalization is not yet configured/verified. Do not interpret this as a successful rate-limit attribution test.
- The origin IP remains directly reachable/discoverable and UFW 80/443 remain public. The existing Nginx deployment/SSH access path is not available through a direct VPS connector in this session, so Nginx real-IP configuration and UFW restrictions have not been applied.
- Origin ingress restriction remains **unsafe until** Nginx trusts `CF-Connecting-IP` only from official Cloudflare CIDRs, the exact proxy chain and rate limiter are tested, and rollback-safe Cloudflare-only IPv4/IPv6 firewall rules can be applied and verified.

## Isolated forwarded-IP regression test added (2026-10-11)

Application PR #34 (`16bf385f1f62dbea5d11d38fed64028e99ca7a95`) adds an integration test that simulates the existing one-hop Nginx forwarding chain. It verifies that changing a spoofed leftmost `X-Forwarded-For` value does not evade the rate limiter if the trusted proxy appends the same rightmost peer address. Backend CI, Semgrep, CodeQL, VPS deployment, and public production smoke tests passed; deployment evidence: https://github.com/yashbhoomkar/tech-katta/actions/runs/38143817747.

This paragraph records the state immediately after the isolated PR #34 regression test, before the later live Cloudflare cutover. It was superseded by the production workflow and direct-origin checks recorded below.

## Live direct-origin forwarded-header smoke test (2026-10-11)

A temporary Vercel sandbox in region `bom1` resolved `tech-api.katta.cc` to `129.121.133.47` (IPv4 only). Three GET requests to `/api/categories` supplied different spoofed `X-Forwarded-For` values. All returned HTTP 200; `X-RateLimit-Remaining` decreased 119 → 118 → 117, and the CORS allow-origin remained `https://tech.katta.cc`. Node's normal TLS validation succeeded.

**Interpretation:** the requests shared the same limiter bucket despite changing the attacker-controlled header. This is live evidence consistent with Nginx appending the actual peer address and Express `trust proxy = 1` selecting the rightmost forwarded address. The test sent only three requests and did not inspect or log the actual IP value.

This paragraph records the earlier direct-origin smoke test before the final Cloudflare proxy and firewall cutover. The completed live verification below supersedes that interim state.


## Cloudflare proxy cutover completed (2026-10-11)

The Cloudflare plugin was connected and authenticated as the account owning active zone `katta.cc`. Before changing anything, the zone and the exact DNS record were read back. The only DNS record changed was the existing A record `tech-api.katta.cc → 129.121.133.47` (record ID `a7911de09fd080f9b7e0b80327a5eea7`); its target and type were preserved and `proxied` was set from `false` to `true`.

Cloudflare zone settings were updated and read back:
- SSL/TLS mode: `strict` (origin certificate was independently verified with hostname validation and normal chain verification first).
- Always Use HTTPS: `on`.
- Minimum TLS version: `1.2`.

Independent live checks from a Vercel sandbox in Mumbai:
- DNS resolved to Cloudflare edge IPv4 addresses `104.21.13.85` and `172.67.132.164`.
- `GET https://tech-api.katta.cc/api/health`: HTTP 200; JSON status `ok`, service `tech-katta-api`, database `connected`; response server header `cloudflare`; normal TLS verification enabled.
- `GET https://tech-api.katta.cc/api/categories`: HTTP 200.
- `HEAD http://tech-api.katta.cc/api/health`: HTTP 301 to the HTTPS URL.
- Direct origin certificate test to `129.121.133.47:443`, with SNI and hostname verification for `tech-api.katta.cc`, completed with `Verify return code: 0 (ok)`.

The forwarded-IP/rate-limiter test is inconclusive after proxying: three requests with different spoofed `X-Forwarded-For` values had remaining counts `119 → 118 → 119`. This does not prove correct client-IP normalization. Do not close issue #28 or restrict origin ingress yet. Nginx must be configured to trust `CF-Connecting-IP` only from official Cloudflare IPv4/IPv6 ranges, then the actual forwarded chain and rate limiter must be verified before applying Cloudflare-only UFW rules. The public origin and its existing port 80/443 exposure are intentionally unchanged for now.


## Final production verification — Cloudflare origin hardening (2026-10-11)

**Status: completed.** Application workflow run [38165442874](https://github.com/yashbhoomkar/tech-katta/actions/runs/38165442874) completed successfully end-to-end.

### Nginx client-IP normalization

- The Nginx real-IP module was verified present and the /etc/nginx/conf.d include was verified before configuration.
- The Nginx file /etc/nginx/conf.d/cloudflare-realip.conf is generated from official Cloudflare IPv4/IPv6 CIDRs retrieved from Cloudflare's published API.
- The configuration trusts only official Cloudflare ranges, uses CF-Connecting-IP as the real-IP header, and enables recursive normalization.
- Nginx syntax check, reload, and local API health passed.
- Three requests with different spoofed X-Forwarded-For values remained in one rate-limit bucket: 118 → 117 → 116. Public health and categories endpoints returned HTTP 200.

### Origin firewall

- UFW is active with default incoming policy deny.
- TCP ports 80 and 443 are allowed only from the official Cloudflare ranges: 15 IPv4 CIDRs and 7 IPv6 CIDRs.
- Broad public Anywhere allow rules for 80/443 were removed.
- IPv4 and IPv6 SSH port 22 rules were preserved unchanged.
- The workflow refreshes the published CIDR list weekly (Monday at 05:17 UTC) and verifies the expected allow rules before reporting success.

### Independent post-change verification

- Through public DNS/Cloudflare, the API health endpoint returned HTTP 200 with db connected; the categories endpoint returned HTTP 200.
- Production frontend CORS remained https://tech.katta.cc.
- Direct-origin probes forced to 129.121.133.47 timed out on both port 80 and port 443 from the GitHub runner and an independent Vercel sandbox in Mumbai. This confirms the origin is no longer directly reachable from those external test sources.
- Cloudflare SSL/TLS remains Full (strict), Always Use HTTPS is enabled, and minimum TLS is 1.2.

The cutover is complete. If the weekly CIDR refresh or post-change verification fails in the future, investigate promptly; do not disable TLS validation or remove the SSH rule as a workaround.
