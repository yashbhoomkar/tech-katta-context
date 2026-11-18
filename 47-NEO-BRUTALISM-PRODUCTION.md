# 47 — Neo-brutalism in production (2026-11-18)

Owner, 2026-11-17: "Now we need to change the frontend of tech.katta.cc. We are going to replace it with one of the
prototypes that we had created, i.e. neo-brutalism. I showed it to 2 people and they liked it. One gave the review that
it is good but it gives too much of a gamified feeling. Think on this. Write the code. Merge it. Deploy it. Also there
are a lot of UI/UX inconsistencies in the current prototype of neo-brutalism." Done by the scheduled run of
2026-11-18 06:00 IST, unattended; every decision below was taken in that run.

## 1. Why it felt like a game, and what changed

The style's strengths are hard edges, flat colour, strong type and honest borders. The game feeling came from things
added on top: objects that tilt, bounce and slap, sticker labels, confetti, and loud type everywhere. Seen on the
built pages (landing, Home, Learn, a lesson, Problems, the workspace, You), in light and dark, desktop and phone.

| Element | Decision | Why |
|---|---|---|
| Tilted cards, stickers, chips and marks (−4° to 3°) | **Removed**: everything stands straight | A tilt says "toy"; straight edges say "tool" |
| Floating, rotating shapes on the landing | **Removed** | Decoration with no meaning |
| Sticker labels ("START HERE", "YOUR PROGRESS", "PROBLEM OF THE DAY") on marigold or white with a border | **Calmed**: plain mono labels | Labels inform; they don't need to shout |
| "Slap" arrivals, bounces, overshoots, stamps that spin, the hero's words dropping in | **Calmed**: fade in with a short move, ease-out, no overshoot | The motion rules (/p/motion/) already say no bounce |
| Confetti on Mark complete | **Removed** (the tick and the chip say it) | The clearest game cue |
| Stepped, counter-like bar fills and hopping chips | **Calmed**: smooth fills | Steps read as a score counter |
| Page change shutter in steps, theme change roll-up | **Calmed**: 160–200 ms fade | Fast and quiet |
| Hard shadows 4–6 px | **Calmed**: one 3 px shadow | Still brutalist, less shouty |
| Halftone dots on the big coloured blocks | **Removed** (kept only as the track inside the small path figure) | Visual noise |
| Lesson title with a marigold text shadow | **Removed** | The reader must be calm |
| Toast as a tilted marigold sticker; tour card in lime | **Calmed**: surface colour, border, plain | |
| "This week" day boxes on Home | **Kept, quiet**: shows the days you studied; no streak count, flames or badges. The tour points at it | A gentle record is useful; streak pressure is not there |
| Progress counts (0/21), "Challenge stars" | **Kept** | Factual progress, not a game |
| Section colours (round 3, half saturation), flat colour blocks, 2 px borders, one hard shadow | **Kept** | The style itself |

**The two open questions in TRIED.md, settled:**
- Loud everywhere or a calm reader: **calm everywhere**, with colour kept for section blocks and buttons.
- Archivo Black or Space Grotesk headings: **neither: Archivo Bold** (700), already loaded. It keeps the style's
  weight without Archivo Black's poster shout, and adds no font download.

## 2. The UI/UX audit

Every main route (landing, Home, Learn, a section, a lesson, Quick Notes, Problems, a problem workspace, the sandbox,
You, Privacy, a not-found page) at 1440×900 and on a Pixel 7 and an iPhone 13, light and dark, with screenshots looked
at, plus checks in the browser: sideways scroll, controls smaller than 44 px, and axe colour contrast.

| Finding | Fix |
|---|---|
| Tilts on some components and not others (section labels, mini path mark, error scenes, 404 label, tour button on phones, landing cards) | All tilts removed (§1) |
| Halftone on some coloured headers (Problems, landing bands) but not on others | Removed everywhere |
| Display face at weight 400 in some places, 700 in others | One rule: `--display` (Archivo) at 700 everywhere |
| Shadows of 2, 4, 5 and 6 px | `--sh-d` 3 px, `--sh-lg` = `--sh` |
| Control heights of 32, 33, 34, 38, 39, 40, 41 px from page to page (Tour 34, reader tabs 33, sandbox fields 34, Share 39, Begin 41 …) | One token `--ctl-h`: 40 px with a mouse, 44 px on touch screens, for buttons, selects, tabs and text fields |
| Tap targets under 44 px on phones: search and back (38), Tour (34), reader tabs (33), workspace bookmark (32), mock interview (32 tall), "+ Add a failure" (15) | `--ctl-h` 44 px and a 44 px minimum width on touch screens |
| Contrast | No failures (axe, every route, light and dark); the e2e suite's WCAG 2.1 AA checks pass |
| Sideways scroll on phones | None on any route |
| Page errors | None |

**Known, left for later:**
- On phones, the floating Tour button covers a line of text on workspace pages. It is the only way into the tour
  there, so it stays.
- The workspace's breadcrumb ("Problems/Q10") is larger than the reader's.

## 3. The switch

- **Code:** PR #367's work (`new-frontend-beta`: `frontend/next`) merged onto `main` without conflicts, plus this
  run's changes.
- **Build** (`frontend/package.json`):
  - `npm run build` = `vite build` (the old app: still built for the analytics and health pages) + `build:next`
    (`frontend/next` at `BASE_PATH=/` with `VITE_STYLE=neo-brutalism`) + `hosting/switch.mjs`.
- **`hosting/switch.mjs`:**
  - removes the old landing and dashboard shell;
  - copies the new app to the root and drops its `noindex`;
  - writes the old article pages' SEO content at the new addresses (title, description, canonical, Open Graph,
    JSON-LD, crawlable preview: `seo.js`, now with `useAddresses("next")`);
  - rebuilds `sitemap.xml` and `llms.txt` for the new addresses;
  - serves the new app's shell at `/dashboard/`, so old `#key` links still work.
- **Addresses** (`hosting/routes.json` → `vercel.json`): permanent (308) redirects
  - `/dashboard/<section>/…` → `/learn/<section>/…` (5 sections);
  - `/dashboard/problems/…` → `/problems/…`, `/dashboard/practice/…` → `/practice/…`, privacy and terms;
  - `/next/…` → `/…`;
  - the older redirects (`/dashboard/lab/…`, retired articles) still apply first and chain on.
  - `/assets/*` is cached for a year (immutable).
- **Kept:** `frontend/src` (the new app imports its figures, workspace, judge, account, analytics); the analytics
  page; health; Vercel Web Analytics (the new app renders the same component).
- **Tests:**
  - frontend 438/438 (new: the redirects, `nextPath`);
  - `frontend/next` check 70/70 and e2e 70/70 (both looks, WCAG AA);
  - backend 145/145.
  - The full production build was served with a Vercel-like router and checked in a browser: old addresses, hash
    links, the workspace's Run and Submit, the sign-in button, the analytics page, a real 404.

## 4. Rollback

Vercel → the tech-katta project → Deployments → the last deployment before this merge → Instant Rollback. Or revert
the squash commit on `main` (Vercel redeploys the old app). The redirects live in the same commit, so either way the
old addresses work again.

## 5. Follow-ups

- **Retire the old shells:** remove the old landing and `dashboard/index.html` entries from `vite.config.js` (still
  built, then discarded); keep `analytics/`.
- **Prototype site:** the `prototype` branch still builds the old app at `/` and `/p/next`, `/p/neo-brutalism`;
  bring it in line when convenient (its Cloudflare `_redirects` has a 100-dynamic-rule limit: mind the new `*` rules).
- **Search Console:** submit the new sitemap.

## 6. Merged, deployed, verified (2026-11-18, 06:20–06:45 IST)

- **PR #372** (`neo-brutalism-production`): CI all green (frontend tests and build, the new frontend's e2e for every
  look, backend, API container, CodeQL). Before merging, the Vercel preview of the branch was checked with the same
  browser checks (real Vercel routing). Squash-merged as `bbf81cd`; production was serving it about a minute later.
- **Rollback target noted before the merge:** Vercel deployment `dpl_G56aGsUkkUm4TBYNYe2WznmP67sP` (main `7c53c7a`).
- **Checked on https://tech.katta.cc:**
  - addresses: `/`, `/home`, a lesson and `/problems/shared` answer 200; `/dashboard/concepts/caching/` → 308 →
    `/learn/concepts/caching/`; `/next/learn` → `/learn`; `/dashboard/#practice/url-shortener` and
    `/dashboard/#concepts/sharding` open their new pages; `/analytics/`, `/health`, `sitemap.xml`, `robots.txt` and
    `llms.txt` answer; an unknown address answers 404;
  - no `noindex` on production, and canonical links point at the new addresses;
  - every main route on desktop and Pixel 7, in light and dark: no sideways scroll; axe colour contrast finds no
    failures (light and dark);
  - Sign in: the dialog opens and, after the terms box, Google's button loads (no console errors);
  - a signed-out visitor opening a problem sees "Sign in to open this", the same rule as before; the workspace's Run
    and Submit were checked on the local build and in the e2e suite;
  - the API's health: ok.
- **Ledger:** `0842bac`, `f809456` and the squash `bbf81cd` in `frontend_git_commits` (count 1086).
- **PR #367** is superseded by #372 (its code is included); left open for the owner to close.
