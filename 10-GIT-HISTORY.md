# Git History and Important Rollback Points

## Current main

Current main:

`main = d0aa934e87ad5ed9e0c1cc723de0a8f8b0e8fc2b`

Latest main commits:
- `e8cbf46cce377ac7501af091e901e177043d4778` — Merge PR #71: add read-only production browser smoke
- `4ce8403a9fc610ab9840479d29aabed162d0aeb6` — Merge PR #69: add bounded local k6 integration smoke
- `d5f8f8c16d98ed775fa0937a022ddc1230610c68` — Merge PR #68: enforce unique commit-ledger keys

Earlier backend architecture work added the environment-authenticated Vercel REST client (`193a11293b10d43534c34fa8b902d24dd12e6cac`) and internal Vercel control layer/CLI (`102d23221272e861c5ac6ca76aecb08cd5aca5ab`).

The Vercel control layer is independent of the ChatGPT Vercel MCP. It uses a server-side `VERCEL_ACCESS_TOKEN` and is intentionally not exposed through the public API.

Token-authenticated remote execution remains pending until the CLI is run in a network-enabled trusted environment with the token configured.

## Project origin

Important early commits:
- `7bf8fa831e3f112b68a8c43ffbd14b8e6b2e7f76` — chore: initialize Tech Katta
- `1e3ca0d3506e0f50fb643f4bfb9d4afc9228bcd5` — feat: build dark Tech Katta knowledge base
- `fa76611655ab5baf6b2a0cfc0f43631d24330a47` — chore: polish deployment scaffold

## Content architecture

Important milestones:
- Kafka Basics article introduced.
- Generalized article section rendering introduced.
- Distributed Systems Concepts introduced.
- Distributed System Components introduced.
- Library restructured into units/topics and chapters/notes.
- General article authoring schema documented.
- MongoDB seeding introduced.
- Article content schema migrated toward version 2.

## Static diagram work

Important commits include:
- `300cfafeb608a0e787595214fcfc793a96e34bda` — register static distributed architecture diagram
- `d79177421da37b6a57ab334f037ebd0f21eb2aa3` — render distributed systems architecture as static diagram
- `7e8b9eb83b64b2fff2d1de5b7247a19272576643` — render legacy distributed architecture as static diagram
- `a4c1b0741d4c3c5e1952f0e0e3a9713903d9d571` — pass article slug to content normalization

The legacy ASCII architecture is normalized to a static diagram at API response time without mutating the MongoDB document.

## Humanization work

Key commits:
- `f101d1c9f66d4de7f7ddf3d60fe3928e1e9e090c` — humanize navigation and homepage copy
- `fe05fcc1fee6980fb2b096d526f40b7ad20ea834` — give site a more editorial human feel
- `1b125dfea6ed7113cd5e7ad8909cd60143711c30` — humanize article interface language
- `fce4de930fe7923dce243543964c06cbff974535` — simplify breadcrumb language
- `acd55bc933089394edfd9268df33e1d0a9a2b15b` — tighten positioning/language

## SEO work

- `457b3f2df92b89b26ab38101d8e22fa1fd43e98b` — social metadata/crawler fallback
- `67630a1bcc3b8c17a03067610f924afb7085be22` — article metadata/language
- `4a946b0402a7ec407df6981c34d2ba46f7db6120` — crawler directives/sitemap
- `a8bae4f6fbd839542ff66977d7829c547b2d813f` — explicit sitemap
- `4c5b9f1babd86806fc4ccc515a3ddd0d14dc1e2e` — social preview image
- `c09c34c07e69acbfdbc05e19c16b0586813b55b9` — point social previews at SVG artwork

## VPS overflow work

- `414444f97c8e6d1b2d116b6c966f64f3984f3c9f` — add disabled-by-default overflow controller with hysteresis
- `bdef2d1cc4a2a74e7736811d0dcc0c49cbee8d75` — make overflow monitor safe until secondary exists
- `61d446573bc8edc1617b73b2dc592b579c5a7740` — install monitor during backend deployments

## Deployment color test

A temporary orange deployment test was performed:
- `afc182319596404bed64d548449b64d1f45ea831`

It was later restored. The important final restoration point was:
- `feb1e02b8f05c872498f56900b819d3bfe11c8e8`

Do not interpret temporary test commits as intended final design.

## Mobile swipe history

- `13c11e23898af5b5a61d6098edfc540a691cc065` — initial swipe navigation
- `f3a4058c48f928c33e939bce9762040e6602711a` — runtime fix
- `6af1c16793d4f4dd3b9e76ce04898a9f84ba07e1` — home right swipe opens sidebar

## Git ledger policy

Every future application commit must be recorded in MongoDB:
- key = full SHA
- value = change description

The ledger is documented in `11-MONGODB-COMMIT-LEDGER.md`.

## Rollback discipline

When reverting:
1. identify the last known-good commit
2. inspect the diff between good and bad state
3. prefer a normal revert when history should remain explicit
4. if restoring exact files, document why
5. deploy
6. validate
7. update the ledger for the new rollback commit

Do not rewrite public history casually.


## Backend hardening phase 1 — 2026-10-11

Open PR: https://github.com/yashbhoomkar/tech-katta/pull/1 (`refactor/backend-hardening-phase-1`). Not merged at the time of this entry.

Application commits recorded in MongoDB `techkatta_history.backend_git_commits`:
- `182296930e75d5b10a6fc94fe19bbd164d4441fd` — extract bounded rate limiter middleware
- `d9d6827e625637e05618967cb20167df06f8c977` — add rate-limiter tests
- `058a4e2d4832d5e5cf104d4ec09826283779bc59` — use extracted middleware in server
- `32368ff98778666c312f7c19053be7cd1827cc38` — add `npm test` script
- `4573387eef21e8aeb81a5276f177aa7fd730c368` — avoid scanning all buckets on every request
- `c2c37bff7305a8e2aaf8cd793e2e0a7efe3668ed` — add backend CI workflow
- `333d7e42a11f2a50ae103cd19ce2e9e16f0c883f` — correct deployment workflow syntax-check module paths

The initial backend CI run passed on `c2c37bff7305a8e2aaf8cd793e2e0a7efe3668ed`. The final branch head and deployment status must be rechecked before merge.

## Database fallback semantics — 2026-10-11

Merged and deployed via `3155342dc66bdf1e001bbfc54749f63daf1e4062`.

MongoDB ledger entries in `techkatta_history.backend_git_commits`:
- `a9745b526474a16e39161a246035658e04cc7017` — define explicit database fallback semantics
- `2d3452537f0925876837ba25bef9c15113fbe7bc` — test database fallback semantics
- `9044c9807534675a850079c3f05f2bf152bc75b3` — stop masking empty or failing database reads
- `3155342dc66bdf1e001bbfc54749f63daf1e4062` — merge database fallback semantics

Validation: backend CI and VPS deployment/public smoke tests passed. The API now falls back only while MongoDB is known disconnected, preserves empty/missing database results, and returns explicit 503 responses for query failures.

## Content-route modularization — 2026-10-11 (in progress)

- `c0d19ec9403a6dc1deaa37ff0b56985dda6c61eb` — extract content API routes into a testable module and add HTTP-level route tests.

MongoDB ledger record added to `techkatta_history.backend_git_commits`. Branch: `refactor/backend-route-modules`. Not merged/deployed at the time of this entry; record the eventual merge/deployment result after CI.

## Content-route modularization — 2026-10-11

- `c0d19ec9403a6dc1deaa37ff0b56985dda6c61eb` — extract content API routes into a testable module and add HTTP-level tests
- `a806fab3f94a00172d55fafdb73ea9ca7dc71810` — merge route modularization

Both commits are recorded in MongoDB `techkatta_history.backend_git_commits`. Backend CI and VPS deployment/public smoke tests passed after merge.

## Readiness and request observability — 2026-10-11

- `6e77efb47d92897a92777bd47e9f9a2bc0384bc0` — add readiness/liveness, structured request logging, and smoke coverage
- `b8a705eec61af7deb7ca47ebd36d06025df2ad22` — merge readiness/observability

Both commits are recorded in MongoDB `techkatta_history.backend_git_commits`. Backend CI and VPS deployment/public smoke tests passed after merge.

## VPS proxy diagnostics workflow candidate — 2026-10-11

- `5de8af322b09619b2c6f11d27770af6e26ab38fd` — add read-only VPS proxy diagnostics workflow
- `a014eb19d0241b49ce2b4b3ce6530375b4fced7a` — correct listener filter

Both commits are recorded in `techkatta_history.backend_git_commits`. Branch: `chore/inspect-vps-proxy-security`. Not merged at the time of this entry.

## VPS proxy diagnostic result — 2026-10-11

Read-only workflow commit `a703011c9d84c34ee7cf640d1a8d84f2b2166b59` is recorded in MongoDB `techkatta_history.backend_git_commits`. Diagnostic run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38128608567.

Findings: Nginx/API service active; Nginx forwards to loopback port 5000; XFF is appended with `$proxy_add_x_forwarded_for`; Express trusts one proxy; UFW denies incoming by default but allows 22/80/443 globally; Node binds `0.0.0.0:5000`. These findings are inputs to the next security change, not proof that origin traffic has already been restricted.

## Cloudflare DNS verification candidate — 2026-10-11

- `1d6b5e5b885226dfc37e1fb2ada68fcfad2a4dd7` — verify public API DNS belongs to official Cloudflare proxy ranges

Commit is recorded in `techkatta_history.backend_git_commits`. Branch: `chore/verify-cloudflare-dns`; not merged at the time of this entry.

## Cloudflare range API correction — 2026-10-11

- `095eb973a467610b0e4b51bba3aaae5462ac7442` — use Cloudflare's official IP API after plain-text endpoint returned 403

Recorded in MongoDB `techkatta_history.backend_git_commits`. Branch `fix/diagnose-cloudflare-dns-api`; not merged at the time of this entry.

## Loopback binding hardening candidate — 2026-10-11

- `4d5bd7de22def2ef42b93aa2b400a38ce022a4a0` — bind API to loopback and verify listener during deployment
- `2fc4cf9f07c576c903e165a802edc2597d66d541` — correct diagnostic warning indentation

Both commits are recorded in `techkatta_history.backend_git_commits`. Branch: `fix/backend-loopback-bind`; not merged at the time of this entry.

- `d41a420c7f973af3626d9de51cd16f34edf94166` — correct YAML indentation for deployment socket assertions (recorded in MongoDB ledger; branch-only correction after workflow validation failure).

## Loopback binding security hardening — 2026-10-11

- `4d5bd7de22def2ef42b93aa2b400a38ce022a4a0` — bind API to loopback and verify deployment socket
- `d41a420c7f973af3626d9de51cd16f34edf94166` — fix deployment script indentation
- `5e09088ba40b8060a81813e766202fcf4bb07884` — merge loopback binding hardening

All commits are recorded in MongoDB `techkatta_history.backend_git_commits`. Backend CI and production deployment/smoke tests passed after merge.

## Optional pagination candidate — 2026-10-11

- `56d6a79b3f9d1c65ea0e152faaa98d673043cf3a` — add opt-in pagination and query index
- `41359ab7c5b5acaa65fa2e47565fa10236a56cba` — fix numeric pagination parsing

Both commits are recorded in MongoDB `techkatta_history.backend_git_commits`. Branch: `feat/backend-pagination-indexes`; not merged at the time of this entry.

## Backend clean-architecture phase 1 — 2026-10-11

- `7f669b872561c809ae8ae501d94d86e26f4473ff` — separate Express app construction from server lifecycle and add an HTTP-level app test.

The commit is recorded in MongoDB `techkatta_history.backend_git_commits`. Branch `refactor/backend-clean-architecture-phase-1`; draft PR #10: https://github.com/yashbhoomkar/tech-katta/pull/10. At the time of this entry, backend CI is pending, and the change is not merged or deployed. Preserve the current production commit `5e09088ba40b8060a81813e766202fcf4bb07884` until CI and review are complete.


### Backend clean-architecture phase 1 — validation update

Application commit `7f669b872561c809ae8ae501d94d86e26f4473ff` passed backend CI in https://github.com/yashbhoomkar/tech-katta/actions/runs/38132846227; all 17 tests passed. Draft PR #10 remains open and is not merged or deployed. No production smoke/load/browser validation was performed for this branch.


### Backend clean-architecture phase 2 — candidate

- `1219adb49f9b1235b7623de6fcbf23a4a45b688e` — separate content controller, service, and repository while retaining route wiring and API contracts.

The commit is recorded in MongoDB `techkatta_history.backend_git_commits`. It is part of draft PR #10, https://github.com/yashbhoomkar/tech-katta/pull/10. CI for this head was queued/pending at the time of this entry; the candidate is not merged or deployed.


### Backend clean-architecture phase 2 — validation update

Application commit `1219adb49f9b1235b7623de6fcbf23a4a45b688e` passed backend CI: https://github.com/yashbhoomkar/tech-katta/actions/runs/38132969830; all 17 tests passed. PR #10 is still draft/open, unmerged and undeployed. The PR title is now `Refactor backend into testable app and content layers`.


### Backend clean-architecture test increment

- `1c1ff5ce50a0556e955b34825b113cc1634ff4a5` — add direct tests for content repository, service, and controller boundaries.

Recorded in MongoDB `techkatta_history.backend_git_commits`. CI passed on this exact head with 23 tests: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133163151. Draft PR #10 remains open and undeployed.


### Runtime configuration candidate

- `c9411681a0f940256c8999e22cfc85f01ed295a9` — validate port/frontend origin in a dedicated configuration module and inject immutable config into Express app construction.

Recorded in MongoDB `techkatta_history.backend_git_commits`. Backend CI passed with 28 tests: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133257583. Draft PR #10 remains open and undeployed.


### MongoDB configuration injection candidate

- `723a234193644d382c42a34494bb43c014924fac` — pass validated MongoDB URI/database name into database startup and reuse connection options on reconnect.

Recorded in MongoDB `techkatta_history.backend_git_commits`. CI passed with 28 tests: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133337413. PR #10 remains draft/open and not deployed.


### Centralized HTTP error boundary candidate

- `b4fd021f18a98ee77700455da8e7d6a4b98861ae` — centralize JSON error responses and add typed not-found/content-unavailable errors.

Recorded in MongoDB `techkatta_history.backend_git_commits`. Backend CI passed with 28 tests: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133451417. Draft PR #10 remains open and undeployed.


### Request parsing hardening candidate

- `e08dae0345100ba3ccc8b7efbd8690db1644cfbf` — ensure malformed/oversized body requests receive request IDs and consistent JSON 400/413 responses.

Recorded in MongoDB `techkatta_history.backend_git_commits`. CI passed with 28 tests: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133527724. Draft PR #10 remains open and undeployed.


### Backend documentation increment

- `3e57fc39d0f23ca6a71e604be3d0e7290a74f995` — document backend architecture and environment setup; correct stale root architecture description.

Recorded in MongoDB `techkatta_history.backend_git_commits`. CI passed with 28 tests: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133683299. Draft PR #10 remains open and undeployed.


### Rate-limit/parser ordering fix

- `ca69308663ec007bc5c0c7275510872dc8cff7a9` — apply the rate limiter before JSON parsing and add a bypass regression test.

Recorded in MongoDB `techkatta_history.backend_git_commits`. CI was running at the time of this entry: https://github.com/yashbhoomkar/tech-katta/actions/runs/38133934601. PR #10 remains draft/open and undeployed.


### Deployment content-sync guard

- `ca0df6f1b50a1cddcb56fc9711f2f4f6c530e7f2` — skip MongoDB seeding for code-only releases; require content-file changes or explicit manual sync.

Recorded in MongoDB `techkatta_history.backend_git_commits`. CI for this workflow-only change is pending; PR #10 remains open and undeployed.


### Candidate CI result

For `ca0df6f1b50a1cddcb56fc9711f2f4f6c530e7f2`, backend CI passed with 29/29 tests and 0 failures: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134049543. PR #10 is ready for review. CodeRabbit review requested; no findings received yet. Not deployed.


### PR #10 merge commit

- `a1dcc18ec649bc8c1d36ff491043d45b26de1b5d` — merge layered backend refactor and deployment content-sync guard.

Recorded in MongoDB `techkatta_history.backend_git_commits`. Deployment workflow run https://github.com/yashbhoomkar/tech-katta/actions/runs/38134143493 and main CI run https://github.com/yashbhoomkar/tech-katta/actions/runs/38134143426 were running; do not record production as verified until both and smoke checks finish.


### Deployment diagnostics hotfix

- `6d9fe2653a578fc51e73080ac606c0354c4ff084` — add explicit sudo/systemd failure diagnostics after the merged deployment failed before service restart.

Recorded in MongoDB `techkatta_history.backend_git_commits`. PR #11: https://github.com/yashbhoomkar/tech-katta/pull/11. Do not mark production verified until a subsequent deploy completes local health checks and production smoke tests.


### Deployment diagnostics merge

- `7a43a798407861b0a8f4b3fc9826da0a2b7f9581` — merge diagnostic hotfix PR #11.

Recorded in MongoDB `techkatta_history.backend_git_commits`. Deployment retry https://github.com/yashbhoomkar/tech-katta/actions/runs/38134334813 is in progress; production verification is pending.


### Content-sync SSH handoff fix

- `cf0c9851934eb3cb8603a1e63a35109f4f9d8fb2` — merge PR #12 to pass the content-sync decision directly into the remote script.

Recorded in MongoDB `techkatta_history.backend_git_commits`. Deployment run https://github.com/yashbhoomkar/tech-katta/actions/runs/38134427671 is in progress; production verification pending.


### Deploy workflow split merge

- `9d545de3c6e2048dd851bb43a8782bf388544486` — merge PR #13 to split preparation, optional content sync, and restart/verification into separate steps.

Recorded in MongoDB `techkatta_history.backend_git_commits`. Deployment run https://github.com/yashbhoomkar/tech-katta/actions/runs/38134546986 is in progress; production validation pending.


### Production deployment success

- `9d545de3c6e2048dd851bb43a8782bf388544486` — current main deployment workflow revision, including the backend refactor and split content-sync deployment steps.

Deployment workflow passed: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134546986. The API restarted; local health reported MongoDB connected; production smoke passed 11 endpoint checks plus CORS and security headers. MongoDB seed step was skipped for this code-only deployment. Main backend CI passed on application merge commit `a1dcc18ec649bc8c1d36ff491043d45b26de1b5d`: https://github.com/yashbhoomkar/tech-katta/actions/runs/38134143426. Browser and load testing remain unperformed.


## Browser/load verification and TLS repair work — 2026-10-11

PR #14: https://github.com/yashbhoomkar/tech-katta/pull/14 — open and not merged. Its verification branch head is `dcba89f7499ba9cecc5cc4117896b33651096990`. All application-repository commits below were recorded in MongoDB `techkatta_history.backend_git_commits`:

- `d1d1e9709d6dd2dd5b3a65dfad735293f458e251` — add browser-based production smoke checks
- `14e8d6d0c0324f3f9b42e1031ecf1d52ccaf4afc` — add bounded production GET load probe
- `5d01cacb2b5817338084933e75af52f557dc5de6` — add browser/load verification workflow
- `71daaf3687172c36954fc30abb11dc8ba945a6e8` — add CodeQL security/quality workflow
- `2288f52489ec949f2612c22ab25dfb067c167c09` — add public API TLS diagnostics to browser verification
- `f30dcea129d25c87345c62ac36282c016c0ae416` — add read-only TLS diagnostics workflow candidate
- `fb75d600d1d49818bcc7f6b9b3a0a6b7135defb8` — publish diagnostic output to the verification PR
- `93e9d936fc5fbc9a95ea55aa8050f2b13f80b38d` — add branch-scoped Certbot repair attempt after a dry run
- `dcba89f7499ba9cecc5cc4117896b33651096990` — remove duplicate TLS workflow from PR #14 after the shared workflow was merged

Read-only diagnostic workflow PR #15 was merged as `d393b77a02f33dcfd8a235c63172770b50e5f468`; PR #16 was merged as `e52f8da2efbad98dcac6b4c9f4bcd45a0901ccfe` to add an Nginx configuration validation check. Both merge commits are ledgered. These are workflow-only changes; the deployed backend application commit remains `9d545de3c6e2048dd851bb43a8782bf388544486`.

Browser run `38135114290` confirmed the three SPA routes render but failed the browser-origin API request because `tech-api.katta.cc` serves a self-signed certificate. The bounded load job was skipped; no load results exist. CodeQL passed at the earlier PR head in run `38135114213`; the latest head still needs validation. Keep PR #14 open until the TLS repair and subsequent browser run are verified, then run the bounded load probe. Do not describe the test as a full capacity benchmark.


## Verification completion update — 2026-10-11

PR #14's latest application-repository commits (all recorded in MongoDB `techkatta_history.backend_git_commits`):
- `1dd48a8d1c34fda7f38ea2aed44365a9816633e3` — make the one-time TLS repair execute on the dedicated verification branch
- `80f26149dd17643dfd275b893efd7326e4c84d42` — make TLS repair conditional and enable bounded load testing after browser success
- `afa5abd8f1c71c104b6eaa8ce0a7b98a2dd83a18` — run the bounded load probe after browser checks pass and skip certificate mutation when TLS already validates

The Certbot repair succeeded in https://github.com/yashbhoomkar/tech-katta/actions/runs/38135493017. The public API now presents a Let's Encrypt YE2 certificate; OpenSSL chain verification is OK and the API health endpoint returns HTTP 200.

Latest complete verification:
- Browser + bounded load: https://github.com/yashbhoomkar/tech-katta/actions/runs/38135694798 — passed.
- CodeQL: https://github.com/yashbhoomkar/tech-katta/actions/runs/38135694821 — passed.

Browser results: home, distributed-systems unit, canonical article route, browser-origin API/CORS and canonical article contract all passed; no uncaught page exceptions. Load results: 60/60 HTTP 200, concurrency 3, min 231 ms, median 235 ms, p95 757 ms, max 839 ms, zero throttling and zero server/network errors. This is a bounded smoke-load check only, not a capacity benchmark. PR #14 remains open pending final CodeRabbit review and merge decision.


## Final browser/load/TLS verification commits (2026-10-11)

All listed application-repository commits were recorded in MongoDB `techkatta_history.backend_git_commits`.

- `98be9fe3712554da2d3287c56a4f406bbe10012d` — temporary read-only TLS diagnostic workflow; confirmed the active Nginx certificate was self-signed and Certbot was installed.
- `87301814981ca7f0f069c433001c9ff15b173814` — one-time TLS repair workflow. Run https://github.com/yashbhoomkar/tech-katta/actions/runs/38135484266 passed the Certbot HTTP-01 dry run, backed up Nginx configuration, deployed the valid Let's Encrypt certificate, validated/reloaded Nginx, and verified the public health endpoint using normal TLS validation. This workflow branch was operational-only and was not merged into main.
- `8b0f195525937d522fe6e8d2f3a727a3d4a7cb5f` — removed automatic production certificate changes from PR verification so ordinary PR tests remain read-only.
- `80f26149dd17643dfd275b893efd7326e4c84d42` — kept the certificate repair as a separate one-time operation and adjusted verification workflow triggers.
- `afa5abd8f1c71c104b6eaa8ce0a7b98a2dd83a18` — enabled the bounded GET load probe after successful browser verification.
- `e4d4f92eee0b033ccbfb5d53928684c0d797bf93` — merge PR #14, adding production Chromium checks, a bounded GET-only load probe, and free CodeQL analysis. Workflow/test-only merge; no backend application deployment was triggered.

Final successful verification:
- Browser and bounded load: https://github.com/yashbhoomkar/tech-katta/actions/runs/38135690786 and https://github.com/yashbhoomkar/tech-katta/actions/runs/38135694798.
- CodeQL: https://github.com/yashbhoomkar/tech-katta/actions/runs/38135694821.
- Chromium verified home, Distributed Systems unit, canonical article, and browser-origin API/CORS/article response contract. Bounded load: 60/60 HTTP 200 at concurrency 3, min 233 ms, median 239 ms, p95 750 ms, max 807 ms; zero 429, 5xx, or network errors. A second run also passed 60/60.
- Existing production smoke tests passed 11 endpoint checks plus CORS/security headers with standard TLS validation. Manual Semgrep default-rules scan reported zero findings.
- PR #14 is merged. Deployed backend runtime remains at application commit `9d545de3c6e2048dd851bb43a8782bf388544486`; only TLS/Nginx configuration changed on the VPS.


## PR #14 merged — browser, load and CodeQL verification complete (2026-10-11)

- `e4d4f92eee0b033ccbfb5d53928684c0d797bf93` — merge production browser/bounded load verification and CodeQL checks (#14). Recorded in MongoDB `techkatta_history.backend_git_commits`.

Successful runs:
- Browser + bounded GET load: https://github.com/yashbhoomkar/tech-katta/actions/runs/38135694798
- CodeQL: https://github.com/yashbhoomkar/tech-katta/actions/runs/38135694821

Browser checks passed three SPA routes, browser-origin API/CORS, and the canonical article response contract with no uncaught page exceptions. The controlled load probe completed 60/60 HTTP 200 at concurrency 3 (min 231 ms, median 235 ms, p95 757 ms, max 839 ms; zero 429, 5xx, or network errors). Treat this as a bounded smoke-load check, not a capacity benchmark.

The public API previously served a self-signed TLS certificate. Certbot/Nginx successfully installed a Let's Encrypt YE2 certificate; OpenSSL chain verification returned OK and the public health endpoint returned HTTP 200. This was an infrastructure TLS change, not a backend code deployment. The deployed application code remains `9d545de3c6e2048dd851bb43a8782bf388544486`.


### Post-merge deployment workflow result

After merge commit `e4d4f92eee0b033ccbfb5d53928684c0d797bf93`, deployment run https://github.com/yashbhoomkar/tech-katta/actions/runs/38135786631 completed successfully. It validated the backend, prepared the VPS, restarted/verified the API, and passed production smoke tests. The MongoDB content-sync step was skipped because the change only added verification/security workflows and scripts. This is a workflow-triggered redeploy/restart, not a backend source-code change; the application runtime source remains `9d545de3c6e2048dd851bb43a8782bf388544486`.


## Issue #18 frontend state and metadata fixes — 2026-10-11

PR #19: https://github.com/yashbhoomkar/tech-katta/pull/19 (open, not merged/deployed)

- `f1e657c21673bf64ff71f6d067f1231e72d1956f` — refresh swipe listener dependencies on SPA route changes.
- `a1f3b3a803779f5082e3f8a37d65137dd10fc38e` — restore previous article metadata and remove effect-created tags during cleanup.

Both commits are recorded in `techkatta_history.frontend_git_commits`. Build/CI and mobile interaction verification are pending.


### Issue #18 frontend fixes merged — 2026-10-11

- `62c4b3ee59a99a57ec98ad221a34d38f37953eb2` — squash-merge PR #19, fixing the mobile swipe route closure and restoring article metadata during cleanup.

The merge commit is recorded in `techkatta_history.frontend_git_commits`. Frontend CI build and CodeQL passed on PR head `a1f3b3a803779f5082e3f8a37d65137dd10fc38e`. Mobile touch interaction remains unverified.


## Issue #18 hardening candidate — PR #20 (2026-10-11)

PR #20: https://github.com/yashbhoomkar/tech-katta/pull/20 — open, not merged/deployed.

Backend ledger commits:
- 7d4350521ee534b1d466fb5cafbd3cd659ade382 — configurable safe bind host.
- aa13f8fa9f2e18397bbe8e6270df3c3242089f2b — host config test.
- 55e6cadbe72958e80616a94b846a67a376d0de4d — use configured host in server startup.
- c7210d28cfe3c7d4c6757435a767667a47d4e34e — Docker container bind configuration.
- 5914880f7f90bebedd56376a779de624aaf17d2c — health endpoints before rate limit; package version source.
- b612091b28d6a90da8f422e991bb2d8a5bfe8c9f and d40929e580571d5600066d521de08f9f75eb7deb — health rate-limit regression test and correction.
- 7eb09e8ce1b418590f0444d8f0db888cca4cde95 — remove TLS verification bypass in smoke tests.
- 38941cdc69a9a99c351afbeb78c084b5f0064199 — article category index.
- 67355276f3f8eb88c002c7255849f0164c1985a7 — remove hardcoded Vercel team scope.

Frontend ledger commits:
- 9b5493801402fa2406542549f2dc87a57478a869 — mirror advanced Kafka content into frontend fallback module.
- a66c7a88eb7a516c25c7bebfb973c24689179a24 — append advanced sections to local Kafka fallback.

All listed application commits are recorded in the corresponding MongoDB frontend/backend ledger collection. Backend CI and frontend build passed on the latest PR head; CodeQL was pending. Do not treat the candidate as deployed until merge/deployment verification.


### Issue #18 PR #20 merged — 2026-10-11

- 56b229a2c0fa1d586f200a41c79826ed92a0446b — squash-merge selected backend and frontend audit fixes: configurable bind host, Docker binding, health route exemption/dynamic version, TLS verification, article category index, Vercel team-scope correction, and advanced Kafka fallback content.

The merge SHA is recorded in both techkatta_history.backend_git_commits and techkatta_history.frontend_git_commits. Backend CI, frontend build, and CodeQL passed on PR head a66c7a88eb7a516c25c7bebfb973c24689179a24. Deployment and post-deploy smoke checks remain pending.


### PR #20 deployed — 2026-10-11

Merge commit 56b229a2c0fa1d586f200a41c79826ed92a0446b is deployed. Workflow https://github.com/yashbhoomkar/tech-katta/actions/runs/38137021953 passed: MongoDB content sync (5 categories, 11 articles), API restart/local health, and production smoke (11 endpoint checks plus CORS/security headers with standard TLS verification). Backend CI https://github.com/yashbhoomkar/tech-katta/actions/runs/38137022003, frontend CI https://github.com/yashbhoomkar/tech-katta/actions/runs/38137021910, and CodeQL https://github.com/yashbhoomkar/tech-katta/actions/runs/38137021951 passed. Merge SHA is recorded in both frontend and backend MongoDB ledgers.


## Issue #18 scoped fixes merged — 2026-10-11

- 62c4b3ee59a99a57ec98ad221a34d38f37953eb2 — PR #19, frontend swipe route-state and metadata lifecycle fixes.
- 56b229a2c0fa1d586f200a41c79826ed92a0446b — PR #20, health route/rate-limit behavior, configurable bind host, TLS verification, category index, explicit Vercel team scope, and Kafka fallback content parity.

Both merge SHAs were recorded in the corresponding MongoDB application commit-ledger collections. Backend CI/CodeQL passed on corrected backend commit d40929e580571d5600066d521de08f9f75eb7deb; Vercel status passed on latest PR head/merge. Production deployment and live health verification remain pending confirmation.


### PR #21 — disable placeholder overflow timer (2026-10-11)

- Application merge commit: `9bc56bf28f5005aff71e5e1dac8ff710fd386e5e` — disables/stops the no-op `tech-katta-overflow.timer` during backend deployments and asserts it remains inactive.
- Reason: the monitor has no configured secondary upstream and does not change Nginx routing; the old 30-second timer implied functionality that did not exist.
- MongoDB ledger: recorded in `techkatta_history.backend_git_commits`.
- Deployment: merge triggers the existing VPS deployment workflow; production application/service smoke checks must pass before considering the timer change applied on the VPS.


### PR #21 deployment result (2026-10-11)

Deployment run https://github.com/yashbhoomkar/tech-katta/actions/runs/38139715132 succeeded for merge commit `9bc56bf28f5005aff71e5e1dac8ff710fd386e5e`. The VPS log confirms timer disablement, active API and loopback-only listener checks, and successful public smoke tests (11 endpoints plus CORS/security headers).

### PR #22 — add Semgrep Community Edition (2026-10-11)

- Application merge commit: `a39d441c8364efc65bfa4f14f944d34cd9e07cff` — add free Semgrep static analysis for JavaScript, Node.js, and React.
- MongoDB ledger: `techkatta_history.backend_git_commits`.
- Semgrep run https://github.com/yashbhoomkar/tech-katta/actions/runs/38140326189 passed: 40 files, 68 rules, 0 findings; SARIF uploaded.
- CodeQL run https://github.com/yashbhoomkar/tech-katta/actions/runs/38140326154 passed.


### PR #23 — add bounded k6 production baseline (2026-10-11)

- Application merge commit: `4d3e285b28b4356922ea016afc3838b4f1d17732`.
- MongoDB ledger: `techkatta_history.backend_git_commits`.
- Run https://github.com/yashbhoomkar/tech-katta/actions/runs/38140625020 passed: 156 HTTP requests, 0 failures, all 312 checks passed; frontend p95 142.67 ms and API p95 244.61 ms.
- The test is intentionally low-load (frontend ramp up to 5 VUs, API 1 VU) and is not a capacity benchmark.


### PR #24 — consolidate Vercel REST client (2026-10-11)

- Application merge commit: `efbc810f08f210e83cff41415280c1a0aaffc8c6`.
- Keep `backend/src/vercelClient.js` as the canonical client used by `backend/scripts/vercel-control.mjs` and `backend/scripts/vercel-mcp.mjs`.
- Remove unused `backend/src/vercel-control.js` and the unreferenced `backend/src/vercel/` client/CLI tree; update deployment syntax checks.
- MongoDB ledger: `techkatta_history.backend_git_commits`.
- Backend CI, Semgrep, CodeQL, and VPS deployment passed. Deployment run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38141089672.


## PR #25 — home left-swipe forward-history regression (2026-10-11)

Merged as `e1f35b765015f182d32aaf645c4c4eb8387f5936`.

- Fixes `frontend/src/App.jsx` so a left swipe on the home route does not invoke `navigate(1)` and accidentally activate an existing forward-history entry. Horizontal scroll protection remains ahead of the home-left no-op.
- Extends `scripts/production-browser-smoke.mjs` with mobile-emulated Chromium touch checks against an isolated local Vite build, while retaining public production route and API/CORS checks.
- Updates `.github/workflows/production-verification.yml` to build and serve the frontend for isolated mobile gesture testing.
- Successful browser run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38142409155. Frontend CI, Semgrep, and CodeQL all passed at the final PR head.
- All nine source/test/workflow branch commits and the squash merge SHA are recorded in `techkatta_history.frontend_git_commits`.
- The Vercel preview for the final branch SHA was READY. Verify the post-merge production Vercel deployment and live site behavior before claiming the fix is deployed to production.


## PR #26 — CodeRabbit review configuration (2026-10-11)

Merged as `acbc81423a7da3f6e163462ee0667c4ed0aa35ae`.

- Added `.coderabbit.yaml` with automatic-review settings for non-draft PRs targeting `main` and path-specific review instructions for Express/MongoDB, React/mobile navigation, tests, scripts, and CI workflows.
- No secrets, paid API key, or production runtime dependency was added.
- The PR review and inline-comment APIs showed no AI review. A manual `@coderabbitai review` request received no CodeRabbit response; only the Vercel preview check was present. The config is prepared, but actual AI-review integration is not verified and remains an audit blocker.
- Merge SHA and source commit are recorded in `techkatta_history.backend_git_commits`.


## PR #27 — remove slug-specific diagram normalization (2026-10-11)

Merged as `90ac43818fc34c61dfd7fdcae3baf62f83310350`.

- Backend fallback content now declares `diagram: 'distributed-architecture'`, matching frontend content.
- Removed `isDistributedArchitectureAsciiDiagram` and the article-slug conditional from `contentSchema.js`; normalization preserves block semantics.
- Added regression coverage that explicit diagram blocks survive normalization and ordinary code blocks are not silently converted based on slug.
- Backend CI passed 31/31 tests; CodeQL and Semgrep passed.
- VPS deployment succeeded and production smoke checks passed 11 endpoints plus CORS/security headers: https://github.com/yashbhoomkar/tech-katta/actions/runs/38142984733.
- Deployment workflow automatically synced the changed source to MongoDB. A live Atlas read confirmed the first section's third block is `{ type: 'diagram', name: 'distributed-architecture' }`.
- All four branch commits and the merge SHA are recorded in `techkatta_history.backend_git_commits`.

## PR #34 — forwarded-IP rate-limit regression test (2026-10-11)

Merged as `16bf385f1f62dbea5d11d38fed64028e99ca7a95`.

- Source commit: `fba34153e673e4b72db7e546f7169a1296174189` — test: verify rate limit ignores spoofed forwarded IP.
- Adds an isolated integration regression test for the currently observed one-hop client → Nginx → Express topology. A spoofed leftmost `X-Forwarded-For` value cannot evade the limiter when the trusted proxy appends the same rightmost peer address.
- Backend CI, Semgrep, CodeQL, VPS deployment, and production smoke tests passed. Deployment run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38143817747.
- This is not a live Nginx/Cloudflare integration test. Issue #28 remains open; Cloudflare proxy cutover and origin ingress restriction are not complete.


## PR #53 — preserve article substring-search semantics (2026-10-12)

- Application source commit: `db2395bb70fff2421583f79b2a431c22f8e21c8a`.
- Squash merge commit: `34d0d4db2aae0234b2e45d6fc427a75fe4a21653`.
- Added backend regression tests for case-insensitive substring matching across title, eyebrow, description, and tags; category/search composition; trimming; blank queries; and fallback behavior.
- Backend CI, Semgrep Community Edition, and CodeQL passed on the PR. Vercel preview status also passed; this test-only backend change was not a production runtime deployment.
- Both application SHAs are recorded in `techkatta_history.backend_git_commits`.
- No query strategy or MongoDB index was changed: the live corpus has 11 articles and the UI searches locally. Issue #31 remains open as a revisit trigger rather than a current production bottleneck.


## PRs #54–#57 — ledger integrity repair progress (2026-10-12)

Application main HEAD: `56bb3bd33481cd836885d0ede744f8639770a381`.

All application source and merge SHAs listed below were recorded in `techkatta_history.backend_git_commits`.

### PR #54 — isolated unique-index capability probe

- Source commits: `328a4d3c5d4e07d5992b9d74b6961e007b4cc9b0`, `f778066ea0fcd3108e6df1ad1bbc032dd987194b`, `cacbd6809d37b140e8eff0a207f9cc8abb896175`.
- Merge: `0607590574b1e0c019228f4384458fe6a4dc8171`.
- First run failed before connecting to MongoDB because the SSH action's shell bookkeeping was interpreted as JavaScript. No database operation occurred.

### PR #55 — temporary-file execution fix

- Source: `411c74d25fdd6199cb046893bece522b23cc5144`.
- Merge: `bd00c3b32d4623c51e073a9b90b002871a10dff5`.
- Second run also failed before database connection: the SSH action injected bookkeeping into a here-document. No database operation occurred.

### PR #56 — base64 stream fix

- Source: `9edeacae3d7c17986c4d5ebf6c17be03689f7efa`.
- Merge: `8822cab92ebcca8fd0e789e9199b85404144a7b7`.
- Workflow run https://github.com/yashbhoomkar/tech-katta/actions/runs/38197243213 passed. Using the VPS runtime credentials, it created a run-specific temporary collection in `techkatta_history`, created and verified a true unique index, confirmed duplicate-key rejection (MongoDB error 11000), and removed the temporary collection. No canonical ledger rows were touched.

### PR #57 — guarded duplicate-ledger migration candidate

- Source commits: `7ccd1ff380412dfca2e74bc002b5425641102380`, `aa6e56bbb71f8c296b1e8fe032340b0219f59bf0`, `7fcaa5e21789bf61708e06dd78e15b361575d739`.
- Merge: `56bb3bd33481cd836885d0ede744f8639770a381`.
- The workflow validates the six-row backup, exact duplicate and canonical IDs, duplicate groups, and index metadata before deleting any rows. It has rollback logic and verifies unique indexes, document counts, and preservation of the union of SHA keys.
- Run https://github.com/yashbhoomkar/tech-katta/actions/runs/38197586906 failed at the backup preflight for `frontend_git_commits:6acb79744d4d384f7be306f8`; it explicitly aborted before mutation. The connected Atlas tool shows the expected backup row, so the VPS-runtime database view must be reconciled before rerunning. Do not bypass the preflight.
- Issue #32 remains open. No canonical rows were deleted; the six-row backup remains intact. Umbrella issue #18 remains open.


### PR #58 — read-only VPS ledger view reconciliation (2026-10-12)

- Source commits: `49c53b0cfbae939cf500e90b4b04ba9961fdc370`, `4cc2c7b695fbf5352d1392a6fb91f3cf4cf0b1f5`.
- Merge: `c4829f939a0162cbb3f5ac3619d7f70e7c7aa28e`.
- Workflow run https://github.com/yashbhoomkar/tech-katta/actions/runs/38197871440 passed read-only inspection through the VPS runtime credentials.
- It observed six backup rows, and all target backup fields (source collection, original ID, key, and value) matched the expected values. All three canonical duplicate rows also matched. The VPS view still reports frontend count 169 and backend count 203, with the same three duplicate rows and non-unique `key_unique` indexes.
- This conflicts with the earlier migration run's backup-validation failure. No data changed in either run. Do not bypass the gate; add field-level diagnostics and retry only after the discrepancy is explained.
- Source and merge SHAs are recorded in `techkatta_history.backend_git_commits`. Issue #32 and umbrella #18 remain open.


### PR #59 — backup preflight diagnostics (2026-10-12)

- Source: `aadf03acb327215e4e7c3005dc32bfd2511733f8`.
- Merge: `36696b02bea329020b4f4cb01108818453131a6d`.
- Run https://github.com/yashbhoomkar/tech-katta/actions/runs/38198042758 showed the constructed backup ID was wrong (`frontend_git_commits:<id>` rather than the backup's `frontend:<id>`). The workflow aborted before mutation.

### PR #60 — correct backup ID prefix (2026-10-12)

- Source: `fa976824d044953d3b567a10c91a20f2026161e9`.
- Merge: `6d67cbbfcfec95d1572dd612c768ae2e6e91568e`.
- Ledger repair run https://github.com/yashbhoomkar/tech-katta/actions/runs/38198144807 passed. It validated all six backup rows and exact canonical/duplicate IDs; deleted exactly three duplicate documents; created and verified unique `key_unique` indexes in both collections; confirmed no duplicate groups remained and the union of previously present SHAs was preserved.

### PR #61 — independent post-migration verification (2026-10-12)

- Source: `c24e4988021d8fa2319791068beb7c38f75ca8ab`.
- Merge: `c597e7f416a9c4b9c1c7268c936845755d916720`.
- Read-only workflow https://github.com/yashbhoomkar/tech-katta/actions/runs/38198308593 passed. All three removed rows remain in the six-row backup and are absent from canonical collections; all three retained canonical rows match; both indexes report `unique: true`; duplicate groups are empty.
- Counts at verification time: frontend 168, backend 208. The two PR #61 SHAs were subsequently inserted into the backend ledger, so the current Atlas connector count is frontend 168, backend 210.
- Issue #32 is ready for closure after a final documented-SHA reconciliation. Umbrella issue #18 remains open for the other outstanding audit issues.


### Issue #32 final acceptance — closed

- After PR #61, all 139 unique 40-character SHAs referenced in `10-GIT-HISTORY.md` and `13-CURRENT-STATE.md` were checked against both canonical MongoDB ledger collections: 139 accounted for, zero missing.
- Issue [#32](https://github.com/yashbhoomkar/tech-katta/issues/32) was closed as completed with the migration and independent verification run links.
- Current canonical ledger counts after the latest source/merge entries: frontend 168, backend 210. Backup remains six records; both `key_unique` indexes enforce uniqueness; duplicate aggregations return no groups.
- Umbrella issue #18 remains open for other audit findings.



## PR #62 — production audit maintenance documentation and AI review verification (2026-10-12)

- Initial source commit: `9a17a4602eb3cf056d45922b0414b60b7d77d9ca` — documented canonical commit-ledger collections, guarded maintenance workflows, and evidence standards for AI review versus CI/static analysis.
- Follow-up source commit: `ba79429afdc095d9fb3725ab7ccc23f0813da98c` — addressed CodeRabbit's actionable finding by documenting the automatic `main` push trigger for the ledger repair workflow.
- Squash merge commit: `f6998eb941ca49ca7ee5b0e72d61288e25b6d8c2`.
- CodeRabbit submitted a completed review visible in GitHub's review API, including a walkthrough and a substantive inline comment. The inline thread was resolved after the README correction.
- Vercel preview feedback check passed. No application runtime or production database behavior changed.
- Issue [#30](https://github.com/yashbhoomkar/tech-katta/issues/30) is closed as completed. Umbrella issue #18 remains open for architecture and capacity findings.


## PR #64 — manual-only destructive ledger repair (2026-10-12)

- Workflow change source commit: `43088d8b13471c48850a1801c0bbc83be83900c2` — removed the automatic `push` trigger and added a required confirmation input, default false.
- Documentation source commit: `18e5d4e917d13ca1924515f5b1f8e308e9621af3` — documented the manual-only behavior and explicit `confirm_repair` gate.
- Squash merge commit: `8dfb94b265a97954c9f996f32175aa6eb62235ca`.
- CodeQL and Vercel preview checks passed. Post-merge workflow inspection confirmed only `workflow_dispatch` remains; no repair run was triggered by the merge.
- This is a safety hardening change only. It does not rerun the already-completed ledger migration or change canonical data.


## PR #65 — manual-only production k6 baseline (2026-10-12)

- Source commit: `d72ed677a9e52f2b01fe016a5c91257c94a3b3a0`.
- Squash merge commit: `513c99a31a49f802a64c567be45d01c9d2628059`.
- Removed the automatic `push` trigger for the production baseline. PRs run `k6 inspect` only, with no traffic.
- Production baseline requires a manual dispatch with both `run_production_baseline: true` and `confirm_production_target: true`. The validation run passed and the production job was skipped; no production traffic was sent.
- This does not satisfy the capacity-test issue: the baseline remains low-load and no Tech Katta staging backend exists.


## Latest audit continuation — PRs #53–#68 (2026-10-12)

### PR #53 — preserve article-search semantics
- Source: `db2395bb70fff2421583f79b2a431c22f8e21c8a`.
- Merge: `34d0d4db2aae0234b2e45d6fc427a75fe4a21653`.
- Added backend regression tests for case-insensitive substring search across title, eyebrow, description, and tags; category composition; trimming; blank input; and fallback behavior. Runtime search strategy was not changed because the live article corpus contains 11 articles and no measurable bottleneck was demonstrated. Issue #31 remains a measurement-based revisit trigger.

### PR #54 — isolated unique-index capability probe
- Source commits: `328a4d3c5d4e07d5992b9d74b6961e007b4cc9b0`, `f778066ea0fcd3108e6df1ad1bbc032dd987194b`, `cacbd6809d37b140e8eff0a207f9cc8abb896175`.
- Merge: `0607590574b1e0c019228f4384458fe6a4dc8171`.
- Added a VPS-runtime probe against an isolated temporary collection. Its first execution failed before connecting to MongoDB because the SSH action contaminated heredoc-fed Node input.

### PR #55 — temporary script-file attempt
- Source: `411c74d25fdd6199cb046893bece522b23cc5144`.
- Merge: `8822cab92ebcca8fd0e789e9199b85404144a7b7`.
- Attempted to avoid the stdin problem with a temporary script file. The SSH runner still contaminated the script source; the run failed before the database connection and no canonical ledger rows were changed.

### PR #67 — working script generation
- Source commits: `a5bc819cbcc4d987a4eef3455a967c39478b77be`, `0743b72a218ee36066b78d3f7d3bf88fec0f461f`, `5e931653b3915a6ee0b58946b2b27c598899e789`.
- Merge: `af411f0711c077185d90be3c8182b80df4c9f910`.
- Uses a single `printf` pipeline into `tee` as the `techkatta` service account, avoiding heredoc/stdin contamination. Successful isolated probe run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38205085520. MongoDB 8.0.34 reported a true unique index and rejected a duplicate insert with code 11000; the temporary collection was removed.
- PR #66 was closed as superseded by PR #67.

### PR #68 — enforce unique commit-ledger keys
- Source: `eef16ceebaa99e0c9f8ebcc32c7619f8fe0d4fb0`.
- Merge: `d5f8f8c16d98ed775fa0937a022ddc1230610c68`.
- Successful guarded migration run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38205375184.
- Before any index changes, verified all six expected backup rows, the three expected surviving duplicate-SHA rows, zero duplicate-key groups, and zero non-string keys in both canonical collections.
- Verified `unique: true` on the `key` index in both canonical collections. The migration did not delete or modify ledger documents; it removed the redundant non-unique index only if one was present.
- Live counts after recording the PR source/merge SHAs: frontend 168, backend 224; legacy `git_commits` remains present with 16 rows. The six-row duplicate backup remains intact.
- Reconciled 147 unique 40-character SHAs referenced in `10-GIT-HISTORY.md` and `13-CURRENT-STATE.md`: 147/147 are present in at least one canonical ledger collection, zero missing.
- Issue #32 is closed after the context and issue synchronization. Umbrella issue #18 remains open for #29, #31's revisit trigger, and #33.


## PR #69 — bounded local k6 integration smoke (2026-10-12)

- Source commit: `fc11a1c074b3b86d1870a12ac633d044de6a0c47` — add a local k6 profile for API reads, health throughput, and frontend browsing.
- Workflow source commit: `c0cf007db20b7d86085068bdeb0326f2c8a9f589` — run isolated MongoDB 8.0, seed the application DB, start the backend and Vite preview on localhost, and run k6 without production traffic.
- Squash merge: `4ce8403a9fc610ab9840479d29aabed162d0aeb6`.
- CodeQL, backend/frontend build, k6 inspection, and local integration job passed. The production k6 job was skipped as intended.
- Run evidence: https://github.com/yashbhoomkar/tech-katta/actions/runs/38205978125. Over 60 seconds, k6 recorded 442 requests (~7.37 req/s overall), zero HTTP failures, 884/884 checks passed, and zero dropped iterations. API-read p95 3.69 ms, frontend p95 1.31 ms, and health p95 1.32 ms.
- This is a local integration smoke, not a production capacity result. It does not include the VPS/Nginx/Cloudflare/Atlas network path; issue #33 remains open until staging or an approved monitored production plan exists.
- PR #69 source and merge SHAs are recorded in `techkatta_history.backend_git_commits`; backend ledger count is 227.
- Issue #29 remains blocked: no dedicated Tech Katta secondary is available; the overflow timer stays disabled. The VPS runtime database connection has a broad Atlas role, rotation history cannot be verified through the connector, and a secure runtime-secret update path is still required before a secondary can be provisioned (tracked in [issue #70](https://github.com/yashbhoomkar/tech-katta/issues/70)). No secondary was provisioned and no production traffic was rerouted.
- Issue #32 is closed; issue #18 remains open for #29, #33, and #31's measurement-based revisit trigger.


## PR #71 — read-only production browser smoke (2026-10-12)

- Source commit: `34b86a7737f827164dddd74f0f0fe619b9ec145a`.
- Squash merge commit: `d0aa934e87ad5ed9e0c1cc723de0a8f8b0e8fc2b`.
- Added `.github/workflows/production-browser-smoke.yml`, triggered by the workflow file's merge to main or manual dispatch. It runs Chromium against the live frontend/API and mobile-emulates touch gestures on a local Vite build; it does not run the production k6 load probe.
- Successful run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38206729819.
- Passed: home, unit, and canonical article routes; browser-origin API/CORS and canonical article response; mobile right swipe opens sidebar; home left swipe leaves route unchanged; article swipes navigate back/forward; short/vertical swipes ignored; sidebar-open left swipe closes without navigation; no uncaught browser exceptions.
- This is a low-volume read-only browser smoke, not a load/capacity test. No production configuration changed.
- Both PR #71 source/merge SHAs are recorded in `techkatta_history.backend_git_commits`; backend ledger count is 229.


## PR #73 and PR #74 — ledger-index probe workflow reliability (2026-10-12)

- PR #73 source commit: `22bf7413cd230ad3ad88c2692f5dce0cfddd3baf`.
- PR #73 squash merge commit: `23e6e3712329d17bfd324d62b7bc967b79708484`.
- PR #74 source commit: `86ee7329820b6e086df253c53e92c39a457d7e2e`.
- PR #74 squash merge commit: `a66df730143e7bf44d2206ce44dbdd6a890ffe63`.
- The VPS-run probe verified that MongoDB creates an index with `unique: true` and rejects duplicate keys with error code 11000. A cleanup bug in the first probe left one specifically named temporary collection; PR #74 removed that exact collection and corrected cleanup for subsequent runs.
- Successful verification run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38244494719. The run removed the stale probe collection and its own temporary collection. No canonical ledger rows were modified by these probe workflows.
- The canonical ledger migration had already passed in run https://github.com/yashbhoomkar/tech-katta/actions/runs/38198144807, and the independent read-only verification passed in https://github.com/yashbhoomkar/tech-katta/actions/runs/38198308593.
- The two canonical ledger collections currently have zero duplicate-key groups. Issue #32 is closed; umbrella issue #18 remains open for #29, #33, and #31's measurement-based revisit trigger.


## PR #75 — safe MongoDB runtime credential rotation preparation (2026-10-12)

- Source commits: `1149264f597a7268d6a918dadad193addfce7f9d`, `b5627e98c31324de15ca0498123e5a3165a5ad16`, `5ab5e43d1cefc4606535c6704b7fe0578ebf56f4`, `a3d512465241eb0c530ccd68af1dc59ee24fcfd3`, `7a0d7e20b8e879d2f0d183b90d7ac0dc7f56df49`, `db798828f86099e26f7ebc6c9c729c4ae1e93033`, `49385457ce25cc63e6e659d88ca849b79a8f36f2`, and `395b01ad841077e6713fbbbb07b4cf4293451678`.
- Squash merge commit: `ddb4ee014fa18df1d6c9fd6bd80aa233bd653312`.
- Added `.github/scripts/rotate-mongodb-runtime-uri.mjs` and a manual-only `.github/workflows/rotate-mongodb-runtime-credential.yml`. The helper validates a candidate URI before changing the VPS env file, requires exactly one `readWrite` role scoped to `techkatta`, atomically updates only `MONGODB_URI`, keeps a mode-0600 rollback file until API checks pass, and rolls back if readiness/categories/articles checks fail.
- Backend CI passed and CodeQL reported no new alerts after the file-system race finding in the initial draft was fixed with exclusive mode-0600 file creation. Vercel preview feedback also passed.
- This PR did not rotate credentials, create an Atlas user, update the VPS, or enable overflow. The existing Atlas user `bhoomkar04` still has `atlasAdmin`; issue #70 remains open until an authorized operator creates/rotates the least-privilege URI, stores it directly in the GitHub Actions secret `TECH_KATTA_MONGODB_URI_ROTATED`, runs the workflow, and verifies production.
- Issue #29 remains blocked; the overflow timer stays disabled and no secondary exists.


## PR #76 — bounded local rate-limit verification (2026-10-12)

- Source commits: `763c6ded46a730fb1657e061a40085eca0078c09`, `aa1fe26f7c50db7e1144821b50357252cc419524`, and `c012d1bfc4470dafe7988cb7178f3a487c1fe997`.
- Squash merge commit: `4f9e0c6739dd747edc27bf9ee79419c4092849ad`.
- Extended the local-only k6 integration workflow to wait for the previous API-read rate-limit window to expire, then send a bounded 3 requests/second profile for 50 seconds to the isolated CI API.
- Successful run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38246483684. The profile completed 151 requests (~3.02 req/s): 120 accepted, 31 throttled with HTTP 429, p95 2.99 ms, zero failed HTTP requests, zero dropped iterations, and 100% checks. All 429 responses had Retry-After and X-RateLimit headers. CodeQL reported no new alerts.
- This verifies configured per-IP rate-limit behavior on a local isolated stack, not production capacity. No production traffic was sent. Issue #33 remains open pending a dedicated staging backend or an approved monitored production test plan with resource observations.


## Editorial visual redesign — 2026-10-16

PR: https://github.com/yashbhoomkar/tech-katta/pull/79

Branch: `design/editorial-visual-redesign`

Application commits (both recorded in MongoDB `techkatta_history.frontend_git_commits`):
- `6997dbbb661c55d635c9ab6a57fe919c2469f2d4` — add an authored homepage hero with a CSS request-flow illustration and dynamic published-note list.
- `25fda2df01da1b167a66aa33c5b7c680d4cf4dcb` — refine the design system and responsive editorial layout for the homepage, topic index, recent notes, and article reading experience.

Validation at snapshot time: frontend CI passed, Vercel preview status passed, and Semgrep passed. CodeQL and bounded local k6 workflow were in progress. No merge, production deployment, screenshot comparison, or mobile device test is claimed.

- Follow-up cleanup `a1519bb4b9144f77d786e121f3edbe74e1c79ac8` removes an unused homepage binding; recorded in MongoDB. PR #79 was marked ready for review and manual CodeRabbit review was requested, but review evidence and latest-head CI are pending.

- Follow-up `76454c3d0f5a5917f3316065e4f1a99eadfa96db` improves small-label contrast in the editorial visual system; recorded in MongoDB. Latest-head CI and preview redeployment are pending.


- PR #79 review follow-up commits `369a2046d3d993db532c7f32ae1dfa163fb55e11` and `170c0b391a88b5b5737acd2ce68d82446738b730`: deterministic ordering for equal article `order` values, stronger visible keyboard focus styling, and larger system-illustration labels. Both source commits were recorded in the MongoDB frontend ledger. Latest-head CI is pending.
