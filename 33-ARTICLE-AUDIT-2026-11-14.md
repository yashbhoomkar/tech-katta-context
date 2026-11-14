# 33 — Article audit of production (2026-11-14)

A system design review of every article that production serves. Nothing in the application was changed: this file
is the whole output. Fixes are listed in section 8 for a later session.

How it was done: all 54 article files at the production release were read in full (prose, tables, code blocks,
captions and the "Go deeper" sections), every estimate was recomputed, and technical claims were checked against
what the reviewer knows of each system. For the 22 worked questions, the article was also compared with the brief
and estimates of its own practice tests. Limits are in section 7.

## 1. What production is running

Checked 2026-11-14, 14:32–14:39 UTC (about 20:05 IST).

| Part | What is live | How it was checked |
|---|---|---|
| API and content (`tech-api.katta.cc`) | Release `20261114T135654Z-3bd3c41`: commit `3bd3c41` (#363, "Concepts: keep the nine core articles, remove the other twelve"), the head of `main` | `GET /health`, `GET /v1/articles` |
| Frontend (`tech.katta.cc`, Vercel) | Deployment `dpl_5aZfsin11wUJ9WesPvaF4sCtVKAK`: commit `f2e3d40` (#358) | Vercel: the deployment that holds the `tech.katta.cc` alias |
| Articles served | 54: Concepts 9, Components 10, Interview Questions 29 (7 guides + 22 worked questions), Real systems 6 | `GET /v1/articles`, equal to `content/articles/index.json` at `3bd3c41` |

**The frontend is five commits behind `main`.** #359, #360, #361, #362 and #363 are merged, and the API deployed
them, but Vercel has no deployment for any of them, in any state. 27 frontend files differ between `f2e3d40` and
`main`. The cause was not found from here (the repository's `vercel.json` has no skip rule). Seen effects:

- The canvas work of #359–#362 (checks while building, undo and redo, minimap, replay animations, "walk me through
  it", Mermaid and SVG export, the credit meter) is not on the site.
- The 308 redirects that #363 added for the twelve removed concept addresses are not live.
  `/dashboard/concepts/real-time-updates/` and `/dashboard/concepts/contention/` answer 200 with the app shell
  instead of redirecting, and the API no longer has those articles.
- Articles still render, because the older frontend still contains every figure the remaining articles use.

The audit below is of the content at `3bd3c41`, which is what the API serves.

## 2. Verdict

The library is in good shape technically. The arithmetic is right almost everywhere: every estimate in the 22
worked questions was recomputed and all of them hold, including the base-62 examples in the URL shortener and the
operational-transform positions in the shared editor. The articles consistently teach sound judgement (prove the
need with a number, prefer the boring choice, name the cost), and the dated product facts checked are current
(Kafka 4.0 and KRaft, Redis licensing, Cassandra 4.0 tokens, Aurora's 256 TiB, the AWS instance sizes).

What needs attention, most important first:

1. **Two factual errors** (section 3): DynamoDB's storage engine, and the timeline of the India v Pakistan match.
2. **Six references that point at pages that do not exist** (section 4), four of them left behind by #363.
3. **The Concepts section no longer covers seven topics the rest of the site depends on** (section 5): after #363
   nothing explains replication, queues, locking and isolation, real-time delivery, change data capture, or
   consensus, and the Patterns guide that the study plan sends people to is three bullets per pattern.
4. **Practice tests that are looser than the article they belong to** (section 6): six questions state a target in
   seconds and are then judged against minutes.
5. Smaller inaccuracies, internal contradictions and omissions, listed per article in section 9.

## 3. Factual errors

### 3.1 DynamoDB's storage engine (Database indexing)

The article says twice that DynamoDB's storage is LSM-based: "generally understood to be LSM-style rather than a
B-tree" (in "Where you'll meet them") and "by most accounts, DynamoDB's storage layer" (in the list of LSM users).
Amazon's own paper says otherwise. "Amazon DynamoDB: A Scalable, Predictably Performant, and Fully Managed NoSQL
Database Service" (USENIX ATC 2022) describes each storage replica as a write-ahead log plus a B-tree that holds
the key-value data. Both sentences should say B-tree, and DynamoDB should leave the LSM list. The DynamoDB
component article does not repeat the claim.

### 3.2 The India v Pakistan match (Design live streaming for IND vs PAK)

The 3.5 crore concurrent viewers on 14 October 2023 is real. The timeline around it is not. The article says the
toss was at 7 pm and the peak came "in the last over at 10:18 pm (the real record … as reported by the
broadcaster)". That match was a day-night game that started at 2 pm IST, and India finished the chase at about
8 pm with nearly twenty overs left, so there was no close last over. The practice brief repeats the same timeline
("a jump at the 7 pm toss … the peak in the last over at 10:18 pm").

Two fixes work: keep the real figure and describe the night as an example rather than as that match, or use the
real times. Also, "the real record" has been passed since (5.9 crore for the World Cup final on 19 November
2023), so "a record at the time" is safer.

### 3.3 Smaller inaccuracies

| Article | Says | Should say |
|---|---|---|
| Sharding, "How databases do it for you" | "Aurora and Spanner offer distributed SQL with sharding built in." | Standard Aurora has one writer and is not sharded; only Aurora Limitless Database shards. Spanner and CockroachDB are the clean examples. |
| Sharding, "Transactions across shards" | Of two-phase commit: "Most production systems avoid it." | Application teams avoid running it themselves. Spanner, CockroachDB and similar databases run two-phase commit over consensus groups all day. |
| Numbers to know, caption of `nm-latency` | "Each step is roughly ten times the one before." | Memory to SSD is about 1,000 times, zone to zone about 3 times, zone to region 50 times or more. |
| Networking essentials, "TCP or UDP" table and "Choosing in a design" | In browsers, UDP is available "only through WebRTC". | HTTP/3 already runs on UDP in every major browser, and WebTransport gives pages datagrams. |
| Networking essentials, "Once connected" | Media is "encrypted end to end (DTLS and SRTP)". | True between two phones. With an SFU, which the next section introduces, encryption ends at the SFU unless an extra layer is added. |
| CAP theorem, Cassandra bullet | "with QUORUM on both reads and writes a read always sees the latest write". | It sees the latest *successful* write. A failed quorum write can still surface later, and concurrent writes resolve by timestamp. |
| CAP theorem, comparison table | Zotato's consistent features include "seat booking". | Zotato is food delivery; the row was carried over from the ticketing example. |
| Rider assignment, API | `POST /offers/#91/accept` | `#` starts a URL fragment, so this path cannot be sent as written. Use `/offers/91/accept`. |
| File storage and sync, out of scope | "Shared document editor, question 19" | The shared editor is QUESTION // 18; 19 is rider assignment. |
| Video streaming, out of scope | "see the IND vs PAK challenge" | It is a worked question (22), not a challenge. |

## 4. References to pages that do not exist

Found by searching every article for references to another article, then checking the target exists.

| Where | Text | Problem |
|---|---|---|
| Networking essentials, "Pushing updates" | "The Real-time updates concept compares polling, long polling, SSE and WebSockets" | Removed in #363 |
| Redis, "Go deeper: a lock in Redis" | "as the Contention concept explains" | Removed in #363 |
| Elasticsearch, "Keeping it in step with the database" | "The Change data capture concept covers how." | Removed in #363 |
| Key-value store, "Where a key lives" | "see the consensus article" | No consensus article exists |
| Shared document editor, high-level design | "as in the consensus article" | No consensus article exists |
| How to answer, step 2 | "The Quick Notes page has the rest." | The page exists, but its four notes are one DRAFT and three PLANNED; only the numbers panel has content |

Related, not broken: the Interview Questions section declares a "Practice" group ("Shorter questions to try on
your own") that no article belongs to. The Questions guide says it lists "every worked question on the site" but
lists 21 and has no Hard section, so IND vs PAK is missing from it.

## 5. What the library no longer covers

#363 reduced Concepts to nine articles on the owner's instruction. This section does not question that decision.
It records what the other 45 articles still assume the reader can look up.

| Topic | Who relies on it | Where it is covered now |
|---|---|---|
| Replication: leader and follower, synchronous or not, failover, replication lag | Caching, CAP, PostgreSQL, URL shortener, almost every question | A paragraph each in CAP and PostgreSQL. No place explains failover or split brain. |
| Queues and asynchronous work: at-least-once delivery, visibility timeout, dead letters, backpressure | Notifications, job scheduler, coding judge, photo sharing, video | Kafka article (stream side only). The queue itself is one card. |
| Contention: isolation levels, optimistic and pessimistic locking, fencing | Ticket booking, grocery, payments, rider assignment, job scheduler | PostgreSQL lists the isolation levels in one bullet. Fencing appears in four articles (job scheduler, shared editor, Redis, ZooKeeper), each time as one sentence. |
| Real-time delivery at scale: connection gateways, registries, pub/sub fan-out | Chat, shared editor, leaderboard, rider assignment | Networking covers the wire protocols, not the fan-out. |
| Change data capture and the outbox | Elasticsearch, menu search, restaurants near me, CAP | Named in nine articles, explained in none. |
| Consensus (Raft, leader election, leases) | Key-value store, shared editor, ZooKeeper, DynamoDB | ZooKeeper explains its own protocol only. |
| Object storage and large uploads | File sync, photo sharing, video | The worked questions carry it well; no reference page. |

The Patterns guide is now the only page for seven of these, at three bullets each, and "How to prepare" gives
weeks 4 to 6 to it. The cheapest repair that respects the nine-concept decision is to grow the Patterns guide
into a proper page per pattern (a few hundred words and one figure each), or to fold the missing explanations
into the kept articles: replication and failover into CAP theorem, locking and isolation into Data modelling,
queues into Kafka in practice.

Smaller gaps inside kept articles:

- **API design**: no long-running operations (202 and a status resource), no conditional requests (ETag,
  `If-Match`) for lost updates, no OAuth for third parties, no webhooks.
- **Caching**: no negative caching for keys that do not exist (cache penetration).
- **Sharding**: no unique ID generation across shards, and resharding is one sentence.
- **CAP theorem**: the levels skip monotonic reads, although the caption of `consistency-timeline` shows a reader
  going backwards. "One source of truth" is presented as consistent without saying that failover to an
  asynchronous replica can lose acknowledged writes.
- **Numbers to know**: no availability table (what 99.9% means in minutes), and the conversion shortcuts live only
  in the Quick Notes panel.
- **Payments**: no chargebacks or disputes, and no authorise-then-capture, which the Temporal article uses.

## 6. Articles against their own practice tests

Each worked question has practice tests with a brief. In these, the brief or the pass condition disagrees with
the article.

| Question | The article says | The practice says |
|---|---|---|
| Coding judge | A verdict within 10 seconds, even in the last 15 minutes; 3 s of CPU per submission | Verdict saved within five minutes, fifteen in the rush; 2 s of CPU |
| Job scheduler | Started within 5 seconds of its time, even at 9 pm. A job may start twice, so the work must be idempotent | Run within a few minutes, fifteen when everything is due at once. "A job must never run twice" |
| Ticket booking | A hold is one short transaction and lasts 10 minutes | A hold "must be done within … half an hour when sales open at noon" |
| Video streaming | An upload is watchable within a few minutes | Transcoded within half an hour |
| Menu search | A price change is searchable within a minute | Within five minutes |
| Dating swipes | One right swipe in fifty completes a match, about 1 swipe in 150 | "About one swipe in ten" makes a match |
| Photo sharing | About 100 KB per photo viewed | About 50 KB |
| URL shortener | 3.5 lakh redirects a second at peak | 35,000 a second, explained as one region's share. This one is stated openly and is fine. |

The first five matter most. A learner who builds for the article's target is over-built for the test, and one who
passes the test has not met the requirement the article taught. Either the tests tighten, or each brief says
plainly that it uses a relaxed limit and why.

## 7. What was and was not checked

Checked:

- Every sentence of the 54 articles, at commit `3bd3c41`.
- Every estimate recomputed. All correct, apart from the items in sections 3 and 9.
- Version and limit claims: Kafka 3.0 and 4.0, Redis `EXPIRE … NX` and licensing, Cassandra tokens and tombstone
  thresholds, DynamoDB limits, PostgreSQL defaults, Temporal history limits, ZooKeeper session limits, API Gateway
  prices (the $6,800 a month example recomputes to $6,841), S3 and transfer prices, AWS instance sizes.
- Three case studies against the reviewer's memory of the source posts: Discord (2023), Slack (2017) and Figma
  (2019). The figures match.

Not checked:

- **Three case studies could not be verified**: Shopify (May 2026), Spotify (July 2026) and Meta ZGateway
  (September 2026). The source posts were not fetched, and the reviewer has no reliable knowledge of them. They
  are internally consistent and technically plausible. Someone should compare their numbers with the posts once.
- Figures were audited by their captions only; the drawings were not rendered.
- The reference designs, wrong designs and scoring of the practice tests were not reviewed, only their briefs and
  estimates. The ten problems under `content/problems2` are not articles and were not read.
- Nothing was tested in a browser.

## 8. Fix list, in order

| # | Fix | Size |
|---|---|---|
| 1 | Find out why Vercel stopped deploying after #358 and deploy `main`, so the #363 redirects and the canvas work go live | Operations |
| 2 | Database indexing: DynamoDB is B-tree based (two sentences) | Two sentences |
| 3 | IND vs PAK: correct or generalise the match timeline, in the article and the practice brief | A few sentences |
| 4 | Repoint or cut the six references in section 4; add IND vs PAK and a Hard table to the Questions guide | Six sentences, one table |
| 5 | The inaccuracies in section 3.3 | Ten small edits |
| 6 | Decide where replication, locking, queues, change capture and consensus are explained (section 5) | The largest item; needs the owner's choice |
| 7 | Align the five practice briefs in section 6 with their articles, or state the relaxed limit | Content and test calibration |
| 8 | Compare the Shopify, Spotify and Meta case studies with their source posts | Reading |

## 9. Every article

Verdicts: **Sound** means no change needed beyond anything noted; **Fix** means something is wrong; **Thin** means
correct but short of what the page promises.

### Concepts

| Article | Verdict | Notes |
|---|---|---|
| Networking essentials | Sound, three fixes | The best article on the site. Fix the broken reference, the UDP-in-browsers line and the end-to-end claim (sections 3.3, 4). "A layer 4 balancer is usually the better home" for WebSockets is stated as a rule; most production WebSockets sit behind layer 7 proxies that end TLS and check the token at the upgrade, so present it as a trade-off. It says to paginate "with a cursor, not page numbers" while API design says offset is acceptable for most problems. |
| API design | Sound | Gaps in section 5. |
| Data modelling | Sound | The six-step table gives "orders by city" as the shard choice, while the same article's "Keys to avoid" warns against keys with a few huge values and Sharding's table marks city "bad on its own". The text reconciles them; the table should too. The schema references a `riders` table it never defines. |
| Caching | Sound | Says Virginia to Pune is 250–300 ms; three other articles say about 200 ms for India to the US east coast. |
| Sharding | Fix | Aurora and two-phase commit (section 3.3). The read-throughput reason for sharding is weak next to the article's own advice that replicas and a cache solve reads. |
| Consistent hashing | Sound | Every number in the ring walk-through checks out. Kafka partitions are listed under fixed slots that keep movement bounded; adding partitions to a Kafka topic remaps keys, as the Kafka article correctly says. |
| CAP theorem | Sound, two fixes | Section 3.3, and the gaps in section 5. DynamoDB global tables have also offered a strongly consistent multi-Region mode since 2025; the article describes only the asynchronous one. |
| Database indexing | Fix | DynamoDB (section 3.1). Otherwise accurate, including the PostgreSQL index-only scan and visibility map detail. |
| Numbers to know | Sound, one fix | Instance sizes, prices and throughput figures are right. Fix the `nm-latency` caption. It gives "between regions: about 50 to 150 ms" and then India to the US at about 200 ms. |

### Components

| Article | Verdict | Notes |
|---|---|---|
| Redis | Sound, one fix | Broken reference. `ZREVRANGE` has been deprecated since Redis 6.2 in favour of `ZRANGE … REV`; it still works. |
| Elasticsearch | Sound, one fix | Broken reference. |
| Kafka in practice | Sound | Accurate throughout; the storage sum (3.6 TB) is right. Kafka 4.0 also added share groups, which give queue-style consumption and soften the queue-or-stream split this article draws. |
| Temporal | Sound | Limits and defaults are right. In the example workflow, nothing refunds the customer if `findRider` fails after `capturePayment`, in an article about compensations. |
| API gateways | Sound | The cost example is right. Says a managed gateway adds "around 10 ms"; the Technologies guide says "a few milliseconds". Uses an `analogy` block (as does How to answer) that `content/README.md` does not list among the block types. |
| Cassandra | Sound | |
| DynamoDB | Sound | In the key table, "one order by its ID" is served by a global secondary index, so that read is always eventually consistent. Worth a sentence, since reading an order just after writing it is the common case. |
| PostgreSQL | Sound | |
| Flink | Sound | |
| ZooKeeper | Sound | |

### Interview Questions: the seven guides

| Article | Verdict | Notes |
|---|---|---|
| System design interviews | Sound | |
| How to prepare | Thin | Weeks 4 to 6 depend on the Patterns guide (section 5). |
| How to answer | Sound | Promises "six steps" and numbers five; the clock figure has no time for step 2, the numbers. Quick Notes reference (section 4). |
| The core concepts in one page | Sound | |
| The technologies worth knowing | Sound | Gateway latency differs from the component article. |
| The patterns that keep coming back | Thin | Now the only page for seven patterns; three bullets each. |
| The questions, and what each one teaches | Fix | Omits IND vs PAK and the Hard group. |

### Interview Questions: the 22 worked questions

All estimates were recomputed and are correct unless noted.

| # | Question | Verdict | Notes |
|---|---|---|---|
| 01 | URL shortener | Sound | Model answer for the format. The alias-versus-counter collision is a detail most write-ups miss. |
| 02 | File storage and sync | Sound, one fix | Wrong question number (section 3.3). Tagged Easy; chunking, a change log and conflict copies make it a medium in most interviews. |
| 03 | Restaurants near me | Sound | Delivery zones instead of a radius is the right insight. |
| 04 | 10-minute grocery | Thin in places | "Senior" expects "the 10-minute budget worked backwards to a 2 km radius"; the figure shows a ride of about 2 km, but the text never does that calculation. The hold is shown for one item, but an order has about eight: it needs one transaction over all rows, taken in a fixed order to avoid deadlocks. The practice brief requires a retried order not to take stock twice; the article never mentions an idempotency key. |
| 05 | Match ticket booking | Sound | The random line before opening is well argued. Practice mismatch (section 6). |
| 06 | Photo sharing | Sound | |
| 07 | News feed | Sound | |
| 08 | Dating swipes | Sound | The one-row-per-pair fix is correct and well explained. The seen filter is sized for 10,000 profiles, which a user fills in 100 days at 100 swipes a day; it needs a growth plan. Practice mismatch on match rate. |
| 09 | Coding judge | Sound | The backlog arithmetic for the last 15 minutes is right. Practice mismatch (section 6). |
| 10 | Chat app | Sound | The message store is never named, though "split by conversation, numbered per conversation" is the whole storage design; say Cassandra or DynamoDB and how the next number is taken safely. |
| 11 | Notification service | Sound | The Indian SMS rules (DLT) are a good local detail. |
| 12 | Payment system | Sound | Gaps in section 5. |
| 13 | Job scheduler | Sound | Practice mismatch (section 6). |
| 14 | Web crawler | Sound | |
| 15 | Live leaderboard | Thin in one place | Saving 2.5 lakh answers a second, each unique per player and question, is called "a simple append" and the store is not named. That is the hardest write in the design and deserves its own deep dive. |
| 16 | Ad click counting | Sound | Consistent with the Flink article; the hot-ad salting that keeps one user on one partition is correct. |
| 17 | Key-value store | Fix | Mixes two conflict models. The entity uses version vectors with siblings merged by the reader; the API shows an integer `version` and a conditional `if_version` write, which the text later admits needs a leader per slice. Pick one for the main design and present the other as the follow-up. Broken "consensus article" reference. |
| 18 | Shared document editor | Sound, one fix | Broken "consensus article" reference. |
| 19 | Rider assignment | Sound, one fix | The URL (section 3.3). |
| 20 | Video streaming | Sound | Practice mismatch (section 6). |
| 21 | Menu search | Sound | Practice mismatch (section 6). |
| 22 | IND vs PAK live streaming | Fix | Section 3.2. Also: the origin estimate assumes the CDN answers 99 in 100 requests (87,500 a second at the origin), while the design section says the origin is asked "about once per edge per segment", which with request collapsing and an origin shield is thousands a second at most. Say that 1% is the pessimistic planning case. The only worked question without the example box or a canvas link. |

Seventeen of the 22 are tagged Medium and one Hard. Payments, the key-value store, the shared editor, rider
assignment and ad click counting are asked as hard questions in most loops; the labels are worth a second look.

### Real systems

| Article | Verdict | Notes |
|---|---|---|
| Shopify: reservations in MySQL | Not verified | Technically sound (SKIP LOCKED, gap locks at REPEATABLE READ, lock order). Numbers not checked against the source. |
| Discord: Cassandra to ScyllaDB | Sound | Matches the 2023 post. |
| Slack: Kafka in front of Redis | Sound | Matches the 2017 post. |
| Figma: multiplayer | Sound | Matches the 2019 post. |
| Spotify: lookups from the data lake | Not verified | Source post is from July 2026. |
| Meta ZGateway | Not verified | Source post is from September 2026. |

The six case studies name their source by title and date but do not link to it.
