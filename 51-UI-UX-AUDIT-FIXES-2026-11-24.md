# 51 — UI/UX audit fixes 2026-11-24

App PR (draft, not merged): https://github.com/yashbhoomkar/tech-katta/pull/379, branch `ccr-0662d069-8yxchr`.
Commits: A `ef84f633cc3598ffd49a008321166261735c09f3` (1–3) · B `1f01eb0dd2863ff384215a78ed9d85596c4eca15` (4–7) · C `ebbf9a6bf440f9ad9604e581ff7d0b6c1bc681d7` (8–11) · D `b3f288d99ebe96ef4404195f6c3b57af4d200038` (12–15). Recorded in `techkatta_history.frontend_git_commits`.

| # | Item | Status | Commit |
|---|------|--------|--------|
| 1 | Phone tab bar solid, safe-area padding | fixed | A |
| 2 | Sidebar Sign-in slot present from the first draw | fixed | A |
| 3 | Locked problem/challenge pages: no rail collapse, centred card, one h1 | fixed | A |
| 4 | Challenge tab title = challenge name | fixed | A |
| 5 | One URL per page (canonical link, redirects, no trailing slash) | fixed; host redirects checked in `vercel.json` only, not on a deployment | B |
| 6 | Light-theme contrast of "New here?" / "Take the tour" | fixed | B |
| 7 | Phone tour pop-up no longer covers hero text/CTAs | fixed | B |
| 8 | One left edge; reading pages max 760px | fixed | C |
| 9 | Normal-case labels | fixed | C |
| 10 | One control radius (`--r-s` 10px; segmented frame 14px) | fixed | C |
| 11 | Numbers text ≥12px, site fonts | fixed | C |
| 12 | 44px tap targets on phones (landing chips, tour, breadcrumbs, footer) | fixed | D |
| 13 | Quiet note for an empty 3D preview | fixed; in my runs the panels were filled, so the note was only checked by emptying one by hand | D |
| 14 | Article loading header the same size as final | fixed for height (166/100px match); the top edge differs (97 vs 260px on desktop) | D |
| 15 | Dashboard intro width capped (560px) | fixed | D |

## Tests
`npm test` (frontend) 460/460; `npm run check --prefix next` pass; Playwright scripts per item at 1366×860 and 390×844, dark and light. Not run: e2e under `frontend/next/e2e`; Vercel redirect behaviour on a deployment.

## For the owner
- Item 5 canonical choice (no trailing slash; `/learn`→`/learn/concepts`; `/dashboard/problems`→`/problems`).
- A placeholder row was inserted by mistake in an earlier session and delete-many timed out; it still needs deleting.

## Follow-up round (owner's review of PR #379), items F1–F6

Commits: E `b30b6ffe237fe4723e204ce1d7a85f81a52f1bb0` (F4, F5) · F `49b8586783eb7a6c9aa295ac217550851c61d221` (F3) · G `fd09f88370f664f08a5336e41f419c6a2258ed0a` (F1, F2) · H `91a08411e1bfb26621548798c3c31ac537614f6a` (F6). Recorded in `frontend_git_commits`.

| # | Item | Status | Commit |
|---|------|--------|--------|
| F1 | Breadcrumb: slash and current page level with the 44 px links | fixed; Playwright checks every item's centre line on Terms, a problem, Learn and an article, phone and desktop, dark and light | G |
| F2 | Article header jump; CLS on pages | fixed. The loading header is now the finished layout (hero step, label, title, dek, meta line, buttons): h1, label, breadcrumb and button tops are equal before and after on both articles, phone and desktop, dark and light, with the article fetch delayed 2 s; CLS 0. Terms, Privacy and Quick Notes loaders match their final headers. The real cause of the shifts on /me, /terms and /learn/quick-notes was the page sliding in as the sidebar's padding transition ran at first paint: the transition now runs only when someone folds the sidebar. CLS ≤0.002 on all five pages, phone and desktop, dark and light | G |
| F3 | One h1 in the problem workspace | fixed: the canvas heading and the phone brief heading are h2. One h1 on /problems/url-shortener and /problems/sandbox. On a phone the one h1 sits in the description column, which is not shown in the canvas view; the visible title there is the brief's h2 | F |
| F4 | /dashboard/learn/<section>/<slug> and other deep links | fixed in `routes.json` / `vercel.json` (308 for /dashboard/learn, /dashboard/simulator, /dashboard/home, /dashboard/me and their sub-paths) and in the client fallback (`legacy.js`, with a test). /dashboard stays /home. Host redirects are not tested on a deployment | E |
| F5 | /learn/ and /dashboard/problems/ in one hop | changed, not testable here: the global `trailingSlash:false` is removed because Vercel redirects /x/ to /x before our own redirects (that was the second hop); each moved address is listed with and without the slash. Pages without a rule now answer at both /x and /x/, with the canonical link and the address-bar clean-up already in place. Needs a check on the preview (curl -I) | E |
| F6 | Dashboard/Concepts/Simulator labels | The labels were already positioned with transform. CLS on /home, /learn/concepts and /simulator is 0 (also with the CPU slowed 4x), so I could not reproduce 0.18; the likely cause was the sidebar slide (F2). The "Users" label no longer lies over the intro text (labels stay right of the text column; scene moved a little right). Concepts and Simulator showed no overlap | H |

Tests this round: `npm test` 461/461; `npm run check --prefix next` pass; Playwright scripts on a local build at 1366×860 and 390×844, dark and light (breadcrumbs, h1 count, article loading header, CLS with a PerformanceObserver, label overlap). The preview cannot test sign-in or the lock (the API refuses its origin and the site unlocks), so those were not tested there.
