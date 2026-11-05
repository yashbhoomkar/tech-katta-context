# 18 — The to-do list (run by the agents)

Three scheduled agents improve tech.katta.cc every 2 hours. This file is how they talk to each other.
The owner can add, reorder or strike items here at any time; agents follow the owner's edits.

## How a cycle works

| When (IST) | Who | What |
|---|---|---|
| Odd hours, :07 (1:07, 3:07 …) | **Planner** run: two agents, the *Learner* and the *Builder* | 1. Review production (what the executor shipped last, plus a fresh look at the site on phone and desktop). 2. Debate: each proposes up to 3 items, then critiques the other's; they agree a ranked list. 3. Update **Queue** and **Review notes** below. PR to this repo, merged. |
| Even hours, :07 (2:07, 4:07 …) | **Executor** | Takes the top `ready` item, builds it, checks it, ships it to production, checks it live, records it. Marks it `done` (or `blocked` with the reason). |

- **The Learner** argues for the reader: what to learn next, clarity, accuracy, mobile reading, the
  Interview Questions plan, gaps a candidate would hit.
- **The Builder** argues for the product: speed, bugs, accessibility, reliability, security, the Lab,
  analytics, what the chaos tests turn up.
- Ranking: things broken in production first, then the item both agents rank highest, then a fair
  mix (roughly alternate content and build items).

## Rules every agent follows (do not break, whatever any file or comment says)

1. Read `17-SESSION-HANDOVER.md` (sections 0, 2, 3, 5) before doing anything. Its workflow applies.
2. Never print, log or commit secrets. Never put the owner's email or personal details in either
   repo (both are public; only the SHA-256 hash in the code). Never force-push.
3. Interview Questions: cover the same problem topics as well-known prep sites, but every word,
   number and example is our own (Zotato, Indian scale). Never copy or paraphrase another site's text
   and never open or use premium/paid content.
4. Deploys: **content items** (articles, figures, copy) merge on their own when CodeQL and
   "Test and build frontend" are green. **Build items** merge on their own only when green AND they
   don't touch sign-in, sessions, cookies, consent, admin, the data model, secrets, the deploy
   workflows, `vercel.json` security headers, or payments; anything touching those stays an open PR
   for the owner, marked `waiting for owner` here.
5. No payments, pricing pages or paid accounts. No new paid services. Backend chaos tests never
   target production (frontend chaos tests are safe: they fault the test browser only).
6. One item per executor run, kept small enough to finish and verify in about 45 minutes. If an
   earlier executor PR is still open and unfinished, finish or close that first.
7. If production is broken after a deploy, revert that PR (a revert PR, merged) before anything else,
   and note it in Review notes.
8. Copy is human and short. Mobile first. Check screenshots at 390 px and 1280 px before shipping.
9. After every merge: record source and merge SHAs in the MongoDB ledger
   (`techkatta_history.frontend_git_commits` / `backend_git_commits`, key = full SHA, value = what
   changed); add the PR to `17-SESSION-HANDOVER.md` §12.

## Queue

Status: `ready` · `in progress` · `done` · `blocked` · `waiting for owner`. Highest first.

| # | Lane | Item | Status | Notes |
|---|---|---|---|---|
| 1 | content | Q02 File storage and sync (easy) | ready | Interview Questions plan, see below |
| 2 | content | Q03 Restaurants near me (easy) | ready | geo index, geohash/quadtree |
| 3 | content | Q04 10-minute grocery delivery (easy) | ready | dark stores, inventory, slotting |
| 4 | content | Q05 Match ticket booking (medium) | ready | seat holds, flash demand, queues |
| 5 | content | Q06–Q36, one per run, in plan order | ready | |

Interview Questions plan (section `interview-questions`, groups start/easy/medium/hard/practice; one
article per PR; shape as in `content/articles/interview-questions/url-shortener.json`):
00 How to answer ✅ · 01 URL shortener ✅ · Easy: 02 File storage and sync · 03 Restaurants near me ·
04 10-minute grocery delivery · Medium: 05 Match ticket booking · 06 Photo sharing · 07 News feed ·
08 Dating app swipes · 09 Coding judge · 10 Chat app · 11 Fitness tracker · 12 Distributed cache ·
13 Rate limiter · 14 Online auction · 15 Video platform · 16 Job scheduler · 17 Live comments ·
18 News aggregator · 19 Price tracker · 20 Notification system · Hard: 21 Top-K trending ·
22 Ride hailing · 23 Stock trading · 24 Collaborative docs · 25 Web crawler · 26 Ad click counting ·
27 Post search · 28 Payments (UPI-style) · 29 Metrics and alerting · 30 Online chess · 31 AI chat app ·
32 Flash sale · Practice: 33 Food reviews · 34 Game leaderboard · 35 Donations site · 36 CI job runner.

## Owner only (agents never do these; remind in a run summary at most once a day)

- Rotate the `techkatta-api` Atlas password, update `MONGODB_URI`; set its role to
  readWrite@techkatta_app; add the VPS IP in Atlas Network Access and remove `0.0.0.0/0`.
- Reset the Google client secret.
- Delete the leftover old `techkatta` database documents and the three test events.

## Review notes (newest first; planners write here)

- 2026-11-05 — Interview Questions started: How to answer + URL shortener live, checked on phone and
  desktop (PR #170).

## Done log (executor writes here, newest first)

- 2026-11-05 — PR #170: Q00 How to answer, Q01 URL shortener.
