# 18 — To-do list

The automatic agents workflow (a worker session running Learner + Builder cycles from
`tech-katta/agents/TODO.md`, with a backup schedule) was **removed on 2026-11-08 at the owner's request**.
No worker session or scheduled task exists (the last leftover, the worker's 2-hour backup schedule, was disabled on 2026-11-10 at 06:05 IST), and none should be created. Work happens only in sessions the
owner starts; after each merge, that session records the ledger and updates the handover itself.

## Open items

Status: `ready` · `idea` · `waiting for owner`. Highest first.

| # | Lane | Item | Status | Notes |
|---|---|---|---|---|
| ~~1~~ | content | ~~Stage D: 7 guides (#283) and 6 case studies in a Real systems tab (#284)~~ | done | both live; #284 merged 11-10 by session 01Jmp3n5 |
| 1 | build | **Evaluator v2**: implement `evaluator.md` (this repo) phase by phase (§15 there): phase 0 scaffolding, 1 compile and trace, 2 simulate / analyse / judge with mutation calibration, 3 workspace UI and the first converted problem, 4–6 new components and the remaining conversions | in progress | phase 0 done (#287, live 11-10); phase 1 next |
| 2 | content | Stage E: the reference's 11 other problem breakdowns (price tracker, AI chat assistant, distributed rate limiter, live comments, flash sale, news aggregator, metrics monitoring, online auction, online chess, stock trading, fitness tracking), two or three per PR, each with tests, rubric, hints, Lab design, calibrated; then Interview Questions = 32 + IND vs PAK | in progress | owner's task 3 of 11-10; IND vs PAK done (#285). **Owner, 11-10 10:30 IST: the 11-09 session (branch `ccr-26f78085-ymb3p0`) does stage E**; other sessions don't start it |
| — | content | Free articles: only How to answer is free since #280/#281 removed the other five | waiting for owner | owner said "I'll choose later" |
| — | content | Quick Notes tab has no counterpart on the reference site: keep or remove? | waiting for owner | not touched |
| ~~—~~ | docs | ~~The app repo's `content/README.md` is stale~~ | done | refreshed in #285 (sections, no Lab tab, card routes, free set) |
| — | build | Challenge solutions: none of the 8 challenges (on Problems since #285) has one; IND vs PAK, now a problem, has its solution design. Proposal: a solution design per challenge in `lab.json`, "Show solution" after the first scored attempt, copied solutions don't count for stars | waiting for owner | owner asked 11-09 why there is none |
| — | testing | `tools/e2e` scripts written for the Lab tab use its Designs menu, Import, the Challenges menu or the landing stars (lab-basics, lab-crash, lab-credits, lab-storage-links, lab-phase2, lab-traffic, lab-cache-arrows, tour-import, landing-lab, landing-phone, qa-scoring, qa-saving, qa-a11y, learn-challenges; and site-sweep, which opens `concepts/api-types`, removed in #280): update them to open a challenge at `/dashboard/problems/challenge/<id>/` or a problem; `no-lab.js` covers the new flows | ready | not run since #285 |
| — | infra | Pin the API container's base image to a digest when production starts using `backend/Dockerfile` (#277 review) | when switching | `node:22-alpine` from public.ecr.aws today |
| — | infra | Before launch: move the website to Cloudflare (Workers static assets) and the API off the Bluehost VPS, following `HOSTING.md` in the app repo (owner decided 2026-11-09 to switch before launch; API host to be chosen) | waiting for owner | needs owner: Cloudflare API token as a GitHub secret, new host account, DNS switch; test Safari read-aloud on Cloudflare |
| — | reliability | Pre-launch audit low items (#275): (a) the browser judges on the visitor's own tab, so a 200-component design can pause it for seconds; (b) `/v1/problems/stats` sends a stray `Allow-Credentials` with `Allow-Origin: *`; (c) the admin summary's `$addToSet` visitor arrays hit Mongo's 16 MB document cap after a few hundred thousand visitors; (d) unknown dashboard routes answer 200 | open, low | none can crash the site; (c) only before analytics.katta.cc grows large |
| — | content | Move article JSON per sub-tab (`content/articles/<tab>/<sub-tab>/`) to match #274's code layout | offered, not asked | changes index.json paths and the deploy; separate PR |
| — | build | More interactive figures like `ch-playground` (e.g. a cache with LRU/LFU you can feed reads, a quorum you can partition) | idea | the playground shows figures can hold state with no renderer change |
| — | content | ~~Q23–Q36, one per run~~ | superseded | 2026-11-09: questions now match the reference site's 32 problems exactly (stage E above); no others |
| — | build | Lab: a way to model "one database that can't be split" (e.g. a challenge setting that allows one database only) | idea | would make a fair ticket-booking waiting-room challenge (Q05); without it, two big databases beat a queue for a short sale. Not worth it alone |
| — | build | Practice analytics: a `practice_done` event (slug, minutes per step) | waiting for owner | needs a new event in `backend/src/auth/events.js` (what the events collection stores), which counts as the data model under rule 4 |
| — | build | Public previews: title, dek and "In 30 seconds" readable without sign-in, so search engines can index articles | waiting for owner | changes the sign-in gate |
| — | build | Paid plan: paywall, Razorpay (UPI Autopay monthly, one-time yearly), receipts, refund policy | waiting for owner | needs the owner's go-ahead on rule 5, a payment account and GST advice. Builder: gate paid content on the API (never only in the browser), hosted checkout, verified and idempotent webhooks, a short cache of "has paid" plus a chaos test so outages don't lock out payers |

**Historical** (superseded 2026-11-09 by stage E: the questions now match the reference's 32 problems; the
list below is the old plan, kept for the record).
Interview Questions plan (section `interview-questions`, groups start/easy/medium/hard/practice; one
article per PR; shape as in `content/articles/interview-questions/url-shortener.json`):
00 How to answer ✅ · 01 URL shortener ✅ · Easy: 02 File storage and sync ✅ · 03 Restaurants near me ✅ ·
04 10-minute grocery delivery ✅ · Medium: 05 Match ticket booking ✅ · 06 Photo sharing ✅ · 07 News feed ✅ ·
08 Dating app swipes · 09 Coding judge · 10 Chat app · 11 Fitness tracker · 12 Distributed cache ·
13 Rate limiter · 14 Online auction · 15 Video platform · 16 Job scheduler · 17 Live comments ·
18 News aggregator · 19 Price tracker · 20 Notification system · Hard: 21 Top-K trending ·
22 Ride hailing · 23 Stock trading · 24 Collaborative docs · 25 Web crawler · 26 Ad click counting ·
27 Post search · 28 Payments (UPI-style) · 29 Metrics and alerting · 30 Online chess · 31 AI chat app ·
32 Flash sale · Practice: 33 Food reviews · 34 Game leaderboard · 35 Donations site · 36 CI job runner.

## Owner only

- Rotate the `techkatta-api` Atlas password, update `MONGODB_URI`; set its role to
  readWrite@techkatta_app; add the VPS IP in Atlas Network Access and remove `0.0.0.0/0`.
- Reset the Google client secret.
- Delete the leftover old `techkatta` database documents and the three test events.
