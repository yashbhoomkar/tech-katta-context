# 18 — To-do list

The automatic agents workflow (a worker session running Learner + Builder cycles from
`tech-katta/agents/TODO.md`, with a backup schedule) was **removed on 2026-11-08 at the owner's request**.
No worker session or scheduled task exists (the last leftover, the worker's 2-hour backup schedule, was disabled on 2026-11-10 at 06:05 IST), and none should be created. Work happens only in sessions the
owner starts; after each merge, that session records the ledger and updates the handover itself.

## Open items

Status: `ready` · `idea` · `waiting for owner`. Highest first.

| # | Lane | Item | Status | Notes |
|---|---|---|---|---|
| 2 | build | **Evaluator v3** (`22-EVALUATOR-V3.md`): phases A to G in its §21. A and B have no AI (evidence pack, design report, probes, "Show me", predict questions); C cards and deep dives; D the interviewer's review; E skills and one question a day; F written answers and the mock interview | waiting for owner | design only, written 2026-11-13. Ten owner decisions in its §23, first among them: confirm the shape, and approve the new collections and events (operating rule 4) before phase A. The pricing and credit numbers are in the private repo |
| — | build | **The interviewer** (`29-SELF-HOSTED-LLM-ON-A-VPS.md` §11–§12; spec 22 review job): built and live with the mock, #339. Left: the bake-off (`backend/ai-evals/run.mjs` on Muse Ember 1.0, Claude Haiku 5.5, DeepSeek V4.1 Flash; costs money), then the `AI_*` settings on the VPS; check the button signed in on production | waiting for owner | 2026-11-13 |
| — | docs | **Ledger rows for #339** (MongoDB was unreachable from the session that merged it): `3777688b4b83e57ba40829b351052af4f2e1a12e` (branch commit) and `1a61ba13ef691c460cbad464357d991edf0f8b1c` (squash) in both `frontend_git_commits` and `backend_git_commits` | ready | check both collections for the SHAs first |
| ~~—~~ | ui | ~~**Premium colour scheme**~~ | done | #334: P4 Brilliant-inspired, live 2026-11-13 (`25-PREMIUM-COLOUR-OPTIONS.md` §6) |
| — | ui | Link preview image (`frontend/public/og-2026-11.png`) in the new look | ready | the share card already follows the tokens |
| — | ui | Less text, round 2 (spec 25 §7 "Next"): phones open in "Figures only" if `article_skim` shows readers prefer it; shorten section intros and Interview Questions guide cards | ready | after a week of event data |
| ~~—~~ | ui | ~~**Spec 24**~~ (`24-UI-UX-SWIPES-ANIMATIONS-GRAPHICS.md`) | done | #323–#333 (2026-11-13). What was not built, and why, is in its status section. Left: the real-phone checklist (§8, §11.4) at the five-friends test; A8/S7 with spec 22 phase B |
| 1 | build | **Practice (spec 21)**: steps 1–8 live (#317, #319; unlinked; 10 problems). Next: step 9, the owner reviews with five friends on phones, then links "Practice" in the tabs; after that steps 10–17 (judge page, report a verdict, lessons, compare, follow-ups, plans, analytics dashboard, India-first check) | waiting for owner | spec 21 §25 lists what was decided while building |
| — | build | Spec 21 owner decisions (§19): approach, the name "Practice", free/paid lines (`PRACTICE_ALL_PAID = true` now), the first ten problems, names on shared solutions, retiring the canvas | waiting for owner | |
| — | build | Spec 21 §22.11 ship rule "each test alone rejects ≥ 2 % of the grid" fails for problem 1 (t02 0.6 %, t03 0 %, t05 1.4 %) and looks unsatisfiable with ~1 % Accepted; deleting t03 breaks "3 hidden tests". Owner: relax the rule (e.g. relative to the Accepted count) or accept | waiting for owner | sweep: `node backend/scripts/sweep-problem.mjs url-shortener` |
| — | docs | Ledger rows for #318 (another session's animations PR, merged 22:16 IST after #317) | ready | not recorded by the #317 session |
| ~~—~~ | docs | ~~Ledger rows for #316~~ | done | recorded 2026-11-12 when the owner asked ("Update docs and ledgers"); frontend 853, backend 673 |
| ~~1~~ | content | ~~Stage D: 7 guides (#283) and 6 case studies in a Real systems tab (#284)~~ | done | both live; #284 merged 11-10 by session 01Jmp3n5 |
| 1 | build | **Evaluator v2**: implement `evaluator.md` (this repo) phase by phase (§15 there): phase 0 scaffolding, 1 compile and trace, 2 simulate / analyse / judge with mutation calibration, 3 workspace UI and the first converted problem, 4–6 new components and the remaining conversions | done | phases 0–7 done (#287–#302): all 22 Interview Questions and the 8 challenges on v2, v1 removed, its catalogue settings too; was: 11 problems on v2; 8 problems live on v2 (URL shortener, payments, notifications, chat, news feed, photo sharing, video streaming, IND vs PAK); next: phase 6 (scheduler, stream processor, coordination, shard keys, rank and incr) and the other 14 problems; was: the remaining phase 4 conversions (news feed, video streaming, photo sharing, IND vs PAK), 4c (CDC, hot keys, poison), and the problems that need only phase 2–3 parts (§16) |
| 2 | content | Stage E: the reference's 11 other problem breakdowns (price tracker, AI chat assistant, distributed rate limiter, live comments, flash sale, news aggregator, metrics monitoring, online auction, online chess, stock trading, fitness tracking), two or three per PR, each with tests, rubric, hints, Lab design, calibrated; then Interview Questions = 32 + IND vs PAK | in progress | owner's task 3 of 11-10; IND vs PAK done (#285). **Owner, 11-10 10:30 IST: the 11-09 session (branch `ccr-26f78085-ymb3p0`) does stage E**; other sessions don't start it |
| — | content | Free articles: only How to answer is free since #280/#281 removed the other five | waiting for owner | owner said "I'll choose later" |
| — | content | Quick Notes tab has no counterpart on the reference site: keep or remove? | waiting for owner | not touched |
| ~~—~~ | docs | ~~The app repo's `content/README.md` is stale~~ | done | refreshed in #285 (sections, no Lab tab, card routes, free set) |
| — | build | Challenge solutions: none of the 8 challenges (on Problems since #285) shows one. Since #300 each has a reference design that earns every star, kept as a test fixture (`frontend/src/eval/fixtures/challenge-references.json`, not served); IND vs PAK, now a problem, has its solution design. Proposal: serve those as a solution per challenge, "Show solution" after the first scored attempt, copied solutions don't count for stars | waiting for owner | owner asked 11-09 why there is none |
| — | testing | `tools/e2e` scripts written for the Lab tab use its Designs menu, Import, the Challenges menu or the landing stars (lab-basics, lab-crash, lab-credits, lab-storage-links, lab-phase2, lab-traffic, lab-cache-arrows, tour-import, landing-lab, landing-phone, qa-scoring, qa-saving, qa-a11y, learn-challenges; and site-sweep, which opens `concepts/api-types`, removed in #280): update them to open a challenge at `/dashboard/problems/challenge/<id>/` or a problem; `no-lab.js` covers the new flows Since #301 the v1 Lab is gone too (Run traffic, credit, the v1 node readouts), so lab-basics, lab-credits, lab-phase2, lab-traffic and learn-challenges test what was removed; the v2 checks are eval-problem.js, challenges-v2.js and solution-tab.js. | ready | not run since #285 |
| — | testing | `read-aloud.js` (waits for `.reader`) and `mobile-figures.js` (waits for `.r-btn.primary`) fail on the current site | ready | `tour.js` was updated for the new tours in context #165 and passes; found 11-12; the two scripts predate #280's article change |
| ~~—~~ | testing | ~~`judge-pool.test.js` time-limit test is timing-sensitive~~ | done | #310: the slow job runs the load tests 1000 times (failed on CI for #309 and #310 at 1.7 s) |
| — | build | Split `solve.css` (18 KB) and `lab/lab.css` (16 KB) per part, like `src/dashboard/` (keep the cascade order; check computed styles) | idea | the JS was split in #305 |
| ~~—~~ | ui | ~~Build the new look, "Katta Paper", from `20-UI-REDESIGN-SPEC.md`~~ | done | live 2026-11-12 (#309); follow-ups #310 |
| ~~—~~ | ui | ~~Figures readable on phones~~ | done | #313: 600 px wide in a sideways-scrolling frame (labels 9.4 px, were 5.7), step line above it. A phone-first redraw of key figures is still possible later |
| ~~—~~ | ui | ~~Figure step timing after #312~~ | done | #323: readers can pause and step through a figure (‹ ❚❚ ›, swipe on phones) instead of slowing every loop; `SPEED` stays 0.7 |
| — | ui | Katta Paper checks not done by eye: the five product moments (spec §4.8: stroke under a passed verdict, stars pop, a crashed node shudders, the load bar slides, the zoomed figure pops), DevTools animation timings (§4.6), 200 % zoom | ready | the build and e2e scripts pass; these need a person or a scripted look |
| — | ui | Phone dashboard header: the tabs are cut off ("Interv…") and scroll sideways; the theme button (#304) takes a little more room | idea | it was cut off before #304 too |
| — | infra | Pin the API container's base image to a digest when production starts using `backend/Dockerfile` (#277 review) | when switching | `node:22-alpine` from public.ecr.aws today |
| — | infra | Before launch: move the website to Cloudflare (Workers static assets) and the API off the Bluehost VPS, following `HOSTING.md` in the app repo (owner decided 2026-11-09 to switch before launch; API host to be chosen) | waiting for owner | needs owner: Cloudflare API token as a GitHub secret, new host account, DNS switch; test Safari read-aloud on Cloudflare |
| — | reliability | Pre-launch audit low items (#275): (a) the browser judges on the visitor's own tab, so a 200-component design can pause it for seconds; (b) `/v1/problems/stats` sends a stray `Allow-Credentials` with `Allow-Origin: *`; (c) the admin summary's `$addToSet` visitor arrays hit Mongo's 16 MB document cap after a few hundred thousand visitors; (d) unknown dashboard routes answer 200 | open, low | none can crash the site; (c) only before analytics.katta.cc grows large |
| — | content | Move article JSON per sub-tab (`content/articles/<tab>/<sub-tab>/`) to match #274's code layout | offered, not asked | changes index.json paths and the deploy; separate PR |
| — | build | More interactive figures like `ch-playground` (e.g. a cache with LRU/LFU you can feed reads, a quorum you can partition) | idea | the playground shows figures can hold state with no renderer change |
| — | content | ~~Q23–Q36, one per run~~ | superseded | 2026-11-09: questions now match the reference site's 32 problems exactly (stage E above); no others |
| — | build | Lab: a way to model "one database that can't be split" (e.g. a challenge setting that allows one database only) | idea | would make a fair ticket-booking waiting-room challenge (Q05); without it, two big databases beat a queue for a short sale. Not worth it alone |
| — | build | Practice analytics: a `practice_done` event (slug, minutes per step) | waiting for owner | needs a new event in `backend/src/auth/events.js` (what the events collection stores), which counts as the data model under rule 4 |
| — | build | Public previews (owner 2026-11-13: "Preview only") | built, PR #320 | see `23-SEARCH-AND-BACKLINKS.md` |
| — | owner | Search Console (paste its TXT value to a session; it adds it in Cloudflare), Bing Webmaster, backlinks from your accounts | waiting for owner | steps in `23-SEARCH-AND-BACKLINKS.md`; IndexNow done (#321) |
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
