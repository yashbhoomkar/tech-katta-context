# 36 — The problem workspace and the canvas: faults, shortcomings, and what the reference still does better (2026-11-14)

The owner asked for two things: observe the new problem-solving space and its canvas, find the faults and suggest
improvements; and say what is good about the open-source canvas used as the reference that our site still lacks.
Nothing in the application was changed.

## 0. What was observed, and how

- **Build observed:** `main` at `3bd3c41` (#363), which includes the canvas work of #358–#362. Production's frontend
  is still at #358, so the new workspace cannot be seen on `tech.katta.cc` yet. The cause is now known: the
  unmerged handover on branch `ccr-328fc450-xdjrk1` records that Vercel refused the deploys of #359–#361 with
  "Resource is limited - try again in 24 hours" (the daily deploy limit). Files 34 and 35 said the cause was not
  found; this replaces that.
- **How:** the API and a production build of the frontend were run locally (sign-in off) and driven in headless
  Chromium at 1280×720, 1440×900, 1600×1000 and 1920×1080, and on an emulated Pixel 7. The URL shortener problem
  was taken end to end: open, add parts, draw an arrow, schema editor, checks, the four left tabs, copy the
  solution, Run, expand a result, Replay, Submit, Ask the interviewer, Export, keyboard shortcuts.
- **The reference:** `ozers/system-design-canvas` (MIT), cloned read-only at commit `6446aea` (11 Nov 2026) and
  read: README, changelog, data model, node and edge registries, design checks, shortcuts, canvas components.
  An earlier comparison exists as spec 33 on the same unmerged branch; section 3 says what that spec already
  covered and what is new here.
- **Renumbering:** spec 33 already exists on that branch and is cited by the app's pull requests, so this
  session's two earlier files were renumbered: the article audit is now 34 and the full technical review 35.

Not observed: Safari, Firefox, a real phone, a signed-in session, the AI interviewer (it needs sign-in; locally
it answered "Couldn't reach the interviewer"), and the text-based Practice space (`/dashboard/practice/`), which
is not linked from the site. Practice's content is reviewed in file 35.

## 1. Faults

Ordered by how much they hurt a learner. Each was reproduced in the browser.

### 1.1 The design opens at the smallest zoom

| Screen | Zoom when the problem opens | Zoom after pressing Fit View |
|---|---|---|
| 1280×720 | 0.25 | 0.42 |
| 1440×900 | 0.25 | 0.46 |
| 1920×1080 | 0.67 | 0.98 |

At 1440×900 the three starting cards are drawn 50 px wide and cannot be read. The canvas fits the design 30 ms
after loading (`lab/Canvas.jsx`, `setTimeout(() => rf.fitView(…), 30)`), before the split layout has its final
width, so it fits to a narrower box than the one the learner sees. The same happens after "Copy to my canvas"
(zoom 0.32 with five cards). This is the first thing every learner sees.

Fix: fit when the canvas element's size settles (a `ResizeObserver` on the canvas, fitting once per load), not
on a timer.

### 1.2 The canvas gets a third of the window

At 1440×900 the workspace is 910 px wide, and the canvas is 430 px of it: the palette takes 208 and the settings
panel 272, all the time, whether or not anything is selected. At 1280×720 the canvas is 386×515. A reference
design of 8 to 15 cards at 200 px each cannot be read in that space with the problem open.

"Hide the problem" doubles the canvas (to 896 px at 1440) but does not refit: the design stays small in the
left corner until Fit View is pressed. The divider between problem and canvas can be dragged, which helps, but
nothing tells the learner.

### 1.3 Results and Replay shrink the canvas further, and the animations cannot be seen

Run opens the results panel over the bottom of the workspace. At 1600×1000 the canvas is left about 590×430, and
the design is not refitted, so its lower cards sit against or under the panel's edge.

Replay is where #360's animations live (heartbeats, instance slots, standby taking over, a cache ring
refilling). During a replay of the evening peak the cards were about 50 px wide, in a strip above a panel that
holds the scrubber, the credit meter and three lines of numbers. The feature built to be watched is the
smallest thing on the screen. The palette and settings panel stay open during a replay although nothing can be
edited.

Fix: during Replay, hide the palette and settings (the `lab-watch` layout already does this for Watch), dock the
scrubber as one thin bar, and refit.

### 1.4 The click-counting call is never sent

The URL shortener's brief says the tests send "one click count for every open". In the results and the replay
the call shows "Count the click 0 calls/s · 100% succeed · p99 100 ms", and its share in the requirements table
is "0%". The operation's share is 0 in the content, so no load test exercises it; a design with no way to count
clicks passes every load test. The table should not show "0%" for a call the brief describes as constant. All 22 problems were checked for this: the URL shortener is the only one with a client call whose share is 0.

### 1.5 "Accepted" beside numbers that miss the stated targets

Submit on the reference design reports "Accepted · 10 / 10 tests passed · worst availability 96.7% · p99 1,780
ms". The problem's targets, shown on the same screen, are 99.9% and a p99 of 200 ms. The fault tests allow a dip
while a zone or the database is down, which is reasonable, but nothing says so. A learner reads a verdict that
contradicts the requirement. Show each test's own pass line next to its result ("allowed during the outage:
down to 95%").

### 1.6 The solution is one click away, before any attempt

Each hint costs 3 points and says so. The Solution tab is open from the first second, with the full design and
"Copy to my canvas", which also fills in the written answer. A copied design is correctly not counted as
solved, but a learner can read the whole answer before trying, at no cost and with no prompt. LeetCode-style
sites hold the editorial behind a deliberate click ("Show the solution? You haven't submitted yet").

### 1.7 Smaller faults

| Where | Fault |
|---|---|
| Palette help text | "Connect two components by dragging from the dot on the right of one to the dot on the left of the other." Since #358 every card has a handle on each side and arrows can start anywhere. |
| Palette | 15 parts in a fixed list taller than the panel at 1440×900 (Messaging is below the fold); no search, no collapsing groups. |
| Settings panel | The part's description and its "In real life" analogy come first, every time; the settings start below them and need scrolling. The analogy is useful once. |
| Adding a part by click | The new card lands far from the design (a database was placed 250 px to the right of the last card, a cache above it), not next to the selected card or connected to it. |
| Fit View button | Zooms to 1.48 on a wide screen, while the automatic fit is capped at 1.0; two fits, two results. |
| Solution tab | The reference design is drawn in a box that shows two of its five cards with "Scroll the diagram sideways". It should be scaled to fit; "Full size" exists for detail. |
| Reference design against the article | The URL shortener's solution is one "Link service" with a cache and a database. The article's design has separate create and redirect services, a click stream and a CDN in front. The canvas solution and the worked answer should be the same design, or say why they differ. |
| Card text | At the fitted zoom the settings line on a card ("2 × m5.large") renders at about 7 px. |
| Phone | The Canvas tab opens at zoom 0.25 as well, and the note says designing "is easier on a bigger screen". Acceptable as a stance; the zoom is the same bug as 1.1. |
| Keyboard | Only Escape, Delete, undo/redo and Shift+R exist. Copy, paste, duplicate and select-all do nothing (tested: Ctrl+C, Ctrl+V, Ctrl+D left the design unchanged). No right-click menu. |
| "A sensible bill" test | Shows "$16,277/mo" and a tick, but not the budget it was checked against. |
| Ask the interviewer, signed out | "Couldn't reach the interviewer. Try again." If the cause is that sign-in is needed, it should say that. (Seen locally with sign-in off; production's wording was not checked.) |

### 1.8 What works well

Stated so the list above is read in proportion.

- Checks while building are good: "Server reaches no database: draw an arrow from it to the store that keeps
  links" is specific, names the part, and updates within half a second.
- Protocol pills on arrows, inferred correctly (HTTPS, REST, DB query, Key lookup).
- Undo restored a deleted card together with its arrows in one step.
- Run took 2.6 seconds for four tests; Submit ran ten tests in about six.
- The score breakdown (requirements, estimates, API, decisions, design) and "copied unchanged, so it isn't
  counted" are clear and fair.
- The written-answer form mirrors the interview steps, and the key decisions are real ones.
- The schema editor is modal, focused, and explains what the tests will look for.
- No page errors in any flow.

## 2. Suggested improvements

In the order they should be done. The first three fix what a learner hits in the first minute.

1. **Fit correctly, always.** Fit on the canvas's real size at load, after "Copy to my canvas", when the problem
   pane is hidden or shown, when the divider is released, and when the results panel opens or closes. One
   function, one zoom cap.
2. **Give the canvas the window.** Float the palette and the settings over the canvas instead of beside it, as
   the reference does: a narrow palette that collapses to icons, and a settings drawer that appears only when a
   part or arrow is selected. At 1440 px that takes the canvas from 430 to about 900 px with the problem open.
3. **A replay mode.** Palette and settings hidden, the scrubber as a thin bar under the canvas, the credit meter
   in the top line, numbers on the cards. Offer "Replay full screen".
4. **Place new parts sensibly.** Next to the selected card, or to the right of the last one, and offer the
   arrow.
5. **Settings first, description behind "About this part".**
6. **Gate the solution** behind one confirmation until the learner has submitted once.
7. **Make the verdict explain itself:** each test's allowance beside its result, and the budget beside the bill.
8. **Fix the click-count call** in the URL shortener's tests (the only problem with this fault).
9. **Bring the canvas solution and the article's design into line** for each problem.
10. **Correct the palette help text; add search to the palette.**

## 3. The reference: what it does well that we still lack

`ozers/system-design-canvas` is a free-form diagram tool. It has no simulator, no tests and no judge; everything
it knows about a design is four static checks. Our evaluator, replay and scoring have no counterpart there. What
it does better is the feel of drawing.

Spec 33 already compared the two and led to #359–#361: live checks, undo and redo, reversing an arrow, the
minimap, the solution walk-through, and Mermaid and SVG export. Those are built. Spec 33 listed auto-layout,
zones as groups, copy and paste, the command menu and share links as not built; they are still not built, and
are repeated in the table for completeness. The rows marked **new** were not in spec 33.

| The reference has | We have | Worth taking? |
|---|---|---|
| **A full-window canvas with floating panels.** The library and the editors float over the canvas; editors appear only on selection. **New.** | Fixed side panels; the canvas is the remainder | **Yes, first.** This is the root of faults 1.2 and 1.3. |
| **Auto-layout** in one click (dagre): handles face each other, fewer crossings | None; our arrow layout pass routes around cards but never moves them | **Yes.** Also solves fault 4 in section 2: after adding parts, "Tidy up". A layered layout needs no new dependency. |
| **A menu at the point where an arrow is dropped.** Dropping on empty canvas offers the part to add; dropping on a card offers the connection type there and then. **New.** | Arrows only connect existing cards; the protocol is changed afterwards in the panel | **Yes.** It is the fastest way to build: drag out of the server, pick "Database", done. |
| **Right-click menus** on the canvas, cards and arrows. **New.** | None | Yes, small. |
| **Multi-select actions:** group, align, duplicate, delete, as a floating bar. **New** (spec 33 mentioned align only). | Multi-select exists; no actions | Yes: align and duplicate. |
| **Copy, paste, duplicate** (⌘C, ⌘V, ⌘D), select all | None | Yes. A learner adding three services wants to duplicate one. |
| **A shortcuts sheet (`?`) and a command menu (⌘K)**; `F` fits, `/` toggles the library, `P` presents | No sheet; four shortcuts | The sheet and `F`: yes. ⌘K: later. |
| **A searchable, collapsible library**; it becomes a bottom sheet on narrow screens, and editors become drawers. **New** in its detail. | A fixed list; on phones the canvas is view-only | Search: yes. The phone layout: only if designing on phones becomes a goal. |
| **Groups** (boxes that hold cards) | None | **Yes, as availability zones and regions.** Our parts already have a "zones" setting and our tests take a zone down; drawing the zone as a box makes the fault visible before it happens. |
| **Sticky notes** | None | Yes. "Why I chose this" beside a part is what an interviewer asks for, and the AI interviewer could read them. |
| **A story per component** for presentation mode: the author's own words. **New.** | Walk-through exists for the reference solution only | **Yes, for the learner's own design.** "Present my design" with their notes per part is interview practice that nothing else on the site gives. |
| **Arrow details:** latency, data format, throughput. **New** in part. | Protocol and a label | Throughput: show the simulator's rate on the pill during a replay (spec 33 noted the simulator must record calls per arrow). The others: no; the simulator owns latency. |
| **More kinds of card:** DNS, WAF, worker, serverless function, container cluster, object storage, search index, logging, monitoring. **New.** | 15 kinds; object storage and search are engines inside "Database"; no worker, DNS, WAF, serverless, monitoring | **Object storage and search as their own cards: yes.** Learners look for "S3" and "Elasticsearch" in the palette and do not think of them as databases. A worker card (a server that reads a queue) would make queue designs read correctly. The rest only when a problem needs them. |
| **Templates:** nine starting architectures | Each problem's start, and eight challenges | A free canvas with templates would be a new product area ("sandbox"). Useful for the landing page; not urgent. |
| **Share links** with the design in the URL fragment, and a preview page before saving | Signed-in sync only | Yes, later: "send my design to a friend" is how the site spreads. The fragment never reaches the server, which fits our privacy stance. |
| **PNG export** at 1× to 3× with a transparent background, **JSON** export and import | SVG and Mermaid; a share card after Accepted | PNG: yes, people paste designs into notes and chats. JSON: yes, cheap, and it is a backup. |
| **Storage safety:** an unreadable saved design is set aside and offered as a download, never overwritten. **New.** | Not checked in this review | Worth checking: designs live in `localStorage` until sign-in. |
| **An empty-canvas state and a first-run overlay.** **New.** | A tour button | The empty state: yes ("Start from the Clients card, or press Copy to see one way"). |
| **Settings:** snap to grid, minimap, animated edges, clear data. **New.** | Snap is always on; minimap from six parts | A "reduce motion on the canvas" switch belongs here once replay is prominent. |
| Tech stack per node, status set by hand, docker-compose import | Engines and sizes; status from the simulator | No. Ours is better or it is not our product. |

### Recommended order for the reference's ideas

1. Floating panels and a full-window canvas (with section 2, items 1 to 3).
2. The drop-point menu and auto-layout ("Tidy up").
3. Copy, paste, duplicate, align; the shortcuts sheet; `F` to fit.
4. Zones as groups; notes; "Present my design".
5. Object storage and search as cards; a worker card.
6. PNG and JSON export; share links.

## 4. What was not checked

- The other 21 problems and the eight challenges were not walked through in the browser; the faults in 1.1 to
  1.3 are layout faults and apply to all of them, 1.4 was checked in the content of all 22 and is in the URL shortener only; the solution
  mismatch was looked at for the URL shortener only.
- The reference was read as source, not run.
- No measurement of performance with large designs (30 or more cards).

---

## 5. The best problem-solving experience: what to give candidates

Added the same day, on the owner's request: "I need the best problem solving experience for the candidates. Find
out the features that we should give. Find out the functionalities that we should provide."

### 5.1 What "best" means here

A candidate comes to practise for a 45-minute interview in which they must talk, draw, decide and defend. The
site already does something no other does: it runs the design under real traffic and failures and judges it.
The best experience is the one where every minute a candidate spends moves them closer to that interview. That
gives five tests for any feature:

1. **It keeps them drawing and thinking,** not fighting the tool.
2. **It tells them why,** not only pass or fail.
3. **It makes them explain,** because the interview is spoken.
4. **It shows progress,** so they know what to practise next.
5. **It can be done in the time they have,** including on a phone on the way to work.

The lists below are sorted by those five. "Have" means it is on `main` today. "Designed" means a spec already
describes it (mostly `22-EVALUATOR-V3.md`) but it is not built. "New" means it is proposed here.

### 5.2 Must have: without these the rest does not land

| # | Feature | What the candidate gets | State |
|---|---|---|---|
| 1 | A canvas that fills the screen and is readable on open | The design is the largest thing on the page at every step: building, results, replay | Faults 1.1 to 1.3; fixes in section 2 |
| 2 | Fast building: drop an arrow to add a part, duplicate, copy and paste, tidy up | A ten-part design in two minutes, as on a whiteboard | New (section 3) |
| 3 | A verdict that explains itself | For every failed test: which part gave out, at which minute, by how much, and a button that jumps the replay to that minute | Partly have (findings, replay marks); the link from a failure to its moment is new |
| 4 | "What would fix it" without giving the answer | After a failure, one checked repair in words ("the database is the first to run out; a cache in front, or a larger size, would pass this test"), never the whole design | Designed (spec 22 §9, checked repairs) |
| ~~5~~ | ~~The solution behind a deliberate step~~ (owner: no, 5.11) | An attempt, or one confirmation, before the full design is shown | New (fault 1.6) |
| 6 | Work that is never lost | Every edit saved at once, restored on return, on any device after sign-in, with an unreadable save set aside, not overwritten | Have (autosave, sync); the safety net is new |
| 7 | An interviewer that is reachable, or says why not | A clear message when sign-in or a limit is the cause | Have with the mock model; the message is new |

### 5.3 What makes it better than a whiteboard

These are the functions only a simulator can offer. They are the product's reason to exist.

| # | Feature | What the candidate gets | State |
|---|---|---|---|
| 8 | **Break it yourself** | During a replay, click a part and kill it, or drag the traffic up, and watch what happens next. The interviewer's "what if this dies?" becomes something they have already seen | New. Today faults are scripted per test |
| 9 | **Headroom and waste** | "This design takes 1.8× the peak before the cache gives out" and "it would still pass with 12 servers instead of 32, saving $7,000 a month" | Designed (spec 22 §7, probes 1 and 5) |
| 10 | **Follow one request** | Pick a call and watch it hop through the design, with the time spent at each part and where the p99 comes from | Have (Watch); per-hop time is partly there |
| 11 | **Numbers on the arrows** | Calls a second on every arrow during a replay, so the candidate sees that the cache takes 34,000 and the database 600 | Designed (spec 33 §1.4; the simulator must record per-arrow rates) |
| 12 | **Compare two attempts** | This submission beside the last: what changed on the canvas, and what changed in each test's result and the bill | Designed in part (spec 22 §9.3) |
| 13 | **Cost as a first-class result** | A bill by part, the cheapest passing design they have found, and how theirs compares | Have the bill and the credit meter; the breakdown and comparison are new |
| 14 | **Zones you can see** | Parts drawn inside their availability zone, so "a zone goes dark" is visible before the test | New (section 3, groups) |

### 5.4 What makes them interview-ready

Passing tests is half the interview. The other half is saying it.

| # | Feature | What the candidate gets | State |
|---|---|---|---|
| 15 | **Mock interview mode** | 45 minutes on the clock, the six steps in order with a suggested time for each, hints and the solution locked, and one summary at the end | Have the timer; the mode is designed (spec 22) |
| 16 | **Defend your design** | Three questions about their own design after a pass: predict ("what happens to p99 if the cache restarts?"), why ("why two replicas?"), change ("the traffic doubles: what do you change first?"), marked against the simulator's own answer | Designed (spec 22 §11) |
| 17 | **Present my design** | Walk through their own design part by part with their own note on each, the way they would at a whiteboard | New (section 3, story per component) |
| 18 | **Notes on the canvas** | A sticky note for a decision or an assumption; the interviewer reads them | New |
| 19 | **Trade-off cards** | For each key decision, the option they chose beside the one they did not, with what each costs in this problem's own numbers | Designed (spec 22 §8) |
| 20 | **Follow-up questions** | The worked answer's "Follow-ups an interviewer may ask" turned into prompts after a pass, one at a time | New; the content already exists in every article |
| 21 | **Speak it** | Record a two-minute spoken summary and play it back beside the design. No marking needed at first: hearing oneself is the value | New |

### 5.5 Guidance while solving

| # | Feature | What the candidate gets | State |
|---|---|---|---|
| 22 | Checks while building | What stops the design from running, as they draw | Have (#359) |
| 23 | Hints in steps, each tied to a concept | A nudge, then the idea, then nearly the answer, with a link to the exact section of the article that teaches it | Have the steps; the links are new |
| 24 | A step-by-step mode for beginners | The six steps as a guided path: requirements first, the canvas unlocked after the numbers and the API are written | New. Today every tab is open at once, which suits practised candidates |
| 25 | Estimate helper | A small calculator beside the estimates: per day to per second, bytes to terabytes, with the crore and lakh units the site uses | New |
| 26 | Wrong-design gallery | After a pass: three common wrong designs for this problem, each with the test it fails and why | New for the canvas problems; the content exists (`wrong` in every problem) and is hidden today |
| 27 | "Why did this part crash?" | Click a crashed card in the replay for its load, its limit and what fed it | Partly have (card numbers in replay) |

### 5.6 Progress and motivation

| # | Feature | What the candidate gets | State |
|---|---|---|---|
| 28 | A skill record | Strengths and gaps by pattern (caching, contention, queues, real-time), built from which tests they pass and fail across problems, with the next problem chosen for their weakest pattern | Designed (spec 22) |
| 29 | Submission history that teaches | Every attempt with its score and design, restorable, and a line for what improved | Have the list and restore; the diff is item 12 |
| 30 | Acceptance rate, best score, percentile | "Better than 62% of accepted designs on cost" | Have acceptance and best score for signed-in users; percentile is new |
| 31 | Streak and a daily problem | A reason to return tomorrow | Have the streak in Practice only |
| 32 | Study plans | "Two weeks to an interview": an ordered list across articles, problems and challenges, with a tick for each | New; the Questions guide and How to prepare already hold the order |
| 33 | Company and topic tags | Filter problems by pattern and by where they are asked | Have difficulty; Practice has topics and an empty companies field |
| 34 | Bookmarks and personal notes per problem | Come back to the ones that hurt | New |

### 5.7 Sharing and community

| # | Feature | What the candidate gets | State |
|---|---|---|---|
| 35 | A share link to a design | Send it to a friend or mentor, who opens it read-only and can copy it | New (section 3) |
| ~~36~~ | ~~Accepted designs by others~~ (owner: no, 5.11) | After their own pass: other accepted designs, sorted by cost or headroom, to learn there is more than one answer | New. Needs moderation and a decision on names (an open owner decision in spec 21) |
| 37 | Image and diagram export | PNG for notes and chats; Mermaid and SVG already exist | Partly have |
| 38 | A result card worth posting | Score, stars, cost and the design in one image | Have after Accepted (#329) |

### 5.8 Comfort and access

| # | Feature | What the candidate gets | State |
|---|---|---|---|
| 39 | A shortcuts sheet, and the usual keys | `?` lists them; fit, duplicate, copy, paste, select all | New (section 3) |
| ~~40~~ | ~~Designing on a phone~~ (owner: no, 5.11) | The text design with a drawn diagram (spec 21) as the phone path for every problem, since the canvas is view-only there | Have for the ten Practice problems, unlinked |
| 41 | Reduced motion and keyboard access | Replay states in words, every control reachable by keyboard | Have reduced motion; canvas keyboard access not checked |
| 42 | Speed that holds | Run in under three seconds, Submit under ten, and no frozen tab on a large design | Have at this size; a 200-part design can pause the tab (noted in `18-TODO.md`) |
| 43 | Languages | The interface and hints in Hindi and Marathi alongside English | New; the audience is Indian candidates |

### 5.9 The order to build them

Each stage is usable on its own. Later stages assume the earlier ones.

| Stage | What | Why first |
|---|---|---|
| 1. Remove the friction | Items 1, 2, 7 and the smaller faults in 1.7 | Nothing else is seen properly until the canvas is |
| 2. Explain every result | Items 3, 4, 9, 11, 13, 27 | Turns "failed" into a lesson; most of it is already designed in spec 22 |
| 3. Let them play | Items 8, 12, 14 | The part no competitor has |
| 4. Make them talk | Items 15, 16, 17, 18, 19, 20 | Closes the gap between passing tests and passing interviews |
| 5. Bring them back | Items 28, 30, 31, 32, 33, 34 | Retention, once the session itself is good |
| 6. Let them share | Items 35, 37 | Growth, and learning from others |
| 7. Reach more people | Items 43, 21 | Languages and speaking |

### 5.10 The three that matter most

If only three things are built from this list:

1. **The canvas fills the screen and fits itself** (item 1). It is a fix, not a feature, and it decides whether
   everything else is noticed.
2. **Break it yourself** (item 8). It is the one thing a candidate cannot do with a whiteboard, a book or a
   video, and it answers the question every interviewer asks.
3. **Defend your design** (item 16). It is the bridge from a passing design to a passing interview, and the
   simulator can mark it honestly because it knows the true answer.

### 5.11 Decisions taken by the owner (2026-11-14)

| Question | Answer | What follows |
|---|---|---|
| Gate the solution before a first attempt? | **No** | Item 5 is dropped, and it leaves stage 1 of the build order. The Solution tab stays open from the start. Fault 1.6 is closed as "by design". |
| Show other candidates' accepted designs? | **No** | Item 36 is dropped. Sharing is a candidate's own link (item 35) and exports only. |
| Make the text-based Practice the phone path for all problems? | **No** | Item 40 is dropped. The canvas stays the one way to solve; on phones it remains view-only. |
| A free sandbox canvas? | Asked for more detail | Section 5.12 |

### 5.12 The sandbox canvas, in detail

**What it is.** A blank canvas with no problem attached: the same parts, arrows, settings and simulator, but the
candidate chooses the traffic and the failures instead of a test suite choosing them. Today the canvas only
opens inside a problem or a challenge, so a candidate cannot design something that is not one of the 22
questions.

**Why a candidate would want it.**

- Their interview question is not on the site. They can still build "design a stock exchange" and see whether
  it holds.
- A mock interview with a friend: one asks any question, the other draws here.
- Trying an idea from an article ("what does a cache replica actually buy me?") without the rules of a problem.
- Keeping their own designs as a portfolio or revision notes.

**What it would contain.**

| Part | What it does | Already exists? |
|---|---|---|
| Blank canvas, or start from a template | Six to nine common shapes: client and server, read-heavy with a cache, queue and workers, event stream, real-time gateway, multi-zone | Canvas exists; templates are new. The 22 reference designs and 8 challenge references could seed them |
| A traffic panel | Requests a second, the pattern over the day (steady, lunch and dinner, flash sale, match night), the share of reads and writes | The patterns exist in the catalogue; the old Lab tab had this panel before it was removed on 2026-11-10 |
| A failure panel | Add events on a timeline: a part crashes, a zone goes dark, the cache empties, a spike | The simulator supports all of these; they are scripted per test today |
| Run and Replay | The same replay, bill and credit meter | Exists |
| A report instead of a verdict | No pass or fail, since there is no requirement: availability, p99, what crashed and when, the bill, headroom | The numbers exist; the report is the "no AI" design report of spec 22 §10 |
| My designs | A list of saved designs with names, rename, duplicate, delete | The store already holds several designs per user (the old Lab used it) |
| Share and export | Link, PNG, SVG, Mermaid | Partly exists |

**What it cannot do.** The judge needs to know what the system is for: its calls, its data and its targets.
Without a problem there is nothing to judge function against, so the sandbox can say "this stays up and costs
this much" but not "this is a correct design for a chat app". Two ways to narrow that gap later: let the
candidate declare a few calls and targets themselves (a small form: name, reads or writes, share, p99 target),
or let the interviewer read the design and ask about it.

**How it differs from what was removed.** The Lab tab was a free canvas shown as a main tab beside the articles,
and it was removed in favour of problems. The sandbox proposed here is not a tab of its own: it is one more
row on the Problems page ("Open canvas: design anything") and a button on the landing page.

**Cost and risk.**

- Build: small to medium. Most parts exist; the traffic and failure panels and the "my designs" list are the
  work. No new judge code if the report is used instead of a verdict.
- It needs the faults in section 1 fixed first; a sandbox on a 430 px canvas would show the product at its worst.
- It can pull attention from judged problems, which are the site's strength. Keeping it off the main tabs
  limits that.
- Free or paid is an owner decision. As the landing page's "try it" it works best free and signed out, with
  saving behind sign-in.

**Recommendation.** Worth building, after stages 1 to 3 of section 5.9, and as one feature rather than a second
product: the same canvas with the problem switched off. It also makes "Break it yourself" (item 8) nearly free,
because the failure panel is the same control.
