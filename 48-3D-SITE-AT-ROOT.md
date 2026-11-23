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
