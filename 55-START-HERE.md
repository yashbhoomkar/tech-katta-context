# 55: Start here (the current truth, 2026-11-28)

Read this file first. It replaces the long scroll of `17-SESSION-HANDOVER.md` as the entry point and says what is true **now**. Older docs (00–54) keep their history. Where they disagree with this file, this file wins, and the newest dated entry in `17-SESSION-HANDOVER.md` wins over this file.

This repository is **public**. Never put credentials, tokens, keys, MongoDB URIs, user data, usage numbers, revenue or business plans here. Usage figures and business notes go in the private repo `yashbhoomkar/tech-katta-private` (`notes/`).

---

## 1. What Tech Katta is now

- **https://tech.katta.cc** is a **system design interview practice lab**. You draw a design on a canvas, it is run against traffic, failures and a budget, and the tests say what broke and why. Replay in 2D and 3D. There are also articles that teach the ideas.
- **Audience:** Indian engineers preparing for interviews, mostly on phones. Indian context everywhere: ₹, lakh, crore, UPI, IRCTC, IPL. The fictional example company is **Zotato** (food delivery).
- **Free while in beta.** Sign-in is **off by default**: every page, article and problem opens signed out (#401). Signing in only syncs progress across devices.
- **No personal branding.** No author name, photo or credentials anywhere (owner, 2026-11-27). No pricing, payments or "Pro" badges until the owner's employment approval is settled. Never mention any employer on the site.

## 2. The owner's standing preferences (follow them without being told)

1. **"Use common sense"** (Rule 0b): build what a real person on a real phone would obviously expect, and test it end to end against the real service before saying it works.
2. **"Take decisions yourself."** Don't stop to ask about things with a sensible default. Decide, do it, and say what you decided. Ask only about things that are truly the owner's (money, accounts, DNS, legal, brand).
3. **Seamless, smooth, uncluttered, premium.** The owner dislikes tab clutter: put new things under existing areas (Learn, Solve, Home), never as a new top-level tab.
4. **Keep the landing hero exactly as it is**: the owner likes it. Add sections below it if needed.
5. **Design freeze:** reuse existing classes, tokens and components. No new colours or fonts.
6. **Plain English.** Short sentences, everyday words, in the site's copy, PR descriptions and replies to the owner.
7. **Facts must be right.** A number about a real company or system needs a real public source you actually fetched. Otherwise call it a model figure ("assume", "a model evening"). Never invent a link, a testimonial or a statistic.
8. **The owner is often on a phone.** Keep replies short, lead with the outcome, give links.

## 3. Repositories

| Repo | Visibility | What |
|---|---|---|
| `yashbhoomkar/tech-katta` | private | The app: frontend, backend, content. The implementation source of truth |
| `yashbhoomkar/tech-katta-context` | **public** | This repo: docs, decisions, handover, tools |
| `yashbhoomkar/tech-katta-private` | private | Business notes, usage data, the 27 Nov site review (`notes/site-review-2026-11-27.md`) |
| `yashbhoomkar/tech-katta-feedback` | public | Where the Report button files issues (BugDrop). Read its open issues at the start of a session |

Development branch for sessions: `ccr-e411b215-g2ezfk` (or the branch your session is told to use). Feature branches for child sessions are fine.

## 4. Architecture (as of main `c99e268`, PR #418)

### Frontend: `frontend/`, hosted on Vercel at `tech.katta.cc`
- **`site3d/`** is the whole site: plain ES modules, no framework. `scripts/app.js` routes by path (`history.pushState`).
  - Pages are in `scripts/pages/`:
    - `landing.js` and `landing-lab.js` (the live "fix the failing system" demo);
    - `me.js` (`/home`), `learn.js`, `article.js`, `problems.js`, `workspace.js` (the problem page shell), `sim.js`;
    - `start.js` (`/start`), `free.js` (`/free`), `changelog.js`, `drills.js` (`/drills`), `guides.js` (`/guides`);
    - `you.js`, `notes.js`, `policy.js`, `public.js`.
  - three.js is lazy (`world-lazy.js`, `world.js`, `replay3d.js`).
  - Shared pieces:
    - **`boot-theme.js`**: theme, plus `window.tkGet`, the shared API cache (one request per API address per page; #415);
    - `store.js` (browser progress: `tk-progress-v1`, `tk-subs-v1`);
    - `gate.js` / `gating.js` (the sign-in lock, open when `SIGNIN_REQUIRED=0`);
    - `account.js`, `analytics.js`, `weekly.js` (the incident of the ISO week), `solving.js` (`labHref`, `solveState`), `search.js` (Ctrl/Cmd K).
  - **Report button:** `feedback.js` (the blue right-edge tab), `feedback-ui.js` (popup with Quick and Visual tabs), `feedback-capture.js` (screenshot, vendored html-to-image, **PNG only**, ≤1600 px, <4 MB), `feedback-markup.js` (drawing tools), `feedback-core.js` (pure logic), `feedback-boot.js` (for /health and /analytics).
- **`next/`**: React islands: the canvas workspace, judge, Replay, practice. Built by `npm run build:islands`; typecheck, lint and vitest via `npm run check`. **E2E specs are in `next/e2e/`**: `site`, `navigation`, `design`, `phone-workspace`, `report-button`, `report-speed`, `perf-first-view`, `landing-lab`, `start-progress`, `free-sample` and others.
- **`src/`**: older React code still used by islands and tests: the judge, evaluator, lab, `tkd/` (Practice judge).
- **`hosting/`**:
  - `routes.json` is the source of the host config; generate `vercel.json` with `node hosting/emit.mjs vercel` after editing it;
  - `switch.mjs` writes the page shell at every address;
  - `pages.mjs` reads the problem list (also from the repo's `content/`, since #417);
  - `serve-local.mjs` is a local stand-in for the host.
- `npm run build` builds all three. `npm test` runs the node unit tests (≈500).

### Backend: `backend/`, at `https://tech-api.katta.cc` (Node 22, no runtime dependencies)
- `src/server.js` serves content from `CONTENT_DIR` (the repo's `content/` locally).
- Routes:
  - `/health`, `/health/live`, `/health/ready`;
  - `/v1/articles[/<id>]`, `/v1/site`, `/v1/lab`, `/v1/lab/engine`, `/v1/stories`, `/v1/practice/...`, `/v1/drills`, `/v1/guides[/<id>]`;
  - auth under `/v1/auth/...`.
- `src/content/` validates content: `validate*.js`, plus `scripts/check-content.mjs`.
- `src/practice/` is the Practice judge pool; `src/auth/` handles Google sign-in, accounts, events and admin; `src/ai/` is the interviewer (mock until the owner picks a model).
- Settings are environment variables:
  - `SIGNIN_REQUIRED` (0 by default via the deploy workflow), `NODE_ENV`, `PORT`, `CONTENT_DIR`, `FRONTEND_ORIGIN`, `ANALYTICS_ORIGIN`, `ADMIN_EMAILS`, `INTERNAL_EMAILS`, `JUDGE_WORKERS`, `OPEN_CONTENT`;
  - the secrets `GOOGLE_CLIENT_ID`, `MONGODB_URI` and `SESSION_SECRET` live only on the VPS and in GitHub secrets.
- `scripts/sweep-problem.mjs` checks the ten Practice problems' grids (all pass since #416); `scripts/analytics-clean-report.mjs`.
- Deploy: the **"Deploy Tech Katta Backend"** workflow runs on push to main when `backend/` or `content/` changes. It tests, deploys to the VPS and verifies. `/health` shows `content.release` as `<UTC time>-<short sha>`.

### Content: `content/` (JSON, served only by the API; the frontend has no copy)
- `articles/` (69 articles):
  - sections `concepts`, `components`, `interview-questions` (the canvas problems' articles), `real-systems`, `quick-notes`;
  - each article has `date` (shown as "Updated") and `sources` (filled on 22 articles).
- `problems2/` (the 10 Practice problems), `lab.json` (the canvas catalogue, traffic patterns, incidents), `site.json` (site copy, privacy text), `stories.json` (3D stories), `drills.json` (31 drills), `guides.json` (5 decision guides), `eval.json`, `examples/`.
- **Canvas problems: 25.** The original 22, plus UPI switch (Q23, Hard), Tatkal booking (Q24, Hard) and IPL live streaming (Q25, Medium). Counts are read from the API and never hard-coded. The URL shortener is the only free problem (the validator allows one).

### Data: MongoDB Atlas (project `6ac298d2a4428fd93e7b3f75`, cluster `Cluster0`)
- `techkatta_history`: the **commit ledger** (§7). Also `git_commits` (legacy; do not delete), `commit_ledger_duplicate_backup_20261011` and `ai_eval_responses`.
- `techkatta_app`: `users`, `sessions`, `events` (analytics), `submissions`, `practice_submissions`, `practice_credits`, `practice_ai`, `practice_ai_log`, `lab`.
- **Analytics:** automated traffic and the owner's devices are flagged, not deleted (#408). A browser with `localStorage tk-internal=1` is internal. Real usage is small; the figures are in the private repo.

## 5. How to ship a change (every PR)

1. Start from the latest `origin/main`. Open a **draft PR** with a plain-English body: what, why, how it was tested.
2. **Required checks:**
   - CodeQL, plus "Analyze (javascript-typescript)";
   - **"Test and build frontend"**;
   - **"The real site end to end (desktop and phone)"**;
   - when backend or content changes, also **"Test backend"** and **"Build and run API container"**.

   The 3D e2e specs can be flaky on busy runners. Rerun once, and never skip, disable or loosen a test.
3. To catch up with main, run `git merge origin/main`, a **normal merge**. Never force-push (the session's classifier refuses it anyway). Never rebase a pushed branch.
   - Use `git merge -s ours` only to join a remote branch whose content is **already in main** (for example, an old session branch after its PR was squashed). It keeps your files and lets you push without force.
   - Never use `-s ours` against main itself: that silently drops main's changes. It nearly lost #388 once.
4. Mark the PR ready, then **squash-merge with `expectedHeadSha`** set to the head you tested.
5. **Verify production:**
   - the frontend: `curl -s https://tech.katta.cc/ | grep -o 'tk-build[^>]*'` shows the new squash SHA (Vercel deploys main in about 2 minutes);
   - backend or content: `curl -s https://tech-api.katta.cc/health` shows the new `content.release`, and the API serves the new content.
6. **Write the ledger rows** (§7).
7. **Update this repo:** the newest entry at the top of `17-SESSION-HANDOVER.md`, the rows in `18-TODO.md`, `10-GIT-HISTORY.md`, and this file when something structural changes. Docs PRs in this repo can be squash-merged directly.

Commit trailers: end commit messages with the `Co-Authored-By` and `Claude-Session` lines your session is given, and PR bodies with the attribution footer. Never put a model name in commits, PRs or code.

## 6. Testing recipes

- **Unit tests:**
  - frontend: `cd frontend && npm test`, and `cd frontend/next && npm run check`;
  - backend: `cd backend && npm test`, plus `node scripts/check-content.mjs`.
- **Local site against a local API:**
  1. API: `cd backend && SIGNIN_REQUIRED=0 NODE_ENV=production PORT=8787 node src/server.js` (it serves the repo's `content/`).
  2. Site: `cd frontend && npm run build && node hosting/serve-local.mjs dist 4173 hosting/routes.json`.
  3. In Playwright, reroute `https://tech-api.katta.cc/**` to `http://127.0.0.1:8787`.
- **Playwright is pre-installed** in cloud sessions: `require('playwright')`; `chromium.launch()` needs no options. Don't install it again.
- The Report button does not draw for automated browsers. To test it, override `navigator.webdriver` to `false` with an init script.
- **Budget-phone profile** (the speed budget): 360×740, CDP CPU throttling 4×, 1.6 Mbps down, 150 ms RTT. Report the median of 3 runs.
  - Current main-content times (largest contentful paint) on production: `/` 2.1 s, `/home` 2.4–2.5 s, articles 2.3–2.4 s, `/problems` 2.15 s, a problem page 2.3 s.
  - `perf-first-view.spec.ts` keeps the problem page ≤ 4 s.
- **Any browser check against production must first set `localStorage.setItem('tk-internal','1')`** on tech.katta.cc, or it pollutes the owner's analytics.
- Screens to look at before shipping UI: 320 or 360, 402, 768 and 1366 px, in dark and light.
- **BugDrop's worker:**
  - `POST https://bugdrop.neonwatty.workers.dev/api/feedback`;
  - it accepts only a **PNG** data URL; JPEG gets `400 INVALID_SCREENSHOT`;
  - the e2e mock enforces the same.

## 7. The commit ledger (mandatory, Rule 4)

- Database `techkatta_history`. Each row is `{key: full 40-char SHA, value: "<what changed> (PR #N, YYYY-MM-DD)"}`. The `key` index is unique.
- **`frontend_git_commits`:** every commit of every app PR (branch commits, merge commits, and the squash).
- **`backend_git_commits`:** the non-merge commits and the squash that touch `backend/` or `content/`.
- **Always check that each key is absent first** (`find` with `{"key": {"$in": [...]}}`) and insert only the missing ones.
- **The helper:** `tools/ledger/ledger-rows.sh <PR numbers…>`, run inside a clone of the app repo. It prints both JSON arrays ready for `insert-many`. It reads branch commits from GitHub's `pull/N/head` refs, so it also works after the branch is deleted.
- **Child (worker) sessions cannot write to Atlas** (the permission classifier refuses). Tell them to end with a LEDGER list of full SHAs, and the parent session writes the rows.
- **Status 2026-11-28:** every commit of app PRs #386–#418 is recorded (audited with the helper; six #396/#397 rows and four #394 rows were added that day). Totals: `frontend_git_commits` 1329, `backend_git_commits` 783. PRs #348–#385 were recorded by earlier sessions and not re-audited.
- Context-repo commits are not recorded in the ledger. The ledger is for the app repo.

## 8. Working with child sessions (Sonnet 5.5 medium)

The owner asks for big work to be delegated to **Sonnet 5.5 at medium effort** ("Use sonnet medium 5.5 to complete all the things"). Rule 0 (no automatic agent workflow) still holds: start child sessions only when the owner asks, and never set up recurring agent loops. A one-off `send_later` check on a child you started is fine.

What works:
- **One child at a time, working through a queue of tasks in order, one PR per task** (owner: "Run them one after another"). This saves usage (the weekly limit has been near its warning) and avoids branch fights.
- **Never two children on the same branch.** If you replace a child, interrupt and archive the old one first.
- **The prompt must stand alone.** Use the template in §8.1. Children cannot attach this repo (`add_repo` is refused): they read it with curl.
- Children usually **cannot `send_message` back**. Check on them with `get_session` (`status_bucket`, `task_summary`) and `list_events` with `kinds: ["result"]`. The final `result` text holds their report and LEDGER.
- When a child hits a 5-hour limit or a 429 error, it stops. Resume it with `send_message` once the limit resets. (A `create_trigger` with a time in the past fails; just send the message.)
- When a child finishes: write its ledger rows, verify production yourself (`tk-build`, `/health`, open a page), archive it, and report to the owner.

### 8.1 Prompt template for a child session

```
You are working on Tech Katta (https://tech.katta.cc), a system design interview practice site. The owner said:
"Take decisions yourself" and "Always use common sense". Do the tasks below in order, one PR each. Don't stop to ask;
decide sensibly and write down what you decided.

Context: repo yashbhoomkar/tech-katta (cloned here). Notes are in the PUBLIC repo yashbhoomkar/tech-katta-context. You
cannot attach it; read it with curl: https://raw.githubusercontent.com/yashbhoomkar/tech-katta-context/main/<file>.
Read 55-START-HERE.md first (architecture, shipping, testing, rules), then any doc your task names.

Ship each PR as 55-START-HERE.md §5 says (draft PR, required checks, normal merge of main, never force-push, squash with
expectedHeadSha, verify tk-build and /health on production). Do NOT write to MongoDB: end each task with a LEDGER list of
full 40-char SHAs (branch commits and squash), each with a one-line description and PR number, marking those that touch
backend/ or content/.

Hard rules: design freeze; no personal branding, pricing or employer mentions; no secrets in any repo; facts need fetched
sources or are labelled model figures; no new top-level tabs; set localStorage tk-internal=1 before any browser check of
production; never skip or loosen a test.

TASK 1: …   (what, why, acceptance checks with numbers)
TASK 2: …

When done, reply with: per task the PR numbers, what shipped, numbers before/after, decisions, what is left and why,
and the LEDGER lists. If you hit a usage limit, stop with work pushed; you will be resumed.
```

## 9. What shipped recently (most recent first)

| PRs | What |
|---|---|
| #418 | `/drills` (31 one-minute cards; seen cards kept in the browser), `/guides` (5 decision guides, in the sitemap), weekly incident card on Home |
| #417 | Canvas problems: UPI switch, Tatkal booking at 10:00, IPL live streaming (model figures). Traffic patterns "Tatkal opens at 10:00" and "IPL match night" in `lab.json` |
| #416 | Sweep rules turned into counts (all 10 Practice problems pass); image-serving and notification-sender retuned; Shopify, Spotify and Meta case studies checked against their posts; Sources on 22 articles |
| #415 | Problem page: brief painted first, `window.tkGet` cache, parallel start; budget-phone LCP 5.3 s → 2.3 s on production |
| #410, #412, #414 | Fast first view on budget phones (page preloads, on-demand pages, lighter posters, workspace chunks with the gate) |
| #411, #413 | Practice lab upgrade (doc 54): landing demo on the real judge, honest counts, `/free`, `/start` paths, Home progress panel, result card after Submit, Updated dates, Sources, `/changelog` |
| #405, #408, #409 | Flaky 3D e2e fixed at the cause; analytics flags automated and internal traffic; Report privacy (private by default, redacted screenshots, spam limits) |
| #402, #404 | Free sample (Networking essentials, Redis, How to answer, Discord messages, URL shortener) readable signed out; full text in the HTML for search engines; sitemap |
| #403, #406, #407 | Content correctness: 21 article errors; one capacity model for Practice and canvas (JUDGE_VERSION 4); briefs state the limits they relax |
| #401 | Sign-in off by default (`SIGNIN_REQUIRED=0` unless the repository variable says 1) |
| #390–#400 | The Report button: on every page, blue right-edge tab, Quick and Visual feedback, instant screenshot, drawing tools, PNG |
| #386–#392 | Sign-in flag; doc 53 (fewer tabs, phone solving: Done/Back closes sheets, the parts row swipes) |

A one-line list of every PR with its squash SHA is in `10-GIT-HISTORY.md`.

## 10. What is next

**Waiting for the owner** (only they can do these):
1. **Google Search Console:** add a DNS TXT record for katta.cc, submit `https://tech.katta.cc/sitemap.xml`, and request indexing of the free pages and the guides.
2. Open `https://tech.katta.cc/?tk-internal=1` on each of their devices.
3. **The five-friends test:** watch five people do "Solve your first problem" on their phones, including the result card. This is the most important product signal; the key metric is "a second problem solved within 7 days".
4. Close the setup and test issues in `tech-katta-feedback`.
5. The employment disclosure, which blocks any pricing.
6. Older items in `18-TODO.md`: moving the API off Bluehost (Lightsail Mumbai, paid by UPI), the AI interviewer bake-off, Practice spec 21 steps 9+.

**Ready to build** (in this order, unless the owner says otherwise):
1. Fix whatever the five-friends test and the feedback issues show. That comes before new features.
2. Small leftovers from 28 Nov:
   - a Tatkal bot-limit test (it hit the API gateway's 10,000 requests a second cap; needs a design decision);
   - a full dark/light screenshot pass on `/drills` and `/guides`.
3. A 4-week study plan (doc 54 §5 row 13), once `/start` shows real use.
4. More India-scale problems (rider dispatch, festival-sale flash orders) using the G pattern (#417).
5. Grow the drills from 31 to about 60, built only from facts already in the articles.

**Do not do** without the owner:
- pricing, payments or paywalls;
- personal branding;
- new top-level tabs;
- a visual redesign;
- rewriting the stack;
- deleting analytics data or ledger collections.

## 11. Gotchas that have bitten sessions

- **The Report screenshot must be PNG.** BugDrop's worker refuses JPEG. Screenshots also only attach if the feedback repo has at least one commit; it does now.
- **Report speed:** the 3D world is paused while the popup is open (#398), so the capture is fast.
- **`-s ours` against main drops main's changes.** Use a normal merge.
- **The ledger has to be written by the parent session**, as children's Mongo writes are refused.
- **`add_repo` for the context repo is refused in child sessions.** Use curl from raw.githubusercontent.com.
- **The Search Console API is unauthenticated in sessions, and installing Lighthouse is refused.** Measure with Playwright and CDP throttling instead.
- **The NPCI statistics page refuses automated requests.** Don't quote UPI volumes without a source you could fetch.
- **The frontend build reads the problem list from the live API.** Since #417, `hosting/pages.mjs` also reads `content/`, so a new problem gets a page in the same PR.
- **Hard-coded counts break when content grows.** Always read counts from the API.
- **The 5-hour and 7-day usage limits** apply to the whole account. Prefer one child at a time, and check in at 2-hour intervals rather than polling.
