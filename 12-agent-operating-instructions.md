# 12 — Agent Operating Instructions

## Mission

When a new ChatGPT session or coding agent is asked to work on Tech Katta, the goal is to behave like a continuation of the established engineering collaboration.

The agent should be:

- precise
- implementation-oriented
- conservative with production
- aware of historical decisions
- explicit about verification level
- focused on the user's requested goal

## First step in a new session

Read:

1. this repository's README
2. `00-project-overview.md`
3. `01-architecture.md`
4. `11-current-state.md`
5. the topic-specific document relevant to the request

Then inspect the live `yashbhoomkar/tech-katta` repository.

Do not rely on memory alone.

## Source-of-truth hierarchy

Use this priority:

1. current production/runtime state when asking what users see now
2. current GitHub source code when asking how the application is implemented
3. current deployment configuration/CI when asking how it is deployed
4. this context repository for intent, history, decisions, and conventions
5. old conversation memory only as supplemental context

If context documentation conflicts with current code, verify before acting.

## Before changing code

Ask:

- What exact user-visible behavior is changing?
- Which layer owns it?
- Is there already an abstraction for it?
- Is there a compatibility layer that should be preserved?
- Does the change affect frontend, backend, database, deployment, or all of them?
- Is there a safer way to achieve the same result without data migration?
- Does the change affect mobile?
- Does it affect dark mode?
- Does it affect SEO?
- Does it affect horizontal scrolling?
- Does it introduce a new dependency?

## Editing principles

Prefer:

- small coherent commits
- existing architecture
- minimal dependencies
- backward-compatible content normalization
- static assets for static explanatory diagrams
- configuration over hardcoding
- reversible changes

Avoid:

- rewrites
- speculative abstractions
- unnecessary packages
- database mutation for presentation problems
- production secrets in source
- repeated deployments as a substitute for testing

## Verification language

Be exact.

Say:

- "I inspected the source"
- "I built the frontend"
- "The API smoke test passed"
- "The production deployment is READY"
- "I browser-tested the gesture"
- "The load test reached X VUs"

Do not say "fully tested" if only source inspection occurred.

## GitHub workflow

For a normal change:

1. inspect current branch/HEAD
2. inspect relevant file
3. edit
4. run tests/build
5. commit
6. obtain SHA
7. write ledger record
8. verify deployment
9. report result

The user explicitly values knowing the exact commit that produced a change.

## MongoDB ledger workflow

Every important main-repository commit should have:

```
key = exact 40-character commit SHA
value = concise description of the change
```

Insert into:

- `frontend_git_commits`
- `backend_git_commits`

according to scope.

Do not invent a SHA.

## Deployment workflow

Frontend:

```
GitHub -> Vercel -> tech.katta.cc
```

Backend:

```
GitHub Actions -> SSH -> VPS -> systemd -> tech-api.katta.cc
```

After a backend deployment, health and production smoke tests should be checked.

## When Vercel MCP fails

If Vercel MCP reports:

```
403 Not authorized for scope "yashbhoomkars-projects"
```

do not repeatedly redeploy.

First determine whether the problem is:

- connector session
- team authorization
- stale OAuth state
- actual project permission

A separate ChatGPT conversation successfully accessing Vercel is evidence that account authorization may be healthy even when one session is stale.

## When asked to test an interaction

Do not substitute code inspection for real interaction.

For touch UI:

- use an actual browser/sandbox if available
- dispatch real touch/pointer events
- verify route/history changes
- test gesture rejection
- test scroll-container exceptions

If the browser tool is unavailable, report that limitation honestly.

## When asked to use an external service

Prefer the service connector/tool if it has the required capability.

Do not invent access.

If an external tool is blocked, explain the exact blocker and continue with what can be safely verified.

## Database rules

Never casually mutate production MongoDB.

Before a migration:

1. understand current schema
2. determine whether normalization can solve the problem
3. identify rollback
4. back up where appropriate
5. run against a controlled environment first
6. verify indexes and constraints
7. document the migration

## Security rules

Never expose or repeat secrets.

If a credential was pasted into a conversation, treat it as potentially compromised.

Do not write credentials into context files even if doing so would make a future session more convenient.

## Communication style

The user prefers direct technical answers.

When work is performed, report:

- what changed
- why
- exact commit SHA
- verification performed
- deployment status
- known limitations
- next action only if needed

Do not bury the result under generic explanations.

## Product direction

Tech Katta is ultimately intended to:

- publish high-quality engineering notes
- support LinkedIn-driven discovery
- demonstrate Yash's engineering depth
- build professional credibility
- create opportunities through technical writing

The site should therefore optimize for:

- credibility
- technical correctness
- readability
- polished but restrained UX
- authentic engineering voice
- useful diagrams
- fast navigation
- maintainability

It should not optimize for:

- generic SEO filler
- maximal animation
- fake authority
- AI-generated verbosity
- unnecessary product complexity
