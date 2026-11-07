# 17 — Session Handover (read this first)

Last updated **2026-11-07, 10:45 IST** (docs through #227; ledger for #216–#227 pending, see §1). Before that 10:15 IST (through #226), 03:20 IST (through #225). Before that 2026-11-06, 17:40 IST (through #215). Before that 2026-11-05 (sign-in session: #148–#169). Before that, 2026-11-03 by the session that shipped PRs #129–#140 (Lab phase 2, the UI/UX meeting items, the fixes from an in-depth QA run, and the dashboard start page).
Earlier sessions ran 2026-10-30 to 2026-11-01.
This file is meant to let a new session behave exactly like the one that wrote it. Read all of it,
then `12-OPERATING-RULES.md`, then the newest sections of `13-CURRENT-STATE.md`.
**Where an older file disagrees with this one or with the code on `main`, this file and the code
win.** This repository is **public**: never write personal, employer or credential information here
(owner-side notes that must stay private live in the private repo, see §11).

Labels: **Decided** = the owner's call, do not re-ask · **Known** = verified · **Pending** = waiting on
the owner · **Historical** = true once, not any more.

---

## 0. First ten minutes of a new session

1. Read this file, `12-OPERATING-RULES.md`, the last five sections of `13-CURRENT-STATE.md`, and
   `tech-katta/content/README.md`.
2. Check production is healthy: `curl -s https://tech-api.katta.cc/health` (shows the content
   release) and open `https://tech.katta.cc/dashboard/#lab`.
3. Run `tools/e2e/site-sweep.js` and `tools/e2e/lab-crash.js` from this repo against production
   (see `tools/e2e/README.md`). Both should end with `errors: []`.
4. Sync your working branch from `main` in each repo (§3).
5. Ask the owner nothing that §4 already decides. If the owner gives a task, do it end to end (§3).
6. **Agents** (from 2026-11-05): a long-running worker session, "Tech Katta worker (Learner + Builder)",
   runs cycles back to back: review production, the Learner and Builder debate, one of them ships the
   top item, both check it live, then the next cycle starts ~2 minutes later. A scheduled task
   ("Tech Katta worker: backup restart", every 2 hours) restarts the chain after a stop (usage limit,
   empty queue, repeated failure). The worker has push access to tech-katta only: its to-do list and
   rules are in **tech-katta/`agents/TODO.md`**; it lists handover rows under "Context repo pending" for
   a human-led session to copy here. The ledger is filled automatically on merge. A human-led session
   should read `agents/TODO.md` before starting work, so it doesn't collide with the worker.

---

## 1. Where things stand

**Update 2026-11-07, 10:45 IST** (owner: "the Lab has no components for problem-specific ideas … do it";
"Key decisions … do it"; **Decided: no AI review of designs — it would eat the margins**):
**#227** merged (`ffe2911`).
- **Parts with a job (roles):** Server, Database, Cache and Queue have a "What it does" picker (27 roles in
  `content/lab.json`, e.g. Geo index, Search index, Prefix index, Object storage, Ledger, Time-series,
  Wide-column, Key-value, Job store, Operation log, WebSocket gateway, Matching service, Sandboxed
  runners, Scheduler, Delivery workers, Event log, URL frontier, Sorted set, Holds with expiry). Roles
  don't change the simulation. Judge check `role {role, any?, behind?, min?}`; every problem's `normal`
  test (a sample) checks the parts it turns on, labelled by the job, not the role's name. Each problem has
  a "Right sizes, general parts" wrong design that must fail. `tools/practice/roles.mjs` writes all of it.
- **Key decisions:** 3–4 multiple-choice per problem (67), graded exactly, reason shown after Submit;
  right answers spread over positions (23/19/25).
- **Score now:** requirements 15 (10 + 5), estimates 10, API 10, key decisions 15, design 50; hints −3
  each (max −15). The server re-judges with the same weights.
- **AI evaluator (asked about, not built):** costed per evaluation (~6,500 tokens in, ~1,500 out):
  Claude Haiku 5.5 ≈ ₹0.1–0.16, Sonnet 5.5 ≈ ₹2–3, Opus 5.5 ≈ ₹7–10. Recommended Haiku 5.5 as a third
  "AI evaluator" tab beside Run and Submit, signed in, rate-limited, feedback only (score stays
  deterministic). **Pending:** the owner's go-ahead and an Anthropic API key on the VPS.

**Update 2026-11-07, 10:15 IST** (owner said "Proceed" to the offered next steps): **#226 read replicas**
merged (`3719625`), finishing Lab phase 2. A database takes 0–5 read replicas and a writes %; the judge's
crash message says reads kept working when the crashed database had replicas. No problem's tests changed
(replicas default to 0; all 22 calibrations still pass). Vercel's limit had reset by 10:00 IST, so the
#226 production deploy also carries #225. AI grading of written answers was **not** started: it needs an
API key and the owner's decision. Ledger for #216–#226 still pending (Atlas not reachable from this session).

**Update 2026-11-07, 03:00 IST** (newest; overnight work the owner asked for at 02:10 IST: "make this the best
system design practice experience with real evaluation… LeetCode for system design"):

- **tech-katta `main` = `af15e49`** (PR #225, the results panel folds and takes ≤42% of the canvas). **Vercel's
  daily limit was hit again after #224**: production frontend is `974113c` (#224); #225 goes live on the next
  Vercel deploy (live-check: the ▾ button on the results panel). Release `20261106T213304Z-974113c` on the VPS
  (#225 is frontend only), `accounts: ok`. Before #225: #224: API rubric methods may list alternatives ("PUT|POST"), two test wordings fixed,
  "Problems submitted" on analytics.katta.cc, "Pick one" (random unsolved), a ✓ Solved badge. Checked on production: `tools/e2e/problems.js` (Q01 full flow), `problems-medium.js`
  (payments, rider dispatch), `problems-server.js` (stubbed account API), site-sweep, lab-crash: errors [].
- **#221 The judge** (`frontend/src/judge/judge.js`): every Interview Question has a test suite (article
  `practice`, format in `tech-katta/content/README.md`). Tests are scenarios played on the visitor's own
  design by the Lab engine: traffic at an hour and rate, injected failures (server group dies, database
  fails over, cache crashes), checks: availability (with windows), **p99** (≈ base + 4.6 × (mean − base)),
  monthly cost, no crash, no lost writes, requires, **redundant (cut-vertex test: no single server group
  every request depends on)**, multiAz, has. Messages say what happened ("At 20:05 the Database was
  overloaded and failed over…"). Written steps graded: functional requirements by rubric keywords, NFR
  ranges, estimates within 3× (working shown), APIs by method + path regex. Score /100: requirements 20,
  estimates 15, API 15, design tests 50; hints −3 each (max −15).
- **Workspace** (`solve.jsx`): tabs Description (example tests) · Your answer · Hints · Solution ·
  Submissions; Run (examples) / Submit (all + answer); results console; Reset to the starting design;
  previous/next; a timer; divider; phones: Run/Submit bar fixed at the bottom. Tables on both tabs: ✓ Solved
  / ◐ Attempted, Acceptance, Best score, Lab stars. Storage: `tk-answers-v1`, `tk-hints-v1`, `tk-subs-v1`
  (`practice.js`); `solved:`/`practice:` progress flags now sync with the account (routes.js `storable`).
- **All 22 suites calibrated** (6–7 tests, 2 samples, rubric, 6–7 hints, start design, a reference that
  passes, 3–5 wrong designs each failing one test). `cd frontend && npm test` runs the calibration
  (225 tests, < 5 s); `frontend.yml` now also runs on `content/**`. Scripts: `tech-katta/tools/practice/`.
  The API serves practice **without** `reference`/`wrong` (no passing design one request away).
- **Engine change**: load balancers and API gateways health-check targets (a crashed group gets no traffic
  while another is up). All Lab challenge tests and e2e still pass. Known limit: two queues feeding the same
  workers each hand them full capacity; suites keep one queue per worker pool.
- **#223 Server-side judging**: `POST /v1/me/submissions` re-runs the judge on the API for signed-in users and
  stores the result only in `techkatta_app.submissions` {userId, slug, at, verdict, passed, total, score,
  cost, p99, hints} (not the design or answer); reply has acceptance and "cheaper than N% of accepted
  designs". `GET /v1/problems/stats` (public, cached 60 s). 30 per 10 min per IP, 256 KB. Delete my account
  deletes submissions. Privacy page section "Problems you submit". **Not yet tried with a real signed-in
  account** (needs Google sign-in; the owner can do it: Submit any problem and look for "Checked on our
  server").
- #222: landing hero and "What's inside" describe judged problems (no other company's brand on the site).
- Ledger: #216–#223 SHAs listed in `11-MONGODB-COMMIT-LEDGER.md` and `agents/TODO.md` (Atlas refused here).

**Update 2026-11-07, 02:00 IST**:

- **tech-katta `main` = `c956321`** (PR #220). Owner, 11-07: "the end goal of Problems, Interview Questions
  and the Lab is to make LeetCode for system design; Concepts, Components and the other tabs are the
  system design content platform; we sell the combination as cheap as possible" (**Decided**: positioning).
- **#219** (owner's screenshot: empty space beside articles on desktop): from 1240 px an article has a sticky
  right column ("On this page" with the section being read marked, "Try it in the Lab" card); article and
  column centred; top gap 48 → 28 px. Section pages are centred too (#220).
- **#220** (owner: "the tabs Interview Questions and Problems literally have the LeetCode style UI for any
  problem"): every Interview Question except "Start here" opens in a **workspace** (`frontend/src/solve.jsx`):
  left pane with tabs Description (the article's "1." and "2." sections) and Worked answer (the whole
  article); right, the Lab canvas with every component on the question's own design (`q-<slug>`, field
  `problem` on saved designs, kept by `store.js` and the account sync). `#problems/<slug>` opens on
  Description, `#interview-questions/<slug>` on the answer; the divider drags (width in `tk-solve-w`,
  capped so the canvas keeps 880 px); below 900 px one pane at a time with a third tab, Canvas. Both tabs
  list questions as a LeetCode-style table (status practised/designed, #, problem, difficulty, Lab stars,
  difficulty filters). Copy: `site.json` `problems.solve` (validated). **Not scored per question yet**:
  each question still links to a shared Lab challenge; per-question challenges are the next step offered.
- **Agents paused** (owner, 11-07: "don't trigger the auto agents cycle for now"). No scheduled tasks exist on
  the account; don't start a worker cycle until the owner says so.
- Vercel deploys again (the limit cleared about 01:30 IST).

**Update 2026-11-07, 01:15 IST**:

- **tech-katta `main` = `863069b`** (PR #218); content release `20261106T122632Z-863069b` on the VPS
  (39 articles, `auth: on`, `accounts: ok`). Since 17:40 IST: #216 Q21 Design video streaming (figures
  `video-pipe`, `abr`), #217 to-do list (ledger and handover checked through #215), #218 Q22 Design menu
  search (figures `search-flow`, `inverted`).
- **Vercel is rate-limited again (Known, checked 01:10 IST):** its last build was the #218 PR preview at
  17:53 IST; production frontend is still `a7e4093` (#215). The live bundle has no `video-pipe` /
  `search-flow`, so Q21/Q22 show their text (served by the API) without their two figures each (unknown
  figure ids are skipped since #178). Live-check both questions' figures on the next Vercel deploy.
- **Ledger: #216–#218 NOT verified.** This session could not connect to Atlas (`remote-atlas-connect`
  refused by the session's safety check, twice, even with the owner's go-ahead). Their 10 SHAs are listed
  in `11-MONGODB-COMMIT-LEDGER.md` and under "Ledger pending" in `tech-katta/agents/TODO.md`, for the
  worker (which has the MongoDB tool) to check and insert.
- **CI/CD and secrets (Known, from the #218 deploy log):** set: `VPS_SSH_KEY`, `GOOGLE_CLIENT_ID`,
  `MONGODB_URI` (shape check all "yes"), `SESSION_SECRET`. **Not set: `VPS_HOST`, `VPS_USER`,
  `VPS_FINGERPRINT`** (the log shows the hardcoded host/user and an empty fingerprint, so the SSH host key
  is not checked). No repository variables are used by any workflow. Secret/variable listing APIs are
  blocked by the session proxy; read the deploy log instead. GitHub still lists two workflows whose files
  are gone (`repair-api-tls.yml`, `frontend-ci.yml`, from the old site); they cannot run.

**Update 2026-11-06, 17:40 IST**:

- **tech-katta `main` = `a7e4093`** (PR #215); content release `20261106T120325Z-a7e4093` on the VPS
  (37 articles). **Vercel deploys again**: the limit cleared and #199–#214 went live at 17:26 IST;
  production frontend is now `a7e4093` (#215). The figures for Q08–Q20 and Concepts 06–07 and the landing
  "What's inside" block are live.
- **Since 13:35 IST**: Concept 07 transactions across services (#204, completes Concepts › Agreeing),
  Interview Questions Q11–Q20 (#205–#214): notification service, search autocomplete, payment system, job
  scheduler, web crawler, live leaderboard, ad click counting, distributed key-value store, shared document
  editor, rider assignment for food delivery. Each with two figures and a reviewer pass whose fixes landed
  before merging. #215: the landing hero button "Start practising" opens Problems; Problems in the landing nav.
- **Site**: Interview Questions Q00–Q20, Concepts 7, Components 9, Lab 9 challenges, Practice mode, Problems page.
- **Ledger**: complete through #215. Checked on 11-06 against the PR heads and `main`: all 36 SHAs of
  #204–#215 (24 source commits, 12 squash merges) are in `frontend_git_commits` (501 rows); the worker
  recorded them after each merge.

**Update 2026-11-06, 13:35 IST**:

- **tech-katta `main` = `dc0c225`** (PR #203); content release `20261106T080114Z-dc0c225` on the VPS.
  Vercel's daily limit blocks frontend deploys again: production frontend is at `426cba2` (#198). Merged
  but not yet live on Vercel: #199–#203 (figures for Q08–Q10 and Concept 06, the landing "What's inside"
  block). Their text is live; unknown figure ids are skipped, so nothing shows wrongly. Live-check them on
  the next deploy.
- **Site**: Interview Questions Q00–Q10, Concepts 6, Components 9, Lab 9 challenges, Practice mode, a
  **Problems** page (every question and challenge with progress), landing "What's inside" with counts.
- **Positioning** (owner, 11-06): practise system design like interview problems, with scores
  ("LeetCode for system design" as a guide only; not used in the site's name or ads).
- **Owner rules added 11-06**: don't wait for Vercel (keep merging, live-check on the next deploy); no
  daily cap on cycles ("We need to rapidly build"); give the owner times in IST.
- **Ledger**: complete through #203 (`frontend_git_commits`). Record each PR right after merging.

**Update 2026-11-06** (the 11-04 notes below are kept for history):

- **tech-katta `main` = `d2bd5e3`** (PR #195). Content release on the VPS `20261106T050506Z-0626da4`
  (#194). Production frontend on Vercel is at `352cf3f` (#192): Vercel's Hobby limit of 100
  deployments a day was hit again at about 03:30 UTC, so #193 (CSS only) is merged but not deployed.
  Content-only changes still go live through the backend deploy. Every push builds previews for both
  Vercel projects; `tech-katta-status` now has an Ignored Build Step (`git diff --quiet HEAD^ HEAD -- .`).
- **Site**: Concepts (5 articles), Components (9), Interview Questions Q00–Q07, Quick Notes, Did you
  know, the Lab (9 challenges), Practice mode (45-minute clock with step budgets and checklists).
- **status.katta.cc** had no DNS record; a CNAME to Vercel was added in Cloudflare on 11-06 and it serves.
- **Vercel Web Analytics** is on (#191).
- **Agents**: the worker runs cycles from `agents/TODO.md` in the site repo, chained with a 2-minute
  `send_later`, with a 2-hour backup schedule. Owner-approved rules (#192): re-plan every 5th cycle,
  one reviewer, push each PR once, at most 8 cycles a day, stop when nothing valuable is left.
- **Ledger**: it does not fill itself. #176–#195 were missing and were added on 11-06 (51 records);
  `frontend_git_commits` holds 445. Record each PR's SHAs after merging.
- **Open with the owner**: positioning as "LeetCode for system design" (a Problems page listing every
  question and challenge with stars, more gradable challenges, volume before using the label;
  don't use another company's brand in the site's name or ads); public previews; the paywall.

### 2026-11-04 notes

- **tech-katta `main` = `66c1660`** (PR #169). Production: `https://tech.katta.cc` (Vercel), API
  `https://tech-api.katta.cc` (VPS behind Cloudflare). Content release on the VPS:
  `20261104T155446Z-b659aa1` (release names end with the deployed commit; this one is a manual
  re-deploy of the same commit to load the sign-in secrets).
- **Components articles in progress** (owner 11-04: "Till then let's write articles in the components
  section … Decide the sub sections, topics first and start writing one by one"). Subsections
  (`site.json` `dashboard.groups`) and the plan, one article per PR, in this order:
  - **Edge**: 1 Load balancers ✅ (#142), 2 CDNs ✅ (#143), 3 API gateways and rate limiting ✅ (#144).
  - **Compute**: 4 App servers and autoscaling ✅ (#145).
  - **Storage**: 5 Caches (Redis) ✅ (#146), 6 Databases ✅ (#147; owner asked to think the content through first: outline in the plan, scope excludes CAP lectures, storage engines, normal forms), 7 Sharding and partitioning ✅ (#160; figures `shard-key`, `hot-shard`), 8 Object storage ✅ (#161; figures `obj-upload`, `obj-tiers`).
  - **Messaging**: 9 Queues vs event streams ✅ (#162; figures `queue-vs-stream`, `consumer-lag`). **The 9-article Components plan is complete.** Next candidates (owner to pick): Interview Questions articles (URL shortener, rate limiter, event pipeline), more Concepts (replication, consistency, CAP in practice), narration once content is final.

  Each article has: In 30 seconds, the Zotato example, an "In real life" analogy, 1–2 animated
  figures (`frontend/src/figs/components.jsx`, ids also in `validate.js` `FIGS`), `type` cards for the
  choices, costs and failure modes, In an interview, and a `lab` card. No narration until the owner says the content is final.
- **Review and hardening (owner 11-05: "validate the content, make the frontend and backend strong"),
  #166–#168.** Content: every number and product claim re-checked; fixed the API-gateway monthly cost
  (~$6,800 with volume tiers), two cache claims that presented the Lab's numbers as real limits, and
  the Quick Notes round trip (now Mumbai ↔ US East ~200 ms). Backend: request/header timeouts checked
  every 2 s (Node's default 30 s check let stalled clients linger), 64 KB bodies except the Lab sync,
  a rate limiter that never forgets counted keys under a flood (`makeLimiter`), graceful shutdown,
  exit on uncaught errors with systemd `Restart=always`, CSP on JSON. Frontend: CSP / HSTS / COOP in
  `vercel.json` (no inline scripts; Google sign-in allowed via `accounts.google.com/gsi`), reload once
  on a stale chunk after a deploy, 15 s timeout on account calls. `tools/e2e/csp.js` opens every page
  type under the policy and lists violations (0 on production). `npm audit`: 0 in both apps.
  **When adding a third-party script, font, image host or API, add it to the CSP in `vercel.json`.**
- **Chaos testing (owner 11-05, #169):** `tools/chaos` (README there). Backend experiments run on a
  local copy with fault proxies in front of MongoDB and the Google key server; browser experiments are
  safe on production. Found and fixed: MongoDB black hole made sign-ins wait ~40 s (now ~10 s via
  `connectTimeoutMS`/`socketTimeoutMS`), Google keys unreachable hung sign-in 70 s+ (now 5 s). Results
  20/20 backend, 11/11 browser. Re-run both after changes to the API, accounts or loading code.
- **Concepts articles in progress** (owner 11-05: "More concepts"). Subsections
  (`dashboard.groups.concepts`) and the plan, one article per PR:
  - **Basics**: 1 APIs ✅ (grouped here in #163, body and narration unchanged), 9 Back-of-the-envelope numbers.
  - **Data across machines**: 2 Replication ✅ (#163; figures `repl-sync`, `repl-failover`), 3 Consistency models ✅ (#164; figures `consistency-timeline`, `double-accept`), 4 CAP and PACELC in practice ✅ (#165; figures `cap-split`, `pacelc`). Subsection complete.
  - **Staying up**: 5 Availability, SLOs and the nines, 6 Timeouts, retries and circuit breakers.
  - **Agreeing**: 7 Consensus and leader election, 8 Distributed transactions (2PC, sagas).

  Concept figures live in `frontend/src/figs/concepts.jsx` (`CONCEPT_FIGS`); ids also in `validate.js` `FIGS`.
- **Sign in with Google is ON** since 2026-11-04 ~15:55 UTC (#141). The owner created the Google
  OAuth client (Web, origin `https://tech.katta.cc`, no redirect URIs; client ID
  `1084375438071-8ssv8q2lmh8odjb1vsms7va7bpcjmjn8.apps.googleusercontent.com`, public), the Atlas user
  for the API, and the GitHub secrets `GOOGLE_CLIENT_ID`, `MONGODB_URI`, `SESSION_SECRET`.

  A manual "Deploy Tech Katta Backend" run wrote them to `/etc/tech-katta/api.env`. `/health` shows
  `auth: "on"` and `/v1/auth/config` returns `enabled: true` with the client ID.

  **Production status (Known, 2026-11-04 17:25 UTC): sign-in WORKS.** The owner signed in at 17:15
  (Google → user, 2 sessions stored as 64-hex hashes, lab doc with 3 designs). `/health` shows
  `"accounts": "ok"` (#148: `ok` | `checking` | MongoDB error kind, never the message). The deploy log
  prints a yes/no shape check of `MONGODB_URI` (#150), which is how the bad secrets were found
  (`< >` and a space left in; then a typo in the host → `ENOTFOUND`).
  - Atlas user `techkatta-api` exists but has **atlasAdmin** (should be `readWrite@techkatta_app`), and
    its password was posted in the chat: owner to rotate it (Atlas → Database Access → Edit →
    Autogenerate), then update `MONGODB_URI` and re-run the deploy. Cluster host:
    `cluster0.q5q8bgn.mongodb.net`.
  - **Gotcha:** the VPS still sets `MONGODB_DB=techkatta` (an older backend). The first real account
    landed in db `techkatta` (next to that backend's `categories`, `articles`). #151 reads
    `ACCOUNTS_DB` instead (default `techkatta_app`). The owner's 17:15 documents are still in
    `techkatta.users/sessions/lab`: harmless, can be dropped later; they re-upload from the browser.
  - Sessions (#151): re-sign-in ends the browser's old session; `POST /v1/auth/signout-all` + menu
    "Sign out on all devices"; renewed to 30 days on use (at most once a day), never past 90 days
    after sign-in.

  **Landing Lab locked + Meta ads opt-in (Decided, owner 11-04; #154):** the landing page IND vs PAK
  Lab (phone widget and desktop canvas) is blurred and inert behind "Sign in to play" until Google
  sign-in (`LabLock` in `accountui.jsx`; dashboard Lab stays open; open when sign-in is off). Under
  that button an **unticked** opt-in box "Show me Tech Katta updates on Facebook and Instagram"
  (`account.adsConsent`); stored as `users.adsConsent {ads, at, version}`; a plain sign-in never
  withdraws it; the account menu switch calls `POST /v1/me/consent`. Users also store `firstName`,
  `lastName`, `country` (first sign-in, `CF-IPCountry`), `lastCountry`. Owner says Meta permission is
  in place; Claude declined a non-consented upload (DPDP Act / Meta terms / the privacy page), the
  owner chose opt-in. **Export for Meta:** `backend/scripts/meta-audience.mjs` (hashed CSV of
  consented accounts only; `--json users.json` works on an Atlas `find({'adsConsent.ads':true})`
  export). Never commit or post the output. Privacy page section "Ads on Facebook and Instagram".
  e2e: `tools/e2e/landing-lock.js` (local stack); `landing-lab.js`/`landing-phone.js` answer
  `/v1/auth/config` with "off" so they can still drive the Lab on production.

  **Dashboard tabs need sign-in (Decided, owner 11-05, #159):** every tab and article shows
  `PageLock` ("Sign in to open this", page title, required Terms box) over a blurred stand-in while
  signed out; the real page isn't loaded (no fetch, no opened events), event `page_locked`. The start
  page, Privacy and Terms stay open. Production e2e scripts wrap `chromium` with
  `tools/e2e/open-site.js` (sign-in config answered "off"); `E2E_SIGNIN=on` disables that. Lock e2e:
  `dashboard-lock.js` (local stack).

  **Analytics dashboard (owner 11-05, #158):** page `frontend/analytics/` (`src/admin.jsx`), live at
  `https://tech.katta.cc/analytics/`; meant for `https://analytics.katta.cc` (vercel.json redirects
  `/` there to `/analytics/`). Data from `GET /v1/admin/summary?days=` and `/v1/admin/audience.csv`,
  only for `users.role: "admin"`; `ANALYTICS_ORIGIN` gets read-only CORS. The dashboard uses the
  session from signing in on tech.katta.cc (same site). **Live (11-05):** `analytics.katta.cc` is attached to Vercel project
  `tech-katta` and the Cloudflare DNS record exists (CNAME `analytics` → `fd6163fe67632484.vercel-dns-017.com`,
  DNS only), created by Claude through the owner's **Cloudflare API** connector (mcp.cloudflare.com/mcp;
  zone katta.cc `728eeeb7602aed996f47e1c4210e6491`). Vercel team access was approved by the owner
  (the 10-minute limit is only on the approval link). Admin = the owner's Google-verified address
  (#159: only its SHA-256 is in the code, `ADMIN_EMAIL_SHA256`; also `ADMIN_EMAILS` env or
  `role: "admin"`); the owner just needs to sign in again (they deleted their account on 11-05). Automated browsers send no events, so e2e runs don't show up.
  e2e: `tools/e2e/analytics.js`; `events.js` now opens the locked landing Lab and clicks Lab buttons
  directly (the phone Lab palette sits under the sticky bar for Playwright).

  **Sign-in box (Decided, owner 11-05, option A, #157 — supersedes #155):** the box reads "I agree to
  the [Terms and conditions] and the [Privacy policy]." It is unticked and **required**: the Google
  button is greyed/blocked until ticked, and the API refuses a sign-in without `termsAccepted: true`
  (`400 terms_required`); `users.terms {at, version}` records it. The Meta ads opt-in is **not** part
  of sign-in: only the account menu switch, off until turned on (Claude declined making Meta sharing a
  condition of sign-in; the owner chose A). The landing header shows a "Sign in" link to the card.

  **Backend hardening (#156, after an owner-requested review):** `lab.rev` optimistic concurrency
  (`accounts.updateLab` re-merges on a clash; docs without `rev` count as 0); sign-in retries the
  `googleSub` duplicate-key race; `users.adsConsentLog` (every change, last 50); delete removes the
  user before its sessions; usage events pause over 400 MB (`EVENTS_MAX_MB`, free cluster is 512 MB),
  `/health` `storage: {mb, eventsPaused}`; indexes created at startup. Leftovers the owner OK'd to delete (11-05) but the Atlas MCP delete needs an in-app approval that
  timed out twice, so they are still there: the first sign-in's docs in the old `techkatta` db (users/sessions/lab with a
  `googleSub`), and 3 test events (visitor `hm3xs4xrh7tzr504wyfiq8ok`).
  Start page: Library cards no longer sit inside a white panel.

  **Usage events (Decided, owner 11-04: "record every action for analysis"; #152, #153):**
  `techkatta_app.events` `{name, at, visitor, userId?, device, page, props}`, TTL 13 months, linked to
  the account when signed in (Delete my account deletes those). Allowlist in
  `backend/src/auth/events.js` (page_view, article_open/finish/close, read_aloud, lab_open,
  component_add, run_start, challenge_start, score, sign_in/out/out_all, delete_account); client
  `frontend/src/analytics.js` (visitor id `tk-visitor` in localStorage, no cookie; batches every 5 s,
  sendBeacon on hide). Nothing is sent with GPC/DNT on, or from automated browsers
  (`navigator.webdriver`, so tools/e2e runs don't count). Privacy page section "How the site is used".
  Test e2e: `tools/e2e/events.js`. 3 events from a check at 17:52 UTC (visitor
  `hm3xs4xrh7tzr504wyfiq8ok`) are test traffic: exclude or delete.

  **Correction:** the VPS IP `129.121.133.47` is **not** in the Atlas network list (only
  `0.0.0.0/0` and `103.234.212.68`). Add it before removing `0.0.0.0/0`.

  **Where sign-in is (Decided, owner 11-04 "WE NEED IT ON THE LANDING PAGE!", #149):** landing
  page header (Google button, "Sign in" on phones next to MENU; avatar menu once signed in) and
  under a phone IND vs PAK score with stars ("Sign in to keep your stars…", `account.keepStars`).
  The dashboard header has **no** sign-in button; it shows the avatar menu once signed in.
  Not built yet (offered): an invite in the full Lab / Score dialog, a "saved where" line in the Lab.

  **Owner to-dos:**
  - Rotate the `techkatta-api` password, set its role to `readWrite@techkatta_app` (above).
  - Reset the Google client secret: it was pasted into a chat; the site never uses it.
  - Add the VPS IP to Atlas, then decide whether to remove `0.0.0.0/0`.

- The site:
  1. **Landing** `/` (#131, then #134 per the owner) — nav Concepts / Components / Interview
     Questions / Lab (all open dashboard sections); hero "System design, explained." with the animated
     Kafka figure (FIG. 01), buttons **Dashboard** → `/dashboard/` and **Try IND vs PAK** →
     `#ind-vs-pak`; **01 Try it: "Can your design survive IND vs PAK?" — the real Lab embedded**
     (lazy-loaded when the section nears the screen; the Lab challenge `ind-vs-pak` in embedded mode:
     no Designs/Challenges menus, "Open in the full Lab" → `/dashboard/#lab/ind-vs-pak`; copy in
     `site.json` `landingLab`; **below 900 px a three-control version** — CDN on/off, servers −/+,
     before the toss vs autoscale, Score — `src/lablite.jsx`, copy `landingLab.lite`, #137); footer (no GitHub link, "Last updated: <build
     date>"). Not on the landing page: the Library cards (dashboard start page, #140), Quick Notes,
     Numbers Worth Knowing (dashboard Quick Notes page), Did you know (its own dashboard tab). The old IND vs PAK widget (`challenge.js`) is deleted.
  2. **Dashboard** `/dashboard/` — sidebar + top tabs: **Concepts · Components · Interview Questions ·
     Quick Notes · Did you know · Lab**. **Start page (#140, owner): no tab selected**; it shows the
     three Library cards with their mini diagrams (`src/library.jsx`, `library.css`; "LIBRARY /
     Concepts · Components · Interview Questions"); a card selects its tab and opens the section's
     first article (or the section while it has none). Unknown or malformed hashes land here too. **Did you know** (#134; `site.json` `fact`): one of
     the busiest websites is an adult video site (unnamed, SFW; ~115M visits/day 2019, 4,403 PB in 2018
     ≈ 147 GB/s, from its own yearly reports; chunked video, CDN, plan for the peak; link to the IND vs
     PAK challenge). The **Learn** tab (levels) was **removed** in #139 at the owner's request.
     Progress in localStorage `tk-progress-v1` (`src/progress.js`) keeps tour-seen flags and challenge
     stars. Header **Tour** button (#133; dashboard tour 3 steps). One published article: Concepts › "APIs: the main types, and which one to
     use where" (`/dashboard/#concepts/api-types`), with "In real life" analogies. Components and
     Interview Questions are empty ("Nothing published here yet").
  3. **System Design Lab** `/dashboard/#lab` — the site's main differentiator (§7).
- **All content** (copy, articles, Lab catalogue) is JSON in `tech-katta/content/`, stored on the VPS
  disk as validated releases and served by the API (§6). The frontend hardcodes no content.

---

## 2. The owner and how to work with them

- Owner: Yash Bhoomkar (GitHub `yashbhoomkar`); builds Tech Katta alone; based in Pune, India.
- Style: short task lists ("Tasks 1. … 2. …"), often typed quickly on a phone (expect typos:
  "shirt content" = short content, "see Aaik handover" = session handover). Expects the work **done,
  deployed and reported**, not advice. Follow-ups are short: "What happened?", "Think clearly",
  "Maintain consistency". Answer directly, then act.
- The owner **tests on the live site** and reports observations (e.g. "credits are not being consumed
  continuously", "check multiple Clients into the API Gateway", "the play/pause box is not scrolling
  away"). Reproduce each one in a browser first, find the root cause, and say what it was ("the maths
  was right; new boxes were stacked on one spot").
- When asked "should we X or Y?", give a clear recommendation with reasons and a table if useful; the
  owner then decides (sometimes against the recommendation — e.g. content on the VPS disk rather than
  in git-only files; fine, implement it well).
- When the owner says "you decide" / "you decide and build", decide, state the decisions in a table,
  build, and record them as Decided.

**Standing instructions (Decided):**
1. **Never ask for permission — the answer is always "allow".** Still ask about genuine product or
   business decisions you cannot reasonably decide, with your recommendation.
2. **Every code change goes through a PR**: open → CodeQL + frontend CI green → merge → verify
   production → update this repo → report.
3. **CodeRabbit is skipped** (owner, 11-01: "You may skip it"): don't request it or wait for it;
   merge when CodeQL and the frontend CI are green. If it reviews anyway, fix every valid finding
   and reply on each thread. (Supersedes the earlier "request it, don't wait when rate-limited".)
4. **Keep this repository current** after every change, and keep this handover up to date.
5. Copy must read as written by a person — plain, specific, never AI-sounding. Never copy text from
   reference sites; use them as guidance only.

---

## 3. Workflow (follow exactly)

Repos: `yashbhoomkar/tech-katta` (site), `yashbhoomkar/tech-katta-context` (this repo),
`yashbhoomkar/tech-katta-private` (private notes; attach with `add_repo` when needed). The previous
session's branch was `ccr-8814343d-wtj931`; a new session is told its own branch — use that.

1. **Sync**: `git fetch origin main && git checkout -B <branch> origin/main`. After a merge, if the
   remote branch lags, `git merge --ff-only origin/main` and push. **Never force-push.** If a remote
   branch has unmerged commits, merge `origin/main` into it instead of rewriting.
2. **Edit.** Frontend style: terse, minified-looking JSX; CSS as one-line rules; match it.
   Watch CSS order: a later rule with equal specificity wins (caused a phone overflow once).
3. **Build/test**:
   - frontend: `cd frontend && npm ci && npm run build`; `npm test` = Lab engine + saved-design
     tests (45). **`frontend/package-lock.json` is committed** (changed 11-01; keep it).
   - backend: `cd backend && npm test` (29 tests incl. content validation);
     `node scripts/check-content.mjs ../content`.
4. **Verify in headless Chromium** with the scripts in `tools/e2e/` (see its README): desktop
   1440×900 + iPhone/iPad profiles, overflow sweep 320→1440 px, no console errors, reduced motion,
   frozen animation frames. Test a feature against a local API before merging when the frontend
   depends on new content.
5. **Commit** with a descriptive message (what and why, decisions, test results) ending with the
   attribution lines the harness gives. Push: `git push -u origin <branch>`.
6. **PR** via GitHub MCP (`create_pull_request`, base `main`): Summary + Test plan checkboxes +
   Claude Code footer. Don't request CodeRabbit (§2). Check the runs with GitHub MCP
   `pull_request_read` method `get_check_runs` (or `curl -s https://api.github.com/repos/yashbhoomkar/tech-katta/commits/<sha>/check-runs`).
   Names: "Analyze JavaScript and TypeScript **(javascript-typescript)**" = CodeQL, "Test and build
   frontend" = frontend CI; both must be green ("CodeRabbit … skipped" is fine). They finish in about
   a minute. **Poll with a bounded loop that prints every iteration** (e.g. `for i in $(seq 1 20)`),
   never a silent `until` loop: on 11-01 an `until` loop that grepped for the name without
   "(javascript-typescript)" never matched and hung for 10 minutes with no output.
7. **Merge**: `merge_method: merge`, `expectedHeadSha` = the **full 40-char SHA** from
   `git rev-parse HEAD` (never type it from memory — a wrong suffix fails with 409/422).
8. **Verify production**: frontend — poll until the live bundle contains a string unique to the change
   (Vercel ~20–60 s; the Lab is its own chunk `assets/Lab-*.js`). Backend/content — the "Deploy Tech
   Katta Backend" workflow must succeed and `/health` must show the new release `<UTC>-<short sha>`
   (the workflow itself fails and rolls back otherwise). Rerun the browser
   checks against production.
9. **Update this repo**: dated section in `13-CURRENT-STATE.md`, a line in `10-GIT-HISTORY.md`, rules
   in `12-OPERATING-RULES.md`, and this handover. Merge to `main` of this repo via PR (a new session
   reads `main`).
10. **Report**: what changed, root causes, exact numbers verified, what was not verified, pending items,
    and suggested next steps.

**Ship order when the frontend depends on the API:** backend PR → deploy → verify live → frontend PR →
content PR that switches the feature on. Changes where the frontend tolerates both old and new
content can ship in one PR.

---

## 4. Decision log (Decided — do not re-ask)

| When | Decision (owner's words where useful) |
|---|---|
| 10-30 | Workflow: PR → CodeQL (+CodeRabbit) → merge → verify → notify; never ask permission |
| 10-30 | Diagrams: block diagrams, Swiss colours, built from scratch; copy must not sound AI-generated |
| 10-31 | Site briefly switched to a private placeholder, then **reverted** at the owner's request |
| 10-31 | **Dashboard page** from the owner's Stitch mock, Swiss scheme; "Dashboard" button opens it |
| 10-31 | **Never show a GitHub link** on the site; footer shows the real last-updated (build) date |
| 10-31 | First Concepts article: **APIs — types and which to use where** |
| 10-31 | Articles get **read aloud**, **animated figures**, and **one example system** per article |
| 10-31 | Example system renamed **Dabba → Zotato** (owner's choice; resembles Zomato knowingly) |
| 10-31 | **Mobile first**: ~75 % of visitors from Instagram/LinkedIn on phones; figures fit + "Tap to view full screen" |
| 10-31 | Human-like voice: **Kokoro** (open source). **Record only when an article's content is final** |
| 10-31 | Articles: **short, structured, depth on demand** ("very structured short content … in depth") |
| 10-31 | Paid reference notes moved to the **private** repo `tech-katta-private` |
| 10-31 | "Important": **content in the backend**, frontend renders what the API serves |
| 10-31 | Content stored on the **VPS disk (50 GB SSD)**, "structured properly" — not MongoDB |
| 11-01 | **System Design Lab** is the differentiator: canvas, simulator, evaluator; $200,000 virtual AWS credit; Swiss colours; tab in sidebar + top bar |
| 11-01 | Lab answers: **$200k credit per design**; history saved for the user (browser for now); **laptop-first**; React Flow OK; rest delegated |
| 11-01 | "Refine this phase before phase 2"; **credits must drain continuously** while traffic runs |
| 11-01 | Tap-to-add stays; also **drag from the sidebar** |
| 11-01 | Crash policy: "You decide and build" → §7 |
| 11-01 | **Skip CodeRabbit** ("You may skip it"): don't request or wait for it; merge on CodeQL + frontend CI. If it reviews anyway, fix valid findings |
| 11-01 | Lab phase 2 order (owner's handover update): time-based traffic → autoscaling → CDN → read replicas. Read/write mix, p95/p99, transfer/storage costs only suggested, not decided |
| 11-01 | Cache policies: owner asked "should they be part of the simulation"; recommendation accepted ("Build three"): **warm-up after restart, down → database or fail, write-through vs write-back**. Not simulated (explained in text only): read-through vs cache-aside, LRU/LFU, TTL, write-around, miss coalescing |
| 11-01 | **Arrows can be removed** (✕ on a selected arrow, Arrow panel button, Delete) |
| 11-02 | **UI/UX meeting minutes** — see §4a |
| 11-02 | Owner: remove Did you know from the landing page → its own dashboard tab (sidebar + top bar); **the actual Lab on the landing page for IND vs PAK**; hero button back to **Dashboard** (#134). Built the CDN (with "live content") and the `ind-vs-pak` Lab challenge for it |
| 11-07 | Overnight (owner: "real evaluation", "do everything"): Claude decided hints cost 3 points each (max 15); estimates within 3×; tests are scenarios on the visitor's design, never a comparison with a model answer; server-side judging stores results only; scoring weights 20/15/15/50 |
| 11-07 | **LeetCode for system design**: Problems, Interview Questions and the Lab are the practice product; Concepts, Components and the rest the content platform; sold together, as cheap as possible. Every question opens in a workspace (#220). Agents paused until the owner says so |
| 11-03 | **Learn tab removed** (#139). **Dashboard start page: no tab selected** ("Trust me and do this"), showing the **Library cards moved from the landing page**; a card opens its tab and first article (#140) |
| 11-03 | **Sign in with Google; user data in MongoDB Atlas** (owner: "Use mongodb and complete the task"; asked about Firebase twice, then "Stay with MongoDB and finish it"). Database `techkatta_app` on the existing Cluster0, separate DB user for the API. Saved per account: Lab designs, challenge stars, tour flags. Signed out = browser only, as before |
| 11-02 | Owner: "Invoke another agent … in depth" → independent QA run (§8); "Continue" → all four fix groups built (scoring, saving, phones, the rest), incl. **phones get a three-control version of the landing IND vs PAK** |
| 11-02 | Items 2, 3, 5, 9, 10: "You decide and build". Decided: analogies as an article block + `like` on type cards and Lab components (Indian everyday examples); gamification = Lab challenges with 1–3 stars (availability first, then cost / no crash / no lost writes), the challenge owns the traffic, chaos crashes on purpose; levels = Learn tab with 3 paths, the dashboard opens on it; import = text chains with aliases + JSON, Export JSON; tour = custom highlight cards, auto once per area, never for automated browsers |
| 11-01 | External repo review → "Do everything to fix everything": all engineering findings fixed (#127), Lab phase 2 started with Load Balancer, Cache, Queue (#128) |

### 4a. UI/UX meeting minutes (owner, 11-02) and what happened to each

| # | Item (owner's words) | Status |
|---|---|---|
| 1 | Landing page should have less content | ✅ #131 (hero, Try it, Did you know, Library) |
| 2 | Website tour | ✅ #133 (dashboard 3 steps since #139, Lab 6; first visit + Tour button) |
| 3 | Import your own architecture | ✅ #133 (text chains or JSON; Export JSON) |
| 4 | Read-out feature fix → "voice sounds robotic" | ✅ #131 Kokoro narration for the API article |
| 5 | User-level-wise learning | ✅ #132 (Learn tab) — **removed in #139** (owner: "Remove that beginner intermediate and advanced thing from the dashboard"); challenges keep their level grouping inside the Lab |
| 6 | Quick Notes should not be on the landing page | ✅ #131 (and Numbers moved to the dashboard) |
| 7 | "Give the user the unexpected → adult website": surprise visitors with how much traffic such sites get at night and how their systems work | ✅ #131 "Did you know"; owner chose **unnamed, SFW wording**; **moved to its own dashboard tab in #134** (owner) |
| 8 | IND vs PAK → **Lab challenge on the landing page, to acquire users** | ✅ #131 widget; owner chose **real numbers, no app name** (3.5 crore concurrent, WC 2023); **#134: the real Lab embedded on the landing page** with the `ind-vs-pak` challenge (owner) |
| 9 | Analogy with a real-world example | ✅ #132 ("In real life" in articles and on every Lab component) |
| 10 | Gamification | ✅ #132 (6 Lab challenges, up to 3 stars each) |

Design rules in force: Swiss publishing style (white, surface `#f5f7fa`, hairlines `#d9dee7`, cobalt
`#2855d9` accent only, graphite `#1c2733`, muted `#586575`; Inter + IBM Plex Mono; no heavy shadows);
keep colours consistent within a component (e.g. the example-system heading is all cobalt); status
colours only for load in the Lab (amber ≥70 % incl. exactly 100 %, red >100 % / crashed).

---

## 5. Articles, figures and read aloud

- Article JSON: `{section, slug, no, tag, date, title, dek, body, audio?}`. Body blocks (see
  `content/README.md`): `tldr`, `example`, `fig {id, cap}`, `h2`, `p`, `list`, `type {name, kind,
  what, use, avoid, ex, more}`, `code {label, x, say}`, `table`, `more {label, body}`. Backticks in
  text render as code. Validation rejects unknown blocks and figure ids.
- Shape of an article: "In 30 seconds" box → example-system box → figures and cards → short decision
  list → design rules → one-liners → interview checklist; long material collapsed. Header shows
  "5 MIN READ · 10 WITH DETAILS".
- **The API article** covers REST, GraphQL, gRPC, WebSockets, SSE, webhooks, queues; SOAP note;
  comparison table; decision list; "Designing Zotato's REST API" (resources not actions; path vs
  query vs body; endpoint list; `POST /orders` with an idempotency key; method retry semantics;
  status codes, 4xx vs 5xx); what every API needs (auth, rate limits/429, cursor pagination,
  idempotency keys, statelessness, consistency, versioning); interview checklist. CodeRabbit-driven
  corrections: GraphQL can be cached via GET/persisted queries; webhooks store before 200 and retries
  differ by provider; SSE is one-way; only browsers need gRPC-Web; ask "another company reporting an
  event?" before "can it happen later?".
- **Figures** (`FIGS` in `frontend/src/dashboard.jsx`; 640-wide SVG, SMIL packets, static under reduced
  motion, full-screen dialog rotated in portrait): `patterns` FIG. 01 four ways programs talk;
  `choose` FIG. 02 decision ladder (webhook → queue → SSE → WebSockets → gRPC → GraphQL → REST);
  `order` FIG. 03 one Zotato order end to end (sequence diagram, 8 steps); `retry` FIG. 04 retry with
  an idempotency key. Figure labels are still in frontend code (moving them to content is pending).
- **Read aloud**: browser voices ranked (Edge Natural/Online, Apple Premium/Enhanced/Siri, Google;
  en-IN preferred), voice picker, speed, highlight, sentence-sized chunks (`speech.js`); collapsed
  sections not read. Recorded narration via `tools/tts` (Kokoro `af_heart`) plays when the article has
  `audio: true`. **The API article is recorded** (#131, 54 chunks, 2.8 MB in
  `frontend/public/audio/api-types/`): the owner found device voices robotic (11-02), which overrides
  "record only when final". Re-run `tools/tts` after editing the article (unchanged chunks are kept).
- Share button (native share sheet / copy link); OG/Twitter tags + `/og.png` on both pages.

---

## 6. Architecture

**Frontend** (`tech-katta/frontend`, React 18 + Vite 6, Vercel on merge, root `frontend`):
`/` → `index.html` → `src/main.jsx` + `styles.css` (boots with `/v1/site`); `/dashboard/` →
`dashboard/index.html` → `src/dashboard.jsx` + `dashboard.css` (boots with `/v1/site` + `/v1/articles`;
hash routes `#<section>`, `#<section>/<slug>`; `ArticlePage` fetches bodies; `Block` renderer;
`Reader`; `Share`; `FullFig`; Lab lazy-loaded). `src/api.js` (`getJSON`, `VITE_API_BASE`, retry once,
8 s), `src/status.jsx` (Loading / LoadError + Try again), `src/speech.js`, `src/lab/` (§7).
`vercel.json` rewrites `/dashboard`, `/health`. Legacy files were removed in #127. Root `README.md`
describes layout, local run, tests and deploy.

**Backend** (`tech-katta/backend`, Node 22; one dependency, `mongodb`, for sign-in; dev: `mongodb-memory-server`): `/health` (incl. `content.release`),
`GET /v1/site`, `/v1/lab`, `/v1/articles[?section=]`, `/v1/articles/:slug`. Content routes: CORS `*`,
`Cache-Control: public, max-age=60, stale-while-revalidate=600`, ETag/304, OPTIONS allows
`If-None-Match`, 405 on writes, slug validation, 404 `no-store`. `src/content/store.js` +
`validate.js`: load `CONTENT_DIR` (default repo `content/`), validate everything (article blocks,
figure ids, a shape spec for every `site.json`/example field the pages read, Lab catalogue
shapes/units/crash policy, the Lab example design), refuse to start on invalid content, `SIGHUP`
reloads keeping the last good release. `scripts/check-content.mjs <dir>`.

**Content** (`tech-katta/content/`): `site.json` (incl. `dashboard.sections`, `example`),
`examples/zotato.json`, `articles/index.json`, `articles/<section>/<slug>.json`, `lab.json`,
`README.md`.

**Deploy**: frontend via Vercel; `.github/workflows/frontend.yml` runs tests + build on PRs.
Backend + content via `.github/workflows/deploy-backend.yml` on `backend/**` or `content/**`: tests +
content validation → SSH to VPS (`/opt/tech-katta`, user `techkatta`, service `tech-katta-api` on
127.0.0.1:5000) → check out **exactly `github.sha`** (must be on main) → `npm ci` → copy `content/`
to `/var/lib/tech-katta/content/releases/<UTC>-<short sha>` → validate → atomic `current` symlink →
restart → live only when `/health` reports that release → prune to 10 newest (by name). **Any
failure after the checkout changes rolls back code + content automatically** (EXIT trap) and fails
the job. Public check requires the new release and `/v1/site`, `/v1/articles`, `/v1/lab`. Actions
pinned to SHAs. Manual rollback: see the root README (content-only vs code).
Secrets: `VPS_SSH_KEY` set; **`VPS_HOST`/`VPS_USER`/`VPS_FINGERPRINT` not set** — the workflow falls
back to hardcoded host/user until the owner adds them (§10).
DNS via Cloudflare. MongoDB Atlas (project `6ac298d2a4428fd93e7b3f75`, cluster `Cluster0`): db
`techkatta_history` holds the commit ledger; db `techkatta_app` holds accounts (once sign-in is on).

**Sign-in** (#141; `backend/src/auth/`): `google.js` verifies Google ID tokens itself (RS256 via
Google's JWKS with node:crypto; iss, aud = client ID, exp, `email_verified`; keys cached per
Cache-Control, unknown kid refreshes at most once a minute). `accounts.js`: collections `users`
(googleSub unique), `sessions` (only an HMAC-SHA256 of the token keyed with `SESSION_SECRET`; TTL index,
30 days), `lab` (designs, deleted tombstones, progress). `routes.js`: `GET /v1/auth/config`,
`POST /v1/auth/google`, `POST /v1/auth/signout`, `GET /v1/me` (`{user}` or `{user:null}`),
`POST /v1/auth/signout-all`, `DELETE /v1/me` (deletes everything), `GET/POST /v1/me/lab` (merge in, merged out). Cookie
`tk_session` HttpOnly; SameSite=Lax; Secure. Writes need `Origin: FRONTEND_ORIGIN` (403 otherwise),
credentialed CORS only for that origin, per-IP limits (sign-in 30/10 min, Lab 120/min), 2 MB bodies.
On only when all three settings exist (`authConfig`); `ACCOUNTS_DB` (not `MONGODB_DB`, see §1), `GOOGLE_JWKS_URL`, `COOKIE_SECURE=0`
are for tests/local. Deploy: "Prepare API settings" step base64-encodes + masks the secrets, the VPS
writes them to root-only `/etc/tech-katta/api.env` (only if all three are set), loaded by the systemd
drop-in `EnvironmentFile=-`. Frontend: `src/account.js` (state, Google Identity Services button,
sync on sign-in / Lab open / 3 s after changes), `src/lab/merge.js` shared with the API (newest
design wins, tombstones win over older copies, best stars kept), `AccountControl` in the dashboard
header (avatar menu: saved status, Privacy, Sign out, Delete my account), `#privacy` page
(`site.json` `account`, `privacy`). Gotcha fixed: the Lab used to re-stamp unchanged designs on
flush, which resurrected deletions from another device; it now skips unchanged saves.
UI (#149): `src/accountui.jsx` (`AccountControl`, `GoogleButton`, `KeepStars`) + `src/account.css`,
used by `main.jsx` (landing header), `lablite.jsx` (after a score) and `dashboard.jsx` (avatar only,
`button={false}`). A challenge's untouched starting design has id `ch-<challenge>` and `updated: 1`, so
copies made on two devices merge into one and any real edit wins (it used to duplicate).

---

## 7. System Design Lab

**Vision (owner):** users design a system on a Miro-like canvas (components in the left sidebar),
get **$200,000 virtual AWS credit**, run virtual traffic, see load on every component, then chaos-test
and get evaluated. Swiss colours; Lab tab in sidebar and top bar.

**Built and live:**
- Catalogue `content/lab.json` → `/v1/lab`: `budget` 200000, `retries` 1, region Mumbai
  (`ap-south-1`), notes (`priceNote`, `modelNote`, `crashNote`, `smallScreen`), components:
  - CDN (#134; CloudFront: `hitPct` default 95, max 99, answered at the edge; 20M req/s; never crashes;
    $0.009 per 10,000 requests; **live content** setting: the edge needs the origin for every new
    chunk, so origin failures reach every viewer; Clients → CDN → your edge)
  - Clients (`rps` 1–10,000,000 since #134; pattern `match` "IND vs PAK match night" added; default 1,000 = the rate at the busiest moment; **traffic patterns**
    `steady` / `meals` "Lunch and dinner rush" (full rate 8:30 pm, 0.75 at 1 pm, 0.05 at 4 am) /
    `sale` "Flash sale at 8 pm" (full rate 15 min, 0.2 otherwise); `[hour, multiplier]` points,
    linear, repeat daily on the Lab clock; day chart in the panel) — phase 2, #129
  - API Gateway ($3.50 per million requests, limit 10,000 rps, 10 ms; never crashes, throttles)
  - Server (EC2 t3.medium 300 rps $0.0448/h · m5.large 600 $0.101 · m5.xlarge 1,200 $0.202 ·
    c5.2xlarge 2,500 $0.34; count 1–50; 20 ms; **queries per request** default 2; crash >150 % for
    10 min → down 5; **autoscaling** (#129): `autoscale`, `count` = fewest, `maxCount` = most (default 10);
    target 60 % load, new instances after 4 min warm-up, scale-in after 15 min low; billed per running
    instance; run log "scaled out/in to N")
  - Load Balancer (ALB $0.0239/h + $0.008 per LCU-hour, 1 LCU ≈ 300 req/s; limit 100,000; 2 ms;
    never crashes) — phase 2
  - Queue (SQS $0.40 per million; async: users done when stored; workers pull at their capacity;
    backlog tracked over simulated time, run-log "filling up"/"cleared") — phase 2
  - Cache (ElastiCache cache.t3.medium 20,000 ops $0.068/h · m5.large 50,000 $0.156 · r5.large
    60,000 $0.216; `Server → Cache → Database`; settings hit % (default 80) and write % (default 10);
    database gets `w + (1−w)(1−h)` of queries; crash >150 % for 5 min → down 10) — phase 2.
    **Behaviour (#130):** comes back **empty** after a crash, hits climb to the set % over
    `warmupMinutes` 10 (a run starts warm); **when down** `onDown`: `database` (default, cache-aside
    fall-through) or `fail`; **writes** `writePolicy`: `through` (default) or `back` (acked by the
    cache, flushed at the DB's spare capacity, backlog "unflushed writes"; a crash loses the backlog +
    `flushSeconds` 5 of writes → "N writes lost", shown in the design panel)
  - Database (RDS db.t3.medium 800 qps $0.087/h · db.m5.large 2,500 $0.205 · db.m5.xlarge 5,000
    $0.41 · db.r5.2xlarge 12,000 $1.15; 5 ms; Multi-AZ ×2 price; crash >120 % for 5 min → Multi-AZ
    failover 2 min, single-AZ down 30)
  - example "Zotato order API": Clients 1,000 → API Gateway → Server 2 × m5.large (2 q/req) →
    db.m5.large Multi-AZ.
- Engine `frontend/src/lab/engine.js` (pure; `npm test`, 20 engine tests): topological flow; each served
  request calls one component of each kind it points at (servers send `queriesPerRequest` queries);
  same-kind targets share load evenly; served = min(offered, capacity); latency `base/(1−ρ)` (×20
  past capacity); crashed nodes serve nothing; retries solved as a fixed point (user success
  `1−(1−s)^(k+1)`); monthly cost (gateway billed on served requests), `burnPerHour = monthly/730`;
  problems (no Clients, loops, unconnected — not while something is crashed); `advance()` jumps from
  crash/recovery event to event; `newRun()`.
- UI `frontend/src/lab/Lab.jsx` + `lab.css`:
  - palette: **tap to add** at the nearest free spot; **drag with pointer events** (mouse, touch, pen;
    ghost under the pointer; drop where released over the canvas; elsewhere = nothing; keyboard
    Enter adds). HTML5 drag-and-drop is not used (Firefox/touch).
  - React Flow canvas: connection rules (Clients only send, Databases only receive, no duplicates or
    self-links); Delete removes; snap to grid; fit view; attribution kept (MIT).
  - settings panel per component; design panel: monthly cost, budget, region, availability, run time,
    **run log**, notes.
  - **credits drain while running** on a simulated clock: speeds 1 s = 1 minute (default) / 10 minutes
    / 1 hour / 1 day / 1 week (`tk-lab-speed`); credit shown in cents; burn per hour and month; at $0
    the run stops; Designs → ⧉ duplicates with fresh credit.
  - running state: animated arrows; load bar and %, latency, drops per component; amber ≥70 %, red
    >100 %; **CRASHED · back in N min** (dashed red) with grey arrows; status bar: simulated day/time,
    req/s (and "sent by K Clients"), % served, latency, +retries/s, availability, crashed count,
    busiest component.
  - designs in localStorage `tk-lab-v1` (`{version:1, current, designs:{id:{name,nodes,edges,
    credit:{spent,hours},updated}}}`), read only through `src/lab/store.js` `readStore()` (repairs or
    drops bad data, own-key lookups), autosave (id captured so switching designs never overwrites
    the wrong one).
  - dashboard sidebar folds to icons on the Lab only; laptop-first; below 900 px a note + stacked layout.

Challenges (#132; `lab.json` `levels` + `challenges`, `src/lab/challenges.js`): Too much for one
server, Lunch and dinner rush (beginner); The 8 pm flash sale, **Survive IND vs PAK** (#134: 8.75M
req/s peak, CDN fixed 99 % + live; 0★ no CDN, 2★ too few servers or autoscale from a few, 3★ ~36+
running before the toss), The menu everyone reads (intermediate); The cache restarts at dinner, Don't lose an order (advanced). Each: brief, hint,
starting design, traffic owned by the challenge (+ `fixed` settings), optional chaos (crash the
busiest cache at minute N via `crashNow()`), stars. "Score my design" plays the scenario at once
(<50 ms). Challenges menu (★ n/21), `#lab/<id>` links, score dialog with next challenge. A test pins
that every starting design scores 0 and a worked solution scores every star — keep it that way when
editing numbers.
Import (#133, `src/lab/importer.js`): Designs → Import… (text chains with aliases, `:label`, options;
line errors; auto layout; or a JSON file) and Export JSON (`{tk:"lab-design",version:1,design}`).
Tour (#133, `src/tour.jsx`, steps in `site.json` `tour`).

Arrows: click/tap selects; ✕ on the arrow or "Remove arrow" in the Arrow panel removes it; Delete
works too (custom edge type `arrow` in `Lab.jsx`).

**Pending (owner hasn't picked)** — refinement ideas offered: undo/redo and copy-paste; live req/s
labels on arrows; rename components; connection hints while dragging an arrow; credit-over-time chart;
"reset clock" without duplicating.

### Lab phases (the plan; scope set when phase 1 shipped, 2026-11-01)

| Phase | What it is | Status |
|---|---|---|
| 1 | Canvas, 4 components (Clients, API Gateway, Server, Database), steady-load simulator, $200k credit draining on a simulated clock, crash policy, retries, run log | ✅ Done (#121–#126) |
| 2 | **More components + time-based traffic** (below) | 🟡 In progress |
| 3 | **Chaos testing**, user-triggered: kill an instance, AZ outage, added latency, network partition | Not started |
| 4 | **Evaluator**: scores and feedback on a design, Zotato challenges with requirements to meet | Not started |
| 5 | **Accounts** (MongoDB): per-user design history and credit across devices | Not started |

**Phase 2 in detail**

| Part | Status |
|---|---|
| Load Balancer (ALB, per hour + per LCU) | ✅ Done (#128) |
| Cache (`Server → Cache → Database`; hit %, write %; only misses + writes reach the DB) | ✅ Done (#128) |
| Queue (SQS; async; workers pull at capacity; backlog grows/drains over simulated time) | ✅ Done (#128) |
| Time-based traffic: daily patterns on Clients (steady, lunch and dinner rush, 8 pm flash sale) | ✅ Done (#129) |
| Autoscaling: server groups add/remove instances with load (min/max, 4 min warm-up, 15 min scale-in) | ✅ Done (#129) |
| Cache behaviour: warm-up after restart, down → database/fail, write-through/write-back | ✅ Done (#130) |
| CDN (hit % at the edge, per-request price, live content) | ✅ Done (#134) |
| Read replicas (database reads spread over replicas, writes to the primary) | ✅ Done (#226): 0–5 replicas + writes %; capacity qps/(w+(1−w)/(1+n)); each replica billed like the primary; primary down → replicas answer reads, writes fail; no replication lag |

Suggested by the external review, **not yet the owner's decision** (offer, don't assume): read/write
mix set on Clients; p95/p99 latency; data-transfer and storage costs.

---

## 8. Testing

`tools/e2e/` in this repo holds the Playwright scripts used for every merge — 19 of them now (site
sweep, read aloud, recorded audio, mobile figures, API down, every Lab area, landing desktop + phone,
Learn/challenges, tour/import, and the QA regressions `qa-scoring`, `qa-saving`, `qa-a11y`) — see its
README. Run the whole set against production after each merge. Engine tests: `cd frontend && npm
test` (53). Backend + content: `cd backend && npm test` (29).

**In-depth QA run (11-02, owner asked for "another agent … in depth"):** an independent agent tested
code and production (40 findings: 7 High, 9 Medium, 24 Low). Fixed in #135 (scoring: `requires`
paths, dead-end parts fail, queue backlog counts, time windows on goals, goal ticks, locked fixed
settings, Run at the challenge hour with chaos), #136 (saving: tabs merge, credit saved while
running and on leave, embedded Lab never changes `current`, blocked storage, error boundary, import
caps 200 components / 20,000 chars / 1 MB), #137 (phones get the three-control IND vs PAK on the
landing page, `src/lablite.jsx`), #138 (keyboard connections, Back restores scroll, tour/menu focus,
favicon/robots/sitemap/security headers). **Left for the owner:** crore/lakh in copy vs en-US numbers
in the Lab (L10); latency counts one database round trip per request (L11); iPad portrait gets the
stacked Lab (L12); no copy without the API, by design (L14). Not tested by anyone: real phones, iOS
Safari, Firefox, screen readers, load.

---

## 9. Environment facts and gotchas (cloud session)

- MongoDB Atlas: the owner added the MongoDB plugin on 11-04 and `remote-atlas-connect` now works
  (it was blocked before). Ledger fully reconciled against main on 11-04 (see 11-MONGODB-COMMIT-LEDGER.md).
  The cloud clone is **shallow**: run `git fetch --unshallow origin` before listing history.
- **Blocked by the safety classifier**: force-push; `rm -rf` inside `bash -c`; creating GitHub repos via the app
  (owner creates them, then `add_repo`). Kokoro install was allowed once the owner chose it.
- `pkill -f "<pattern>"` can kill its own shell (exit 144) when the same command line contains the
  pattern text — use a bracket (`vite prev[i]ew`, `src/server[.]js`) and run pkill as a separate
  command.
- Building without `VITE_API_BASE` uses the **production** API — test new content against a local API.
- CodeRabbit: about one review an hour; auto-review is skipped (< 10 stars), so trigger with a comment.
  Copilot review requests do nothing (no paid plan). Vercel previews need login.
- The VPS is not reachable over SSH from the session; only the GitHub Action deploys.
- `api.github.com` works unauthenticated for these public repos, but not for other repos (e.g.
  `actions/checkout`): resolve action tags with `git ls-remote --tags https://github.com/<repo>.git`.
- `status.katta.cc` returned 502 from the session (11-01); the status project itself works at
  `tech-katta-status.vercel.app` — check the custom domain is assigned in Vercel.
- Deploy script changes: rehearse locally with stubbed `sudo`/`systemctl`/`curl` and a throwaway git
  origin, under both `dash` and `bash`.
- Firefox won't start HTML5 drag from `<button>`; touch screens don't do HTML5 drag.
- `cp -a` keeps the source folder's mtime: never prune "newest" by mtime after copying.
- Long `sleep` chains are blocked; use until-loops or background commands.
- GitHub secrets and variables can't be listed from the session (the proxy refuses `actions/secrets`,
  `actions/variables`, `environments`). Which secrets are set shows in the "Deploy Tech Katta Backend" log
  (`INPUT_HOST`, `INPUT_FINGERPRINT`, the `MONGODB_URI check` line); read it with GitHub MCP `get_job_logs`.
- Vercel deployments can be read with the Vercel MCP `list_deployments` (slug `yashbhoomkars-projects`,
  app `tech-katta`): a gap after a merge on `main` means the daily limit was hit.
- `remote-atlas-connect` can be refused by the session's safety check (11-07, twice). Then list the SHAs
  under "Ledger pending" in `agents/TODO.md` for the worker; never claim the ledger was checked.
- A local API reloads **content** on `SIGHUP`, not code: after changing `validate.js` (e.g. a new figure id), restart it, or the reload fails with "unknown figure" and keeps the old content.

---

## 10. Open items (Pending / backlog)

1. **Lab**: phase 2 is complete (§7 "Lab phases"): traffic patterns and autoscaling (#129), cache
   behaviour (#130), CDN (#134), read replicas (#226). Phase-1 refinement ideas (§7) are still offered, not picked.
2. **Before any monetisation** (the planned ₹99 course): owner-side clearance is pending — see the
   private note (§11). Don't build payments, pricing pages or paid accounts until the owner confirms.
   Both public repos are public; this repo's history still contains a removed paid reference file
   (commit `a2affb8`) unless the owner makes it private.
3. **Per-article URLs** for link previews (hash routes share one card) — offered, not decided.
4. **Figure text and images into content** (FIG labels → JSON; `og.png` and future media →
   `content/media/` served by the API; delete `kafka-architecture.svg`) — offered, not decided.
5. **Narration**: re-record (`tools/tts`) whenever the API article changes; record new articles.
10. **After the MoM and the QA run**: all 10 items shipped (#131–#134) and the QA findings fixed
    (#135–#138, see §8). Follow-ups worth offering: more
    challenges; more articles; accounts (phase 5) for progress across devices; testing on real
    phones / iOS Safari; the four QA items left for the owner (§8).
6. ~~MongoDB ledger for PRs #107–#140~~ done 11-04: all 504 commits on main are in the ledger (141 inserted). Record each new PR's SHAs after merging.
   11-06: PRs #176–#195 had been missed (a note wrongly said the ledger filled itself on merge); 51 records added.
7. CodeRabbit never reviewed PRs #122–#126 or #128 (rate-limited) — request a review on a later PR
   touching `frontend/src/lab/` (#127 was reviewed; 5 findings fixed).
8. **Owner action**: add GitHub secrets `VPS_HOST`, `VPS_USER` and `VPS_FINGERPRINT`
   (`ssh-keyscan -t ed25519 <host> | ssh-keygen -lf -` gives the SHA256 fingerprint); then delete the
   hardcoded fallbacks in `deploy-backend.yml`. The IP is already in git history and old logs.
9. ₹99 course questions unanswered (what it buys, free vs paid, payment gateway, refunds/GST).
11. ~~Owner action to switch sign-in on~~: done 11-04 (see §1). Left over:
    - the owner's own sign-in test;
    - resetting the Google client secret;
    - the Atlas `0.0.0.0/0` entry;
    - a contact address on the privacy page;
    - optionally moving `GOOGLE_CLIENT_ID` out of secrets (it is public) and generating
      `SESSION_SECRET` on the VPS, so only `MONGODB_URI` stays a secret.

---

## 11. Private notes

`yashbhoomkar/tech-katta-private` (private): `references/` (paid reference notes, guidance only) and
`notes/owner-context.md` (owner-side context that must not be public, including the compliance
background for item 10.2). Attach the repo with `add_repo` and read it when work touches
monetisation, publishing policy or references.

---

## 12. PR history (tech-katta)

| PR | What |
|---|---|
| #225 | Workspace results panel: at most 42% of the canvas, folds to its verdict line |
| #226 | Lab: read replicas on the database (finishes Lab phase 2) |
| #227 | Problems: parts with a job (27 roles, `role` check, a "general parts" wrong design per problem) and key decisions (67); new score weights |
| #224 | Review fixes (alternative API methods, two test wordings), Problems submitted in the owner's analytics, Pick one, Solved badge |
| #223 | Submit judged again on the server; `submissions` collection; acceptance rates; "cheaper than N%"; privacy section |
| #222 | Landing copy for judged problems; `tools/practice/` |
| #221 | The judge: test suites for all 22 questions, Run/Submit, graded answers, hints, submissions, reset/timer; LB health checks |
| #220 | Every Interview Question in a LeetCode-style workspace (Description / Worked answer + Lab canvas, own design `q-<slug>`); question tables on Interview Questions and Problems |
| #219 | Articles: sticky "On this page" column beside the article from 1240 px; `agents/TODO.md` ledger pending for #216–#218 |
| #218 | Q22 Design menu search; figures search-flow, inverted (frontend waits for Vercel) |
| #217 | To-do list: ledger and handover checked through #215 |
| #216 | Q21 Design video streaming; figures video-pipe, abr (frontend waits for Vercel) |
| #215 | Landing: hero "Start practising" opens Problems; Problems in the landing nav (`site.json`) |
| #214 | Q20 Design rider assignment for food delivery; figures dispatch, offer-states |
| #213 | Q19 Design a shared document editor; figures doc-flow, transform |
| #212 | Q18 Design a distributed key-value store; figures ring, quorum |
| #211 | Q17 Design ad click counting; figures click-flow, windows |
| #210 | Q16 Design a live leaderboard; figures lb-flow, lb-rank |
| #209 | Q15 Design a web crawler; figures crawl-flow, polite |
| #208 | Q14 Design a job scheduler; figures sched-flow, lease |
| #207 | Q13 Design a payment system; figures pay-flow, pay-states (`SBox` gains a dashed red "down" style) |
| #206 | Q12 Design search autocomplete; figures suggest-flow, prefix-map |
| #205 | Q11 Design a notification service; figures notify-flow, lanes |
| #204 | Concept 07: transactions across services (Agreeing); figures saga, outbox |
| #203 | Concept 06: consensus and leader election (Agreeing); figures quorum-split, election |
| #202 | Landing page "What's inside" with live counts (`/v1/site` `counts`); hero reworded; no daily cap on cycles |
| #201 | Q10 Design a chat app; figures chat-flow, chat-sync |
| #200 | Q09 Design a coding judge; figures judge-flow, sandbox; owner times in IST |
| #199 | Q08 Design dating app swipes; figures swipe-flow, pair-row; rule: don't wait for Vercel |
| #198 | Problems: each question's Lab challenge (`lab` in `/v1/articles`), "Next problem" at the end of each question |
| #197 | Problems page: every question and Lab challenge with progress and a "Not done yet" filter |
| #196 | To-do list: ledger and handover caught up; "ledger fills itself" corrected |
| #195 | To-do list: per-question Lab challenges settled (Q03/Q04/Q07 would repeat; fair Q05 waiting room needs the engine to forbid splitting the database); Q08 next |
| #194 | Lab: `monday-sync` (Q02), the first queue challenge; "Monday 10 am" traffic pattern |
| #193 | Landing page focus outline on links and buttons (merged; waits for Vercel to deploy) |
| #192 | To-do list: owner-approved plan and leaner cycles (re-plan every 5th cycle, one reviewer, push once, 8 cycles a day) |
| #191 | Vercel Web Analytics on landing and dashboard (owner's request; skipped for GPC/DNT/automated browsers; privacy page updated) |
| #190 | To-do list: Vercel deployment limit hit (100/day on Hobby), chain stopped |
| #189 | Q07 Design a news feed; figures feed-fanout, feed-hybrid |
| #188 | Practice mode v2: summary lists the checks not ticked |
| #187 | Q06 Design photo sharing |
| #186 | Library cards: footers line up at every width (container query) |
| #185 | Q05 Design match ticket booking (waiting room, seat holds) |
| #184 | Practice mode v1: answer an Interview Question against the 45-minute clock |
| #183 | Concept 05: timeouts, retries and circuit breakers |
| #182 | Library cards: meta and footer text up to 11px |
| #181 | Q04 Design 10-minute grocery delivery |
| #180 | Lab challenge `sms-link` (URL shortener) |
| #179 | Dashboard: no brief overflow crossing the 900 px breakpoint |
| #178 | Unknown figure ids draw nothing (no wrong figure while Vercel lags the API) |
| #177 | Q03 Design restaurants near me |
| #176 | To-do list: business plan for the paid launch (₹99/month, ₹249/year) |
| #175 | Skip-to-content link and visible keyboard focus |
| #174 | Worker cycle 3: Q02 Design file storage and sync (Zotato Drive); figures sync-flow, file-chunks |
| #173 | Worker cycle 2: Lab Import dialog keyboard fixes (focus trap, Escape, focus back on close) |
| #172 | Worker cycle 1: URL shortener fixes (aliases vs counter codes; no cached 404s from replicas) |
| #171 | Agents' to-do list moved into the site repo (`agents/TODO.md`); back-to-back cycles |
| #170 | Interview Questions section: How to answer (Q00) and URL shortener (Q01); figs/questions.jsx; section groups |
| #102–#106 | Landing rebuild: animated figures, tap-to-zoom, cards, Numbers section (earlier days) |
| #107–#108 | Site made private, then reverted at the owner's request |
| #109 | Dashboard page (from the owner's Stitch mock) |
| #110 | `.coderabbit.yaml` |
| #111 | First article (API types); GitHub link removed; build-date footer |
| #112 | Read aloud, animated FIG. 01, example system, mobile-first figures, Share, OG tags |
| #113 | Read-aloud player scrolls with the page |
| #114 | Kokoro tooling + "Designing … REST API" section (merged with draft audio) |
| #115 | Article restructured (short + depth on demand); draft audio removed |
| #116 | Manifest fetched only for `audio: true` articles |
| #117 | Zotato renaming; FIG. 02–04 |
| #118–#119 | Content served by the backend; frontend loads it |
| #120 | Content stored on the VPS as JSON releases |
| #121–#123 | System Design Lab phase 1 (catalogue/API, Lab view, tab) |
| #124 | Lab credits drain over simulated time; no stacking of new components |
| #125 | Lab palette drag with pointer events (mouse, touch, pen) |
| #126 | Lab crash policy, queries per request, retries, run log, availability |
| #127 | Review fixes: exact-SHA deploy + automatic rollback, frontend CI + lockfile, deep content validation, safe Lab storage, landing links, status checks, legacy removal, README |
| #128 | Lab phase 2: Load Balancer, Cache, Queue |
| #129 | Lab phase 2: traffic through the day (patterns) and server autoscaling; null-prototype run maps |
| #130 | Lab: cache warm-up, behaviour when down, write-back; remove arrows |
| #132 | Learn tab with levels, 6 Lab challenges with stars, real-life analogies; narration re-recorded |
| #133 | Website tour; import your own architecture (text or JSON) and export |
| #135 | QA fixes — scoring: required paths, dead ends, time windows, goal ticks, locked settings |
| #136 | QA fixes — saving: tabs merge, credit saved while running, landing Lab leaves your design alone, import caps |
| #137 | QA fixes — landing on phones: IND vs PAK with three controls (`lablite.jsx`) |
| #138 | QA fixes — keyboard connections, Back keeps your place, tour/menu focus, site basics |
| #139 | Learn tab (Beginner / Intermediate / Advanced) removed; dashboard opened on Concepts |
| #140 | Dashboard start page: no tab selected, the Library cards (moved from the landing page) |
| #169 | Chaos-test fixes: MongoDB socket timeouts, Google key timeout, fail-fast events |
| #168 | Frontend hardening: CSP, HSTS, COOP; stale-chunk reload; account call timeouts |
| #167 | Backend hardening: timeouts, body limits, limiter, shutdown, restart policy, JSON CSP |
| #166 | Content review: three claims and one Quick Notes figure fixed |
| #165 | CONCEPT // 04 CAP and PACELC in practice (figures `cap-split`, `pacelc`) |
| #164 | CONCEPT // 03 Consistency models (figures `consistency-timeline`, `double-accept`) |
| #163 | Concepts subsections; CONCEPT // 02 Replication (figures `repl-sync`, `repl-failover`) |
| #162 | Components article COMPONENT // 09 Queues and event streams (figures `queue-vs-stream`, `consumer-lag`) |
| #161 | Components article COMPONENT // 08 Object storage (figures `obj-upload`, `obj-tiers`) |
| #160 | Components article COMPONENT // 07 Sharding and partitioning (figures `shard-key`, `hot-shard`) |
| #159 | Dashboard tabs locked while signed out; admin = owner's verified email (hash in code) |
| #158 | Analytics dashboard (`/analytics/`, admin-only summary + Meta CSV API) for analytics.katta.cc |
| #157 | Sign-in requires the Terms box (API too); Meta ads only from the account menu switch |
| #156 | Backend hardening (lab rev, sign-in race, consent log, delete order, events storage cap, startup indexes); start page cards without panel |
| #155 | Terms and conditions page; box reads "I agree to the Terms and conditions" |
| #154 | Landing Lab locked until sign-in; opt-in for Meta ads; first/last name, country; Meta audience export |
| #153 | Analytics: no events from automated browsers |
| #152 | Usage events for analysis (`/v1/events`, `techkatta_app.events`, 13 months) |
| #151 | Accounts db from `ACCOUNTS_DB` (default `techkatta_app`); re-sign-in ends old session; sign out on all devices; sessions renew (30 d, cap 90 d) |
| #150 | Deploy log: yes/no shape check of `MONGODB_URI` |
| #149 | Sign in with Google on the landing page header + under the IND vs PAK score; dashboard header avatar only; one `ch-<challenge>` design across devices |
| #148 | `/health` `accounts`: `ok` / `checking` / MongoDB error kind (found `AtlasError`: the API database user is missing) |
| #147 | Components article COMPONENT // 06 Databases (figures `db-index`, `db-replicas`; Lab card to `#lab`, since the Lab has no replicas yet) |
| #146 | Components article COMPONENT // 05 Caches (figures `cache-aside`, `cache-warm`) |
| #145 | Components article COMPONENT // 04 App servers and autoscaling (figures `scale-out`, `autoscale`) |
| #144 | Components article COMPONENT // 03 API gateways and rate limiting (figures `gw-front`, `rate-limit`; the rate-limit figure computes its marks with the three algorithms) |
| #143 | Components article COMPONENT // 02 CDNs (figures `cdn-edge`, `cdn-ttl`) |
| #142 | Components subsections, `lab` block, figures moved to `src/figs/`; article COMPONENT // 01 Load balancers |
| #141 | Sign in with Google, accounts and Lab sync in MongoDB (off until the three secrets exist); privacy page |
| #134 | Landing embeds the real Lab (IND vs PAK challenge); Did you know → dashboard tab; Dashboard button; CDN component |
| #131 | Landing: IND vs PAK challenge, "did you know" fact, less content (Quick Notes/Numbers off); Kokoro narration for the API article |

Context repo PRs: #35 removed the paid reference file from `main`; #36–#38 handover and state
updates. Private repo: `references/hello-interview-api-design.txt`, `notes/owner-context.md`.

---

## 13. Session timeline (what happened, including mistakes to avoid)

- **10-30/31**: landing rebuilt (PRs #102–#106). Owner asked whether the project could launch given
  their employment; the session read the owner's employment documents and advised disclosure and
  written approval before monetising (details only in the private note). Site briefly made private,
  then reverted.
- **10-31**: dashboard; first article; GitHub link removed; read aloud; figures; Zotato; mobile-first;
  Kokoro narration built, then held back until content is final — the owner merged PR #114 before the
  audio-removal commit landed, so draft audio was briefly live (removed in #115). Article restructured
  short. Content moved to the backend (two-step ship), then to the VPS disk as releases (a rehearsal
  caught that pruning by mtime would delete the newest release).
- **11-01**: Lab phase 1 in three PRs; owner feedback → credits drain in simulated time, free-spot
  placement (several Clients had stacked on one spot), pointer-event drag, crash policy.
- **11-01 evening**: owner pasted an external review; every claim was checked against the code
  (all engineering findings real; its "backend missing" remark was a mid-change snapshot). Fixed in
  #127 (CodeRabbit's 5 findings fixed before merge) and #128. The first real run of the new deploy
  succeeded. Found that the `VPS_HOST`/`VPS_USER` secrets were never set (logs print the IP).
- Mistakes to avoid: replying on a PR thread with a commit SHA before the commit existed (post a
  correction if it happens); typing SHAs from memory; force-push attempts; pkill killing its own
  shell; testing new content against the production API by forgetting `VITE_API_BASE`.

- **11-05/11-06**: worker cycles #175–#195 (Interview Questions Q03–Q07, Practice mode, Concept 05,
  Lab `sms-link` and `monday-sync`). Vercel's daily deployment limit stopped deploys twice (#189 and
  #193). status.katta.cc fixed by adding its missing DNS record. Owner approved leaner cycles (#192).
- **11-06 afternoon (IST)**: Problems page and follow-ups (#197–#198), Q08–Q10 (#199–#201), landing
  "What's inside" (#202), Concept 06 consensus (#203). Each content PR had a reviewer agent; each review
  found real holes (a resent swipe making a second match; tests leaking into the judge's sandbox;
  duplicate chat sequence numbers; an overstated election rule), all fixed before merging.
- **11-06 evening (IST)**: Concept 07 transactions across services (#204) and Q11–Q20 (#205–#214), one
  per cycle, merged while Vercel was rate-limited (text live via the API); the limit cleared and
  #199–#214 deployed at 17:26 IST, then #215 pointed the landing page at Problems.
  Reviews again caught real errors (UPI retry needing a second approval, schedulers
  missing expired leases, late clicks needing rewritten rows, tie-breaks that lose writes).
- **11-06 late evening (IST)**: Q21 video streaming (#216) and Q22 menu search (#218); Vercel hit its daily
  limit again after the #218 preview, so both wait for a frontend deploy (text live via the API). The
  worker's PRs only added Done-log lines, not "Context repo pending" rows; a human-led session (11-07
  01:15 IST) brought the docs up but could not reach Atlas, so the ledger check for #216–#218 is pending.
- Mistakes to avoid: assuming the MongoDB ledger fills itself on merge (it didn't, 20 PRs were
  missed); building a Lab challenge before checking that the simulator rewards the article's lesson
  (the Q05 waiting room lost to two big databases); pushing many small PRs in a day (each push costs
  two Vercel deployments).

---

## 14. Reading order

1. This file. 2. `12-OPERATING-RULES.md`. 3. `13-CURRENT-STATE.md` (last five sections).
4. `tech-katta/content/README.md`. 5. `tools/e2e/README.md`. 6. The code on `main`.
Older numbered files (01–09, 14–16) are partly **Historical**; trust the code and this file.
