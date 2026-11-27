# 54: Upgrade tech.katta.cc into a "System Design Interview Practice Lab" (brief for task E)

Written 2026-11-27 from three inputs:
- two outside reviews the owner shared (AI-written; long, so summarised below);
- the owner's own opinion: "Check the desiarchitect website and check how can we improve our website";
- the parent session's review of the site's real usage, speed and content (kept private; the conclusions are here).

## 1. What the inputs agree on, and what they got wrong

**Agreed by both reviews and the owner's reference site:**
1. **Position Tech Katta as a practice product, not a content library.** "Product A: read 50 articles" sells worse than
   "Product B: practise 50 problems, get feedback, know if you're ready." Suggested line: *"Your System Design
   Interview Practice Lab."*
2. **Show the product before asking for anything.** desiarchitect.com runs a "Fix the failing system" simulator on
   its home page, with no sign-up. Visitors see the value in one minute.
3. **Make the starting point obvious.** Learning paths by experience (0–2, 2–5, 5+ years), each a short ordered list
   ending in a problem.
4. **Trust:**
   - honest counts (lessons, problems);
   - references on articles;
   - "Updated on" dates;
   - a public changelog.

   Testimonials only when they are real.
5. **Be clear about free and paid.** desiarchitect states one-time passes, "nothing renews", and marks free items
   before you open them.
6. **Progress that brings people back:** problems solved, scores, weakest areas, and "next recommended".
7. **Lead with India:** UPI, IRCTC Tatkal, IPL or Hotstar, food delivery. This is the one differentiation all three
   inputs name.
8. **Validate with real users before charging.** 10 excellent problems beat 100; the key metric is "a second problem
   solved within 7 days".

**What the reviews got wrong** (they saw only the public pages, which were behind sign-in at the time):
- "Build a playground where users drag parts, connect them, submit and get feedback": **this exists.** It has a
  canvas, hidden tests, scores, "what would fix it?", Replay in 2D and 3D, and the AI interviewer (mock for now).
  The problem is not that it's missing, but that **nobody can see it from the home page**. Since #401 sign-in is
  off, so it's reachable; it still isn't shown.
- "Use Next.js, PostgreSQL, Supabase, React Flow…": **ignore.** The stack works, and rewriting it is the opposite of
  what's needed.
- "AI score 72/100 with sub-scores": a plain AI score is the thing both reviews also warn against ("arbitrary"). Our
  judge is deterministic (tests). Keep the score from the tests, and show the reasons; AI only explains.

**Deliberately not in this task:**
- pricing, payments, a paywall, a "Pro" badge (the owner's employment approval must come first; see the private
  notes);
- timed mock interviews and AI evaluation (spec 22, later);
- a mobile app;
- a visual redesign (the design freeze stands: same colours, type and components).

## 2. What to build (task E)

**Prerequisite:** tasks B (free sample and SEO) and C (fast first view, Text mode) edit the landing and article
pages. Start only after **both have merged** (look for their PRs: "free sample", "fast first view"). If they aren't
merged by the time you start, do the parts that don't touch their files first (E3, E4, E5), then E1 and E2.

### E1. Landing page = the practice lab, demonstrated
Keep today's visual style. Change content and order:
1. **Hero:** an outcome line, not a topic line. Example: *"Practise system design interviews on a canvas that runs
   your design."* Sub-line: *"Real Indian-scale problems. Your design meets traffic, failures and a budget, and the
   tests tell you what broke and why. Free while in beta."*
   - Primary CTA: **"Solve your first problem"** (the URL shortener).
   - Secondary: **"See how it works"** (scrolls to the demo).
2. **A live demo, no sign-up: "Fix the failing system".**
   - A small, already-failing design for the IND vs PAK toss spike, with 2–3 one-tap fixes (add a CDN; more servers
     before the toss; a cache).
   - Each fix re-runs the judge and plays a short Replay with the result ("passed / still failing, here's why").
   - Reuse the existing simulator and judge (`site3d/scripts/sim.js`, `pages/sim.js` INCIDENTS, `replay3d`), not a
     new engine.
   - **Must respect task C's performance budget:** nothing heavy before interaction. Show a still frame, start on
     tap.
3. **Honest counts strip,** computed from the API at build time, never hard-coded: articles, canvas problems,
   challenges, warm-ups.
4. **"Not sure where to start?":** three paths (E3), each a card with the first step.
5. **"Look inside":** a real excerpt of a problem brief, a Replay frame and a judge's "what would fix it" note, as
   static images or real snippets.
6. **No personal branding** (owner, 2026-11-27: "I don't want my personal branding"). No author block, name, photo or
   credentials anywhere. Trust comes from the product itself: the live demo, honest counts, sources on articles,
   "Updated" dates and the changelog.
7. **"What's free":** today everything is free during the beta. Say so plainly: *"Everything is free while Tech Katta
   is in beta. Sign in only if you want your progress on every device."* No prices.
8. A final CTA: "Solve your first problem".

### E2. Problem pages show the payoff before the work
Above the workspace (or in the brief on phones), add one line on what the learner gets: "10 tests · Replay ·
Fixes explained". After the first Submit, show a compact **result card**:
- tests passed X/N;
- the top reason for failing, in plain words;
- "Replay the failure";
- "Try the next problem".

Use the judge's existing output; don't invent scores.

### E3. Learning paths (`/start`, linked from the landing and Home)
Three paths, each 6–8 steps of existing articles, ending in a problem. Use existing content only:
- **Beginner (0–2 years):** Networking essentials → API design → Databases (data modelling, indexing) → Caching →
  load balancing → **Problem: URL shortener**.
- **Intermediate (2–5 years):** Sharding → Replication and consistency (CAP) → Queues and Kafka → Rate limiting →
  Redis → **Problem: chat app** (or notifications).
- **Advanced (5+ years):** consistent hashing → distributed transactions and payments → multi-region (Real systems
  case studies) → **Problem: payments**, then **IND vs PAK**.

Each step shows done/not done from existing progress (`store.js`, `tk-progress-v1`). Pick exact slugs from
`content/` that exist; if a topic has no article, skip it rather than invent one.

### E4. Progress dashboard (Home)
On `/home`, above the 3D world, add a compact panel:
- problems solved / total;
- best score per started problem;
- articles read;
- **"Next recommended"** (the next unfinished step of the user's chosen path, else the next easy problem);
- **"Weakest area"**: the component or concept most often in the judge's failure reasons across the user's
  submissions, from data the browser already stores (`tk-subs-v1`).

No new server data (operating rule 4).

### E5. Trust on articles
- Each article shows **"Updated <date>"** (the content has `date`).
- Add a **"Sources"** list where the article cites external facts (DynamoDB paper, company engineering posts for
  Real systems): only real, verifiable links. Coordinate with task A, which owns content accuracy: add the field
  and the rendering, and fill sources only for articles A has already finished, or leave A a note.
- A public **`/changelog`** page built from `content/changelog.json`: dated, user-facing lines. Seed it with the real
  changes since 23 Nov: 3D site, phone workspace, Report button, free while in beta, faster screenshot.

## 3. Acceptance checks (all must pass)
- **Landing on a budget phone** (task C's profile: 360×740, CPU 4×, 1.6 Mbps): LCP ≤ 2.5 s, total blocking ≤ 300 ms.
  The demo loads only on tap.
- **The demo:**
  - each fix runs the real judge, and the result matches what the same design gets in the sandbox;
  - an e2e test taps each fix and checks the verdict;
  - it works signed out.
- **Paths:** every link resolves (200), and done state shows after reading an article. E2e on a phone and on desktop.
- **Home panel:** with seeded `tk-progress-v1`/`tk-subs-v1`, it shows the right counts, next step and weakest area.
  Unit tests for the "weakest area" logic.
- **Counts strip** equals the API's real counts (test).
- **No fake content:** no testimonials or unverified stats. No personal branding (no author block, name or photo).
- **Design freeze:** reuse existing classes and tokens; no new colours or fonts. Screenshots at 320, 402, 768 and
  1366 px, dark and light, are looked at before shipping.
- **The existing e2e suite** stays green; never loosen an assertion.

## 4. For the owner (needed, not blocking)
- The five-friends test: watch five people do "Solve your first problem" on their phones. The new result card and
  paths are built to be tested this way.

## 5. What to enable: from desiarchitect.com and the parent session's review (owner, 2026-11-27)

| # | Feature | Seen at | In which task | Notes |
|---|---|---|---|---|
| 1 | **Try before sign-up:** "Fix the failing system" demo on the home page | desiarchitect (traffic simulator on the landing page) | **E1** | Ours runs the real judge plus Replay, which is stronger than theirs |
| 2 | **"Free" marked before opening,** plus a **free shelf** page listing everything free | desiarchitect ("Free" labels, `/free`) | B (labels), **E** (a `/free` page once B merges) | While sign-in is off everything is free; the page says "Free while in beta" |
| 3 | **"Not sure where to start?"** entry by experience | desiarchitect (4 persona links) | **E3** | 3 paths, each ending in a problem |
| 4 | **"Look inside":** real excerpts on the landing page | desiarchitect (ADR, lab output, drill) | **E1** | A problem brief, a Replay frame, a judge note |
| 5 | **Honest counts strip** | desiarchitect (131 lessons, 75 labs…) | **E1** | Counted from the API, never typed in |
| 6 | **Result card after Submit** plus "next problem" | both reviews | **E2** | |
| 7 | **Progress panel:** solved, best scores, weakest area, next step | both reviews | **E4** | Browser data only |
| 8 | **"Updated" dates, sources, changelog** | both reviews; desiarchitect lists recent additions | **E5** | |
| 9 | **Quick interview drills:** 1-minute questions with model answers ("Redis crashes at peak: what happens?") | desiarchitect (222 Vault drills) | later, **task F** | Built from existing article content; good for revision on phones |
| 10 | **Decision guides:** "Redis vs Kafka", "SQL vs NoSQL for X", "Cache-aside vs write-through" | desiarchitect ("Decision guides"); a review's SEO list | later, **task F** | Strong search pages that link to problems |
| 11 | **Incident drills:** a broken system to fix in 3 minutes, a new one each week | desiarchitect ("Incident Arena"); a review's "weekly challenge" | later, **task F** | We already have the parts: Warm-ups and Break it yourself |
| 12 | **India-scale problems:** UPI, IRCTC Tatkal, IPL or Hotstar, rider dispatch | both reviews; the parent's review | later, **task G** (after A) | The clearest differentiation |
| 13 | **A 4-week plan** (roadmap) | desiarchitect (90-day roadmap) | later, after E3 shows paths are used | |
| 14 | **Clear terms when paid plans come:** one-time pass, nothing auto-renews, free items marked | desiarchitect | only when the owner decides on pricing | Blocked on the owner's employment approval |

**Deliberately not copied:**
- personal branding: no founder photo, name or credentials (owner's choice);
- countdown sales and urgency banners;
- a very long, sales-heavy home page;
- scope sprawl: DSA, AI engineering and LLD courses;
- labs that need Docker on the learner's laptop (ours run in the browser, which is better for phones).
