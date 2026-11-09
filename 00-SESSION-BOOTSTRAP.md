# Session Bootstrap — Read This First

> **Newest handover:** read `17-SESSION-HANDOVER.md` before anything else. It describes current production, the PR → CodeQL + frontend CI → merge → verify → context workflow (CodeRabbit is skipped by the owner's decision), the System Design Lab and pending work. Where this bootstrap disagrees with the handover, the handover wins.

> **The automatic AI website development workflow is discarded** (owner, 2026-11-08: "Remove that automatic website development with agents workflow"): no worker sessions, no Learner + Builder cycles, no `send_later` chains or scheduled tasks, and `tech-katta/agents/TODO.md` is deleted (#256). Do not recreate it. All work happens in sessions the owner starts; open items live in `18-TODO.md`.

You are assisting with an ongoing software project called **Tech Katta**.

Your job is to behave like the continuation of an experienced engineering session, not like an unrelated greenfield consultant.

## 1. Project

Tech Katta is Yash Bhoomkar's personal technical knowledge base at:

- `https://tech.katta.cc`

It contains engineering notes focused primarily on:

- distributed systems
- backend infrastructure
- databases
- AI infrastructure

The intended voice is a real engineer's personal technical notebook that happens to be polished. It must not feel like generic AI-generated documentation.

## 2. Repositories

Application:

`yashbhoomkar/tech-katta`

Context:

`yashbhoomkar/tech-katta-context`

The application repository is the implementation source of truth. This repository is the context source.

## 3. Current implementation

The application is a React/Vite frontend plus a dependency-free Node.js 22 backend that serves validated JSON content (articles, site copy, the Lab catalogue) from the VPS disk.

Frontend:
- Vercel
- domain `tech.katta.cc`

Backend:
- Ubuntu VPS
- public API `tech-api.katta.cc`
- Node 22 `node:http` server (no Express, no runtime dependencies)
- content: JSON releases under `/var/lib/tech-katta/content` (from the repo's `content/`)
- MongoDB Atlas holds only the commit ledger

The frontend hardcodes no content: if the API is unreachable it shows "Couldn't load this page" with Try again (there is no local fallback data any more).

## 4. How to work

When the user says things such as:

- "fix this"
- "change this"
- "deploy this"
- "check this"
- "make this better"

do not merely explain how. Inspect the repository and perform the requested engineering work when the connected tools permit it.

For implementation tasks:
1. inspect current code
2. make the smallest coherent change
3. validate it
4. commit it
5. update the MongoDB commit ledger
6. deploy if deployment is part of the requested workflow
7. verify deployment where possible
8. report the commit/deployment/result precisely

## 5. Never claim unperformed testing

There is a strict distinction between:

- source-code inspection
- static reasoning
- CI validation
- HTTP smoke testing
- actual browser testing
- actual mobile gesture testing

Do not call a feature "browser-tested" unless an actual browser/sandbox interaction was performed.

If a connector is unavailable, state the limitation rather than inventing verification.

## 6. Preserve user intent

The user values:
- polished production-quality UI
- practical engineering explanations
- direct implementation
- reversibility
- explicit Git commit history
- strong infrastructure/security reasoning
- human rather than AI-generated presentation

Avoid unnecessary rewrites and architectural churn.

## 7. Git ledger requirement

Every GitHub commit made to the Tech Katta application must have a corresponding ledger record:

`key = full Git commit SHA`

`value = concise description of what changed`

Current ledger details are in `11-MONGODB-COMMIT-LEDGER.md`.

## 8. Security

Never place:
- MongoDB passwords
- MongoDB URIs containing credentials
- Vercel tokens
- SSH private keys
- GitHub tokens
- Render credentials
- API keys

into this context repository.

If credentials appear in an old conversation or source, describe the fact without reproducing the secret.

## 9. Context freshness

This repository is a snapshot. The AI must always reconcile it with the live application repository before making implementation decisions.

The current `main` commit and content release are recorded in `17-SESSION-HANDOVER.md` §1. Check `git log origin/main` and `https://tech-api.katta.cc/health` before relying on them.
