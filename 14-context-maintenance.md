# 14 — Context Maintenance

## Why this file exists

The context repository only works if it remains current.

It should evolve alongside the main project.

## When to update context

Update this repository when any of these change:

- architecture
- deployment provider
- production domains
- database model
- security controls
- CI/CD behavior
- important UI behavior
- content schema
- diagram architecture
- rollback conventions
- major product positioning
- important bugs and their fixes

Do not update it for every typo or one-line CSS change.

## Current-state snapshots

`11-current-state.md` should be updated after major releases or infrastructure changes.

Historical documents should not be rewritten merely to make history look cleaner.

If a historical fact was true at the time, preserve it and update current-state separately.

## Commit ledger maintenance

The ledger is in MongoDB, not this repository.

This repository documents the ledger structure and known entries.

Do not duplicate the entire ledger here.

## New commit rule

For every important main-repository commit:

```
1. commit GitHub
2. capture exact SHA
3. describe change
4. insert ledger record
5. verify insert
6. deploy/verify as appropriate
```

## Context commit rule

Changes to this context repository itself do not need to be inserted into the Tech Katta application's frontend/backend MongoDB ledger unless explicitly requested.

This repository is documentation infrastructure.

## Avoid context drift

Never silently turn an assumption into a fact.

Use labels such as:

- Known
- Historical
- Intended
- Recommended
- Unverified
- Needs live verification

Examples:

> Intended: VPS is primary and secondary is overflow only.

> Historical: Render migration was attempted.

> Unverified: origin firewall currently allows only Cloudflare.

This distinction prevents future agents from treating old plans as deployed infrastructure.

## Future-agent bootstrap

A fresh agent should be able to do this:

```
1. Read README.md
2. Read 00-project-overview.md
3. Read 11-current-state.md
4. Read the topic-specific document
5. Inspect github.com/yashbhoomkar/tech-katta
6. Verify live deployment if the task is operational
7. Make the requested change
8. Test
9. Commit
10. Ledger the commit
11. Report exact verification
```

## What this repository must never become

It should not become:

- a dump of secrets
- a transcript of every ChatGPT conversation
- a duplicate copy of the entire application
- a collection of stale screenshots
- a replacement for Git history
- a place for unverified claims presented as facts

It is a **durable engineering context layer**.

## Desired outcome

A new ChatGPT session should be able to read this repository and understand:

- what Tech Katta is
- why it exists
- how it is built
- how it is deployed
- how it is secured
- how its content works
- what decisions have already been made
- what not to break
- how to test it
- how to record changes
- how to distinguish current reality from historical context

That is the purpose of this repository.
