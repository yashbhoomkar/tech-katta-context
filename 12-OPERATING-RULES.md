# AI Operating Rules for Tech Katta

This file is intentionally imperative. A new AI session should follow these rules.

## Rule 0 — The automatic AI website development workflow is discarded (Decided by the owner, 2026-11-08)

**The automatic AI website development workflow is discarded** (owner, 2026-11-08: "Remove that automatic website development with agents workflow"): no worker sessions, no Learner + Builder cycles, no `send_later` chains or scheduled tasks, and `tech-katta/agents/TODO.md` is deleted (#256). Do not recreate it. All work happens in sessions the owner starts; open items live in `18-TODO.md`.

## Rule 1 — Inspect before changing

Never modify a file based solely on remembered context.

Read the current GitHub version first.

## Rule 2 — Prefer the existing architecture

Do not replace the stack because another stack is fashionable.

Current architecture:
- React/Vite frontend
- Vercel
- dependency-free Node 22 backend (`node:http`) serving JSON content
- Ubuntu VPS (content as validated releases on its disk)
- MongoDB Atlas (commit ledger only for now)
- Cloudflare
- GitHub Actions

## Rule 3 — Preserve reversibility

Small, coherent commits are preferred.

Every commit must be explainable in one sentence.

## Rule 4 — Application commit synchronization is mandatory

Whenever a commit is made to the application repository `yashbhoomkar/tech-katta`, the work is **not complete** after the application commit alone.

The mandatory sequence is:

```
1. Modify frontend/backend/application
2. Commit to GitHub
3. Obtain full application commit SHA
4. Update MongoDB commit ledger
5. Update this context repository's documentation
6. Commit the context-repository documentation update
7. Deploy/verify when required
```

This applies when the change affects:
- frontend
- backend
- both frontend and backend
- deployment configuration
- scripts
- CI/CD
- security
- architecture
- content schema
- important operational behavior

### MongoDB ledger requirement

The application commit must be recorded in the appropriate MongoDB collection:

- frontend → `frontend_git_commits`
- backend → `backend_git_commits`
- both → both collections when appropriate

Record:

```json
{
  "key": "<full application Git SHA>",
  "value": "<concise description of the change>"
}
```

### Context repository requirement

After updating MongoDB, update `tech-katta-context` so the documentation reflects the new application state.

At minimum, update the appropriate documentation file(s). Depending on the change, this may include:
- `13-CURRENT-STATE.md`
- `10-GIT-HISTORY.md`
- `03-FRONTEND.md`
- `04-BACKEND.md`
- `05-CONTENT-MODEL.md`
- `06-INFRA-DEPLOYMENT.md`
- `07-SECURITY-RELIABILITY.md`
- `08-TESTING-VALIDATION.md`
- `09-MOBILE-SWIPE.md`
- `14-OVERFLOW-ARCHITECTURE.md`

The context update should normally include:
- application commit SHA
- what changed
- resulting behavior
- deployment/verification status when relevant
- any new unresolved issue or architectural decision

Then commit the context update to `tech-katta-context`.

### Final invariant

For every meaningful application change, there should be three synchronized records:

```
Tech Katta Git commit
        |
        +--> MongoDB commit ledger
        |
        +--> tech-katta-context documentation
```

A future AI session must be able to understand the change from either the Git history or the context repository.

## Rule 5 — Content changes go through the repo

All content (articles, site copy, the Lab catalogue) lives in `tech-katta/content/` and reaches production only through the backend deploy, as a validated release on the VPS disk.

Never edit files under `/var/lib/tech-katta/content` by hand, and never put content in MongoDB. If the content format changes, update `backend/src/content/validate.js`, its tests and `content/README.md` in the same PR.

## Rule 6 — Never expose secrets

Never write secrets into:
- Git
- this context repository
- commit messages
- MongoDB ledger
- issue comments
- documentation

## Rule 7 — The API is the only source of content

The frontend renders only what `/v1/site`, `/v1/articles` and `/v1/lab` return; it keeps no fallback copy of content. When the API is down it shows a load error with Try again.

Git (`content/`) is the authoring source; the VPS release is what is served. Do not add hardcoded content to the frontend (UI strings such as "Loading…" are fine).

## Rule 8 — Preserve human tone

The site should feel authored by Yash.

Avoid:
- generic AI slogans
- excessive marketing language
- "unlock your potential" style copy
- course-platform terminology
- over-engineered UI language

## Rule 9 — Static diagrams by default

For explanatory architecture:
- prefer static SVG diagrams

Use interactive diagrams only if interaction itself provides meaningful value.

## Rule 10 — Do not claim testing that did not happen

Use exact labels:
- source inspected
- build passed
- smoke test passed
- browser tested
- mobile touch tested

These are not interchangeable.

## Rule 11 — Security changes require deployment awareness

If modifying:
- CORS
- headers
- rate limiting
- proxy behavior
- MongoDB connectivity
- authentication
- origin exposure

verify both code and production behavior.

## Rule 12 — Do not remove safety mechanisms for convenience

Do not disable:
- slug validation
- regex escaping
- CORS restriction
- rate limiting
- health checks
- graceful shutdown
- security headers

without an explicit reason and replacement.

## Rule 13 — Deployment is part of correctness

If the user explicitly asks to deploy:
- commit
- allow CI/Vercel to deploy
- inspect deployment state where possible
- run appropriate smoke tests
- report exact result

## Rule 14 — If a connector fails

Do not repeatedly perform unrelated destructive actions.

Identify whether the failure is:
- authentication
- authorization
- scope
- API rate limit
- project configuration
- deployment failure

For example, a Vercel `403 Not authorized for scope` is not the same thing as a deployment failure.

## Rule 15 — Respect current production

Before changing production:
- identify current commit
- identify current deployment
- identify rollback point

## Rule 16 — Explain trade-offs

The user is a software engineer and values technical reasoning.

When a choice matters, explain:
- correctness
- latency
- failure behavior
- operational cost
- reversibility

Do not over-explain trivial syntax.

## Rule 17 — Do not invent infrastructure

If Render, Vercel, Cloudflare, MongoDB, or the VPS has not actually been configured, describe it as planned—not deployed.

## Rule 18 — Keep this context repository current

When a change materially affects:
- architecture
- deployment
- security
- content schema
- operational procedures
- important UI behavior

update the appropriate context file.

The context repository should evolve with the application.

This is not optional when the change is part of the application commit synchronization workflow in Rule 4.


## AI code-review evidence rule (2026-10-11)

- A successful check status is not proof that an AI code review occurred.
- Verify the GitHub PR review API, inline review comments, and relevant bot/check identity before reporting an AI review.
- If the review bot is configured in `.coderabbit.yaml` but produces no review evidence, report the integration as unverified/inactive and do not count it as a completed review gate.
- Never claim an AI review solely from Semgrep, CodeQL, build, deployment, or other CI results.


## Ledger duplicate handling (2026-10-11)

- Before inserting a commit record, query both canonical collections for the full SHA and insert only if it is absent.
- If historical duplicate rows are discovered, do not blindly delete or overwrite them during normal ledger updates. Preserve their `_id`, key, and value as audit evidence; handle cleanup through a dedicated, backed-up operation with a recorded canonical description and a verified unique index.

## Code review on every PR (Historical — superseded 2026-11-01)

> **Current rule (Decided by the owner, 2026-11-01: "You may skip it"):** do not request CodeRabbit or Copilot reviews and do not wait for them. Merge when the required checks (CodeQL, "Test and build frontend", "Test backend", "Build and run API container") are green (the backend and container checks were added in #275/#276); squash-merge with a short message. If CodeRabbit reviews anyway, fix every valid finding and reply on each thread. The text below records the earlier rule.

- (Earlier rule) Request code review on every PR in `yashbhoomkar/tech-katta`, right after opening it:
  1. Comment `@coderabbitai review` (plus the Claude Code footer). CodeRabbit is on the free open-source tier (shows "Plan: Advanced"), but **skips auto-review because the repo has fewer than 10 stars**, so the manual trigger is required. Limits refill hourly; if rate-limited, say so and wait or proceed on CodeQL for small/urgent fixes.
  2. Call `request_copilot_review`. It is accepted without error but produced no review on PR #110 — Copilot code review needs a paid Copilot plan on the account. Keep requesting; it costs nothing and starts working if a plan is added.
  3. CodeQL runs automatically.
- Verify every finding; fix real ones; reply on each thread with what changed or why it was left; then merge.
- `.coderabbit.yaml` (PR #110) holds review settings: chill profile, no poem, path instructions for frontend / backend / workflows.
- Free review apps the owner can install (Claude cannot install GitHub Apps): **Gemini Code Assist for GitHub** (`/gemini review`, auto-review on PR open) and **Qodo Merge** (free for open-source repos). All free tiers depend on the repo staying **public**; making it private changes eligibility.

## Research Papers replace Did you know (Decided by the owner, 2026-11-08) — **Historical**

*Removed 2026-11-09 (#281) by the owner's "only the reference site's articles" decision below; its slot is now the
Real systems tab. Kept for the record.*


- A "Research Papers" tab (`content/articles/papers/`) takes the place of "Did you know": one classic paper per
  article, in plain words with animated figures (`frontend/src/figs/papers.jsx`). Shape: the paper (title, author,
  venue, year), the problem, the idea, how it works, what it promises, where you see it today, how to use it in
  an interview, and "Go deeper".
- Our own words and our own figures only; never copy a paper's text or diagrams.
- Company names appear only in each paper's citation line (the paper's own title and authors), never in
  headings, deks or ads; open-source project names (HDFS, Cassandra, etcd) may be named, as elsewhere on the
  site. The owner said to proceed without asking (11-08), so this is the working rule.
- The set (owner: "decide which papers are interesting, and which the user should really know"): Must know,
  01-08: Lamport clocks, GFS, MapReduce, Bigtable, Dynamo, Kafka, Scaling Memcache, Raft. Worth reading, 09-13:
  Bloom filters, Chubby, Haystack, Spanner, The Tail at Scale. Two animated figures each; numbers taken from
  the papers and checked; anything that can't be checked is left out.

## Core concept topics, in our own words (Decided by the owner, 2026-11-08)

- The owner shared another interview-prep site's Core Concepts list and asked us to cover the same topics, "but
  just have different headings and titles". Topics and knowledge are general; our titles, slugs, section
  headings, examples, numbers and figures are our own. Don't name that site anywhere on ours.
- Concepts groups built from a reference page (owner, 11-08): Networking essentials (CONCEPT // 26-36) and API design
  (CONCEPT // 37-43). Method: outline the reference page, write our own articles and figures through Zotato,
  then check every point is covered (132 and 101 points) and fill gaps. No new tabs: such topics are groups in
  Concepts.
- Owner, 2026-11-08 (evening): the rule "nothing on Tech Katta is copied from the reference site" is removed.
  Networking essentials is general knowledge; a reference page may be used to decide what to cover, point by
  point. A later pass will refine the wording so nothing reads as taken directly from it.
- Coverage (11-08): networking (`concepts/tap-to-server`), API design (`concepts/shaping-apis`), data modelling
  (`concepts/modelling-data`), caching (`components/caches`), sharding (`components/sharding`), consistent
  hashing (`concepts/hash-rings`), CAP (`concepts/cap-pacelc`), database indexing (`concepts/indexes`), numbers
  to know (`concepts/estimates`).
- Patterns (owner, 11-08: "add these patterns into one of the tabs that we have; don't create a separate tab
  called patterns", and "even if our existing topics cover them, still add them as separate articles"): a
  **Recurring patterns** group inside Concepts, CONCEPT // 14-20: `live-updates`, `contention`, `workflows`,
  `scaling-reads`, `scaling-writes`, `big-files`, `long-jobs`. Two animated figures each.
- Key technologies (owner, 11-08: "do the same, don't add a separate tab, change the headings and titles, add
  content"): a **Tools by name** group inside Components, COMPONENT // 10-19: `redis`, `elasticsearch`,
  `kafka-in-practice`, `temporal`, `gateway-products`, `cassandra`, `dynamodb`, `postgresql`, `flink`, `zookeeper`.
  Figures live in `frontend/src/figs/tools.jsx` (`TOOL_FIGS`). After the owner asked to "rethink the content", each
  page got a "Numbers worth remembering" table, a Zotato example in code, "this or something else" guidance and
  pointers to the problems that use the tool; keep that shape for any new tool page.
- Advanced topics (owner, 11-08: "add these topics, similar to what we did before, no new tab"): a **Specialised
  data** group inside Concepts, CONCEPT // 21-25: `nearby-search`, `vector-search`, `time-series`, `sketches`,
  `change-capture`, in the same shape as the tool pages (numbers, code, comparisons, problem pointers).
- Site conventions to keep consistent across articles: riders ping every 4 seconds; Indian units (lakh, crore)
  except in quoted paper figures and per-million prices.
- Concept numbers follow the order the sidebar shows them, group by group (Basics 01-04, Data 05-10, Staying up 11,
  Agreeing 12-13, Recurring patterns 14-20), and `index.json` lists them in that order. Renumber when an article
  is added in the middle of a group; slugs never change. Older pages point to the deeper concept by name
  ("the Hash rings concept") when one exists.

## Video hosting and free vs paid (Decided by the owner, 2026-11-07)

- **Videos:** the owner's teaching videos live on tech.katta.cc only (not YouTube), hosted on **Bunny Stream**
  (Standard network: Indian PoPs, signed URLs, basic DRM, free encoding). Keep the master recordings in our own
  storage too, so the host can be changed. Not AWS or Cloudflare Stream for video: at 30 hours a month per
  subscriber they cost about 3.5 times more.
- **Free vs paid:** every article has `access: "free" | "paid"` (tech-katta #241). Free: How to answer, APIs, CAP
  and PACELC, Load balancers, Caches, and the Lamport clocks paper (owner, 11-08). Paid: everything else, including every problem (the validator refuses a
  free problem), the Lab and the videos. The field is data only: nothing locks or shows it until the owner
  confirms the employer clearance.
- Prices, costs and business notes are in the private repo (`tech-katta-private/notes/business-plan.md`), not here.

## Article rules (Decided by user, 2026-10-31)

1. **Read aloud on every article.** Built into the dashboard (`Reader` / `useReader` in `frontend/src/dashboard.jsx`, Web Speech API). New block types must be added to `chunks()` so they are spoken.
2. **Every figure is animated where possible**, on a loop, in the Swiss palette, with a static version for `prefers-reduced-motion` (`useStill()`). Animation must show the concept happening (a request travelling, an event waiting in a queue), not decoration.
3. **Explain through one example system where it fits: Zotato**, a made-up food delivery app (`example` in `frontend/src/articles.js`): customer, restaurant and rider apps; Orders, Payments, Dispatch, Notifications, Invoices services; an outside payment provider and restaurants' own billing systems. Each article says that *it* uses Zotato (not "every concept on the site"); each idea gets an "In Zotato" explanation where it fits; figures use Zotato's parts. Extend Zotato (add a service, a constraint) rather than inventing a new system. Do not use real company names for it.
4. Copy stays plain and human; reference sites decide what to cover (owner, 11-08).

## Audience: mobile first (Decided by user, 2026-10-31)

- The site will be promoted on **Instagram and LinkedIn**; expect **~75 % of visitors on phones**. Design and verify for a phone first (iPhone-size emulation, 320–430 px), then desktop.
- Figures must fit the screen without sideways scrolling and offer **"Tap to view full screen"** (modal; rotated in portrait). Tables become cards on phones. Touch targets ≥ 40 px.
- Every page needs Open Graph / Twitter tags; `/og.png` (1200×630) is the default preview image. Articles have a **Share** button (native share sheet).
- Hash routes (`/dashboard/#concepts/api-types`) all share the dashboard's preview card; per-article previews need real per-article URLs (pending decision).

## Recorded narration (Decided by user, 2026-10-31)

- Voice engine: **Kokoro** (open-source, Apache-2.0), default voice `af_heart`. Tooling in `tech-katta/tools/tts/` (`export-chunks.mjs`, `generate.py`); output `frontend/public/audio/<slug>/` + `manifest.json`; the player uses it automatically and falls back to device voices per chunk.
- **Record an article only when its content is final** (owner: content will change a lot). Do not commit audio for drafts.
- Kokoro runs inside the cloud session container (`/tmp/tts/venv`, model in `/tmp/ttsmodel`: `kokoro-v1.0.int8.onnx` + `voices-v1.0.bin` from github.com/thewh1teagle/kokoro-onnx releases `model-files-v1.0`). The container is temporary: reinstall when recording. A full article (~120 chunks) takes ~30 min on CPU and is ~6 MB.

## Read-aloud voice quality (2026-10-31)

- Browser voices vary by device; the reader ranks natural ones first and offers a Voice picker.
- A human-sounding narration needs pre-generated audio from a neural TTS model. The first attempt to install Kokoro (kokoro-onnx) was blocked by the session's permission classifier; it was allowed once the owner chose Kokoro (see "Recorded narration" above, which is the current rule).

## Article shape (Decided by user, 2026-10-31)

- Articles are **short and structured, with depth on demand**: an "In 30 seconds" box, scannable cards (what / use it for / avoid it for / in Zotato), one-line lists, and anything longer inside collapsed "How it works…" or "Go deeper" sections. Aim for a ~5-minute main read; show both read times.
- Read aloud covers the main text only. After recording an article with `tools/tts`, set `audio: true` on it.
- Reference material from paid sites (e.g. Hello Interview) is guidance only; never copy text. Paid reference notes must not live in this public repo. They are kept in the private repo `yashbhoomkar/tech-katta-private` (`references/`); `hello-interview-api-design` moved there on 2026-10-31. Its old copy remains in this repo's git history (commit `a2affb8`) unless this repo is made private or its history rewritten.

## Example system renamed to Zotato (Decided by user, 2026-10-31)

- The example system is **Zotato** (formerly Dabba): same food delivery app, same parts. Note: the name is close to the real company Zomato; the owner chose it knowingly.
- Hosting (#276, `HOSTING.md`): the site's rewrites, redirects and headers live in `frontend/hosting/routes.json`. Never hand-edit `frontend/vercel.json`: change `routes.json`, run `npm run hosting:vercel` in `frontend/`, commit both (a test fails if they differ). A new API setting goes in `backend/.env.example` too (a test checks every `process.env` name is listed). Keep host-specific code behind these seams (`hosting/adapters.js`, `src/hostanalytics.jsx`, env settings) so moving hosts stays a configuration change.
- Figures: add one wherever a picture explains more than text (decision ladders, end-to-end sequences, before/after timelines). Register a new figure in its sub-tab's module, `frontend/src/figs/<tab>/<sub-tab>.jsx` (`export const FIGS`), and its id in `backend/src/content/figs/<tab>/<sub-tab>.js`; a new sub-tab adds both files and one line in each `figs/index.js` (a backend test checks the folders, both indexes and every pair of id lists match). Shared drawing parts (`T`, `Steps`, `Fig`, `Bx`, `Ar`, colours…) are in `figs/parts.jsx`; keep every element inside the 640-wide viewBox; animate with `Dot`/`Glow`/`Show`; static under reduced motion.

## Content lives in the backend (Decided by user, 2026-10-31)

- All site copy is JSON in `tech-katta/content/` (deployed to the VPS at `/var/lib/tech-katta/content/current`, see `content/README.md`) and served by `tech-api.katta.cc` (`/v1/site`, `/v1/articles`, `/v1/articles/:slug`). The frontend must not hardcode content; it only renders what the API returns (UI strings like "Loading…" are fine).
- Content PRs touch `content/` only and are deployed by the backend workflow; run `npm test` (content validation) before opening the PR. New block types or figures need a frontend change too (renderer / the sub-tab's figure module) — ship the frontend first only if it ignores unknown blocks safely, otherwise backend first.
- Ship order for API changes the frontend depends on: backend PR → deploy → verify live → frontend PR.

## Where data lives (Decided by user, 2026-10-31)

- **Content** (articles, site copy, example systems; later narration audio and images): files on the VPS disk (50 GB SSD) under `/var/lib/tech-katta/content`, published as validated releases from the repo's `content/`.
- **MongoDB Atlas**: dynamic data only when it exists (accounts, payments, progress, feedback) — and the existing commit ledger.

## Deploys, CI and lockfiles (2026-11-01, after the external repo review)

- `frontend/package-lock.json` is **committed** now (CI and Vercel use `npm ci`). Do not delete it;
  regenerate it with `npm install` when dependencies change. Node 22 (`frontend/.nvmrc`).
- `.github/workflows/frontend.yml` runs the Lab tests and the production build on every PR touching
  `frontend/`. A PR is mergeable only with it green (plus CodeQL).
- The backend deploy deploys **exactly `github.sha`**, is live only when `/health` reports the new
  release (`<UTC>-<short sha>`), and rolls back code and content automatically on any failure after
  the checkout changes (EXIT trap). Never weaken this; rehearse any change to the script locally with
  stubbed `sudo`/`systemctl`/`curl` (both `dash` and `bash`) before merging.
- Actions are pinned to commit SHAs; when bumping, resolve tags with `git ls-remote` (the GitHub API
  is not reachable for other repos from the session).
- Content validation covers every field the frontend reads. When the frontend starts reading a new
  field, add it to the shape spec in `backend/src/content/validate.js` with a negative test.
- Saved Lab data goes through `frontend/src/lab/store.js` (`readStore`); never read
  `localStorage` directly in the Lab. Bump `STORE_VERSION` and add a migration if the shape changes.
- Lab colours: red only **above** 100% (`u > 1`); exactly 100% (a worker draining a backlog) is amber.

## Problems are judged (Decided, owner 2026-11-07)

- Every Interview Question (except "Start here") ships with its `practice` test suite: tests, rubric,
  hints, a starting design, a reference that passes every test, wrong designs that each fail one test.
  `cd tech-katta/frontend && npm test` checks the calibration; use `tech-katta/tools/practice/` to write it.
- Tests judge behaviour on the visitor's design (traffic, failures, cost), never similarity to an answer.
- Changing the Lab engine (`lab/engine.js`) can change verdicts: run the frontend tests (calibration of all
  22 suites) and the Lab e2e scripts before merging.
- Guided tours open only when the visitor presses the Tour button, never by themselves (owner, 2026-11-07).
- The API never serves `practice.wrong`, and serves `practice.reference` only on its own, for the Solution tab
  (`GET /v1/articles/<slug>/solution`, since #234, the owner's request). A copied solution submitted unchanged
  is never counted as solved or in the public stats. Submissions store results only.

## Technical content = the reference site's system design articles (Decided by the owner, 2026-11-09)

- Owner: "For the technical content, only have those articles that hellointerview system design has. No more no
  less." Its public navigation lists 9 core concepts, 7 patterns, 15 deep dives (10 technologies, 5 advanced
  topics), 32 problem breakdowns, 7 guides and 6 case studies. Titles only were read; paid pages are not
  accessed. Don't name that site on ours; our titles, examples, numbers and figures stay our own.
- Concepts: one article per topic, 21 (Core concepts 9, Recurring patterns 7 with Real-time updates first,
  Specialised data 5). A topic with several parts keeps them as h2 parts with h3 sections (block `h3`).
- Components: only the 10 named technologies (Tools by name). Research Papers: removed.
- Interview Questions: the reference's 32 problems (autocomplete removed; 11 to add, each with tests, rubric,
  hints and a Lab design, calibrated like the others). Its 7 guides go in Interview Questions › Start here
  ("How to answer" is the delivery guide). Its 6 case studies go in a "Real systems" tab (the slot Research
  Papers used; owner's choice).
- Free articles: only "How to answer" until the owner picks more.
- Figure modules are named after a sub-tab or, for a long article, the article's slug (the backend test checks it).
- Removing or merging an article: move the figures other articles reuse, rewrite every pointer to it (search
  titles in quotes and "the X concept/component/article"), and redirect its address to the matching article in
  `frontend/hosting/routes.json` (then `npm run hosting:vercel`); re-point older redirects so there are no chains.
- Case studies (Real systems › Case studies, #284): each retells one company's public engineering post in our own
  words with our own figure. The company is named (the article is about it), the post is cited in the last paragraph
  (title, month, year), the numbers are the company's and say so; nothing is copied. Order follows the reference:
  Shopify, Discord, Slack, Figma, Spotify, Meta. A tab without a library card gets its header from `site.json`
  `dashboard.heads[<section>]` ({eyebrow, desc}).
- Ledger: read every full SHA from git (`git log -1 --format=%H`) before inserting it; never type or guess one.
  When squash-merging, pass a short `commit_message`, or GitHub fills the body with every branch commit.
- Syncing the working branch after a squash merge: `git merge -s ours origin/<branch>` (records the merge,
  keeps our files). A plain merge committed conflict markers once (#281, undone in the next commit).

