# 48: the 3D site takes tech.katta.cc's root (2026-11-23)

Owner, 2026-11-23: "we are going to retire the current neo-brutalism frontend … Look at the 3d design on the prototype
katta. It is going to take over." Then: "Merge it and start the 3D switch. We will keep on refining the 3d website."
And: "Continue the 3D switch, build and test it."

PR: yashbhoomkar/tech-katta#374 (branch `ccr-328fc450-xdjrk1`). Code notes: `frontend/site3d/README.md`.

## What answers where

| Address | Served by |
|---|---|
| `/` (landing), `/home` (Dashboard), `/learn`, `/learn/{concepts,components,interview-questions,real-systems}[/<slug>]`, `/simulator[/<id>]` | 3D site, `frontend/site3d` |
| `/problems…` (canvas, judge, Replay, AWS credit), `/practice…`, `/me` (sign-in, account), `/learn/quick-notes…`, `/privacy`, `/terms`, `/dashboard…` (old links) | React app, `frontend/next`, still neo-brutalism |

The 3D site is the prototype from the `prototype` branch. Its folder there has an unlisted name, which is not written here
or in the code, and it keeps being served there. The prototype's notes are carried over as `site3d/PROTOTYPE-NOTES.md`.

## Decisions

- **Keep the canvas workspace, don't rebuild it.** The 3D site's own practice (pick counts of parts, watch one evening)
  is a different, smaller thing. It stays, renamed **Simulator**, beside the canvas **Problems**.
- **Real addresses, not `#/`.** Production's addresses already matched the prototype's paths, so links, search-engine
  pages and the sitemap stay the same. Old `#/…` links are converted on load (`#/me` → `/home`, `#/sim` → `/simulator`).
- **Two apps, handing over with whole page loads.** Each app owns its addresses:
  - The 3D router keeps its own links in the page and loads every other address as a whole page.
  - The React app, built with `VITE_SITE3D=1` (production only), loads the 3D addresses again as a whole page, once
    per address; a second time it shows not found, so a mistyped article cannot loop.
  - The three lists of 3D addresses must agree: `OWN` in `site3d/scripts/app.js`, `OWNED_BY_3D` in
    `hosting/switch.mjs` and the same in `next/src/app/router.tsx`.
- **Back and Forward across the hand-over.** Chrome hands a page that loaded with `location.replace` the earlier
  entries of the other app as same-page history, so the 3D app showed itself at `/problems`. It now reloads when Back or
  Forward lands on an address it does not own.
- **Search engines see the same thing.** `switch.mjs` writes the 3D page shell at every 3D address with the title,
  description, canonical address, JSON-LD and text in `<div id="root">` that the React pages had. `/home`, `/learn`
  and `/simulator` get plain 3D pages, and `/simulator/*` is a rewrite (`hosting/routes.json`, `vercel.json`).
- **Progress.** The 3D site keeps its own record (`tk-r3d-progress`). Articles finished in the React app
  (`tk-progress-v1`) count as read there, and finishing one in 3D marks it in the React record. It only writes when
  that record has the React shape, so nothing is overwritten. 3D progress is not part of account sync yet.

## Checked before the PR

On a full production build, served locally with the same rewrites as Vercel:

- **17 addresses**, each answered by the right app with the right status and title; a mistyped article returns 404.
- **Old links:** `/dashboard/concepts/caching/` and `#/learn/concepts/sharding` open their 3D article.
- **Navigation:** sidebar to Components and to Problems; Problems back to Concepts; Back and Forward across the switch.
- **iPhone 13:**
  - The four-place bottom bar and the footer were widening the page to 434 px. Fixed: 390 px, no sideways scroll.
  - The Problems tab opens the React page.
- **Progress** shared both ways.
- **Tests:**
  - Frontend 438/438. `hosting.test.js` had to list `/simulator`'s Cloudflare 404 copy beside `/dashboard`'s; the
    test was out of date, not the code.
  - React app checks 70/70, with typecheck and lint.

## Next

1. A "3D" look for the React app, so Problems, the canvas, Quick Notes and You match the 3D site. Add it as a third
   look in `next/src/lib/look.ts`: dark default, Instrument Sans and Geist Mono, the pastel per kind of part from
   `site3d/scripts/palette.js`. Restyle the canvas's own theme tokens to match.
2. Account sync for 3D progress (read articles and simulator bests).
3. Retire the neo-brutalism look once nothing uses it.
4. Keep refining the 3D site (the owner's words).

## Update 2026-11-23: the 3d look (#375, merged) and Problems in the 3D design (#376)

- **#375 (merged as `9d467f5`):** the React app has a third look, `3d` (`next/src/styles/looks/3d`), used by the
  production build.
  - It uses the 3D site's colours in light and dark on the default look's components. The canvas and figures use the
    3D models' part colours (`figureTokens.module.css`).
  - Dark is the default, and one theme setting (`tk-theme`) is shared by both apps.
  - The React sidebar says Dashboard and lists the Simulator.
- **#376 (merged as `78af778`, live and checked on tech.katta.cc):** `/problems` is a 3D page (`site3d/scripts/pages/problems.js`), after the prototype's practice list.
  - It has a progress card, a difficulty filter, and rows with solved and started marks, test count and best score.
  - Each problem's design shows in 3D, then Sandbox, Simulator and the Challenges.
  - It reads the canvas's own record and writes nothing. Each row opens the canvas workspace (React, 3d look).
  - `/problems` joins the 3D addresses in all three lists.
- Owner, when asked which way: "Take your decisions and proceed". The decision was to keep the canvas, judge, Replay
  and AWS credit as the place a problem is solved, and to give everything around it the 3D design.
- The 3D prototype stays at its unlisted address on prototype.katta.cc (branch `prototype`).

## Update 2026-11-23: phase 0 of 49 (#377, merged as `9203cfa`, live and checked)

- **What changed:** the two regressions since #374.
  - **The content lock is back on 3D pages.** Signed out, an article shows its opening (same cut as the SEO pages,
    `site3d/scripts/preview.js`) and the `previewLock` card; lists, Home, the landing and `/me` stay open; with sign-in
    unavailable (or the site copy unreachable) nothing is locked. The workspace will use `pageLock` in phase 1.
  - **Analytics:** a `page_view` per 3D route change in the React app's `{section, slug}` shape, `readArticle` per article,
    and Vercel Web Analytics once per page load.
  - **How:** `npm run build:site3d` (`vite.site3d.config.js`, entry `site3d/legacy/entry.js`) builds `src/account.js` and
    `src/analytics.js` into `dist/3d/legacy/legacy.js` (about 10 KB gzipped, no React; `legacy/mode.js` replaces the theme
    hook). `site3d/scripts/{account,analytics,gate,gating,signin}.js` use it. A sign-in sheet opens from the sidebar's
    Account row and the lock cards.
  - **Tests:** `site3d/test/gate.test.js` and `analytics.test.js`, in `npm test` (447 pass).
- **Checked:** a local build served like the host, Playwright with the API mocked (signed out, signed in, sign-in off, auth
  endpoints blocked; desktop and 412 × 915; light and dark); then production after the merge (`curl` 200s for the shell,
  `legacy.js` and `gate.js`; signed out, the caching article shows 9 blocks and the card on desktop and phone, lists, `/home`
  and `/` are open, one `page_view` sent, no script errors).
- **Not checked:** a real Google sign-in (needs the owner).
- **Ledger:** `frontend_git_commits` 1169 → 1171 (`d247d57`, merge `9203cfa`).
- **Left over:** nothing for phase 0.

## Update 2026-11-23: phase 1 of 49 (#378, draft until merged)

- **What changed:** the problem workspace, challenges, sandbox, shared designs and practice are 3D pages with the React canvas and
  judge mounted as islands.
  - **Build:** `next/vite.islands.config.ts` builds `src/islands` into `dist/3d/islands/islands.js` (no hash in its name, so it is
    not cached for a year; its chunks are hashed and are). The entry is tiny; React, the canvas and the judge load on the first
    mount.
  - **CSS:** the base CSS is rewritten to apply only under `.tk-island` (`next/scripts/island-scope.mjs`, tested). The theme is
    shared through `<html data-theme>`.
  - **One account:** the islands import `account.js` and `analytics.js` from `/3d/legacy/legacy.js` (the page's copy), so a user signed in
    on the page is signed in in the island. The 3D start-up calls `wireSync()` as the old app did.
  - **Page:** `site3d/scripts/pages/workspace.js`. The workspace, challenges, sandbox and shared designs are locked signed out
    (no island loaded); practice is open. Addresses are in `OWN`, `OWNED_BY_3D` (`switch.mjs`, `router.tsx`).
  - **Navigation:** `legacy-hash.js` turns the canvas code's `#fragment` moves into real addresses. A fragment-only change no longer
    redraws the page.
  - **Solution tab:** it now stays on the page, with "Copy to my canvas". The React app's Workspace passed `tab="q"` always, so the
    tab used to leave for the article and Copy to my canvas was unreachable.
  - **Hosting:** the 3D shell at those addresses with each page's prerendered title and description; rewrites for
    `/problems/challenge/*` and `/practice/*`; `hosting/serve-local.mjs`.
- **A bug found on the way:** the 3D article's `.lab` class made the canvas a zero-height grid. The 3D classes that clash with the
  canvas's CSS were renamed (`.lab`, `.skip`, `.pd`, `.lock-card`, `.hint`). Rule for later phases: a new 3D class must not reuse a name in
  `solve.css`, `lab.css`, `practice.css` or `sandbox.css`.
- **Checked:** see the PR. `npm test` 450, `check:next` 70, Playwright on desktop and a 412 × 915 phone, dark and light.
- **Ledger:** `frontend_git_commits` 1171 → 1172 (`bcea567`); the merge commit is added when #378 merges.
- **Left over:**
  - Phones use the legacy narrow layout, whose fixed Run/Submit bar sits under the 3D bottom bar (phase 4).
  - Serif titles and the action bar overflowing at 1440 px (phase 2).
  - An unknown `/problems/<x>` address still gets the React 404 page (phase 5).
  - The legacy review panel crashes if its API call returns an empty body (found with a test mock; the real API always returns JSON).

## Update 2026-11-23: phase 2 of 49 (first part: panels, cards and type; on #378's branch)

- **What changed:** `frontend/src/theme/look-3d.css`, imported only by the islands, maps the canvas code's legacy tokens onto the 3D
  site's (pure ink text, card and sunken surfaces, ink primary buttons with marigold kept for stars, 10 px buttons, 14 px cards, glass
  panels, Instrument Sans and Geist Mono, no serif or italics). The legacy CSS files are untouched; the rules sit under
  `.tk-island .tk-legacy` so they outrank them.
  - The problem card is a glass panel with a segmented tab control; the bar above the canvas wraps instead of overflowing; the palette,
    inspector, status line, results sheet and AWS credit are glass; replay states use the 3D models' colours (a coral pulse for down parts); the bar's
    emoji are line icons (`Ic` in `solve.jsx`); every control that takes a tap is 40 px.
- **Checked:** Playwright scan of every element in the island, in the description view and after Submit: no serif or italic text, no
  hard shadows, no marigold fills, no tap target under 40 px (after the last rule). Screenshots, dark and light, of the description,
  Your answer, Hints, Submissions, Solution, results and replay. `npm test` 450, `check:next` 72.
- **Not done yet in phase 2:**
  - The problem card sits beside the canvas, not over it (no fit-around work in `Canvas.jsx`).
  - Replay still uses the bottom sheet, not a HUD at the top right with the scrubber along the bottom.
  - "Break it yourself" is the legacy disclosure, not a row of `.btn.light.sm` buttons.
  - The inspector and minimap were not checked open.
  - No screenshots are attached to the PR.
- **Ledger:** `frontend_git_commits` 1172 → 1173 (`78d0c20`).

## Update 2026-11-23: phase 3 of 49 (Replay in 3D; on #378's branch)

- **What changed:** a 2D | 3D control in the replay's and ▶ Watch's header. 3D replaces the canvas area with the 3D site's engine
  (`/3d/scripts/world.js`, loaded at run time) drawing the learner's own design as the landing's models.
  - Colour comes only from state at the minute on the scrubber: ok, busy (70 % and over, amber), down or over its limit (coral).
  - A part that crashes in that minute is taken apart once, and only when the minute moves forward (scrubbing inside the outage or back
    to minute 0 does not repeat it).
  - Failover and cache warming show on the labels; a queue's backlog fills; request paths run; the camera frames the design once.
  - Watching a request lights the part it is at and dims the rest.
  - `site3d/scripts/replay3d.js` (`systemOf`, `stateAt`, `stateOfHop`) is plain JS with tests; `src/solve/replay3d.jsx` is the canvas side;
    the choice is kept in `tk-replay-view`. With no WebGL, 3D is off with "3D needs WebGL". Off the 3D site the toggle is not shown.
- **Checked:** Playwright on the URL shortener solution, test "A zone goes dark": minute 0 is all green with dots running; at minute 10 the
  Link service shows 102 % · 21× in coral and the cache and database say DOWN; back to minute 0 restores everything; 2D → 3D keeps the
  minute; Watch in 3D lights the current hop; with `--disable-webgl` the 3D option is disabled with its reason. No script errors.
  `npm test` 455, `check:next` 72, the phase 1 browser checks pass.
- **Deviations from the instructions:** a cache's warm-up is a label, not a fill (the engine's fill is for queues); the labels are named
  by the catalogue when the learner has not named a part.
- **Not checked:** 40 fps for a 30-part design on a mid phone (no phone to measure on); the phone layout of the 3D view (phase 4).
- **Ledger:** `frontend_git_commits` 1173 → 1174 (`a6bc190`).

## Update 2026-11-23: phase 4 of 49 (the workspace on phones; on #378's branch)

- **What changed:** up to 900 px the canvas is the page and one thing shows at a time (`solve.jsx` narrow mode, `look-3d.css`).
  - **Brief:** a card (kicker, title, dek, test and hint counts, Start designing, Read the full problem) the first time a problem
    opens in a session, and only if there is no submission yet.
  - **Build:** a slim glass bar (title, Brief, Run, Submit, a menu with Your answer, Hints, Submissions, Solution, Ask, Reset, Timer), the
    canvas, the parts as a strip you scroll sideways, the inspector as a sheet.
  - **Run and replay:** the results as a sheet; the replay's 2D | 3D control works there.
  - **Description, Your answer, Hints, Solution, Submissions:** full-height sheets with a Done button. The Back gesture closes the open
    sheet first (a history entry per sheet; the 3D router ignores a move that keeps the address).
- **Checked:** Playwright at 412 × 915, 375 × 667 (light), 320 × 568 and 844 × 390 with touch: the brief covers neither the top nor the
  bottom bar, Run gives the sheet, Hints opens a sheet, Back closes it on the same page, Done returns to the build; no sideways scroll;
  every control at least 40 px; text at least 12 px; no script errors. `npm test` 455, `check:next` 72.
- **Left over:** the parts strip is a row of buttons, not the doc's bottom sheet of rows with a one-line description and a fold handle;
  the 3D replay's framing on a narrow screen is only roughly centred.
- **Ledger:** `frontend_git_commits` 1174 → 1176 (`0126a7c`, **and one wrong row**). I inserted a row by mistake with
  `key: "0126a7c0000000000000000000000000000000000"`, `value: "placeholder"`, then tried to delete it; the delete tool asked the owner a
  question and timed out. **The owner must delete that one row** (or tell the next session to).

## Update 2026-11-23: phases 5 and 6 of 49 (the whole site is the 3D site; on #378's branch)

- **Phase 5 (`7e1a03d`):** You (`pages/you.js`), Quick Notes with Numbers worth knowing as an island, Privacy and Terms, the not-found page, the old
  `/dashboard/…` links (`legacy.js`, ported with its test cases), search (`search.js`: Ctrl or Cmd K, "/", the sidebar and top bar buttons, a fifth item in the
  phone bar that fits 320 px). `OWN` now matches every path except files, `/3d`, `/analytics`, `/health` and `/_vercel`; `404.html` is the 3D shell.
  Found on the way: the legacy `status.css` and `styles.css` leaked global rules (a bare `.st`, `html`, `body`) once an island loaded; `island-scope`
  now scopes them.
- **Phase 6:** the React app is deleted (see `50-3D-MIGRATION-DONE.md`). `next/` is kept as the islands package. `hosting/switch.mjs` writes the 3D shell at every
  address from the content folder and `hosting/pages.mjs`; `npm run build` no longer builds the React app. CI: "Islands - typecheck, lint, tests"
  (`check:islands`) and an end-to-end job that builds the whole site, serves it with `hosting/serve-local.mjs` and runs `next/e2e` (every address, the lock
  signed out, a problem run, submitted and replayed in 2D and 3D, Back, search, the theme switch, a phone pass, axe).
- **Checked:** Playwright on the local build for phases 1, 4 and 5 after the deletions; `npm test` 460; the islands package: typecheck, lint, 4 unit tests.
- **Ledger:** see `50`; the stray row is still there.

## Update 2026-11-23 (night): the design canvas in 3D, with a 2D switch (the owner's addition; `cc98228`)

- **The owner asked:** the components a learner drags and drops while solving an interview question should be 3D too, with a switch between 3D and 2D, and everything premium.
- **What changed:**
  - `src/lab/design3d.jsx`: the learner's own parts as the 3D site's models on a floor, in the design canvas. Drag a part to move it; click to
    select (the inspector opens as before); Connect joins two parts; drag from the palette to put a part down; drag the floor to pan; scroll or
    pinch to zoom; Fit; Delete. It edits the same design as the 2D canvas (`Canvas.jsx` owns the nodes and arrows).
  - A 3D | 2D switch in the canvas bar, kept in `tk-design-view`. 3D is the default where there is WebGL and the page is the 3D site; 2D is the flat canvas as before.
  - `src/lab/thumb.jsx`: 3D thumbnails of every part, rendered once per theme with the engine and cropped, in the palette, the drag ghost and the cards on the 2D canvas.
  - `world.js` gained `pickAt`, `groundAt` and `getCamera`.
- **Checked:** Playwright on desktop and a 412 × 915 phone, dark and light: the 3D canvas draws the URL shortener's five parts, a part dragged from the palette lands
  on the floor (5 → 6 parts), the switch to 2D shows the flat canvas and back; all 14 palette tiles get a thumbnail (slowly under software GL, quickly with a GPU);
  the phase 1 and 4 browser suites still pass; no script errors.
- **Not checked:** moving a part and Connect by hand-driven pointer input (the code paths are written and the dropped part moved with the design, but the tests did not
  drag a part on the floor or join two); the 3D canvas on a real touch phone; frame rate with a large design.
- **Ledger:** `frontend_git_commits` 1176 → 1178 with `cc98228` (and the one wrong row still there).

## Update 2026-11-24: the open items closed (`83e098b`)

- **Replay HUD:** time, traffic, errors (coral above 1 %) and p99 for the minute, a glass dock at the top right of the canvas (`ReplayHud` in `src/solve/v2.jsx`).
- **Break it yourself:** a row of one-tap fault buttons.
- **Phones:** the parts strip has a handle that opens it as a sheet of rows (tile, name, two lines on what it is) above the bottom bar.
- **3D canvas:** a refused arrow says why; moving a part, Connect, Delete, the 3D | 2D switch, the HUD and Break it yourself are covered by `next/e2e/design.spec.ts` (2 passed).
  Checked by hand-driven mouse input: a part dragged 120 px moved its card, Clients → Link service made an arrow, an invalid pair was refused, Delete removed a part and its arrows.
- **Still open:** see `50`. **Ledger:** `frontend_git_commits` 1178 → 1179 (`83e098b`); the one wrong row is still there.

## Update 2026-11-24: the problem card floats; the scrubber is pinned (`ce56c5b`)

- Wide screens: the canvas fills the whole area and the problem card floats over it as a glass panel; the parts column sits to its right, results and replay beside it.
  `Canvas.jsx`'s fit and the 3D canvas's camera leave room for both (a ResizeObserver on the card and the parts column, so dragging the divider refits); a part dropped over the
  card is ignored. The replay's scrubber is sticky along the bottom of the results sheet.
- Found by the browser pass: the results sheet had been under the card; it now sits beside it.
- Checked: the whole end-to-end suite (27 passed, 1 flaky under parallel load: the workspace mount wait is now 40 s; it passes alone, twice), `npm test` 460, islands check.
- **Ledger:** 1179 → 1180 (`ce56c5b`). The wrong row is still there: my delete asked for the owner's confirmation twice and timed out both times.

## Update 2026-11-24: merged and live (#378, merge `5d6789c`)

- **Merged** after every check on `08eec9f` was green: Test and build frontend, the real site end to end (desktop and phone), Test backend, Build and run API container, CodeQL. Vercel deployed `main`;
  the backend is unchanged, so no "Deploy backend" run was needed.
- **A CI bug found at the last minute:** my edit to `.github/workflows/frontend.yml` had an unquoted colon in a step name, which made the file invalid YAML, so the frontend jobs did not run on the
  last three commits (only the backend and CodeQL ran). Fixed in `08eec9f`; the frontend jobs then ran for real and passed. Lesson: after editing a workflow, parse it (`python -c "import yaml…"`) and check that its jobs appear on the PR.
- **Live check** (Playwright against tech.katta.cc, desktop and a 412 × 915 phone): the workspace is a 3D page and locked signed out with no island loaded, `/me`, `/privacy`, `/learn/quick-notes`, a lesson,
  an unknown address (404 page) and an old `/dashboard/…` link all land correctly, search opens, no script errors; `/analytics` and `/health` still answer.
- **Ledger:** `frontend_git_commits` 1182 (with `08eec9f` and the merge `5d6789c`); the one wrong row is still there.
- **Not checked live:** a signed-in workspace (needs a real Google sign-in).
