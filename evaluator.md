# The Evaluator: design and implementation specification (v2)

Written 2026-11-10 at the owner's request: "make our evaluator engine the best; take a step back and think how an
evaluator engine should work; think of the components the canvas should have; write the details in `evaluator.md`.
Another session will implement it."

**Status: specification only. Nothing in this file is built yet.** The current engine ("v1") is live and stays
untouched until a problem opts in to v2 (§12).

This file is written for the session that implements it. It is long on purpose: every data format, formula, rule,
constant and test vector you need is here, so that you never have to guess. Read §0 first.

---

## 0. How to use this document (implementer: read this first)

1. Read `17-SESSION-HANDOVER.md` (top section, §2, §3) and `12-OPERATING-RULES.md` in this repository before any
   work. Their workflow applies to every change you make: one PR at a time, the four required checks green,
   squash merge, verify production, record the ledger, update the docs. Never start automatic agents.
2. Then read this file from top to bottom once. Do not start coding from the middle.
3. Build in the order of §15 (phases). Each phase is one or more small PRs, each with its own acceptance list.
   **Do not skip ahead**: later phases assume the earlier ones exist.
4. v1 must keep working, byte for byte, for every problem that has not been converted. The rule that makes this
   safe: **v2 lives in new files; v1 files are changed only where §12 says so, and only by adding a dispatch.**
5. When this document does not decide something:
   - pick the simplest behaviour that agrees with the principles in §1;
   - write the decision as one line under "Decisions made during implementation" (§18);
   - add a unit test that pins it.
   Never leave a silent guess.
6. When this document disagrees with the code you find, stop and check which is right. The code on `main` wins for
   what v1 does today; this document wins for what v2 must do.
7. Every number marked *(starting value)* is a rule of thumb. Keep them in the catalogue file (§5.4), never in code,
   so they can be tuned without a code change.
8. Words used in a fixed sense (operation, step, plan, hop, binding, capability, test, fault, check, finding) are
   defined in §4. Use the same words in code, comments and user-facing text.

Do not put a model name, the owner's employer, or any credential in code, commits or this repository.

---

## 1. What the evaluator is for, and what "best" means

A learner opens a problem ("Design a URL shortener"), draws a design on the canvas (components, arrows, settings,
database schemas), writes a short answer (requirements, estimates, API, key decisions) and presses Run or Submit.

**The evaluator answers one question: would this design do the job, the way a production system would be judged?**
That question has five parts, and the evaluator must answer each with evidence:

| # | Part | Evidence the evaluator must produce |
|---|---|---|
| 1 | **Function**: does each API call return the right thing? | The call traced through the design, hop by hop, with the response compared to the expected one |
| 2 | **Scale and speed**: does it hold the load, fast enough? | Availability and latency percentiles per operation over a scripted period of traffic |
| 3 | **Resilience**: what happens when parts fail? | The same period replayed with faults (a zone lost, a database failing over, a dependency slow) |
| 4 | **Correctness under concurrency and failure**: can it double-charge, lose an order, show stale data, reorder messages? | Rule-derived findings, each with a concrete story of how it goes wrong |
| 5 | **Cost**: is the bill sensible? | A monthly bill by component: compute, requests, storage, data transfer |

### Principles (every design choice in this document follows from these)

- **P1. Behaviour, not resemblance.** A design is never compared with a model answer. Any design that behaves well
  passes. (v1 already does this; keep it.)
- **P2. One model.** The path an API call takes in the function test is the same path its load takes in the scale
  test. v1 has two unrelated models (a request tracer and an aggregate traffic simulator); v2 has one: the **plan**.
- **P3. Everything the learner sets must matter, and nothing matters that the learner cannot see.** No labels that
  earn points by being present (v1 "roles"). No hidden fixed numbers that settings cannot influence (v1 `fixed.hitPct`).
- **P4. The test owns the workload.** Traffic, the mix of operations, key popularity and faults come from the test.
  A design cannot pass by turning the load down.
- **P5. Deterministic.** Same design and same problem give the same result, in the browser and on the server, on
  every run. No randomness, no clock, no network.
- **P6. Explainable.** Every failed check names the moment, the component, the number, the cause and one thing to
  try next. A learner should learn from failing.
- **P7. Benefit of the doubt.** When a design can be read two ways, the evaluator picks the reading that works
  (the best feasible plan), then judges that.
- **P8. Cheap and fast.** Pure JavaScript, no dependencies, no AI calls. A whole Submit in well under a second on a
  phone. (The owner decided on 2026-11-07 that AI review of designs is not built: it would eat the margins.)
- **P9. Calibrated and tested against itself.** For every problem: the reference passes everything, every listed
  wrong design fails the test it names, and automatically generated mutants of the reference are caught (§14).
- **P10. Honest about its limits.** What the model ignores is listed (§17) and told to the learner where it matters.

---

## 2. Where v1 stands (what exists on `main` today)

You need this to understand what changes. Files are in `tech-katta/frontend/src/` unless said otherwise.

| Piece | File | What it does |
|---|---|---|
| Simulator | `lab/engine.js` | Steady-state fluid model. `simulate(design, lab, opts)` does one pass in topological order: offered load, `served = min(offered, capacity)`, latency `base / (1 − utilisation)`, retries by fixed point. `advance()` moves a run through simulated minutes: crash policy, cache warm-up, queue backlogs, autoscaling |
| Judge | `judge/judge.js` | `runTest()` plays one scenario in 5-minute steps and evaluates checks (`availability`, `p99`, `cost`, `noCrash`, `noLostWrites`, `requires`, `redundant`, `multiAz`, `has`, `role`). `judge()` runs all tests. `gradeAnswer()` grades the written answer. `score()` gives the mark out of 100 |
| Request tests | `judge/requests.js` | One API call traced through the design: finds a server, the databases it reaches, a table whose fields match, an access path from the engine and schema; runs the steps on sample data |
| Schema rules | `lab/schema.js` | What each database engine's schema can express, and its problems |
| Challenges | `lab/challenges.js` | The 8 star challenges (not problems); also `applyChallenge`, `chaosTarget`, `missingOnPath` used by the judge |
| Catalogue | `content/lab.json` | 8 component types (Clients, CDN, API Gateway, Load Balancer, Server, Queue, Cache, Database with 9 engines), sizes, prices, crash policy, roles, traffic patterns |
| Problem data | `content/articles/interview-questions/<slug>.json`, key `practice` | `fixed`, `start`, `tests`, `rubric`, `data`, `hints`, `reference`, `wrong` |
| Server re-judge | `backend/src/auth/judge-worker.js`, `judge-pool.js`, `routes.js` | `POST /v1/me/submissions` runs `judge(design, lab, practice)` again on a worker thread and stores the result only |

### The limits of v1 that v2 removes

1. **One anonymous stream of "requests".** Reads, writes and different endpoints are not told apart. A server sends
   `queriesPerRequest` queries to every kind of thing it points at. A read path and a write path cannot differ.
2. **Two models that do not know each other.** The request test knows about tables and indexes but not load; the
   traffic test knows about load but not what a query costs. A full table scan and a key lookup cost the same.
3. **Roles are labels.** "Geo index", "WebSocket gateway" and 25 others change nothing in the simulation; a check
   only looks for the label on the path.
4. **Hidden fixed numbers.** Cache hit %, write %, CDN hit % and queries per request are fixed by the problem
   (`practice.fixed`). The learner's cache size or TTL cannot change the hit rate.
5. **Latency is a mean with a rule of thumb for p99** (`base + 4.6 × (mean − base)`), worst 5-minute step only, one
   number for the whole system, and one database round trip however many queries are made.
6. **Failures are only "crash the busiest component of a type".** No zone outage, no slow dependency, no timeouts,
   no poison messages, no hot key.
7. **No data correctness.** Double charges, lost updates, stale reads, reordering and duplicate processing are only
   asked about in multiple-choice "key decisions"; the design itself is never checked for them.
8. **No derived-data pipelines.** Nothing checks that a search index or a feed cache is ever filled.
9. **No data size.** Storage, growth, shard counts and data transfer cost nothing. (Video and photo designs are
   dominated by exactly these.)
10. **Known modelling faults**: two queues feeding the same workers each hand them full capacity; two databases of
    different engines behind one server share its queries; reads behind a queue are not tested.
11. **Eight component types.** Streams, pub/sub, real-time gateways, schedulers, stream processors, coordination
    services and third-party services are missing or are labels.
12. **Test strength is not measured.** Calibration checks the listed wrong designs only.

---

## 3. The decision: how an evaluator should work

### 3.1 Approaches considered

| Approach | Why not (or why) |
|---|---|
| Compare with a model answer (graph similarity) | Rejects valid designs. Breaks P1 |
| A checklist of parts ("has a cache", "has a queue") | Can be passed by decoration; no numbers. Breaks P3 |
| An LLM reads the design | Not deterministic, costs money per run, cannot be calibrated. Breaks P5, P8. (Owner's decision.) |
| Simulate every single request (discrete events) | 87.5 lakh requests a second for four hours cannot be simulated one by one; sampling makes results noisy. Breaks P5, P8 |
| Formal model checking of the protocol | Far too heavy for a canvas; needs a formal spec per design |
| **Compile the design into per-operation plans, simulate flows on them, analyse the plans with rules, judge by objectives** | **Chosen.** Deterministic and fast like v1's fluid model, but operation-aware; function, load and correctness all read the same plan |

### 3.2 The chosen architecture

Treat the design as a **program**, the problem's workload as its **input**, and the evaluator as a
**compiler plus a runtime plus a static analyser**:

```
                 problem (operations, entities, tests)        catalogue (components, engines, numbers)
                                │                                         │
   design ──► 1. COMPILE ───────┴─────────────────────────────────────────┘
   (nodes,      validate the graph
    arrows,     for every operation: find the best PLAN
    settings,   (route in, a handler, every data step bound to a store and an access path,
    schemas)     sync and async parts, copies of data and how they are fed)
                                │
                                ├──► 2. TRACE      run each operation once on sample data along its plan
                                │                  → response vs expected, hop list for "Watch"
                                │
                                ├──► 3. SIMULATE   for every load test: minute by minute, per operation,
                                │                  flows over the plans → utilisation, queues, crashes,
                                │                  latency percentiles, availability, staleness, cost
                                │
                                ├──► 4. ANALYSE    rules over the plans: retries and idempotency, durability,
                                │                  ordering, dual writes, hot keys, growth → findings
                                │
                                └──► 5. JUDGE      checks per test → verdict, score, feedback
```

The **plan** is the centre of everything. One plan per operation. It is a tree of **hops**; each hop is one call
to one design component, with how often it happens per request, whether the caller waits for it, and how much work
it costs the component. The trace walks it once with sample data. The simulator multiplies it by request rates.
The analyser reads its structure. Because all three use the same object, they cannot disagree (P2).

### 3.3 What the learner experiences (unchanged in spirit)

- Run plays the example tests; Submit plays all of them and grades the written answer.
- Each test shows pass or fail, with reasons. New: each operation has its own row (availability, p50, p99), there is
  a list of **findings** ("A retried payment charges twice…"), and any load test can be **replayed on the canvas**
  (scrub through the evening and watch which part goes red, and when).
- The Description tab lists the problem's **operations** (the API with its targets) instead of hidden fixed numbers.

---

## 4. Vocabulary

| Word | Meaning |
|---|---|
| **Design** | What the learner draws: `{nodes, edges}`. Same container as v1 |
| **Node** | One component on the canvas: `{id, type, name?, x, y, config}` |
| **Edge** | An arrow `{from, to, carries?}`: `from` calls (or feeds) `to` |
| **Catalogue** | The component types and all their numbers: `content/eval.json` (v2 part) plus `content/lab.json` (sizes, prices, engines, patterns already there) |
| **Entity** | A logical kind of data in a problem ("links", "orders"), with its size and sample rows |
| **Operation** | One thing the system must do: an API call, an event, or a scheduled job. Has a share of the traffic, steps, a response, and targets (SLO, consistency) |
| **Step** | One logical data action inside an operation: `get`, `query`, `put`, `update`, `tx`, `blob`, `sum`, `incr`, `rank`, `compute`, `publish`, `call` |
| **Capability** | Something a component can do for a step: `get`, `range`, `index`, `unique`, `cas`, `tx`, `geo`, `text`, `ttl`, `blob`, `scan`, `agg`, `counter`, `zset`, `cdc` (§5.3) |
| **Binding** | The decision "this step is done by this node, on this table, through this access path" |
| **Hop** | One call to one node inside a plan |
| **Plan** | The tree of hops for one operation on one design |
| **Handler** | The compute node that receives an operation and runs its steps (a Service, or workers for deferred steps) |
| **Sync / deferred** | The caller waits for a sync hop before answering; a deferred hop happens after the answer (behind a queue or stream) |
| **Copy** | An entity held in more than one store (database plus cache, database plus search index). Every copy has a **feed**: how it is kept up to date |
| **Test** | One entry of `practice.tests`: a **trace test** (one operation, function only) or a **load test** (traffic over time, optional faults, checks) |
| **Fault** | Something a load test breaks on purpose at a given minute |
| **Check** | One pass or fail condition of a test |
| **Finding** | A piece of feedback from the analyser: severity, story, fix |
| **Tick** | One step of simulated time (1 minute by default) |
| **Work unit** | The common currency of load. A node has a capacity in units a second; every hop costs units (a key lookup 1, a write 2, a scan many). See §5.5 |

---

## 5. Components: what the canvas should offer

### 5.1 How the list was chosen

A component earns a place on the palette when (a) the site's Concepts and Components articles teach it, (b) at
least two of the 33 problems need it to be told apart from what already exists, and (c) it **behaves differently
in the simulation**: different capacity unit, different failure, different guarantee. A thing that would only be a
label does not get a palette entry (P3).

v1 has 8 types. v2 has 16: the same 8 (with more settings that matter) and 8 new ones. Two v1 ideas go away:
**roles** (replaced by capabilities that come from how a component is configured) and **`fixed` settings**
(replaced by numbers derived from the design).

### 5.2 The palette

Groups are the palette headings. "Unit" is what its capacity is counted in. "Phase" says when it is built (§15).

| Group | `type` | Name on the palette | What it models | Unit | Phase |
|---|---|---|---|---|---|
| Edge | `client` | Clients | Where user traffic starts. In v2 its rate is set by the test, not by the learner | — | 1 |
| Edge | `external` | External service | A third party you call or that calls you: payment provider, SMS / push provider, a restaurant's billing system, "the web" for a crawler. Slow, rate-limited, sometimes down, not yours to scale | calls/s | 4 |
| Edge | `cdn` | CDN | Answers cacheable responses near the user; passes the rest on | req/s | 1 |
| Edge | `apigw` | API Gateway | Front door: routing, authentication, per-client rate limits | req/s | 1 |
| Edge | `lb` | Load Balancer | Spreads calls over healthy targets; sticky sessions for long connections | req/s | 1 |
| Compute | `server` | Service | Stateless application servers: handle operations, call stores and other services. The same type is a **worker pool** when it is fed by a queue or stream (palette preset "Workers") | work units/s | 1 |
| Compute | `realtime` | Real-time gateway | Servers that hold open connections (WebSocket, SSE) and push messages down them | connections, messages/s | 4 |
| Compute | `scheduler` | Scheduler | Fires jobs at times (cron, delayed tasks). Needs a leader lock to be highly available without firing twice | fires/s | 6 |
| Compute | `processor` | Stream processor | Stateful, windowed computation over a stream (counts per minute, top K, joins) with checkpoints | events/s | 6 |
| Data | `database` | Database (palette presets below) | Durable storage with an engine and a schema | work units/s, GB | 1 |
| Data | `cache` | Cache | In-memory store: look-aside cache in front of a database, or a primary store for counters, sorted sets, geo sets, locks | work units/s, GB | 1 |
| Messaging | `queue` | Queue | Work that can wait. Competing consumers, at-least-once, optional FIFO and dead-letter queue | messages/s | 1 |
| Messaging | `stream` | Event stream | A durable, ordered, partitioned log. Every consumer group gets every event; events can be replayed | messages/s | 4 |
| Messaging | `pubsub` | Pub/sub channel | Fire-and-forget fan-out to whoever is subscribed right now (not stored) | messages/s | 4 |
| Control | `coord` | Coordination service | Locks, leader election, small shared configuration (ZooKeeper / etcd style). Slow to write, always consistent | writes/s | 6 |
| Control | `workflow` | Workflow engine | Durable multi-step processes with retries and timers (optional; build last) | steps/s | 7 |

**Database palette presets.** One node type `database`, several palette entries that pre-select the engine family,
so learners find them by name: "SQL database" (PostgreSQL, MySQL), "Key-value store" (DynamoDB), "Wide-column
store" (Cassandra), "Document store" (MongoDB), "Search index" (OpenSearch), "Object storage" (S3), "Time-series
store" (InfluxDB), "Graph store" (Neptune). The engines, their sizes and prices already exist in `lab.json`
(`components[type=database].engines`); v2 adds capabilities and storage numbers per engine (§5.4).

**Not components, on purpose:**
- *Roles* such as "Geo index" or "Ledger": a store is a geo index because its schema has a geo index (capability
  `geo`), and a ledger because the operation's steps append to it in a transaction (capability `tx`).
- *A rate limiter*: it is an API Gateway setting (`rateLimit`), or steps (`incr` on a cache) when the problem is
  "design a rate limiter".
- *An ID generator, a Bloom filter, a transcoder*: these are steps (`compute`) inside operations.
- *Zones and regions*: a setting on each node (`zones`, `multiAz`), exercised by the `zoneDown` fault. Multi-region
  is out of scope for now (§17).

### 5.3 Capabilities

A step can only be bound to a node that offers the capability it needs. Capabilities come from the engine
(databases), from the node type (cache, queue…) and from the schema (an index must exist to be used).

| Capability | Meaning | Offered by |
|---|---|---|
| `get` | Read or write one item by its full key | Every database engine, cache |
| `range` | Items by key prefix, in sort-key order | postgres, mysql, mongodb, dynamodb (sort key), cassandra (clustering key), timeseries, opensearch |
| `index` | Lookup by a secondary index | postgres, mysql, mongodb, dynamodb (at most 2 fields), opensearch (every field) |
| `unique` | The store refuses a second item with the same value | postgres, mysql, mongodb (unique index); any engine on its primary key **only together with `cas`** |
| `cas` | Conditional write ("only if stock > 0", "only if absent") | postgres, mysql, mongodb, dynamodb, cassandra (lightweight transaction: costs 4× the work), cache |
| `tx` | Several writes that all happen or none | postgres, mysql, mongodb, dynamodb |
| `geo` | Items near a point | postgres, mysql, mongodb, opensearch (needs a geo index on the field); cache (a `geo` structure) |
| `text` | Full-text search | opensearch; postgres, mysql, mongodb (needs a text index) |
| `agg` | Sum or count over many rows in one query | postgres, mysql, mongodb, opensearch, timeseries |
| `scan` | Read a whole small table | postgres, mysql, mongodb, opensearch |
| `ttl` | Items expire by themselves | dynamodb, cassandra, mongodb, timeseries, cache, s3 (lifecycle) |
| `blob` | Large objects | s3 |
| `counter` | Atomic increment | cache, dynamodb, cassandra, postgres, mysql, mongodb |
| `zset` | Sorted set: top N, rank of one member | cache (a `zset` structure) |
| `cdc` | Emits a stream of its own changes | postgres, mysql, mongodb, dynamodb |
| `durable` | Survives a restart with everything acknowledged | every database engine; queue; stream; cache only with `persistence: "aof"` |

The existing `features` list of each engine in `lab.json` stays for the UI ("Good at"). `caps` in `eval.json` is
what the evaluator uses. Keep them consistent (a backend test must check that every `caps` entry that has a matching
feature id agrees with it).

### 5.4 The catalogue file: `content/eval.json`

A new file. It does not repeat what `lab.json` already has (sizes, hourly prices, engines' schema vocabulary,
traffic patterns); it adds what v2 needs. The API serves it inside `/v1/lab` as the key `eval` (§12.2).

```jsonc
{
  "v": 2,
  "tickMinutes": 1,              // tick for tests up to 6 hours
  "longTickMinutes": 5,          // tick for longer tests
  "retries": 1,                  // times a client retries a failed call
  "clientTimeoutMs": 10000,      // a call slower than this counts as failed
  "limits": { "nodes": 200, "hopsPerOperation": 400, "operations": 12, "ticks": 1500 },

  // Work units per step (§5.5). Starting values.
  "work": {
    "pass": 1, "handle": 1, "enqueue": 1, "consume": 1,
    "get": 1, "put": 2, "update": 2, "incr": 1, "rank": 2,
    "indexRead": 2, "indexWrite": 1, "geo": 5, "text": 5,
    "rowsPerUnit": 100,          // every 100 rows returned or added up cost 1 more unit
    "scanRowsPerUnit": 1000,     // scanning 1,000 rows costs 1 unit (minimum 5)
    "txFactor": 1.5, "casFactorCassandra": 4,
    "blobPerMB": 1, "cpuMsPerUnit": 10
  },
  "scanLimit": 50000,            // a table this small may be read whole
  "sortLimit": 10000,            // this many rows may be sorted in memory

  "engines": {                   // extends lab.json's engines, by id
    "postgres":   { "caps": ["get","range","index","unique","cas","tx","geo","text","agg","scan","counter","cdc","durable"], "storagePerGbMonth": 0.115, "maxStorageGb": 65536, "replicaLagSec": 1 },
    "mysql":      { "caps": ["get","range","index","unique","cas","tx","geo","text","agg","scan","counter","cdc","durable"], "storagePerGbMonth": 0.115, "maxStorageGb": 65536, "replicaLagSec": 1 },
    "dynamodb":   { "caps": ["get","range","index","cas","tx","ttl","counter","cdc","durable"], "storagePerGbMonth": 0.25, "maxStorageGb": null, "uniqueOnKey": true },
    "mongodb":    { "caps": ["get","range","index","unique","cas","tx","geo","text","agg","scan","ttl","counter","cdc","durable"], "storagePerGbMonth": 0.10, "maxStorageGb": 4096, "replicaLagSec": 1 },
    "cassandra":  { "caps": ["get","range","cas","ttl","counter","durable"], "storagePerGbMonth": 0.25, "maxStorageGb": null, "uniqueOnKey": true },
    "opensearch": { "caps": ["get","range","index","geo","text","agg","scan","durable"], "storagePerGbMonth": 0.135, "maxStorageGb": 3072, "refreshSec": 1 },
    "s3":         { "caps": ["get","blob","ttl","durable"], "storagePerGbMonth": 0.023, "maxStorageGb": null },
    "timeseries": { "caps": ["get","range","agg","ttl","durable"], "storagePerGbMonth": 0.10, "maxStorageGb": 16384 },
    "graph":      { "caps": ["get","index","durable"], "storagePerGbMonth": 0.10, "maxStorageGb": 65536 }
  },

  "components": [ /* one object per type, §5.6 */ ]
}
```

Every component object has these common fields, then its own (§5.6):

```jsonc
{
  "type": "stream", "name": "Event stream", "group": "Messaging",
  "desc": "…one or two plain sentences for the palette…",
  "like": "…an everyday Indian analogy, as on v1 components…",
  "aliases": ["kafka", "log", "kinesis"],
  "managed": false,          // true: the cloud runs it across zones; it throttles, never crashes
  "latencyMs": 5,            // base time of one call
  "settings": [              // drives the settings panel (§12.1); one object per setting
    { "key": "partitions", "label": "Partitions", "kind": "number", "min": 1, "max": 200, "default": 6,
      "help": "Order is kept inside a partition. A consumer group reads with at most one instance per partition." }
  ]
}
```

`settings[].kind` is one of `number` (`min`, `max`, `default`, optional `step`), `choice` (`options: [{id, label,
desc}]`, `default`), `bool` (`default`), `size` (pick from the type's `sizes`), `fields` (pick field names).
A node's `config` holds `{key: value}` for these. A missing or invalid value means the default (never an error).

### 5.5 Work units: one currency for load

v1 counts "requests a second" for servers and "queries a second" for databases, and every query costs the same.
v2 keeps those capacity numbers but reads them as **work units a second**, and makes each hop cost what it should:

| Hop | Work units |
|---|---|
| Passing a call on (CDN, gateway, load balancer), storing a message (queue, stream, pub/sub) | 1 |
| A Service handling one operation | `work.handle` (1) + `cpuMs / work.cpuMsPerUnit` for each `compute` step it runs |
| A worker taking one message | `work.consume` (1) + its `compute` steps |
| `get` by key | `work.get` (1) |
| Lookup through a secondary index | `work.indexRead` (2) + `rows / work.rowsPerUnit` |
| Range on the key or an index returning `rows` rows | 1 + `rows / work.rowsPerUnit` |
| Geo query, text query | `work.geo` (5), `work.text` (5), + `rows / work.rowsPerUnit` |
| Scan of a small table of `n` rows | `max(5, n / work.scanRowsPerUnit)` |
| `sum` over `m` matching rows | 1 + `m / work.rowsPerUnit` |
| `put`, `update` | `work.put` (2) + `work.indexWrite` (1) for every secondary index on the table |
| The same with a condition on Cassandra | × `work.casFactorCassandra` (4) |
| `tx` of several writes | (sum of the writes) × `work.txFactor` (1.5) |
| `incr`, `rank` | `work.incr` (1), `work.rank` (2) |
| `blob` put or get of `b` bytes | `max(1, b / 1e6 × work.blobPerMB)` |

So an `m5.large` Service still takes 600 a second of plain requests, and a `db.m5.large` still takes 2,500 key
lookups a second, but 2,500 lookups through an index that return 300 rows each cost 5 units each and it takes only
500 of those. **The access path now matters under load**, not only in the function test (P2).

### 5.6 Each component in detail

For each type: settings (key, default, range), capacity, base latency, price, what a fault does, and which arrows
are allowed. Numbers already in `lab.json` are reused from there; new numbers are *(starting values)*.

Allowed arrows are listed as "→ may point at". Anything not listed is refused by the canvas and by validation.

#### `client` Clients
- No settings in v2 problems (the panel says "The tests send the traffic"). `rps` and `pattern` in old designs are ignored.
- → may point at: `cdn`, `apigw`, `lb`, `server`, `realtime`, `database` (**only** engine `s3`: a direct upload or
  download with a signed address; the operation must also have a step on a Service that issues the address, see §7.5).
- Never crashes. No cost.

#### `external` External service *(phase 4)*
- A problem places it in the starting design and **locks** it (`practice.locked`): the learner cannot delete or
  change it. Settings come from the problem: `preset` (`payments`, `push`, `sms`, `email`, `partner`, `web`),
  `latencyMs` (default 300), `limitRps` (default 500), `errorPct` (default 0.5), `pricePerCall` (default 0).
- As a callee: Services call it (`call` step). Capacity `limitRps`; over it, calls are refused (it never crashes).
- As a caller: it is the source of operations with `source: "external"` (webhooks).
- → may point at: `apigw`, `lb`, `server`. May be pointed at by: `server`.
- Faults: `externalDown` (all calls fail), `slow` (latency × factor).

#### `cdn` CDN
- Settings: none the learner sets (hit rate is derived, §8.6). Capacity `limitRps` 20,000,000. Latency 5 ms.
- Price: `pricePer10k` (0.009) per 10,000 requests + `egressPerGb` 0.08 *(starting value)* for the bytes it sends.
- → may point at: `apigw`, `lb`, `server`, `database` (engine `s3` only: storage as the origin).
- Managed: never crashes, not affected by `zoneDown`.

#### `apigw` API Gateway
- Settings: `rateLimit` (choice: `off` default, `perClient`; with `perClientRps` number 1–10,000 default 100),
  `auth` (bool, default false; adds 2 ms).
- Capacity `limitRps` 10,000 (as v1), latency 10 ms, `pricePerMillion` 3.50. Managed.
- → may point at: `lb`, `server`, `realtime`.
- With `rateLimit: perClient`, the `abuse` fault's extra traffic is refused at the gateway (cost 1 unit each) and
  goes no further.

#### `lb` Load Balancer
- Settings: `sticky` (bool, default false; needed in front of `realtime` when clients reconnect).
- Capacity `limitRps` 100,000, latency 2 ms, price `hourly` + LCU as v1. Managed.
- Spreads calls evenly over the targets of each type that are up (health checks).
- → may point at: `server`, `realtime`, `apigw`.

#### `server` Service (and Workers)
- Settings: `size` (from `lab.json` sizes), `count` 1–50, `autoscale` (bool) with `maxCount`, `zones` (1, 2 or 3,
  default 1), `timeoutMs` (100–30,000, default 1,000: how long it waits for anything it calls), `callRetries`
  (0–3, default 0: retries of a failed downstream call), `breaker` (bool, default false: circuit breaker),
  `sandbox` (bool, default false: can run untrusted code; costs 20% of capacity).
- Capacity: `size.rps × instances running` work units a second, further limited by concurrency (§8.9, phase 5).
- Latency 20 ms per operation handled plus its `compute` steps.
- Price: `size.hourly × instances running × 730` a month.
- Faults: overload crash as v1 (`crash: {above: 1.5, minutes: 10, downMinutes: 5}`); `instanceCrash` (one instance
  gone for 5 minutes); `zoneDown` (loses `1/zones` of its instances for the fault's duration: all of them when
  `zones` is 1); `groupDown` (the whole node, as a bad deploy: down 5 minutes).
- → may point at: `server`, `cache`, `database`, `queue`, `stream`, `pubsub`, `realtime`, `external`, `coord`.
- It is a worker pool for every `queue` or `stream` that points at it.

#### `realtime` Real-time gateway *(phase 4)*
- Settings: `size` (reuse Service sizes; each size also has `connections` and `messagesPerSec`: t3.medium 10,000 /
  5,000; m5.large 25,000 / 12,000; m5.xlarge 50,000 / 25,000; c5.2xlarge 100,000 / 50,000 *(starting values)*),
  `count` 1–50, `zones`.
- Two capacities: open connections (`connections × count`) and messages a second (`messagesPerSec × count`).
  Utilisation is the larger of the two ratios.
- Faults as `server`. When instances are lost their connections drop and clients reconnect: for 1 minute the
  remaining instances receive the lost connections again as new `connect` operations.
- → may point at: `server`, `cache`, `database`, `queue`, `stream`, `pubsub`.

#### `scheduler` Scheduler *(phase 6)*
- Settings: `count` (1 or 2, default 1), `lock` (choice: `none` default, `lease`).
- It is the source of operations with `source: "schedule"`. Capacity 1,000 fires a second per instance.
- Rules (analyser, §10): `count: 1` → jobs are missed while it is down; `count: 2` with `lock: none` → every job
  fires twice; `count: 2` with `lock: lease` needs an arrow to a `coord`, a `database` with `cas`, or a `cache`.
- → may point at: `server`, `queue`, `stream`, `coord`, `database`, `cache`.

#### `processor` Stream processor *(phase 6)*
- Settings: `parallelism` 1–64 (default 2), `size` (Service sizes), `checkpointSec` (10–600, default 60).
- Consumes only from `stream`. Capacity `20,000 × parallelism` events a second *(starting value)*, never more
  instances reading than the stream has partitions.
- Runs `aggregate` steps (windowed counts and sums) and writes results to stores.
- After a crash it restarts from the last checkpoint: events since then are processed again (the analyser checks the
  sink is idempotent, §10).
- → may point at: `database`, `cache`, `stream`, `queue`.

#### `database` Database
- Settings from v1: `engine`, `size`, `multiAz`, `replicas` 0–5, `schema` (tables, key, sort key, indexes, TTL).
- New settings: `readFrom` (choice: `primary` default, `replicas`), `replication` (choice: `async` default, `sync`;
  sync adds 2 ms to every write and makes replica reads fresh), `shards` (1–64, default 1; instance engines only)
  with a `shardKey` chosen per table in the schema (new optional table field `shardKey: [field]`, default the key).
- `writePct` from v1 is **not used** in v2: the mix of reads and writes comes from the operations.
- Capacity (work units a second), with `q = size.qps`, `n = replicas`, `W` and `R` the write and read units offered:
  - `readFrom: primary`: primary load `W + R/(1+n)`; each replica `R/(1+n) + W` (replicas also apply every write).
    Utilisation = the larger of the two, divided by `q`.
  - `readFrom: replicas` (and `n ≥ 1`): primary `W`; each replica `R/n + W`. Utilisation as above.
  - Per-request engines (`capacity: "request"`): `limitQps` units; they throttle, never crash.
  - `shards: s`: a step that names the shard key goes to one shard, so capacity is `s ×` the above for those;
    a step that does not must ask every shard (its work is multiplied by `s`). Hot keys: §8.11.
- Storage: computed from the entities it holds (§8.12). Price = instance hours as v1 + `storagePerGbMonth × GB`.
- Faults: overload crash as v1 (`above 1.2` for 5 minutes → Multi-AZ fails over in 2 minutes, single-zone down 30);
  `crash` (forced); `zoneDown` (Multi-AZ: fails over; single-zone: down for the fault's duration, then back with
  its data). Engines with `multiAz: "builtin"` are not affected.
- → may point at: `stream`, `queue` (**change data capture**, needs capability `cdc`). Nothing else.

#### `cache` Cache
- Settings: `size` (v1 sizes; each also has `memoryGb`: cache.t3.medium 3, cache.m5.large 6, cache.r5.large 13
  *(starting values)*), `nodes` 1–10 (default 1: shards of a cluster), `replica` (bool, default false),
  `ttlSec` (1–604,800, default 300), `onDown` (`database` default, `fail`), `writePolicy` (`through` default,
  `back`), `persistence` (`none` default, `aof`), `structures` (a small schema, same editor as a database:
  `[{name, kind: "kv"|"counter"|"zset"|"geo"|"set", key: [field], fields: [{name, type}], ttl?}]`).
- Two uses, decided by the arrows:
  - **Look-aside cache**: it points at a `database`. Reads go to it first; misses go on to the database.
  - **Primary store**: an entity lives in one of its `structures` (a leaderboard in a `zset`, rider positions in a
    `geo`, a rate-limit counter in a `counter`).
- Capacity `size.ops × nodes` work units. Latency 1 ms. Price `size.hourly × nodes × (replica ? 2 : 1) × 730`.
- Hit rate: derived (§8.6). Warm-up after a restart as v1 (`warmupMinutes` 10).
- Faults: overload crash as v1; `crash`; `zoneDown` (with `replica`: fails over in 1 minute and keeps its data;
  without: down for the duration, then empty). `cacheFlush`: emptied at once.
- → may point at: `database`.

#### `queue` Queue
- Settings: `kind` (choice: `standard` default, `fifo`), `dlq` (bool, default false) with `maxReceives` (1–20,
  default 5), `visibilitySec` (1–43,200, default 30).
- Capacity: `standard` 100,000 messages a second; `fifo` 3,000 *(starting value)*. Latency 8 ms.
  Price `pricePerMillion` 0.40 (`fifo` 0.50). Managed, durable.
- All consumers compete: each message goes to one of them. At-least-once: a message can arrive twice.
- → may point at: `server` (its workers), `processor` is not allowed.

#### `stream` Event stream *(phase 4)*
- Settings: `partitions` 1–200 (default 6), `retentionHours` 1–720 (default 24), `keyField` (a field name, or
  empty: the field whose value picks the partition, so order holds per value of it).
- Capacity `10,000 × partitions` messages a second *(starting value)*. Latency 5 ms. Durable.
- Price: brokers `max(3, ceil(partitions / 50))` × $0.21 an hour × 730 + storage `0.10` per GB-month of retained bytes.
- **Every node it points at is its own consumer group and gets every message.** Inside one consumer node, at most
  `partitions` instances can read at once.
- Faults: `zoneDown` does not stop it (3 brokers over 3 zones).
- → may point at: `server`, `processor`, `realtime`.

#### `pubsub` Pub/sub channel *(phase 4)*
- Settings: `channels` (choice: `perKey` default, `global`).
- Capacity 100,000 messages a second per node. Latency 1 ms. Not durable: a subscriber that is down misses messages.
- `global`: every instance of every subscriber gets every message. `perKey`: only the instances that hold a
  subscriber for that key.
- → may point at: `realtime`, `server`.

#### `coord` Coordination service *(phase 6)*
- Settings: `nodes` (3 or 5, default 3). Capacity 1,000 writes a second, 20,000 reads. Latency 10 ms.
- Price: `nodes × $0.10` an hour. Survives `zoneDown` with 3 nodes (one per zone); 2 of 3 must be up.
- Offers `cas` and leases (locks, leader election). Not for data: storing an entity in it is refused.
- → points at nothing.

#### `workflow` Workflow engine *(phase 7, optional)*
- Build only if a converted problem needs it. A managed node that runs an operation's deferred steps in order with
  retries and timers, remembers progress durably, and calls Services for each step. Specify it in this file before
  building it.

---

## 6. The problem format (v2)

A problem is still the `practice` object of an Interview Question article. A v2 problem has `"v": 2`. Everything
the learner is graded on in writing (`rubric`, `hints`) is unchanged from v1. What changes: `fixed` and `data`
go away; `entities` and `operations` arrive; `tests` have two clear kinds.

### 6.1 Top level

```jsonc
"practice": {
  "v": 2,
  "brief": "One paragraph shown above the example tests: what the tests send.",
  "entities":   { /* §6.2 */ },
  "aliases":    { "long_url": ["url", "target_url", "destination"] },   // other names a learner may give a field
  "operations": [ /* §6.3 */ ],
  "start":      { "nodes": [], "edges": [] },      // the design a learner starts from
  "locked":     ["pay"],                           // optional: ids of nodes in `start` the learner cannot delete or edit
  "tests":      [ /* §6.5 */ ],
  "rubric":     { /* unchanged from v1 */ },
  "hints":      [ /* unchanged from v1 */ ],
  "referenceNote": "optional text under the solution design",
  "reference":  { "nodes": [], "edges": [] },      // must pass every test; never served inside the article
  "wrong":      [ { "name": "", "why": "", "fails": "<test id>", "nodes": [], "edges": [] } ],
  "mutantsAllowed": [ "remove:cache2" ]            // optional, §14.3
}
```

### 6.2 Entities

```jsonc
"entities": {
  "links": {
    "rows": 5000000000,            // how many exist at the problem's scale
    "rowBytes": 500,               // average size of one
    "growthPerDay": 100000000,     // optional, for storage findings
    "expires": false,              // optional: true = it must not be kept for ever (holds, sessions, counters; §10.8)
    "fields": { "code": "string", "long_url": "string", "user_id": "string",
                "created_at": "time", "expires_at": "time", "clicks": "int" },
    "sample": [ { "code": "ab12x", "long_url": "https://zotato.in/menu/123", "user_id": "u7",
                  "created_at": "2026-11-01T08:00:00Z", "expires_at": null, "clicks": 41 } ]
  }
}
```

Field types are those of `lab/schema.js` `TYPES` (string, text, int, float, bool, time, geo, json, list, blob).
`sample` rows are what trace tests run on (at least 2 rows per entity).

### 6.3 Operations

```jsonc
{
  "id": "redirect",                       // lowercase letters, digits, hyphens
  "name": "Open a short link",
  "kind": "read",                         // "read" | "write" | "connect" (opens a long-lived connection)
  "source": "clients",                    // "clients" (default) | "external" | "schedule"
  "request": { "method": "GET", "path": "/ab12x" },
  "share": 0.99,                          // its rate = the test's rps × this
  "bytesIn": 200, "bytesOut": 500,        // average request and response size (defaults 1000, 1000)
  "keys": { "entity": "links", "skew": "zipf",     // which items it touches and how popular they are: "zipf" | "uniform"
            "active": 50000000,                    // optional: how many different items get traffic (default: the entity's rows)
            "hot": 0 },                            // optional: share of calls that go to one single item (§8.11)
  "cacheable": { "ttlSec": 3600 },        // optional: a CDN may answer it for this long
  "live": false,                          // optional: true = old copies are useless (live video)
  "steps": [
    { "id": "s1", "op": "get", "entity": "links", "by": { "code": "ab12x" }, "fields": ["long_url"] }
  ],
  "respond": { "status": 302, "body": { "location": "$s1.long_url" } },
  "slo": { "availability": 99.9, "p99Ms": 200 },
  "consistency": { "maxStalenessSec": 60 },   // or "strong"; default: no requirement
  "effect": "once",                       // optional, writes: doing it twice is a bug (a charge, an order)
  "idempotencyField": "request_id",       // optional: the field that carries the caller's unique id for this call
  "durable": true,                        // optional, writes: once acknowledged it must never be lost
  "ordered": { "by": "conversation_id" }, // optional: effects for the same value must be applied in order
  "sessionSec": 600,                      // only for kind "connect": how long a connection stays open (§9.3)
  "sample": true                          // optional: its trace test is an example test
}
```

Rules:
- The `share` of all operations with `source: "clients"` must add up to 1 (± 0.001). Other sources may have any share.
- `kind: "read"` operations may only have reading steps (`get`, `query`, `sum`, `rank`, `blob` with `mode: "get"`,
  `compute`, `call`).
- At most `limits.operations` (12) operations.

### 6.4 Steps

Every step has `id` (unique in the operation) and `op`. Optional on every step: `times` (how many times per call,
default 1; may be a number such as 200 for "once per follower") and `timing`.

`timing` is `"sync"` (default: must be done before the response) or `"defer"` (may be done after the response)
with `withinSec` (default 60: how soon it must be done). Reading steps are always sync.

| `op` | Fields | Needs |
|---|---|---|
| `get` | `entity`, `by: {field: value}`, `fields` | A store holding the entity with a path by those fields |
| `query` | `entity`, `where?: {field: value}`, `near?: {field, at: [lat, lng], km}`, `text?: {field, q}`, `range?: {field, from, to}`, `order?: {field, desc?}`, `limit?`, `fields`, `matches?` (rows that match at the problem's scale; default = the sample's count) | As `get`, plus `range` / `geo` / `text` as used |
| `sum` | `entity`, `where?`, `range?`, `field`, `matches?` | `agg` |
| `put` | `entity`, `values: {field: value}`, `unique?: [field]` | A store for the entity; `unique` needs the store to enforce it |
| `update` | `entity`, `by`, `set?`, `add?`, `cond?: {field: {gte: n} | {eq: v}}` | Path by `by`; `cond` needs `cas` |
| `tx` | `steps: [put | update]` | One store with `tx` holding all their entities |
| `blob` | `entity`, `key: {field: value}`, `field`, `mode: "put" | "get"`, `bytes?` | `blob` |
| `incr` | `entity`, `by`, `field`, `ttlSec?` | `counter` |
| `rank` | `entity`, `order: {field, desc?}`, `limit` or `of: {field: value}` | `zset`, or `range`/`index` on the order field |
| `compute` | `cpuMs`, `isolated?: true`, `label` | A Service or workers (`isolated` needs `sandbox: true`) |
| `publish` | `audience: {avg, max?}`, `online?` (share online, default 1), `bytes?` | A path to a `realtime` node (§9.3) |
| `call` | `preset` (which external service), `label`, `idempotent?: true` (the third party ignores a repeated call; §10.4) | An arrow to an `external` node with that preset |

Values written as `"$s1.field"`, `"$s1"` or `"{$s1.code}"` inside text refer to earlier steps' results, exactly as
in v1 request tests.

### 6.5 Tests

```jsonc
// A trace test: one operation, once, on the sample data. Function only.
{ "id": "api-redirect", "name": "Open a short link", "desc": "A phone opens /ab12x.", "sample": true, "op": "redirect" }

// A load test: traffic over time, optional faults, checks.
{ "id": "peak", "name": "The evening peak", "desc": "35,000 requests a second for an hour at 8 pm.",
  "sample": true, "hours": 1, "startHour": 20,
  "traffic": { "rps": 35000, "pattern": "steady" },        // patterns are lab.json's client patterns, by id
  "faults": [ { "minute": 10, "kind": "zoneDown", "minutes": 15 } ],
  "checks": [ { "kind": "slo" }, { "kind": "noCrash" } ] }
```

- Every operation must have at least one trace test, and at least one trace test must be `sample`.
- At least one load test must be `sample`.
- `faults` and `checks` are specified in §8.13 and §11.1.
- v1's `chaos: [{minute, type}]` is accepted as an alias of `faults: [{minute, kind: "crash", type}]`.

### 6.6 A complete small example (the URL shortener, as it would look in v2)

Use this as the template when converting (§16). Numbers here are illustrative; calibrate when converting.

```jsonc
{
  "v": 2,
  "brief": "The tests send one region's share of the traffic: 35,000 requests a second at the evening peak, 99 opens for every new link. Popular links are opened far more often than the rest.",
  "entities": { "links": { "rows": 5000000000, "rowBytes": 500, "growthPerDay": 100000000,
      "fields": { "code": "string", "long_url": "string", "user_id": "string", "created_at": "time", "expires_at": "time", "clicks": "int" },
      "sample": [ { "code": "ab12x", "long_url": "https://zotato.in/menu/123", "user_id": "u7", "created_at": "2026-11-01T08:00:00Z", "expires_at": null, "clicks": 41 },
                  { "code": "q9Lp", "long_url": "https://katta.cc/a", "user_id": "u2", "created_at": "2026-11-02T08:00:00Z", "expires_at": null, "clicks": 3 } ] } },
  "aliases": { "long_url": ["url", "target_url", "destination", "original_url"], "code": ["short_code", "slug", "short_id"] },
  "operations": [
    { "id": "redirect", "name": "Open a short link", "kind": "read", "share": 0.99, "sample": true,
      "request": { "method": "GET", "path": "/ab12x" }, "bytesOut": 500,
      "keys": { "entity": "links", "skew": "zipf" },
      "steps": [ { "id": "s1", "op": "get", "entity": "links", "by": { "code": "ab12x" }, "fields": ["long_url"] } ],
      "respond": { "status": 302, "body": { "location": "$s1.long_url" } },
      "slo": { "availability": 99.9, "p99Ms": 200 }, "consistency": { "maxStalenessSec": 300 } },
    { "id": "create", "name": "Make a short link", "kind": "write", "share": 0.01,
      "request": { "method": "POST", "path": "/links", "body": { "long_url": "https://zotato.in/offers" } },
      "steps": [ { "id": "s1", "op": "put", "entity": "links", "unique": ["code"],
                   "values": { "code": "zx81q", "long_url": "https://zotato.in/offers", "user_id": "u7", "created_at": "2026-11-10T10:00:00Z", "expires_at": null, "clicks": 0 } } ],
      "respond": { "status": 201, "body": { "code": "$s1.code" } },
      "slo": { "availability": 99.9, "p99Ms": 500 }, "durable": true }
  ],
  "start": { "nodes": [ { "id": "clients", "type": "client", "x": 0, "y": 0, "config": {} },
                        { "id": "lb", "type": "lb", "x": 240, "y": 0, "config": {} },
                        { "id": "app", "type": "server", "x": 480, "y": 0, "config": { "size": "m5.large", "count": 2 } } ],
             "edges": [ { "from": "clients", "to": "lb" }, { "from": "lb", "to": "app" } ] },
  "tests": [
    { "id": "api-redirect", "name": "Open a short link", "desc": "A phone opens /ab12x and must be sent to the long address.", "sample": true, "op": "redirect" },
    { "id": "api-create", "name": "Make a short link", "desc": "A new link is stored and its code returned.", "op": "create" },
    { "id": "normal", "name": "A normal afternoon", "desc": "20,000 requests a second for an hour at 3 pm.", "sample": true,
      "hours": 1, "startHour": 15, "traffic": { "rps": 20000, "pattern": "steady" }, "checks": [ { "kind": "slo" } ] },
    { "id": "peak", "name": "The evening peak", "desc": "35,000 requests a second for an hour at 8 pm.", "sample": true,
      "hours": 1, "startHour": 20, "traffic": { "rps": 35000, "pattern": "steady" }, "checks": [ { "kind": "slo" }, { "kind": "noCrash" } ] },
    { "id": "zone", "name": "A zone goes dark", "desc": "At 8:10 pm one availability zone is lost for 15 minutes.",
      "hours": 1, "startHour": 20, "traffic": { "rps": 35000, "pattern": "steady" },
      "faults": [ { "minute": 10, "kind": "zoneDown", "minutes": 15 } ],
      "checks": [ { "kind": "slo", "availability": 99.5 }, { "kind": "noLostWrites" } ] },
    { "id": "cold", "name": "The cache restarts at the peak", "desc": "At 8:10 pm the cache is emptied.",
      "hours": 1, "startHour": 20, "traffic": { "rps": 35000, "pattern": "steady" },
      "faults": [ { "minute": 10, "kind": "cacheFlush" } ], "checks": [ { "kind": "slo", "availability": 99.5 }, { "kind": "noCrash", "type": "database" } ] },
    { "id": "budget", "name": "A sensible bill", "desc": "A whole day at the normal rate.",
      "hours": 24, "startHour": 0, "traffic": { "rps": 20000, "pattern": "steady" }, "checks": [ { "kind": "slo" }, { "kind": "cost", "max": 30000 } ] }
  ],
  "rubric": {}, "hints": [], "reference": { "nodes": [], "edges": [] }, "wrong": []
}
```

Notice what is **not** there any more: no `fixed.hitPct` (the hit rate comes from the cache's size, its TTL and how
popular links are), no `fixed.writePct` (1% of calls are `create`), no `role: "kv"` check (a design whose store
cannot answer `get links by code` among 500 crore rows fails `api-redirect`, and one that answers it through a slow
path fails `peak`).

---

## 7. Stage 1: compile (design + problem → plans)

Module `eval/compile.js`. Pure function:

```js
compile(design, lab, practice) → { ok, design, graph, plans: {opId: Plan}, system: [Plan], copies, errors: [Issue], warnings: [Issue] }
```

`ok` is false only for errors that make simulation impossible (no Clients, a loop). An operation that cannot be
planned does **not** make `ok` false: its plan has `ok: false` and its tests fail with the reason.

### 7.1 Clean the design

`cleanDesign2(design, lab)` in `eval/design.js` (v1's `cleanDesign` in `lab/store.js` shows the style: it never
throws, it repairs or drops):

1. Keep at most `limits.nodes` nodes. Drop a node whose `type` is not in the catalogue (`lab.components` types that
   also appear in `lab.eval.components`). Ids must be strings of 1–64 characters; drop duplicates (keep the first).
2. For each node build `config` from the type's `settings`: take the node's value when it is valid, else the default.
   Unknown keys are dropped. `schema` (database) and `structures` (cache) go through `cleanSchema`.
3. Keep an edge only when both ends exist, `from !== to`, it is not a duplicate, and the pair of types is allowed by
   §5.6. `carries`, when present, must be a non-empty list of operation ids of this problem or the words `"reads"`
   or `"writes"`; otherwise drop the `carries` key (the edge then carries everything).
4. Node order and edge order are kept as given. **All later iteration is in this order** (P5).

### 7.2 Build the graph and check it

```
out[id]  = ids this node points at, in edge order
inn[id]  = ids pointing at this node
cdcEdge(e) = type(e.from) === "database"            // a database's only outgoing arrows are change data capture
flowEdges  = edges that are not cdcEdge
topo       = Kahn's algorithm over flowEdges, ties broken by node order
```

Errors (stop compiling, every test fails with this message):

| Code | When | Message |
|---|---|---|
| `E_NO_CLIENTS` | no `client` node | "Add the Clients: tests send their traffic from there." |
| `E_CLIENTS_ALONE` | a `client` with no outgoing arrow | "Connect the Clients to the component they call first." |
| `E_LOOP` | `topo` is shorter than the node list | "Remove the loop: arrows must not lead back to a component they came from." |
| `E_CDC` | a `database` points at something but its engine lacks `cdc` | "{name} can't emit its changes: {engine} has no change stream." |

Warnings (kept, shown as findings): `W_UNUSED` for every node that ends up in no plan ("{name} is not used by any
operation: connect it or remove it. It still costs ${cost} a month.").

### 7.3 Route each operation to its handlers

For an operation, start at its sources: every `client` node (`source: "clients"`), every `external` node
(`"external"`), every `scheduler` node (`"schedule"`). No source node → plan error `E_NO_SOURCE`.

From a node, the operation follows the arrows that carry it. An arrow carries an operation when it has no
`carries`, or `carries` lists the operation's id, or lists `"reads"` and the operation's kind is `read`, or lists
`"writes"` and the kind is `write`.

```
PASS    = { cdn, apigw, lb }                 // pass the call on
HANDLER = { server }                         // runs the steps      (for kind "connect": { realtime })

prefer(op) =
  kind "connect"         → [lb, apigw, realtime]
  op.cacheable or live   → [cdn, apigw, lb, server]
  otherwise              → [apigw, lb, server, cdn]

route(op, node) → list of { chain: [node ids after `node`, ending in a handler], weight }, or a failure
  kids = out[node] reached by arrows that carry op, grouped by type
  for type in prefer(op):
    targets = kids of that type (in edge order); if none: continue
    if type in HANDLER:
      good = targets that canHandle(op, target)            // §7.5: every sync step can be bound from it
      if good is not empty: return good.map(h → { chain: [h], weight: 1 / good.length })
      else remember the failure of the target with the fewest unbound steps; continue
    else:                                                   // a pass-through type
      found = []
      for t in targets: r = route(op, t); if r is a list: for x in r: found.push({ chain: [t, ...x.chain], weight: x.weight / targets.length })
      // weights are divided among all targets of the type, then renormalised over those that led somewhere
      if found is not empty: renormalise so the weights add to 1; return found
  return the remembered failure, or E_NO_HANDLER
```

`E_NO_HANDLER`: "{operation name} never reaches a Service: follow the arrows from the Clients."

Direct object storage: when the operation's only non-compute step is one `blob` step and the source points at a
`database` with engine `s3` (or at a `cdn` that points at one), that route is also tried, **after** the list above:
the store itself is the handler and the plan is `source → (cdn) → s3`. This is how "upload straight to storage"
and "serve files from the CDN" are expressed.

Several sources (two Clients nodes): each gets an equal part of the operation's rate and its own route.

### 7.4 Access paths: can this table answer this step, and at what cost?

Module `eval/access.js`. **Port, do not rewrite**: v1's `judge/requests.js` already implements field matching
(`fieldMatcher`), choosing a table, access paths by engine and schema, the query text in the engine's language, and
running steps on sample data. Read it fully first, then move that logic into `eval/access.js` and `eval/trace.js`
so that the rules below hold. Keep its user-facing messages. Where it and this section differ, this section wins
for v2 problems. Do not change `requests.js` itself (v1 problems still use it).

**A table (or cache structure) holds an entity** when every field the problem's steps use for that entity can be
matched to one of its fields: names compared ignoring case, `_`, `-` and camelCase, plus `practice.aliases`.
(A table need not have fields no step uses.)

`accessPath(node, table, step, practice, lab) → { ok, how, work, rows, why?, query }`:

| Step | Path found when | `how` | Work units |
|---|---|---|---|
| `get` by fields F | F equals the table's full key (key + sort key) | `key` | `work.get` |
| | else a `unique` or `btree` index has exactly the fields F | `index` | `work.indexRead` |
| | else engine has every field searchable (`opensearch`) | `index` | `work.indexRead` |
| | else entity `rows ≤ scanLimit` and engine has `scan` | `scan` | `max(5, rows / work.scanRowsPerUnit)` |
| `query` with `where` fields F, and one of `range` / `order` on field g | F is the key and g the sort key; or a `btree` index is `[...F, g]`; or F is the key or an index and `matches ≤ sortLimit` (sorted in memory) | `key-range` / `index-range` / `index` | 1 (or `work.indexRead`) + `rows / work.rowsPerUnit`, where `rows = min(limit, matches)`; when sorted in memory use `matches` instead of `rows` |
| `query` with `near` | a `geo` index on the field (database), or a `geo` structure (cache), or `opensearch` with the field of type geo | `geo` | `work.geo + rows / work.rowsPerUnit` |
| `query` with `text` | a `text` index on the field, or `opensearch` | `text` | `work.text + rows / work.rowsPerUnit` |
| `query` with none of these (only `where` F) | as `get`, but several rows may come back | `key` / `index` / `scan` | as above `+ rows / work.rowsPerUnit` |
| `sum` | engine has `agg` and a path as for `query`; and `matches ≤ 1,000,000` | `agg` | `1 + matches / work.rowsPerUnit` |
| `put` | the table holds the entity; `unique: U` needs U to equal the key (with `cas` or `uniqueOnKey`), or a `unique` index on U | `write` | `work.put + work.indexWrite × (number of indexes)` |
| `update` | a `key` or `index` path by `by`; `cond` needs `cas` | `write` | as `put` (× `casFactorCassandra` with `cond` on Cassandra) |
| `blob` | engine has `blob` and the table has a field of type blob | `blob` | `max(1, bytes / 1e6 × work.blobPerMB)` |
| `incr` | `counter`; on a cache a `counter` (or `kv`) structure keyed by `by` | `counter` | `work.incr` |
| `rank` | cache `zset` structure on the order field; or a database path as `query` with `order` | `zset` / `index-range` | `work.rank` / as query |

When several paths exist, take the first in the order of the table (cheapest first).
When none exists, `ok: false` with `why` in plain words, naming the fix. Examples (reuse v1's wording where it exists):

- "Looking up links by code would read all 500 crore rows: make `code` the key, or add an index on it."
- "Restaurants near a point need a geo index on `location` (or a search index, or a geo set in a cache)."
- "File bytes would go into PostgreSQL rows: keep files in object storage (S3) and their key in the database."
- "Only-if-absent needs a store that can check and write in one step; S3 and OpenSearch can't."
- "More than 10,000 matching rows can't be sorted in memory: make `created_at` the sort key or add it to the index."

### 7.5 Bind the steps from a handler

`canHandle(op, h)` and the real binding are the same procedure; `canHandle` just reports whether every sync step
got a binding.

**What a handler can reach.** From handler `h`, walk the flow edges:

```
syncReach(h)  = every path h → … that passes only through { server, cache } nodes and ends at a
                { database, cache, external, coord, realtime, pubsub } node.          (at most 4 Services deep)
asyncReach(h) = every path h → … → q → w → … where q is a queue or stream, w a Service that q points at,
                continued by syncReach(w) (and, again, asyncReach(w), at most 3 queues deep)
```

A path `h → cache → database` is a **look-aside chain**: the cache fronts that database.

**Binding a reading step** (`get`, `query`, `sum`, `rank`, `blob` get):
1. Candidates: every (store, table) on `syncReach(h)` where the table holds the entity and `accessPath` is ok.
   A cache counts as a store only through its `structures` (primary-store use).
2. Among candidates prefer: lower `work`; then fewer nodes on the path; then node order.
3. If the chosen store is a database reached through a look-aside chain, the read goes **through the cache**:
   cache hop first, database hop on a miss. If `h` has both a direct arrow to the database and a chain through a
   cache: an operation with `consistency: "strong"` uses the direct arrow, any other uses the cache.
4. The store must have a **feed** for the entity (§7.6). If its copy is never fed: `E_UNFED`.
5. No candidate: `E_NO_STORE` ("No table reachable from {handler} holds {entity}…") or the best `why` from
   `accessPath`; if candidates exist only behind a queue: `E_READ_BEHIND_QUEUE` ("{entity} can only be reached
   through {queue}; a queue can't answer a read: the caller would wait for a worker.").

**Binding a writing step** (`put`, `update`, `tx`, `blob` put, `incr`):
1. Candidates as above on `syncReach(h)`, plus on `asyncReach(h)` when the step's `timing` is `"defer"`.
2. Prefer: for `"defer"` steps an async candidate over a sync one (the designer drew the queue for a reason);
   then lower `work`; then fewer nodes; then node order. This is the **primary** binding.
3. A `"sync"` step with only async candidates: `E_SYNC_BEHIND_QUEUE` ("{step} must be done before answering, but
   {store} is only reached through {queue}.").
4. `tx`: all inner steps must bind to the same store, which must have `tx`. Otherwise `E_TX_SPLIT`
   ("These writes must happen together, but they land in {a} and {b}; no transaction spans two stores.").
5. Look-aside caches in front of the primary store that `h` (or the worker that writes) also reaches get an
   **invalidate** hop (1 unit) for each write.

**Binding the other steps:**
- `compute`: bound to the handler for a sync step; for a `"defer"` step, to the first worker pool on `asyncReach(h)`,
  else to the handler. `isolated: true` needs `sandbox: true` on that node (`E_NO_SANDBOX`).
- `call`: needs an arrow from the handler (or from a Service on `syncReach`) to an `external` node with that preset
  (`E_NO_EXTERNAL`). Deferred calls may be reached through `asyncReach`.
- `publish`: §9.3.

**Deferred steps share messages**: all deferred steps of one operation that go through the same queue or stream
travel in one message (one enqueue hop, one consume hop).

### 7.6 Copies and feeds: where each entity lives and how it gets there

After the writing operations are planned, compute for every store `S` and entity `E` whether `S` has a table (or
structure) that holds `E`, and its **feed**:

| Feed | When | Lag (how stale the copy can be) |
|---|---|---|
| `primary` | some writing step for `E` is bound to `S` synchronously | 0 |
| `dual` | `S` is not the primary of a writing step for `E`, but the same handler reaches it on `syncReach` | 0, but see the dual-write finding (§10.5) |
| `async` | `S` is reached from a writing step's handler through `asyncReach` | the queue's wait (§8.7) + 1 s |
| `cdc` | a store that holds `E` with feed `primary`, `dual` or `async` points (change data capture) at a queue or stream whose consumers reach `S` | the stream's wait + 1 s (+ `refreshSec` of the engine) |
| `lookAside` | `S` is a cache fronting a database that holds `E` | the cache's TTL, or 1 s when writers invalidate it (§7.5 rule 5) |
| `none` | `S` has the table but nothing writes it | — reading from it is `E_UNFED`: "Nothing ever writes {entity} into {store}: {operation} would find it empty. Feed it from {primary} (a worker behind a queue, or change data capture)." |

**Every writing step is applied to every copy**, not only its primary: `dual` copies add a sync hop in the same
operation's plan; `async` copies add hops under the queue's consume hop; `cdc` copies are fed by a **system plan**
(next paragraph). This is how a search index, a feed cache or a read model is kept full, and why it costs load.

**System plans (change data capture).** For each database `D` with outgoing arrows, build one plan with id
`cdc:<D>`: source = `D` itself; its rate each tick = the write calls delivered to `D` in the **previous** tick
(for the entities that have a `cdc` copy downstream); hops = the queue or stream, then each consumer, then the
copy's store. The one-tick delay is what lets a consumer write back into `D` without making a loop.

A problem with no entity written by any operation (read-only problems) has every reachable table fed as `primary`
("it was loaded beforehand").

### 7.7 The plan: a tree of hops

```ts
Plan = {
  op: string,                 // operation id, or "cdc:<node id>"
  ok: boolean,
  error?: { code, message, node?, step? },
  root: Hop,                  // the source
  staleness: [ { store, feed, cacheTtlSec?, viaQueue?: nodeId } ],   // for §10.3, one per reading step's store
  steps: { [stepId]: { node, table, how, work, rows, query, feed, sync } }
}
Hop = {
  id: string,                 // "<operation id>#<number in pre-order>": stable, used as a key for state
  node: string,               // design node id
  kind: "source" | "pass" | "handle" | "cache" | "store" | "invalidate" | "enqueue" | "consume" | "call" | "deliver",
  step?: string,              // the step this hop does, if any
  sync: boolean,              // does the parent wait for it?
  per: number,                // calls per parent call (step.times; 1 otherwise)
  share: number | { kind: "split", group: string, weight: number }      // one of several equal targets
                | { kind: "cdnMiss" } | { kind: "miss", cache: nodeId, entity: string },
  work: number,               // work units per call
  write: boolean,             // counts as a write on a database (for §5.6 replica maths)
  shardRouted?: boolean,      // false: the store must ask every shard (§5.6)
  children: Hop[]             // in execution order
}
```

How to build it for one route `source → n1 → … → h` and the bindings at `h`:

1. `source` hop for the source node. Then one hop per chain node, each the child of the previous:
   `kind: "pass"`, `work: work.pass`, `sync: true`. Where the route split over several targets of a type, each target
   is a sibling with `share: {kind: "split", group: "<parent id>:<type>", weight}`.
   The child of a `cdn` hop has `share: {kind: "cdnMiss"}` (the CDN passes on only what it cannot answer).
2. `h` gets a `handle` hop: `work = work.handle + Σ cpuMs / work.cpuMsPerUnit` of its sync `compute` steps.
3. For each step, in the operation's order, add under the `handle` hop (through `handle` hops of intermediate
   Services when the path passes through them):
   - reading through a look-aside cache: a `cache` hop (`work.get`), and under it the `store` hop with
     `share: {kind: "miss", cache, entity}`;
   - reading directly: a `store` hop;
   - writing: a `store` hop on the primary (`write: true`), `invalidate` hops, and a `store` hop for each `dual` copy;
   - deferred: an `enqueue` hop on the queue or stream (`sync: true`: the caller waits for the message to be
     stored), under it one `consume` hop per consumer node with `sync: false`, under that the `store` hops;
   - `call`: a `call` hop on the external node;
   - each with `per = step.times || 1`.
4. More than `limits.hopsPerOperation` hops: plan error `E_TOO_TANGLED` ("This operation fans out over too many
   paths to follow.").

Sibling order is execution order: a handler does its steps one after another, so their times add up (§8.8).

---

## 8. Stage 3: simulate (plans + one load test → what happened, minute by minute)

Module `eval/simulate.js`. Pure function:

```js
simulateTest(compiled, lab, practice, test) → { ops: {opId: OpTotals}, nodes: {nodeId: NodeTotals}, events: [Event],
                                               timeline: Timeline, cost: {monthly, byNode, storage, transfer}, lost, duplicates }
```

It is a **fluid model**: it never follows single requests. Each tick it computes rates (calls a second) flowing
along every hop of every plan, how loaded each node is, and what that does to success and latency. This is v1's
idea, kept because it is deterministic and fast (P5, P8), but applied per operation over the plans.

### 8.1 Time

- Tick length `Δ` minutes: `eval.tickMinutes` (1) when `test.hours ≤ 6`, else `eval.longTickMinutes` (5).
- Ticks `0 … T−1`, `T = test.hours × 60 / Δ`. Tick `i` covers minutes `[iΔ, (i+1)Δ)` of the test.
- The clock of a tick is `test.startHour × 60 + iΔ` minutes of the day. Traffic patterns are `lab.json`'s client
  patterns (`[hour, multiplier]` points, linear in between, repeating daily): reuse v1's `trafficAt` logic.

### 8.2 State (everything that carries over from one tick to the next)

```
down[node]      → minute it comes back            (crashed, failing over, zone lost)
readOnly[node]  → true while a database's primary is down but replicas answer reads
over[node]      → minutes spent above its crash threshold
instances[node] → instances running now           (autoscaling, instance and zone loss)
pending[node]   → [{at, n}] instances booting
low[node]       → minutes below the autoscaling target
cold[node]      → minute a cache came back empty  (it warms up over warmupMinutes)
backlog[hop id]  → messages waiting. For a `queue`: one number per enqueue hop (its consumers share it).
                   For a `stream`: one number per consume hop (each consumer group has its own position)
cdcRate[database]  → write calls delivered last tick
hold[server]    → mean time a call held a worker last tick (phase 5)
failed[parent hop → child] → child failure share last tick (circuit breakers, phase 5)
faultsOn        → faults active now, with their end minute
```

All maps are created with `Object.create(null)`: node ids are the learner's text.

### 8.3 One tick, in order

```
1. FAULTS      start the faults whose `minute` falls in this tick; end those that are over (§8.13)
2. RATES       m = pattern multiplier at this tick's clock
               base[op] = test.traffic.rps × m × op.share × (spike factor if a spike fault covers it)
               base["cdc:<D>"] = cdcRate[D]
3. RETRY LOOP  factor[op] = 1                                  // attempts per user call
               repeat at most 4 times:
                 a. FLOW PASS (§8.4) with rate[op] = base[op] × factor[op]
                 b. s[op] = success of one attempt (§8.10)
                 c. f[op] = 1 + Σ_{k=1..retries} (1 − s[op])^k
                 d. if every |f[op] − factor[op]| < 1e-6: stop;   factor = f
4. LATENCY     per operation, from the utilisation of the last pass (§8.8)
5. RECORD      per-operation and per-node numbers for this tick (§8.14); add this tick's cost (§8.12)
6. MOVE ON     backlogs (§8.7); crash timers, recoveries, autoscaling, cache warm-up (§8.11);
               cdcRate for the next tick; `hold` and `failed` for the next tick
```

Retries apply to client-sourced operations only (`retries` from `eval.json`). System plans and scheduled or
external operations have `factor = 1`.

### 8.4 The flow pass

Precompute once per test: `hopsAt[node]` = every hop of every plan that sits on that node.
First fill in every **source hop**: `in = out = rate[plan.op] × (its part of the sources)`, `phi = 1`, no work
(a source costs its node nothing; this also covers change-data-capture plans, whose source is a database).
Then, for each node in `topo` order (parents of a hop always come earlier, because hops follow arrows):

```
for each hop at this node (source hops are already done):
  consume hop (!sync)   : behind a queue : hop.in = (parent.out + backlog[parent.id] / (60 × Δ)) × weight
                              weight = this consumer's capacityNow ÷ the sum over the queue's consumers (equal parts if the sum is 0)
                          behind a stream: hop.in = parent.out + backlog[hop.id] / (60 × Δ)
                          // everything that arrived plus everything waiting, as a rate
  any other hop         : hop.in = hop.parent.out × p × hop.per
  where p = shareNow(hop)                                                  (below)

syncUnits = Σ hop.in × hop.work   over hops with sync = true      (for a database: split into read and write units)
pullUnits = Σ hop.in × hop.work   over consume hops
cap       = capacityNow(node)                                               (§5.6, with state: instances, down, shards)

φsync = syncUnits ≤ cap ? 1 : cap / syncUnits            (0 when cap is 0 and syncUnits > 0)
spare = max(0, cap − min(syncUnits, cap))
φpull = pullUnits ≤ spare ? 1 : spare / pullUnits

for each hop:  hop.phi = hop.sync ? φsync : φpull ;   hop.out = hop.in × hop.phi

node.rho      = syncUnits / cap                           // used for latency and for crash timers
node.rhoShown = (syncUnits + min(pullUnits, spare)) / cap // what the canvas shows; at most 1 from pulled work alone
```

Sync callers are served first; pulled work (messages) gets what is left. Pulled work alone never pushes a node past
100%: workers take only what they can (as in v1), so backlog cannot crash a worker pool.

`shareNow(hop)`:
- a number → that number;
- `split` → its `weight`; but when the parent node is a `lb` or `apigw`, the weight of siblings in the same group
  whose node is down is given to the ones that are up (if all are down, keep the weights);
- `cdnMiss` → `1 − cdnHit(op)` (§8.6); 1 when the operation is not cacheable;
- `miss` → `1 − hit(cache, entity)` (§8.6); when that cache is down: 1 if its `onDown` is `database`, else 0.

**Databases** keep read and write units apart and compute `rho` with the formulas of §5.6. Then
`φread = min(1, 1/rho)` and `φwrite = min(1, 1/rho)`; while `readOnly`, `φwrite = 0` and reads use the replicas'
capacity `q × n`. A hop's `phi` is `φwrite` when `hop.write` else `φread`.

**A cache that is down**: its `cache` hops have `phi = 1` and cost nothing when `onDown` is `database` (the caller
goes straight on to the database); `phi = 0` when `onDown` is `fail`.

**Failed work behind a queue goes back to the queue**: a consume hop's `done = hop.out × Sbelow(hop)`, where
`Sbelow` is the success of its sync children (§8.10, the product without the hop's own `phi`). The backlog grows by `(arrived − done)` (§8.7), so a database that refuses the
workers' writes makes messages pile up; nothing is silently lost.

Test vector (the simplest design): Clients 1,000 calls/s → Load Balancer → Service 2 × m5.large (600 each) →
`db.m5.large` (2,500 units). Operations: `read` share 0.9 (one `get`, 1 unit), `write` share 0.1 (one `put`, no
secondary index, 2 units). Expect: load balancer `rho` 0.01; Service `rho` 1000/1200 = **0.833**; database units
900 × 1 + 100 × 2 = 1,100, `rho` **0.44**; every `phi` 1.

### 8.5 Capacity now

`capacityNow(node)` is the capacity of §5.6 with the state applied:
- `down[node]` set → 0 (a database with replicas answers reads: see `readOnly`);
- Service, real-time gateway: `size.rps × instances[node]`, times 0.8 with `sandbox`; during `zoneDown` the
  instances are first reduced to `instances × (1 − 1/zones)` rounded down (0 when `zones` is 1);
- phase 5 adds the concurrency limit (§8.9);
- a consumer of a stream uses at most `partitions` instances for that stream's messages.

### 8.6 Hit rates: derived, not given

**Cache (look-aside).** Per cache node and entity `E` read through it. Compute once per test:

```
mem      = size.memoryGb × 1e9 × nodes                         // bytes
entry_E  = rowBytes_E × 1.3                                    // bytes per cached item
N_E      = keys.active of the operations reading E through this cache (largest), else rows_E
want     = Σ_E N_E × entry_E
C_E      = N_E                           when want ≤ mem
         = (mem × rate_E / Σ rate) / entry_E   otherwise       // memory shared by read rate at multiplier 1
zipf_E   = true when any operation reading E through this cache has keys.skew "zipf"
hitCap_E = 1                                   when C_E ≥ N_E
         = ln(1 + C_E) / ln(1 + N_E)           when zipf_E
         = C_E / N_E                           otherwise
```

Then each tick, with `R` = read calls a second for `E` arriving at this cache, `τ` = the cache's `ttlSec`,
`Ce = min(C_E, N_E)`, `H = ln(N_E) + 0.5772`, and `W` = write calls a second to `E` by writers that invalidate
this cache:

```
expiryMiss = ln(1 + Ce × H / (R × τ)) / H        when zipf_E         // share of all reads that find the item expired
           = hitCap_E / (1 + R × τ / Ce)         otherwise
invalid    = min(1, W / R)                                            // each write empties one item
warm       = 1, or (minute − cold[node]) / warmupMinutes while the cache warms up (0 … 1)
hit        = clamp( (hitCap_E − expiryMiss) × (1 − invalid) × warm , 0, 0.999 )          (R = 0 → hit = hitCap_E × warm)
```

Test vectors (`cache.m5.large`, 6 GB, 1 node, `rowBytes` 500 → `C = 9,230,769` items fit; `R` = 34,650 reads/s; zipf):

| `N` (active items) | TTL | `hitCap` | `expiryMiss` | `hit` |
|---|---|---|---|---|
| 5,000,000,000 | 60 s | 0.7181 | 0.2022 | **0.5160** |
| 5,000,000,000 | 3,600 s | 0.7181 | 0.0433 | **0.6749** |
| 50,000,000 | 300 s | 0.9047 | 0.1556 | **0.7491** |
| 50,000,000 | 3,600 s | 0.9047 | 0.0468 | **0.8579** |
| 50,000,000 | 86,400 s | 0.9047 | 0.0030 | **0.9017** |

Uniform popularity, `N` = 50,000,000, TTL 300 s: `hitCap` 0.1846, `hit` **0.0978** (a cache does little for data
nobody asks for twice). This is the trade-off the learner now controls: a bigger cache and a longer TTL raise the
hit rate; a longer TTL also makes reads staler (§10.3).

**Cache as a primary store** (`structures`): there is no hit rate; every call is served by the cache.
The data must fit: `rows × rowBytes × 1.3 ≤ mem`, else finding `F_CACHE_FULL`.

**CDN.** For a cacheable operation with `K = keys.active` (else the entity's `rows`), TTL `τ = cacheable.ttlSec`,
`Rp` = the operation's calls a second ÷ 50 (points of presence, *starting value*), `H = ln(K) + 0.5772`:

```
cdnHit = clamp( 1 − ln(1 + K × H / (Rp × τ)) / H , 0, 0.99 )      zipf
       = clamp( 1 − 1 / (1 + Rp × τ / K) , 0, 0.99 )              uniform
```

Vectors: live video, `K` 18 objects, `Rp` 175,000/s, `τ` 4 s → 0.99997, clamped to **0.99**. Photos, `K` 10 crore,
`Rp` 500/s, `τ` 86,400 s → **0.80**. `live: true` operations: an origin failure fails **every** viewer of that
operation, not only the misses (as v1's "live content").

### 8.7 Queues and streams

After the flow pass, for every enqueue hop `e` (one per operation per queue or stream):

```
queue :  done       = Σ over its consume children of (child.out × Sbelow(child))
         backlog[e] = max(0, backlog[e] + (e.out − done) × 60 × Δ)
         waitSec[e] = done > 0 ? backlog[e] / done : (backlog[e] > 0 ? the test's length in seconds : 0)
stream:  for each consume child c (each consumer node is its own group and gets every message):
         done       = c.out × Sbelow(c)
         backlog[c] = max(0, backlog[c] + (e.out − done) × 60 × Δ)
         waitSec[c] = done > 0 ? backlog[c] / done : (backlog[c] > 0 ? the test's length in seconds : 0)
```

- **Completion delay** of a deferred step = the sum of `waitSec` of the queues on its path + 1 s per queue.
  Compared with the step's `withinSec` by the `completes` check (§11.1).
- **Stream partitions**: a consumer node uses at most `partitions` instances. With a hot key (§8.11) one partition
  gets more than its share and one instance must take it all.
- **Stream retention**: `waitSec > retentionHours × 3600` → the events are gone before they are read: event
  `eventsLost`, finding `F_RETENTION`.
- **Queue kind `fifo`**: order is kept per group; capacity 3,000 a second.
- **Poison messages** (fault `poison`, share `x` of messages can never be processed): with `dlq`, each costs
  `maxReceives` attempts then leaves (work per message × `(1 + x × (maxReceives − 1))`); without `dlq`, a `standard`
  queue retries them for ever (work per message × `(1 + 20x)`), and a `fifo` queue stops delivering the `x` share of
  groups behind them (their messages stay in the backlog).
- Messages still waiting when the test ends count as **not done** for the operation that sent them (as v1).

Test vector: arrivals 3,000 a second for 30 minutes, then 500; workers take 1,200 a second; `Δ` = 1.
Largest backlog **3,240,000** messages; longest wait **2,700 s**; backlog empty at minute **108**.

### 8.8 Latency: a distribution per operation, not one mean

**Per hop.** Base time `b` (ms):

| Hop | `b` |
|---|---|
| pass, enqueue, deliver | the component's `latencyMs` |
| handle, consume | `latencyMs` + the `cpuMs` of its sync `compute` steps |
| cache | 1 |
| store | engine `latencyMs` × path factor: `key` 1 · `index` 1.5 · `key-range` / `index-range` `1 + rows/200` · `geo`, `text` 3 · `scan` `1 + rows/5000` · `agg` `1 + matches/10000` · `write` 1 (`sync` replication +2 ms) · `blob` `1 + bytes/1e6 × 10` · `counter`, `zset` 1 |
| call | the external service's `latencyMs` (× the `slow` fault's factor) |

Waiting time from load, with `r = min(rho, 0.95)`:

```
w = b × r / (1 − r)       when rho < 1          // so the mean time at the node is b / (1 − r), as in v1
w = b × 19                when rho ≥ 1
var = w²                                         // waiting is treated as exponential
```

A store hop that is not shard-routed on a database with `s` shards waits for the slowest shard:
`w × H_s`, `var × Σ_{i=1..s} 1/i²` (`H_8` = 2.7179, `Σ` = 1.5274).

**Per operation.** Three numbers for the sync part of the plan: `F` (time that is always spent), `M` (mean of the
rest), `V` (variance of the rest). Recursively:

```
L(hop):
  F = b ; M = w ; V = w²
  for each sync child c, in order (first combine each split group into one child, below):
    {Fc, Mc, Vc} = L(c) ; Ec = Fc + Mc ; n = c.per ; p = probability c is called (1, or shareNow for miss / cdnMiss)
    if p = 1:  F += n × Fc ;  M += n × Mc ;  V += n × Vc
    else:      M += p × n × Ec ;  V += p × n × Vc + p × (1 − p) × (n × Ec)²
  return {F, M, V}

split group with weights wi and results {Fi, Mi, Vi}, Ei = Fi + Mi:
  E = Σ wi × Ei ;  V = Σ wi × (Vi + Ei²) − E² ;  F = min Fi ;  M = E − F
```

Deferred hops (`sync: false`) and everything under them are **not** part of the operation's latency.

Percentiles use a gamma distribution fitted to `(M, V)` with the Wilson–Hilferty approximation:

```js
const Z = { 0.5: 0, 0.9: 1.2816, 0.95: 1.6449, 0.99: 2.3263, 0.999: 3.0902 };
// quantile of the variable part
function gammaQ(M, V, p) { if (M <= 0) return 0; if (V <= 0) return M;
  const k = M * M / V, c = 1 - 1 / (9 * k) + Z[p] / (3 * Math.sqrt(k)); return Math.max(0, M * c * c * c); }
// standard normal CDF (Abramowitz–Stegun 26.2.17)
function phi(x) { const t = 1 / (1 + 0.2316419 * Math.abs(x)), d = 0.3989422804014327 * Math.exp(-x * x / 2);
  const q = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? 1 - q : q; }
// share of calls whose variable part exceeds x
function gammaTail(M, V, x) { if (x <= 0) return 1; if (M <= 0) return 0; if (V <= 0) return x >= M ? 0 : 1;
  const k = M * M / V, z = (Math.cbrt(x / M) - (1 - 1 / (9 * k))) * 3 * Math.sqrt(k); return 1 - phi(z); }

mean = F + M ;  p50 = F + gammaQ(M, V, 0.5) ;  p99 = F + gammaQ(M, V, 0.99)
slow(limit)  = gammaTail(M, V, limit − F)            // share of calls slower than `limit` ms
```

Test vectors (put these in `eval/latency.test.js` exactly):

| Case | Expect |
|---|---|
| `gammaQ(100, 10000, 0.99)` (an exponential with mean 100; exact answer 460.52) | 461.01 |
| `gammaQ(100, 10000, 0.5)` (exact 69.31) | 70.23 |
| `phi(0)`, `phi(1.6449)`, `phi(-2.3263)` | 0.5000, 0.9500, 0.0100 |
| The design of §8.4's vector (LB `b` 2 `rho` 0.01, Service `b` 20 `rho` 0.8333, database `b` 5 `rho` 0.44), operation `read` | `F` 27, `M` 103.95, `V` 10,015.43, mean 130.95, p50 102.03, **p99 488.51**, `slow(200)` 0.1847, `slow(500)` 0.0089 |
| Service (`b` 20, `rho` 0.5) → cache (`b` 1, `rho` 0.2) → on a miss (share 0.1) database (`b` 5, `rho` 0.6) | `F` 21, `M` 21.5, `V` 419.75, mean 42.5, **p99 115.49** |

**The p99 target over a test** is judged the way an SLO is: the share of an operation's calls slower than its
`p99Ms`, weighted by traffic over the test (or the check's window), must be at most 1% (§11.1). The worst tick's
p99 is also reported, for feedback.

### 8.9 Timeouts, concurrency and circuit breakers *(phase 5)*

Until phase 5, a Service's capacity is only `size.rps × instances`. Phase 5 adds what makes slow dependencies
dangerous:

- Each Service size has `concurrency` (calls in progress per instance; 256 for every size, *starting value*).
- `hold[server]` = mean time one call occupies the Service = its own `b + w` plus the mean time of its sync
  children, each child's time cut at the Service's `timeoutMs`. Use the value from the **previous** tick.
- Capacity = `min(size.rps × instances, instances × concurrency × 1000 / hold)`.
  Vector: 4 instances × 200 in progress: 32,000 a second at 25 ms; **800** when a dependency takes 1,000 ms;
  2,667 with a 300 ms timeout.
- A child call slower than `timeoutMs` fails: child success × `(1 − slow_child(timeoutMs))`.
- `callRetries: r`: the child's success becomes `1 − (1 − S)^(r+1)` and the load sent to it is multiplied by
  `1 + (1 − S) + … + (1 − S)^r` (use last tick's `S`). Retries multiply load on a struggling dependency: that is
  the lesson.
- `breaker: true`: when a child failed more than half its calls last tick, this tick the Service fails 90% of its
  calls to that child at once (no load sent, 1 ms) and sends 10% as probes.

### 8.10 Success of one attempt

```
S(hop) = hop.phi × Π over its sync children, in order:
            plain child        :  S(c) ^ c.per
            miss / cdnMiss     :  1 − p + p × S(c) ^ c.per          (p = shareNow)
            a split group      :  Σ weight_i × S(c_i)
Sbelow(hop)          = the same product without hop.phi           (used for work behind queues, §8.4)
attempt success s[op] = S(root) × (1 − slow(eval.clientTimeoutMs))
user success          = 1 − (1 − s)^(retries + 1)                    (client-sourced operations)
```

Special cases: a `cache` hop that is down with `onDown: database` has `phi = 1`; an operation marked `live` treats
its `cdnMiss` child as always called for success (`p = 1`) though only the miss share adds load.
Vector: `s` = 0.9, 1 retry → user success **0.99**, attempts per call **1.10**.

Per tick record for each operation: calls, successful calls, slow calls (for its `p99Ms`), and for deferred steps
the completion delay.

### 8.11 Things that change over time

All from v1 (`lab/engine.js` `advance`), now per tick. Use the numbers already in `lab.json`.

- **Overload crash.** A node with a `crash` policy (`{above, minutes, downMinutes, failoverMinutes?}`) whose `rho`
  stays above `above` for `minutes` goes down for `downMinutes` (a Multi-AZ database: `failoverMinutes`).
  Managed components and per-request engines never crash; they refuse the excess.
- **Recovery.** A cache comes back empty (`cold`), warming over `warmupMinutes`. A write-back cache that goes down
  loses its unflushed writes (`lost`, event `writesLost`), as v1.
- **Autoscaling** (Service with `autoscale`): wanted instances = `ceil(offered units / (size.rps × targetPct/100))`
  between `count` and `maxCount`; new instances arrive `warmupMinutes` later; instances are removed after
  `scaleInMinutes` below the target.
- **Hot keys and shards.** When a `hotKey` fault is on (or the operation has `keys.hot`), a share `x` of that
  operation's calls go to one item. For every hop of that operation on a node split into `P` parts (database
  `shards`, cache `nodes`, stream `partitions`, DynamoDB and Cassandra count as `P = 10`): the part holding the item
  gets `x + (1 − x)/P` of the hop's units; `rhoHot = (hop units × (x + (1 − x)/P) + other units / P) / (cap / P)`.
  If `rhoHot > 1`, the hop loses `(x + (1 − x)/P) × (1 − 1/rhoHot)` of its calls (multiply `phi`), and the event
  `hotPart` is recorded. A look-aside cache in front is not affected (the hot item is always cached).

### 8.12 Storage and cost

Cost per tick = Σ over nodes of (monthly cost now) × `Δ / (60 × 730)`; the test's bill is reported per month:
`monthly = total cost × 730 / test.hours` (as v1's `avgMonthly`).

| Part | Monthly cost |
|---|---|
| Service, real-time gateway, processor | `size.hourly × instances running × 730` |
| Database (instance engine) | `size.hourly × 730 × ((multiAz ? priceFactor : 1) + replicas) × shards` |
| Database (per-request engine) | `(read calls × readPerMillion + write calls × writePerMillion) / 1e6`, calls per month at this tick's rate |
| Cache | `size.hourly × 730 × nodes × (replica ? 2 : 1)` |
| CDN, API Gateway, queue, load balancer | as v1 (`monthlyCost` in `lab/engine.js`), at this tick's served rate |
| Stream, coordination service, external | §5.6 |
| **Storage** | for every store: `GB × storagePerGbMonth`, where `GB = Σ over entities it holds of rows × rowBytes × (1 + 0.3 × secondary indexes) / 1e9`, × `(1 + replicas)` and × 2 with Multi-AZ on instance engines |
| **Data transfer** | bytes out a month × `egressPerGb`: an operation's successful calls × `bytesOut`, at the CDN's price for the share it answers, at 0.09 per GB *(starting value)* for the rest |

Storage that does not fit (`GB / shards > maxStorageGb` of the engine): finding `F_STORAGE` ("{entity} needs
{GB} GB; one {engine} holds at most {max}. Split it over shards or choose a store that grows by itself.").

### 8.13 Faults

`test.faults: [{ minute, kind, … }]`. A target is always given by **type** (tests cannot know the learner's ids);
"busiest" means the node of that type with the highest `rho` in the previous tick (v1's `chaosTarget`).

| `kind` | Fields | What happens |
|---|---|---|
| `crash` | `type` | The busiest node of that type that can crash goes down as if overloaded (v1's chaos). Not counted by `noCrash` |
| `instanceCrash` | `type` (`server`, `realtime`) | The busiest node of that type loses one instance for 5 minutes |
| `groupDown` | `type` | The busiest node of that type is down for 5 minutes (a bad deploy) |
| `zoneDown` | `minutes` | One zone is lost for `minutes`. Worst case is assumed: every single-zone thing is in it. Effects per type in §5.6 |
| `slow` | `type`, `factor`, `minutes` | Base latency of the busiest node of that type × `factor` |
| `spike` | `factor`, `minutes`, `op?` | Traffic (of one operation, or all) × `factor` |
| `cacheFlush` | — | Every cache is emptied (cold) |
| `externalDown` | `preset`, `minutes` | Calls to that external service fail |
| `hotKey` | `op`, `share`, `minutes` | One item gets `share` of that operation's calls (§8.11) |
| `poison` | `share`, `minutes` | That share of messages can never be processed (§8.7) |
| `abuse` | `factor`, `minutes` | One client sends `factor` × the normal total traffic on top; refused at an API Gateway with `rateLimit: perClient`, otherwise it is load like any other and its calls are not counted in the operation's success |

A fault's `minute` must be a multiple of the tick; `minutes` at least one tick. The validator checks both.

### 8.14 What the simulator returns

```ts
OpTotals   = { calls, ok, availability,            // user-level, % over the whole test
               slowShare, p50, p99Worst, p99WorstAt,   // p50 = traffic-weighted mean of tick p50s
               deferred: { [stepId]: { worstDelaySec, notDone } },
               staleSecWorst }                      // §10.3
NodeTotals = { rhoMax, rhoMaxAt, crashes, downMinutes, cost }
Event      = { t, node, kind, forced?, n? }         // kinds: crashed, failover, recovered, cold, warm, scaledOut, scaledIn,
                                                    // backlog, drained, writesLost, eventsLost, hotPart, zoneDown, zoneBack
Timeline   = { tickMinutes, ops: { [opId]: { rate: [], ok: [], p99: [] } },
               nodes: { [nodeId]: { rho: [], up: [], instances: [], backlog: [] } } }
```

Windows: for every check with `from` / `to`, keep the per-operation calls, ok and slow counts of the ticks inside
the window. Arrays in `Timeline` hold one number per tick, rounded to 3 decimals; when `T > 300`, keep every
`ceil(T/300)`-th tick (the worst value in each group for `rho` and `p99`, the lowest for `ok`).

---

## 9. Stage 2: trace (one call, on sample data)

### 9.1 Running a trace test

Module `eval/trace.js`: `runTrace(compiled, practice, test) → TraceResult`. For the test's operation:

1. If its plan has `ok: false`, the test fails with the plan's error message. Stop.
2. **Expected**: run the steps on the entities' `sample` rows with no design involved (port v1's `expected`).
3. **Got**: run the same steps, but each one against the table it is bound to: only the fields that table has
   (a response field the table lacks comes back empty and the test fails on that field, as v1), through the access
   path found (the query text in the engine's own language is kept for display).
4. A deferred writing step is applied to the sample data too, and the response is built without waiting for it.
   The response's `status` must match (a design that defers a step the operation needs synchronously never gets
   here: the plan already failed with `E_SYNC_BEHIND_QUEUE`).
5. Compare `respond.status` and `respond.body` after filling the templates. Pass when equal.

Keep the result fields the workspace already shows for v1 request tests (read `runRequest`'s return value and reuse
its field names): the request, the expected response, the response got, and the `trace`.

### 9.2 The trace for "▶ Watch"

Flatten the plan's hops in execution order into `[{ node, kind, label, query?, back? }]`: go down to each hop, and
come back up after its children ("there and back", as v1). Deferred hops are shown after the response, marked
"after answering". When a hop group was split over several nodes, show the first node of the group.

### 9.3 Publishing to people who are connected *(phase 4)*

A `publish` step delivers an event to its audience over open connections. Binding rules:

1. The operation's handler must reach a `realtime` node by one of:
   - **`pubsub`**: handler → `pubsub` → `realtime`. With `channels: perKey`, each event reaches
     `min(instances, audience.avg × online)` gateway instances; with `global`, all of them.
   - **`stream`**: handler → `stream` → `realtime`. Every gateway instance reads every event (durable, ordered).
   - **direct**: handler → `realtime`. The handler must know which instance holds each connection: it needs a
     reading path to a store that holds the entity named `connections` (the problem declares it; typically a `kv`
     structure in a cache). Without it every event must be sent to every instance.
2. Clients must have a way to connect: the problem has an operation of kind `connect` routed by §7.3 to the same
   `realtime` node. Otherwise `E_NO_CONNECTION` ("Nobody is connected to {name}: Clients need an arrow to it,
   through a load balancer.").
3. Load: the gateway's messages a second = events × `audience.avg` × `online`. Its connections = the `connect`
   operation's calls a second × the problem's `sessionSec` (a field of that operation: how long a connection stays
   open; connections = arrival rate × duration).
4. Hops: `enqueue` on the `pubsub` or `stream`, then `deliver` hops on the `realtime` node (`sync: false`).
   Delivery delay is tracked like a deferred step and checked by `completes`.
5. A `pubsub` loses the events of a gateway that is down. If the operation is `durable`, the analyser requires the
   event to be stored as well (a `put` in the same operation), so that a reconnecting client can catch up (§10.2).

---

## 10. Stage 4: analyse (rules over the plans → findings)

Module `eval/analyse.js`: `analyse(compiled, practice, lab, sims?) → Finding[]`.

The simulator answers "how much, how fast, how often". It cannot answer "can this charge a card twice?", because a
fluid model has no single request to go wrong. Those questions are answered by **rules over the structure of the
plans**: who answers before what is safe, what is retried, what is copied where, in what order. Each rule that
fires produces a finding with a concrete story, so the learner sees *how* it goes wrong, not just that it does.

The rules read only what the learner can set (P3): arrows, engines, schemas (keys, unique indexes, TTL), and node
settings. Nothing is inferred from names.

### 10.1 A finding

```ts
Finding = {
  code: string,                 // e.g. "F_DOUBLE"
  severity: "fail" | "warn" | "info",
  op?: string, nodes: string[], // what it is about (for highlighting on the canvas)
  title: string,                // one line, plain words
  story: string,                // two to four sentences: the concrete sequence of events, with this design's names and numbers
  fix: string,                  // one thing to try
  concept?: string              // slug of the Concepts or Components article that teaches it, e.g. "contention"
}
```

`fail` findings make the matching check fail (§11.1). `warn` and `info` are shown and cost nothing.
Sort: `fail` first, then `warn`, then `info`; inside a group by operation order then code. At most 12 are shown.

All text is plain, short, British spelling, no em dashes, component names as the learner sees them (`names()` of v1).

### 10.2 Durability: is an acknowledged write safe?

For every writing step of an operation with `durable: true`, look at where the plan has put the data **at the
moment the operation answers**:

| Situation in the plan | Finding |
|---|---|
| The step's primary store has `durable` and the hop is sync | none |
| The step is deferred, and its `enqueue` hop is on a `queue` or `stream` (durable) | none: the message is safe |
| The step is deferred through a `pubsub` only | `F_NOT_DURABLE` fail: "{operation} answers 'done' after publishing to {pubsub}, which keeps nothing. If {consumer} is down for a moment the {entity} is gone for good." Fix: "Put a queue or an event stream there, or write to the database before answering." |
| The primary store is a cache without `persistence: "aof"` | `F_NOT_DURABLE` fail: "{entity} lives only in {cache}'s memory. When it restarts, every {entity} acknowledged since is lost." Fix: "Write it to a database too (the cache can still serve reads)." |
| A look-aside cache on the path has `writePolicy: "back"` | `F_WRITE_BACK` fail: "{cache} acknowledges writes and saves them later. A crash loses the last {flushSeconds} seconds of {entity}: about {n} at this test's rate." |
| Database single-zone, operation durable | `F_SINGLE_ZONE` warn: "{database} has no standby. It keeps its data through a crash, but nothing can be written for {downMinutes} minutes." |
| A `publish` step in a `durable` operation with no writing step for the same event | `F_NO_CATCH_UP` fail: "A message pushed while {user}'s phone is offline is never seen: nothing stores it for when they reconnect." |

The simulator's `lost` count (writes lost by a write-back cache that went down) is reported next to these.

### 10.3 Freshness: how stale can a read be?

For every reading step, the plan knows the store it reads and that copy's **feed** (§7.6). Its staleness in seconds:

```
feed primary                       → 0
feed dual                          → 0
feed lookAside                     → 1 when the writers of the entity invalidate this cache, else the cache's ttlSec
feed async or cdc                  → worst waitSec of the queues / streams on the feed path during the test + 1
                                     (+ the engine's refreshSec, e.g. 1 for OpenSearch)
reading from replicas (readFrom: "replicas") with replication "async" → + the engine's replicaLagSec
through a CDN (cacheable)          → + cacheable.ttlSec, unless the operation is `live`
```

An operation's `staleSecWorst` is the largest over its reading steps and over the test's ticks.

Requirement: `consistency: "strong"` means at most 1 second **and** no `lookAside` copy without invalidation, no
async replica read, no `async` / `cdc` copy. `consistency: {maxStalenessSec: n}` means `staleSecWorst ≤ n`.

Finding `F_STALE` (fail when the requirement is broken): "{operation} must be {requirement}, but it reads
{entity} from {store}, which is {how it is fed}: up to {seconds} behind." With the fix that fits the feed:
"Shorten {cache}'s TTL or delete the item when it is written" / "Read from the primary" / "Add workers behind
{queue}: at the peak it was {wait} behind".

Always add, as `info`, one line per reading operation that has no requirement: "{operation} can show data up to
{seconds} old." (So learners see the consequence of a TTL even when the problem does not test it.)

### 10.4 Doing something twice: retries, redelivery, replays

For every operation with `effect: "once"`, find every way its writing steps can run twice:

1. **Client retries.** Clients retry failed and timed-out calls (`eval.retries`). A sync writing step can run twice
   unless the store refuses the second one: the table it is bound to has a **`unique` index (or key) on the
   operation's `idempotencyField`** (matched by name and aliases), or the step itself has `unique` / `cond` that
   makes a repeat a no-op.
2. **At-least-once delivery.** A deferred step behind a `queue` or `stream` can be delivered twice (a worker that
   crashes after doing the work but before acknowledging; a `visibilitySec` shorter than the work takes: compare
   with the consume hop's `b + w` at its worst tick). Safe under the same condition as 1, checked on the store the
   worker writes. A `fifo` queue removes duplicates only within 5 minutes: still a finding, severity `warn`.
3. **Replays.** A `processor` restarts from its last checkpoint: up to `checkpointSec` of events are processed
   again. Safe when its sink step is an upsert by key (`put` with the key equal to the table's key) and not an
   `incr` or `add`.
4. **Scheduler.** `count: 2` with `lock: "none"`: every job fires twice.
5. **External calls.** A `call` step in a retried operation calls the third party again. Safe only when the same
   operation records the call's id first (a `put` with `unique` before the `call`) or the problem marks the
   external preset as idempotent (`"idempotent": true` on the `call` step).

Finding `F_DOUBLE` (fail), with a story built from the first unsafe way found, for example:
"A customer taps Pay. {Service} charges the card through {external}, but the answer is slow and the app retries
after {clientTimeoutMs/1000} seconds. Nothing remembers the first attempt, so the card is charged again. At this
test's rate about {n} calls are retried."  (`n` = Σ over ticks of calls × (factor − 1), rounded.)
Fix: "Give every request an id from the client and make the store refuse a second row with the same id (a unique
index on `{idempotencyField}`)."

### 10.5 Two stores, no transaction

- A `tx` step that could not be bound to one store is already a plan error (`E_TX_SPLIT`).
- An entity with a `dual` copy (the same Service writes two stores one after the other): `F_DUAL_WRITE`, `warn` by
  default, `fail` when the operation is `durable` or `effect: "once"`: "{Service} writes {entity} to {a}, then to
  {b}. If it crashes between the two, {b} never hears about it, and nothing repairs it." Fix: "Write once, to
  {a}, and let {b} follow it: change data capture into a stream, or an outbox table read by a worker."
- A sync `call` to an external service **inside** the same operation as a database write with no record written
  before the call: `F_CALL_THEN_WRITE` warn ("If {Service} crashes after {external} answers, the payment happened
  but the order does not know.").

### 10.6 Order

For every operation with `ordered: {by: f}`: follow its deferred writing and `publish` steps.

| Path of the deferred step | Verdict |
|---|---|
| No queue or stream (all sync, one store) | in order |
| A `stream` whose `keyField` matches `f` (by name or alias), and each consumer writes with a key or condition | in order |
| A `stream` with another or no `keyField` | `F_ORDER` fail: "Events for one {f} land in different partitions; two workers apply them in whichever order they finish." |
| A `queue` of kind `fifo` | in order (per group); note the 3,000 a second limit |
| A `queue` of kind `standard` | `F_ORDER` fail: "{queue} hands messages to whichever worker is free. Two messages for the same {f} can be applied the wrong way round." |
| A `pubsub` | `F_ORDER` warn: order usually holds, nothing guarantees it |

Fix text: "Use an event stream keyed by `{f}`, or number the events and let the store refuse one that is out of
turn (a condition on the sequence number)."  A writing step with `cond` on a sequence field makes any path "in order".

### 10.7 Single points of failure (explains what the fault tests show)

Finding `F_SPOF` (`warn`): every node that the `zoneDown` or `crash` faults would take out for some operation, found on
the plans: a node whose loss makes `S(root) = 0` for an operation. Compute by setting that node's `phi` to 0 on the
compiled plans (no simulation) for: every Service and real-time gateway with `zones: 1`, every database without a
standby, every cache whose `onDown` is `fail`, every `scheduler` with `count: 1`.
"If {node} is lost, every {operation} fails: nothing else can take its calls." This replaces v1's `redundant` and
`multiAz` checks: the fault tests fail the design; this finding tells the learner why.

### 10.8 Things that grow without limit

- `F_BACKLOG` (warn; fail through the `completes` check): a backlog larger at the end of a test than at any earlier
  tick, and growing in the last 10 ticks: "{queue} was still filling when the test ended: {consumer} takes
  {x} a second, {y} arrive."
- `F_STORAGE`, `F_CACHE_FULL`, `F_RETENTION`: from §8.
- `F_NO_TTL` (warn): an entity the problem marks `"expires": true` (holds, sessions, rate-limit counters) kept in a
  table or structure without a TTL on an engine that has `ttl`, or on an engine without it and no operation that
  deletes it: "{entity} is never removed from {store}."
- `F_OVERSIZED` (info): a node whose `rhoMax` is below 0.15 in every load test and whose cost is more than 15% of
  the bill: "{node} never went above {pct}% load: a smaller one would do."
- `W_UNUSED` (warn): from §7.2.

### 10.9 Hot spots

From the simulator's `hotPart` events: `F_HOT` (fail through `slo` when calls were lost; else warn): "One {item}
gets {share}% of {operation}. All of it lands on one {shard | partition | cache node} of {node}, which reached
{pct}% while the others sat idle." Fix by kind: "Put a cache in front of it" / "Add a suffix to the key so the hot
item spreads over several partitions" / "Choose a shard key that does not put a whole celebrity in one place".

### 10.10 Scheduling

- `F_SCHED_SPOF` warn: a `scheduler` with `count: 1` ("While it restarts, jobs due in that minute are not started.").
- `F_SCHED_TWICE` fail (through `noDuplicates`): `count: 2`, `lock: "none"`.
- `F_SCHED_NO_LOCK` fail: `lock: "lease"` but no arrow to a `coord`, a `cache`, or a database whose engine has `cas`.

---

## 11. Stage 5: judge (everything → verdict, score, feedback)

Module `eval/judge.js`: `evaluate(design, lab, practice, { sample = false } = {}) → Result`.

```
compiled = compile(design, lab, practice)
tests    = practice.tests filtered to `sample` ones when sample is true
for each trace test:  result = runTrace(compiled, practice, test)
for each load test :  sim = simulateTest(compiled, lab, practice, test)
findings = analyse(compiled, practice, lab, sims)          // once; the dynamic parts read every test's sim
for each load test :  result = check(test, sim, findings)
```

`analyse` runs once per evaluation. Its findings that depend on a simulation (`F_STALE` numbers, `F_BACKLOG`,
`F_HOT`) use the worst value over the load tests that were run.

### 11.1 Checks

A trace test has one implicit check: the response equals the expected one.

Load-test checks. `op` is optional everywhere: without it the check applies to **every** operation it makes sense
for, and passes only when it passes for all of them. `from` / `to` (minutes of the test, multiples of the tick)
limit a check to a window.

| `kind` | Fields | Passes when |
|---|---|---|
| `slo` | `op?`, `availability?`, `p99Ms?`, `from?`, `to?` | For each operation: user-level availability over the test (or window) ≥ `availability` (default: the operation's `slo.availability`) **and** the share of its calls slower than `p99Ms` (default: `slo.p99Ms`) ≤ 1%. An operation without the value is skipped for that half |
| `completes` | `op?`, `withinSec?` | Every deferred step's `worstDelaySec` ≤ its `withinSec` (or the check's) and nothing was left undone at the end |
| `fresh` | `op?` | No `F_STALE` fail for the operation (§10.3), using this test's simulation |
| `noCrash` | `type?` | No node (of that type) crashed from overload. Crashes caused by a fault do not count |
| `noLostWrites` | — | The simulator's `lost` is 0, no `eventsLost`, and no fail finding from §10.2 |
| `noDuplicates` | `op?` | No `F_DOUBLE` and no `F_SCHED_TWICE` for the operation |
| `ordered` | `op?` | No `F_ORDER` fail |
| `atomic` | `op?` | No `E_TX_SPLIT` and no `F_DUAL_WRITE` fail |
| `fits` | — | No `F_STORAGE`, `F_CACHE_FULL`, `F_RETENTION` |
| `cost` | `max` | The test's monthly bill ≤ `max` dollars |
| `has` | `type` | The design has a node of that type that some plan uses. (Kept for teaching tests such as "the video goes out through a CDN"; prefer a fault or an SLO that needs it) |

Not available in v2 (the validator refuses them when `v` is 2): `availability`, `p99` (use `slo`), `requires`,
`redundant`, `multiAz` (use faults; §10.7 explains), `role` (use operations).

Each check result: `{ ...check, ok, value, detail }` where `value` is the number shown ("99.2%", "$41,300",
"p99 480 ms") and `detail` names the operation, node and minute it is about.

### 11.2 Verdict

- A test is `ok` when it has no error and all its checks are ok.
- `verdict`: `"error"` when compiling failed (`compiled.ok` false); else `"accepted"` when every test run is ok;
  else `"failed"`.
- A plan error fails the trace test of that operation, and every load-test check that concerns that operation
  (its calls count as failed: availability 0 for it).

### 11.3 Score

The mark out of 100 keeps v1's parts and weights (`WEIGHTS` in `judge/judge.js`): requirements 15 (functional 10,
non-functional 5), estimates 10, API 10, key decisions 15, design 50, minus 3 per hint (at most 15).
Only the **design 50** is computed differently for a v2 problem, so that the number of tests in one area does not
decide the mark:

| Area | Points | Its checks |
|---|---|---|
| Function | 15 | trace tests |
| Scale and speed | 15 | `slo`, `completes`, `noCrash`, `fits`, `has` in load tests **without** faults |
| Resilience | 10 | every check in load tests **with** faults, except those in the next two rows |
| Correctness | 5 | `noLostWrites`, `noDuplicates`, `ordered`, `atomic`, `fresh` (in any test) |
| Cost | 5 | `cost` |

Points for an area = its points × (checks passed ÷ checks in the area). An area with no checks gives its points to
the others in proportion. `design = Σ areas`, not rounded; the total is rounded once, as v1.
`evaluate()` returns `designPoints` (0–50); `score()` in `judge/judge.js` uses it when present, else v1's
`50 × passed / total`.

### 11.4 Feedback: why a check failed

Every failed check gets one or two sentences in `why`, built from the simulation, never generic. For `slo`:

```
1. In the check's window, find the operation's worst tick tw: lowest ok share (availability half failed), or highest slow share (p99 half failed).
2. On the operation's plan at tw, pick the culprit node: a node that is down; else one with rho ≥ 1; else the one with the highest rho.
3. Find the trigger: the latest event at the culprit or a fault, at most 15 minutes before tw
   (zoneDown, crash, cold, cacheFlush, spike, hotPart, scaledOut pending, backlog).
4. Write:  "At {clock of tw} {culprit} {state}; {x}% of {operation} calls {failed | took longer than {p99Ms} ms} (the test allows {y}%)."
           + (trigger ? " It began when {trigger in words}." : "")
           + " " + advice(culprit type, state, plan)
```

`state` in words: "was down", "was at {pct}% of what it can take", "was the slowest step ({ms} ms of {total})".

`advice`:

| Culprit and state | Advice |
|---|---|
| Service over capacity | "Add instances or a larger size. New instances take {warmupMinutes} minutes, so a sudden rush needs them started beforehand." |
| Service down, `zones: 1`, during `zoneDown` | "Spread it over two or three zones." |
| Database over capacity, mostly reads | "{step} costs {work} units through {how}. Put a cache in front, add read replicas, or give it a key or index." (name the costliest reading step on that node) |
| Database over capacity, mostly writes | "Replicas don't help writes. A larger size, shards, or a queue in front to smooth the burst." |
| Database down without a standby | "Give it a standby in another zone (Multi-AZ): it is back in {failoverMinutes} minutes instead of {downMinutes}." |
| Cache over capacity | "A larger size or more nodes." |
| Cache cold | "While it refills, its misses land on {database}. Size the database for that, or keep a replica so the cache survives." |
| Load balancer, API Gateway or queue at its limit | "It refuses what is over {limit} a second. Put a CDN in front for what can be cached, or split the traffic over two." |
| External service slow or down | "Don't make the customer wait for {external}: answer, then do it from a queue with retries." |
| Latency with no node over 70% | "The time is the path itself: {n} calls one after another ({list}). Cut a step, cache a read, or defer what can wait." |
| Backlog (`completes`) | "{consumer} takes {x} a second and {y} arrive: more workers, or cheaper work per message." |

Other checks: `cost` names the three most expensive nodes with their monthly cost; `noCrash` names the node and
minute; correctness checks use the finding's `title` + `fix`.

Trace tests reuse the plan error or the field that differs ("The response has no `long_url`: the table
{table} in {store} has no such field.").

### 11.5 The result object

Keep v1's shape so the workspace and the server keep working, and add to it:

```ts
Result = {
  verdict: "accepted" | "failed" | "error",
  passed: number, total: number,
  results: [ { test, id, ok, error?, checks: [...], why: [string],
               metrics?: { availability, p99, avgMonthly },      // worst operation's numbers; avgMonthly = the test's bill
               ops?: { [opId]: OpTotals }, timeline?: Timeline, events?: [Event],     // load tests
               request?, expected?, got?, trace? } ],                                // trace tests (v1 field names)
  first: firstFailedResult | null,
  metrics: { availability, p99, avgMonthly } | null,           // as v1: worst over the load tests
  designPoints: number,                                         // §11.3
  findings: Finding[],
  plans: { [opId]: { ok, error?, steps } }                      // for the "How your design was read" panel (§12.1)
}
```

`timeline` is large: the server's worker must not send it back to the API thread (it already returns only
`verdict`, `passed`, `total`, `metrics`; add `designPoints`).

---

## 12. Fitting it into the app

### 12.1 Frontend

All in `tech-katta/frontend/src/`. The existing frontend style is terse; **the new `eval/` modules are engine code:
write them as readable ES modules with comments, like `lab/engine.js` and `judge/judge.js`, not like the JSX files.**

1. **Dispatch.** In `judge/judge.js`, at the top of `judge()` and `runTest()`:
   `if (problem.v === 2) return evaluate(design, lab, problem, opts);` (for `runTest`: evaluate with only that
   test and return its result). Nothing else in that file changes, except `score()` reading `designPoints` (§11.3).
   `sameDesign` works for v2 designs unchanged.
2. **The canvas** (`lab/Lab.jsx`). In problem mode with a v2 problem:
   - The palette lists `lab.eval.components` (grouped by `group`), with the database presets of §5.2.
   - The settings panel is generated from each type's `settings` list (one generic renderer for `number`, `choice`,
     `bool`, `size`, `fields`), plus the existing schema editor for `database` (and for `cache` `structures`).
     Do not write a hand-made panel per new type.
   - A selected arrow shows "Carries: everything / only reads / only writes / choose operations" (`carries`).
   - Connection rules come from §5.6's "may point at" lists: put them in `eval.json` per type as `"to": [types]`
     (with the `s3`-only and `cdc`-only conditions as `"toIf"`), and have both the canvas and `cleanDesign2` read them.
   - **"Run traffic" is replaced by "Replay"** for v2 problems: after Run or Submit, a load test's row has a
     "▶ Replay" button. Replay shows that test's `timeline` on the canvas: a scrubber over the test's minutes; at
     the chosen minute each node shows its load bar (`rho`, amber from 70%, red above 100%, as today), "DOWN" when
     not up, instances, backlog; operations' rates and success are shown in the status line. No live simulation
     runs in the browser outside `evaluate()`.
   - The $200,000 credit meter is hidden for v2 problems (the `cost` check carries that lesson).
3. **The workspace** (`solve.jsx`).
   - Description tab: under the statement, a table "What the system must do": one row per operation with its
     request, its share of traffic, and its targets ("99.9% · p99 200 ms", "never twice", "at most 60 s old").
     Then the example tests (trace and load).
   - Results: per test as today. For a load test, one line per operation: availability, p50, p99, and for deferred
     work the worst delay. Then **Findings** (title; story and fix when opened; selecting one highlights its nodes).
   - A panel "How your design was read": per operation, its hops in order ("Clients → Load Balancer → Service →
     Cache (hit 86%) → on a miss Database: key lookup on `links.code`"). This is the plan; it is what makes the
     evaluator's reading visible (P6, P7). "▶ Watch" plays the same hops with the sample data (§9.2).
   - Phones: the same lists stacked; Replay is available in the Canvas tab.
4. **The landing page** (`landingproblem.jsx`, `lablite.jsx`) runs IND vs PAK's example load tests. When that
   problem is converted, `landingTests` selects `sample` load tests (tests without `op`), and the phone's three
   controls must still be able to pass them: keep at least two sample load tests a design without storage can pass
   (rule already in `12-OPERATING-RULES.md`).
5. **Saved designs.** `lab/store.js` `cleanDesign(d, lab, id)` is used when reading saved designs and by the server.
   Extend it: when a node's type exists only in `lab.eval`, or the design belongs to a v2 problem, clean with
   `cleanDesign2`. Keep `STORE_VERSION` 1: v2 designs are valid v1 containers (`{nodes, edges}`), old designs have
   no v2 keys. Old saved designs of a problem that becomes v2 stay; their v1-only settings are ignored.
6. **Copy.** Every user-facing string of the evaluator that is not a computed sentence goes in `content/site.json`
   under `problems.solve` (validated), as the rest of the workspace. Computed sentences (§11.4, findings) are built
   in code from templates kept together in `eval/words.js`.

### 12.2 Backend and content

All in `tech-katta/backend/src/` and `tech-katta/content/`.

1. `content/eval.json` is loaded in `content/store.js` `loadContent` (after `lab.json`), validated, and served as
   part of the Lab catalogue: `bodies.lab = { ...lab, eval }`. No new endpoint. The frontend and the judge worker
   both receive it as `lab.eval`.
2. `content/validate.js`:
   - `validateEval(evalCat, lab, problems)`: every field of §5.4 and §5.6 (types unique, numbers finite and of the
     right sign, every engine id exists in `lab.json`, every `caps` entry is a known capability, `settings` shapes,
     `to` lists name known types).
   - `validatePractice` dispatches on `v`. `validatePractice2` checks everything in §6: entities (fields, at least
     2 sample rows whose fields exist), operations (ids unique, client shares add to 1, steps reference known
     entities and fields, `kind: "read"` has no writing step), tests (every operation has a trace test, a sample
     of each kind, faults and checks are known kinds with valid fields, minutes are multiples of the tick and
     inside the test), `start` / `reference` / `wrong` designs pass `cleanDesign2` unchanged (cleaning them changes
     nothing) and reference schemas have no errors, `locked` ids exist in `start`.
   - Add a negative test in `backend/test/content.test.js` for every rule (the file's existing style).
3. `store.js` `buildBodies`: `summary`'s `tests` count is unchanged. The article is still served without
   `reference` and `wrong`; `mutantsAllowed` is also removed.
4. The judge worker (`auth/judge-worker.js`) already calls `judge(design, lab, practice)`: it needs no change
   beyond returning `designPoints`. `routes.js` passes it to `score`. The stored submission gets `engine: 2`.
   The 256 KB body limit, the per-account lock and the 10 s time limit stay.
5. `backend/.env.example`: no new setting.
6. Update `content/README.md` (format of v2 problems, `eval.json`) in the same PR as each format change.

### 12.3 Rules that protect v1 while both exist

- `lab/engine.js`, `judge/requests.js`, `lab/challenges.js`, `lab/schema.js`: **no behaviour change**. You may
  export a helper that already exists there, nothing more. The 8 challenges and every v1 problem keep their exact
  verdicts (their calibration tests in `judge/judge.test.js` must stay green in every PR).
- A problem is v1 or v2, never both. Converting one is a content PR of its own (§16).
- Another session may be adding v1 problems while you work (the 11 problems of "stage E", see `18-TODO.md`).
  Fetch `main` before each PR and do not edit their files.

---

## 13. Files and module interfaces

```
tech-katta/
  content/eval.json                       the v2 catalogue (§5.4)
  frontend/src/eval/
    index.js        export { evaluate } and the pieces the UI needs
    design.js       cleanDesign2(design, lab) ; allowedEdge(fromNode, toNode, lab) ; settingsOf(type, lab) ; configOf(node, lab)
    graph.js        buildGraph(design) → { byId, out, inn, flowEdges, cdcEdges, topo, errors }
    access.js       holds(table, entity, practice) ; accessPath(node, table, step, practice, lab) ; capsOf(node, lab)
    compile.js      compile(design, lab, practice) → Compiled (§7)
    trace.js        expected(practice, op) ; runTrace(compiled, practice, test) (§9)
    latency.js      gammaQ, gammaTail, phi, hopTimes(hop, rho), moments(plan, state) (§8.8)
    hits.js         cacheHit(...), cdnHit(...) (§8.6)
    simulate.js     simulateTest(compiled, lab, practice, test) (§8)
    faults.js       startFault / endFault per kind (§8.13)
    analyse.js      analyse(compiled, practice, lab, sims) → Finding[] (§10)
    judge.js        evaluate(design, lab, practice, opts) → Result ; check(test, sim, findings) (§11)
    words.js        every sentence template: errors, why, findings
    *.test.js       one test file per module (node --test), listed in frontend/package.json "test"
  frontend/src/judge/judge.js             + dispatch (§12.1)
  backend/src/content/validate.js         + validateEval, validatePractice2
  backend/src/content/store.js            + load eval.json
  tools/eval/
    calibrate.mjs   run a problem's calibration and mutation score (§14)
    convert.mjs     helper that prints a v1 problem as a v2 skeleton (§16)
    README.md
tech-katta-context/
  evaluator.md                            this file: keep it true (update it in the same change as any deviation)
  tools/e2e/eval-*.js                     browser checks for the v2 workspace
```

Rules for the `eval/` modules:
- Pure functions. No `Math.random`, no `Date`, no globals, no DOM, no imports outside `eval/`, `lab/schema.js`
  and `lab/engine.js` helpers that are pure (`trafficAt`, `sizeOf`, `engineOf`, `monthlyCost` for the v1 types).
  They must run in the browser, in `node --test`, and in the backend worker thread.
- Iterate nodes, edges, operations, steps and tests in the order given. Never iterate a `Set` or object whose
  insertion order depends on anything else.
- Compare floats with a tolerance of `1e-9`. Round only when building text or the `timeline`.
- Never throw for bad input: return an error result. (The worker turns a throw into `judge_failed`.)
- Per-node maps use `Object.create(null)` (ids are the learner's text; `__proto__` must be an ordinary key).

---

## 14. Tests and calibration

### 14.1 Unit tests (write them with each module, before using it from another)

| Module | Must test |
|---|---|
| `latency.js` | Every vector of §8.8. `gammaQ` grows with `p`; `gammaTail(M, V, gammaQ(M, V, 0.99))` is 0.01 ± 0.002 for `k` from 0.2 to 50 |
| `hits.js` | Every vector of §8.6. Hit rate never falls when memory or TTL grows; always inside [0, 0.999] |
| `graph.js` | Loop detection; change-data-capture arrows do not count as loops; order is stable when node order is |
| `access.js` | One case per row of §7.4, pass and fail, on each engine that differs |
| `compile.js` | Routing preference; several handlers; a microservice design (two Services behind a gateway, each reaching different stores); look-aside vs direct; deferred steps; copies and every feed of §7.6; `E_UNFED`; each error code |
| `simulate.js` | The vectors of §8.4, §8.7, §8.10; a crash and recovery; autoscaling too late for a jump; a zone lost with `zones` 1, 2, 3; a cache flush; each fault kind |
| `analyse.js` | For each finding: one design that triggers it and the nearest design that does not |
| `judge.js` | Check kinds; the area scoring with an empty area; `sample` filtering; result shape |

### 14.2 Calibration of every v2 problem (in `eval/calibration.test.js`, as v1 does in `judge/judge.test.js`)

For each article with `practice.v === 2`:
1. the reference is `accepted`;
2. each `wrong` design fails the test it names (`fails`);
3. the starting design is not accepted, and fails at least one **sample** test;
4. at least one wrong design fails a trace test, one fails a load test without faults, one fails a load test with
   a fault, and (when the problem has correctness checks) one fails a correctness check;
5. the rubric's own answers grade fully (v1's test, unchanged);
6. the reference has no `fail` findings and at most 3 `warn` findings (each one listed in the test with a reason);
7. the mutation score of §14.3 is 100% of the mutants not listed in `mutantsAllowed`.

### 14.3 Mutation testing: is the test suite strong enough?

A suite is strong when breaking the reference in any one way makes some test fail. `tools/eval/calibrate.mjs`
(and the calibration test) generate these **mutants** of the reference, one change each:

| Mutant id | Change |
|---|---|
| `remove:<node>` | Delete the node; arrows into it are joined to what it pointed at (for every pair that §5.6 allows) |
| `half:<node>` | Halve `count`, `nodes`, `partitions`, `parallelism` or `shards` (rounding down, at least 1); skipped when already 1 |
| `smaller:<node>` | The next smaller `size` |
| `onezone:<node>` | `zones: 1`; `multiAz: false`; `replica: false` |
| `noindex:<node>:<table>:<i>` | Remove one index, or the sort key |
| `engine:<node>:<id>` | Change a database's engine to each other family once |
| `ttl:<node>` | Cache `ttlSec` × 100 |
| `standard:<node>` | A `fifo` queue or a `stream` becomes a `standard` queue |
| `nodlq:<node>` | `dlq: false` |
| `cut:<from>-<to>` | Remove one arrow |

Each mutant must be **killed** (not accepted). A mutant that is rightly still accepted (the reference has spare
room on purpose, or two equal ways) is listed in `practice.mutantsAllowed` and must be few: more than a fifth of
all mutants allowed means the suite is weak or the reference is oversized; fix the tests or the reference.
The tool prints the surviving mutants so the author can add a test or a wrong design for each.

Also check the opposite direction: **the reference with every `count` doubled must still be accepted except for
the `cost` check** (more capacity never breaks function).

### 14.4 Properties that must always hold (`eval/properties.test.js`)

Run these over every v2 reference, start and wrong design, and over 50 designs generated by applying 1–3 random
mutants with a fixed seed list written in the test (a tiny seeded generator in the test file; never `Math.random`):

1. **Deterministic**: evaluating twice gives deeply equal results.
2. **Order does not matter**: shuffling `nodes` and `edges` and renaming ids gives the same verdict, the same
   check results and the same numbers within 1e-6.
3. **More capacity never hurts**: raising one node's `count` (or size) never lowers any operation's availability,
   never raises any p99 by more than 1e-6, and never raises `rhoMax` elsewhere… except downstream of it (a faster
   front sends more to the back: allowed), so assert it only for availability of the whole operation **when the
   downstream nodes were below 100%**.
4. **Less traffic never hurts**: halving a test's `rps` never lowers availability or raises p99.
5. **Names do not matter**: changing every `name` changes nothing but text.
6. **Bounds**: every availability in [0, 100], every share in [0, 1], no `NaN` or `Infinity` in any result.
7. **Cost adds up**: the bill equals the sum of the nodes' costs plus storage and transfer.

### 14.5 Speed

Budget, measured in `eval/perf.test.js` on the largest reference design: one load test of 4 hours under 60 ms,
a whole Submit (all tests) under 600 ms on the CI machine. The server allows 10 s; the browser must feel instant.
If a budget is missed: precompute per-test constants outside the tick loop, reuse arrays, and avoid allocating
inside the flow pass, before changing any formula.

### 14.6 Browser checks

For each UI phase add a script under `tech-katta-context/tools/e2e/` (see `no-lab.js` for the pattern: it wraps
Chromium with `open-site.js` so production pages open without signing in). Check on desktop 1440 × 900 and iPhone 13:
the palette groups, a generated settings panel, Run on the starting design fails with a reason, the reference
(read from the content folder) is Accepted, a finding highlights its nodes, Replay moves the bars, "How your design
was read" lists the hops, no sideways scroll, `errors: []`.

---

## 15. Building it: phases

Each phase is one or a few PRs in `tech-katta`, then the docs and ledger update in this repository (the normal
workflow). **A phase is done only when its acceptance list is true on `main` and in production.**
Do not start a phase before the previous one is done.

### Phase 0 — scaffolding (no visible change)
- `content/eval.json` with the 8 existing types only (§5.6 for `client`, `cdn`, `apigw`, `lb`, `server`, `database`,
  `cache`, `queue`), `work`, `limits`, `engines`. Loaded, validated (`validateEval`), served as `lab.eval`.
- `frontend/src/eval/` with `design.js`, `graph.js`, `latency.js`, `hits.js` and their tests.
- The dispatch in `judge.js` (`v === 2` → `evaluate`), with `evaluate` returning `verdict: "error"`,
  "This problem needs a newer version of the site." No article has `v: 2` yet.
- **Accept:** all existing tests green and unchanged; `/v1/lab` contains `eval`; new unit tests green; production
  identical for users.

### Phase 1 — compile and trace
- `access.js`, `compile.js` (§7 for the 8 types; no `publish`, `call`, change data capture yet), `trace.js`.
- A **fixture problem**: `frontend/src/eval/fixtures/url-shortener.v2.json` (§6.6 completed with a reference and
  wrong designs). It is a test fixture, not content.
- **Accept:** unit tests of §14.1 for these modules; on the fixture, the trace tests pass for the reference and fail
  with the right message for: no store, `code` not the key, a read behind a queue, a table missing a field.

### Phase 2 — simulate, analyse (first rules), judge
- `simulate.js`, `faults.js` (`crash`, `zoneDown`, `instanceCrash`, `groupDown`, `spike`, `cacheFlush`, `slow`),
  `analyse.js` with §10.2, §10.3, §10.7, §10.8, `judge.js`, `words.js`. Not yet: §8.9.
- `tools/eval/calibrate.mjs` with mutation testing; `calibration.test.js`, `properties.test.js`, `perf.test.js`.
- **Accept:** the fixture problem passes all of §14.2 including a mutation score of 100% (with allowed mutants
  listed); §14.4 and §14.5 green.

### Phase 3 — the workspace for a v2 problem, and the first live conversion
- UI of §12.1 (palette from the catalogue, generated settings, arrow "Carries", per-operation results, findings,
  "How your design was read", Replay, Watch from the plan).
- Convert **one** live problem: the URL shortener (§16). Its old saved designs keep working (§12.1 point 5).
- Browser checks (§14.6). Tell the owner it is live and ask them to try it before converting more.
- **Accept:** the converted problem is Accepted with its reference on production, on desktop and phone; a signed-in
  Submit is judged on the server with the same verdict; every other problem is unchanged.

### Phase 4 — messaging and real time
- New types: `stream`, `pubsub`, `realtime`, `external`; change data capture arrows; direct object storage; steps
  `publish`, `call`; faults `externalDown`, `poison`, `hotKey`; analyser §10.4 (ways 1, 2, 5), §10.5, §10.6, §10.9.
- Convert the problems that need them (chat app, notifications, news feed, video streaming, IND vs PAK, photo
  sharing, payments), two or three per PR, each calibrated.
- **Accept:** each converted problem meets §14.2; the landing page's IND vs PAK still works on laptop and phone.

### Phase 5 — timeouts and cascading failure
- §8.9 (concurrency, timeouts, call retries, circuit breakers), `abuse` fault and gateway rate limits.
- Add a "slow dependency" test to the converted problems where it teaches something (payments, notifications).
- **Accept:** a unit test shows the cascade: with a 20× `slow` fault on the database and `timeoutMs` 30,000 the
  Service's capacity collapses and unrelated operations fail; with `timeoutMs` 300 they do not.

### Phase 6 — scheduling, stream processing, coordination, shards
- Types `scheduler`, `processor`, `coord`; `shards` and `shardKey`; step `rank`, `incr` on all engines; analyser
  §10.4 (ways 3, 4), §10.10.
- Convert the remaining problems (job scheduler, ad clicks, leaderboard, key-value store, web crawler, ticket
  booking, and the rest). Then the 11 added in stage E.
- **Accept:** every problem is v2 and meets §14.2.

### Phase 7 — after everything is v2
- Decide with the owner: convert the 8 challenges to v2 load tests with stars, or leave them on v1.
- If nothing uses v1 any more: remove `judge/requests.js`, the v1 branches of `judge/judge.js`, `practice.fixed`
  and `roles` from `lab.json`, and their tests, in one PR, after checking no saved design or content needs them.
- `workflow` type only if a problem needs it.

---

## 16. Converting a v1 problem to v2 (recipe)

Do one problem per commit. `tools/eval/convert.mjs <slug>` prints a skeleton; finish it by hand.

| v1 (`practice`) | v2 |
|---|---|
| `data.entities` (`rows`, `sample`), `data.fields`, `data.aliases` | `entities` (add `rowBytes`, `fields` with types taken from the reference schema), `aliases` |
| Each request test (`request`, `steps`, `respond`, `async`) | One **operation** (`request`, `steps`, `respond`) + one trace test `{op}`. `async: true` → the writing steps get `timing: "defer"` and the response status stays 202 |
| `fixed.writePct`, the mix described in `brief` | `share` of each operation (reads vs writes as the article's "numbers that matter" give them) |
| `fixed.queriesPerRequest` | The number of steps in the operations (if the article says "4 queries per menu view", the operation has 4 reading steps or one with `times: 4`) |
| `fixed.hitPct` | `keys: {entity, skew, active}` on the reading operations. Choose `active` so that the reference's cache reaches about the old hit % (use the vectors of §8.6); say in `brief` how popular items are |
| `fixed.cdnHitPct`, `fixed.cdnLive` | `cacheable: {ttlSec}` and `keys` on the operation; `live: true` |
| `tests[].traffic`, `hours`, `startHour` | The same, in a load test |
| `tests[].chaos: [{minute, type}]` | `faults: [{minute, kind: "crash", type}]`; prefer `zoneDown` where the old test meant "a group dies" |
| Checks `availability`, `p99` | `slo` (put the targets on the operations; override in the check only when a test is deliberately looser) |
| Checks `redundant`, `multiAz` | A `zoneDown` (or `crash` of `database`) test with an `slo` check |
| Check `role` (and each role in the reference) | Nothing: make sure an **operation** needs what the role stood for (a `near` query for "geo index", a `rank` step for "sorted set", a `compute` step with `isolated` for "sandboxed runners", a `publish` step for "WebSocket gateway", an `ordered` operation for "operation log") |
| Check `has cdn` | Keep as `has`, or better an operation that cannot meet its SLO without one |
| The wrong design "Right sizes, general parts" | Delete it: a design without the needed capability now fails a trace test by itself. Keep one wrong design per area (§14.2 point 4) |
| `rubric`, `hints`, `referenceNote` | Unchanged. Reword a hint that names a role or a fixed percentage |
| Key decisions about idempotency, ordering, staleness, durability | Keep them, **and** set the matching operation field (`effect: "once"` + `idempotencyField`, `ordered`, `consistency`, `durable`) with a check (`noDuplicates`, `ordered`, `fresh`, `noLostWrites`) so the design itself is tested on it |

Then:
1. Rebuild the reference on the v2 canvas rules (same shape; settings that now matter: `zones`, cache size and
   TTL, indexes, queue kind). Keep it laid out neatly, left to right, about 240 apart.
2. Set `cost` from the reference's bill: `max = round(reference bill × 1.6)` to a tidy number (v1's rule).
3. Run `node tools/eval/calibrate.mjs <slug>`; add tests or wrong designs until every mutant is killed or allowed.
4. Update the article's text only where it names the Lab's old numbers. Check the Description tab reads well.
5. `cd frontend && npm test && npm run build`; `cd backend && npm test`; browser check of the problem (start fails,
   reference accepted, phone).

---

## 17. What the model leaves out (tell the truth about it)

Written for the learner in each problem's `referenceNote` or the Description where it matters.

- **It is a fluid model.** Averages and fitted distributions, not single requests. Rare interleavings are covered
  by the rules of §10, not by simulation; a rule that does not exist yet finds nothing.
- **One region.** No multi-region replication, geo-routing or cross-region partitions. (A later addition: a
  `region` setting per node and a `regionDown` fault.)
- **Networks are perfect inside a zone**: no packet loss, no partitions between two live nodes.
- **Zones are worst-case**: every single-zone thing is assumed to be in the zone that fails.
- **Memory and disk of Services** are not modelled; only work units and connections.
- **Security** (authentication, encryption, abuse beyond the `abuse` fault) is not judged.
- **Prices and capacities are rules of thumb** in one currency and one region; good for comparing designs, not for
  budgeting.
- **Written answers** are graded by keywords, ranges and exact choices (v1, unchanged). No AI reads them.
- **Deploys, schema migrations, backfills, monitoring** are outside the canvas.

## 18. Decisions

### Decided in this document (2026-11-10)
1. The evaluator is a compiler (plans), a fluid simulator, a rule-based analyser and a judge, sharing one plan per operation.
2. v2 is built beside v1; a problem opts in with `practice.v: 2`; v1 is removed only when nothing uses it.
3. Roles and `fixed` settings do not exist in v2. Hit rates, the read/write mix and query costs are derived.
4. The palette grows from 8 to 16 types (§5.2); databases keep one type with presets.
5. A p99 target is judged as an SLO: at most 1% of calls slower, weighted by traffic.
6. Design points are split by area (function 15, scale 15, resilience 10, correctness 5, cost 5).
7. Test strength is measured by mutation testing; a problem ships only at 100% of non-allowed mutants killed.
8. No AI in the evaluator (the owner's decision of 2026-11-07 stands).

### For the owner to decide (ask before the phase that needs it)
- Phase 3: whether the first converted problem goes live for everyone at once or behind a "new evaluator" switch.
- Phase 3: Replay replaces "Run traffic" inside problems. (The challenges keep "Run traffic" on v1.)
- Phase 7: what happens to the 8 challenges.
- Whether findings should also show for an **accepted** design (recommended: yes, `warn` and `info` only).

### Decisions made during implementation
*(The implementing session adds one line per decision here, with the date and the test that pins it.)*

Phase 0 (2026-11-10, tech-katta #287):
- Setting kinds are `number`, `choice`, `bool`, `size`, `fields`, `engine`, `schema`, `structures` (the last three
  are the database engine, the database schema and the cache's structures). Pinned by `backend/test/content.test.js`.
- `cleanDesign2` never fills in defaults (a clean design comes out unchanged); `configOf(node, lab)` applies them.
  This replaces §7.1 step 2's "else the default". Pinned by `eval/phase0.test.js`.
- The `graph` engine has the `tx` capability (lab.json lists `transactions` for it; §5.3's table omits it).
  Pinned by the features-agree test in `eval/phase0.test.js`.
- `to` in eval.json lists only types that exist in it (the 8 of phase 0); new types add themselves to `to` when
  they arrive. `toIf` holds conditions on the target's settings (Clients and CDN may point at a database only when
  its engine is `s3`); `toCdc: true` marks the database's arrows as change data capture (needs `cdc`).
- A cache's memory per size is `sizeExtras.<size>.memoryGb` in eval.json (lab.json sizes stay unchanged).
- The transfer price is the top-level `egressPerGb` (0.09), with `egressPerGb` on the CDN component (0.08).

Phase 1 (2026-11-10, tech-katta #288; the tests named are in `frontend/src/eval/phase1.test.js`):
- Binding a step needs only the fields **that step** uses. A reading step may bind to a table that has the lookup
  fields but lacks some returned fields: the trace returns those fields empty and the test fails on them, as in v1
  ("trace: each wrong design…"). `holds()` (for copies and feeds) is: the table's name is the entity's (or its
  singular), or it has every field of some reading step on the entity ("access: which tables hold an entity").
- A `get` may use an index whose first fields are the lookup fields in any order (v1's rule; §7.4 said "exactly").
- Extra plan codes: `E_NO_DATABASE`, `E_NO_SCHEMA` and `E_NO_STORE` split §7.5's `E_NO_STORE` by cause;
  `E_NO_PATH` carries the access path's `why`; `E_MISSING_FIELDS` is for a write to a table that lacks a written
  field; `E_NO_TX` is for a transaction on an engine without `tx`; `E_NOT_YET` is for `call` and `publish` until
  phase 4 ("compile: graph errors…", "compile: transactions…").
- A plan has `roots` (one `source` hop per Clients node, `share: {kind: "split", group: "sources"}` when several)
  and `root = roots[0]`. Several targets under a CDN get `share: {kind: "split", …, cdnMiss: true}`.
- A write whose only path to its store passes a cache goes through it (a `cache` hop of `work.put`, write-through).
  Other look-aside caches in front of the store get `invalidate` hops ("compile: reads go through a look-aside…").
- A `consume` hop's work is `work.consume + work.handle` (the worker runs the message); deferred `compute` adds to it.
- `E_UNFED` is not raised for an entity whose writing operation itself failed to plan (one mistake, one error).
  `W_UNUSED` is reported only when every operation was planned (a failed route makes every node look unused).
- `runTrace(compiled, practice, test, lab)` takes `lab` (for names in the trace). Trace entries keep v1's
  `{n, at, from, title, json}` and add `kind`, `back`, `after`, `query`, `table`.

Phase 2 (2026-11-10, tech-katta #289; tests in `frontend/src/eval/phase2.test.js`, `calibration.test.js`,
`properties.test.js`, `perf.test.js`):
- The simulator keeps each tick's latency moments per operation (`ticks[op].F/M/V`), so an `slo` check with its
  own `p99Ms` is judged against that limit, not the operation's ("judge: check kinds on the fixture").
- §14.4 properties 3 and 4 are asserted only where every node other than the Services stayed below 100% load:
  once a node is overloaded its crash timers make outcomes non-monotone. The p99 half of property 4 is asserted
  only on healthy runs (no overload crash, availability ≥ 99%) and allows a rise of 2% + 1 ms: fewer reads can
  lower a derived hit rate (items expire before they are asked for again).
- A write that passes through a cache (write-through) counts as clearing it: that cache's staleness is 1 second.
- The info line of §10.3 has the code `F_STALE_INFO` and is added only when the staleness is above 0.
- `F_OVERSIZED` is not reported for managed components. `evaluate()` returns at most 12 findings plus
  `allFindings` (the full count).
- Mutants also halve a database's `replicas` (`half:<node>:replicas`). Mutant generation lives in
  `eval/mutants.js` and the calibration checks in `eval/calibrate.js`, shared by the tool and the test.
  A problem may explain each allowed mutant in `mutantsAllowedWhy: {id: reason}`.
- Not yet: hot keys (§8.11), shard routing of steps without the shard key, the `live` CDN rule beyond success,
  timeouts and breakers (§8.9, phase 5), change data capture plans.
- The fixture was calibrated: the reference is 24 × c5.2xlarge over 3 zones, a cache.m5.large with a replica,
  and a Multi-AZ db.r5.2xlarge with 2 read replicas; the zone test checks each operation with p99Ms 2000 (a
  failover makes calls slower for a minute or two). The backend's judging worker passes `designPoints` back.

---

## Appendix A. Codes

| Code | Kind | Section |
|---|---|---|
| `E_NO_CLIENTS`, `E_CLIENTS_ALONE`, `E_LOOP`, `E_CDC` | design error | §7.2 |
| `E_NO_SOURCE`, `E_NO_HANDLER` | plan error | §7.3 |
| `E_NO_STORE`, `E_NO_ACCESS` (the `why` of `accessPath`), `E_UNFED`, `E_READ_BEHIND_QUEUE`, `E_SYNC_BEHIND_QUEUE`, `E_TX_SPLIT`, `E_NO_SANDBOX`, `E_NO_EXTERNAL`, `E_NO_CONNECTION`, `E_TOO_TANGLED` | plan error | §7.5, §7.7, §9.3 |
| `W_UNUSED` | warning | §7.2 |
| `F_NOT_DURABLE`, `F_WRITE_BACK`, `F_SINGLE_ZONE`, `F_NO_CATCH_UP` | finding | §10.2 |
| `F_STALE` | finding | §10.3 |
| `F_DOUBLE` | finding | §10.4 |
| `F_DUAL_WRITE`, `F_CALL_THEN_WRITE` | finding | §10.5 |
| `F_ORDER` | finding | §10.6 |
| `F_SPOF` | finding | §10.7 |
| `F_BACKLOG`, `F_STORAGE`, `F_CACHE_FULL`, `F_RETENTION`, `F_NO_TTL`, `F_OVERSIZED` | finding | §8.6, §8.7, §8.12, §10.8 |
| `F_HOT` | finding | §10.9 |
| `F_SCHED_SPOF`, `F_SCHED_TWICE`, `F_SCHED_NO_LOCK` | finding | §10.10 |

## Appendix B. Where every number lives

| Number | Where |
|---|---|
| Sizes, hourly prices, limits, base latencies, crash policy, autoscaling, cache warm-up of the 8 v1 types; engines' sizes, prices and schema vocabulary; traffic patterns | `content/lab.json` (unchanged) |
| Tick lengths, retries, client timeout, limits, work units, scan and sort limits, engines' capabilities and storage, the new types and every new setting, allowed arrows | `content/eval.json` |
| Entities, operations, targets, tests, faults, checks | each problem's `practice` |
| Formulas and their constants that are mathematics, not tuning (`Z`, `0.5772`, the normal CDF coefficients, the 0.95 cap on `rho`, the ×19 at saturation, the 1.3 cache overhead, 50 points of presence) | code, with a comment pointing at the section of this file |

