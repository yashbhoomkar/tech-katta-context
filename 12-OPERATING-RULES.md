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

## Rule 4 — Update the ledger

Every application commit gets a MongoDB ledger record.

This is mandatory.

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
