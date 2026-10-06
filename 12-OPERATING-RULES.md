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
