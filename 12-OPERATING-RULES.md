# AI Operating Rules for Tech Katta

This file is intentionally imperative. A new AI session should follow these rules.

## Rule 1 — Inspect before changing

Never modify a file based solely on remembered context.

Read the current GitHub version first.

## Rule 2 — Prefer the existing architecture

Do not replace the stack because another stack is fashionable.

Current architecture:
- React/Vite frontend
- Vercel
- Express backend
- Ubuntu VPS
- MongoDB Atlas
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

## Rule 5 — Do not touch MongoDB content casually

Article content is seeded from Git.

Do not make one-off production DB mutations when the same change should live in source control.

If a DB migration is necessary, document it.

## Rule 6 — Never expose secrets

Never write secrets into:
- Git
- this context repository
- commit messages
- MongoDB ledger
- issue comments
- documentation

## Rule 7 — Distinguish fallback from primary state

Frontend local data is fallback.

MongoDB is runtime backend content.

Git source is the reproducible authoring source.

Do not accidentally make fallback content diverge from primary content.

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

## Code review on every PR (Decided by user, 2026-10-31)

- **Always request code review on every PR in `yashbhoomkar/tech-katta`**, right after opening it:
  1. Comment `@coderabbitai review` (plus the Claude Code footer). CodeRabbit is on the free open-source tier (shows "Plan: Advanced"), but **skips auto-review because the repo has fewer than 10 stars**, so the manual trigger is required. Limits refill hourly; if rate-limited, say so and wait or proceed on CodeQL for small/urgent fixes.
  2. Call `request_copilot_review`. It is accepted without error but produced no review on PR #110 — Copilot code review needs a paid Copilot plan on the account. Keep requesting; it costs nothing and starts working if a plan is added.
  3. CodeQL runs automatically.
- Verify every finding; fix real ones; reply on each thread with what changed or why it was left; then merge.
- `.coderabbit.yaml` (PR #110) holds review settings: chill profile, no poem, path instructions for frontend / backend / workflows.
- Free review apps the owner can install (Claude cannot install GitHub Apps): **Gemini Code Assist for GitHub** (`/gemini review`, auto-review on PR open) and **Qodo Merge** (free for open-source repos). All free tiers depend on the repo staying **public**; making it private changes eligibility.

## Article rules (Decided by user, 2026-10-31)

1. **Read aloud on every article.** Built into the dashboard (`Reader` / `useReader` in `frontend/src/dashboard.jsx`, Web Speech API). New block types must be added to `chunks()` so they are spoken.
2. **Every figure is animated where possible**, on a loop, in the Swiss palette, with a static version for `prefers-reduced-motion` (`useStill()`). Animation must show the concept happening (a request travelling, an event waiting in a queue), not decoration.
3. **Explain through one example system where it fits: Zotato**, a made-up food delivery app (`example` in `frontend/src/articles.js`): customer, restaurant and rider apps; Orders, Payments, Dispatch, Notifications, Invoices services; an outside payment provider and restaurants' own billing systems. Each article says that *it* uses Zotato (not "every concept on the site"); each idea gets an "In Zotato" explanation where it fits; figures use Zotato's parts. Extend Zotato (add a service, a constraint) rather than inventing a new system. Do not use real company names for it.
4. Copy stays plain and human; no copying from reference sites (they are guidance only).

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
- A human-sounding narration needs pre-generated audio from a neural TTS model. Tried installing the open-source Kokoro model (kokoro-onnx) in the session to pre-render MP3s: **blocked by the session's permission classifier** — needs the owner's go-ahead (or a cloud TTS key: Google Cloud TTS / Azure have free monthly tiers far above one article).

## Article shape (Decided by user, 2026-10-31)

- Articles are **short and structured, with depth on demand**: an "In 30 seconds" box, scannable cards (what / use it for / avoid it for / in Zotato), one-line lists, and anything longer inside collapsed "How it works…" or "Go deeper" sections. Aim for a ~5-minute main read; show both read times.
- Read aloud covers the main text only. After recording an article with `tools/tts`, set `audio: true` on it.
- Reference material from paid sites (e.g. Hello Interview) is guidance only; never copy text. Paid reference notes must not live in this public repo. They are kept in the private repo `yashbhoomkar/tech-katta-private` (`references/`); `hello-interview-api-design` moved there on 2026-10-31. Its old copy remains in this repo's git history (commit `a2affb8`) unless this repo is made private or its history rewritten.

## Example system renamed to Zotato (Decided by user, 2026-10-31)

- The example system is **Zotato** (formerly Dabba): same food delivery app, same parts. Note: the name is close to the real company Zomato; the owner chose it knowingly.
- Figures: add one wherever a picture explains more than text (decision ladders, end-to-end sequences, before/after timelines). Register new figures in `FIGS` in `frontend/src/dashboard.jsx`; keep every element inside the 640-wide viewBox; animate with `Dot`/`Glow`/`Show`; static under reduced motion.
