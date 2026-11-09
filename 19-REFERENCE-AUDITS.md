# 19 — Reference audits (Concepts groups built from a reference page)

How these audits work: the reference page is read in full and split into its paragraphs, list items, table rows,
code blocks and figures (one line each). Every line is checked against our articles and marked covered (with where),
covered differently (same point, our own example), or a gap (then filled in our own words). A second pass reads our
articles on their own for mistakes, contradictions with older articles, and figures that don't match the text.
The reference site is not named on Tech Katta; here it is "the reference page".

## Caching (CONCEPT // 49–53, PR #262; audit fixes in PR #264)

Reference: 164 lines (4 intro, 4 sections on where to cache, 4 patterns, 4 eviction policies, 3 problems, the
interview method in 5 steps, conclusion) and 9 figures.

| Reference section | Lines | Where it is on Tech Katta | Result |
|---|---|---|---|
| Intro: reads, 50 ms vs 1 ms, disk vs memory, costs | 1–4 | cache-step: "Why memory is so much faster", ca-why | covered (numbers made consistent, see fix 1) |
| Where to cache: intro, many layers | 5–8 | where-to-cache: "Many layers", ca-layers | covered; adds the database's own buffer cache |
| External cache | 9–14 | where-to-cache: "A shared cache over the network", ca-external | covered |
| CDN: what, providers, 5 steps, 250–300 ms vs 20–40 ms, when to propose | 15–27 | where-to-cache: "A CDN, at the edge", cdn-edge | covered (Virginia → Pune, Mumbai edge) |
| Client-side: device, client libraries (cluster slot map), limited control, offline app, browser | 28–33 | where-to-cache: "On the device", ca-client | covered |
| In-process: memory, faster than Redis, 6 uses, not shared, only after Redis | 34–47 | where-to-cache: "Inside the server process", ca-in-process | covered (all 6 uses) |
| Patterns intro | 48–49 | cache-patterns dek | covered |
| Cache-aside: 3 steps, lean, miss cost, remember this one | 50–59 | cache-patterns, cache-aside fig, code block | covered; adds delete-on-write and code |
| Write-through: mechanics, needs a library, Redis doesn't, slow writes, pollution, dual-write, when | 60–68 | cache-patterns, ca-write-through | covered |
| Write-behind: async batches, loss on crash, analytics | 69–74 | cache-patterns, ca-write-behind | covered; adds "never for orders" |
| Read-through: proxy, pairs with write-through, CDN is one, rarely proposed | 75–82 | cache-patterns, ca-read-through | covered |
| Eviction: LRU, LFU, FIFO, TTL | 83–96 | cache-eviction, ca-evict, ca-ttl | covered; adds Redis sampling, LFU decay, scan weakness, noeviction default (fix 3) |
| Problems intro | 97–98 | cache-problems dek | covered |
| Stampede: definition, 60 s feed at 12:01:00, coalescing, warming (only with TTL) | 99–106 | cache-problems, ca-stampede, probabilistic early expiry (more) | covered |
| Consistency: window, profile photo, no perfect fix, 3 strategies | 107–114 | cache-problems, ca-stale (price instead of photo) | covered; adds delete-vs-update and the delete race (fix 2) |
| Hot keys: one node, celebrity profile, replicate / local / rate-limit, pattern link | 115–124 | cache-problems, ca-hot-key, hot-key-merge (cricket-final banner) | covered |
| When to bring caching up: 4 reasons with numbers | 125–134 | cache-step: "When to bring it up" (Zotato numbers) | covered |
| How to introduce: 5 steps, keys, cache failure, circuit breakers, stampede, pick one or two, senior level | 135–159 | cache-step: table + five-step list; cache-problems "When the cache goes down" | covered (write-through / write-behind choice added in #262) |
| Conclusion: when, trade-off, interviews, don't cache everything | 160–164 | cache-step dek, "When not to cache", "In an interview" | covered |

Figures: External caching → ca-external · CDN caching → cdn-edge · Client-side → ca-client · In-process →
ca-in-process · Cache-aside → cache-aside · Write-through → ca-write-through · Write-behind → ca-write-behind ·
Read-through → ca-read-through · Stampede → ca-stampede. Extra figures of ours: ca-why, ca-layers, ca-evict, ca-ttl,
ca-stale, ca-hot-key.

Second-pass findings (fixed in #264):
1. cache-step said a Postgres read takes "tens of milliseconds" and a cache is "30 to 50 times" faster, while the
   older Caches component says 5 ms against about 1 ms. Now: a few ms when the row is in memory, tens of ms with
   joins or disk under load, so 5–50×; the dinner example uses 10–30 ms.
2. Delete-on-write has a known race (a slow reader puts the old value back after the delete). Added a "Go deeper"
   with the TTL as safety net, a delayed second delete, and versioned values.
3. Redis's default maxmemory-policy is noeviction (refuses writes when full); a cache must set allkeys-lru/lfu.
   Added to cache-eviction.
No figure mismatches found; all 13 figures checked as stills (desktop, phone) and animated.

## Sharding (CONCEPT // 54–57, PR #265)

Reference: 143 lines and 3 figures.

| Reference section | Lines | Where it is on Tech Katta | Result |
|---|---|---|---|
| Intro: scale up, the ceiling (Aurora 256 TiB), split across machines, terms | 2–7 | shard-step: "Why one machine stops being enough", sh-ceiling, note on words | covered |
| Partitioning: one instance, 500M rows/2 TB example, maintenance, horizontal vs vertical | 8–14 | partition-and-shard, sh-partition, sh-vertical (50 crore rows, 2 TB) | covered |
| What sharding is; each shard standalone; new problems | 15–21 | partition-and-shard: "Sharding", sh-shards | covered |
| Two decisions | 22–25 | shard-strategies: "Two decisions" | covered |
| Shard key: cardinality, even spread, query alignment; good/bad examples | 26–38 | shard-strategies: key section, shard-key fig, Zotato key table | covered (customer_id, order_id, is_veg, created_at, city) |
| Range sharding, multi-tenant | 41–49 | shard-strategies, sh-range | covered |
| Hash sharding, % N, resharding, consistent hashing, the default | 50–60 | shard-strategies, code block, sh-hash-mod | covered |
| Directory sharding, flexibility, lookup cost, SPOF, rarely the answer | 61–72 | shard-strategies, sh-directory | covered |
| Hot spots: celebrity, time, detection, dedicated shard, compound key, splitting (MongoDB, Vitess) | 75–85 | shard-problems, hot-shard | covered (+ DynamoDB splitting, cache note) |
| Cross-shard queries: 64 shards, cache, denormalise, accept rare, a signal to rethink | 86–95 | shard-problems, sh-scatter | covered (+ precompute) |
| Consistency: single-DB txn, 2PC, avoid by key, sagas (transfer), eventual, TLDR | 96–108 | shard-problems, sh-transfer, code block | covered |
| Modern databases: Cassandra, DynamoDB, MongoDB, Vitess, Citus, Aurora, Spanner; what to say | 109–117 | shard-strategies: "How databases do it for you"; shard-step: "You rarely build it yourself" | covered |
| When to mention: storage, writes, reads; formula; premature sharding | 118–132 | shard-step: "When to bring it up" (Zotato numbers) | covered |
| What to say: 4 steps with 64 shards | 133–139 | shard-step: table + four-step list | covered |
| Conclusion | 140–143 | shard-step dek and "In an interview" | covered |

Figures: Sharding → sh-shards · Hot spots → hot-shard · Cross-shard operations → sh-scatter. Extra figures of ours:
sh-ceiling, sh-partition, sh-vertical, sh-range, sh-hash-mod, sh-directory, sh-transfer.
Checked against older articles: the Sharding component (customer_id key, buckets, hot-shard on match night) and
"When one database isn't enough" (orders by city for local queries) — consistent; the city example is framed as
"bad on its own" for users, which matches the data-modelling article's note that huge cities need a finer key.

## Consistent hashing (CONCEPT // 58–60, PR #266)

Reference: 116 lines and 8 figures.

| Reference section | Lines | Where it is on Tech Katta | Result |
|---|---|---|---|
| Intro: what it is, too academic elsewhere | 2–4 | hashing-step dek | covered |
| Example: one DB, growth, sharding, which DB? | 5–16 | hash-ring: "From one database to several", ch-shard-events (cricket match tickets) | covered |
| Modulo hashing, code, 3-DB example | 17–30 | hash-ring: code block, ch-modulo | covered |
| Adding a 4th DB moves most data; removing one does too | 31–44 | hash-ring list, ch-mod-change (4 of 6 move; 3 of 6 move though none lived on the lost DB) | covered |
| The ring: 100 points, 4 DBs at 0/25/50/75, clockwise, real range 2³² | 45–51 | hash-ring: "The ring", ch-ring | covered |
| Add DB5 at 90: 15%, 60% of DB1 | 52–60 | hash-ring: "Adding a database", ch-ring-add | covered |
| Remove DB2: keys to DB3, DB3 doubles | 61–69 | hash-ring: "Removing a database", ch-ring-remove | covered |
| Virtual nodes: names, failure spread, adding spread, more = more even | 68–80 | hash-ring: "Virtual nodes", hash-vnodes, ch-vnodes-fail | covered (+ weighting, Cassandra's default of 16) |
| Hot spots: replicas, salting, adaptive; structural vs workload | 81–87 | ring-in-practice: "Hot spots", ch-salt | covered |
| Data movement in practice: replication, DynamoDB 3 AZs, Cassandra N nodes, planned changes only | 88–91 | ring-in-practice: "Moving data in practice", ch-replicas | covered; the reference says DynamoDB uses "a consensus algorithm like Raft", we say Paxos-based, which is what DynamoDB uses |
| Real world: any cluster; Cassandra, DynamoDB, CDNs; Redis Cluster slots | 92–98 | ring-in-practice: "Where it is used", "Fixed slots instead of a ring", redis-slots, ring-vs-slots table | covered (+ load balancers, Kafka partitions) |
| When to use in an interview: most just mention; infra questions; 5 things to explain | 99–111 | hashing-step | covered |
| Conclusion; the term is used loosely (DDIA) | 112–116 | hashing-step: "The name is used loosely" | covered |

Figures: Client–Server–Database and Sharding → ch-shard-events · Modulo hashing → ch-modulo · Issue adding a node and
Issue removing a node → ch-mod-change · Ring with DB5 added → ch-ring-add · Ring with DB2 removed → ch-ring-remove ·
Virtual nodes → hash-vnodes and ch-vnodes-fail. Extra: ch-ring, ch-salt, ch-replicas.
Checked against the older "Hash rings" concept (4→5 servers moves 4 in 5 with % N; vnodes; fixed slots) — consistent.

## CAP theorem (CONCEPT // 61–63, PR #267)

Reference: 83 lines and 2 figures.

| Reference section | Lines | Where it is on Tech Katta | Result |
|---|---|---|---|
| Intro | 2–3 | cap-step dek | covered |
| C, A, P definitions; not ACID's C; P is a must; one choice | 4–11 | cap-step: "The three letters", "Why it's really one choice" | covered |
| Example: two servers, rename, partition, option A/B, stale is better | 13–27 | cap-step: Mumbai–Singapore rename, cp-replicate, cp-partition | covered |
| When to choose consistency: tickets, inventory, finance | 29–33 | cap-step (seat 14 block C, last plate, wallets/trading), double-accept | covered |
| When to choose availability: social, content, reviews; eventual consistency | 34–38 | cap-step (photos, dish descriptions, hours/ratings) | covered |
| The key question | 39 | cap-step, cp-choose | covered |
| In the interview: functional, non-functional, CAP first | 40–45 | cap-step: "Where it goes in the interview" | covered |
| If consistency: distributed transactions, single node, technologies | 46–52 | cap-designs: "If you choose consistency" | covered (+ etcd/ZooKeeper, how Spanner does it) |
| If availability: replicas, CDC, technologies; configurable | 53–60 | cap-designs: "If you choose availability", "Most databases let you choose", cp-designs, quorum-split | covered (+ Cassandra levels, DynamoDB ConsistentRead, MongoDB concerns, Postgres sync replicas) |
| Advanced: per-feature, Ticketmaster, Tinder, interview sentences | 61–74 | cap-per-feature: "Both, in one system", cp-per-feature, cap-split | covered (cricket tickets; dating app is our own Q08 too) |
| Levels: strong, causal, read-your-writes, eventual (DNS, default) | 75–80 | cap-per-feature: "Levels of consistency", table, consistency-timeline | covered |
| Conclusion: important, one question | 81–83 | cap-per-feature: "The one question" | covered |

Figures: Basic replication → cp-replicate · Network partition → cp-partition. Extra: cp-choose, cp-designs,
cp-per-feature, plus reused cap-split, double-accept, quorum-split, consistency-timeline.
Checked against "CAP and PACELC in practice" and "Consistency models": same definitions; this group links to both
for PACELC and for how to obtain each level.

## Second pass over Sharding, Consistent hashing and CAP (PR #268)

Read on their own and against older articles, after the line-by-line coverage above.
1. Conflict: Zotato's orders were sharded by city in "When one database isn't enough" (data modelling, #261) and by
   customer_id in the Sharding component and the Sharding group. Both are now presented as defensible, tied to which
   queries dominate (live operations → city; history → customer), with links both ways.
2. Overclaim: "one primary can't take 50,000 writes a second, however big" → "more than one primary can sustain with
   headroom", since a large primary can take simple writes at that rate.
3. DynamoDB placement: described as a ring in one place and as fixed partitions in another. Now consistently: hashed
   to internal partitions that split as they grow; the ring belongs to its ancestor, the Dynamo paper.
Facts checked and kept: Aurora's 256 TiB limit; Cassandra Murmur3 + vnodes (default 16 since 4.0); MongoDB range
chunks over the hash with a balancer; Vitess resharding is operator-driven; Redis Cluster 16,384 slots via CRC16;
Cassandra QUORUM reads + writes see the latest write; DynamoDB eventually consistent reads cost half;
Spanner's synchronised clocks and consensus.

## Database indexing (CONCEPT // 64–67, PR #270)

Reference: the page is public only up to the start of its LSM section (lines 2–58: intro, how indexes work, cost,
B-trees). Everything after (LSM trees, hash, geospatial, inverted, composite, covering) is behind the reference site's
paid wall; only headings are visible. Those topics were written from general knowledge; the paid text was not accessed.

| Reference section (public) | Lines | Where it is on Tech Katta | Result |
|---|---|---|---|
| Intro: scanning millions of rows, library analogy, why indexes, interview depth by level/role | 2–7 | index-step: "Why indexes matter" | covered (phone login over 5 crore users) |
| Heap file, pages, disk → memory, scan vs index path, prefetch/caching, SSD random vs sequential | 8–16 | index-step: "How data sits on disk", ix-scan | covered |
| Cost: space, writes, when indexes hurt (logs, tiny tables), memory overblown, monitor usage | 17–21 | index-step: "What an index costs", ix-cost | covered |
| Types intro; B-tree structure, 4 rules, 8 KB pages, id 350 in 2–3 reads | 22–35 | btree-index, btree-path, ix-btree-find | covered (+ splits, ix-btree-split) |
| Real-world: PostgreSQL PK + UNIQUE create two B-trees, DynamoDB sort key/LSM, MongoDB B+ tree | 36–48 | btree-index: "Where you'll meet them", code block | covered (+ InnoDB clustered index) |
| Why B-trees are the default (5 reasons), safe bet | 49–56 | btree-index: "Why B-trees are the default" | covered |
| LSM motivation: millions of metrics a second | 57–58 | lsm-and-hash: "When writes pour in" | covered |
| Paid sections (headings only) | — | lsm-and-hash, special-indexes | written from general knowledge |

## Numbers to know (CONCEPT // 68–70, PR #271)

Reference: public only for its introduction and "Modern hardware limits" (10 paragraphs). The sections on caching,
databases, application servers, message queues, the cheat sheet, common mistakes (premature sharding, overestimating
latency, over-engineering for writes) and costs are behind the reference site's paid wall; only headings are visible.
Those were written from general knowledge; the paid text was not accessed.

| Reference section (public) | Where it is on Tech Katta | Result |
|---|---|---|
| Hardware moves fast; textbooks quote old limits; book knowledge shows; decisions depend on current numbers | numbers-step: "Why the numbers you learned may be wrong" | covered |
| Compute and memory: m6i.32xlarge 128 vCPU/512 GiB, x1e.32xlarge ~4 TB, u-24tb1.metal 24 TB | numbers-step, nm-machine | covered |
| Storage: i3en.24xlarge 60 TB SSD, d3en.12xlarge 336 TB HDD, S3 unlimited | numbers-step, nm-machine | covered |
| Network: 25 Gbps, 50–100+, cross-AZ bandwidth, latency <1 ms / 1–2 ms / 50–150 ms | numbers-step, nm-latency | covered (+ India–US ~200 ms) |
| Step change; "split at 100 GB", "avoid large objects in memory" are outdated | numbers-step | covered |
| Paid sections (headings only) | numbers-components, numbers-mistakes, nm-capacity, nm-shard-math, nm-writes | written from general knowledge |

Consistency fix: "Back-of-envelope maths" (estimates) now says writes are several thousand a second on a mid-sized
database and around 10,000 on a large one, and memory reaches terabytes on memory-optimised machines, matching this group.
