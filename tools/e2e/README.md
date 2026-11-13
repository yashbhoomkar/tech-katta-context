# Browser checks (Playwright)

Headless-Chromium checks used to verify tech.katta.cc before and after every merge. They are plain
Node scripts (no test runner). Playwright is preinstalled in Claude Code cloud sessions
(`require('playwright')` works from any directory; do not run `playwright install`).

```bash
mkdir -p /tmp/shots                       # some scripts save screenshots here
cd /tmp                                   # run from a neutral directory
node /path/to/tools/e2e/site-sweep.js https://tech.katta.cc        # production
node /path/to/tools/e2e/site-sweep.js http://localhost:5199        # a local `vite preview`
```

Every script takes the site's base URL as its only argument (default `https://tech.katta.cc`) and
prints a few result lines ending with `errors: [...]` (page errors and console errors; must be empty).

> **Since tech-katta #285 (2026-11-10) there is no Lab tab.** Scripts that open `#lab`, use the canvas's Designs menu,
> Import or the Challenges menu, or score the landing page's IND vs PAK with stars were written for the old site and are
> not up to date (see `18-TODO.md`). Old `#lab/<id>` links still open the challenge (now at
> `/dashboard/problems/challenge/<id>/`). `no-lab.js` checks the new flows.

| Script | What it checks |
|---|---|
| `swipes-figures.js` | **Figure steps and swipes** (spec 24, #323): ‹ ❚❚ › and step dots on Caps figures, pause holds after scrolling away, ← →, phone step-line swipe (left/right/short/vertical), 44 px buttons, full-screen swipe down, drawer drag-to-close (short drag returns, edge start ignored, vertical drag keeps it), reduced motion. 25 checks; uses CDP touch events. **Articles need sign-in on production: run it against a local API and preview** |
| `swipes-practice.js` | **Practice panes swipe on a phone** (spec 24, #323): Problem ⇄ Design ⇄ Result by swipe, past the last pane stays, scroll kept per pane, vertical swipes scroll, a stepper drag never swipes, ← → on the tabs, the tab line; motion on and reduced; desktop keeps the split. 29 checks; works on production (Practice is open) |
| `motion-polish.js` | **Cross-fades and the contents marker** (spec 24, #324): one view transition per page change, "theme" for the theme switch, none under reduced motion, figures redraw in the new theme, the marker lines up with the current heading, Back. 14 checks; articles need sign-in on production |
| `figure-loops-events.js` | **Spec 24 decisions** (#325): on a phone never more than one figure loop runs while scrolling a 13-figure article; on desktop every figure in view plays; `fig_step` sent once for two steps; `practice_pane` on a tap; the header is solid on phones and blurred on desktop (hides `navigator.webdriver`, which turns analytics off). 7 checks; needs a local API |
| `practice-diagram-phone.js` | **The learner's diagram on phones** (#326, #327): none before a run, "See the diagram" sheet, Run with the reference → Result (Accepted) with the diagram on top, one arrow per hop and a key, request dots that hide after three loops, none under reduced motion, a pan on the diagram keeps the pane, desktop dots. 20 checks; set `TK_APP` to the app repo (it reads problem 1's reference) |
| `state-scenes.js` | **Scenes for error and empty states** (#328): the 404 scene on a missing Practice problem (animated; still under reduced motion), the offline scene when the API is blocked, light and dark, no sideways scroll. 8 checks |
| `share-card.js` | **"Share as image"** (#329): no button before a run; after Accepted it saves a 1200 × 630 PNG; the label confirms; phone (dark) and desktop (light). 8 checks; set `TK_APP` to the app repo |
| `landing-counts.js` | **Landing counts count up** (#330): 0 before the cards are seen, the total after; reduced motion shows the total at once; the screen-reader copy is hidden. 6 checks; works on production |
| `marks-tour.js` | **Section marks and tour swipe** (#331): six marks in the sidebar, the current dot marigold, light and dark; on a Pixel 7 the tour card goes forward on a left swipe, back on a right one, and stays on the first step. 7 checks |
| `phone-figures.js` | **Portrait phone figures** (#332, #333): on a Pixel 7, each of 33 articles shows its first figure in portrait, fitting the column, every label inside its box, smallest ≥ 9.5 px, 4 steps, no sideways scroll; desktop keeps the original; reduced motion still. Needs a local API (articles need sign-in on production) |
| `premium-look.js` | **The premium look** (#335): black main button, fewer landing words, picture cards on Concepts, "Figures only" hides the paragraphs and keeps the figures, remembered, full text back; light, dark, phone without sideways scroll. 12 checks; needs a local API |
| `eval-v2.js` | **The v2 evaluator on the URL shortener** (#291): calls table, start fails with its plan error, the solution accepted on Run and Submit (10/10), per-call results, How your design was read, ▶ Replay on the canvas, ▶ Watch, generated settings, arrow Carries, no credit meter; iPhone 13 too |
| `eval-payments.js` | **Payments on the v2 evaluator** (#293): calls table, the payment provider on the canvas and locked (its panel, Delete), start fails, the solution Accepted 10/10, webhooks and charges made after answering in the results |
| `eval-problem.js` | **Any v2 problem** (`node eval-problem.js <site> <slug>…`): calls table, start fails, the solution Accepted on Submit, per-call results and How your design was read, no page errors |
| `no-lab.js` | **IND vs PAK is a problem, there is no Lab tab** (#285/#286): tabs and sidebar, Problems lists IND vs PAK and 8 challenges, a challenge's own page (back link, Score, tour), old `#lab` links, the IND vs PAK workspace (Run fails on the start) and article (2 figures), repointed cards, the landing canvas and phone controls (0/2 → 2/2 with a CDN and 40 servers), no sideways scroll on phone pages. 33 checks; uses `open-site.js` |
| `site-sweep.js` | Footer date, no GitHub links, Concepts list, article opens, breadcrumb back, bad slug / malformed hash fall back, **overflow sweep 320→1440 px** on the article, Concepts, Quick Notes and `/` |
| `read-aloud.js` | Read aloud with a **stubbed speech engine** (forces a device voice): highlight moves, pause/resume/stop, reads to the end, stops on navigation, figure animation packets, reduced motion → 0 packets |
| `mobile-figures.js` | iPhone 13: voice ranking order, figure fits the column, full-screen dialog (focus on Close, `#root` inert, Escape returns focus) |
| `recorded-audio.js` | Recorded narration path (only meaningful when an article has `audio: true` and a manifest) |
| `api-down.js` | API unreachable → "Couldn't load this page" + Try again; recovers when the API returns. Expects the site built with `VITE_API_BASE=http://127.0.0.1:5111` and starts `backend/src/server.js` on port 5111 itself (edit the backend path at the top if needed) |
| `lab-basics.js` (outdated since #301: tests the v1 Lab) | Lab tab, example loads, Run, raising Clients overloads the Server, palette click and drag add components, autosave across reload, new design, designs list |
| `lab-drag.js` | Palette drag with pointer events (mouse drag, 2 px wobble = tap, release outside canvas = nothing, keyboard Enter) and **real touch events via CDP** on an iPad viewport |
| `lab-credits.js` (outdated since #301: tests the v1 Lab) | Free-spot placement (no overlaps), several Clients into one gateway, credit drains on the simulated clock and survives a reload, running out of credit stops the run, Designs → ⧉ duplicate gives fresh credit |
| `lab-storage-links.js` | Corrupted `tk-lab-v1` (garbage, wrong shape, `__proto__`/`constructor` ids, bad nodes/edges) loads without errors and is re-saved as version 1; landing card and quick-note links open the right dashboard section |
| `lab-phase2.js` (outdated since #301: tests the v1 Lab) | Seeds a 7-component design (Load Balancer, Cache, Queue, worker) and checks the node readouts, queue backlog, panels and run log |
| `lab-traffic.js` (outdated since #301: tests the v1 Lab) | Lunch-and-dinner pattern with an autoscaled server group (status req/s through the evening, scale-out for the dinner peak and scale-in overnight, cost follows instances), Clients panel day chart, flash sale crashing a fixed group |
| `challenges-v2.js` | The eight Lab challenges on v2 (#300): each opens on the v2 canvas with its challenge box and its start scores 0/3; one-server with 5 instances set in the inspector scores 3/3 |
| `learn-challenges.js` (outdated since #301: tests the v1 Lab) | Dashboard starts with no tab selected (no Learn tab), article analogies, `#lab/one-server` scores 0 stars then 3 after a fix, Challenges ★ count, every dashboard tab renders (no error boundary) |
| `tour-import.js` | No tour by itself (webdriver hidden), the Tour button opens it, Next/Back, closes on its last step, Esc, Lab tour; Import: bad line blocks Create, the example imports as 7 components and runs, Export → re-import from the file |
| `landing-lab.js` | Landing sections (hero, IND vs PAK Lab, library; no Did you know), hero buttons, the embedded Lab scores 0★, then add a CDN, rewire by dragging handles, 40 servers → 3★; the Did you know dashboard tab |
| `landing-phone.js` | iPhone 13: the landing page's three-control IND vs PAK (no canvas; a swipe scrolls the page), 0★ → CDN + 40 servers → 3★, the Learn step, no overflow; a laptop still gets the full Lab |
| `qa-scoring.js` | QA regressions: CDN-only on the landing Lab scores 0★ with a "never reach the Server" note; fixed CDN settings locked; Run starts at 19:00; 34 servers → ✓✓✕ and the panel ticks the right goals |
| `qa-saving.js` | QA regressions: first landing visit creates one design; the full Lab still opens your own design afterwards; two tabs keep each other's changes; credit spent mid-run survives a reload; blocked storage still renders the dashboard |
| `qa-a11y.js` | QA regressions: connect/remove arrows from the panel, menus close on Esc/outside, numbers after Stop, unknown challenge message, Back restores scroll, tour keeps focus, MENU aria-expanded + Esc |
| `dashboard-home.js` | Dashboard start page: no tab selected, the three Library cards with diagrams, each card → its tab and first article/section; landing page has no cards; desktop + iPhone 13, no overflow |
| `lab-cache-arrows.js` | Write-back cache pushed past 150 %: crash, writes lost, queries fall through to the database, back empty and warming up; arrows removed with ✕, the Arrow panel button and Delete, and still gone after a reload |
| `account.js` | **Local only.** Sign in with Google across two browser profiles (Google's script stubbed; tokens minted by `auth-stack.mjs`): sign-in merges local designs up, the other device gets them, an edit and a deletion reach the first device, account menu, privacy page, sign out keeps local data, delete account. Usage: `node account.js <site> http://127.0.0.1:5191` |
| `components.js` | Components section: subsections and their article counts, sidebar subs, every article opens with its figures, Lab cards open their challenge, 320 px: no overflow, figure frames fit the screen (on phones the figure itself is wider and scrolls in its frame, #313), full screen opens |
| `problems.js` | Problems workspace on Q01 (LeetCode-style): tabs, example tests, Run on the start design fails with reasons, the reference design (read from a `tech-katta` clone next to this repo, or `TK_CONTENT`) passes, Submit with and without a written answer and a hint (50 → 97/100), Submissions, ✓ Solved and best score in the table, Solution tab, phone (Run/Submit bar at the bottom, no overflow) |
| `problems-medium.js` | One problem by slug: Run on its starting design, Submit its reference → Accepted. `node problems-medium.js <site> <slug>` |
| `problems-server.js` | Submit's server check with the account API stubbed (signed in, verdict, stats): the line under the verdict, the posted body, the Acceptance column |
| `lab-rename-check.js` | Rename a Server to "Orders API": canvas, panel title, a reload keeps it, clearing brings back "Server" (#228). `node lab-rename-check.js <site>` |
| `lab-engines-check.js` | Database engines: the picker's 8 families, DynamoDB (no size, three-zone note, "Good at", "DynamoDB · on demand"), MongoDB (its sizes, Multi-AZ, replicas), the design runs (#229) |
| `lab-schema-check.js` | Schema editor: a table with a location (warning: no geo index), a geo index (warning gone), DynamoDB (error with the geohash advice, Partition/Sort key words), node line, reload, phone (#230) |
| `problems-all.js` | Every problem: the starting design fails Run; the reference (schemas, engines) is Accepted on Submit with every request test passing; one line each, `all 22 problems OK` at the end. `node problems-all.js <site> [slug …]` |
| `phone-new-lab.js` | iPhone 13: rename + DynamoDB + the schema dialog in the Lab, then Run and ▶ Watch in a problem (the hop stays on screen, no sideways scroll) |
| `lab-requests-check.js` | Request tests on a problem (default restaurants-near-me; `node lab-requests-check.js <site> <slug>`): Description shows request + expected response; the reference without a schema fails with the reason; with it Run passes; ▶ Watch steps through every hop with the highlighted component and the moving dot; Esc closes; phone (#231) |
| `tour.js` | The guided tours: the start-page tour ends on "Start with Networking essentials" and opens it; each section and the Problems list have their own tour ending on a link to a first step (#313); the problem workspace tour (every card on screen, settings, Run/Submit, Solution); keyboard; no tour by itself on a first visit; phone; screenshots `/tmp/shots/tour-*.png` |
| `solution-tab.js` | Solution tab: the solution design (diagram, What each part does, ⤢ Full size + Esc), Copy to my canvas → Run passes, Undo brings your design back, Submit unchanged → Accepted but not solved ("copied solution" in Submissions), a changed setting counts, Reset, phone (#234). `node solution-tab.js <site> [slug]` |
| `lab-crash.js` | Crash policy: 3 servers @1,600 req/s → database crashes and fails over (Multi-AZ); example @2,400 req/s → server crash loop; availability, run log |

Testing sign-in (local stack; sign-in is on in production since 2026-11-04, and since #149 the button is in the landing page header, so account.js signs in on `/`)
```bash
cd tech-katta/backend && npm ci
node /path/to/tools/e2e/auth-stack.mjs local-test.apps.googleusercontent.com /tmp/uri.txt &   # MongoDB + fake Google keys on :5191
cd tech-katta && PORT=5181 HOST=127.0.0.1 CONTENT_DIR=$PWD/content FRONTEND_ORIGIN=http://localhost:5411 \
  GOOGLE_CLIENT_ID=local-test.apps.googleusercontent.com MONGODB_URI="$(cat /tmp/uri.txt)" ACCOUNTS_DB=tk_e2e \
  SESSION_SECRET=$(head -c 48 /dev/urandom | base64) COOKIE_SECURE=0 GOOGLE_JWKS_URL=http://127.0.0.1:5191/certs node backend/src/server.js &
cd frontend && VITE_API_BASE=http://localhost:5181 npx vite build --outDir /tmp/authbuild && npx vite preview --outDir /tmp/authbuild --port 5411 --strictPort &
cd /tmp && node /path/to/tools/e2e/account.js http://localhost:5411 http://127.0.0.1:5191
```
`landing-lock.js` and `events.js` also need the MongoDB driver: `NODE_PATH=tech-katta/backend/node_modules:$(npm root -g)`.
Use `localhost` (not 127.0.0.1) for both the site and the API so the cookie counts as same-site.
Other scripts run against this stack log Google's "client ID is not found" (the fake ID); run them
with sign-in off.

Tips
- Use a **new port** for every `npx vite preview --port N --strictPort` (old servers serve stale
  files). Chromium refuses some ports (e.g. 5061).
- To test against a **local API**: `PORT=5181 CONTENT_DIR=<dir> node backend/src/server.js`, then
  build the frontend with `VITE_API_BASE=http://127.0.0.1:5181 npm run build`. Building without
  `VITE_API_BASE` talks to the **production** API (a common source of confusing results).
- Stop servers with `pkill -f "vite prev[i]ew"` / `pkill -f "src/server[.]js"` as a **separate
  command** — if the same command line also contains "vite preview", pkill kills its own shell.
- Freeze SVG animation: `svg.pauseAnimations(); svg.setCurrentTime(t)`.

Content audit (not a browser check): `python3 tools/audit/content-audit.py` cross-checks every problem's tests,
rubric, hints and key decisions (numbers in test text vs settings, labels vs checks, estimates vs the worked
answer, API paths vs the rubric, giveaway decisions, text slips). Written for the #238 audit.
