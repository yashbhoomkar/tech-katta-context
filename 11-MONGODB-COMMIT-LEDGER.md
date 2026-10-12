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

- `frontend_git_commits` — 169 documents (live count checked 2026-10-11)
- `backend_git_commits` — 189 documents (live count checked 2026-10-11, including 34 Cloudflare hardening records inserted below)
- `git_commits` — 16 documents, legacy/older collection, still present

The connector reports `_id_` and indexes named `key_unique`. Do not assume the latter enforce uniqueness: duplicate rows were observed despite those names, and a controlled connector index probe did not honor `unique: true`. A true unique constraint is still unverified.

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


## PR #25 ledger reconciliation (2026-10-11)

PR #25 was merged as `e1f35b765015f182d32aaf645c4c4eb8387f5936`. Before inserting, both canonical collections were queried for every commit SHA from the PR and the merge SHA. None were present in either collection, so the following 10 records were inserted into `techkatta_history.frontend_git_commits` (no duplicates were inserted):

- `513ed9c4823652c84bfe35af33adcb1fb17911e3` — test: cover mobile swipe navigation in Playwright
- `a96bed4436b3d861ba70709d735b51245d62d400` — ci: label mobile swipe browser verification
- `b1e93d8687187f7b409a112d8198324197a24403` — test: bound mobile swipe wait conditions
- `672026aaed2d48c49badc7562a71eb13b7872ad4` — fix: ignore home-page left swipe navigation
- `c521ecd20038f578966cb491349ccd70a00b358a` — test: cover home forward-history swipe regression
- `f33c9f2054728e30db65c81483beaaeed8a89253` — test: run mobile swipe checks against isolated build
- `8a5b06ef8899bd132addedacf5abcf229354587a` — ci: run mobile swipe checks against built frontend
- `f16c3c4052ddec842f4361b9f1ab60cc796f8ae4` — test: clarify isolated mobile preview coverage
- `2c3f21118d37e55f10fbbf17ac90887869597743` — test: handle expected navigation during swipe simulation
- `e1f35b765015f182d32aaf645c4c4eb8387f5936` — Merge PR #25: fix home swipe-forward bug and test mobile gestures

The inserted count was 10. This records the PR's intermediate commits as well as the merge commit, consistent with the project's commit-history ledger convention.


## PR #26 ledger reconciliation (2026-10-11)

The CodeRabbit configuration PR was merged as `acbc81423a7da3f6e163462ee0667c4ed0aa35ae`. Both canonical collections were queried for the source and merge SHAs before insertion; neither SHA was present. Two records were inserted into `techkatta_history.backend_git_commits`:

- `d71c54198ae6e023fc66c9bdd64ac9fccfae8855` — ci: configure focused CodeRabbit pull request reviews
- `acbc81423a7da3f6e163462ee0667c4ed0aa35ae` — Merge PR #26: configure focused free CodeRabbit reviews

Inserted count: 2. No duplicate entries were inserted.


## PR #27 ledger reconciliation (2026-10-11)

Before insertion, both canonical collections were queried for the four PR branch commits and merge SHA. None were present. Five records were inserted into `techkatta_history.backend_git_commits`:

- `09a20233c8c32cb7c227609914a77c29af5703c3` — refactor: remove slug-specific diagram normalization
- `c7853df622dfb47fad6a7d4f88b3ea7d3b76622a` — fix: use structured distributed architecture diagram
- `af95f043c5312e103f33d09c7f231f28b288f382` — refactor: normalize article content without slug
- `71be18ccac981eb2208d6ba669dbed65fb14ca78` — test: preserve explicit diagram block semantics
- `90ac43818fc34c61dfd7fdcae3baf62f83310350` — Merge PR #27: replace legacy architecture diagram heuristic with structured content

Inserted count: 5. No duplicates were inserted.


## Full history reconciliation and legacy duplicate rows (2026-10-11)

A SHA reconciliation extracted 111 unique full commit SHAs from the current `10-GIT-HISTORY.md` and `13-CURRENT-STATE.md`, then queried both canonical collections. All 111 SHAs were present in at least one of `frontend_git_commits` or `backend_git_commits`; no missing entries were found. New PR #25–#27 entries were inserted only after checking both collections for existing keys.

A separate aggregation audit found pre-existing duplicate rows with conflicting descriptions:

- `frontend_git_commits`: `56b229a2c0fa1d586f200a41c79826ed92a0446b` occurs twice.
- `backend_git_commits`: `56b229a2c0fa1d586f200a41c79826ed92a0446b` occurs twice.
- `backend_git_commits`: `e4d4f92eee0b033ccbfb5d53928684c0d797bf93` occurs twice.

No historical records were deleted or modified. The connector reports indexes named `key_unique`, but duplicate rows demonstrate that a true unique constraint is not currently enforced for these values. Follow-up issue [#32](https://github.com/yashbhoomkar/tech-katta/issues/32) tracks exporting backups, selecting canonical descriptions, deleting only verified duplicate `_id` rows, enforcing a true unique index, and re-running reconciliation. Do not attempt ad hoc deletion during routine ledger insertion.

## PR #34 ledger reconciliation (2026-10-11)

Before insertion, both canonical collections (`frontend_git_commits` and `backend_git_commits`) were queried for the source and merge SHAs; neither was present. Two records were inserted into `techkatta_history.backend_git_commits`:

- `fba34153e673e4b72db7e546f7169a1296174189` — test: verify rate limit ignores spoofed forwarded IP
- `16bf385f1f62dbea5d11d38fed64028e99ca7a95` — Merge PR #34: test forwarded IP rate-limit attribution

Inserted count: 2. No duplicate entries were inserted.

## Duplicate-row backup created; unique-index enforcement blocked (2026-10-11)

Before any deletion, all six known duplicate rows were copied to `techkatta_history.commit_ledger_duplicate_backup_20261011`. The backup was read back and verified to contain six records. Each record preserves the source collection name, original MongoDB `_id` as `originalId`, `key`, and original `value`. Original ledger rows were not deleted or modified.

Canonical descriptions were checked against GitHub commit metadata:

- `56b229a2c0fa1d586f200a41c79826ed92a0446b` — `Harden backend health, TLS, and fallback content`.
- `e4d4f92eee0b033ccbfb5d53928684c0d797bf93` — `Merge pull request #14: add production verification and CodeQL`.

The connected Atlas `create_index` operation does not expose or honor a `unique: true` option. A controlled probe on the backup collection created an ordinary non-unique index despite duplicate `key` values; the temporary probe index was then dropped. Therefore no canonical rows were deleted and no unique-index claim is made. Issue [#32](https://github.com/yashbhoomkar/tech-katta/issues/32) remains open until a supported maintenance path can create and verify the actual unique index and safely complete deduplication.


## PR #35–#52 Cloudflare origin-hardening ledger reconciliation (2026-10-11)

After the final production workflow passed, both canonical collections were queried for every source and merge SHA from merged application PRs #35–#52 (excluding superseded, unmerged PR #43). None of the 34 SHAs existed in either canonical collection. All 34 records were inserted into techkatta_history.backend_git_commits and read back successfully; no duplicate rows were added.

Source/merge SHA pairs:
- PR #35: 24c91463f1bbaa8b6bf77fceed2cd1aa821cc6ab / fbec7528de43c84799596574e31f820b9fc7bb61 — guarded Cloudflare origin hardening workflow.
- PR #36: f80d6526a77cd95aeaf3ddff9379e052b4d91b66 / 02d7dd927e6263417b5f753b013f2b5e7c12a63e — DNS address sorting.
- PR #37: 46dc27fa8ccb7f09adaa34279626e8af9f264dff / 0db481a285f76b8527b93262ed51f462ec6c0adb — preflight diagnostics.
- PR #38: 271949b4d129b85e5b0df880eb0e8a11152026c5 / 3505b81bd8dff72147d0b5eeac489f2284524d4c — UFW status matching.
- PR #39: c06ed9b2fdb9fb6fcdf058676e15fb32db730689 / a287e1a017b2f3ead0d3bd563df4f5531c02e645 — range-fetch diagnostics.
- PR #40: 5c03dc735631df36c67d956a18b257bb41c19c35 / 136692db4320c637fb9b49c9cd771d033b39fbf2 — rollback artifact path.
- PR #41: 616f57a803caeafa91691b856dc03312a033dfc2 / a69a8eb597ebf7cfd60877593680a11367ec9e6f — rollback file checks.
- PR #42: 61cfe4ab11e137fadfe855ee63fa455511cefd39 / 2af6ed507bb5ad70356dbecdb9c55615f8c70546 — rollback state handling.
- PR #44: d92629c8b0b4cd51bd2957f194d059569ff420d1 / c2c65743c743e09ac07144ea3429093e3335aa05 — stat-based rollback state.
- PR #45: cb39d3bc296bcb2684becf6f80e54f7bff92c21b / ae6f34e43cf8f24b8fbb79fd1dd3244e32afc958 — state diagnostics.
- PR #46: d587a49415c76c42fe5c0e4a3442c67442b7b7a6 / c143cb285b1ef95bc5cf1e3ce5f217126a0157db — rollback branch selection.
- PR #47: 26a8a936715fec774ab6a1d65cf7f0351cbd3f50 / 9e2c81ceb740feec4426d04ef85ee2efd4ab86d0 — remote shell handling.
- PR #48: 03b927226667e129f57f28ac00b9c047ad6baeb4 / 939c93eefd138186964d7d4fd548a8d1b35132b6 — remove SSH-action heredocs.
- PR #49: 090384b84eb43f0cf71e7e07dd1e928913ec8341 / f9f4345009094dc480337d6cb8895b1196c4fe4b — Cloudflare smoke User-Agent.
- PR #50: 794a548d627a97579dd15b3b59faff5262eb7ed5 / 8a537da1867823b1aa3d84bde88cbfb81dec5fb1 — UFW sync logic.
- PR #51: 4b4c818542f1d59b0221d73fdebad843f84b565b / 54ccb96db467a49207c645bde49d89124df0dbf1 — SSH script-stop handling.
- PR #52: 4ca762e2a22434bf9a5261bd154eee3d30b1742b / f6ffb10ceca94a3fc2791056eb25480b430a7d92 — post-firewall smoke User-Agent.

Final main HEAD: f6ffb10ceca94a3fc2791056eb25480b430a7d92. Workflow run 38165442874 passed the Cloudflare proxy, Nginx real-IP, rate-limit attribution, Cloudflare-only UFW, SSH preservation, public API/CORS, and direct-origin isolation checks. Issue #28 is closed; umbrella issue #18 remains open for other audit findings.


## PR #53 ledger reconciliation (2026-10-12)

Before insertion, both canonical collections (`frontend_git_commits` and `backend_git_commits`) were queried for the source and merge SHAs; neither SHA was present in either collection. Two records were inserted into `techkatta_history.backend_git_commits`:

- `db2395bb70fff2421583f79b2a431c22f8e21c8a` — PR #53 source commit: added regression tests for article substring search semantics.
- `34d0d4db2aae0234b2e45d6fc427a75fe4a21653` — PR #53 merge commit: added regression tests for article substring search semantics; runtime search behavior unchanged.

Inserted count: 2. No duplicate entries were inserted.


## PRs #54–#57 ledger entries and migration preflight (2026-10-12)

The following application source and merge SHAs were checked in both canonical collections first, then inserted into `techkatta_history.backend_git_commits` only when absent. Inserted count: 12.

- `328a4d3c5d4e07d5992b9d74b6961e007b4cc9b0` — PR #54 source: add isolated MongoDB unique-index capability verification workflow.
- `f778066ea0fcd3108e6df1ad1bbc032dd987194b` — PR #54 source: trigger capability verification after merge.
- `cacbd6809d37b140e8eff0a207f9cc8abb896175` — PR #54 source: non-interactive sudo for the isolated probe.
- `0607590574b1e0c019228f4384458fe6a4dc8171` — PR #54 merge: guarded capability verification workflow.
- `411c74d25fdd6199cb046893bece522b23cc5144` — PR #55 source: execute probe from a temporary script file.
- `bd00c3b32d4623c51e073a9b90b002871a10dff5` — PR #55 merge: temporary-file probe execution.
- `9edeacae3d7c17986c4d5ebf6c17be03689f7efa` — PR #56 source: avoid SSH action stdin rewriting with a base64-decoded script.
- `8822cab92ebcca8fd0e789e9199b85404144a7b7` — PR #56 merge: base64-decoded temporary script.
- `7ccd1ff380412dfca2e74bc002b5425641102380` — PR #57 source: guarded deduplication script with exact-ID, backup, rollback, and SHA-union checks.
- `aa6e56bbb71f8c296b1e8fe032340b0219f59bf0` — PR #57 source: guarded GitHub Actions migration workflow.
- `7fcaa5e21789bf61708e06dd78e15b361575d739` — PR #57 source: pass the encoded migration script through the SSH workflow environment.
- `56bb3bd33481cd836885d0ede744f8639770a381` — PR #57 merge: guarded ledger deduplication and unique-index migration.

### Capability and migration results

- Probe run https://github.com/yashbhoomkar/tech-katta/actions/runs/38197243213 passed: the VPS runtime created a temporary unique index, confirmed MongoDB reported `unique: true`, verified duplicate-key rejection (code 11000), and removed the temporary collection.
- Migration run https://github.com/yashbhoomkar/tech-katta/actions/runs/38197586906 failed the backup validation gate for `frontend_git_commits:6acb79744d4d384f7be306f8`. The script exited before any canonical deletion or index change.
- The Atlas connector independently confirms the expected backup row and the canonical duplicate row. Reconcile the VPS runtime's database view/connection before retrying. Do not relax the backup or exact-ID gates.
- All six backup records remain intact. No canonical ledger rows have been deleted. Issue #32 remains open pending a successful migration and independent post-migration verification.
