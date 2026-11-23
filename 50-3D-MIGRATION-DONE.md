# 50: the 3D migration is done: what was removed, and where each old feature lives now

Written 2026-11-23 at the end of the migration planned in `49-3D-MIGRATION-INSTRUCTIONS.md`. Every address of tech.katta.cc is a 3D page. The React app
(pages, router, looks) is gone; its canvas, judge and practice remain as islands inside 3D pages.

## The pull requests

All of it is on one branch (`ccr-0662d069-8yxchr`) and one draft PR (#378, which began as phase 1): the phases were not split into separate PRs because
the session could push to that branch only. Phase 0 was #377 (merged). The commits, in order: phase 1 `bcea567`, phase 2 `78d0c20`, phase 3 `a6bc190`,
phase 4 `0126a7c`, phase 5 `7e1a03d`, phase 6 (this) in the next ledger row.

## What was removed

- `frontend/next/src/pages/*`, `components/layout/*`, `app/*` (the router, providers, route error), `main.tsx`, `index.html`, `vite.config.ts`.
- The React-only components: the command palette, overlays, tours, sign-in dialog, account menu, shortcuts, locks, toasts, page transitions.
- The `default` and `neo-brutalism` looks and `scripts/look.mjs`; every `neo-brutalism` block in the remaining CSS modules; `lib/look.ts`, `lib/site3d.ts`,
  `VITE_STYLE`, `VITE_SITE3D`; `postbuild.mjs` and the `hints` script.
- The React app's own copies of the content model, steps, ticker, search, progress and analytics (`lib/progress.ts` stopped being a second writer of
  `tk-progress-v1`; the 3D store still reads old per-slug records once).
- The React app's unit tests (they tested the deleted code) and its Playwright suite. The two ported pieces kept their cases: `gate.ts` →
  `site3d/test/gate.test.js`, `legacy.ts` → `site3d/test/legacy.test.js`. `lib/analytics.ts`'s `pageOf` → `site3d/scripts/analytics.js` (`analytics.test.js`).
  The React app's search had no test that moved.
- `build:next` and `check:next` (now `build:islands`, `check:islands`).

## Where each old feature lives now

| Old (React app) | Now |
|---|---|
| Landing, Dashboard (Home), Learn, lessons, the simulator | 3D pages (earlier work, `48`) |
| Problems list | `site3d/scripts/pages/problems.js` |
| Problem workspace, challenges, sandbox, shared designs, practice | `pages/workspace.js` + the islands (`next/src/islands`) |
| Replay | the island, with a 2D \| 3D choice (`src/solve/replay3d.jsx`, `site3d/scripts/replay3d.js`) |
| You (`/me`) | `pages/you.js` |
| Quick Notes, Numbers worth knowing | `pages/notes.js` + the `mountNumbers` island |
| Privacy, Terms | `pages/policy.js` |
| Not found | the router's "Nothing runs at this address"; `dist/404.html` is the 3D shell (status 404) |
| `/dashboard/…` and `/dashboard/#key` | `site3d/scripts/legacy.js` in the router, with the host redirects in `routes.json` |
| Sign-in, account sync | `/3d/legacy/legacy.js` (`src/account.js`), `signin.js`; the islands use the same instance |
| The content lock | `gate.js`, `gating.js`, `signin.js` |
| Usage events, Vercel Web Analytics | `analytics.js` through `/3d/legacy/legacy.js` |
| Search (⌘K, the phone Search tab) | `search.js`, a fifth item in the phone bar |
| Theme | `tk-theme`, dark by default (`app.js`); islands follow `<html data-theme>` |

## Open items

- **The ledger has one wrong row** (`key: "0126a7c0000000000000000000000000000000000"`, `value: "placeholder"`). The owner must delete it.
- A real Google sign-in has not been tried by any phase; try it on the preview.
- Phase 2: the problem card sits beside the canvas (not over it); Replay's HUD at the top right; "Break it yourself" as buttons; the inspector and minimap not
  checked open; no screenshots on the PR.
- Phase 4: the parts strip is a row, not a sheet of rows with descriptions; the 3D framing on a narrow screen is rough.
- Phase 3: 40 fps for a 30-part design on a phone was not measured.
- `frontend/src` still builds the old app for `/analytics` and `/health`; the old app's other pages are no longer served.
