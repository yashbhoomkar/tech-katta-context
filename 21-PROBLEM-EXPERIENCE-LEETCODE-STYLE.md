# 21 — Problems, LeetCode-style: full specification

**Status:** design specification, 12 Nov 2026. **Not built. Not tested.** Unlike `20-UI-REDESIGN-SPEC.md`, none of
the code or numbers here has been run; section 17 says how to prove each part as you build it.
**Who reads this:** the agent that will write the code. Follow it top to bottom. Where it says "owner decides", stop and ask.
**Brief (owner):** "take a step back … think of the evaluator and the entire interview questions and problems
experience. Don't take into consideration the current canvas … We need to make the problem solving experience
LeetCode style." Then: "The .md file will be read and actual code implementation will be done by some lesser
intelligence llm. Also think in depth. Write every single detail."

This design was thought out from first principles. It does **not** reuse the current canvas or judge as a starting
point. It is built **beside** them (new folders, new routes), so nothing live breaks; section 16 says how the old
experience is retired later, and only on the owner's word.

## 0. Rules for the implementing agent

1. Build in the order of section 16. Each step ends with tests that must pass before the next.
2. **The judge is pure functions.** No React, no DOM, no network, no clock, no `Math.random()`. Same input, same output, in the browser and in Node.
3. Do not change the numbers in section 6 or the formulas in section 7. If a problem's reference design fails, the problem file is wrong, not the judge.
4. Do not delete or edit the existing `frontend/src/lab/`, `frontend/src/solve/`, `frontend/src/judge/`, `frontend/src/eval/` or their tests.
5. Before writing backend code, read `backend/src/server.js`, `backend/src/auth/`, `backend/test/submissions.test.js` and `backend/test/judge-pool.test.js` and follow their style (dependency-free Node 22, how routes, auth, rate limits and tests are written). Before frontend code, read `frontend/src/api.js`, `frontend/src/routes.js`, `frontend/src/progress.js`, and `12-OPERATING-RULES.md`.
6. Colours and motion come from `frontend/src/theme/` (Rule 19). No colour codes elsewhere. Use the Katta Paper components of `20-UI-REDESIGN-SPEC.md` section 4.4.
7. Every message the learner sees is written in this file. Copy it exactly.
8. If something here is impossible or contradicts the code you find, stop and write the problem in the pull request. Do not invent a different design.

---

## 1. What "LeetCode style" means here

A loop that takes under a minute and never leaves one screen:

| Step | LeetCode | Tech Katta |
|---|---|---|
| Pick | Problem list: number, title, difficulty, acceptance, status | Same (section 12) |
| Read | Statement, examples, constraints | Statement, **example scenarios**, constraints (section 9) |
| Write | Code in an editor, from a template | A **design** in an editor, from a template (sections 3 to 5) |
| Run | Visible examples, result in about a second | Visible tests, in the browser (section 8) |
| Submit | Hidden tests, a verdict, first failing case | Hidden tests on the server, a verdict, first failing test (section 8) |
| Improve | "Faster than 83 %" | "Cheaper than 71 %", "Faster than 64 %" (section 13) |
| Learn | Editorial, Solutions, Submissions | Same three tabs (section 11) |

Properties that must hold: the answer is exact; the judge is deterministic; feedback is instant and names the cause;
examples are visible and tests are hidden; there are only eight verdict words; everything is on one screen.

## 2. The answer is text, the diagram is output

The learner writes a short text design (15 to 40 lines). The page draws the diagram **from** the text, live, read-only.
Nobody drags boxes. Reasons: text is fast, diffs, copies, has templates and syntax errors, can be shared as a
solution, and the judge reads exactly what was written. On phones a **form view** edits the same text (section 11.4).
The language is called **TKD** (Tech Katta Design). File extension in fixtures: `.tkd`.

## 3. TKD: the language

### 3.1 Shape

- Plain text, UTF-8, at most **200 lines** and **8,000 characters** (more → error `E001`).
- One statement per line. Blank lines allowed. `#` starts a comment that runs to the end of the line.
- Case-sensitive. Keywords are lower case. Names (identifiers) match `[a-z][a-z0-9_]{0,23}`.
- Four kinds of statement: **part**, **table**, **route**, **option**. Order does not matter, except that a name must not be declared twice.
- `client` is a built-in name: where every route starts. It is never declared.

### 3.2 Grammar (EBNF)

```
design     = { line } ;
line       = [ part | table | route ] [ comment ] NEWLINE ;
part       = NAME "=" KIND "(" [ args ] ")" ;
args       = arg { "," arg } ;
arg        = NAME "=" value ;
value      = NUMBER | NAME | "true" | "false" ;
table      = "table" NAME "." NAME "(" column { "," column } ")" [ "index" "(" NAME { "," NAME } ")" ] ;
column     = NAME [ "pk" ] ;
route      = ( "read" | "write" ) REQUEST ":" "client" hop { hop } [ after ] ;
hop        = ( ">" | "|" | "~>" ) NAME [ "[" "replica" "]" ] ;
after      = "then" "invalidate" NAME ;
REQUEST    = [A-Z][A-Z0-9_]{0,31} ;
NUMBER     = digit { digit } [ "." digit { digit } ] ;
```

Whitespace between tokens is free. `>` means "calls and waits". `|` means "if the part on the left has no answer,
ask the part on the right and store the answer on the left" (cache-aside); the part on the left of `|` must be a
`cache` or `cdn`. `~>` means "hands over and answers the client at once" (asynchronous); the part on the right of
`~>` must be a `queue`. `[replica]` after a `sql` name means "read from its replicas, not the primary".
`then invalidate X` is allowed only on `write` routes; `X` must be a `cache` or `cdn`.

### 3.3 Example (the reference design of problem 1)

```
# Design a URL shortener
lb    = lb()
api   = server(count=4, size=medium)
cache = cache(nodes=2, memory_gb=1, ttl_s=3600)
db    = sql(size=medium, replicas=1, sync=true)
ids   = idgen(kind=counter)

table db.links(code pk, url, created_at)

read  GET_LINK:    client > lb > api > cache | db
write CREATE_LINK: client > lb > api > ids > db then invalidate cache
```

### 3.4 What every route must satisfy (checked by the compiler, section 5)

1. Starts at `client`; every other name is a declared part.
2. The first hop operator is `>`.
3. There is exactly one route for every request the problem lists, with the same `read`/`write` word.
4. A `read` route ends at a **store** (`sql`, `nosql`, `objectstore`) or reaches one through `|`.
5. A `write` route reaches a store, either directly or through `~> queue > worker > store`.
6. After a `queue` the next hop must be a `worker`; after `~>` the rest of the route is "background".
7. `idgen` may appear only in `write` routes, between a compute part and a store.
8. No part appears twice in one route.
9. If the problem's request has a `table`, the route's store must declare that table, and the request's `key` must be that table's `pk` or in its `index(...)` list. Otherwise the lookup is a full scan (section 7.4).

## 4. Parts catalogue

Kinds, arguments (with defaults and allowed values) and what "managed" means. A managed part has no single point of
failure and cannot be killed by a test.

| Kind | Arguments | Managed | Role |
|---|---|---|---|
| `lb` | none | yes | Spreads calls over a `server` |
| `cdn` | `ttl_s` 1–86400, default 60 | yes | Edge cache for requests the problem marks `cdn_ok` |
| `server` | `count` 1–200 (default 1); `size` `small`/`medium`/`large` (default `small`) | no | Runs the application |
| `worker` | same as `server` | no | Runs background work after a `queue` |
| `cache` | `nodes` 1–20 (1); `memory_gb` 1–256 per node (1); `ttl_s` 1–86400 (300) | no | In-memory key-value cache |
| `sql` | `size` `small`/`medium`/`large` (`small`); `replicas` 0–5 (0); `sync` `true`/`false` (`false`) | no | Relational database: one primary plus replicas |
| `nosql` | `nodes` 3–50 (3); `rf` 1–5 (3); `w` 1–`rf` (1); `r` 1–`rf` (1) | no | Partitioned key-value store |
| `queue` | none | yes | Durable queue |
| `objectstore` | none | yes | Large files |
| `idgen` | `kind` `counter`/`snowflake`/`random`/`hash` (`counter`); `bits` 16–128 (64), used by `random` and `hash` | yes | Makes identifiers |

Unknown kind → `E010`. Unknown argument → `E011`. Value out of range or wrong type → `E012`. For `nosql`, `rf` must not exceed `nodes` (`E012`).

## 5. Compiler: text → checked design

Module `tkd/parse.js` then `tkd/compile.js`. Output on success:

```js
{ ok:true, design:{ parts:{ api:{kind:"server",count:4,size:"medium",line:3}, … },
                    tables:{ "db.links":{part:"db",name:"links",pk:"code",columns:["code","url","created_at"],indexes:[],line:8} },
                    routes:{ GET_LINK:{mode:"read", line:10, hops:[{op:">",part:"lb"},{op:">",part:"api"},{op:">",part:"cache"},{op:"|",part:"db",replica:false}], invalidate:null}, … } },
  warnings:[ {code:"W001",line:4,message:"…"} ] }
```

On failure: `{ ok:false, errors:[ {code, line, col, message} ] }`, at most 20 errors, sorted by line. The compiler
needs the problem's `requests` (section 9) to check rules 3 and 9.

### 5.1 Error codes and exact messages (`{x}` is filled in)

| Code | When | Message |
|---|---|---|
| E001 | Too long | `The design is too long (limit 200 lines, 8,000 characters).` |
| E002 | Line matches no statement | `I can't read this line. A line is a part (name = kind(...)), a table, or a route (read/write NAME: client > ...).` |
| E003 | Name declared twice | `"{name}" is already declared on line {n}.` |
| E004 | Bad name | `"{name}" is not a valid name. Use lower-case letters, digits and _ (start with a letter, at most 24 characters).` |
| E005 | `client` declared | `"client" is built in. You don't declare it.` |
| E010 | Unknown kind | `"{kind}" is not a part. Parts: lb, cdn, server, worker, cache, sql, nosql, queue, objectstore, idgen.` |
| E011 | Unknown argument | `{kind} has no setting "{arg}". Its settings: {list}.` |
| E012 | Bad value | `{arg} must be {rule}. You wrote {value}.` |
| E020 | Route uses undeclared name | `"{name}" is used here but never declared.` |
| E021 | Route for unknown request | `This problem has no request called {REQUEST}. Its requests: {list}.` |
| E022 | Missing route | `There is no route for {REQUEST}. Add: {mode} {REQUEST}: client > ...` |
| E023 | Wrong mode | `{REQUEST} is a {mode} in this problem, but the route says {other}.` |
| E024 | Duplicate route | `{REQUEST} already has a route on line {n}.` |
| E025 | Route does not start `client >` | `A route starts with: client > ...` |
| E026 | `\|` after a non-cache | `"\|" means "on a miss, ask the next part". The part before it must be a cache or cdn; "{name}" is a {kind}.` |
| E027 | `~>` not into a queue | `"~>" hands work over without waiting. The part after it must be a queue; "{name}" is a {kind}.` |
| E028 | Queue not followed by worker | `After a queue the next part must be a worker.` |
| E029 | Read never reaches a store | `{REQUEST} never reaches a place where the data lives (sql, nosql or objectstore).` |
| E030 | Write never reaches a store | `{REQUEST} is never saved: its route does not reach sql, nosql or objectstore.` |
| E031 | Part twice in a route | `"{name}" appears twice in this route.` |
| E032 | `idgen` misplaced | `An idgen goes in a write route, after a server or worker and before the store.` |
| E033 | `[replica]` on non-sql or no replicas | `[replica] needs a sql part with replicas >= 1.` |
| E034 | `then invalidate` wrong | `"then invalidate" goes at the end of a write route and names a cache or cdn.` |
| E035 | `cdn` on a request not `cdn_ok` | `{REQUEST} can't be served from a CDN in this problem.` |
| E040 | Table on a non-store | `A table lives in a sql or nosql part; "{name}" is a {kind}.` |
| E041 | No or two `pk` | `A table needs exactly one pk column.` |
| E042 | Index on unknown column | `"{col}" is not a column of {table}.` |
| E043 | Store lacks the request's table | `{REQUEST} reads table "{table}", but "{part}" has no such table. Add: table {part}.{table}(...)` |

Warnings (shown, never fail): `W001` a declared part is in no route (`"{name}" is declared but no route uses it. It still costs money.`); `W002` a `server` reached directly from `client` with `count` > 1 and no `lb` before it (`Calls reach only one of your {count} "{name}" servers: there is no lb in front.` — the judge then treats `count` as 1 for capacity on that route).

Any error → verdict **Invalid Design**; tests do not run.

## 6. Numbers (the physics)

Teaching values, round on purpose. One file: `tkd/catalogue.js`. `cap` = calls per second one unit can serve.
`p99` = milliseconds at low load. Prices are rupees per month.

| Part | Unit | cap | p99 ms | ₹ / month per unit |
|---|---|---|---|---|
| `lb` | whole part | 50,000 | 2 | 2,000 |
| `cdn` | whole part | 1,000,000 | 15 | 3,000 |
| `server`/`worker` small | per instance | 500 | 20 | 3,000 |
| `server`/`worker` medium | per instance | 1,000 | 20 | 6,000 |
| `server`/`worker` large | per instance | 2,000 | 20 | 12,000 |
| `cache` | per node | 50,000 | 2 | 1,500 × `memory_gb` |
| `sql` small | per node | reads 1,000; writes 300 | read 10, write 15 | 8,000 |
| `sql` medium | per node | reads 3,000; writes 1,000 | read 10, write 15 | 20,000 |
| `sql` large | per node | reads 8,000; writes 2,500 | read 10, write 15 | 45,000 |
| `nosql` | per node | 5,000 (reads + writes) | 8 | 10,000 |
| `queue` | whole part | 20,000 | 5 | 4,000 |
| `objectstore` | whole part | 1,000,000 | 40 | 2,000 |
| `idgen` | — | 1,000,000 | 0 | 0 |

Other constants: `REPLICA_LAG_S = 1` (async sql replica, or nosql with `r + w <= rf`); `FAILOVER_S = 30`;
`SCAN_FACTOR = 100`; `RHO_MAX = 0.95`; `CDN_HIT = 0.95`; `HIT_MAX = 0.99`; `MISS_P99_THRESHOLD = 0.01`.

**Cost of a design** = sum over declared parts (used or not): `lb` 2,000; `cdn` 3,000; `server`/`worker` price × `count`;
`cache` 1,500 × `memory_gb` × `nodes`; `sql` price × (1 + `replicas`); `nosql` 10,000 × `nodes`; `queue` 4,000; `objectstore` 2,000.

## 7. The judge: exact model

Module `tkd/judge.js`. `judge(design, problem, test) → result`. A **test** (section 9.3) is a list of **phases**
run in order; each phase has a length in seconds, a rate per request, optional events, and inherits the damage of
earlier phases. For each phase do steps 7.1 to 7.7. All arithmetic in ordinary floating point; compare with promises
after rounding: latencies to 1 decimal, availability to 4 decimals, money to whole rupees.

### 7.1 State carried between phases

`alive[part]` = number of working units (`server`/`worker`: `count`; `cache`: `nodes`; `nosql`: `nodes`; `sql`: 1
primary + `replicas`, tracked as `primaryUp` (boolean) and `replicasUp`); `down[part]` (boolean, for a part with no
unit left); `cold[cache]` (boolean, a cache that restarted this phase).

### 7.2 Events at the start of a phase

| Event | Effect |
|---|---|
| `{"kill":"NAME"}` on `server`/`worker`/`cache`/`nosql` | `alive -= 1`. If it reaches 0: `down = true` (for `nosql`: down when `alive < rf`… see 7.6). Managed parts ignore it |
| `{"kill":"NAME"}` on `sql` | If `replicasUp >= 1`: a replica is promoted; `replicasUp -= 1`; this phase has **`FAILOVER_S` seconds of outage** for every route that touches the primary (all writes; reads without `[replica]`). If `sync` is `false`: **lost writes** = write rate to that part × `REPLICA_LAG_S`. If `replicasUp == 0`: `down = true` for the rest of the test |
| `{"flush":"NAME"}` on `cache` | `cold = true` for this phase only (hit ratio 0) |
| `{"kill_role":"cache"}` etc. | Same as `kill`, applied to **every** part of that kind in the design (tests are written without knowing the learner's names). Roles: `server`, `worker`, `cache`, `sql`, `nosql` |

Tests use `kill_role`/`flush_role`; `kill`/`flush` by name exist for the Testcase tab's own designs only.

### 7.3 Hit ratio of a cache or CDN on a read route

For request `R` with `distinct_keys` D, `item_bytes` B, `skew` s (0 ≤ s ≤ 0.95) from the problem:

- `cdn`: `h = CDN_HIT`.
- `cache`: `items = alive × memory_gb × 1e9 / B`; `c = min(1, items / D)`; `h = min(HIT_MAX, c ^ (1 − s))`. If `cold` or `alive == 0`: `h = 0`.

### 7.4 Load on every part

For each request with rate `q` (calls/s), walk its route left to right carrying a rate `x`, starting at `q`:

- A hop reached by `>` gets `x`.
- At `A | B`: `A` gets `x`; then `x = x × (1 − h_A)`; `B` gets the new `x`.
- At `A ~> Q`: `Q` gets `x`; every later hop also gets `x` but is marked **background** (its latency and failures do not count against the request; its overload does, see 7.5).
- On a `write` route with `then invalidate C`: `C` gets an extra `q`.

Sum per part: `load_read`, `load_write` (a hop counts as write if the route is `write`).

Capacity and utilisation `rho`:

- `server`/`worker`: `cap = unit_cap × alive` (or × 1 under warning W002); `rho = (load_read + load_write) / cap`.
- `cache`: `cap = 50,000 × alive`. `nosql`: `cap = 5,000 × alive`. Whole-part kinds: fixed `cap`.
- `sql`: reads with `[replica]` go to replicas: `rho_rep = load_read_replica / (read_cap × replicasUp)`. Everything else goes to the primary: `rho_pri = load_read_primary / read_cap + load_write / write_cap`. If the request's key is not `pk` or indexed (rule 3.4-9), that request's load on this part is multiplied by `SCAN_FACTOR` before these sums.
- With `sync=true`, each write also adds `load_write / write_cap` to **each** replica's `rho_rep`.

### 7.5 Overload

If any part has `rho > 1` (or `alive == 0` while not bypassable): `drop_fraction = 1 − 1/rho` for every request whose
route passes through it (foreground or background). A phase with any `drop_fraction > 0` and **no** fault event in
this or an earlier phase → verdict candidate **Overloaded** naming the part with the highest `rho`. With a fault
event → the drops count as failures in 7.7 instead. A `cache` with `alive == 0` on the left of `|` is **bypassed**
(h = 0), not a failure.

### 7.6 Correctness (staleness, read-your-writes, durability, unique ids)

Computed once per design (not per phase), then re-checked in phases where state changed.

- **Staleness of a read route** `stale_s` = sum of: for each `cache`/`cdn` on it, its `ttl_s` **unless** every `write` route whose request has the same `table` ends with `then invalidate` that part (then 0); plus `REPLICA_LAG_S` if it reads a `sql` with `[replica]` and `sync=false`; plus `REPLICA_LAG_S` if it reads a `nosql` with `r + w <= rf`.
- Request has `max_stale_s` M: if `stale_s > M` → **Wrong Answer**, reason `stale`.
- Request has `read_your_writes: true`: if `stale_s > 0` → **Wrong Answer**, reason `ryw`.
- **Durability** of a write request with `durable: true`: the route must reach a store. Through `~> queue > worker > store` it is durable (the queue is durable). Lost writes arise only from the `sql` kill rule (7.2) and from `nosql` with `w == 1` when a node is killed (lost = write rate × `REPLICA_LAG_S`). Any lost write of a durable request in a test with promise `no_data_loss` → **Data Lost**.
- **Unique ids**: a write request with `unique_id: true` must have an `idgen` on its route (else **Wrong Answer**, reason `no_id`). `counter` and `snowflake` never collide. `random` and `hash`: expected collisions `= n² / 2^(bits+1)` where `n` = the problem's `total_items`; if ≥ 1 → **Wrong Answer**, reason `collision`.
- `nosql` availability: the part is `down` when `alive < max(r, w)` nodes of a replica set can answer; model it as down when `nodes − alive >= rf − max(r, w) + 1`.

### 7.7 Latency, availability, verdict of the test

**Latency** of a foreground hop: `p99_hop = base_p99 / (1 − min(rho, RHO_MAX))` (`sql`: read or write base; with
`sync=true` a write's `sql` hop is doubled; full scan multiplies base by `SCAN_FACTOR`). **p99 of a request in a phase**:
sum of `p99_hop` over foreground hops, where at `A | B`: if `(1 − h_A) > MISS_P99_THRESHOLD` include both `A` and `B`, else only `A`. Background hops are excluded.
The request's test p99 is the **maximum over phases**.

**Availability** of a request = `1 − failed / total`, where over all phases `total = Σ rate × seconds` and
`failed = Σ rate × outage_seconds + Σ rate × drop_fraction × (seconds − outage_seconds)`. A foreground part that is `down` makes `outage_seconds` the whole phase.

**Promises** a test may state, each optional: `p99_ms` (per request), `availability` (per request, e.g. 0.999),
`no_data_loss` (true), `budget_inr` (monthly cost). Correctness rules of 7.6 always apply.

**Verdict of one test** = the first that applies, in this order:

1. **Wrong Answer** (7.6 staleness, read-your-writes, ids)
2. **Data Lost**
3. **Unavailable** (an availability promise missed, and a fault event happened)
4. **Overloaded** (drops with no fault event; or an availability promise missed with no fault event)
5. **Too Slow** (a `p99_ms` promise missed)
6. **Over Budget**
7. **Passed**

**Verdict of a Run or Submit** = Invalid Design if the compiler failed; else run tests in file order and stop at the
first that is not Passed, reporting its verdict; else **Accepted**.

### 7.8 Result object

```js
{ verdict:"Too Slow", passed:3, total:12,
  cost_inr:60500, worst_p99_ms:{GET_LINK:41.2, CREATE_LINK:38.0},
  failed:{ test:"t04-evening-peak", title:"Evening peak, 3× traffic", hidden:true,
           reason:"p99", request:"GET_LINK", phase:2,
           expected:"p99 ≤ 100 ms", actual:"p99 412.6 ms",
           blame:{part:"db", line:4, rho:0.976, note:"db is at 98 % of its capacity"},
           trace:[ {part:"lb",ms:2.1,rho:0.12}, {part:"api",ms:33.3,rho:0.40}, {part:"cache",ms:2.0,rho:0.02,hit:0.62}, {part:"db",ms:375.2,rho:0.976} ] },
  tests:[ {id:"t01-quiet-afternoon", verdict:"Passed"}, … ], judge_version:1 }
```

For a **hidden** test the server removes `trace` phase rates and the test's numbers; it keeps `title`, `reason`,
`expected`, `actual`, `blame` (free users: only `title` and `reason`; section 14).

### 7.9 One-line explanations (shown under the verdict; `{…}` filled from `failed`)

| Reason | Text |
|---|---|
| `stale` | `{request} can return data up to {stale_s} s old, but this problem allows {max} s. Look at the cache TTL, or invalidate on write.` |
| `ryw` | `After a write, {request} must show the new data at once. Yours reads from {part}, which can be behind.` |
| `no_id` | `{request} creates items but nothing in its route makes their ids. Add an idgen.` |
| `collision` | `With {n} items, {bits}-bit {kind} ids are expected to collide. Use more bits, or a counter.` |
| `lost` | `When {part} failed, about {n} acknowledged writes were lost. They were only on the primary.` |
| `unavailable` | `{request} was available {actual} of the time; the promise is {expected}. {part} had no spare when it failed.` |
| `overloaded` | `{part} received {load} calls a second but can serve {cap}.` |
| `p99` | `{request} took {actual} at the 99th percentile; the promise is {expected}. Slowest hop: {part} at {rho} of capacity.` |
| `budget` | `This design costs ₹{cost} a month; the budget is ₹{budget}.` |

### 7.10 Worked example (use it as the first unit test)

Design: section 3.3 but `api = server(count=3, size=medium)`. Phase: `GET_LINK` 2,000/s, `CREATE_LINK` 20/s;
D = 1,000,000, B = 500, s = 0.8.

- `lb`: load 2,020, rho 0.0404, p99 = 2 / 0.9596 = **2.08**.
- `api`: cap 3,000, rho 0.6733, p99 = 20 / 0.3267 = **61.2**.
- `cache`: items = 2 × 1 × 1e9 / 500 = 4,000,000 ≥ D so c = 1, h = min(0.99, 1) = **0.99**; load 2,000 reads + 20 invalidations; rho 0.0202; p99 = **2.04**.
- `db` primary: reads 2,000 × 0.01 = 20; writes 20; rho = 20/3,000 + 20/1,000 = 0.0267.
- Miss fraction 0.01 is not greater than 0.01 → GET_LINK p99 = 2.08 + 61.2 + 2.04 = **65.3 ms**.
- CREATE_LINK: db write hop = 15 / (1 − 0.0267) = 15.41, doubled because `sync=true` = 30.8; `ids` adds 0; p99 = 2.08 + 61.2 + 0 + 30.8 = **94.1 ms**.
- Cost: 2,000 + 3 × 6,000 + 1,500 × 1 × 2 + 20,000 × 2 = **₹63,000**.

Assert these to ±0.2 ms and exact rupees. If your numbers differ, your code is wrong, not the example; if you are
sure the example contradicts sections 7.3 to 7.7, stop and report (it was computed by hand).

## 8. Run and Submit

| | Run | Submit |
|---|---|---|
| Tests | The problem's **visible** tests, or the learner's edited scenario from the Testcase tab | **All** tests, visible then hidden |
| Where | In the browser, same `tkd/` modules | On the server (the server's result is the record); the browser shows it |
| Needs sign-in | No | Yes |
| Saved | No | Yes, as a submission (section 13) |
| Limit | none | 10 per minute per account (HTTP 429, message `Too many submissions. Wait a minute.`) |
| Time budget | < 100 ms | < 300 ms judge time; whole request < 2 s |

The server never trusts a verdict sent by the browser. It receives only `{problem_id, source}`.

## 9. Problem files

Folder `content/problems2/`. One JSON file per problem, `NNN-slug.json`, plus `index.json` listing them in order.
(The existing `content/` files are served by `backend/src/content/`; follow that code to load these.)

```json
{ "id": 1, "slug": "url-shortener", "title": "Design a URL shortener", "difficulty": "easy",
  "topics": ["caching", "ids"], "companies": [], "free": true,
  "statement": "Zotato sends crores of promo SMS, each with a short link … (Markdown, at most 200 words)",
  "constraints": ["Up to 10 crore links in total", "Reads outnumber writes 100 to 1", "Budget ₹1,00,000 a month"],
  "total_items": 100000000,
  "requests": [
    { "name": "GET_LINK", "mode": "read", "table": "links", "key": "code", "distinct_keys": 1000000,
      "item_bytes": 500, "skew": 0.8, "max_stale_s": 3600, "read_your_writes": false, "cdn_ok": false,
      "says": "Open a short link: return the long URL for a code." },
    { "name": "CREATE_LINK", "mode": "write", "table": "links", "key": "code", "durable": true, "unique_id": true,
      "says": "Create a short link for a long URL. Codes must never repeat." } ],
  "template": "lb  = lb()\napi = server(count=1, size=small)\n\n# add your parts, tables and routes\nread  GET_LINK:    client > lb > api > \nwrite CREATE_LINK: client > lb > api > \n",
  "tests": [
    { "id": "t01-quiet-afternoon", "title": "A quiet afternoon", "hidden": false,
      "explain": "200 opens and 2 new links a second. Almost any working design passes.",
      "phases": [ { "seconds": 600, "rates": { "GET_LINK": 200, "CREATE_LINK": 2 } } ],
      "promises": { "p99_ms": { "GET_LINK": 100, "CREATE_LINK": 200 }, "availability": { "GET_LINK": 0.999 }, "budget_inr": 100000 } },
    { "id": "t02-evening-peak", "title": "Evening peak", "hidden": false, "explain": "…",
      "phases": [ { "seconds": 300, "rates": { "GET_LINK": 2000, "CREATE_LINK": 20 } },
                  { "seconds": 300, "rates": { "GET_LINK": 6000, "CREATE_LINK": 60 } } ],
      "promises": { "p99_ms": { "GET_LINK": 100 }, "budget_inr": 100000 } },
    { "id": "t03-a-server-dies", "title": "A server dies at peak", "hidden": true,
      "phases": [ { "seconds": 300, "rates": { "GET_LINK": 2000, "CREATE_LINK": 20 } },
                  { "seconds": 300, "rates": { "GET_LINK": 2000, "CREATE_LINK": 20 }, "events": [ { "kill_role": "server" } ] } ],
      "promises": { "availability": { "GET_LINK": 0.999 }, "p99_ms": { "GET_LINK": 150 } } },
    { "id": "t04-database-fails", "title": "The database primary fails", "hidden": true,
      "phases": [ { "seconds": 600, "rates": { "GET_LINK": 2000, "CREATE_LINK": 20 } },
                  { "seconds": 600, "rates": { "GET_LINK": 2000, "CREATE_LINK": 20 }, "events": [ { "kill_role": "sql" }, { "kill_role": "nosql" } ] } ],
      "promises": { "no_data_loss": true, "availability": { "GET_LINK": 0.99 } } },
    { "id": "t05-cold-cache", "title": "The cache restarts", "hidden": true,
      "phases": [ { "seconds": 300, "rates": { "GET_LINK": 2000, "CREATE_LINK": 20 }, "events": [ { "flush_role": "cache" } ] } ],
      "promises": { "availability": { "GET_LINK": 0.999 } } } ],
  "reference": "(the TKD of section 3.3)",
  "wrong": [
    { "name": "no-cache-one-server", "expect": "Overloaded", "source": "…" },
    { "name": "async-replica", "expect": "Data Lost", "source": "…" },
    { "name": "random-32-bit-ids", "expect": "Wrong Answer", "source": "…" },
    { "name": "everything-large", "expect": "Over Budget", "source": "…" } ],
  "hints": ["Reads are 100 times the writes. Where could most reads be answered without the database?", "…"],
  "editorial": "Markdown: the approach, the reference design line by line, why each wrong design fails, links to /dashboard/concepts/caching/ …" }
```

Rules for authors (and for a CI test, `problems2.test.js`): the `reference` must be **Accepted**; every `wrong`
entry must get exactly its `expect`; at least 2 visible and 3 hidden tests; every verdict the problem can teach has a
`wrong` design; the template must compile to errors only of codes E022/E029/E030 (an unfinished design, not a broken one).

**Write the first problem's `wrong` sources and check them by running the judge.** They are not written out here
because their verdicts depend on the exact arithmetic; adjust the *test numbers*, never the judge, until the
reference is Accepted and each wrong design gets its verdict.

**First ten problems (owner confirms the list):** 1 URL shortener (easy) · 2 Paste bin (easy) · 3 Rate limiter
(easy) · 4 News feed read path (medium) · 5 Notification sender, queue and workers (medium) · 6 Image upload and
serving, objectstore and CDN (medium) · 7 Leaderboard (medium) · 8 Ticket booking, no double sale (hard) · 9 Chat
message store, nosql quorum (hard) · 10 IND vs PAK live score, extreme read spike (hard).

## 10. Routes and API

Frontend routes (add to `frontend/src/routes.js` and `frontend/hosting/routes.json`, following existing entries):
`/dashboard/practice/` (list) and `/dashboard/practice/<slug>/` (problem page). The existing `/dashboard/problems/…` stays.

Backend, all under `/v1/practice` (JSON; errors `{error:{code,message}}`):

| Method and path | Auth | Returns |
|---|---|---|
| `GET /v1/practice/problems` | no | List: id, slug, title, difficulty, topics, free, `acceptance` (accepted ÷ submitted, 1 decimal, null under 20 submissions); with sign-in also `status` per problem: `solved`/`tried`/null |
| `GET /v1/practice/problems/:slug` | no | The problem **without** hidden tests' `phases`/`promises`, without `reference`, `wrong`, `editorial` (editorial: see section 14) |
| `POST /v1/practice/problems/:slug/submit` body `{source}` | yes | The result object of 7.8 (hidden parts removed), plus `submission_id`, `rank` (section 13) |
| `GET /v1/practice/problems/:slug/submissions` | yes | The caller's submissions, newest first, max 50: id, time, verdict, passed/total, cost, p99 |
| `GET /v1/practice/submissions/:id` | yes (owner only) | One submission with `source` |
| `GET /v1/practice/problems/:slug/editorial` | see 14 | Editorial Markdown and reference design |
| `GET /v1/practice/problems/:slug/solutions` | yes, solved only | Up to 20 shared designs: source, cost, p99, note |
| `POST /v1/practice/submissions/:id/share` body `{note}` | yes, own Accepted | Shares it |

`source` is validated first: string, ≤ 8,000 characters, else HTTP 400.

MongoDB (database as the existing submissions code uses; read it first): collection `practice_submissions`
`{_id, user_id, problem_id, source, verdict, passed, total, cost_inr, p99_ms, judge_version, shared, note, created_at}`
with indexes `{user_id:1, problem_id:1, created_at:-1}` and `{problem_id:1, verdict:1, cost_inr:1}`; collection
`practice_stats` `{_id: problem_id, submitted, accepted}` updated with `$inc`.

## 11. The problem page

### 11.1 Layout (desktop, ≥ 900 px)

```
┌ ‹ Problems   ‹ prev  next ›  🎲 Pick one            ▶ Run   [ Submit ]     ⏱ 12:04 ┐
├──────────────────────────────────┬─────────────────────────────────────────────────┤
│ Description│Editorial│Solutions│ │ Design                    [ Text | Form ]  Reset │
│ Submissions                      │ 1  lb  = lb()                                    │
│                                  │ 2  api = server(count=1, size=small)             │
│ 1. Design a URL shortener        │ …                                  ₹ 5,000/month │
│ Easy · caching · ids             ├─────────────────────────────────────────────────┤
│ statement                        │ Diagram (from your design, read-only)            │
│ Requests (table from `requests`) ├─────────────────────────────────────────────────┤
│ Example 1 … Example 2 …          │ Testcase │ Result                                │
│ Constraints                      │                                                  │
│ ▸ Hint 1  ▸ Hint 2               │                                                  │
└──────────────────────────────────┴─────────────────────────────────────────────────┘
```

Left pane 42 % wide, draggable divider (min 320 px each side). Right pane: editor 45 %, diagram 25 %, console 30 %, the two inner dividers draggable; double-click a divider resets it. Sizes are remembered in local storage key `tk-practice-layout`.

### 11.2 Left pane

- **Description:** number and title (Fraunces), difficulty pill, topic pills; statement; a **Requests** table (name, read/write, what it does, the limits that matter: "may be up to 1 hour old", "ids must be unique", "must not be lost"); each visible test as "Example N: title", its `explain`, its phases in words ("2,000 opens and 20 new links a second for 5 minutes, then 3× for 5 minutes") and its promises; **Constraints** list; hints as closed "Show more" boxes.
- **Editorial:** Markdown, the reference design in a read-only editor with a "Copy to my design" button (asks first: `Replace your design with the reference?`).
- **Solutions:** locked message until solved: `Solve this problem to see how others did it.` Then a list sorted by cost (toggle: by speed).
- **Submissions:** table: time, verdict (coloured), tests passed, cost, p99; a row opens that source read-only with "Restore this design".

### 11.3 Right pane

- **Editor.** A plain `<textarea>` with a line-number gutter and an overlay for highlighting (no editor library). Monospace 14 px, tab inserts two spaces. Highlight: comments `--muted`, keywords (`read`, `write`, `table`, `then`, `invalidate`, `index`, `pk`) weight 600, part kinds `--accent`, request names weight 600, numbers `--brand-ink`. Compile 250 ms after the last keystroke: error lines get a red left bar and a red wavy underline at `col`; the message shows under the editor (first error) and on hover; warnings in orange the same way. The running **cost** shows bottom-right (`₹ 63,000/month`) when the design compiles. The text is saved per problem in local storage (`tk-practice-src-<id>`) on every change. **Reset** restores the template after `Throw away your design and start from the template?`. **Autocomplete** (step 6 of section 16, optional): after `= ` offer kinds; inside `(` offer that kind's arguments; after `>`/`|`/`~>` offer declared names.
- **Diagram.** SVG drawn from the compiled design: `client` on the left, parts in columns by their earliest position in any route, stores on the right; one box per part with its name, kind and key numbers (`×4 medium`, `2 × 1 GB`, `1 + 1 replica`); arrows per route (solid `>`; dashed `~>`; a small "miss →" label on `|`). Read routes ink, write routes ochre. If the design does not compile, the last good diagram stays, dimmed, with `Fix the errors to update the picture.` After a Run or Submit that failed, the blamed part's box gets a red border and its `rho` as a percentage.
- **Console, tab Testcase.** A select of the visible tests. Below it the phases as editable rows (seconds, a rate per request, an event select: none / kill a server / kill the database / restart the cache) and the promises as editable numbers; "Add phase", "Reset to the example". Run uses what is shown.
- **Console, tab Result.** Empty state: `Run your design to see how it does.` After Run/Submit, top to bottom: verdict word (Fraunces 26 px; Accepted has the marker stroke drawn under it, others are plain: red for Wrong Answer/Data Lost/Unavailable/Overloaded, orange for Too Slow/Over Budget/Invalid Design); `{passed} / {total} tests passed`; the one-line explanation (7.9); **Expected** and **Your design** side by side; the **trace** as a row of hops with ms and a load bar each (the blamed hop red); a list of all tests with ✓/✕ (hidden ones show only their title). On **Accepted**: cost and p99 with their rank bars (section 13) and two buttons: `Next problem` (marigold) and `Share this design`.
- **Run** is a second button, **Submit** is the page's one marigold button. While a Submit is in flight both are disabled and Submit reads `Judging…`. Not signed in → Submit opens the sign-in card with `Sign in to submit. Run works without an account.` Shortcuts: Ctrl/⌘ + `'` Run, Ctrl/⌘ + Enter Submit.

### 11.4 Phone (< 900 px)

Three tabs fixed at the bottom: **Problem · Design · Result**; Run and Submit sit above them on the Design and Result tabs. Design opens in **Form view**: a list of part cards (kind select, steppers and selects for each argument, delete), "Add part"; a "Tables" card; one card per request where the route is built by picking the next part and the link type from selects (`then`, `on a miss`, `hand over`). The form reads and writes the **same text**: it is generated by `tkd/format.js` from the compiled design, so switching Text ↔ Form loses nothing except comments (warn once: `Comments are removed when you edit in Form view.`). Form view is also available on desktop through the toggle. The diagram is collapsed under the form ("Show picture").

### 11.5 States

Loading (skeleton lines); problem not found (`This problem doesn't exist.` + link to the list); server error on
Submit (`Couldn't reach the judge. Your design is saved here; try again.`); 429 (text in section 8); a paid problem
for a free user (statement visible, editor replaced by a card: `This problem is part of Tech Katta Plus.` — owner decides the wording and the action).

## 12. The problem list (`/dashboard/practice/`)

Header as other section pages. Progress line: `{solved} of {n} solved` with three small bars (Easy, Medium, Hard).
Filter pills: status (All / Not done / Solved), difficulty, topic (multi-select), a search box (title). "Pick one"
(marigold): a random unsolved problem within the filters. Table columns: Status (✓ solved, • tried), #, Title,
Difficulty pill, Acceptance (`62.4 %` or `—`), Topics. Rows are links. Sorting by #, difficulty, acceptance. On
phones each row is a card. Paid problems show a small lock after the title. Above the table: a **Daily problem**
card (one per calendar day in IST, chosen by `id = (days since 2026-01-01) mod n`, same for everyone) and the
visitor's **streak** (consecutive IST days with at least one Accepted submission; computed from `practice_submissions`).

## 13. Ranking, progress

After an Accepted submission the server computes, over the **best (cheapest) Accepted submission of every other
user** for that problem: `cheaper_than` = share with a higher cost; `faster_than` = share with a higher worst p99
(percent, whole numbers). Under 20 such users: return `null` and show `Not enough designs yet to compare.` Shown as
two bars: `Cost ₹63,000/month · cheaper than 71 %` and `p99 65 ms · faster than 64 %`.

Progress: a problem is **solved** once any submission is Accepted; **tried** if there is any submission. Store
nothing new in the browser; the list endpoint returns status. The existing `frontend/src/progress.js` is for the old
problems; do not mix them.

## 14. Free and paid (owner decides; defaults below)

Free: the list, every statement, Run on every problem, Submit and full results on problems with `"free": true`.
Paid: Submit on the rest; hidden-test detail (`expected`, `actual`, `blame`, `trace`); editorials; solutions.
Until the owner sets up payment, treat every signed-in user as paid, behind one server constant `PRACTICE_ALL_PAID = true`.

## 15. Security and fairness

- Hidden tests, `reference`, `wrong` and `editorial` never leave the server except through their endpoints.
- The server judges `source` itself; it never accepts a verdict, cost or p99 from the client.
- `source` size limit before parsing; the parser is linear (no backtracking regular expressions over the whole text; no `eval`, no `Function`).
- Shared solutions render as text only (never as HTML).
- Rate limit Submit (section 8) and the list of submissions (60 per minute).
- `judge_version` is stored with every submission; when the judge changes, bump it and show old submissions with `Judged with an older version.`

## 16. Build order (one pull request per step)

| Step | Build | Files | Done when |
|---|---|---|---|
| 1 | Parser and compiler | `frontend/src/tkd/parse.js`, `compile.js`, `catalogue.js`, `tkd.test.js` | A test per error code E001–E043 and W001–W002; section 3.3 compiles to the object of section 5 |
| 2 | Judge | `frontend/src/tkd/judge.js`, `judge.test.js` | Section 7.10 passes; one unit test per rule of 7.2–7.7 and per verdict |
| 3 | Problem 1 and the problem checker | `content/problems2/001-url-shortener.json`, `index.json`, `frontend/src/tkd/problems2.test.js` | Reference Accepted; each wrong design gets its verdict |
| 4 | Backend | `backend/src/practice/` (load problems, routes of section 10, Mongo), `backend/test/practice.test.js`; the `tkd/` modules are shared with the backend **the same way the existing judge is shared** (see how `backend/test/judge-pool.test.js` reaches judge code) | Endpoint tests: hidden data never returned; submit judges on the server; rate limit; owner-only access |
| 5 | Problem page, text view | `frontend/src/practice/` (`page.jsx`, `editor.jsx`, `diagram.jsx`, `console.jsx`, `practice.css`), routes | Full loop on problem 1: template → errors → Run → Submit → Accepted; keyboard only works; light and dark |
| 6 | Form view, phone layout, formatter | `frontend/src/tkd/format.js`, `practice/form.jsx` | Text → Form → Text keeps the design (a round-trip test on every reference and wrong design) |
| 7 | List page, daily problem, streak, submissions and solutions tabs, ranking | `practice/list.jsx`, backend additions | Section 12 and 13 behave as written |
| 8 | Problems 2 to 10 | `content/problems2/` | The checker passes for all ten |
| 9 | Owner review, then: link "Practice" in the dashboard tabs and landing page | `shell.jsx`, `site.json` | Owner says go |

Add each new test file to the `test` script in `frontend/package.json` (it lists files one by one) and follow the
backend's test command. Follow the repo flow for every step: branch, draft pull request, checks green, ledger row, context docs.

**Retiring the old experience** (canvas, old Problems pages, old judge) is a separate, later decision of the owner.
Until then both exist; nothing links the new pages from the old ones.

## 17. How to prove it works

- Unit tests as listed per step. The judge has no randomness, so tests assert exact verdicts and numbers to ±0.2 ms.
- A **property test** for the judge (seeded generator, 500 designs): adding a `server` instance never turns a passing latency promise into a failing one; raising a budget never fails a test; the cost equals section 6 recomputed independently.
- A **determinism test**: judge the same input 100 times, deep-equal results; and judge it in Node and (in an end-to-end script) in the browser, equal results.
- End-to-end (Playwright, as the repo's existing e2e scripts): open problem 1, type the reference design, Run, Submit, see Accepted; then each wrong design and its verdict word.
- Timing: `judge()` on the largest allowed design and a 20-phase test in under 20 ms in Node.
- Five-friends test (owner): from opening problem 1 to a first verdict in under two minutes, without help.

## 18. Known limits (say so in the editorial pages, do not hide them)

- The model is steady-state per phase: no warm-up curves, no retries or back-pressure, no network partitions, no multi-region, no autoscaling. These are candidates for judge version 2.
- Latency is one p99 number per hop that grows with utilisation; it is a teaching model, not a queueing-theory result.
- Prices and capacities are round teaching values, not a cloud price list.
- Trade-off discussion (the part of an interview that is talk) lives in editorials; the judge checks only stated promises.

## 19. Owner decisions needed

1. Text + form as the only way to answer (this spec), or keep a canvas as a third view later.
2. The name of the section ("Practice" here) and whether it replaces "Problems" in the tabs.
3. Free versus paid lines (section 14) and the paid-card wording.
4. The first ten problems (section 9).
5. Whether shared Solutions show the author's name.
6. When to retire the old canvas experience.
