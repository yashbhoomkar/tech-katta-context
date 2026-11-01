# 17 — Session Handover (read this first)

Last updated **2026-11-01** by the Claude Code session that ran from 2026-10-30 to 2026-11-01.
A new session should read this whole file before doing anything, then `12-OPERATING-RULES.md`,
then the newest sections at the bottom of `13-CURRENT-STATE.md`. **Where any older file disagrees
with this one or with the code on `main`, this file and the code win.** This repository is
**public**: never write personal, employer or credential information here.

Labels: **Decided** = the owner's call, do not re-ask · **Known** = verified · **Pending** = waiting
on the owner.

---

## 1. Where things stand (Known, 2026-11-01)

- **tech-katta `main` = `0bdbaed`** (PR #125). Production: `https://tech.katta.cc` (Vercel),
  API `https://tech-api.katta.cc` (VPS, behind Cloudflare). Both verified after the last merge.
- The site has three parts:
  1. **Landing page** `/` — hero with the animated Kafka figure, Technical Library cards, Quick Notes,
     Numbers Worth Knowing. Copy comes from the API.
  2. **Dashboard** `/dashboard/` — sidebar + top tabs: Concepts · Components · Interview Questions ·
     Quick Notes · **Lab**. One published article: Concepts › "APIs: the main types, and which one to
     use where" at `/dashboard/#concepts/api-types`.
  3. **System Design Lab** `/dashboard/#lab` — the site's main differentiator (§6).
- **All content** (copy, articles, Lab catalogue) is JSON in `tech-katta/content/`, served by the
  API and stored on the VPS disk as validated releases (§5). The frontend hardcodes no content.
- Last content release on the VPS: `20261101T150245Z-54bab80` (`/health` shows it).

---

## 2. The owner and how to work with them

- Owner: Yash Bhoomkar (GitHub `yashbhoomkar`), builds Tech Katta alone. Writes short task lists
  ("Tasks 1. … 2. …") and expects the work done end to end, deployed, and reported. Follows up with
  short corrections ("What happened?", "Think clearly"). Answer the question directly, then act.
- **Standing instructions (Decided):**
  1. **Never ask for permission — the answer is always "allow".** Still ask about genuine product or
     business decisions you cannot reasonably decide (and say what you would choose).
  2. **Every code change goes through a PR**: open PR → request reviews → CodeQL green → merge →
     verify production → update this repo → report. Details in §3.
  3. **Always request code review**: comment `@coderabbitai review` and call `request_copilot_review`.
     **Do not wait for CodeRabbit when it is rate-limited** (owner: "Don't wait for CodeRabbit, merge
     and deploy now"); merge on CodeQL, say so in the report. When CodeRabbit does review, fix every
     valid finding, reply on each thread, then merge.
  4. **Keep this repository current** after every change (§3 step 9).
  5. Copy must read as written by a person, plain and specific — never AI-sounding. Never copy text
     from reference sites (guidance only).
- The owner tests on the live site and reports observations; reproduce each one before fixing it,
  and say what the root cause was (e.g. "the maths was right, the boxes were stacked").

---

## 3. Workflow (follow exactly)

Repos and branches: `yashbhoomkar/tech-katta` (site), `yashbhoomkar/tech-katta-context` (this repo),
`yashbhoomkar/tech-katta-private` (private reference notes). The session's working branch in both
public repos was `ccr-8814343d-wtj931`; a new session will be told its own branch — use that.

1. **Sync**: `git fetch origin main && git checkout -B <branch> origin/main`. After a merge, if the
   remote branch still points at merged history, fast-forward: `git merge --ff-only origin/main` and
   push. **Never force-push** (blocked by the session's safety classifier and not needed).
2. **Edit.** Frontend code style is terse, minified-looking JSX and one-line CSS rules; match it.
3. **Build/test**:
   - frontend: `cd frontend && npm install --no-audit --no-fund --silent && npm run build`;
     `npm test` runs the Lab engine tests. Delete `frontend/package-lock.json` before committing
     (intentionally untracked).
   - backend: `cd backend && npm test` (18 tests incl. content validation);
     `node scripts/check-content.mjs ../content`.
4. **Verify in headless Chromium** (Playwright is preinstalled: `require('playwright')`):
   `npx vite preview --port <NEW PORT> --strictPort` (old preview servers serve stale files; Chromium
   refuses some ports, e.g. 5061). Check desktop 1440×900 and an iPhone/iPad device profile; run the
   **overflow sweep 320→1440 px** (`scrollWidth > innerWidth` must be false); check console errors;
   freeze animations (`svg.pauseAnimations(); svg.setCurrentTime(t)`); reduced motion
   (`newPage({reducedMotion:'reduce'})`). To test against a local API:
   `PORT=5151 CONTENT_DIR=<dir> node backend/src/server.js` and build with
   `VITE_API_BASE=http://127.0.0.1:5151 npm run build`.
5. **Commit** with a descriptive message ending with the attribution lines the harness gives.
   Push: `git push -u origin <branch>`.
6. **PR** via GitHub MCP (`create_pull_request`, base `main`), body = Summary + Test plan checkboxes +
   the Claude Code footer. Request reviews (step 2.3). Poll check-runs with
   `curl https://api.github.com/repos/yashbhoomkar/tech-katta/commits/<sha>/check-runs` (repo is
   public); "Analyze JavaScript and TypeScript" = CodeQL; "CodeRabbit … Review rate limited" = don't
   wait. Never poll with `sleep N` in a loop longer than needed; use until-loops.
7. **Merge** (`merge_method: merge`, `expectedHeadSha` = the full 40-char SHA from `git rev-parse`).
8. **Verify production**: frontend — poll `https://tech.katta.cc/...` until the new bundle contains a
   string unique to the change (Vercel takes ~20–60 s). Backend/content — the "Deploy Tech Katta
   Backend" workflow must succeed and `/health` must show the new release; then rerun the browser
   checks against production.
9. **Update this repo**: append a dated section to `13-CURRENT-STATE.md`, a line to
   `10-GIT-HISTORY.md`, rules to `12-OPERATING-RULES.md` when the owner decides something, and this
   handover when the picture changes. Merge to `main` of this repo via PR (a new session reads `main`).
10. **Report** to the owner: what changed, what was verified (with numbers), what was not, and what is
    pending.

**Ship order when the frontend depends on the API:** backend PR → deploy → verify live → frontend PR
→ content PR that switches the feature on (e.g. the Lab tab). Never let a merge show a broken page.

---

## 4. Decisions in force (Decided — do not re-ask)

**Site & design**
- Swiss publishing style everywhere: white, surface `#f5f7fa`, hairlines `#d9dee7`, cobalt `#2855d9`
  (accent only), graphite `#1c2733`, muted `#586575`; Inter + IBM Plex Mono; no heavy shadows.
  Consistency matters to the owner (e.g. the example-system heading is all cobalt).
- **Mobile first**: ~75 % of visitors will come from Instagram/LinkedIn on phones. Every page must
  work at 320 px with no sideways scroll; figures fit and have "Tap to view full screen"; tables become
  cards; touch targets ≥ 40 px; OG/Twitter tags + `/og.png`. **Exception: the Lab is laptop-first**
  (phones get a note and a stacked layout).
- **Never show a GitHub link** on the site. Footer "Last updated" = build date.

**Articles**
- Short, structured main read with depth on demand: "In 30 seconds" box, cards (what / use it for /
  avoid it for / In Zotato), one-line lists; longer material in collapsed "How it works…" and
  "Go deeper" sections. Show both read times.
- **Example system: Zotato**, a made-up food delivery app (customer, restaurant and rider apps;
  Orders, Payments, Dispatch, Notifications, Invoices; payment provider; restaurants' billing
  systems). Each article says *it* uses Zotato. The owner chose the name knowing it resembles Zomato.
- **Every figure is animated** where possible (SMIL packets, static under reduced motion), registered
  in `FIGS` in `frontend/src/dashboard.jsx`; all elements inside the 640-wide viewBox.
- **Read aloud** on every article (browser voices, natural ones first, voice picker).
  **Recorded narration (Kokoro, voice `af_heart`) only when the owner says an article is final**;
  then set `"audio": true` on it. Tooling in `tools/tts/`; Kokoro must be reinstalled per session
  (pip `kokoro-onnx soundfile` in a venv; model files from github.com/thewh1teagle/kokoro-onnx
  releases `model-files-v1.0`); ~30 min CPU per article.

**Content & data**
- Content lives in `tech-katta/content/` (JSON) → stored on the **VPS disk** as validated releases →
  served by the API. Not MongoDB. MongoDB Atlas is for future dynamic data (accounts, payments,
  progress) and the commit ledger.
- Paid/copyrighted reference notes live only in the private repo `tech-katta-private/references/`.

**Lab** — see §6.

---

## 5. Architecture

**Frontend** (`tech-katta/frontend`, React 18 + Vite 6, deployed by Vercel from `main`, root
`frontend`, output `dist`). Two pages (`vite.config.js` inputs):
- `/` → `index.html` → `src/main.jsx` + `styles.css` (landing). Boots by fetching `/v1/site`.
- `/dashboard/` → `dashboard/index.html` → `src/dashboard.jsx` + `dashboard.css`. Boots with
  `/v1/site` + `/v1/articles`; hash routes `#<section>` and `#<section>/<slug>`; article bodies from
  `/v1/articles/<slug>` on open; `Block` renderer; figures `ApiFig`, `ChooseFig`, `OrderFig`,
  `RetryFig` in `FIGS`; `Reader` (read aloud) using `src/speech.js` (`chunks()`, `spoken()`);
  `Share`; full-screen figures (`FullFig`). The Lab is `React.lazy(() => import("./lab/Lab.jsx"))`.
- `src/api.js` (`getJSON`, `VITE_API_BASE`, default `https://tech-api.katta.cc`, retry once, 8 s
  timeout), `src/status.jsx` (Loading / LoadError with Try again).
- `vercel.json` rewrites `/dashboard` → `/dashboard/index.html`, `/health`. `public/og.png`.
- Legacy unused files still in `src/` (`main.js`, `home-page.*`, `style.css`, `mock-interview.js`,
  `architecture-workspace.js`) and `public/diagrams/kafka-architecture.svg`.

**Backend** (`tech-katta/backend`, Node 22, no dependencies, `node:http`). Endpoints:
`/health` (incl. `content.release`), `GET /v1/site`, `GET /v1/lab`, `GET /v1/articles[?section=]`,
`GET /v1/articles/:slug`. Content routes: `Access-Control-Allow-Origin: *`, `Cache-Control: public,
max-age=60, stale-while-revalidate=600`, ETag/304, OPTIONS allows `If-None-Match`, 405 on writes,
slug validation. `src/content/store.js` loads `CONTENT_DIR` (default repo `content/`), validates
(`validate.js`: article blocks, figure ids, Lab catalogue shapes/units), refuses to start on invalid
content, `SIGHUP` reloads (keeps last good). `scripts/check-content.mjs <dir>`.

**Content** (`tech-katta/content/`, see its `README.md`): `site.json` (incl. `dashboard.sections`,
`example: "zotato"`), `examples/zotato.json`, `articles/index.json`, `articles/<section>/<slug>.json`,
`lab.json`.

**Deploy**: frontend — Vercel on merge. Backend + content — `.github/workflows/deploy-backend.yml` on
changes to `backend/**` or `content/**`: test + validate → SSH to VPS → `git reset` in
`/opt/tech-katta` → `npm ci` → copy `content/` to
`/var/lib/tech-katta/content/releases/<UTC>-<sha>` → validate → atomic `current` symlink → keep 10
newest (sorted by name) → systemd `tech-katta-api` restart with `CONTENT_DIR=…/current` → local and
public checks (`/health` must report a release). Rollback: point `current` at an older release and
`sudo systemctl kill -s HUP tech-katta-api` (owner does this; the session cannot SSH).

---

## 6. System Design Lab (the differentiator)

**Vision (owner):** a Miro-like canvas with a component sidebar; each design gets **$200,000 of
virtual AWS credit**; the design is simulated with virtual traffic, load is inspected on each
component, then chaos-tested, then evaluated. Swiss colours. Tab in the sidebar and top bar.

**Owner's answers (Decided):** $200,000 credit **per design**; history saved for the user (browser
for now); laptop-first; React Flow approved; everything else delegated — chosen: Mumbai prices
(`ap-south-1`, approximate, "for learning"), tab name "Lab", steady-load simulation in phase 1.
**Owner asked to refine phase 1 before starting phase 2.**

**What exists (Known, live):**
- Catalogue `content/lab.json` → `/v1/lab`: Clients (rps), API Gateway ($3.50/M requests, 10k rps
  limit, 10 ms), Server (EC2 t3.medium 300 rps $0.0448/h … c5.2xlarge 2,500 rps $0.34/h; count 1–50;
  20 ms), Database (RDS db.t3.medium 800 qps $0.087/h … db.r5.2xlarge 12,000 qps $1.15/h; Multi-AZ ×2
  price; 5 ms); example "Zotato order API" (Clients → API Gateway → 2 × m5.large → db.m5.large
  Multi-AZ).
- `frontend/src/lab/engine.js` (pure, 6 tests): topological flow from Clients; per component
  offered/served/dropped, utilisation, latency `base/(1−ρ)` (×20 past capacity); each served request
  calls one component of every kind it points at, same-kind targets share load evenly; end-to-end
  latency and success; monthly cost (API Gateway billed on served requests); problems (no Clients,
  loops, unconnected); `total.burnPerHour = monthly/730`.
- `frontend/src/lab/Lab.jsx` + `lab.css`: palette (tap to add at a free spot; **drag with pointer
  events** — mouse, touch, pen — ghost follows, drops where released over the canvas); React Flow
  canvas (connection rules: Clients only send, Databases only receive, no duplicates/self-links;
  Delete removes); settings panel per component; **credits drain while traffic runs** on a simulated
  clock (1 s = 1 hour / 1 day default / 1 week, remembered in `tk-lab-speed`); credit meter, burn
  per hour/month, simulated day; run stops at $0, Designs → ⧉ duplicates with fresh credit; live
  per-component load colours (amber ≥70 %, red >100 %); status bar (req/s, % served, latency,
  busiest, "sent by K Clients"); designs in localStorage `tk-lab-v1` (`{current, designs:{id:{name,
  nodes, edges, credit:{spent,hours}, updated}}}`), autosave; dashboard sidebar folds to icons on the
  Lab. React Flow attribution is kept (MIT; removing it is for paying users).

**Ideas offered to the owner for this phase (Pending — owner hasn't picked):** undo/redo and
copy-paste; live req/s labels on arrows; rename components; connection hints while dragging an
arrow; credit-over-time chart; "reset clock" without duplicating.

**Later phases (agreed outline):** 2 time-based simulation (ramps, spikes, autoscaling) + more
components (load balancer, cache, queue, CDN, read replicas); 3 chaos testing (kill instance, AZ
outage, latency, partition); 4 evaluator with scores and Zotato challenges; 5 accounts (MongoDB) for
per-user history and credit.

---

## 7. Environment facts and gotchas (cloud session)

- **Blocked by the safety classifier**: MongoDB Atlas `remote-atlas-connect` (so the commit ledger
  could not be updated — entries for PRs #107–#125 are missing); force-push; `rm -rf` inside
  `bash -c` scripts; creating GitHub repos via the GitHub app (owner creates them, then `add_repo`).
  Installing Kokoro was blocked until the owner explicitly chose it, then allowed.
- `pkill -f "<pattern>"` can match the shell running it and kill the command (exit 144). Use a
  bracket in the pattern (`vite prev[i]ew`, `src/server[.]js`) and run it as the last command.
- CodeRabbit's free tier allows about one review an hour; `Review rate limited` is common.
  CodeRabbit skips auto-review (repo has < 10 stars), so always trigger it with a comment.
- Copilot review requests are accepted but produce nothing (no paid Copilot plan).
- Vercel preview URLs need a Vercel login; verify on production instead.
- The VPS cannot be reached over SSH from the session; only the GitHub Action deploys.
- `api.github.com` works unauthenticated for these public repos (check-runs, PR comments).
- Firefox will not start HTML5 drag from `<button>`; touch screens don't do HTML5 drag — use pointer
  events (as the Lab palette does).
- `cp -a` keeps the source folder's mtime; never prune "newest" by mtime after copying.

---

## 8. Open items (Pending / backlog)

1. **Lab phase-1 refinements** — owner to pick from §6, or report more observations.
2. **Owner-side compliance check before any monetisation** (the planned ₹99 course). Do not build
   payments, pricing pages or accounts tied to payment until the owner confirms it is cleared. Note:
   both `tech-katta` and this repo are public; this repo's history still contains a removed paid
   reference file (commit `a2affb8`) unless the owner makes the repo private.
3. **Per-article URLs** for link previews (hash routes all share the dashboard card) — offered, not
   decided.
4. **Move figure text and images into content** (FIG labels/steps → article JSON; `og.png` and future
   media → `content/media/` served by the API; delete unused `kafka-architecture.svg`) — offered,
   not decided.
5. **Recorded narration** for the API article when the owner says it is final.
6. **MongoDB ledger** for PRs #107–#125 (needs a session where Atlas access is allowed).
7. CodeRabbit never fully reviewed PRs #122–#125 (rate-limited); a later quiet hour could request
   reviews on a follow-up PR touching `frontend/src/lab/`.
8. Clean up legacy frontend files (separate PR).
9. ₹99 course open questions (what ₹99 buys, free vs paid, payment gateway, refunds/GST) — unanswered.

---

## 9. This session's PRs (tech-katta)

| PR | What |
|---|---|
| #107–#108 | Site briefly made private, then reverted at the owner's request |
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

Context repo: PR #35 removed the paid reference file from `main`; later doc updates are merged with
this handover. Private repo `tech-katta-private`: `references/hello-interview-api-design.txt`.

---

## 10. Reading order for a new session

1. This file. 2. `12-OPERATING-RULES.md` (rules; newest sections at the bottom).
3. `13-CURRENT-STATE.md` (dated sections; read the last five). 4. `tech-katta/content/README.md`.
5. The code on `main`. Older numbered files (01–09, 14–16) describe earlier states and are partly
**Historical**; trust the code and this file over them.
