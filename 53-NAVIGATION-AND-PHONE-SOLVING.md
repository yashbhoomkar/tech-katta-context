# 53 — Fewer places, and solving a problem on a phone

Written 2026-11-25 from the owner's words:

> "It is not at all a good experience to solve problems on phone. Also it is so hard to navigate to get to the actual
> problem solving interface. In general on the website there are so many tabs. It is very confusing."

This is a build plan for the next session to implement. That session is expected to be Sonnet 5.5 at medium effort.
Each phase below is one PR, in order, with the files to touch and checks that must pass. Do not start a phase until
the one before it is merged. **Section 8 lists the owner's open questions; build with the stated defaults unless the
owner has answered.**

Pictures referred to below are in `ui-redesign/53/` (phone = iPhone 13, 390×664 CSS px; desktop = 1366×860).

---

## 0. How this was observed

- `main` at `1b394b6` (#381) plus app PR #386 (the sign-in flag below), on a local build of the site and API.
- Browser: Playwright Chromium, iPhone 13 profile and 1366×860, dark theme. Production was walked signed out. The
  local copy ran with `SIGNIN_REQUIRED=0`, so the workspace opened without an account.
- Not done: a real phone, Safari, a real touch drag (Playwright clicks only), a signed-in Google account.

### The sign-in flag (app PR #386, draft)

`SIGNIN_REQUIRED=0` on the API opens every page and every text without sign-in, production included.
`GET /v1/auth/config` then returns `required: false` and `site3d/scripts/gate.js` opens every gate.

- **Turning it on and off in production:** set the GitHub repository variable `SIGNIN_REQUIRED`, then rerun
  "Deploy Tech Katta Backend".
- **Local checks:** for every phase below, run the API with it set to 0:
  ```
  cd backend && PORT=5000 HOST=127.0.0.1 NODE_ENV=production SIGNIN_REQUIRED=0 FRONTEND_ORIGIN=http://localhost:4173 node src/server.js
  cd frontend && npm run build && node hosting/serve-local.mjs dist 4173 hosting/routes.json
  ```
- **Gotcha:** the 3D pages call `https://tech-api.katta.cc` directly (`site3d/scripts/articles.js` `API`). In
  Playwright, reroute it to the local API:
  ```js
  await ctx.route('https://tech-api.katta.cc/**', async (r) => r.fulfill({ response: await r.fetch({ url: r.request().url().replace('https://tech-api.katta.cc', 'http://127.0.0.1:5000') }) }));
  ```

---

## 1. What is wrong today

### 1.1 Too many places, and five different kinds of "solve"

A visitor who wants to practise system design meets all of these. Each has its own list, page layout and progress
counter:

| Thing | Where | Count | What it is |
|---|---|---|---|
| Problems | `/problems` → `/problems/<slug>` | 22 | Canvas, tests, judge, Replay. **The core of the site.** |
| Challenges | bottom of `/problems` → `/problems/challenge/<id>` | 8 | The same canvas, scored in stars |
| Sandbox | `/problems/sandbox` | 1 | The same canvas, no tests |
| Simulator | `/simulator` → `/simulator/<id>` | 5 | Pick counts of servers and caches, watch one evening. Its own page calls these "Problems" too |
| Practice | `/practice` (spec 21, not in any menu) | 10 | LeetCode-style text designs, hidden tests |
| Interview questions | `/learn/interview-questions/<slug>` | 29 | 7 guides, plus **the same 22 problems again as articles** (the written answer) |

Navigation around these:

- **Wide screens:** the sidebar has 12 rows in 3 groups: Search, Dashboard, Concepts, Components, Interview
  questions, Real systems, Quick Notes, Problems, Simulator, Sign in, You, and a theme button.
- **Phones:** the bottom bar has Dashboard, Learn, Problems, Simulator and Search, and the top bar has search again.
- **Learn** has its own row of 4 tabs.
- **The workspace** has its own tabs (Description, Your answer, Hints, Solution, Submissions) plus a ⋯ menu of 7.

### 1.2 Getting to the canvas is hard

- **The Dashboard (`/home`) has no way into the problems** (`ui-redesign/53/6-*.png`, `7-*.png`). Its only call to
  action is "Networking essentials". Its links go to the 4 Learn sections and the Simulator, never to `/problems`.
- **A problem's article has no way to its own canvas on a phone.** On
  `/learn/interview-questions/url-shortener`, "Solve it on the canvas" (`.rail-cta` in
  `site3d/scripts/pages/article.js` line ~200) sits in the side rail. The rail is hidden on phones. On desktop it
  is 4,800 px down a 10,900 px page.
- **Every "Try the … challenge" box in an article goes to `/simulator/ind-vs-pak`.** In
  `site3d/scripts/pages/article.js` line 47, `case 'lab'` hardcodes `href="/simulator/ind-vs-pak"` and ignores the
  block's `to` field. The content is right: for example `api-gateways.json` has
  `to: "problems/challenge/first-rush"`. This affects 20+ articles. **It is a bug: fix it first** (phase 1).
- **The same name means different things.** "Practice" is a sidebar heading over Problems and Simulator, and also
  `/practice`, a different product. The Simulator's list is titled "Problems". "Interview questions" and "Problems"
  list the same 22 items with different numbers and different pages.

### 1.3 Solving on a phone does not work

On `/problems/url-shortener` at 390×664, after "Start designing" (`1-workspace-after-start.png`), the screen is
stacked bars:

| Band | Height (px) |
|---|---|
| Site top bar (logo, search, theme, Sign in) | 68 |
| Workspace bar (truncated "Design …", Brief, Run, Submit, ⋯) | 60 |
| Tool row (title input, 3D/2D, ▶ Present, Tidy up, ⌨, Export). 690 px wide in a 390 px screen, so it scrolls sideways and "Pres…" is cut off | 55 |
| "1 thing to fix" banner | 55 |
| Connect / Fit | 55 |
| "Drag a part to move it · drag the floor to pan · scroll to zoom" (wrong words for touch) | 40 |
| Parts strip: 14 parts in one sideways row, 2,100 px long | 60 |
| Site bottom bar (Dashboard, Learn, Problems, Simulator, Search) | 80 |
| **Canvas left over** | **~190–260** |

Then:

- **Adding a part takes over the screen.** Tapping "CDN" in the parts strip adds it, and the part's settings sheet
  (name, note, about, arrows out, connect to, remove) opens over two thirds of the screen. It has no visible close
  button (`2-part-sheet-covers-canvas.png`).
- **Run's results draw underneath that sheet.** The text of the sheet, the results, the AWS credit and the canvas
  hint all show through each other (`3-run-results-under-sheet.png`).
- **"Brief" covers the whole workspace again,** including any results.
- **2D draws the design tiny and off to the right** (`4-2d-design-off-screen.png`). Its zoom controls take a column
  on the left.
- **Landscape has no canvas at all:** the bars fill all 390 px (`5-landscape-no-canvas.png`).
- **The problem's name shows twice** (bar and title input), and the first tab is cut to "Design …".

### 1.4 Small things found on the way

- `/problems` on a phone: the Challenges heading's chip ("stars for staying up, not crashing") is 541 px wide in a
  390 px screen and is clipped.
- The site's search button appears twice on phones: top bar and bottom bar.

---

## 2. The shape we are moving to

**Three places, plus You.** Every screen answers "Learn it, or solve it?".

| Place | Address | Holds |
|---|---|---|
| **Home** | `/home` | Continue solving · continue reading · what to do next · progress |
| **Learn** | `/learn/<section>` | Concepts, Components, Interview guides (the 7 "Start here" guides), Real systems, Quick Notes |
| **Solve** | `/problems` | One list: Problems (22), Challenges (8), Warm-ups (the Simulator's 5), Sandbox |
| You | `/me` | Account, sign in/out, theme, progress reset |

Rules:

1. **One name per thing.** The canvas problems are "Problems". The 8 starred ones are "Challenges". The Simulator's
   5 become "Warm-ups", listed inside Solve; they keep their `/simulator/<id>` addresses and their own page. Do not
   use the word "Practice" for anything in the navigation until the owner decides about `/practice` (§8 Q3).
2. **A problem has one home: `/problems/<slug>`.** Its write-up at `/learn/interview-questions/<slug>` stays at its
   address (search engines index it). It is presented as **the answer to that problem**: a big "Solve it first"
   button at the top, and "Read the answer" from the problem's workspace. The Interview questions list in Learn shows
   the 7 guides first, then the 22 as "Answers to the problems", each row with **Solve** (primary) and **Read**.
3. **From anywhere, at most 2 taps to the canvas:** bottom bar Solve → a problem; Home → "Continue" or "Next
   problem"; an article → "Solve it on the canvas".
4. **On a phone, the workspace is a focus screen.** No site bars. One header, one bottom switch (Problem · Design ·
   Results). The canvas gets everything else.

---

## 3. Phase 1 — bugs and the missing links (small PR, ship first)

Files: `frontend/site3d/scripts/pages/article.js`, `pages/me.js`, `site3d/styles/*.css`, `pages/problems.js`.

1. **Lab boxes go where the content says.** In `article.js`, `case 'lab'`, use `href="/${b.to}"` when `b.to` exists
   (it is `problems/...` without a leading slash). Fall back to `/problems` when it doesn't. Never use
   `/simulator/ind-vs-pak`. Also check the `.rail-cta` code at line ~200, which reads `lab.go`; it must not send a
   lab link to `/simulator`.
   - Test: add a case to an existing site3d test, or a small pure helper `labHref(b)` in a module with a
     `site3d/test/*.test.js` case. Add it to the `npm test` list in `frontend/package.json`.
2. **"Solve it on the canvas" on phones.** For a problem article (`isProblem`), put a primary button in the hero's
   `.actions` row: **Solve it on the canvas →** `/problems/<slug>`. Keep "Play the story" as the second button and
   drop "Skip to the article" on phones. Keep the rail link on desktop.
3. **Home gets a Solve card** above or beside "Start here":
   - It reads progress the same way `tally('problems')` in `shell.js` does.
   - Nothing started: "Solve your first problem · Design a URL shortener · 10 tests · Start →".
   - Started: "Continue · <problem> · <n> of <m> tests passed · Continue →", from the canvas's `tk-progress-v1`
     record and `tk-subs-v1` scores. `pages/problems.js` already reads both; reuse that code, don't copy it.
   - On phones the card comes **before** the 3D picture.
4. **Clipped chip on `/problems`:** let `.chip-done` wrap, or move it under the heading on narrow screens.

Checks (Playwright, phone and 1366×860, dark and light):
- Every `aside.try-lab a` on all 66 articles points to an address that answers 200 on the local build and is not
  `/simulator/ind-vs-pak` unless the block's `to` says so.
- On a phone, the URL shortener article shows a link to `/problems/url-shortener` inside the first screen.
- `/home` has a visible link to `/problems/...` inside the first screen on a phone.
- `document.body.scrollWidth <= innerWidth` on `/problems`.

---

## 4. Phase 2 — fewer tabs (navigation)

Files: `site3d/scripts/shell.js` (`PLACES`, `draw`, the phone bar), `site3d/index.html` and `hosting/switch.mjs` if
the phone bar is in the static shell (look for `.tabbar`), `pages/problems.js`, `pages/learn.js`, `pages/practice.js`
(the Simulator list), `app.js` (`titleFor`), the e2e tests under `frontend/next/e2e`.

1. **Phone bottom bar: Home · Learn · Solve · You.** Four items. Search stays only in the top bar. "Solve" goes to
   `/problems` and is marked current on `/problems*`, `/simulator*` and `/practice*`. "You" shows the account's
   initial when signed in.
2. **Sidebar (wide screens), in groups:**
   - Search
   - Home
   - **Learn:** Concepts, Components, Interview guides, Real systems, Quick Notes
   - **Solve:** Problems (with n/22), Challenges (n/8), Warm-ups (n/5), Sandbox
   - **Account:** Sign in/You

   Problems, Challenges and Warm-ups are anchors or filters of `/problems` (`/problems#challenges`,
   `/problems#warm-ups`), not separate pages. Keep the existing rows' colours and icons.
3. **`/problems` becomes the one Solve list:**
   - At the top: the progress card with **Continue** (or **Start**).
   - Then a segmented filter: **Problems · Challenges · Warm-ups**, with the count on each. Default Problems; the
     choice is kept in the URL hash.
   - Problems keep their Easy / Medium / Hard groups.
   - Warm-ups list the Simulator's 5 (`INCIDENTS` from `sim.js`) and link to `/simulator/<id>` as today.
   - Sandbox is one quiet row at the end: "Sandbox: a free canvas".
   - Each problem row keeps the 3D preview on wide screens. **On phones, drop the preview.** The list must reach the
     first problem within one screen.
4. **`/simulator` (the list page)** stays reachable, because old links point to it, but it is no longer in any menu.
   It redirects in the router to `/problems#warm-ups`. `/simulator/<id>` pages are unchanged. Retitle its "Problems"
   heading to "Warm-ups".
5. **Learn › Interview questions:**
   - Rename the tab "Interview guides".
   - The list shows the 7 "Start here" guides as now.
   - The 22 problem write-ups go under a heading "Answers to the problems". Each row gets two links: **Solve**
     (`/problems/<slug>`, primary) and **Read the answer** (the article).
   - Section counts in the sidebar become "7 guides + 22 answers"; or keep 29, whichever fits on one line.
6. **Titles and breadcrumbs:**
   - Home's breadcrumb label "Dashboard" becomes "Home".
   - In the workspace, the breadcrumb is Home / Problems / <name>.
   - Update `titleFor` in `app.js` to match.

Do **not** change any address (SEO, old links, `hosting/routes.json`). This phase changes menus, labels and list
layout only.

Checks:
- Phone bottom bar has exactly 4 items, each ≥ 44×44 px.
- From `/` a phone reaches the URL shortener canvas in ≤ 3 taps (landing "Open the problems" → row → workspace). From
  `/home`, in ≤ 2.
- Every old address in `hosting/routes.json` still answers as before. Run the existing hosting tests and the e2e.
- No page has two different things called "Problems" or "Practice". Grep the rendered text of the sidebar and the
  bottom bar.
- Update `frontend/next/e2e` tests that click "Dashboard" or "Simulator" in the bars. **Do not loosen assertions**:
  follow the new labels.

---

## 5. Phase 3 — the phone workspace (the big one)

Files:
- `frontend/src/solve.jsx`: the problem workspace; its `narrow` mode, `(max-width:900px)`, is the phone layout.
- `src/solve.css`, `src/theme/look-3d.css`.
- `src/lab/Canvas.jsx`: `lab-top` tool row, Connect/Fit, the fix banner.
- `src/lab/design3d.jsx`: the 3D canvas and its hint text.
- `src/lab/Palette.jsx`, `src/lab/Inspector.jsx`.
- `site3d/scripts/pages/workspace.js` and `shell.js`: the `ws-page` / `focus-page` classes that hide the site frame.

Read `solve.jsx` fully before editing. It is minified-looking JSX; match its style.

### 5.1 Layout at ≤ 900 px wide (portrait)

```
┌────────────────────────────────────┐
│ ←  Design a URL shortener   ▶ Run  ⋯│  header 52 px: back (to /problems), title (1 line, ellipsis),
├────────────────────────────────────┤               Run (primary), ⋯ (everything else)
│                                    │
│                                    │
│            THE CANVAS              │  all remaining height
│                                    │
│                         [ + Part ] │  floating button, bottom-right, 56 px
├────────────────────────────────────┤
│  Problem   •  Design  •  Results ② │  bottom switch 56 px + safe area; the badge counts failing tests
└────────────────────────────────────┘
```

1. **Hide the site's top bar and bottom bar on workspace pages on phones.** Use `body.ws-page` with a
   `(max-width: 900px)` media rule. They return as soon as you leave (← or browser Back). The ← goes to `/problems`,
   or `history.back()` when the previous page was on this site.
2. **Three views, one visible at a time:**
   - **Problem:** the description column as it is today: brief, tests, hints, Your answer, Solution, Submissions as
     sections or sub-tabs. At the end, a button: "Read the full answer" → the article.
   - **Design:** the canvas only.
   - **Results:** the last Run or Submit. One row per test, pass ✓ or fail ✗, then "What would fix it?", "▶
     Replay", the AWS credit (collapsed).
   - Views switch with the bottom switch and with a sideways swipe on the header area. **Not** on the canvas: the
     canvas needs its own drags. Use the existing gesture hook: `useDrag` and `release` in `src/theme/gesture.js` (spec 24).
3. **Run:**
   - Runs the example tests, then switches to Results.
   - While running, the button shows a spinner. Results are never drawn under or over another sheet.
   - **Submit** goes in the ⋯ menu as its first item, and at the bottom of Results ("All examples pass. Submit to run
     every test →").
4. **First visit:** open on **Problem**, with a sticky "Start designing →" button at its bottom that switches to
   Design. On later visits open on **Design**, remembered per problem in localStorage, try/catch. This replaces the
   current `sv-pbrief` overlay card. **Delete that overlay on phones.**
5. **⋯ menu (a bottom sheet):** Submit · Hints · Ask the interviewer · Timer · Reset · Rename · 3D / 2D · Export
   (Mermaid, SVG, PNG, JSON, share link) · Keyboard shortcuts is hidden on touch.
6. **Removed from the phone layout:**
   - The title input (Rename in ⋯).
   - ▶ Present.
   - Tidy up: run the existing tidy layout automatically after each added part on phones, or put it in ⋯.
   - ⌨, the Export row and the Connect/Fit row (see 5.2).
   - The "Drag a part…" line.
   - The fix banner: it becomes the Results badge and a dot on Run.

### 5.2 Building on the canvas with a thumb

1. **"+ Part" opens a parts sheet** (bottom sheet, 70 % height, drag handle, swipe down or tap outside to close):
   - A 3-column grid of all 14 parts, in the palette's own groups (the desktop palette shows Edge, Compute, Data, …; take them from the same source), each with icon and
     name. The one-line description shows on long-press.
   - Tapping a part adds it, centred in the visible canvas and offset so it never lands on another part, and closes
     the sheet. **It does not open the part's settings.**
2. **Selecting a part** (tap) shows a small floating bar above it: **Connect · Settings · Delete**.
   - **Connect** enters connect mode: "Tap the part this sends to". Tapping a second part draws the arrow and leaves
     connect mode. Tapping empty canvas cancels.
   - **Settings** opens the inspector in a bottom sheet (half height, can be dragged to full, with a visible ✕ and
     swipe-down to close). Close it before showing anything else.
3. **Gestures:** one finger on a part moves it; one finger on empty canvas pans; two fingers pinch-zoom.
   - After the first part is added and after load, **Fit** runs automatically. A "Fit" icon button sits at the
     canvas's top-right corner (44 px).
   - The 3D canvas (`design3d.jsx`) already does drag, pan and pinch with pointer events. Keep that, and add only the
     auto-Fit.
4. **Default view on phones: 3D.** It reads better small. The 2D view must call Fit on show: today it draws off to
   the right. Its zoom column moves into ⋯ or becomes the same corner Fit button.
5. **Only one sheet at a time.** Opening any sheet closes the other. Android/browser Back closes an open sheet before
   leaving the page: push a history state when a sheet opens, and pop it on close.

### 5.3 Landscape on phones (height ≤ 500 px)

- The header shrinks to 44 px.
- The bottom switch moves into the header as three small segments.
- The canvas takes the rest; nothing else is shown.

### 5.4 Replay

"▶ Replay" from Results opens full screen over the workspace, with its scrubber at the bottom (already pinned there
since `ce56c5b`) and a ✕ top-left that returns to Results.

### 5.5 Desktop

Desktop (> 900 px) is unchanged by this phase except for shared bug fixes. Do not restyle it.

### 5.6 Checks

Playwright, iPhone 13 and Pixel 7 profiles, portrait and landscape, dark and light, against the local build with
`SIGNIN_REQUIRED=0`:

- On `/problems/url-shortener`, after the first visit, the canvas element's height is ≥ 70 % of `innerHeight` in
  portrait and ≥ 75 % in landscape.
- `document.body.scrollWidth <= innerWidth`, and no element of the workspace header is wider than the screen.
- Tap + Part → tap CDN: the sheet closes, a node is added, **no** inspector is open, and the canvas is still ≥ 70 %.
- Tap the node → Settings: the inspector shows. ✕ closes it. Browser Back also closes it and stays on the page.
- Tap Run: the view is Results, with one row per example test. No other sheet is open. Results are the only visible
  layer: `elementFromPoint` at 5 points in the results area all hit results nodes.
- Connect a Load Balancer to a Server using Connect then a tap on the target: an arrow is added (count edges before
  and after, with the same "wait until counts settle" approach as `next/e2e/design.spec.ts`).
- Every tappable control in the header, the switch, the floating bar and the sheets is ≥ 44×44 px.
- The site top and bottom bars are not visible on the workspace, and are back on `/problems`.
- Run the existing design e2e (`frontend/next/e2e/design.spec.ts`) and the unit tests. **Never skip or loosen an
  assertion.** Update selectors only where an element moved.

Add a new e2e file, `frontend/next/e2e/phone-workspace.spec.ts`, holding the checks above.

---

## 6. Phase 4 — the other canvases use the same phone layout

Challenges (`/problems/challenge/<id>`), Sandbox and shared designs mount through the same island
(`next/src/islands`). Make them use the phase 3 layout:

- **Challenges:** the stars show in Results.
- **Sandbox:** has no Problem view, so its switch is Design · Results.

Checks: the 5.6 list run on `/problems/challenge/one-server` and `/problems/sandbox`.

---

## 7. What not to do

- Do not change any URL, any content JSON field, the judge, the evaluator or the tests' scoring.
- Do not merge the Simulator's pages into the canvas. They stay their own product, only listed under Solve.
- Do not remove Quick Notes, Real systems or `/practice`. Those wait on the owner (§8).
- Do not add a new analytics event. That would count as a data-model change under operating rule 4, which needs the
  owner's approval.
- One phase per PR, opened as a draft, following the handover §3 workflow. That includes the ledger rows for every
  commit and the context update afterwards.

---

## 8. Questions for the owner (build with the defaults until answered)

| # | Question | Default used |
|---|---|---|
| Q1 | Bottom bar label: "Solve" or "Problems"? | **Solve** (a verb, next to Learn) |
| Q2 | Simulator's 5 as "Warm-ups" inside Solve, out of the menus? | **Yes** |
| Q3 | `/practice` (spec 21, 10 text problems, unlinked): link it as a 4th filter "Drills", keep hidden, or retire? | **Keep hidden**; no menu uses the word Practice |
| Q4 | Quick Notes: keep under Learn, or remove (pending since 11-09)? | **Keep, under Learn** |
| Q5 | Phone workspace default view: 3D or 2D? | **3D** |
| Q6 | Turn `SIGNIN_REQUIRED=0` on in production while this is built and tested on real phones? | **No** (off only locally) |

---

## 9. Status

| Phase | PR | Status |
|---|---|---|
| Sign-in flag | app #386, squash `45f91cf` | merged and live 2026-11-25 (off: `SIGNIN_REQUIRED` unset = 1); backend 154/154, frontend 461/461 |
| 1 Bugs and links | app #387, squash `d8fa6d1` | merged and live 2026-11-26 07:26 IST. Lab boxes follow `to` (`site3d/scripts/solving.js` `labHref`); Solve first on problem articles; Home solve card (`.solve-card`, public: shown signed out without progress; e2e asserts it); phone overflow fixes on /home (the places rows' sideways slide-in) and /problems (chip). Frontend 464/464; local Playwright iPhone 13 + 1366×860 dark/light; all 66 articles' lab links swept (none to `/simulator/ind-vs-pak`); production checked on phone and desktop. CI e2e: `design.spec` and the replay test timed out twice on busy runners and passed on the 3rd run and locally (44 s / 47 s of 60 s): the time-limit risk in doc 51 R2 is real |
| 2 Fewer tabs | — | in progress in session `session_01Jmp3n6w9TKmp8Rww67rsN7` (Sonnet 5.5, branch `ccr-nav-phase2`) |
| 3 Phone workspace | — | not started |
| 4 Other canvases | — | not started |
