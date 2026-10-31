# 17 — Session Handover (Claude Code, 2026-10-30 → 2026-10-31)

Read this file first if you are a new Claude (or other AI) session picking up Tech Katta work.
It is a self-contained handover from the Claude Code session that rebuilt the landing page on
2026-10-30/31. It complements, and in places supersedes, older files in this repository — where
they disagree, this file and the live code win (see §12).

Labels used: **Known** (verified), **Decided** (user's call), **Pending** (waiting on the user),
**Historical** (true earlier, no longer), **Unverified**.

---

## 1. TL;DR for the next session

> **Update 2026-10-31 (later):** production briefly became a private placeholder (PR #107, merge `a83651b`)
> and was then reverted at the user's request (PR #108, merge `53a8ae0`). The landing page below is live
> again. PR #109 (merge `e234b3b`) added the **Dashboard page** at `/dashboard/` (see `03-FRONTEND.md`);
> PR #110 added `.coderabbit.yaml`. PR #111 (merge `f939092`) published the first article (Concepts › API types)
> and removed the GitHub/RSS footer links — **never show a GitHub link on the site**. Current `main` = `f939092`.
> PR #112 (merge `a25a09d`, current `main`) added read-aloud, mobile-fit + full-screen figures, Share, OG previews,, the animated FIG. 01 and **Dabba**, the example
> system every article must use — see `12-OPERATING-RULES.md` › Article rules. Ledger entries for PRs #107–#112 are pending.

- Production `https://tech.katta.cc` is a **single-page React/Vite landing page** for a **system
  design learning site**. Current `main`: `3d3e40fd00c9d2d8868c6f7606b1d8e0ca76c75a` (PR #106 merge).
- Everything you will normally touch is in three files: `frontend/src/content.js` (all copy),
  `frontend/src/main.jsx` (all markup + diagrams), `frontend/src/styles.css` (all styles, one long line).
- **Workflow the user expects for every change:** branch `test-claude` → PR to `main` → CodeQL
  (+ CodeRabbit when quota allows) → fix findings → merge → verify production in a headless browser
  → notify the user → record in MongoDB ledger + this repo. Details in §3.
- **The user said: never ask for permission; the answer is always "allow".** Act, then report.
  (Still confirm genuine product/business decisions — see §11.)
- Open business task: reposition the site as an **affordable system design course at ₹99**
  versus competitors at ₹399+. A proposal exists (§11); nothing is implemented yet.

---

## 2. Who the user is and how they like to work

- Owner: Yash Bhoomkar (GitHub `yashbhoomkar`). Builds Tech Katta personally.
- Communicates in short task lists ("Tasks 1. … 2. …"). Expects the work done end to end, not advice.
- Wants changes **visible on production** and to be **notified when deployed** so they can inspect
  `tech.katta.cc` themselves (a push notification was sent after each production deploy).
- Values: plain human copy (not "AI-ish"), Swiss editorial design, honest verification language,
  explicit commit SHAs, reversibility.
- Pushes back with short follow-ups ("I can still see section 04", "Think clearly", "is it
  needed?"). Answer directly with a recommendation, then act.
- Has sometimes merged PRs themselves once CodeQL was green. If a PR is merged by the user, do the
  post-merge steps (verify production, ledger, context, notify) anyway.

### Standing instructions given in this session (Decided)

1. "Never ask permissions — my answer will always be allow."
2. "Whenever asked for a code change: create PR → have it reviewed by CodeQL and CodeRabbit if
   possible → if all good → merge into the instructed branch."
3. Use `tech-katta-context` (this repo) in the workflow: keep it current after every change.
4. Diagrams: block diagrams, Swiss publishing colour scheme, built from scratch (do **not** reuse
   `frontend/public/diagrams/kafka-architecture.svg`).
5. Copy must not sound AI-generated.

---

## 3. The workflow, step by step (follow exactly)

1. **Sync the branch.** The working branch is `test-claude` in `yashbhoomkar/tech-katta`.
   After a PR merges, restart it from `main`:
   `git fetch origin main && git checkout -B test-claude origin/main` (fast-forward push works;
   force-push is **blocked** by the session's safety classifier — never rely on it).
2. **Edit** `frontend/src/{content.js,main.jsx,styles.css}`. Match the existing terse style
   (minified-looking JSX/CSS, one-line rules).
3. **Build:** `cd frontend && npm install --no-audit --no-fund --silent && npm run build`.
   Delete the generated `frontend/package-lock.json` before committing (it is intentionally not
   tracked; adding it changes Vercel install behaviour — a separate decision).
4. **Verify in headless Chromium** (Playwright is preinstalled; `require('playwright')`):
   - Start `npx vite preview --port <NEW PORT EACH TIME> --strictPort`. **Gotcha:** a still-running
     old preview server serves a stale cached `index.html`; always use a fresh port.
   - Screenshot the changed section at 1440 / 900–1000 / 390 px.
   - **Full overflow sweep 320→1440 px** (10 px steps to 760, then 40 px):
     `document.documentElement.scrollWidth > innerWidth` must be false everywhere.
     (A regression shipped once because only ≥640 px was swept — PR #105.)
   - Animations: freeze SMIL with `svg.pauseAnimations(); svg.setCurrentTime(t)` and CSS with
     `document.getAnimations().forEach(a=>{a.pause();a.currentTime=ms})`.
   - Reduced motion: `browser.newPage({reducedMotion:'reduce'})` → expect 0 animations.
   - `pkill -f "vite prev[i]ew"` afterwards (the bracket avoids killing your own shell; exit code
     144 from that line is harmless).
5. **Commit** with a descriptive message ending with the attribution lines the harness provides.
   Push: `git push -u origin test-claude`.
6. **PR** via GitHub MCP (`mcp__github__create_pull_request`), base `main`. Body: summary, test
   plan with checkboxes, `🤖 Generated with Claude Code` + session link. Subscribe with
   `subscribe_pr_activity`. Schedule a ~50 min `send_later` safety check-in.
7. **Reviews (always — see `12-OPERATING-RULES.md` › Code review on every PR):** comment `@coderabbitai review` and call `request_copilot_review` on every PR. CodeQL runs automatically (`.github/workflows/codeql.yml`). CodeRabbit auto-review
   is **disabled** on the repo — trigger with a PR comment `@coderabbitai review` (+ the Claude
   Code footer). Free plan = **1 review per hour**; when rate-limited, wait or merge on CodeQL
   alone for small/urgent fixes and say so. Verify each finding, fix real ones, reply on the
   thread with what changed and how it was verified, resolve the thread.
8. **Merge** (`merge_method: merge`, pass `expectedHeadSha`) once CodeQL is green and no blocking
   findings remain.
9. **Verify production:** poll `https://tech.katta.cc` until the new `assets/index-*.js` contains a
   string unique to the change (Vercel deploys in ~30–60 s), then rerun the browser checks and the
   overflow sweep against production.
10. **Ledger (MongoDB Atlas, mandatory):** connect with
    `remote-atlas-connect(projectId="6ac298d2a4428fd93e7b3f75", clusterName="Cluster0")`;
    database `techkatta_history`. For each new SHA: **first `count` both `frontend_git_commits`
    and `backend_git_commits` for the key**, then `insert-many` `{key: <full SHA>, value: <one
    line>}` into the right collection(s). Record both the commits and the merge commit.
11. **Context docs:** update `13-CURRENT-STATE.md`, `10-GIT-HISTORY.md`, and `03-FRONTEND.md`
    when frontend structure changes; push straight to `main` of this repo (as prior sessions did).
12. **Notify** the user (PushNotification) when the change is live, and give a short summary.

---

## 4. Environment facts (cloud Claude Code session)

| Thing | Status |
|---|---|
| GitHub `yashbhoomkar/tech-katta` | push via git proxy works; GitHub MCP tools for PRs/comments/merge |
| GitHub `yashbhoomkar/tech-katta-context` | attached with `add_repo(access:"push")`; clone at `/home/user/tech-katta-context` |
| MongoDB Atlas MCP | works; project `6ac298d2a4428fd93e7b3f75`, cluster `Cluster0` |
| `tech.katta.cc`, `tech-api.katta.cc` | reachable over HTTPS from the session |
| Vercel preview URLs | **require Vercel login** — cannot be checked; verify production instead |
| VPS SSH (`129.121.133.47`, user `claude`) | **blocked**: port 22 times out through the session proxy; stored key `VPS_SSH_KEY` (base64) is passphrase-protected. User said to leave VPS access until needed. |
| Force-push | blocked by safety classifier — use revert/merge commits instead |
| CodeRabbit | installed; auto-review off; 1 free review/hour |

---

## 5. Current production state (Known, 2026-10-31)

- Frontend `main` = `3d3e40fd00c9d2d8868c6f7606b1d8e0ca76c75a`, deployed by Vercel to
  `https://tech.katta.cc`. Verified in headless Chromium: no console errors, no horizontal
  overflow 320–1440 px.
- Backend `https://tech-api.katta.cc/health` → `{"status":"ok","service":"tech-katta-backend","version":"0.1.0"}`.
  Backend code (`backend/src/server.js`, health-only starter) was not touched this session.
- **Rollback points:** before this session's UI work: `95d227de…` (homepage) / `37df67b…` (after
  PR #103). Revert a merge commit to roll back a PR.

### Page structure (top to bottom)

1. **Header** — brand "TECH KATTA / SYSTEMS KNOWLEDGE"; nav: Concepts · Components ·
   Interview Questions · Quick Notes (anchors `#concepts #components #problems #notes`).
2. **Hero** — eyebrow "FIELD NOTES / DISTRIBUTED SYSTEMS"; H1 "System design, explained.";
   intro "Concepts, components and interview questions. For each one: how it works, where it fails,
   and what you trade away by using it."; buttons **Dashboard →** (`#topics`) and **Quick Notes**
   (`#notes`).
   - **FIG. 01** animated Kafka block diagram (1 producer → broker with topic `orders`, 2
     partitions × 4 offsets → consumer group of 2). SMIL, 8 s loop. Horizontal at all widths;
     below 620 px of figure width a **"⤢ Tap to zoom"** bar opens a full-screen dialog (portal,
     `#root` set `inert`, Escape/backdrop/Close, focus returns to the button).
3. **01 / Technical Library** (`#topics`) — "Concepts · Components · Interview Questions";
   three cards with SVG mini block diagrams:
   - Concepts — CAP theorem (CP/AP paths alternate, CSS animation).
   - Core Components — read path Client → LB → API → Cache (hit) / Database (miss) (SMIL).
   - Interview Questions — "Design a URL shortener" steps Requirements → Estimates → Design →
     Trade-offs (CSS animation).
4. **02 / Quick Notes** (`#notes`) — 4 notes (Kafka DRAFT; Raft, Redis Cluster, Rate limiting
   PLANNED). No note pages exist; rows link to `#notes`.
5. **03 / Numbers Worth Knowing** (`#numbers`) — "The numbers behind a design."
   FIG. 02 log-scale latency chart (10 ns–1 s, ~100 ms dashed "people notice" marker),
   Estimation shortcuts, FIG. 03 worked URL-shortener estimate
   (100M/day ÷ 86,400 s ≈ 1.2K writes/s → ≈116K reads/s → ≈50 GB/day → ×3 peak).
6. **Footer** — label, "Written and maintained by one engineer", links incl. GitHub and a broken
   `#rss`, "Last updated: [date]" placeholder.

Removed this session: "Architectural Principles" (monolith vs services), "04 / Keep reading",
"04 / How the Pieces Connect" (remove until its target notes exist).

---

## 6. Code map (`frontend/src/main.jsx`)

| Symbol | Purpose |
|---|---|
| `LOOP`, `BLUE`, `SLOT` | 8 s loop, cobalt, slot state colours (E empty / W written / C consumed) |
| `cell()`, `SEQ`, `TRIPS`, `NODES`, `LAYOUT.d` | Kafka FIG. 01 timeline + geometry (viewBox 640×300) |
| `Tick` | discrete SMIL `<animate>` helper |
| `Slot` | animated slot rect + dashed "empty" overlay (opacity-animated; Chrome ignores SMIL `stroke-dasharray`) |
| `Flow({v,still,uid})` | renders FIG. 01; `uid` keeps marker ids unique (inline vs zoom) |
| `useStill()` | `prefers-reduced-motion` hook incl. live changes; used by FIG. 01 and card minis |
| `Diagram` | FIG. 01 + Tap-to-zoom button + portal dialog |
| `logPct(ns)` | log scale for FIG. 02: `(log10(ns)-1)/8*100` (10 ns → 0 %, 1 s → 100 %) |
| `Mini({type})` | card diagrams: `"cap"`, `"path"`, default = interview steps |
| `App` | page markup; reads everything from `content.js` (`c.*`) |

`content.js` top-level keys: `brand, nav, hero, topics, notes, numbers, footer`.
Footer links resolve hrefs via `c.nav` lookup.

**Unused legacy files** (not loaded by the page, safe-to-remove candidates in a separate PR):
`main.js`, `home-page.js`, `home-page.css`, `style.css`, `mock-interview.js`,
`architecture-workspace.js`, `public/diagrams/kafka-architecture.svg`.

### CSS conventions (`styles.css`, single line)

- Tokens: `--blue:#2855d9`, `--line:#d9dee7`, `--muted:#586575`, `--mono:"IBM Plex Mono"`;
  graphite `#1c2733`, surface `#f5f7fa/#f8f9fb`, hairline `#9aa5b4`. Inter for text.
- Breakpoints: `@media(max-width:900px)`, `@media(max-width:680px)`;
  container queries: `.figure` (`max-width:620px` → zoom bar), `.numbers` (`max-width:680px` →
  stacked rows).
- **Ordering trap:** a container/media block must come *after* the base rules it overrides when
  specificity is equal (caused the PR #105 phone overflow).

---

## 7. Session timeline (all SHAs are in the MongoDB ledger)

| PR | Merge | What |
|---|---|---|
| #102 | `334fa12` | Animated replicated-write FIG. 01; CodeRabbit: mid-width legibility, live reduced-motion |
| #103 | `37df67b` | FIG. 01 → animated Kafka block diagram (from scratch) |
| #104 | `b43d8c8` | Tap-to-zoom; hero copy; Dashboard/Quick Notes; mobile figure-header fix; CAP / read-path / interview-steps cards; Interview Questions rename; Quick Notes rename; Numbers section; How-the-Pieces-Connect; CodeRabbit fixes (focus trap, container query, landscape zoom, card copy) |
| #105 | `abbb76a` | Hotfix: phone overflow (CSS order) |
| #106 | `3d3e40f` | Numbers rework (design latencies, 100 ms marker, worked estimate; divisor fix from CodeRabbit); section 04 removed |

Earlier the same session: branch `test-claude` was created, briefly emptied `frontend/` and
`backend/` (`11e9e4d`) and reverted (`4f634d4`); no net change reached `main`.

---

## 8. Backlog / known issues (not done)

1. Footer "RSS" → `#rss` does not exist (remove or add a feed).
2. Footer "Last updated: [date]" placeholder.
3. Hero eyebrow still says "FIELD NOTES / DISTRIBUTED SYSTEMS" (may conflict with new positioning).
4. No note/article pages exist; Quick Notes and card "Explore …" links only scroll the page.
5. Legacy unused files listed in §6.
6. `frontend/package-lock.json` not committed (context docs recommend committing it; separate PR).
7. Tap-to-zoom not tested on a real touch device.
8. CodeRabbit: consider enabling auto-review / adding `.coderabbit.yaml` (needs user).
9. Context files `01-PROJECT-IDENTITY.md` / `05-diagrams.md` describe a dark-only purple design and
   static Excalidraw diagrams — **Historical**; the live site is light Swiss with animated SVG.
10. Re-add "How the pieces connect" once Replication/Kafka/ingestion notes exist.

---

## 9. Lessons learned this session

- Run the **full 320–1440 px overflow sweep** on the final head before merging any layout change.
- SMIL `stroke-dasharray` animation is ignored by Chrome → animate opacity of an overlay instead.
- Vite preview servers cache; use a new port per build check.
- Never write an estimate whose shown expression doesn't produce the shown result (CodeRabbit
  caught `100M ÷ 10⁵ ≠ 1.2K`). Recompute every number with a script.
- A section that only links back to content above it adds nothing — remove until real content exists.
- Don't present planned content as published (Rule 17 of `12-OPERATING-RULES.md`).

---

## 10. Source documents the user provided

Two PDFs were uploaded at the start (not stored in any repo; summarised here):

- **Tech Katta CI/CD Pipeline Documentation** — frontend React+Vite on Vercel via Git
  integration (root `frontend`, `npm run build`, output `dist`, domain `tech.katta.cc`);
  backend Node 22 deployed by `.github/workflows/deploy-backend.yml` (test → SSH to VPS →
  `/opt/tech-katta` → `npm ci --omit=dev` → systemd `tech-katta-api` on 127.0.0.1:5000 →
  health checks local + `https://tech-api.katta.cc/health`); Cloudflare DNS; recommended
  follow-ups (frontend lockfile, frontend CI, remove hard-coded VPS host/user fallbacks, rollback,
  monitoring).
- **Tech Katta Platform & Visual Identity** — product = system design knowledge platform with
  three pillars **Concepts → Components → Problems**, cross-linked ("one connected body of
  knowledge"); Swiss/International Typographic Style: grid, typography-led hierarchy, restrained
  palette (White `#FFFFFF`, Surface `#F5F7FA`, Border `#D9DEE7`, Cobalt `#2855D9` accent only,
  Graphite `#1C2733`, Muted `#586575`), Inter + IBM Plex Mono, thin borders, no heavy shadows,
  diagrams that explain rather than decorate.

---

## 11. Pending: ₹99 affordable positioning (task from 2026-10-31)

**Business decision (Decided by user):** launch an affordable system design offering at **₹99**,
positioned against competitors priced at **₹399 and upward**.

**Status:** proposal only — nothing implemented. The next session should get answers to the open
questions below, then implement via the normal PR workflow.

### Proposed landing page changes

1. **Hero carries the offer.** Keep the editorial tone; make the price and what it buys explicit.
   - H1 option: "System design, explained. For ₹99."
   - Sub: "Concepts, components and interview questions — the same depth you'd pay ₹399+ for
     elsewhere." (avoid naming competitors)
   - Primary CTA: "Get access — ₹99" (or "Join the waitlist — ₹99 at launch" if not yet sellable);
     secondary: "See what's inside" → `#topics`.
   - Small mono line under CTAs: "One-time ₹99 · no subscription" (only if true).
2. **New section "What ₹99 gets you"** (replace or follow 01): a plain list/table of what is
   included (number of concepts, components, interview questions, diagrams, updates), so the low
   price reads as value, not as low quality.
3. **Price comparison block** (Swiss table, no competitor names): "Typical system design courses:
   ₹399–₹1,999+ · Tech Katta: ₹99", plus *why* it can be cheaper (one engineer, no video
   production, text + diagrams, no upsells). Honesty is the trust signal.
4. **Proof before purchase:** keep the free FIG. 01, card diagrams and Numbers section as free
   samples; label them "Free preview".
5. **FAQ** (short): What's included? Is it one-time? Refunds? Access duration? Who writes it?
6. **Copy rules:** say "affordable" / "₹99", never "cheap" (signals low quality); no fake
   scarcity, no fake reviews or student counts, no claims about content that doesn't exist yet.
7. **Nav/brand:** add a "Pricing" anchor; reconsider the eyebrow "FIELD NOTES / DISTRIBUTED
   SYSTEMS" → e.g. "SYSTEM DESIGN COURSE · ₹99".

### Open questions for the user (must answer before building)

- ₹99 for what: one-time lifetime access, per month, or per track?
- What is in the paid product at launch vs. free? (Today no note pages exist — selling before
  content exists means "pre-order/waitlist", not "buy now".)
- Payments: which gateway (Razorpay/Stripe/UPI)? Is there a backend for accounts/entitlements?
  (Current backend is health-only.)
- Should competitor pricing be stated as a range without names? (Recommended.)
- Refund policy, GST/invoicing — legal/tax decisions the site must state accurately.

---

## 12. Reading order and trust

1. This file → 2. `12-OPERATING-RULES.md` (ledger + context rules) → 3. `13-CURRENT-STATE.md`
(latest dated sections at the bottom) → 4. `03-FRONTEND.md` (bottom section = current page) →
5. the live code on `main`. If any document disagrees with `main`, **the code wins**; record the
discrepancy here.
