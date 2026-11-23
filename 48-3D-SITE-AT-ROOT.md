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
