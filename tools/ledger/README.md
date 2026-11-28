# Ledger helper

`ledger-rows.sh` prints the MongoDB ledger rows for merged app PRs (see `55-START-HERE.md` §7 and
`11-MONGODB-COMMIT-LEDGER.md`).

```
cd tech-katta            # a clone of the app repo
bash ../tech-katta-context/tools/ledger/ledger-rows.sh 417 418
```

It prints two JSON arrays: every branch commit plus the squash for `frontend_git_commits`, and the non-merge commits plus
the squash that touch `backend/` or `content/` for `backend_git_commits`. Branch commits come from GitHub's
`pull/N/head` refs, so deleted branches are fine. A commit shared by several PRs appears once per PR: de-duplicate by key.
Before inserting, `find` the keys with `{"key": {"$in": [...]}}` and insert only the missing ones (the key index is unique).
