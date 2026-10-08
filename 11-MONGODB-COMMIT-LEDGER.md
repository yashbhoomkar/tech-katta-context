# MongoDB Commit Ledger

## Purpose

The user explicitly requested a persistent Git-to-description ledger so that future work can be reversed intelligently.

The invariant is:

```
key   = GitHub commit SHA
value = what changed
```

This allows an AI session to query MongoDB and understand what a commit represented without reconstructing the entire chat.

## Atlas project

Project:
- `tech-katta`

Project ID:
- `6ac298d2a4428fd93e7b3f75`

Cluster:
- `Cluster0`

History database:
- `techkatta_history`

## Current observed collections

At the time this document was generated, MongoDB reported:

- `frontend_git_commits` — 152 documents
- `backend_git_commits` — 41 documents
- `git_commits` — legacy/older collection, still present

All three observed collections currently have:
- `_id_`
- `key_unique` unique index on `key`

Important: older conversation notes suggested that `git_commits` had been dropped. The live Atlas inspection shows that it currently exists. **The live database state wins. Do not delete it merely because older context says it was removed.**

## Frontend ledger

Collection:
`frontend_git_commits`

Examples currently present:
- `ff085989e6ba5b564d5dac192a60d4f0a1040bc5` → fix: load React explicitly and favicon
- `feb1e02b8f05c872498f56900b819d3bfe11c8e8` → Restore frontend to 61d4465 state
- `fe05fcc1fee6980fb2b096d526f40b7ad20ea834` → Give Tech Katta a more editorial human feel
- `fce4de930fe7923dce243543964c06cbff974535` → Simplify Tech Katta breadcrumb language
- `f3a4058c48f928c33e939bce9762040e6602711a` → Fix mobile navigation runtime error
- `f101d1c9f66d4de7f7ddf3d60fe3928e1e9e090c` → Humanize Tech Katta navigation and homepage copy
- `6af1c16793d4f4dd3b9e76ce04898a9f84ba07e1` → Open sidebar on home swipe right

## Backend ledger

Collection:
`backend_git_commits`

Examples:
- `fa76611655ab5baf6b2a0cfc0f43631d24330a47` → chore: polish deployment scaffold
- `ec66024ae7a0aeb78911967df1782a4786018959` → Harden backend HTTP server for production
- `eb7e3b95f24dc422a561eb31d2824b7129ec79e8` → Seed article content during backend deployment
- `e4f43301484aa9f12c9736f7c0d5c068fa204011` → add GitHub Actions workflows for backend auto-deployment and frontend build checks
- `e01d0997a57a0da2f3f221b7f525bb90f541f305` → Prevent MongoDB reconnect during graceful shutdown
- `cb3980962b62acdea6e85186a44edcb13c93bf75` → integrate MongoDB database with collection seeding and fallback
- `bdef2d1cc4a2a74e7736811d0dcc0c49cbee8d75` → Make overflow monitor safe until secondary is provisioned
- `61d446573bc8edc1617b73b2dc592b579c5a7740` → Install VPS-first overflow monitor during backend deploys
- `58dd2890658299f72ac11d8ebccf17d1fdc37341` → feat(backend): add internal Vercel control client

## Legacy/general collection

Collection:
`git_commits`

It currently contains historical records, including entries such as:
- `feb1e02b8f05c872498f56900b819d3bfe11c8e8`
- `fe05fcc1fee6980fb2b096d526f40b7ad20ea834`
- `fce4de930fe7923dce243964c06cbff974535`
- `f101d1c9f66d4de7f7ddf3d60fe3928e1e9e090c`
- `c09c34c07e69acbfdbc05e19c16b0586813b55b9`
- `bdef2d1cc4a2a74e7736811d0dcc0c49cbee8d75`
- `afc182319596404bed64d548449b64d1f45ea831`

Do not use it as the primary future write target unless the user explicitly asks. The canonical split is frontend/backend collections.

## Mandatory synchronization workflow

The MongoDB ledger update is only the **middle step**, not the end of the documentation workflow.

For every application commit:

```
Tech Katta application commit
        |
        +--> MongoDB ledger update
        |
        +--> tech-katta-context documentation update
```

The required order is:

1. Commit the application change to `yashbhoomkar/tech-katta`.
2. Capture the full Git SHA.
3. Update the appropriate MongoDB ledger collection(s).
4. Update the relevant Markdown documentation in `yashbhoomkar/tech-katta-context`.
5. Commit those documentation changes to `tech-katta-context`.
6. Verify the context repository commit.
7. If the application was deployed, record deployment/verification status in the context documentation when relevant.

### What the context update should capture

At minimum:
- application commit SHA
- concise change description
- affected subsystem
- new behavior
- deployment status if applicable
- testing/verification status
- new architecture/security/operational decision if applicable

This makes the context repository a continuously maintained second source of project memory.

## Classification caveat

Some historical commits touch shared files such as deployment configuration, workflows, or project-wide files. Earlier backfill classification used commit-message heuristics and therefore can have overlap.

If exact classification matters, inspect the commit's changed files rather than relying on the collection classification.

## Required future ledger record

Whenever a new application commit is created:

```json
{
  "key": "<full SHA>",
  "value": "<concise change description>"
}
```

Choose:
- frontend collection
- backend collection
- both when appropriate

Rely on `key_unique` to prevent duplicates.

## Never store secrets

The ledger value should describe the change only.

Never put:
- credentials
- environment variable values
- tokens
- passwords
- private URLs containing secrets

into the ledger.

## Reconciliation

If Git contains a commit missing from the ledger:
- do not silently rewrite existing records
- add the missing commit record
- document why it was missing if known

If the ledger contains a commit no longer reachable from main:
- do not delete automatically
- it may still be useful for rollback/history.
