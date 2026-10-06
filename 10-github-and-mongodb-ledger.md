# 10 — GitHub and MongoDB Commit Ledger

## Purpose

Tech Katta maintains a MongoDB-based ledger that maps GitHub commits to human-readable descriptions.

This is intentionally separate from Git itself.

Git remains authoritative for code history.

MongoDB provides an operational lookup:

```
commit SHA -> what changed
```

## Atlas organization

Known Atlas organization:

`YashOrgSec`

Known project:

`tech-katta`

Known cluster:

`Cluster0`

Known history database:

`techkatta_history`

Known collections:

- `frontend_git_commits`
- `backend_git_commits`

A previous generic collection named `git_commits` was created during setup and later dropped.

## Record shape

Each collection uses a simple key-value concept.

Example:

```json
{
  "key": "61d446573bc8edc1617b73b2dc592b579c5a7740",
  "value": "Install VPS-first overflow monitor during backend deployments"
}
```

There is a unique index:

`key_unique`

on:

`key`

This prevents duplicate ledger records for the same commit within a collection.

## Classification

The initial backfill used commit-message heuristics.

Historical classification:

- frontend: 147
- backend: 41
- frontend-only heuristic: 134
- backend-only heuristic: 28
- some commits overlap because shared/deployment/CI changes can affect both areas

This means the historical collection classification is useful but not mathematically authoritative.

If exact classification is needed, inspect changed files for each commit.

## Backfill

A historical backfill fetched approximately 175 GitHub commits and inserted commit SHA -> first-line commit message descriptions.

The ledger is therefore intended to provide a compact history rather than duplicate full Git diffs.

## Important known entries

### Frontend

`6af1c16793d4f4dd3b9e76ce04898a9f84ba07e1`

-> `Open sidebar on home swipe right`

`f3a4058c48f928c33e939bce9762040e6602711a`

-> `Fix mobile navigation runtime error`

`13c11e23898af5b5a61d6098edfc540a691cc065`

-> `Add mobile swipe back and forward navigation`

`4aa24e02fe75173d6c9c40d144b44b56a5e4623c`

-> `Increase upcoming badge size a little more`

`68473c86fa73c9805da2b72f965b5591bcd31d41`

-> `Slightly increase upcoming badge size`

`c09c34c07e69acbfdbc05e19c16b0586813b55b9`

-> `Point social previews to the SVG OG image`

### Backend / deployment

`61d446573bc8edc1617b73b2dc592b579c5a7740`

-> `Install VPS-first overflow monitor during backend deployments`

`bdef2d1cc4a2a74e7736811d0dcc0c49cbee8d75`

-> final VPS overflow-router script state

`382f8ff23d50074321999434645d92f300bc4419`

-> cleanup after smoke-test harness issue

## Frontend restoration test

Temporary orange deployment test:

`afc182319596404bed64d548449b64d1f45ea831`

-> `Temporarily switch frontend to orange for deployment test`

Restoration:

`feb1e02b8f05c872498f56900b819d3bfe11c8e8`

-> `Restore frontend to 61d4465 state after deployment verification`

This test was used to prove that Vercel deployment propagation was functioning.

## Required workflow for future changes

When changing the main Tech Katta repository:

1. inspect current HEAD
2. make the change
3. run relevant checks
4. commit
5. obtain the exact commit SHA
6. insert into the appropriate ledger collection
7. verify the ledger insert
8. report the SHA and description

If a change affects both frontend and backend, decide deliberately whether it belongs in both collections.

## Rollback workflow

If asked to revert a change:

1. locate the commit in the ledger
2. inspect the Git diff
3. identify the dependent later commits
4. choose either:
   - `git revert` for a safe historical reversal
   - a targeted corrective commit
   - full reset only when explicitly requested and safe
5. verify
6. record the corrective commit in the ledger

Do not delete ledger history just because a code change was reverted.

## Security rule

Never put the MongoDB connection string, username, password, or secret into this document.

The ledger database itself contains operational history; credentials belong in deployment secret stores.
