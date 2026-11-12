# 21 — Problems, LeetCode-style: a fresh think

**Status:** thinking document, 12 Nov 2026. Nothing here is built or decided. Owner's brief: "take a step back …
think of the evaluator and the entire interview questions and problems experience. Don't take into consideration the
current canvas and … experience. We need to make the problem solving experience LeetCode style."

So this file deliberately ignores what exists (the canvas, `evaluator.md`, the current Problems pages). It was written
without re-reading them. Section 10 lists what must be compared with them before anything is built.

---

## 1. What "LeetCode style" really is

It is not the dark editor. It is a **loop that takes under a minute and never leaves one screen**:

1. **Pick** a problem from a list (number, title, difficulty, acceptance, your status).
2. **Read** a short statement: the task, 2 or 3 worked examples, hard constraints.
3. **Write** an answer in an editor that starts from a template, not a blank page.
4. **Run** it against the visible examples. Result in about a second, shown beside what was expected.
5. **Submit** it against hidden tests. One of a few fixed **verdicts** comes back, with the first failing case.
6. **Fix and repeat**, or on Accepted see **how you rank** (faster than 83 %), then read the **editorial** and others' solutions.

Why it works, and what we must keep:

| Property | Why it matters |
|---|---|
| The answer is precise and machine-checkable | No opinion, no waiting for a person |
| The judge is deterministic | Same answer, same verdict, every time; people trust it |
| Feedback is instant and specific | "Wrong on this input: expected X, got Y" teaches more than a score |
| Visible examples, hidden tests | You can't pass by fitting the examples |
| A tiny set of verdict words | Accepted / Wrong Answer / Time Limit Exceeded become shared vocabulary |
| Ranking after acceptance | A reason to improve an answer that already passes |
| Everything on one screen | Statement, answer, result; no page changes inside the loop |
| A countable catalogue | 1 to N, Easy/Medium/Hard, tags, lists: progress is visible and addictive |

## 2. The hard question: what is the "code" in system design?

LeetCode works because code is exact. A system design answer on a whiteboard is not. Everything else follows from
this one choice.

| Option | What the learner produces | Exact? | Fast to write? | Phone? | Verdict |
|---|---|---|---|---|---|
| A. Free text or a drawing | Prose, boxes | No | Yes | Yes | Cannot be judged without an AI or a person. Not LeetCode-style |
| B. Multiple choice per step | Picks | Yes | Yes | Yes | A quiz, not design. Easy to guess |
| C. Free canvas (drag, connect, configure) | A diagram | Yes | **No**: dragging and settings panels are slow, and unusable on a phone | No | Precise but breaks the one-minute loop |
| **D. A design written as a short spec in an editor** | 15 to 40 lines of a small design language | Yes | Yes, with a template and autocomplete | With a form view | **Recommended** |

**Recommendation: the answer is a short text spec ("the design"), and the diagram is drawn *from* it, live, as output.**
This is the closest thing to code: it diffs, it copies, it has a template, it has syntax errors, solutions can be
shared and compared line by line, and the judge reads exactly what the learner wrote. The picture still appears
(people think in pictures), but nobody drags boxes.

A sketch of the language (names are illustrative):

```
# Design a URL shortener
client -> lb -> api(x4, c5.large)
api -> cache(redis, 8GB, ttl=1h)      : read  GET /{code}   # cache-aside
api -> db(postgres, primary+2 replicas): write POST /links
db.table links(code PK, url, created_at)  index(code)
api.id = base62(counter from zookeeper)
```

Rules for the language: one line per component or connection; few keywords; sizes and counts are numbers the judge
uses; every problem gives a starting template with the client and the requests already written; autocomplete offers
only parts that exist. On phones the same spec is edited through a **form view** (add part, pick from a list, steppers
for numbers) that writes the same text. Both views are one answer.

## 3. What is a test case?

In LeetCode a test is an input and an expected output. Here a test is a **scenario and a set of promises**:

| Part | Example |
|---|---|
| Workload | 1,200 reads/s and 12 writes/s for 10 minutes; keys follow a skewed distribution |
| Event | at minute 4 one server dies; at minute 6 traffic triples |
| Promises (assertions) | every `GET /{code}` returns the right URL; p99 under 100 ms; no accepted write is lost; availability at least 99.9 %; bill under ₹X per month |

Visible **examples** (2 or 3) are small and come with an explanation, like LeetCode's Example 1. **Hidden tests**
(8 to 20) push scale, skew, faults and budget. Each problem also has **constraints** stated up front
("up to 10 crore links", "budget ₹2 lakh a month"), exactly like `1 <= n <= 10^5`.

## 4. Verdicts

A small fixed vocabulary, each with a one-line reason and the first failing test:

| Verdict | Meaning | LeetCode cousin |
|---|---|---|
| **Accepted** | Every promise held in every test | Accepted |
| **Invalid Design** | The spec does not parse, or a request has no path to an answer | Compile Error |
| **Wrong Answer** | A request returned the wrong or stale data (correctness, consistency) | Wrong Answer |
| **Too Slow** | A latency promise broke | Time Limit Exceeded |
| **Overloaded** | A part ran past its capacity; requests were dropped | Memory/Time Limit |
| **Unavailable** | A fault took the service below its availability promise | Runtime Error |
| **Data Lost** | An acknowledged write was lost | (ours) |
| **Over Budget** | It works but costs more than allowed | (ours) |

Shown like LeetCode: verdict in colour, "12 / 17 tests passed", then the failing test: the scenario, **expected vs
your design**, and a trace of one failing request hop by hop. After **Accepted**: "Cost: ₹84,000/month, cheaper than
71 % of accepted designs" and "p99 41 ms, faster than 64 %". These two bars are the reason to resubmit.

## 5. The evaluator (the judge)

Requirements, in order: **deterministic**, **fast** (Run under 1 s, Submit under 3 s), **explainable** (every failure
names a rule and a request), **cheap to author** tests for, **hard to game**.

Proposed shape, as a pipeline:

1. **Parse** the spec into parts, connections, settings. Errors point at a line (Invalid Design).
2. **Check structure**: every request type in the problem resolves to a path from client to a data source.
3. **Resolve semantics** per request: who answers, from which copy of the data, with what freshness. This catches
   Wrong Answer (reads a replica right after a write when the problem demands read-your-writes; cache never invalidated).
4. **Compute load** analytically, not by simulating every request: rates flow through the graph; each part has a
   capacity and a latency curve (queueing formula); cache hit rates come from the workload's skew and the cache size.
   This is what makes it fast and deterministic.
5. **Inject events** from the test (kill a node, triple traffic, partition) and recompute; check availability and data-loss rules.
6. **Price** the design from a fixed price list.
7. **Compare with promises**, stop at the first failure, produce the verdict and the trace.

Design choices to make: analytic model first, small seeded simulation only where order matters (queues, retries);
run in the browser for Run and **re-run on the server for Submit** (the server's verdict is the record, so results
can't be faked); version the judge so old submissions stay explainable; every part's numbers live in one catalogue
file so authors do not write physics per problem.

**The honest limit:** real design has many right answers and judgement. The judge can only check what a problem
states as a promise. So problems must be written as *promises*, and the open-ended parts (trade-off talk) live in the
editorial, not the verdict.

## 6. The problem page (one screen)

```
┌ Problem list ‹ ›  Random                     Run   Submit        timer  account ┐
├──────────────────────────────┬──────────────────────────────────────────────────┤
│ Description | Editorial |    │  Design (editor)            [Text | Form]  Reset │
│ Solutions | Submissions      │  ...spec...                                      │
│                              │                                                  │
│ 12. Design a URL shortener   ├──────────────────────────────────────────────────┤
│ Easy · Topics · Companies    │  Diagram (drawn from the spec, read-only)        │
│ statement                    ├──────────────────────────────────────────────────┤
│ Example 1, Example 2         │  Testcase | Result                               │
│ Constraints                  │  verdict, tests passed, expected vs yours, trace │
│ Hints (collapsed)            │                                                  │
└──────────────────────────────┴──────────────────────────────────────────────────┘
```

- Left tabs exactly as LeetCode: **Description, Editorial, Solutions, Submissions**.
- **Testcase** tab lets the learner edit the visible scenario (change the traffic, add a failure) and Run: the
  equivalent of custom input, and the best learning tool on the page.
- **Phone:** the same three things as tabs along the bottom: Problem, Design (form view by default), Result.
- Keyboard: Run and Submit shortcuts; the editor keeps its text per problem.

## 7. Around the loop

| Feature | Notes |
|---|---|
| Problem list | #, title, difficulty, acceptance %, status; filter by topic (caching, queues, sharding…), company, list |
| Study plans | "System Design 30": ordered sets with progress bars |
| Daily problem and streak | One per day; calendar; the main habit loop |
| Submissions history | Every attempt with verdict, cost, p99; open any old one in the editor |
| Solutions | Accepted designs published with a short note; sort by cheapest, fastest, most liked. Only visible after you solve or give up |
| Editorial | The site's worked answer: approach, the design, why, common wrong turns. Links to the Concepts articles |
| Hints | Progressive, each costs nothing but is recorded |
| Interview mode | A timer and no hints; ends with a summary. (Contests later) |
| Free and paid | Free: a set of problems and all Run. Paid: all problems, hidden-test details, editorials, solutions, plans |

## 8. Problem format (what an author writes)

One file per problem: id, title, difficulty, topics, companies; statement; examples with explanations; constraints;
the request types; starter template; visible tests; hidden tests (scenario + promises); reference design (must be
Accepted by the judge in CI); 2 or 3 deliberately wrong designs with the verdict each must get (also checked in CI);
hints; editorial. The wrong designs are the judge's own unit tests and stop it drifting.

## 9. Risks

- **The language is one more thing to learn.** Keep it to a page; template + autocomplete + form view; first problem is a tutorial.
- **Gaming the judge** (over-provision everything). The budget promise and the cost ranking answer this.
- **False verdicts destroy trust.** Reference and wrong designs in CI for every problem; a "report this verdict" link.
- **Authoring cost.** Scenarios reuse shared workload shapes and a shared parts catalogue.
- **Phones.** The form view must be first-class, not an afterthought.

## 10. Before building: compare and decide

1. Read `evaluator.md` and the current judge code against sections 3 to 5; list what can be reused (the brief said not to consider them while thinking, not to throw them away).
2. Owner decisions: text spec + form (D) versus keeping a canvas as a third view; the verdict names; what is free; whether Solutions are public.
3. Prototype one problem end to end (URL shortener): language, judge, page. Test with five friends: can they get from opening the page to a first verdict in under two minutes?
4. Only then write the build spec, the way `20-UI-REDESIGN-SPEC.md` was written.
