# 34 — Full technical review: the 21 concepts and everything else (2026-11-14)

This continues `33-ARTICLE-AUDIT-2026-11-14.md`. The owner asked for two more things: an audit of the concepts
that existed before #363 ("there were 21"), and a review of every piece of technical content, not only the
articles. Nothing in the application was changed.

What this file adds to file 33:

1. The twelve concept articles removed by #363, recovered from git and audited (section 2).
2. The ten Practice problems under `content/problems2` (section 3).
3. The canvas and evaluator catalogues and the eight challenges (section 4).
4. The text and numbers drawn inside the figures (section 5).
5. The landing page and the shared example company (section 6).
6. Design-level remarks on the worked questions that go beyond arithmetic (section 7).
7. One correction to file 33 (section 8).

## 1. Summary

- **The 21 concepts are confirmed.** The commit before #363 (`7f3df4c`) has 21 concept articles: the nine that
  remain and twelve that #363 deleted. All twelve were recovered and read in full.
- **The twelve removed articles are accurate.** Every number that could be recomputed is right, including the
  geohash example, which was checked by computing the cell and its eight neighbours. They are also exactly the
  articles whose absence file 33 reported as the library's main gap. Four of them are prerequisites for worked
  questions that are still published.
- **The Practice problems are where the new problems are.** Their capacity model contradicts the Numbers to know
  article, three reference solutions teach a design the articles argue against, and two statements contain
  arithmetic that does not add up.
- **The site now has three different answers to "how much can one database take".** The article says about 10,000
  writes a second; the canvas's largest database takes 12,000 queries a second; Practice says a large SQL primary
  takes 2,500 writes a second "at most".
- **Figures are sound.** About 190 figures were checked through their labels and descriptions. One number is
  wrong (a Redis slot) and one caption was already reported.

## 2. The twelve removed concepts

Recovered from `7f3df4c:content/articles/concepts/`. The nine kept articles differ from their earlier versions
only in the cross-references #363 edited, so file 33 covers them.

### 2.1 Verdict per article

| Was | Article | Verdict | Notes |
|---|---|---|---|
| 10 | Real-time updates | Accurate; needs an edit | The longest of the twelve (four parts). Technically right throughout: the two hops, registry or pub/sub or hashing for the second, reconnect with sequence numbers, fan-out in layers. The fourth part, "Live updates at scale", repeats parts two and three: the routing table appears twice, reconnection is explained twice, and the figures `live-fanout` and `live-resume` are each used twice. It reads as two articles merged. Plans for 50,000 connections a server; the chat question uses a lakh and the canvas 25,000 on its default size. |
| 11 | Contention | Accurate | The only place the site explained lost updates, conditional updates, `SELECT … FOR UPDATE`, optimistic versions with `If-Match`, holds with expiry, hot items and fencing tokens together. One omission: "keep the count in Redis with an atomic `DECR`" does not say the count can go below zero unless a script checks it first. No table of isolation levels. |
| 12 | Processes with many steps | Accurate | State machine with conditional moves, timers, outbox, orchestration against choreography, durable workflows, sagas. Consistent with the Temporal article. |
| 13 | Scaling reads | Accurate | The layer table, read models, hot keys, read-your-writes by reading the primary or waiting for the log position. The hit-rate arithmetic (90% to 99% cuts database reads tenfold) is right. |
| 14 | Scaling writes | Accurate | Batching, queues, sharding, split counters, group commit. Says a typical primary takes "a few thousand writes a second"; Numbers to know says about 10,000. The queue figure's numbers agree with the text (a 10-minute spike drained over 34 minutes, so up to 24 minutes of waiting). |
| 15 | Big files | Accurate | Signed URLs, multipart limits (5 MB minimum part, 10,000 parts), file states, range requests, transfer cost. |
| 16 | Jobs that run for minutes | Accurate | Leases, `SKIP LOCKED`, visibility timeouts, backoff, dead letters, checkpoints. The point that a looping worker keeps renewing its lease, so a time limit is also needed, is one most write-ups miss. |
| 17 | Finding what's nearby | Accurate | Geohash sizes, H3 areas, the neighbour list in the SQL example (`tek92e` is central Pune and all eight neighbours are correct), k-nearest by widening rings. |
| 18 | Vector search | Accurate | The memory figure (1 crore × 768 floats ≈ 31 GB), pgvector syntax, recall, hybrid search. The pgvector example filters with `WHERE` straight after the text warns that filtering after the search can return too few rows; it should say which case this is. |
| 19 | Time series | Accurate | Compression to about 1.4 bytes a point, Prometheus defaults, the cardinality arithmetic. |
| 20 | Sketches | Accurate | HyperLogLog (12 KB, 0.81%), Count-Min sizing (2,718 × 5 counters ≈ 54 KB), Bloom filters. The table says t-digest and KLL are both "very accurate at the tails"; that is t-digest's property, while KLL bounds rank error evenly. |
| 21 | Change data capture | Accurate | Log-based capture, snapshots, slot lag, outbox against table capture, ordering per key. The PostgreSQL commands are right. |

### 2.2 What their removal left behind

- **Prerequisites with nowhere to point.** Contention is used by ticket booking, grocery, payments, rider
  assignment and the job scheduler. Real-time updates is used by chat, the shared editor, the leaderboard and
  rider assignment. Change data capture is named in nine remaining articles. Processes with many steps and Jobs
  that run for minutes underlie payments, notifications, the coding judge and video.
- **Redirects that land on the wrong page.** #363 sends each old address to "the closest core article":

  | Old address | Goes to | Problem |
  |---|---|---|
  | contention | CAP theorem | CAP is about copies disagreeing, not about two requests for one row. Data modelling or PostgreSQL is closer. |
  | big-files | Networking essentials | Nothing there about object storage or multipart uploads. |
  | long-jobs, workflows | API design | API design has no queues, leases or workflows. |
  | sketches | Numbers to know | No sketches there. |
  | time-series | Data modelling | One paragraph on wide-column stores. |
  | change-capture | Data modelling | One sentence ("from a change stream"). |

- **Redirect chains.** Older redirects still point at pages #363 removed: `distributed-transactions → workflows →
  api-design`, and five `realtime-*` addresses go to `real-time-updates` and then on to Networking essentials.
- **None of the redirects is live yet**, because the frontend deployment is still at #358 (file 33, section 1).

### 2.3 Recommendation

The owner's reason for #363 was that there were too many concepts. The twelve were not equal. Four are load
bearing: **Contention, Real-time updates, Change data capture, and one merged page for multi-step processes and
long jobs**. Restoring those four gives thirteen concepts, closes most of file 33's section 5, and repairs four
of its six broken references. Scaling reads and Scaling writes overlap with Caching, Sharding and Numbers to know
and can stay out. The four specialised ones (nearby, vectors, time series, sketches) are good optional reading and
would fit under Components or Quick Notes without counting as concepts.

The clone used for this review holds the last 50 commits. An older generation of concept pages (their addresses
survive as redirects: `replication`, `consensus`, `distributed-transactions`, `consistency`, `timeouts-retries`)
is not in it and was not audited. The two "consensus article" references reported in file 33 point at one of them.

## 3. The ten Practice problems

These are separate from the worked questions: a short text design, judged by tests, each with an editorial.

### 3.1 The capacity model contradicts the articles

Practice uses these figures in its editorials and wrong-answer explanations:

| Part | Practice says | The articles and the canvas say |
|---|---|---|
| SQL primary, writes | medium 1,000 a second; large 2,500 "at most, even large" | Numbers to know: about 10,000 simple writes a second on one primary. Canvas: `db.r5.2xlarge` takes 12,000 queries a second. |
| Read replica | 8,000 reads a second | Numbers to know: tens of thousands of indexed reads a second. |
| Load balancer | "takes 50,000" requests a second, as a hard limit | Canvas: 100,000. Managed balancers scale out by themselves, as Networking essentials says. |
| Server | small 500, medium 1,000, large 2,000 a second | Canvas: 300 to 2,500 by size. Broadly consistent. |

Two problems are built on the low figure. The rate limiter (003) rejects SQL because "a large SQL primary takes
2,500 writes a second". The chat message store (009) opens with "5,000 a second … too many for one SQL primary".
Numbers to know says, in its part on over-engineering: "A product taking 1,000 writes a second at peak, even
5,000, is well within one primary database." A learner who has read the article will write the answer the
article teaches and be marked Overloaded.

Either the Practice figures move towards the article's, with the traffic in those problems raised to keep the
lesson, or each problem states its machine sizes up front so the limit is a given rather than a claim about SQL.

### 3.2 Reference solutions that disagree with the articles

| Problem | Reference solution | What the articles teach |
|---|---|---|
| 003 Rate limiter | A leaderless NoSQL store, three copies, writes confirmed by one; "Read more" links to Cassandra and DynamoDB | API gateways and Redis both say a shared counter in Redis updated atomically (`INCR` with `EXPIRE`, or a token bucket in a script). The Practice language has no way to say that, so the textbook answer cannot be written. |
| 004 News feed (read path) | The feed is one row per user in a NoSQL store; a post is one write, followed by a cache invalidation | The news feed question is about fan-out: one post becomes 200 writes, or 50 lakh for a big account. Here a post touches one key, so the defining problem is absent. The title says "read path", but the statement also asks for "the post write". |
| 006 Image upload and serving | Views that miss the CDN go `lb > api > files`; uploads go `client > lb > api > ids > files` | Photo sharing, file sync, video streaming and the removed Big files article all say the opposite, in so many words: bytes never pass through the API servers, the CDN reads from storage, uploads use signed URLs. |
| 008 Ticket booking | Double sale is prevented by clearing the cache on every booking and reading the seat map from the primary. A cached map that is a minute old is "Wrong Answer". | The ticket booking question says the seat map comes "from a cache refreshed every second or so. It's always a little behind; the hold is the truth." A stale map never sells a seat twice; the conditional update does that. The statement's "never be sold twice … (read your writes)" joins two different guarantees. |
| 007 Leaderboard | Scores in SQL with `index(game_id)`, top 100 through a 4-second cache | Reasonable at this size (10 lakh players), but the leaderboard question and the Redis article teach sorted sets, and a top-100 query needs the index on (game, score), not on game alone. |

008 also has a cache with a 60-second lifetime that is cleared 1,200 times a second on a handful of hot shows,
which leaves nothing for the cache to do. The reference passes because the simulator does not model that.

### 3.3 Arithmetic that does not add up

- **010 IND vs PAK live score.** "Three crore fans have the … app open on the live score, and the app refreshes
  it every few seconds: about 2 lakh reads a second." Three crore phones refreshing every 5 seconds is 60 lakh
  reads a second. Two lakh a second is one refresh per phone every 150 seconds.
- **006 Image serving, editorial.** "95% of views are answered at the edge in about 15 ms, so the median view is
  about 4 ms." If 95 in 100 take about 15 ms, the median is about 15 ms.

### 3.4 What is right

- The collision figures are correct: 10 crore random 32-bit codes collide about 11 lakh times (001).
- The cache sizing in 001 and 002, the backlog arithmetic in 005 (1.8 lakh waiting, longest wait about 90
  seconds), and the freshness sums in 007 and 010 (4 + 1 and 2 + 2 seconds) all check out.
- 009's use of quorums is the standard argument and is stated correctly.
- 001 says `zt.to`; the worked question and the challenge say `zot.to`.

## 4. The canvas, the evaluator catalogue and the challenges

Checked: `content/lab.json` and `content/eval.json`, which hold every size, price and capacity the canvas shows.

- **Prices are right.** Instance, database, cache, load balancer, queue, gateway, CDN request, storage and
  transfer prices match AWS list prices for the Mumbai region closely enough for teaching.
- **The cache is modelled as a proxy.** The canvas places the cache between servers and the database
  (`Server → Cache → Database`) and offers two write policies: write-through and write-back. The Caching article
  says cache-aside is "the one to use in an interview unless you have a reason not to", that Redis "doesn't do"
  write-through by itself, and that write-behind is "never for orders". The pattern the article teaches first
  cannot be chosen on the canvas.
- **The largest database is small.** The top size is 8 vCPUs and 12,000 queries a second, so hints such as "No
  database here takes 20,000 reads a second" are true of the canvas and untrue of the article's machines. The
  hints do say "here"; a sentence on why the canvas stops at this size would prevent the wrong takeaway.
- **The match-night traffic pattern repeats the timeline error** from file 33 section 3.2: "a jump at the 7 pm
  toss … the peak in the last over at 10:18 pm". That is a third place to fix, with the article and its brief.
- **The eight challenges are consistent** with their own catalogue: every hint's number can be derived from the
  sizes listed.
- A stream partition takes 10,000 messages a second on the canvas; the Kafka article says tens of megabytes a
  second per partition. Conservative, and not wrong.

## 5. Figures

Method: the labels, step lines and screen-reader descriptions of every figure were extracted from the source
(about 190 figures, 105 KB of text) and read. The drawings were not rendered.

- **Wrong: `ca-client` (Caching).** "GET menu:42 → slot 7138", routed to node B. The slot of `menu:42` is 12,393
  (CRC16 mod 16,384), which the figure's own table gives to node C. The Redis article's version of the figure
  says "say slot 9,201", which is honest about being made up.
- **Already reported: `nm-latency`.** "Each step is roughly ten times the one before."
- **`nw-light`** says real round trips are "about twice" the floor set by light in fibre, then gives 200 ms for a
  13,000 km path whose floor is 130 ms. About one and a half times.
- Everything else recomputes: 9, 5 and 3 round trips in `nw-keepalive`; 62 KB against 3.6 KB in `nw-overfetch`;
  41 calls in `nw-underfetch`; the three-level B-tree for 6.4 crore rows; 9.6 crore rows a minute in
  `model-copy`; the ring arithmetic in every consistent-hashing figure; 8,671,204 mod 3 = 1; the $90 a month at
  10 requests a second in `gw-cost`.

## 6. The landing page and the example company

- **The Concepts card promises removed content.** `site.json` still describes Concepts as including "the patterns
  that come up in design after design, and specialised data such as maps, vectors and time series".
- **Zotato's size changes between articles.**

  | Quantity | Values used |
  |---|---|
  | Orders a day | 50 lakh (Sharding, Numbers to know) and 1 crore (payments, notifications, rider assignment, job scheduler) |
  | Daily users | 1 crore (most) and 2 crore (restaurants near me) |
  | Rider pings a second | 75,000 (rider assignment: 3 lakh riders every 4 s) and 2 lakh (Numbers to know, and its figure) |
  | Peak writes a second | "50,000" (Sharding) against orders at about 600 and status updates at about 3,000 (figure `nm-writes`) |

  Numbers to know also says rider pings "go to Cassandra", while rider assignment keeps the latest position in
  memory and sends only history to storage. Both are defensible, but a reader meets them as one company.
  A single table of Zotato's numbers, used by every article, would remove this.

## 7. The worked questions, at design level

File 33 checked the arithmetic. These are the points a senior interviewer would push on.

| Question | Remark |
|---|---|
| Job scheduler | The target is "started within 5 seconds, even at 9 pm", and 3 lakh payouts are due at 21:00:00. Claiming and queueing them in 5 seconds is shown; running them is not. Each payout calls a bank, so starting 60,000 a second means lakhs of executions in flight. The article should say that "started" means queued, or give the executor count. |
| Match ticket booking | `POST /line` returns a position at once, but people who join before noon are given random positions at noon, so no position exists yet when they join. |
| Live leaderboard | Already reported: the 2.5 lakh answers a second are the hard write and get one sentence. The natural answer is a log partitioned by player, with the uniqueness rule applied by the scorer. |
| Key-value store | Already reported: version vectors and conditional integer versions are both presented as the design. |
| Coding judge | Fairness depends on one sandbox per core. With 8 sandboxes on 8 cores the CPU-time measure holds; the article gives the machine count but not that rule. |
| Chat app | The registry-and-direct-delivery design is right. It does not say what stores the messages, and "one write that bumps the number and saves the message" depends on that choice. |
| IND vs PAK | Already reported: the origin estimate (1% of requests) against "once per edge per segment". |
| 10-minute grocery | The hold covers one item in the example; an order has about eight (file 33). |

The other fourteen hold up under the same reading. The strongest are the URL shortener, restaurants near me,
dating swipes and ad click counting: each finds the one non-obvious problem in its question and solves it
correctly.

## 8. Correction to file 33

File 33 said of the grocery question that the "2 km radius" in its "Senior" line appears nowhere else. The
figure `minutes-flow` does show "ride, about 2 km". The text still never derives it from the 10-minute budget, so
the remark stands in a weaker form, and file 33 is corrected.

## 9. Fix list, added to file 33's

| # | Fix | Size |
|---|---|---|
| 9 | Decide which removed concepts return; this review recommends four (section 2.3) | Owner's decision; the articles exist in git at `7f3df4c` |
| 10 | Repoint the redirects in section 2.2, and remove the chains | Twelve lines of `routes.json` |
| 11 | One capacity model for Practice, the canvas and Numbers to know, or stated machine sizes in each Practice problem (section 3.1) | Content and judge calibration |
| 12 | Practice 006 and 008: make the reference agree with the articles; 003 and 004: say what the problem leaves out | Four problems |
| 13 | Practice 010 and 006: fix the two sums (section 3.3) | Two sentences |
| 14 | Match-night timeline in `lab.json` (with the article and brief) | One description |
| 15 | `ca-client`: slot 12,393 on node C, or "say slot …" | One figure |
| 16 | Landing page Concepts card | One sentence |
| 17 | One table of Zotato's numbers, applied across articles | An editing pass |
| 18 | Canvas: offer cache-aside, or explain why the cache is a proxy | Product decision |

## 10. What was and was not checked

Checked in this pass: the twelve removed concept articles in full; all ten Practice problems (statements,
requests, reference designs, wrong designs, editorials); both catalogues and the eight challenges; the extracted
text of every figure; the landing copy; cross-article consistency of the example company's numbers.

Not checked:

- The Practice and canvas simulators were not run; their verdicts are taken from the content files.
- Figures were read as text, not rendered.
- The reference and wrong designs inside the 22 worked questions' practice blocks were read for their briefs,
  estimates and decisions, not simulated.
- The Shopify, Spotify and Meta case studies remain unverified against their sources (file 33, section 7).
- Concept pages older than the last 50 commits.
