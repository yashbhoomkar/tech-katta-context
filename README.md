# Tech Katta Context

This repository is the portable context and operating manual for the Tech Katta project.

**Purpose:** a future AI session (Claude Code or another assistant) should be able to read this repository and reconstruct the project's architecture, current implementation, infrastructure, history, constraints, decisions, workflows, and working preferences without relying on the previous chat session.

## Source of truth

The primary implementation repository is:

- GitHub: https://github.com/yashbhoomkar/tech-katta
- Branch: `main`
- The current `main` commit and production release are recorded in `17-SESSION-HANDOVER.md` §1 (kept up to date after every merge). Always check `git log origin/main` and `https://tech-api.katta.cc/health` rather than trusting a written SHA.

This repository is **context**, not the application itself.

> **The automatic AI website development workflow is discarded** (owner, 2026-11-08: "Remove that automatic website development with agents workflow"): no worker sessions, no Learner + Builder cycles, no `send_later` chains or scheduled tasks, and `tech-katta/agents/TODO.md` is deleted (#256). Do not recreate it. All work happens in sessions the owner starts; open items live in `18-TODO.md`.

## Read these files first

0. **`17-SESSION-HANDOVER.md` — the current handover: production state, the owner's decisions, workflow, the System Design Lab, environment limits and open items. Start here; it overrides older files.**
1. `00-SESSION-BOOTSTRAP.md` — how a new AI session should behave.
2. `01-PROJECT-IDENTITY.md` — what Tech Katta is and what the user is trying to achieve.
3. `02-ARCHITECTURE.md` — system architecture and request/data flows.
4. `03-FRONTEND.md` — React/Vite implementation and UI conventions.
5. `04-BACKEND.md` — backend history (Express/MongoDB era; partly Historical — the backend is now a dependency-free Node server serving JSON content from the VPS disk, see the handover §6).
6. `05-CONTENT-MODEL.md` — article schema and content authoring rules (its first section is current; the rest is the MongoDB era, Historical).
7. `06-INFRA-DEPLOYMENT.md` — Vercel, VPS, Cloudflare, GitHub Actions and deployment.
8. `07-SECURITY-RELIABILITY.md` — hardening, threat model, DDoS, overflow architecture and known gaps.
9. `08-TESTING-VALIDATION.md` — CI, smoke tests and load-testing history.
10. `09-MOBILE-SWIPE.md` — current mobile gesture behavior and relevant commits.
11. `10-GIT-HISTORY.md` — important implementation history and rollback points.
12. `11-MONGODB-COMMIT-LEDGER.md` — MongoDB Git commit ledger design and current observed state.
13. `12-OPERATING-RULES.md` — rules an AI agent must follow when modifying Tech Katta.
14. `13-CURRENT-STATE.md` — current production snapshot and unresolved issues.
15. `14-OVERFLOW-ARCHITECTURE.md` — VPS-primary / Render-overflow design and its current status.
16. `15-ORIGIN-EXPOSURE-HARDENING.md` — safe phased plan for Cloudflare proxy cutover and origin firewall restriction.
17. `16-SEARCH-SEMANTICS-PERFORMANCE.md` — current search contract, live Atlas query-plan evidence, and safe optimization criteria.
- `20-UI-REDESIGN-SPEC.md` — the "Katta Paper" look, **built and live** since tech-katta #309 (2026-11-12): research across the best technical-content sites, the design system, the work packages and CSS. Later changes are in the handover (figure motion #311–#312, phone figures and tours #313–#314, no "In 30 seconds" box #315). Pictures in `ui-redesign/`.
- `21-PROBLEM-EXPERIENCE-LEETCODE-STYLE.md` — the next problem-solving experience, LeetCode-style (owner, 2026-11-12): a full design specification, **not built yet**; written to be built beside the current canvas and judge.
- `22-EVALUATOR-V3.md` — the next evaluator, "v3" (owner, 2026-11-13: "we need the best evaluator for system design"): a full design specification, **not built yet**. Not a third simulator: an evidence engine that runs what-if probes on the learner's own design, a design report with no AI, questions about the design whose answers the judge already knows, and an AI interviewer that may only choose and word computed facts and mark written answers against authored points. **The review job is built and live with a mock interviewer (#339)**; the rest is not built yet. Built on Practice (spec 21) first. Replaces the 2026-11-07 decision "no AI in the evaluator"; the AI never decides a verdict.
- `24-UI-UX-SWIPES-ANIMATIONS-GRAPHICS.md` — UI/UX for touch, motion and graphics (owner, 2026-11-13: "Think on UI UX part of Tech katta … swipes, animations, graphics"): UX1–UX4 **built and live** (#323, #324: one gesture hook, figure step controls, drawer/full-screen/Practice swipes, cross-fades, sliding contents marker); the rest is design. No site-wide back/forward swipe. It proposes swipes only where paper follows the finger (Practice tabs, figure steps, drawer, sheets, full-screen figure), one gesture hook, figure step controls, view transitions, Practice diagram motion, phone-first figures, state scenes and link previews. Owner decisions in its §9.
- `25-PREMIUM-COLOUR-OPTIONS.md` — four premium palettes (owner, 2026-11-13: "The colour scheme ... does not look premium"), rendered on the real site (`ui-redesign/palettes/`). Round 2 studied 16 top sites; round 3 studied brilliant.org (the owner liked it). **Shipped P4, Brilliant-inspired (#334).**
- `26-STAGE-DARK-FIRST-LAYOUT.md` — "the problem is with the white background … UI UX placement" (owner, 2026-11-13): three layout directions (`ui-redesign/15-17`), then **dark first** after "the upper part looks great, continue with it only". Dark hero with the live figure and the judge, numbers strip, picture tiles; one navigation (dark sidebar), a new dashboard home (continue reading, progress, up next). **Shipped in #336.**
- `27-TOPIC-CARDS-AND-LIGHT-THEME.md` — "think for the light theme" and "animation cards for every topic … the pop-up will have limited textual content" (owner, 2026-11-13): light hero, header and sidebar follow the theme; an article opens as one moving card per section, a tap opens a sheet with at most three key points and the full section one tap away. **Shipped in #337.**
- `28-KATTA-PAPER-COLOURS-BACK.md` — the owner liked the layout, cards and animations, and asked to try them with the earlier marigold and warm white colours: Katta Paper colour values back (light and dark), marigold buttons and TK squares, warm white as the default theme. Colours only. **Shipped in #338.**
- `29-SELF-HOSTED-LLM-ON-A-VPS.md` — can the evaluator v3 interviewer (spec 22 §12) run on our own ₹500–600 a month VPS instead of a hosted API, with subscriptions at ₹199 (owner, 2026-11-13)? Research only, **not built**: which boxes fit the budget in Nov 2026, which small open models, estimated waits and subscribers per box, money against hosted APIs, quality limits, set-up, and the spec 22 changes an async queue needs. **Decided the same day** for the owner's target of at least 150 AI reviews per user per month (§11): the hosted API wins; no VPS. The model (§12, compared without favouring any company, prices from the LiteLLM catalogue, quality from Artificial Analysis): **Meta Muse Ember 1.0 by default** (same per-token price as Claude Haiku 5.5 and GPT-6 Luna, top score in the cheap tier, ~₹6–12 a subscriber a month at full use), confirmed by a bake-off against Claude Haiku 5.5 and DeepSeek V4.1 Flash on spec 22's evaluation set.
- `30-PREMIUM-RENOVATION.md` — the overnight renovation of 2026-11-14 (owner: "looks like it is developed by vibe coding"): diagnosis, references, the new type (Instrument Sans, Source Serif 4, Geist Mono), the motion language, the page-by-page plan, what shipped (#343–#345) and how to roll back.
- `31-VPS-CHOICE.md` — the API server choice (Nov 2026): what the API needs, one-month prices in India, why AWS Lightsail (Mumbai) for now; changing servers is in the app repo's `ops/README.md`.
- `32-DESIGN-SKILLS-RENOVATION.md` — the design skills renovation of 2026-11-14 (owner: "Try to use these skills … Surprise me with the best website for system design"): elayadesign/ai-design-skills applied as the design system — Geist as the one typeface, fixed type/spacing/radius scales, flat surfaces, one motion curve, IntersectionObserver reveals, Phosphor icons, a new landing and a 404. **Shipped #355–#356**; replaces spec 30's type and motion.

## The evaluator specification

`evaluator.md` — the design and implementation specification of the next evaluator engine ("v2": compile a design
into per-operation plans, simulate, analyse with rules, judge). Written 2026-11-10 and **built** (tech-katta #287–#302,
2026-11-10 to 11-11): every problem and Lab challenge is judged by v2 and v1 is removed. Read its §0 before changing the
evaluator.

## Critical rule

Before making a change, an AI session should:

1. Read the relevant context files.
2. Inspect the current GitHub state instead of trusting this snapshot blindly.
3. Inspect existing implementation before proposing a replacement.
4. Preserve established architecture and terminology unless the user explicitly changes direction.
5. After every GitHub commit, update the MongoDB commit ledger (`techkatta_history`, collections `frontend_git_commits` and `backend_git_commits`; read each full SHA from git first). It works from cloud sessions through the MongoDB tool.
6. Never store credentials, API tokens, private keys, passwords, or connection strings in this repository.

This repository is intentionally written as an **AI handoff document** rather than normal product documentation.

