# 33 — Canvas animations (healthy and crashed) and what to take from System Design Canvas

Written 2026-11-14 in session `ccr-328fc450-xdjrk1`. Owner: "Think for animations for all the widgets within the canvases
in case of both healthy and crashed components. You may use the animations skills GitHub repo that we used earlier",
and "There was an open source repo we had found earlier related to system design canvas and evaluator. Check out good
things in them. Check if we can also have them in our system."

**Status: design only, nothing built in the app.** A working prototype of every animation in this spec is published
privately for the owner: **Canvas Motion Lab**, https://claude.ai/artifact/GDYC1KBTaJyiU2j8xZthBA (a 40-minute replay of
the URL shortener's evening peak, a gallery of all 15 widgets in both states, the 5 arrow states, the rules).

Sources read (cloned read-only, nothing copied into the app):
- `elayadesign/ai-design-skills` → `landing-page-design` SKILL.md §B7 *Motion* (used in spec 32).
- `nextlevelbuilder/ui-ux-pro-max-skill` → `src/ui-ux-pro-max/data/motion.csv` (17 motion patterns; used in spec 20).
- `ozers/system-design-canvas` (MIT; the "System Design Canvas" the owner compared our canvas with, #358): README,
  `src/lib/validation.ts`, `components/edges/SystemEdge.tsx`, `components/nodes/BaseSystemNode.tsx`,
  `components/canvas/PresentationOverlay.tsx`, `lib/auto-layout.ts`, `app/globals.css`.

> Which repos the owner meant is an inference: the context docs name these two skill repos as the ones used for motion,
> and System Design Canvas is the open-source canvas from this session. It has "Design checks" but no evaluator; no
> other open-source canvas-with-evaluator repo is recorded in any context doc. **Ask the owner if another was meant.**

---

## Part 1. Animations

### 1.1 Rules (from the two skills, spec 24 and our own motion layer)

| Rule | Value |
|---|---|
| Curve | `cubic-bezier(.22,1,.36,1)` for movement, 300–500 ms; colour/opacity 200–300 ms, never shorter than 200 ms (skill B7). Our `theme/motion.css` already has the shake; keep its 320 ms. |
| What moves | `transform` and `opacity` only (B7). The glow is a `::after` box-shadow whose **opacity** changes; load bars are `scaleX`, not `width` (today `.ln-bar i` animates `width`: change it). |
| Truth | Every motion is driven by a field of the simulator's timeline (`simulate.js`: per node per minute `rho, up, instances, backlog, held, callsLimit`; per op `rate, ok, p99`) or an event (`crashed, failover, recovered, cold, warm, scaledOut, scaledIn, backlog, drained, writesLost, hotPart`, test-level `zoneDown, zoneBack, poison, hotKey, abuse`). Nothing decorative. |
| Alarms | A red pulse runs 3 times then holds (WCAG 2.3.1: ≤ 3 flashes a second). |
| Loops | Stop off screen (IntersectionObserver) and when the tab is hidden (motion.csv #15–17); on phones only the canvas in view runs, half the dots (spec 24 rule). |
| Reduced motion | No dots, loops or shakes. The final state shows at once **with words**: DOWN, 73 %, backlog 4,200 (B7: "replace movement with a plain opacity change"). |
| Budget | One `requestAnimationFrame` loop per canvas for all dots; ≤ 5 dots an arrow, ≤ 150 on a canvas. |

### 1.2 The card in every state (all 15 types)

| State | Comes from | Animation |
|---|---|---|
| Healthy | `up`, `rho < .7` | Glow in the card's tile colour, its opacity tracking load (.2 + .5·ρ); a **heartbeat dot** on the tile, period 2.6 s idle → 0.8 s at full load; load bar `scaleX(ρ)`. |
| Busy | `.7 ≤ ρ ≤ 1` | Glow and bar cross-fade to amber (300 ms); heartbeat faster. |
| Overloaded | `ρ > 1` or `callsLimit` reached | Red glow pulses 3 times, then holds; refused calls bounce off the card's input side as red dots. |
| Crashed | event `crashed`, `up` 1 → 0 | One 320 ms shake; glow drains to 0 in 800 ms; border turns dashed red; the tile's icon dims and a **crack is drawn** across it (stroke-dashoffset, 400 ms); "DOWN" replaces the load. Arrows into it: dots reach it and stop red; arrows out: grey dashed, no dots, pill says "no reply". |
| Recovering | `recovered`, `cold` → `warm` | A ring sweeps once round the tile; a cold cache's hit ring refills from 0 over the warm-up minutes. |
| Scaling | `scaledOut`, `scaledIn`, `instances` | One slot per instance under the name; new slots slide in from the right (450 ms, staggered 60 ms); removed ones tip over and fade. |
| Not used | no traffic in the test | Card at 55 % opacity, no glow, no heartbeat. |
| Zone down | `zoneDown` | The zone's band darkens and its cards go down together, staggered 60 ms in reading order. |

### 1.3 What each type adds (healthy / crashed or failing)

| Type | Healthy | Crashed or failing | Data |
|---|---|---|---|
| Clients | dots leave at the test's rate | failed calls come back as red dots; `abuse` → one client bursts dense dots | `rate`, `ok`, `abuse` |
| CDN | hits turn back in a short arc; only misses go on | over its limit, calls bounce off in red | hit share, `callsLimit` |
| API Gateway | a gate line in the tile, open | throttled calls stack against the closed gate | refused share |
| Load Balancer | dots fan out to targets in turn | a down target's arrow greys; dots skip it | targets' `up` |
| Server | instance slots fill with load | slots fall one by one; dashed red card, crack | `instances`, `rho`, `crashed` |
| Database | primary + standby discs; primary pulses with load | primary drops, standby slides into its place (`failover`); `writesLost` → red dots fall out | `up`, `failover`, `writesLost` |
| Cache | hit-rate ring round the tile | `cold`: ring drains to 0 and refills; `hotPart`: one ring segment glows red | hit rate, `cold`, `warm` |
| Queue | message blocks slide through | backlog blocks pile up, red past the limit; `poison` blocks stick and move to the dead-letter end | `backlog`, `drained`, `poison` |
| Event stream | lanes with ticks at the event rate | `hotPart`: one lane thick and red, consumers lag | `rate`, `hotPart` |
| Pub/sub | one dot splits into one per subscriber | a down subscriber's copy stops short | subscribers' `up` |
| Real-time gateway | held connections orbit the tile | crash: dots fly off; on `recovered` they rush back (reconnect storm) | `held` |
| Scheduler | clock hand sweeps; a ring pulses at each run | hand stops red; missed runs count up | `up` |
| Stream processor | a conveyor of events | conveyor halts; lag counter grows | `rho`, `up` |
| Coordination | five members, leader ringed, heartbeat | leader lost: members blink in turn (election), new leader takes the ring | `up`, `failover` |
| External service | dashed border; calls out, answers back | answers stall half way and fade (timeout); retries relaunch | `p99`, `ok` |

### 1.4 Arrows and pills

| State | Animation |
|---|---|
| Healthy | Dots in the protocol's colour; speed from the op's p99 (0.5–2.6 s a trip), density from its rate (1–5 dots). |
| Errors | The failing share (1 − ok) of dots turns red and stops at the refusing card; the pill's dot pulses red 3 times. |
| Timeouts | Dots slow and stall half way, then fade. |
| Async (queue, stream, pub/sub) | Marching dashes (stroke-dashoffset) instead of dots. |
| Dead (far end down) | Grey dashed line, grey arrowhead, no dots; pill adds "no reply". |

The pill can show the live rate during a replay ("REST · 1.2k/s") if per-arrow rates are added to the timeline (today the
timeline has per-op rates only; per-arrow needs `simulate.js` to record calls per edge per tick: small, but judge code).

### 1.5 Around the canvas

- **Scrubber ticks**: one dot per event on the replay scrubber (red crash, green recovery, teal scaling); a click jumps there.
- **Event feed**: the last three events slide in under the scrubber (`eventWords`, already in `solve/v2.jsx`).
- **Numbers** on cards and in the op line roll to their new value (tabular figures, 200 ms).
- **Verdict**: Accepted keeps today's two-loop dot sweep (#326); a failed test shakes the blamed card once and dims the rest.

### 1.6 Editing (no replay)

Quiet on purpose: add (scale .96 → 1, 220 ms), connect (the arrow draws itself in 300 ms and the pill pops in), delete
(fade 160 ms), a refused connection shakes the handle and says why ("Clients can't receive calls"), protocol change
(colour cross-fade 200 ms).

### 1.7 How to build it (when the owner says go)

1. `lab/nodes.jsx` `CompNode`: in replay, render the heartbeat, crack, slots (server), discs (database), ring (cache),
   blocks (queue) from `replay.nodes[id]`; keep class names `ln`, `ln-trace`, `warn/over/down` (e2e scripts use them).
   Add `held` and `callsLimit` to `replayAt()` (they are in the timeline already).
2. `lab/lab.css`: the keyframes from the prototype; `.ln-bar i` → `scaleX`.
3. Dots: one rAF loop in `Canvas.jsx` replacing the SMIL `animateMotion` circles of the replay (keep the Accepted sweep),
   paused by IntersectionObserver and `document.hidden`; under reduced motion none.
4. Edge states from `replay`: `dead` when either end is down (the class exists), error share from the op's `ok`.
5. Scrubber ticks and event feed in `ReplayBar` (`solve/v2.jsx`).
6. Tests: a unit test that every event kind maps to an animation class; a Playwright script that replays a test with a
   crash and checks DOWN, the dashed border, grey arrows and that no dot exists under reduced motion.

Size: about 2–3 PRs. No new dependency.

---

## Part 2. System Design Canvas: what it has and whether we should

It is a free-form diagramming tool (Next.js, React Flow, Zustand, Tailwind, dagre, html-to-image, lz-string; all
client-side). It has **no evaluator**: its "Design checks" (`validation.ts`) are four rules run on every change:
no connections (warning), ≥ 4 connections on a non-hub (possible bottleneck), a database/cache/queue/LB/CDN without a
tech stack, a database with only outgoing arrows. Our judge, v2 evaluator, replay and AI interviewer go far beyond it.
What it does better is the **editing experience**.

| Feature in SDC | We have? | Take it? | Notes |
|---|---|---|---|
| Component cards, protocol on arrows | Yes since #358 | — | Done |
| **Live design checks** (badge on the card, a list panel) | No (we judge only on Run/Submit) | **Yes, high value** | Ours can be much better: run the v2 compile step (`eval/compile.js`, it already finds plan errors) on every change, debounced, and show "Clients reach no server", "Database has no path from the API", "single point of failure", "a queue nobody reads" before Run. No judge numbers, so hidden tests stay hidden. |
| **Undo / redo** (⌘Z / ⇧⌘Z) | **No** (only Undo of Copy the solution) | **Yes, must** | A history stack of `fromFlow` snapshots in `Canvas.jsx`; cheap and expected by every learner |
| Copy / paste, duplicate (⌘D), multi-select align | Partly (React Flow multi-select) | Yes | Small |
| **Presentation mode** (walks the graph BFS, dims the rest, a story card per node) | No (we have ▶ Watch a request) | **Yes for the Solution tab** | "Walk me through the solution": a story card per component from the reference's own words (`practice.reference` notes); good interview practice ("explain your design") and pairs with the AI interviewer |
| Auto-layout (dagre) | No | Yes, without dagre | A layered layout (sources left, sinks right, by longest path) is ~80 lines in `lab/drawing.js`; no dependency (Rule: minimal dependencies) |
| Export PNG / SVG / Mermaid / JSON | JSON import/export existed in the old Lab; PNG share card after Accepted (#329) | Yes: SVG + Mermaid | `SolutionDesign.jsx` already draws the design as SVG; Mermaid is a few lines (`flowchart LR`, protocol as edge label) |
| Share link (design compressed into the URL) | No | Maybe | Signed-in sync covers own devices; a read-only link to show a friend or mentor is nice; URL length limits big designs |
| ⌘K command menu, `?` shortcuts sheet | No | Later | Nice for power users; not before undo and checks |
| Minimap | No | Yes, trivial | React Flow `<MiniMap>`; already in the bundle |
| Groups (boxes) and sticky notes | No | Groups: yes, as zones | Our designs have zones (`config` zones, `zoneDown` faults): draw them as group boxes the learner can drag cards into; notes: later |
| Node status (operational / degraded / down) set by hand | No | No | Ours comes from the simulator, which is better |
| Tech stack field with suggestions | Engines and sizes in settings | No | Covered by our engines |
| Edge details: latency, format, throughput, reverse direction (⇧R) | Protocol + label (#358) | Reverse: yes | "Reverse direction" is one click instead of delete and redraw |
| Animated edges setting | Replay dots | Covered by Part 1 | |
| docker-compose import, templates | Problem starts and challenges | No | Not our product |
| Library as a bottom sheet on phones | Phone shows a laptop note | Later | Spec 21's text design is our phone path |
| Onboarding overlay | Tour per section (#310) | — | |

### Recommended order

1. **Undo / redo** and **reverse an arrow** (one small PR).
2. **Live design checks** from the v2 compile step (one PR; frontend only).
3. **Replay animations** (Part 1; 2–3 PRs).
4. **Walk through the solution** (presentation mode on the Solution tab) and **SVG / Mermaid export** (one PR each).
5. Minimap, auto-layout (no dependency), zones as groups, copy/paste.

**Pending: the owner's choice of what to build and in which order.**
