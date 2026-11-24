# 52 — Sign-in gating, text locked, 2026-11-24

App PR (draft, not merged): see the link in the handover. Branch `ccr-gating-text-locked` of the app and of this repo.

## The owner's rules, as built

| Who | What they get |
|---|---|
| Everyone | the landing page, Terms, Privacy, the not-found page; the list pages (Learn hubs, Problems, Simulator): titles, one-line summaries and tags only |
| Signed out, an article | its header (label, title, subtitle, read time), its first 2 paragraphs (≤150 words) fading out over 120 px, the section names dimmed with a lock each, then an inline card "Sign in to keep reading" |
| Signed out, a problem or challenge (and a Simulator scenario) | title, difficulty, the first lines of the brief, then "Sign in to design this" |
| Signed out, /home and /me | the sign-in card in place of the personal content |
| Signed in | everything, as before |

The card shows the terms checkbox and the "Sign in with Google" button together; the button is inert until the box is ticked. There is no pop-up on load or on scroll. A small dialog with the same card opens only for a gated action (Run, Submit, Play the story, Mark complete) and "Not now" closes it. "Sign in" is always in the phone top bar and the desktop sidebar. After sign-in the same page opens in full at the same scroll position.

## Where the text is held back

- **API** (`backend/src/content/public.js`, `server.js`, `practice/routes.js`): without a valid session cookie, `GET /v1/articles/<slug>` returns the public part (`locked: true`), `GET /v1/lab` the challenges' id, title, level and brief lines, `GET /v1/practice/problems/<slug>` the title, difficulty, topics and brief lines. `/solution`, `/wrong` and `GET /v1/stories` are a 401. Submit, the judge, the interviewer's review, the editorial, a user's submissions and `/v1/me/lab` were already a 401 (503 when the API runs without sign-in configured). `/v1/site` no longer carries the worked example. Responses that depend on who asks are `private`, `Vary: Origin, Cookie`, and readable with credentials only from the site's own origin. A database error counts as signed out.
- **The 3D stories**: the words and sentences of the story steps (216 properties, 108 sentences) were in `figures.js`. They are now `content/stories.json`, served by `GET /v1/stories` to a signed-in session and put back into the figures in the browser (`applyStories`); signing out takes them away.
- **The article figures** (`frontend/src/figs`, about 260 SVG components with captions and descriptions) were lazy chunks in the islands: public files. The islands no longer carry them (vite `tk-no-figures`): a figure block is its caption, as on the 3D article page. This changes the problem workspace's reading pane for signed-in readers: no SVG figures there. To bring them back they would have to be served by the API behind the session.
- **The old React app's lazy chunks** (its article pages and figures) were still in `dist/assets`; the build now keeps only what the analytics and health pages load.
- **Pre-rendered HTML** (`seo.js`): the public part only (2 paragraphs, section names; a problem's brief); no paywall structured data (`isAccessibleForFree`, `.tk-locked` are gone). Canonical links, the sitemap (all 66 articles, 22 of them problems) and indexing are unchanged.
- **When the API cannot be reached**: nothing unlocks. `account.js` reports `unavailable`; the page keeps the public part (the page's own HTML on a first load, the list's header otherwise) and the card says "Sign-in is unavailable right now. Please try again in a few minutes." A local-development flag exists in two places and is off by default: `OPEN_CONTENT=1` on the API (ignored when `NODE_ENV=production`; `.env.example`), and `localStorage tk-dev-open=1` on localhost in the browser.

## Checks run

| Check | Result |
|---|---|
| `npm test` backend | 153/153 (new `test/gate.test.js`: 8 cases with a real MongoDB and a stand-in for Google's keys: public part, no deep sentence, no hint/test/reference, 401s, a bad cookie, a signed-in session, sign-in off, OPEN_CONTENT ignored in production) |
| `npm test` frontend | 460/460 (gate cases rewritten: sign-in unavailable never opens a page) |
| `npm run check --prefix next` | passed |
| Leak check (`frontend/hosting/leak-check.mjs`) | 1,307 probe lines (a sentence from deep in every article, every problem's hints and editorial, every challenge's hint, every story sentence; not ones that are public anyway): none in any of the 197 built files and none in the 80 API responses asked without a session. Before the figure and old-chunk changes it found one article sentence in a figure chunk |
| Raw HTML by `curl` | 5 articles and 3 problems: the title and public part are in the HTML, no deep sentence and no hint |
| Browser, signed out (Playwright, local build, 390×844 and 1366×860, dark and light) | 128 checks passed: each page type shows only its public part, the fade, the locked headings and the inline card; no pop-up on load or after scrolling; gated actions open the dialog and "Not now" closes it; "Sign in" in the top bar and the sidebar; the Google button visible next to the checkbox (Google's script was stubbed: it cannot load in the sandbox); lists show titles and summaries only |
| Browser, API stopped | see the report in the PR |
| e2e (`frontend/next`, CI settings) | 28/28 (27 first; one test still expected /home open and was rewritten) |

## Not tested here

- A real Google sign-in: the Vercel preview cannot test it (the API refuses the preview origin), and the sandbox cannot load Google's script. The first real check is on production after the deploy.
- The CI workflow: it now installs the backend too, because the e2e job starts two local copies of the API (gated, and open as a stand-in for a signed-in visitor, `e2e/api.ts`).

## Deploy order and notes

1. Deploy the API first, and copy `content/stories.json` into the VPS content folder (`/var/lib/tech-katta/content/current`). Until the new API is live the site still works (it draws what the API sends); until the folder has the file, signed-in readers get no story text.
2. Then the site. `OPEN_CONTENT` must not be set on the VPS.
3. Open question for the owner: Quick Notes' "Numbers worth knowing" is public site copy (`site.json` `numbers`) on a public list page; it was left open.
