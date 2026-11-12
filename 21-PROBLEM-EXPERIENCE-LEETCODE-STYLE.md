# 21 — Problems, LeetCode-style: full specification

**Status:** design specification, 12 Nov 2026; the approach was then decided (see "Decision" below). **Not built. Not tested.** Unlike `20-UI-REDESIGN-SPEC.md`, none of
the code or numbers here has been run; section 17 says how to prove each part as you build it.
**Who reads this:** the agent that will write the code. Follow it top to bottom. Where it says "owner decides", stop and ask.
**Brief (owner):** "take a step back … think of the evaluator and the entire interview questions and problems
experience. Don't take into consideration the current canvas … We need to make the problem solving experience
LeetCode style." Then: "The .md file will be read and actual code implementation will be done by some lesser
intelligence llm. Also think in depth. Write every single detail."

This design was thought out from first principles. It does **not** reuse the current canvas or judge as a starting
point. It is built **beside** them (new folders, new routes), so nothing live breaks; section 16 says how the old
experience is retired later, and only on the owner's word.

## Decision: how the problem-solving experience should work

Asked by the owner (12 Nov 2026): "Think about all the approaches and decide." Seven approaches were weighed against
what matters for this product. Scores are 1 (bad) to 5 (good).

**What matters, and how much.** Three quarters of visitors are on phones, so "works on a phone" counts double. The
loop must be LeetCode-fast, so "time to first verdict" counts double. The judge must be trusted, so "exact and
deterministic" is a gate: an approach that fails it is out, whatever else it scores.

| # | Approach | The learner… | Exact and deterministic (gate) | Phone (×2) | Time to first verdict (×2) | Feels like real design | Teaches from a failure | Cost to author a problem | Cost to build | Result |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Free canvas | drags boxes, draws arrows, opens settings panels | yes | 1 | 2 | 5 | 4 | 3 | 1 (exists, but heavy) | Out: slow loop, unusable on phones |
| 2 | Text only | writes a short design in a small language | yes | 2 | 4 | 3 | 5 | 4 | 4 | Good on a laptop, weak on phones |
| 3 | Builder only | taps to add parts and build each request's path from pick-lists | yes | 5 | 4 | 3 | 5 | 4 | 3 | Good on phones, slower for fast typists |
| 4 | Multiple choice per step | answers questions | yes | 5 | 5 | 1 | 2 | 5 | 5 | Out: a quiz. Guessable; nobody "designs" |
| 5 | Free text or drawing, graded by an AI | writes prose | **no** | 4 | 2 | 5 | 3 | 5 | 2 | Out as a judge: different verdicts for the same answer, cost per submission, can be argued with |
| 6 | Guided interview (requirements → estimates → API → data → design → deep dives), each stage checked | fills six stages | yes | 3 | 1 | 5 | 4 | 1 | 1 | Out as the core loop: ten minutes to a verdict, heavy to author. Parts of it return below |
| 7 | **One exact design, two editors** (builder + text over the same design), diagram drawn as output, judged by scenarios | taps or types, whichever suits the device | yes | 5 | 4–5 | 4 | 5 | 4 | 3 | **Chosen** |

**The decision.**

1. **The answer is one exact design** (parts, their settings, one path per request). It is stored as TKD text (section 3), because text can be saved, compared, shared and judged byte for byte.
2. **There are two equal ways to edit it, and neither is second-class:**
   - the **Builder** (called "Form view" in section 11.4): tap to add a part, steppers and pick-lists for settings, build each request's path by choosing the next part. **This is the default on phones and for anyone who has never submitted before.** A newcomer never has to learn syntax to get a first verdict.
   - the **Text editor**: the default on screens 900 px and wider once the learner has switched to it once (the choice is remembered). This is what makes it feel like LeetCode for people who like to type.
   Both write the same text; switching loses nothing but comments.
3. **The diagram is output, never input.** It redraws as the design changes and lights up the part that failed.
4. **The judge is a deterministic model run against scenarios** (sections 6 to 8), with eight verdict words. No AI decides a verdict.
5. **No canvas** in the new experience. Dragging is the slowest way to say "four medium servers behind a load balancer".
6. **What is kept from the rejected approaches, as additions that never change a verdict:**
   - from the guided interview (6): each problem may start with an optional **"Estimate first"** card: two or three numbers to work out (requests a second, storage in a year), checked within ±20 %, with the working shown after. It warms up interview arithmetic and can be skipped. *Later step; not in the first build.*
   - from AI grading (5): after **Accepted**, an optional **"Explain your trade-off"** box where an AI gives comments on a short written explanation. It is feedback only, clearly labelled, never a score. *Owner decides if and when; not in the first build.*
   - from multiple choice (4): nothing in problems. Quizzes, if wanted, belong at the end of Concepts articles.

**Why not simply "text, like LeetCode"?** Because LeetCode's users sit at a keyboard and ours mostly do not. Typing
`cache = cache(nodes=2, memory_gb=1, ttl_s=3600)` on a phone keyboard is the opposite of a one-minute loop. The
builder gives phone users the same exactness with taps. Text stays for those it suits.

**Why not simply "builder"?** Because a design that exists only as form state cannot be diffed, pasted into a chat,
shown in an editorial, or restored from a submission as easily; and experienced users find forms slow. Text under the
builder gives all of that for free.

**What this changes in the rest of this file:** only the order of building. The Builder and the phone layout are no
longer step 6; they ship together with the problem page (section 16, steps 5a and 5b; the Builder is specified in full in section 20, the engine's internals in section 21), and the five-friends test
(section 17) must be passed **on a phone, in the Builder**.

---

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
after      = "then" ( "invalidate" | "update" ) NAME ;
REQUEST    = [A-Z][A-Z0-9_]{0,31} ;
NUMBER     = digit { digit } [ "." digit { digit } ] ;
```

Whitespace between tokens is free. `>` means "calls and waits". `|` means "if the part on the left has no answer,
ask the part on the right and store the answer on the left" (cache-aside); the part on the left of `|` must be a
`cache` or `cdn`. `~>` means "hands over and answers the client at once" (asynchronous); the part on the right of
`~>` must be a `queue`. `[replica]` after a `sql` name means "read from its replicas, not the primary".
`then invalidate X` (delete the cached copy; not waited for) and `then update X` (write the new value into the cache before answering: "write-through"; `X` must be a `cache`) are allowed only on `write` routes; for `invalidate`, `X` may be a `cache` or `cdn`.

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
| E034 | `then invalidate`/`then update` wrong | `"then invalidate" or "then update" goes at the end of a write route and names a cache (invalidate may also name a cdn).` |
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
`SCAN_FACTOR = 100`; `RHO_MAX = 0.95`; `CDN_HIT = 0.95`; `HIT_MAX = 0.99`; `P50_RATIO = 0.25`; `COLD_S = 60`. (Section 22 revised the model; where sections 7 and 21 differ from section 22, **section 22 wins**. The places it changed are already corrected in 7.3, 7.7 and 7.10.)

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
- `cache`: `items = alive × memory_gb × 1e9 / B`; `c = min(1, items / D)`; `warm = 1 − exp(−q × ttl_s / D)` (q = this request's rate in the segment); `churn = min(1, w / q)` if a write route on the same table ends with `then invalidate` this cache (w = that write's rate), else 0; `h = min(HIT_MAX, (c × warm)^(1 − s) × (1 − churn))`, rounded to 6 decimals. If `cold`, `alive == 0` or `q == 0`: `h = 0`. (Section 22.2 explains why.)

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
sum of `p99_hop` over **all** foreground hops, including the part after every `|` (at least 1 % of reads miss, so the 99th percentile is always a miss). **p50** of a request: `P50_RATIO ×` the same sum, but the part after `A | B` is included only if `h_A < 0.5`. Each hop value is rounded to 2 decimals before summing. Background hops are excluded.
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
- `cache`: items = 2 × 1 × 1e9 / 500 = 4,000,000 ≥ D so c = 1; warm = 1 − exp(−2,000 × 3,600 / 1,000,000) = 0.999253; churn = 20 / 2,000 = 0.01 (the write route invalidates this cache); h = min(0.99, (1 × 0.999253)^0.2 × 0.99) = **0.989852**; load 2,000 reads + 20 invalidations over 2 nodes: rho 0.0202; p99 = **2.04**.
- `db` primary: reads 2,000 × (1 − 0.989852) = 20.3; writes 20; rho = 20.3/3,000 + 20/1,000 = 0.0268; read p99 = 10 / 0.9732 = **10.27**; write p99 = 15 / 0.9732 = 15.41.
- GET_LINK p99 = 2.08 + 61.22 + 2.04 + 10.27 = **75.6 ms** (the miss path always counts). GET_LINK p50 = 0.25 × (2.08 + 61.22 + 2.04) = **16.3 ms** (h ≥ 0.5, so the median read is a hit).
- CREATE_LINK: db write hop 15.41, doubled because `sync=true` = 30.82; `ids` adds 0; clearing the cache is not waited for; p99 = 2.08 + 61.22 + 0 + 30.82 = **94.1 ms**.
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
  "tables_hint": [ { "name": "links", "columns": ["code", "url", "created_at"], "pk": "code" } ],
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

Three tabs fixed at the bottom: **Problem · Design · Result**; Run and Submit sit above them on the Design and Result tabs. Design opens in the **Builder** (Form view; it is also the default on desktop until the learner first switches to Text, and the choice is remembered in local storage key `tk-practice-editor`): a list of part cards (kind select, steppers and selects for each argument, delete), "Add part"; a "Tables" card; one card per request where the route is built by picking the next part and the link type from selects (`then`, `on a miss`, `hand over`). The form reads and writes the **same text**: it is generated by `tkd/format.js` from the compiled design, so switching Text ↔ Form loses nothing except comments (warn once: `Comments are removed when you edit in Form view.`). Form view is also available on desktop through the toggle. The diagram is collapsed under the form ("Show picture").

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
| 2 | Judge, built in the layers of section 21.2 | `frontend/src/tkd/` (`kinds/`, `checks.js`, `solve.js`, `promises.js`, `verdict.js`, `judge.js`), `judge.test.js`, `golden/` | Section 7.10 passes; one unit test per rule of 7.2–7.7 and per verdict |
| 3 | Problem 1 and the problem checker | `content/problems2/001-url-shortener.json`, `index.json`, `frontend/src/tkd/problems2.test.js` | Reference Accepted; each wrong design gets its verdict |
| 4 | Backend | `backend/src/practice/` (load problems, routes of section 10, Mongo), `backend/test/practice.test.js`; the `tkd/` modules are shared with the backend **the same way the existing judge is shared** (see how `backend/test/judge-pool.test.js` reaches judge code) | Endpoint tests: hidden data never returned; submit judges on the server; rate limit; owner-only access |
| 5a | Formatter and Builder | `frontend/src/tkd/format.js`, `frontend/src/practice/form.jsx` | Text → Builder → Text keeps the design (a round-trip test on every reference and wrong design); every part kind and every route operator can be made with taps alone |
| 5b | Problem page: desktop and phone layouts, both editors, diagram, console | `frontend/src/practice/` (`page.jsx`, `editor.jsx`, `diagram.jsx`, `console.jsx`, `practice.css`), routes | Full loop on problem 1 **on a Pixel 7 in the Builder** and on a desktop in the text editor: template → errors → Run → Submit → Accepted; keyboard only works; light and dark |
| 6 | Editor comforts: autocomplete, shortcuts, draggable dividers | `practice/editor.jsx` | Section 11.3 behaves as written |
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
- Five-friends test (owner): **on a phone, in the Builder**, from opening problem 1 to a first verdict in under two minutes, without help. Then the same on a laptop in the text editor.

## 18. Known limits (say so in the editorial pages, do not hide them)

- The model is steady-state per phase: no warm-up curves, no retries or back-pressure, no network partitions, no multi-region, no autoscaling. These are candidates for judge version 2.
- Latency is one p99 number per hop that grows with utilisation; it is a teaching model, not a queueing-theory result.
- Prices and capacities are round teaching values, not a cloud price list.
- Trade-off discussion (the part of an interview that is talk) lives in editorials; the judge checks only stated promises.

## 19. Owner decisions needed

1. Confirm the decision at the top of this file: one exact design, Builder and Text as equal editors, no canvas. Also whether to add "Estimate first" and "Explain your trade-off" later.
2. The name of the section ("Practice" here) and whether it replaces "Problems" in the tabs.
3. Free versus paid lines (section 14) and the paid-card wording.
4. The first ten problems (section 9).
5. Whether shared Solutions show the author's name.
6. When to retire the old canvas experience.

---

## 20. The Builder in detail

Section 11.4 introduced the Builder ("Form view"). This section is its full specification. It replaces the short
description there wherever the two differ. Files: `frontend/src/practice/form.jsx` (plus small components beside it)
and `frontend/src/tkd/format.js`.

### 20.1 The one rule: text is the truth

The Builder never keeps its own copy of the design. On every change it does: **current text → lenient parse →
change the parsed object → `format()` → new text → save**. The page holds one string. This is what makes the Builder
and the Text editor interchangeable, makes undo trivial (a stack of strings), and means a submission, a shared
solution or the reference design can be opened in either.

**Lenient parse** (`parseLenient(text)` in `parse.js`): parse line by line; a line that is not a valid statement is
kept as `{raw:"…", line:n}` instead of stopping. The Builder shows such lines in a card titled
`Lines the Builder can't read` with the text, the error message, and two buttons: `Edit as text` (switches to the
Text editor with the cursor on that line) and `Delete line`. Raw lines are written back unchanged, in place, by `format()`.

### 20.2 `format()`: the canonical text

`format(parsed) → string`. Rules, so that the same design always produces the same text:

1. Leading comment lines (before the first statement) are kept. Other comments are dropped (the page warns once: `Comments are removed when you edit in the Builder.`).
2. Order: parts in the order they were declared; one blank line; tables in declaration order; one blank line; routes in the order of the problem's `requests`. Raw lines stay next to the statement they followed.
3. A part is written `name = kind(arg=value, …)` with **every** argument of that kind, in the catalogue's order, including defaults (learners see what exists). Part names are padded with spaces so the `=` signs line up; route request names likewise up to the `:`.
4. Routes: `read  NAME: client > a > b | c` — single spaces around operators; `[replica]` directly after the name; `then invalidate x` at the end.
5. Ends with one newline. `format(parseLenient(format(x))) === format(x)` for every `x` (test this on every fixture).

### 20.3 Screen layout

One scrolling column (max width 720 px on desktop, full width on phones), in this order:

```
┌──────────────────────────────────────────────┐
│ ↶ ↷        ₹ 63,000 / month     ● 2 issues  │  sticky bar
├──────────────────────────────────────────────┤
│ PARTS                                  + Add │
│ [lb]  [api ×4 medium]  [cache 2×1 GB] …     │  part cards
├──────────────────────────────────────────────┤
│ TABLES                                 + Add │
│ db.links  (code ★, url, created_at)          │
├──────────────────────────────────────────────┤
│ REQUESTS                                     │
│ GET_LINK   read   "Open a short link…"       │
│ (client)→(lb)→(api)→(cache)⇢(db)   ✓        │
│ CREATE_LINK write "Create a short link…"     │
│ (client)→(lb)→(api)→(ids)→(db)  ⟲cache  ✓   │
├──────────────────────────────────────────────┤
│ ▸ Show picture                               │
└──────────────────────────────────────────────┘
```

**Sticky bar:** Undo, Redo (disabled when empty; history of the last 50 texts, shared with the Text editor);
running cost (or `—` when the design does not compile); an issues pill (`● 2 issues` red, `● 1 note` orange for
warnings only, `✓ Ready` green). Tapping the pill opens the issues list; tapping an issue scrolls to its card and
flashes its border.

### 20.4 Parts

**Part card** (one per part; min height 64 px): an icon for the kind; the **name** (tap to rename inline: a text
field that accepts only valid names, shows E003/E004 text under it, Enter or blur saves, Escape cancels; renaming
updates every route and table that uses the name); the kind in mono capitals; its settings (below); its monthly
price; `Used in: GET_LINK, CREATE_LINK` or `Not used yet` (orange); a `⋯` menu: Duplicate, Delete.

**Controls per setting** (never a free text field unless stated):

| Setting | Control |
|---|---|
| `count`, `nodes`, `replicas`, `rf`, `w`, `r` | Stepper `− 4 +`: 44 px buttons; press and hold repeats (first after 400 ms, then every 80 ms); tapping the number opens a number keypad field; values clamp to the allowed range; `−` is disabled at the minimum |
| `size` | Three-way segmented control: Small · Medium · Large, each with its capacity under it (`500/s`, `1,000/s`, `2,000/s`) |
| `memory_gb` | Preset chips: 1, 2, 4, 8, 16, 32, 64, 128, 256 |
| `ttl_s` | Preset chips: 10 s, 1 min, 5 min, 1 hour, 1 day, Custom (number + unit select). Shown in words, stored in seconds |
| `sync` | Switch labelled `Wait for replicas on every write` with the note `Safer, but writes take twice as long` |
| `kind` (idgen) | Four radio rows, each with one line: Counter (`never repeats; needs one coordinator`), Snowflake (`time + machine + sequence`), Random (`can repeat if too few bits`), Hash (`same input, same id; can collide`) |
| `bits` | Shown only for Random and Hash. Chips: 32, 48, 64, 96, 128 |

Under each settings group, one grey line states the consequence in the judge's own numbers, recomputed live, e.g.
for `server`: `4 × 1,000 = 4,000 requests a second · ₹24,000`; for `cache`: `Holds about 40 lakh links of 500 bytes`;
for `sql`: `1 primary + 1 replica · reads 3,000/s each · writes 1,000/s`. These lines are the main teaching device of
the Builder: the learner sees capacity before the judge has to say "Overloaded".

**Add part** (`+ Add`): a bottom sheet on phones (a popover on desktop) listing kinds in groups, each row with the
icon, a name, one line and the starting price:

| Group | Rows |
|---|---|
| Edge | Load balancer `Spreads calls over servers` · CDN `Serves copies from nearby` |
| Compute | Server `Runs your application` · Worker `Does background jobs from a queue` |
| Data | Cache `Fast memory for hot data` · SQL database `Tables, one primary, replicas` · NoSQL store `Many nodes, tunable consistency` · Object store `Large files` |
| Async | Queue `Hold work for later` |
| Helpers | ID generator `Makes unique ids` |

Tapping a row adds the part with default settings and a generated name, closes the sheet, scrolls to the new card
and opens its settings. **Generated names:** lb → `lb`, cdn → `cdn`, server → `api`, worker → `worker`, cache →
`cache`, sql → `db`, nosql → `kv`, queue → `queue`, objectstore → `files`, idgen → `ids`; if taken, add 2, 3, ….

**Delete part:** if it is used in routes, first ask `"api" is used in 2 requests. Remove it from them too?`
(Remove / Cancel). Removing a part from a route joins its neighbours with `>`; if that makes the route invalid the
issue appears as usual. After a delete, a bar at the bottom offers `Deleted "api". Undo` for 6 seconds.

### 20.5 Tables

A problem may give `"tables_hint": [{"name":"links","columns":["code","url","created_at"],"pk":"code"}]`. When a
`sql` or `nosql` part exists and a hinted table is missing, the Tables section shows a one-tap suggestion:
`Add table "links" to db`. A table card shows `part.name`, its columns as chips (a star on the primary key), and
`Indexes: none`. Editing opens a sheet: store select; column list (add, rename, delete); a radio for the primary
key; a checkbox per other column for "indexed". Under the card, per request that uses this table, a live line:
`GET_LINK looks up by "code" — primary key, fast` (green) or `… by "url" — not indexed: the database reads every row` (red).

### 20.6 Requests (building a route)

One card per request of the problem, in the problem's order; cards cannot be added or removed. Each shows the name,
a `read`/`write` pill, the request's `says` sentence, its limits as small chips (`may be 1 hour old`, `ids must be
unique`, `must not be lost`, `must show own writes`), and the **chain**.

**The chain** is a horizontally scrolling row of chips: `client` (fixed, grey) then one chip per hop, with a
connector drawn before each chip: a solid arrow for `>`, a dashed arrow labelled `miss` for `|`, a dotted arrow
labelled `later` for `~>`. Background hops (after `~>`) are dimmed with the caption `happens after the user gets an answer`.
A write route with `then invalidate` ends with a `⟲ cache` chip. The row ends with a round `+` button.

**`+` (add the next hop)** opens a sheet titled `What happens next?`. It lists **only parts that are allowed
here**, each with its kind, in this order: parts not yet in this route that the rules of section 3.4 permit after
the current last hop. For each candidate the sheet decides the connector:

| Last hop is… | Candidate is… | Offered as |
|---|---|---|
| anything | a `queue` | one row: `Hand over to queue — don't wait` (`~>`) |
| a `queue` | a `worker` | `Worker picks it up` (`>`); nothing else is offered |
| a `cache` or `cdn` | a store or compute part | two rows: `On a miss, ask db` (`\|`) and `Then always call db` (`>`); the first is marked "usual" |
| anything else | anything else | one row: `Call api` (`>`) |

If the candidate is a `sql` with replicas and the route is a read, the row has a switch `Read from replicas`
(`[replica]`). If no part is allowed, the sheet says why and offers the fix, e.g. `Nothing can come after db: it is
where the data lives.` or `There is no place to store data yet.` with a button `Add a database` that opens the Add
part sheet. At the bottom of the sheet: `+ Add a new part…`.

**Tapping a chip** opens a sheet for that hop: `Change to…` (same filtered list), the connector choice where two are
valid, the replica switch, `Remove from this request`, and `Remove this and everything after`.

**Write routes** show, under the chain, a select `After saving, clear:` listing caches and CDNs in the design plus
`Nothing`. It appears only when the design has a cache or CDN. Beside it, when a read of the same table goes through
that cache and it is set to Nothing: `Readers may see old data for up to 1 hour.` (orange, the cache's TTL in words).

**Completeness mark** at the right of each card: green `✓` when the route satisfies section 3.4; otherwise orange
with the first error's message in plain words (the E029/E030 texts).

### 20.7 Template, empty and first-time states

The Builder opens on the problem's `template`, so `lb` and `api` cards exist and each route already shows
`client → lb → api → +`. A first-time visitor (local storage key `tk-practice-coach` unset) gets three coach marks,
one at a time, each a small card with `Next` and `Skip`: on the first `+` (`Tap + to say what happens next in this
request.`), on `+ Add` (`Need a cache or a database? Add parts here.`), on Run (`Run tries your design on the
examples. Submit judges it on hidden tests.`).

### 20.8 Behaviour rules

- Every tap that changes the design updates the text, the cost, the issues, the consequence lines and the picture within 100 ms.
- No change is ever blocked for being "wrong": the Builder prevents only **syntactically impossible** things (a second route for a request, a hop the grammar forbids). A design that is merely bad (one server, no replica) is allowed; the judge teaches that.
- Undo and redo work across both editors and survive switching between them; they do not survive a page reload.
- The Builder must be fully usable with a keyboard (Tab order follows the screen; sheets trap focus; Escape closes; steppers respond to arrow keys) and a screen reader (each chip reads `step 3 of 4: cache, on a miss asks db`).
- All touch targets are at least 44 × 44 px. Sheets take at most 70 % of the screen height and scroll inside.
- Nothing in the Builder reveals hidden tests or the reference design.

### 20.9 Tests for the Builder

Round-trip (`format` idempotent on every fixture); lenient parse keeps raw lines in place; rename updates all uses;
delete-with-uses produces the expected text; the candidate filter offers exactly the parts section 3.4 allows (a
table-driven test over every pair of kinds); generated names; an end-to-end script on a Pixel 7 profile that builds
the reference design of problem 1 from the template **using taps only** and gets Accepted.

---

## 21. The evaluator engine: how it works inside

Sections 6 to 8 say **what** the judge computes. This section says **how the engine is built**, so that it stays
correct, fast and easy to extend. Everything lives in `frontend/src/tkd/` and is shared with the backend.

### 21.1 Principles

1. **Pure.** `judge(design, problem, test)` reads only its arguments. No clock, no randomness, no I/O.
2. **Deterministic.** Parts and routes are visited in a fixed order (declaration order for parts, the problem's order for requests). Numbers are rounded only at the comparison and display step (7), never in between.
3. **Explainable by construction.** The engine does not compute a verdict and then look for a reason. Every check produces a **finding** that already carries its request, phase, part, numbers and message. The verdict is chosen from the findings.
4. **One pass.** A route never visits a part twice and a cache's hit ratio depends only on the catalogue and the problem, so load is computed in a single left-to-right walk per route. There is no iteration to a fixed point. Cost: O(phases × routes × hops).
5. **Data, not code, for physics.** Every number is in `catalogue.js`. Every part kind is one object with the same six functions.
6. **Same engine everywhere.** Browser (Run), server (Submit), tests and the authoring tool all import the same files.

### 21.2 Layers and files

| Layer | File | In → out | May fail with |
|---|---|---|---|
| 1 Parse | `parse.js` | text → statements (`parse`, `parseLenient`) | E001–E005 |
| 2 Compile | `compile.js` | statements + problem → **design** (section 5) | E010–E043, W001–W002 |
| 3 Kinds | `kinds/*.js`, `catalogue.js` | one object per part kind | — |
| 4 Static checks | `checks.js` | design + problem → findings that do not depend on load (stale reads, read-your-writes, ids) | — |
| 5 Phase solver | `solve.js` | design + state + phase → per-part load, rho; per-request p99, outage, drops, lost writes | — |
| 6 Promises | `promises.js` | solver output over all phases + test promises → findings | — |
| 7 Verdict and explanation | `verdict.js` | findings → verdict, `failed` object, trace, message | — |
| 8 Runner | `judge.js` | `judge(design, problem, test)`, `judgeAll(source, problem, {hidden})` | — |
| 9 Format | `format.js` | design → text | — |

A layer imports only layers above it in this table. `judge.js` is the only file the page and the server call.

### 21.3 A part kind (the plug-in shape)

```js
// kinds/server.js
export default {
  kind: "server", managed: false, role: "compute",
  args: { count:{type:"int",min:1,max:200,default:1}, size:{type:"enum",values:["small","medium","large"],default:"small"} },
  initState: (p) => ({ alive: p.count }),
  cost:      (p) => PRICE.server[p.size] * p.count,
  capacity:  (p, s, mode) => CAP.server[p.size] * s.alive,          // mode: "read" | "write"
  baseP99:   (p, mode) => 20,
  onEvent:   (p, s, ev) => ev.type==="kill" ? { state:{alive:Math.max(0,s.alive-1)}, outage_s:0, lost_writes:0 } : null,
  isDown:    (p, s) => s.alive === 0,
};
```

`sql` and `nosql` return richer state and outage/lost-writes from `onEvent` (section 7.2); `cache` and `cdn` add
`hitRatio(p, s, request)` (section 7.3). **Adding a new kind** (say `search`) = one file here, its numbers in the
catalogue, its row in the Builder's Add sheet, its rule in the compiler's route table, and tests. Nothing else in the engine changes.

### 21.4 The phase solver, step by step

```
solvePhase(design, state, phase):
  1. for each event in phase.events: expand kill_role/flush_role to part names (declaration order);
     call kind.onEvent; store new state; record outage_s and lost_writes per part; mark faultSeen = true
  2. load = {}                                   # per part: read, write, readReplica
     for each request R in problem order with rate q = phase.rates[R] (0 if absent):
        x = q; background = false
        for each hop h in route(R):
           if h.op == "~>": background = true
           add x to load[h.part] (read or write by route mode; readReplica if h.replica)
           if next hop's op == "|": x = x * (1 - hitRatio(h.part, R))
        if route has invalidate C: add q to load[C].write
        remember for R: the list of (part, x, background, hit) = its trace skeleton
  3. for each part: rho = kind-specific (section 7.4); if rho > 1: drop = 1 - 1/rho else 0
  4. for each request R:
        p99 = Σ foreground hops base / (1 - min(rho, 0.95)), applying the "|" threshold rule, sync doubling, scan factor
        outage = max over foreground parts of (their outage_s; whole phase if isDown)   # a bypassable cache counts 0
        dropFraction = max over ALL parts on the route of drop
        failed = q*outage + q*dropFraction*(phase.seconds - outage)
        lost = Σ lost_writes on parts this write reaches, if R.durable
  5. return { perPart, perRequest, faultSeen, state }
```

`judge()` folds `solvePhase` over the phases, carrying `state` and `faultSeen`, and keeps per request: max p99,
total and failed calls, lost writes, and for each the phase and part where the worst value occurred (for blame).

### 21.5 Findings and the verdict

A finding: `{ type, request, phase, part, line, expected, actual, numbers:{…} }` with `type` one of `stale`, `ryw`,
`no_id`, `collision`, `lost`, `unavailable`, `overloaded`, `p99`, `budget`. Layers 4 and 6 emit **all** findings for
the test; layer 7 sorts them by the precedence of section 7.7 (ties: problem's request order, then phase) and takes
the first. The others are returned in `also` (max 3) and shown collapsed under `Other things that went wrong in this
test`, so a learner fixing one problem is not surprised by the next.

**Blame** (which part the message and the red box point at):

| Finding | Blamed part |
|---|---|
| `p99` | The foreground hop with the largest `p99_hop − base` in the worst phase; if every hop is within 20 % of its base, the hop with the largest base (the route is simply too long or the store too slow) |
| `overloaded` | The part with the highest rho |
| `unavailable` | The part that was down or had the outage; if the cause was drops after a kill, the part with the highest rho |
| `lost` | The store that lost the writes |
| `stale`, `ryw` | The cache with the largest TTL contribution, else the replica-read store |
| `no_id`, `collision` | The `idgen`, or the route's store when there is none |
| `budget` | The most expensive part |

**Next-step tip** (one line under the explanation, from a fixed table keyed by finding type and blamed kind; never
the answer, never a number): e.g. `overloaded` + `server` → `More servers, bigger servers, or fewer calls reaching
them.`; `overloaded` + `sql` on a read → `Could most of these reads be answered before they reach the database?`;
`p99` + `sql` with a scan → `The lookup column has no index.`; `unavailable` + `sql` → `What takes over when the
primary is gone?`; `lost` → `Were the writes anywhere else when the primary died?`; `stale` → `Shorter TTL, or clear
the cache when the data changes.`; `budget` → `Which part are you paying for but barely using?` (the engine adds
the part with the lowest rho among those costing over 10 % of the total).

### 21.6 Margins (so verdicts are never knife-edge)

For every promise the engine also returns a **margin**: `(limit − actual) / limit` for "at most" promises (p99,
budget) and `(actual − limit) / (1 − limit)` for availability. Uses:

- **Authoring rule, enforced by `problems2.test.js`:** the reference design passes every promise with margin ≥ 0.10; each wrong design fails its target promise with margin ≤ −0.10. This keeps a tiny future change in a formula from flipping verdicts.
- **In the page:** on a failed latency or budget promise within 10 % show `Close: only {x} % over.`; on Accepted, the smallest margin is shown as `Tightest promise: GET_LINK p99, 12 % to spare.`

### 21.7 Running it on the server

- The server loads problems once at start and keeps them in memory; a content reload follows the existing content code.
- **Submit pipeline:** validate size → `key = sha256(judge_version + problem_id + source)` → look in an in-memory LRU of 5,000 results (same input, same output, so duplicates cost nothing) → else `judgeAll` → strip hidden detail → store the submission → update stats → respond.
- Judging is CPU work of a few milliseconds. Run it through the **existing judge pool** if `backend/test/judge-pool.test.js` shows a worker pool that fits (read it first); otherwise inline. Either way enforce a **250 ms time limit** per submission. On timeout or an exception inside the engine: respond HTTP 200 with verdict `Judge Error`, message `The judge had a problem with this design. It has been reported; try again later.`, do **not** count it in stats, and log problem id, judge version and a hash of the source (never the user's identity beside the source in logs).
- `judge_version` is a constant in `judge.js`. Raise it whenever a formula, a catalogue number, a rule or a message that depends on numbers changes. On raise: the result cache is cleared automatically (the key includes the version); stored submissions keep their old verdict and are labelled.

### 21.8 Proving the engine

| Test | What it proves |
|---|---|
| Unit test per kind function and per rule of 7.2–7.7 | Each formula is implemented as written |
| The worked example of 7.10 | The pieces fit together |
| **Golden files**: for every problem's reference and wrong designs, the full result JSON is stored in `tkd/golden/` and compared exactly | Nothing changes by accident; a deliberate change shows up as a reviewed diff plus a `judge_version` bump |
| Property tests (seeded, 500 random valid designs per problem) | Monotonicity: more instances, bigger sizes, more memory or more replicas never make latency, availability or overload **worse**; cost never goes down; a looser promise never turns a pass into a fail |
| Determinism: 100 runs deep-equal; Node and browser equal | Trust |
| Fuzz the parser with 10,000 random strings (seeded) | It never throws and never takes more than 5 ms |
| Timing: `judgeAll` on the largest design and 20 tests under 20 ms | Speed |

### 21.9 What version 2 of the engine would add (not now)

The interface `judge(design, problem, test)` stays; only layer 5 changes. Candidates, in order of teaching value:
a time-stepped solver for queues (backlog grows when workers are slower than arrivals, drains later); autoscaling
with a delay; retries and back-pressure (a retry storm after a failure); cache warm-up curves instead of an instant
hit ratio; multi-zone placement and zone loss; per-key hot spots for partitioned stores. Each arrives as new
problems that need it, never as a change to the verdict of an existing accepted design without a version bump.

---

## 22. The evaluator engine, second pass

A critical re-read of sections 6, 7 and 21, looking for places where the model would teach the wrong thing, behave
unfairly, or be awkward to build. Each finding has a decision. **This section overrides earlier ones where they differ.**

### 22.1 What was wrong with the first model

| # | Weakness found | Why it matters | Decision |
|---|---|---|---|
| 1 | A cache's TTL had no effect on its hit ratio | The central caching trade-off (fresh data against hit ratio) did not exist: `ttl_s=1` was free | Hit ratio now includes `warm` (22.2) |
| 2 | Writes did not hurt a cache | A cache in front of write-heavy data looked as good as in front of read-heavy data | `churn` (22.2); and write-through as an alternative (22.3) |
| 3 | The "miss > 1 %" rule made p99 jump between two values | A cliff: a 0.1 % change in hit ratio moved p99 by a whole database call | Removed. p99 always includes the miss path; the cache's benefit shows in load, in p50 and in cost (22.4) |
| 4 | A cache restart meant "hit ratio 0 for the whole phase", and a failover was arithmetic on `outage_seconds` | Too harsh, and two special cases inside the solver | **Segments** (22.5): every phase is cut into pieces with constant conditions |
| 5 | A slow worker behind a queue "dropped" calls | Wrong: a queue's whole purpose is to hold work and drain later | **Backlog** model and a new promise `done_within_s` (22.6) |
| 6 | `[replica]` reads when no replica is left were undefined; so were zero rates and zero capacity | Crashes or NaN in the engine | Edge rules (22.7) |
| 7 | `Math.exp` and `Math.pow` may differ in the last digit between browser engines | A design on the edge could pass in Run and fail in Submit | Rounding rule (22.8) |
| 8 | Tips came from a fixed table and could point at a change that does not help | A wrong tip is worse than none | Tips are **checked by re-running** (22.9) |
| 9 | Whitespace and comments changed the result-cache key and made identical designs look different in ranking | Wasted work; duplicate "solutions" | Hash and compare the **formatted** design (22.10) |
| 10 | Nothing told an author whether a problem is too easy (everything passes) or has one single answer | Bad problems ship | **Design-space sweep** tool (22.11) |
| 11 | Only p99 could be promised | No way to reward "most reads are fast" | `p50_ms` promise (22.4) |
| 12 | A single point of failure was found only if a test killed it | Learners should hear it earlier | Static note `W003` (22.12) |

### 22.2 Cache hit ratio (final)

`h = min(HIT_MAX, (c × warm)^(1 − s) × (1 − churn))`, where for request R in a segment:

- `c = min(1, items / D)`: the share of distinct keys that fit in memory.
- `warm = 1 − exp(−q × ttl_s / D)`: the chance that a key was asked for within the last `ttl_s` (so its copy is still there). Long TTL or hot data → near 1. `ttl_s = 1` on a million keys at 2,000/s → 0.002: the cache is almost useless.
- the exponent `(1 − s)` models skew: when a few keys take most traffic, a small or short-lived cache still answers most reads.
- `churn = min(1, w / q)` applies when writes to the same table **invalidate** this cache: each write throws away a copy that a later read must fetch again. With `then update` (write-through) `churn = 0`. With neither, `churn = 0` but the copies are stale (section 7.6).

All three are monotone the right way (more memory, longer TTL, fewer writes never lower `h`); the property tests of 21.8 must check this.

### 22.3 Write-through: `then update X`

Effects, compared with `then invalidate X`: the cache gets one write per call **and the write waits for it** (add the
cache hop's p99 to the write's latency); staleness contributed by `X` for that table is 0; `churn` is 0. Trade-off
the learner now sees: faster and fresher reads, slower writes, and the cache holds data nobody may read. Builder:
the select under a write route (20.6) becomes `After saving:` with rows `Do nothing`, `Clear the copy in cache` (invalidate), `Write the new value into cache` (update).

### 22.4 Latency: p99 and p50

- p99 = sum of all foreground hops including every fallback after `|`.
- p50 = `P50_RATIO ×` the sum of foreground hops, where the fallback after `A | B` counts only if `h_A < 0.5`.
- New promise `p50_ms` per request. A typical read problem promises both, e.g. `p50 ≤ 20 ms, p99 ≤ 120 ms`: the first needs a good cache, the second needs the miss path to be healthy.
- Failing either gives **Too Slow**; the message names which (`… took 31.0 ms for the median request; the promise is 20 ms.`).
- Ranking after Accepted (section 13) uses p99 of the problem's first request.

### 22.5 Segments

Before solving, each phase is cut into **segments**; conditions are constant inside a segment. Cutting rules, applied in this order to a phase of length T that starts with events:

1. If a `sql` primary was killed and a replica is promoted: a first segment of `min(FAILOVER_S, T)` seconds in which that part is **down for writes and for primary reads**.
2. If a cache was flushed (or a cache node was killed, which loses that node's share): a segment of `min(COLD_S, remaining)` seconds in which that cache has `h = 0` (flush) or `h` computed with the surviving nodes' memory **and** `warm = 0` for the lost share (simplify: treat as `h × alive_after / alive_before`).
3. The rest of the phase with the new steady state.

Overlapping cuts split further (at most 4 segments per phase). The solver of 21.4 runs **per segment**; step 1 of its
pseudo-code (events) moves to the cutter. Availability is simply `1 − Σ failed / Σ total` over segments; p99 and p50
are the maximum over segments **longer than 1 % of the test's total length** (a 30-second failover inside a 20-minute
test is 2.5 % of the time, so it does count; this is deliberate: a cold cache that makes the service slow for a minute is a real failure of a p99 promise).

### 22.6 Queues and backlog

A `queue` accepts up to its capacity and **never drops** below it. For the first `worker` after a queue, per segment:
`arrive` = rate into the queue, `serve = min(worker capacity, arrive + backlog / seconds)`; `backlog += (arrive − worker capacity) × seconds`, floored at 0; `delay_s = backlog / worker capacity` at the end of the segment. Parts after the worker receive `serve`, not `arrive` (a queue protects what is behind it from spikes: this is the lesson).

New promise `done_within_s: {REQUEST: n}` for requests whose route has `~>`: the maximum `delay_s` over segments must
be ≤ n, **and** the backlog must be 0 at the end of the test unless the test sets `"may_end_with_backlog": true`.
Missing it → **Too Slow**, reason `backlog`, message `{request} was still waiting {delay} after it was accepted; the promise is {n}. {part} can do {cap} a second but {arrive} arrive.` A durable write that is still in the queue at the end is **not** lost.

### 22.7 Edge rules (no NaN, no crash)

- A request with rate 0 in a segment is skipped (its p99 for that segment is not computed).
- Capacity 0 (`alive == 0`, not bypassable) → the part is down; `rho` is reported as `null` and shown as `down`.
- `[replica]` reads when `replicasUp == 0` go to the primary.
- `D == 0` or `B == 0` in a problem file is an authoring error caught by `problems2.test.js`.
- A killed part that does not exist in the design (the test kills `cache`, the learner has none) is a no-op.
- `kill_role` on a role with several parts kills **one unit in each**.
- All division results are checked with `Number.isFinite`; a non-finite number anywhere → `Judge Error` (21.7), never a verdict.

### 22.8 Numbers that match everywhere

Immediately after every `Math.exp` or `Math.pow`, round the result to **6 decimals**. Round each hop latency to
**2 decimals** before summing, `rho` to **4 decimals** before use in a latency, money to whole rupees. Use a helper
`round(x, d) = Math.round(x × 10^d) / 10^d` and nothing else. With this, Run in any browser and Submit on the server
agree to the last displayed digit; the determinism test (21.8) asserts it for Chromium and, if available in CI, WebKit.

### 22.9 Tips that are checked

After choosing the finding and the blamed part, the engine builds up to **6 candidate changes** from a fixed list for
that finding (examples: double the blamed part's `count`; next `size` up; add one replica; set `sync=true`; halve
the cache's `ttl_s`; multiply its `memory_gb` by 4; add `[replica]` to the read; add `then invalidate`). It applies
each to a copy of the design and re-runs **only the failed test**. A tip is shown only if its change makes that
finding disappear (other findings may remain). If several work, show the first in list order; if none works, show
no tip and the line `There is more than one thing to fix here.` The tip text never contains the number that worked:
it says `More capacity in "api" would fix this.`, not `count=6`. Cost: at most 6 extra test runs, a few milliseconds.
Tips are shown from the **second failed Submit** on a problem onwards (the first failure shows only the explanation), and always on Run.

### 22.10 One design, one identity

`canonical(source) = format(parseLenient(source))` with all comment lines removed. The result cache key (21.7), the
"same as your last submission" check, and the grouping of shared Solutions all use `sha256(canonical)`. Two
submissions with the same canonical text are one design: the Solutions tab shows it once with a count (`Used by 14 people`).

### 22.11 Design-space sweep (authoring tool)

`node backend/scripts/sweep-problem.mjs <slug>`: enumerates a grid of plausible designs for the problem (server
count 1, 2, 3, 4, 6, 8 × three sizes; no cache / cache 1, 4, 16 GB with TTL 1 min, 1 h; sql three sizes × replicas 0,
1, 2 × sync on/off; id kinds; with and without invalidate/update: a few thousand combinations, built with
`format()`), judges each against all tests, and prints: how many are Accepted; the cheapest Accepted design and the
reference's cost rank among them; for each test, how many designs it alone rejects; for each verdict, how many
designs get it. **A problem ships only if:** 1 % to 20 % of the grid is Accepted; the reference is within 15 % of the
cheapest Accepted cost; every test rejects at least 2 % of the grid that the other tests accept (otherwise the test
adds nothing: delete it); and no verdict the problem claims to teach has zero designs. The tool's summary is pasted
into the pull request that adds the problem.

### 22.12 Static notes (no test needed)

Add warning `W003`: an unmanaged part with one unit (`server`/`worker` `count=1`, `cache` `nodes=1`, `sql`
`replicas=0`) on a foreground route: `"{name}" has no spare. If it fails, {requests} stop.` Shown in the editor and
the Builder's issues list like other warnings; it never fails a design (a test that kills the part does).

### 22.13 What the engine deliberately still does not model

Retries and timeouts; connection limits; network time between parts (it is inside each hop's base latency);
partial failures (a part is up or down); geography; data size on disk and its cost; the time a new replica takes to
catch up. Each is a candidate for version 2 **only together with a problem that needs it**.

### 22.14 Changes to earlier sections caused by this pass (already applied where marked)

| Where | Change | Applied in place? |
|---|---|---|
| Section 6 constants | `MISS_P99_THRESHOLD` removed; `P50_RATIO`, `COLD_S` added | Yes |
| 7.3 | New hit-ratio formula | Yes |
| 7.7 | p99 includes every fallback; p50 defined | Yes |
| 7.10 | Worked example recomputed (GET_LINK p99 75.6 ms, p50 16.3 ms) | Yes |
| 3.2 grammar, E034 | `then update` | Yes |
| 7.2, 7.5, 21.4 | Outage arithmetic and "cold for the whole phase" are replaced by segments (22.5); workers behind queues use backlog (22.6) instead of drops | **No: follow 22.5 and 22.6** |
| 7.7 promises, 9.3 test format | New promises `p50_ms`, `done_within_s`; test flag `may_end_with_backlog` | **No: add them** |
| 7.9 messages | New reason `backlog`; p50 wording | **No: texts are in 22.4 and 22.6** |
| 21.5 tips | Fixed table becomes the candidate list of 22.9 | **No: follow 22.9** |
| 21.7 cache key | Uses `canonical(source)` | **No: follow 22.10** |
| Section 16 | Step 2 includes segments, backlog, tip checking; step 3 includes the sweep tool and its ship rule | **No: do it in those steps** |

---

## 23. What "the best system design problem-solving platform" requires

Owner, 12 Nov 2026: "We want the best system design problem solving platform." Sections 1 to 22 describe a good
loop and a sound judge. That is necessary, not sufficient. This section says what "best" means in terms that can be
checked, what is still missing, and the order to pursue it. It is direction for the owner, not build steps.

### 23.1 Seven things the best platform does, and where this design stands

| # | The best platform… | In this spec? | What is still needed |
|---|---|---|---|
| 1 | **Is never wrong.** One unfair verdict is told to ten friends | Golden files, margins, property tests, sweep tool (21.8, 22.11) | A public page "How the judge works" with every number and rule of sections 6, 7 and 22 in plain words; a `Report this verdict` link on every result that stores the design and the result for the owner; a promise to answer reports |
| 2 | **Teaches from every failure** | Explanation, trace, blamed part, checked tips (21.5, 22.9) | Each finding links to the exact section of the Concepts article that explains it. After Accepted: **compare** your design with the reference and the cheapest shared one, side by side, differences highlighted |
| 3 | **Feels like the interview** | Problems are single scenarios | **Follow-ups** (23.2): what an interviewer does after your first answer |
| 4 | **Covers the talking, not only the drawing** | Editorials only | "Explain your trade-off" with AI comments (decision section, item 6), then timed **mock interviews** built from a problem and its follow-ups |
| 5 | **Is fast and works on the phone in your hand** | Builder, browser-side Run | Hold the budgets: first verdict in under 2 minutes for a newcomer on a phone; Run under 100 ms; the problem page usable on a slow connection (problem JSON and engine under 100 KB compressed) |
| 6 | **Brings people back** | Daily problem, streak, list, ranking | Study plans by goal ("interview in 2 weeks"), company lists, a weekly problem set released together, reminders the learner opts into |
| 7 | **Belongs to its audience** | Rupees, Indian scenarios, phone-first | Numbers in lakh and crore everywhere; problems from Indian-scale systems (UPI, IRCTC Tatkal, IPL streaming, quick commerce); later, explanations in Hindi and Marathi |

### 23.2 Follow-ups: the feature that would set this apart

In a real interview the first design is the start. The interviewer then changes something: "traffic is now 10×",
"a region goes down", "we need analytics on every click", "legal says delete a user's data in 24 hours". No fixed
problem can do this; a deterministic judge can.

- A problem may have `followups`: an ordered list, each with a one-paragraph prompt, **changes** to the problem (rates, `total_items`, a new request, a tighter promise, a smaller budget) and its own tests.
- A follow-up unlocks when the previous part is Accepted. The learner's accepted design is carried forward as the starting text; the first Run usually fails, and the result shows exactly what the change broke.
- Each part is judged and ranked on its own. The list shows `1.1`, `1.2`, `1.3` under problem 1 with their own status.
- Authoring: the reference design of part N must fail part N+1 (checked in CI), otherwise the follow-up teaches nothing.
- Engine impact: none. A follow-up is a problem file that inherits from its parent.

Build this after the first ten problems are live, starting with two follow-ups each for problems 1, 4 and 10.

### 23.3 How we will know (numbers to watch from the first day)

| Measure | Target | If it misses |
|---|---|---|
| Time from opening a problem to the first Run, median, phone | under 2 minutes | The Builder or the template is the problem; watch five people |
| Share of visitors to a problem page who press Run | over 50 % | The statement is too long or the first step is unclear |
| Share of people who Run who also Submit | over 40 % | Sign-in is in the way, or Run feels sufficient |
| Accepted rate per problem (accepted ÷ submitting users) | Easy 60–80 %, Medium 35–60 %, Hard 15–35 % | Re-tune the tests with the sweep tool, or move the difficulty label |
| People who solve a second problem within 7 days | over 30 % | The habit loop (daily problem, next-problem button) is weak |
| Verdict reports per 1,000 submissions | under 5, and every one answered | A model or problem bug: fix, bump `judge_version` |
| Engine errors (`Judge Error`) | 0 | A bug: the stored hash and version reproduce it |

These need three analytics events (`practice_run`, `practice_submit` with verdict, `practice_open`) through the
existing `frontend/src/analytics.js`; add them in build step 5b.

### 23.4 What to do next, in order

1. **Build one problem end to end** (steps 1 to 5b of section 16) and put it in front of five friends on their phones. Until this happens, everything in this file is an untested idea, including the numbers.
2. Fix what they stumble on. Expect the Builder's "what happens next" sheet and the first failure message to need the most work.
3. Ship ten problems with the judge page and the report link (23.1 rows 1 and 2).
4. Follow-ups (23.2).
5. Plans, company lists, compare view.
6. The talking part: explanations, then mock interviews.

### 23.5 What would stop it being the best

- **More specification before a prototype.** This file is long enough. Its weakest point is that none of it has run.
- A judge that is clever but cannot be explained in one page. If a rule cannot be written on the "How the judge works" page in a sentence, it should not be in the engine.
- Problems written quickly. One calibrated problem with good tests, wrong designs and an editorial is worth five thin ones; the sweep tool's ship rules are not optional.
- Hiding the model's limits. Say plainly what the judge does not model (22.13); learners forgive limits and do not forgive pretence.
