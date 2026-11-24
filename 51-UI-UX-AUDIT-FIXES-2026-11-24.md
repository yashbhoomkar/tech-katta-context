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
