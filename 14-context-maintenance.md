# 14 — Context Maintenance

Rewritten 2026-11-23. The October version of this file pointed new sessions at a set of first-draft documents (a
"current state" snapshot of 2026-10-06 and an Express-era architecture) that had become wrong; those are removed (see
"Removed documents" below).

## Why this file exists

This repository only works if it stays current and honest. A future session should be able to read it, learn how the
project is built and what has been decided, and not be misled by something that was true once.

## Where the truth is, in order

1. **Live reality**: what users see now, `https://tech-api.katta.cc/health`, `git log origin/main`.
2. **The application repository** (`yashbhoomkar/tech-katta`): code, CI, hosting config, and its own docs
   (`HOSTING.md`, `README.md`, `ops/README.md`, `frontend/prototypes/*/README.md`).
3. **`17-SESSION-HANDOVER.md`**: the current handover; newest entries at the top, §6 is the architecture. Start here.
4. **`13-CURRENT-STATE.md`**: the production snapshot (its first section is the newest; older sections are dated).
5. The numbered topic documents, and `ui-prototypes/` for design work.

If a document disagrees with the code, trust the code, then fix the document.

## A fresh session's reading order

```
1. README.md
2. 17-SESSION-HANDOVER.md        (newest entries first, then §0 and §1)
3. 00-SESSION-BOOTSTRAP.md       (how to behave)
4. 00-project-overview.md        (what it is, and the architecture table)
5. the topic document for the task (README lists them)
6. inspect github.com/yashbhoomkar/tech-katta, and verify live if the task is operational
7. make the change, test it, commit it, ledger it, report exactly what was verified
```

## When to update context

When any of these change: architecture, hosting, production domains, database model, security controls, CI/CD,
important UI behaviour, content schema, rollback conventions, positioning, an important bug and its fix, or an owner
decision. Not for a typo or a one-line CSS change.

## After every prototype round

Update, in this order:

- `ui-prototypes/TRIED.md` (what was shown, what the owner said, what was kept or dropped);
- `17-SESSION-HANDOVER.md` (one entry at the top);
- `18-TODO.md` (open choices);
- `13-CURRENT-STATE.md` (the "Prototype site" section, when something live changes);
- the commit ledger (below);
- the prototype's own `README.md` and `AUDIT.md` in the application repo.

## The commit ledger

The ledger is in MongoDB (`techkatta_history`, collection `frontend_git_commits`; `backend_git_commits` for the API),
not in this repository. Its structure and known entries are in `11-MONGODB-COMMIT-LEDGER.md`.

- One row per commit on `main` and on the `prototype` branch: `key` = the full 40-character SHA, `value` = what changed.
- Insert **after** the push, with the real SHA read from `git rev-parse HEAD`. Never a placeholder row or a guessed SHA.
- Prototype rows begin `[prototype branch]` or `prototype:` so they can be told apart.
- Commits to this context repository are not ledgered unless the owner asks.
- **How to check the ledger is complete** (done 2026-11-23: 115 prototype commits, one row was missing and was added):
  list `git log --format=%H origin/main..origin/prototype` in the application repo; `count` the rows whose `key` is
  in that list; if the count is short, run an `aggregate` with `$match` on the list and `$project` a `$setDifference`
  of the list and the matched keys to get the missing SHAs; read each commit with `git show`, then insert its row.
- Deleting ledger rows needs the owner's approval. Three early placeholder rows are still waiting for it
  (`18-TODO.md`).

## Avoid context drift

Never silently turn an assumption into a fact. Label it:

- **Known**: seen directly, with how (code, live check, CI).
- **Historical**: true once, kept for the record (say what replaced it).
- **Intended**: planned, not done.
- **Recommended**: advice, not a decision.
- **Unverified**: claimed but not checked.
- **Needs live verification**: true in the code, not yet seen in production.

Historical documents are not rewritten to make history look cleaner. A document that is **both** superseded **and** now
wrong is removed (below), after anything still true in it has been moved to a current document.

## Removing a document

Remove it only when all four hold: a maintained document covers the same ground; it contradicts the current state;
nothing links to it as authoritative; and anything still true or still useful has been moved. Fix every link to it in
the same commit. Git keeps the file, so the commit that removed it is the way back (`git show <commit>^:<path>`).

### Removed documents (2026-11-23, owner: "remove the docs which are stale or wrong")

All came in with the repository's first draft (added together in one commit, #161, on 2026-11-12; `11-current-state`
is dated 2026-10-06 in its own text) and were never rewritten for the changes since: the API stopped being Express, the
content moved from MongoDB to JSON on the VPS disk, the pages and figures were rebuilt. None was in the README's
reading list, and they linked only to each other. Removed in the commit that carries this file.

| Removed | Why |
|---|---|
| `01-architecture`, `03-backend` | Describe a Node/Express API, a database-backed content store and a Vercel-only frontend. The API is a dependency-free `node:http` server serving JSON from the VPS disk. Current: `00-project-overview.md` table, handover §6, `HOSTING.md`. (`02-ARCHITECTURE.md` still draws the Express topology; it now carries a Historical banner.) |
| `02-frontend`, `05-diagrams`, `13-file-map-and-contracts` | Describe `App.jsx`, `Article.jsx`, `ArticleDiagrams.jsx` and `public/diagrams/`, none of which exist. Current: `03-FRONTEND.md`, `20-UI-REDESIGN-SPEC.md`, the app repo's `frontend/next/README.md`. |
| `04-content-system` | The old library/topic/note model. Current: `05-CONTENT-MODEL.md` (first section) and the app repo's `content/README.md`. |
| `06-deployment`, `07-security`, `08-testing` | Describe the Express API with MongoDB-seeded content ("seeds MongoDB" on deploy, "Current Express hardening"), a `scripts/production-smoke.mjs` (the application repository has no `scripts/` folder) and notes from a local k6 run. Content now deploys as dated JSON releases with automatic rollback. Their numbered counterparts (`06-INFRA-DEPLOYMENT`, `07-SECURITY-RELIABILITY`, `08-TESTING-VALIDATION`) are dated evidence logs and kept; the live facts are in handover §6, §8 and §9, `15-ORIGIN-EXPOSURE-HARDENING.md`, `31-VPS-CHOICE.md`, the application repository's `HOSTING.md` and `ops/README.md` |
| `09-history-and-decisions` | Ten early decisions (humanised copy, static diagrams, slug, swipes, security, overflow, deploy discipline, ledger, this repo). Every one is carried by `01-PROJECT-IDENTITY.md`, `12-OPERATING-RULES.md` (rules 8, 9, 11, 13, 18), `09-MOBILE-SWIPE.md` and `10-GIT-HISTORY.md`. |
| `10-github-and-mongodb-ledger` | Duplicate of `11-MONGODB-COMMIT-LEDGER.md`, which is the one kept current. Its one extra fact (the Atlas organisation, `YashOrgSec`) was added there. |
| `11-current-state` | A snapshot of 2026-10-06 naming a deployment and a commit from then, and describing swipe behaviour that has since changed. Current: `13-CURRENT-STATE.md` and the handover. |
| `12-agent-operating-instructions` | A ChatGPT-era copy of `12-OPERATING-RULES.md` and `00-SESSION-BOOTSTRAP.md`. Its source-of-truth order and its wording rules for verification were moved into those two (and into this file). |
| `ui-prototypes/scroll-3d-progress` | A resume file for a scheduled run on 2026-11-18, ended "Done". Scheduled runs are discarded (README); the outcome is in `ui-prototypes/TRIED.md`. |

## What this repository must never become

A dump of secrets; a transcript of conversations; a copy of the application; a collection of stale screenshots; a
replacement for Git history; a place for unverified claims presented as facts.

**Never write down** (this repository is public):

- credentials, tokens, keys, passwords or connection strings;
- the address of an **unlisted prototype**. The 3D redesign was moved to an unlisted address on 2026-11-20 after its
  old address leaked. The new address is given to the owner in the session chat only. Do not write it here, in the
  application repository, in a commit message or in a ledger row. The application repository is also public, so an
  unlisted address hides a prototype from casual visitors, not from someone who reads the repository.
