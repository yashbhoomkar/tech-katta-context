# Tech Katta Context

This repository is the **portable context package for Tech Katta**.

Its purpose is to let a future ChatGPT session, coding agent, reviewer, or collaborator understand the Tech Katta project without relying on the previous conversation history.

## What is Tech Katta?

**Tech Katta** is Yash Bhoomkar's personal technical knowledge base at:

- Production frontend: https://tech.katta.cc
- API: https://tech-api.katta.cc
- Main application repository: https://github.com/yashbhoomkar/tech-katta
- Context repository: https://github.com/yashbhoomkar/tech-katta-context

The site is intentionally positioned as a **real engineer's technical notebook that happens to be well designed**, rather than as an AI-generated documentation portal.

The core editorial idea is:

> notes on building systems

The site primarily covers distributed systems, backend infrastructure, databases, and AI systems where they intersect with things Yash is learning, building, or trying to understand.

## How to use this repository

Read these files in roughly this order:

1. `00-project-overview.md` — identity, goals, architecture, and current state.
2. `01-architecture.md` — frontend/backend/infrastructure architecture.
3. `02-frontend.md` — React/Vite application structure and UX rules.
4. `03-backend.md` — Express/MongoDB API and hardening.
5. `04-content-system.md` — article/unit/chapter/content schema and current content.
6. `05-diagrams.md` — static diagram system and diagram rules.
7. `06-deployment.md` — GitHub/Vercel/VPS deployment architecture and CI/CD.
8. `07-security.md` — security posture, threats, mitigations, and remaining work.
9. `08-testing.md` — smoke tests, load tests, browser testing, and known limitations.
10. `09-history-and-decisions.md` — important implementation decisions and why they were made.
11. `10-github-and-mongodb-ledger.md` — the MongoDB Git commit ledger and rollback convention.
12. `11-current-state.md` — the latest known state and active work.
13. `12-agent-operating-instructions.md` — how a future agent should behave when working on Tech Katta.

## Critical rule

This repository is **context, not permission to blindly change the production system**.

A future agent must inspect the current GitHub state, deployment state, and relevant files before making changes. Historical statements in this repository describe what was true when documented; they do not override the live repository.

When historical context conflicts with current source code, **current source code wins**, unless the task explicitly asks to reproduce a historical state.

## Sensitive information

Never store:

- MongoDB passwords
- API keys
- Vercel tokens
- SSH private keys
- GitHub tokens
- production secrets
- personal credentials

A MongoDB credential was accidentally shared during an earlier setup discussion. It must **not** be copied into this repository or any future context file. Treat that credential as compromised and rotate it if it has not already been rotated.

## Git convention

Whenever changes are made to the main Tech Katta repository:

1. Make the smallest coherent change.
2. Verify it.
3. Commit with a descriptive message.
4. Record the GitHub commit in the MongoDB commit ledger as:
   - key = commit SHA
   - value = what changed
5. Preserve the ledger entry so the change can be located and reverted later.

See `10-github-and-mongodb-ledger.md` for details.
