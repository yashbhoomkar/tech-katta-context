# 17 — Session Handover (read this first)

Last updated **2026-11-01 (night)** by the session that shipped Lab traffic patterns and autoscaling (PR #129).
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

---

## 1. Where things stand (Known, 2026-11-01)

- **tech-katta `main` = `e3e98ce`** (PR #129). Production: `https://tech.katta.cc` (Vercel), API
  `https://tech-api.katta.cc` (VPS behind Cloudflare). Content release on the VPS:
  `20261101T164003Z-e3e98ce` (release names end with the deployed commit).
- The site:
  1. **Landing** `/` — hero "System design, explained." with the animated Kafka figure (FIG. 01),
     buttons Dashboard → `/dashboard/` and Quick Notes; Technical Library cards (links open
     `/dashboard/#<section>`; quick notes open `/dashboard/#quick-notes`) (Concepts / Core
     Components / Interview Questions, each with a small animated diagram); Quick Notes (4 notes:
     Kafka DRAFT, Raft / Redis Cluster / Rate limiting PLANNED); Numbers Worth Knowing (log-scale
     latency chart, estimation shortcuts, worked URL-shortener estimate); footer (no GitHub link,
     "Last updated: <build date>").
  2. **Dashboard** `/dashboard/` — sidebar + top tabs: **Concepts · Components · Interview Questions ·
     Quick Notes · Lab**. One published article: Concepts › "APIs: the main types, and which one to
     use where" (`/dashboard/#concepts/api-types`). Components and Interview Questions are empty
     ("Nothing published here yet").
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
     tests (27). **`frontend/package-lock.json` is committed** (changed 11-01; keep it).
   - backend: `cd backend && npm test` (23 tests incl. content validation);
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
| 11-01 | External repo review → "Do everything to fix everything": all engineering findings fixed (#127), Lab phase 2 started with Load Balancer, Cache, Queue (#128) |

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
  `audio: true` — none is recorded yet (owner: only when final).
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

**Backend** (`tech-katta/backend`, Node 22, no dependencies): `/health` (incl. `content.release`),
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
DNS via Cloudflare. MongoDB Atlas (project `6ac298d2a4428fd93e7b3f75`, cluster `Cluster0`, db
`techkatta_history`) holds the commit ledger only.

---

## 7. System Design Lab

**Vision (owner):** users design a system on a Miro-like canvas (components in the left sidebar),
get **$200,000 virtual AWS credit**, run virtual traffic, see load on every component, then chaos-test
and get evaluated. Swiss colours; Lab tab in sidebar and top bar.

**Built and live:**
- Catalogue `content/lab.json` → `/v1/lab`: `budget` 200000, `retries` 1, region Mumbai
  (`ap-south-1`), notes (`priceNote`, `modelNote`, `crashNote`, `smallScreen`), components:
  - Clients (`rps` 1–200,000, default 1,000 = the rate at the busiest moment; **traffic patterns**
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
    database gets `w + (1−w)(1−h)` of queries; crash >150 % for 5 min → down 10) — phase 2
  - Database (RDS db.t3.medium 800 qps $0.087/h · db.m5.large 2,500 $0.205 · db.m5.xlarge 5,000
    $0.41 · db.r5.2xlarge 12,000 $1.15; 5 ms; Multi-AZ ×2 price; crash >120 % for 5 min → Multi-AZ
    failover 2 min, single-AZ down 30)
  - example "Zotato order API": Clients 1,000 → API Gateway → Server 2 × m5.large (2 q/req) →
    db.m5.large Multi-AZ.
- Engine `frontend/src/lab/engine.js` (pure; `npm test`, 15 engine tests): topological flow; each served
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
| CDN (offloads static/cacheable requests before the edge) | Not started |
| Read replicas (database reads spread over replicas, writes to the primary) | Not started |

Suggested by the external review, **not yet the owner's decision** (offer, don't assume): read/write
mix set on Clients; p95/p99 latency; data-transfer and storage costs.

---

## 8. Testing

`tools/e2e/` in this repo holds the Playwright scripts used for every merge (site sweep, read aloud,
mobile figures, API-down handling, Lab basics, drag incl. real touch, credits, crash policy, corrupted
storage + landing links, phase 2 components) — see its
README. Engine tests: `cd frontend && npm test`. Backend + content: `cd backend && npm test`.

---

## 9. Environment facts and gotchas (cloud session)

- **Blocked by the safety classifier**: MongoDB Atlas `remote-atlas-connect` (ledger not updated —
  PRs #107–#126 missing); force-push; `rm -rf` inside `bash -c`; creating GitHub repos via the app
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

---

## 10. Open items (Pending / backlog)

1. **Lab**: phase 2 is in progress (§7 "Lab phases"): traffic patterns and autoscaling done (#129);
   next CDN, then read replicas. Phase-1 refinement ideas (§7) are still offered, not picked.
2. **Before any monetisation** (the planned ₹99 course): owner-side clearance is pending — see the
   private note (§11). Don't build payments, pricing pages or paid accounts until the owner confirms.
   Both public repos are public; this repo's history still contains a removed paid reference file
   (commit `a2affb8`) unless the owner makes it private.
3. **Per-article URLs** for link previews (hash routes share one card) — offered, not decided.
4. **Figure text and images into content** (FIG labels → JSON; `og.png` and future media →
   `content/media/` served by the API; delete `kafka-architecture.svg`) — offered, not decided.
5. **Recorded narration** for the API article once final.
6. **MongoDB ledger** for PRs #107–#129.
7. CodeRabbit never reviewed PRs #122–#126 or #128 (rate-limited) — request a review on a later PR
   touching `frontend/src/lab/` (#127 was reviewed; 5 findings fixed).
8. **Owner action**: add GitHub secrets `VPS_HOST`, `VPS_USER` and `VPS_FINGERPRINT`
   (`ssh-keyscan -t ed25519 <host> | ssh-keygen -lf -` gives the SHA256 fingerprint); then delete the
   hardcoded fallbacks in `deploy-backend.yml`. The IP is already in git history and old logs.
9. ₹99 course questions unanswered (what it buys, free vs paid, payment gateway, refunds/GST).

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

---

## 14. Reading order

1. This file. 2. `12-OPERATING-RULES.md`. 3. `13-CURRENT-STATE.md` (last five sections).
4. `tech-katta/content/README.md`. 5. `tools/e2e/README.md`. 6. The code on `main`.
Older numbered files (01–09, 14–16) are partly **Historical**; trust the code and this file.
