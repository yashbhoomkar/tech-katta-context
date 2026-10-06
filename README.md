# Tech Katta Context

This repository is the portable context and operating manual for the Tech Katta project.

**Purpose:** a future ChatGPT session should be able to read this repository and reconstruct the project's architecture, current implementation, infrastructure, history, constraints, decisions, workflows, and working preferences without relying on the previous chat session.

## Source of truth

The primary implementation repository is:

- GitHub: https://github.com/yashbhoomkar/tech-katta
- Branch: `main`
- Current implementation commit documented at the time this context snapshot was created: `6af1c16793d4f4dd3b9e76ce04898a9f84ba07e1`

This repository is **context**, not the application itself.

## Read these files first

1. `00-SESSION-BOOTSTRAP.md` — how a new AI session should behave.
2. `01-PROJECT-IDENTITY.md` — what Tech Katta is and what the user is trying to achieve.
3. `02-ARCHITECTURE.md` — system architecture and request/data flows.
4. `03-FRONTEND.md` — React/Vite implementation and UI conventions.
5. `04-BACKEND.md` — Express/MongoDB implementation and API behavior.
6. `05-CONTENT-MODEL.md` — article schema and content authoring rules.
7. `06-INFRA-DEPLOYMENT.md` — Vercel, VPS, Cloudflare, GitHub Actions and deployment.
8. `07-SECURITY-RELIABILITY.md` — hardening, threat model, DDoS, overflow architecture and known gaps.
9. `08-TESTING-VALIDATION.md` — CI, smoke tests and load-testing history.
10. `09-MOBILE-SWIPE.md` — current mobile gesture behavior and relevant commits.
11. `10-GIT-HISTORY.md` — important implementation history and rollback points.
12. `11-MONGODB-COMMIT-LEDGER.md` — MongoDB Git commit ledger design and current observed state.
13. `12-OPERATING-RULES.md` — rules an AI agent must follow when modifying Tech Katta.
14. `13-CURRENT-STATE.md` — current production snapshot and unresolved issues.
15. `14-OVERFLOW-ARCHITECTURE.md` — VPS-primary / Render-overflow design and its current status.

## Critical rule

Before making a change, an AI session should:

1. Read the relevant context files.
2. Inspect the current GitHub state instead of trusting this snapshot blindly.
3. Inspect existing implementation before proposing a replacement.
4. Preserve established architecture and terminology unless the user explicitly changes direction.
5. After every GitHub commit, update the MongoDB commit ledger.
6. Never store credentials, API tokens, private keys, passwords, or connection strings in this repository.

This repository is intentionally written as an **AI handoff document** rather than normal product documentation.
