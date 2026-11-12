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
- `20-UI-REDESIGN-SPEC.md` — the next look ("Katta Paper"): research across the best technical-content sites, the design system, and exact work packages and CSS for the session that builds it. Pictures in `ui-redesign/`.

## The evaluator specification

`evaluator.md` — the design and implementation specification of the next evaluator engine ("v2": compile a design
into per-operation plans, simulate, analyse with rules, judge). Written 2026-11-10; nothing in it is built yet. The
session that implements it reads its §0 first and builds in the order of its §15.

## Critical rule

Before making a change, an AI session should:

1. Read the relevant context files.
2. Inspect the current GitHub state instead of trusting this snapshot blindly.
3. Inspect existing implementation before proposing a replacement.
4. Preserve established architecture and terminology unless the user explicitly changes direction.
5. After every GitHub commit, update the MongoDB commit ledger (`techkatta_history`, collections `frontend_git_commits` and `backend_git_commits`; read each full SHA from git first). It works from cloud sessions through the MongoDB tool.
6. Never store credentials, API tokens, private keys, passwords, or connection strings in this repository.

This repository is intentionally written as an **AI handoff document** rather than normal product documentation.

