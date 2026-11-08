# 18 — To-do list

The automatic agents workflow (a worker session running Learner + Builder cycles from
`tech-katta/agents/TODO.md`, with a backup schedule) was **removed on 2026-11-08 at the owner's request**.
No worker session or scheduled task exists, and none should be created. Work happens only in sessions the
owner starts; after each merge, that session records the ledger and updates the handover itself.

## Open items

Status: `ready` · `idea` · `waiting for owner`. Highest first.

| # | Lane | Item | Status | Notes |
|---|---|---|---|---|
| — | content | Next reference-led Concepts groups (done: Networking essentials, API design, Data modelling, Caching, Sharding, Consistent hashing, CAP theorem) | waiting for owner | owner names the next one; same method: paragraph map, our own words via Zotato, our figures |
| — | ops | Vercel daily limit hit 2026-11-09 ~00:40 IST: front end live through #266; #267–#269 front-end parts deploy with the next merge after it resets. Check tech.katta.cc/dashboard/concepts/cap-step/ shows its own title | waiting | nothing to change in code |
| — | build | More interactive figures like `ch-playground` (e.g. a cache with LRU/LFU you can feed reads, a quorum you can partition) | idea | the playground shows figures can hold state with no renderer change |
| 1 | content | Q23–Q36, one per run (pick common questions not yet covered and not already taught elsewhere on the site: e.g. a file-sharing link service, a distributed message queue as a question, a reviews and ratings system, …) | ready | |
| — | build | Lab: a way to model "one database that can't be split" (e.g. a challenge setting that allows one database only) | idea | would make a fair ticket-booking waiting-room challenge (Q05); without it, two big databases beat a queue for a short sale. Not worth it alone |
| — | build | Practice analytics: a `practice_done` event (slug, minutes per step) | waiting for owner | needs a new event in `backend/src/auth/events.js` (what the events collection stores), which counts as the data model under rule 4 |
| — | build | Public previews: title, dek and "In 30 seconds" readable without sign-in, so search engines can index articles | waiting for owner | changes the sign-in gate |
| — | build | Paid plan: paywall, Razorpay (UPI Autopay monthly, one-time yearly), receipts, refund policy | waiting for owner | needs the owner's go-ahead on rule 5, a payment account and GST advice. Builder: gate paid content on the API (never only in the browser), hosted checkout, verified and idempotent webhooks, a short cache of "has paid" plus a chaos test so outages don't lock out payers |

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
