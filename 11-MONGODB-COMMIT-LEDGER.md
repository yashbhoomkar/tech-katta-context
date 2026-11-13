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

Latest count (2026-11-13, after #330): `frontend_git_commits` 891, `backend_git_commits` 682 (#330: `d190370c3cd251fac58f214c31257293f3aceb25`, sync `220a7af7a7cc33bdb221ff0f1ae321957a74fcd0`, squash `8986c1f9ef921705461b7272c2f2c222c0e2e0ce`, frontend only). Before that, after #329: `frontend_git_commits` 888, `backend_git_commits` 682 (#328, #329: 6 frontend rows; table below). Before that, after #327: `frontend_git_commits` 882, `backend_git_commits` 682 (#325–#327: 9 frontend rows, 2 backend rows for #325; table below). Before that, after #324: `frontend_git_commits` 873, `backend_git_commits` 680 (#323 and #324: 7 rows, frontend only; table "PRs #323–#324" below). Before that, after #322: `frontend_git_commits` 866, `backend_git_commits` 680 (#320 `846ee2d815ac81a8cef06eaa8539ff2128013acd` in both; #321 `37b148b1e36d9fa92945fa365362766dbcd6160d` and #322 `4bc95ccb87a7e2b2f64b6b8ffb58697e1391617b` frontend). (#318, merged by another session right after, is not recorded by the #317 session.)

Current live counts checked 2026-10-12:

- `frontend_git_commits` — 168 documents
- `backend_git_commits` — 229 documents
- `git_commits` — 16 documents, legacy/older collection, still present

The Atlas connector's index listing omits the `unique` option, so index names alone are not proof of enforcement. The VPS-runtime migration workflow independently read `listIndexes()` and verified `unique: true` for the `key` index in both canonical collections (run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38205375184). Duplicate-key aggregation returns zero groups in both collections.

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

Historical status as of 2026-10-11: the Atlas connector's `create_index` operation did not expose or honor `unique: true`. This limitation was resolved using the VPS runtime credentials; see the final ledger-integrity entry at the end of this file.


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
- Historical status before PRs #60–#68; the later successful deduplication and unique-index verification are documented in the final ledger-integrity entry at the end of this file.


## PR #58 ledger entries and read-only reconciliation (2026-10-12)

The following application SHAs were checked in both canonical collections and inserted into `techkatta_history.backend_git_commits` because neither was already present:

- `49c53b0cfbae939cf500e90b4b04ba9961fdc370` — PR #58 source: add read-only VPS ledger database-view diagnostics.
- `4cc2c7b695fbf5352d1392a6fb91f3cf4cf0b1f5` — PR #58 source: add the read-only inspection workflow.
- `c4829f939a0162cbb3f5ac3619d7f70e7c7aa28e` — PR #58 merge: add read-only VPS ledger database inspection.

Inserted count: 3.

Read-only workflow run https://github.com/yashbhoomkar/tech-katta/actions/runs/38197871440 succeeded. The VPS runtime view reports the same six backup rows, matching backup fields for all three reviewed duplicate records, and the expected canonical duplicate rows. It still reports non-unique `key_unique` indexes and duplicate groups:
- Frontend: SHA `56b229a2c0fa1d586f200a41c79826ed92a0446b`, IDs `6acb780fc0d34c06a4bdbc9c` and `6acb79744d4d384f7be306f8`.
- Backend: SHA `56b229a2c0fa1d586f200a41c79826ed92a0446b`, IDs `6acb7805c1d086df8c89e029` and `6acb7969c1d086df8c89e02a`; SHA `e4d4f92eee0b033ccbfb5d53928684c0d797bf93`, IDs `6acb734cc0d34c06a4bdbc97` and `6acb7378c0d34c06a4bdbc98`.

The prior migration preflight failure was not reproduced by this read-only inspection. No canonical records or indexes changed. Keep issue #32 open; add field-level diagnostics to the migration preflight and do not bypass its backup validation.


## PRs #59–#61 and successful deduplication (2026-10-12)

The following source/merge SHAs were checked in both canonical collections and inserted into `techkatta_history.backend_git_commits` only when absent:

- `aadf03acb327215e4e7c3005dc32bfd2511733f8` — PR #59 source: add field-level backup preflight diagnostics.
- `36696b02bea329020b4f4cb01108818453131a6d` — PR #59 merge: add backup field diagnostics.
- `fa976824d044953d3b567a10c91a20f2026161e9` — PR #60 source: correct backup ID prefix mapping.
- `6d67cbbfcfec95d1572dd612c768ae2e6e91568e` — PR #60 merge: use verified `frontend:` / `backend:` backup prefixes.
- `c24e4988021d8fa2319791068beb7c38f75ca8ab` — PR #61 source: assert migration postconditions.
- `c597e7f416a9c4b9c1c7268c936845755d916720` — PR #61 merge: verify ledger deduplication and unique-index postconditions.

Inserted count: 6.

### Verified migration result

Run https://github.com/yashbhoomkar/tech-katta/actions/runs/38198144807 passed after correcting the backup ID prefix. Exactly these three duplicate rows were deleted, with their copies preserved in the backup:
- `frontend_git_commits` `_id=6acb79744d4d384f7be306f8`, SHA `56b229a2c0fa1d586f200a41c79826ed92a0446b`.
- `backend_git_commits` `_id=6acb7969c1d086df8c89e02a`, SHA `56b229a2c0fa1d586f200a41c79826ed92a0446b`.
- `backend_git_commits` `_id=6acb7378c0d34c06a4bdbc98`, SHA `e4d4f92eee0b033ccbfb5d53928684c0d797bf93`.

The workflow verified all six backup records, retained the intended canonical row for each duplicate SHA, enforced `unique: true` on `key_unique` in both collections, found no remaining duplicate groups, and confirmed the union of SHA keys was preserved. Independent read-only verification run https://github.com/yashbhoomkar/tech-katta/actions/runs/38198308593 passed: backup count six; deleted rows absent; retained rows intact; both indexes report `unique: true`; duplicate groups empty.

Historical count and reconciliation note from the PR #61 stage. This was superseded by the final 2026-10-12 reconciliation at the end of this file.


### Final SHA reconciliation and closure — issue #32

The final reconciliation extracted 139 unique 40-character SHAs referenced by `10-GIT-HISTORY.md` and `13-CURRENT-STATE.md`, searched both `frontend_git_commits` and `backend_git_commits`, and found all 139 accounted for with zero missing. Issue [#32](https://github.com/yashbhoomkar/tech-katta/issues/32) was closed as completed.

Final verified state: frontend 168 documents; backend 210 documents; six duplicate copies remain in `commit_ledger_duplicate_backup_20261011`; both canonical `key_unique` indexes have `unique: true`; both collections have zero duplicate-key groups. The migration and independent verification evidence is recorded above. Umbrella issue #18 remains open.



### PR #62 ledger reconciliation (2026-10-12)

Before insertion, both canonical collections were queried for the initial source, follow-up source, and squash merge SHAs; none was present. The three records were inserted into `techkatta_history.backend_git_commits`:

- `9a17a4602eb3cf056d45922b0414b60b7d77d9ca` — PR #62 source commit: production audit maintenance documentation and AI review evidence.
- `ba79429afdc095d9fb3725ab7ccc23f0813da98c` — PR #62 follow-up: document the automatic `main` push trigger for the ledger repair workflow.
- `f6998eb941ca49ca7ee5b0e72d61288e25b6d8c2` — PR #62 squash merge.

Inserted count: 3. Post-insert lookup confirmed all three records. Current canonical counts: frontend 168, backend 213. Both canonical `key_unique` indexes remain unique; the six-row duplicate backup remains intact; no duplicate-key groups remain.


### PR #64 ledger reconciliation (2026-10-12)

Both canonical collections were queried for the workflow source, documentation source, and squash merge SHAs; none was present. Three records were inserted into `techkatta_history.backend_git_commits` and read back successfully:

- `43088d8b13471c48850a1801c0bbc83be83900c2` — remove automatic trigger from the destructive ledger repair workflow.
- `18e5d4e917d13ca1924515f5b1f8e308e9621af3` — document manual-only repair and the explicit confirmation gate.
- `8dfb94b265a97954c9f996f32175aa6eb62235ca` — squash merge for PR #64.

Inserted count: 3. Current canonical counts: frontend 168, backend 216. Both canonical collections still have zero duplicate-key groups. The six-row duplicate backup remains intact. The destructive repair workflow is manual-dispatch only and requires `confirm_repair: true`; the merge did not trigger it.


### PR #65 ledger reconciliation (2026-10-12)

Before insertion, both canonical collections were queried for the source and squash merge SHAs; neither was present. Two records were inserted into `techkatta_history.backend_git_commits` and read back successfully:

- `d72ed677a9e52f2b01fe016a5c91257c94a3b3a0` — PR #65 source: remove automatic production k6 baseline trigger and require explicit manual confirmations.
- `513c99a31a49f802a64c567be45d01c9d2628059` — PR #65 squash merge: manual-only production baseline.

Inserted count: 2. Current canonical counts: frontend 168, backend 218. Both canonical collections still have zero duplicate-key groups; the six-row duplicate backup remains intact.


## Final ledger integrity state — 2026-10-12

### Verified canonical state
- MongoDB Atlas cluster: `Cluster0`, MongoDB version `8.0.34`.
- `frontend_git_commits`: 168 documents; `backend_git_commits`: 224 documents; legacy `git_commits`: 16 documents.
- Backup collection `commit_ledger_duplicate_backup_20261011` still contains all six preserved duplicate copies.
- The earlier PR #60 migration removed exactly three duplicate canonical documents, preserving them in the backup. PR #68 did not modify or delete any ledger documents.
- Guarded index enforcement run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38205375184. Preflight verified all six expected backup records, all three expected surviving duplicate-SHA records, zero duplicate-key groups, and zero non-string keys in both canonical collections. The workflow then read index metadata and verified `unique: true` for the `key` index in both collections. Any redundant non-unique `key_unique` index was dropped only after the unique index had been verified.
- A separate isolated capability probe (https://github.com/yashbhoomkar/tech-katta/actions/runs/38205085520) verified that a true unique index rejects a duplicate insert with MongoDB error code `11000`; the temporary probe collection was removed.
- Final SHA reconciliation extracted 156 unique 40-character SHAs referenced in `10-GIT-HISTORY.md` and `13-CURRENT-STATE.md`. All 156 are present in at least one canonical ledger collection; zero missing.

### Recent source/merge SHA reconciliation
The following 14 source/merge SHAs for PRs #53, #54, #55, #67, and #68 are present in `backend_git_commits`. Eight were already present; six missing PR #67/#68 records were inserted and read back successfully:
- `db2395bb70fff2421583f79b2a431c22f8e21c8a` — PR #53 source: article-search substring regression tests.
- `34d0d4db2aae0234b2e45d6fc427a75fe4a21653` — PR #53 merge: preserve article-search semantics.
- `328a4d3c5d4e07d5992b9d74b6961e007b4cc9b0`, `f778066ea0fcd3108e6df1ad1bbc032dd987194b`, `cacbd6809d37b140e8eff0a207f9cc8abb896175`, `0607590574b1e0c019228f4384458fe6a4dc8171` — PR #54 probe workflow source/merge commits.
- `411c74d25fdd6199cb046893bece522b23cc5144`, `8822cab92ebcca8fd0e789e9199b85404144a7b7` — PR #55 source/merge commits.
- `a5bc819cbcc4d987a4eef3455a967c39478b77be`, `0743b72a218ee36066b78d3f7d3bf88fec0f461f`, `5e931653b3915a6ee0b58946b2b27c598899e789`, `af411f0711c077185d90be3c8182b80df4c9f910` — PR #67 source/merge commits.
- `eef16ceebaa99e0c9f8ebcc32c7619f8fe0d4fb0`, `d5f8f8c16d98ed775fa0937a022ddc1230610c68` — PR #68 source/merge commits.

The description for merge SHA `8822cab92ebcca8fd0e789e9199b85404144a7b7` was corrected to identify it as PR #55's merge. No duplicate records were inserted.

Issue [#32](https://github.com/yashbhoomkar/tech-katta/issues/32) is closed after the corresponding issue and context updates. Umbrella issue #18 remains open.


## PR #69 ledger reconciliation and local smoke evidence — 2026-10-12

Before insertion, both canonical collections were queried for the two source SHAs and squash merge SHA from PR #69; none was present. Three records were inserted into `techkatta_history.backend_git_commits` and read back successfully:
- `fc11a1c074b3b86d1870a12ac633d044de6a0c47` — PR #69 source: bounded local k6 integration smoke profile.
- `c0cf007db20b7d86085068bdeb0326f2c8a9f589` — PR #69 source: local-only MongoDB, backend, frontend, and k6 CI workflow.
- `4ce8403a9fc610ab9840479d29aabed162d0aeb6` — PR #69 merge: bounded local k6 integration smoke; production capacity remains unmeasured.

Inserted count: 3. Current live counts: frontend 168, backend 227, legacy `git_commits` 16. Both canonical collections retain unique `key` indexes and zero duplicate-key groups; the six-row duplicate backup remains intact.

Local-only k6 run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38205978125. It completed 442 HTTP requests in 60 seconds (~7.37 req/s overall), with zero HTTP failures, 884/884 checks passing, zero dropped iterations, API-read p95 3.69 ms, frontend p95 1.31 ms, and health p95 1.32 ms. This does not measure production capacity or the VPS/Nginx/Cloudflare/Atlas network path. Issue #33 remains open pending staging or an approved monitored production test plan.

Issue #29 remains blocked pending verified MongoDB credential rotation/least-privilege runtime access and a dedicated Tech Katta secondary. No secondary was provisioned and no production routing was changed. Issue #32 is closed; umbrella issue #18 remains open.


## PR #71 ledger reconciliation and production browser smoke — 2026-10-12

Before insertion, both canonical collections were queried for PR #71's source and squash merge SHAs; neither was present. Two records were inserted into `techkatta_history.backend_git_commits` and read back:
- `34b86a7737f827164dddd74f0f0fe619b9ec145a` — PR #71 source: add read-only Chromium production browser smoke workflow.
- `d0aa934e87ad5ed9e0c1cc723de0a8f8b0e8fc2b` — PR #71 merge: production browser smoke passed for SPA routes, browser-origin API/CORS, and mobile-emulated swipe checks.

Inserted count: 2. Current live counts: frontend 168, backend 229, legacy `git_commits` 16. Both canonical ledgers retain enforced unique key indexes and zero duplicate-key groups; the six-row duplicate backup remains intact.

Production browser smoke run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38206729819. Chromium checked three production SPA routes, a browser-origin API/CORS contract, and mobile-emulated swipe behavior; all checks passed and there were no uncaught browser exceptions. The run sent only a handful of GET requests, not a load test. No production configuration changed.

Issue #29 remains blocked pending issue #70 and a dedicated secondary; issue #33 remains open for a representative staging/approved capacity test. Issue #32 remains closed and umbrella issue #18 remains open.


## PR #73 and PR #74 ledger reconciliation — 2026-10-12

Before insertion, both canonical collections were queried for PR #73 and PR #74 source/merge SHAs; none was present. Four records were inserted into `techkatta_history.backend_git_commits` and read back:

- `22bf7413cd230ad3ad88c2692f5dce0cfddd3baf` — PR #73 source: replace fragile remote probe script generation with base64 decoding.
- `23e6e3712329d17bfd324d62b7bc967b79708484` — PR #73 merge: introduce the VPS-run MongoDB unique-index capability probe.
- `86ee7329820b6e086df253c53e92c39a457d7e2e` — PR #74 source: remove the exact stale temporary probe collection and fix current-run cleanup.
- `a66df730143e7bf44d2206ce44dbdd6a890ffe63` — PR #74 merge: isolated unique-index probe passed, duplicate insertion rejected, and both stale/current temporary collections removed.

Inserted count: 4. Latest live counts: frontend 168, backend 233, legacy `git_commits` 16. Read-only aggregation found zero duplicate-key groups in both canonical collections. The six-row `commit_ledger_duplicate_backup_20261011` backup remains intact.

Verification run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38244494719. This is a capability probe against a temporary collection, not the canonical migration. The canonical migration and independent read-only verification passed earlier in runs https://github.com/yashbhoomkar/tech-katta/actions/runs/38198144807 and https://github.com/yashbhoomkar/tech-katta/actions/runs/38198308593. PRs #73 and #74 did not modify canonical ledger documents.

Issue #32 is closed; umbrella issue #18 remains open for remaining tracked audit work.


## PR #75 ledger reconciliation — 2026-10-12

Before insertion, both canonical collections were queried for all PR #75 source and squash merge SHAs; none was present. Nine records were inserted into `techkatta_history.backend_git_commits` and read back:

- `1149264f597a7268d6a918dadad193addfce7f9d` — initial guarded runtime credential rotation helper.
- `b5627e98c31324de15ca0498123e5a3165a5ad16` — manual-only secret-backed rotation workflow.
- `5ab5e43d1cefc4606535c6704b7fe0578ebf56f4` — env-file ownership handling refinement.
- `a3d512465241eb0c530ccd68af1dc59ee24fcfd3` — remove unused import.
- `7a0d7e20b8e879d2f0d183b90d7ac0dc7f56df49` — CI syntax validation for the helper.
- `db798828f86099e26f7ebc6c9c729c4ae1e93033` — include helper/workflow paths in Backend CI triggers.
- `49385457ce25cc63e6e659d88ca849b79a8f36f2` — exclusive mode-0600 writes for rotation files.
- `395b01ad841077e6713fbbbb07b4cf4293451678` — remove check-then-use path checks; CodeQL reported no new alerts.
- `ddb4ee014fa18df1d6c9fd6bd80aa233bd653312` — PR #75 merge: manual-only credential rotation preparation, not an actual credential rotation.

Inserted count: 9. Latest live counts: frontend 168, backend 242, legacy `git_commits` 16. Duplicate-key aggregation remains zero in both canonical collections; the six-row duplicate backup remains intact.

Backend CI and CodeQL passed. The workflow is not automatic and did not modify production. Issue #70 remains open until a new least-privilege Atlas URI is securely stored as the repository secret and the guarded workflow passes production readiness/API checks.


## PR #76 ledger reconciliation — 2026-10-12

Before insertion, both canonical collections were queried for the PR #76 source and merge SHAs; none was present. Four records were inserted into `techkatta_history.backend_git_commits` and read back:

- `763c6ded46a730fb1657e061a40085eca0078c09` — PR #76 source: add bounded local k6 rate-limit profile.
- `aa1fe26f7c50db7e1144821b50357252cc419524` — PR #76 source: run after the prior rate-limit window expires and upload diagnostics.
- `c012d1bfc4470dafe7988cb7178f3a487c1fe997` — PR #76 source: compare HTTP header names case-insensitively.
- `4f9e0c6739dd747edc27bf9ee79419c4092849ad` — PR #76 merge: local k6 profile passed with 120 accepted and 31 throttled requests, p95 2.99 ms, zero failed requests, zero dropped iterations, and all checks passed.

Inserted count: 4. Latest live counts: frontend 168, backend 246, legacy `git_commits` 16. Duplicate-key aggregation remains zero in both canonical collections.


## Production-readiness remediation source commit — 2026-10-15

The application source commit `67210687a8668cdcde4cfda43831e9f4de5638c3` is recorded in both canonical collections because it changes frontend behavior and backend/runtime/deployment workflows.

- `frontend_git_commits`: `67210687a8668cdcde4cfda43831e9f4de5638c3` — PR audit source commit: restrict production load probes to explicit manual dispatch; gate serialized VPS deployments on backend tests; add frontend API/fallback, video-embed, and storage hardening with regression tests; fix fatal shutdown exit status; use lockfile-enforced Docker install.
- `backend_git_commits`: same key and description.
- The commit is on `fix/production-readiness-audit-2026-10-15`; PR review, CI, merge, and deployment have not yet been completed at the time of this entry.
- Live counts immediately after insertion: frontend 169, backend 247, legacy `git_commits` 16. Existing unique-index and duplicate-check evidence remains unchanged.


## CodeQL review follow-up — 2026-10-15

Application commit `4297927885cf9f30d3bbb6a1f531ec8526c67b55` is recorded in both canonical collections because it is part of the frontend API module in the same cross-cutting remediation PR.

- `frontend_git_commits`: `4297927885cf9f30d3bbb6a1f531ec8526c67b55` — PR review follow-up: remove slug-derived values from browser console format strings so externally controlled article slugs cannot affect console formatting; retain structured diagnostic fields.
- `backend_git_commits`: same key and description.
- Live counts after insertion: frontend 170, backend 248, legacy `git_commits` 16.


## API list-error/fallback follow-up — 2026-10-15

Application commit `e32643d97167ee6bd3471277910f785d0fdd8f16` is recorded in both canonical collections because it changes the frontend API and list-state behavior as part of the cross-cutting production-readiness PR.

- `frontend_git_commits`: `e32643d97167ee6bd3471277910f785d0fdd8f16` — PR review follow-up: distinguish network outages from API 5xx/invalid list responses for article and category endpoints; do not retain stale bundled content on server errors, surface a service warning, and add regression coverage.
- `backend_git_commits`: same key and description.
- Live counts after insertion: frontend 171, backend 249, legacy `git_commits` 16.


## PR #77 merge commit — 2026-10-15

- `frontend_git_commits`: `e8cbf46cce377ac7501af091e901e177043d4778` — PR #77 merge commit: production-readiness audit fixes merged after all PR checks passed. CodeQL and Semgrep reported no new alerts. Frontend regression tests/build, backend tests, Vercel preview checks, and isolated local MongoDB/API/frontend smoke passed. Bounded local k6 rate-limit verification: 151 requests (~3.02 req/s), 120 accepted and 31 throttled, p95 2.36 ms, zero failed requests, zero dropped iterations, 755/755 checks passed. Not a production capacity test.
- `backend_git_commits`: same key and description.
- Source commits `67210687a8668cdcde4cfda43831e9f4de5638c3`, `4297927885cf9f30d3bbb6a1f531ec8526c67b55`, and `e32643d97167ee6bd3471277910f785d0fdd8f16` are also present in both canonical collections.
- Live counts after insertion: frontend 172, backend 250, legacy `git_commits` 16. Final aggregate audit ran after merge insertion and returned zero duplicate keys in both canonical collections.


## PR #77 deployment verification — 2026-10-15

- Exact production merge SHA: `e8cbf46cce377ac7501af091e901e177043d4778`; source SHA: `e32643d97167ee6bd3471277910f785d0fdd8f16`. The merge commit tree matches the source tree.
- Both canonical collections contain the source SHAs `67210687a8668cdcde4cfda43831e9f4de5638c3`, `4297927885cf9f30d3bbb6a1f531ec8526c67b55`, `e32643d97167ee6bd3471277910f785d0fdd8f16`, and merge SHA `e8cbf46cce377ac7501af091e901e177043d4778`.
- Post-merge deployment succeeded: Vercel production READY with `tech.katta.cc` alias; VPS health reported MongoDB connected; 11 production API endpoint checks plus CORS/security headers passed; Chromium smoke passed three SPA routes, browser-origin API/CORS, mobile swipe checks, and no uncaught page exceptions.
- Latest recorded counts after merge insertion: frontend 172, backend 250, legacy `git_commits` 16. Final aggregate audit ran after merge insertion and returned zero duplicate keys in both canonical collections.
- CodeRabbit review was still marked in progress at deployment time; do not describe it as a completed independent review. CodeQL and Semgrep passed.


## CodeRabbit follow-up PR #78 source commit — 2026-10-15

- `frontend_git_commits`: `a32ddafac407ced7e69c8f7ed622c2412a6b7478` — PR #78 source commit addressing CodeRabbit follow-up: deploy exact tested GitHub SHA for checkout/dependencies/content sync/restart; run production browser smoke after successful production deployment status and verify deployed build SHA; assert canonical article heading/body; reject missing/null/primitive/array remote content after HTTP success while preserving valid empty content objects and allowing bundled fallback only on network unavailability.
- `backend_git_commits`: same key and description.
- Live counts after insertion: frontend 173, backend 251, legacy `git_commits` 16. Final duplicate-key aggregation must be rerun after the PR's merge commit.


### PR #78 deployment-guard follow-up — 2026-10-15

- `frontend_git_commits`: `6688b2f1e7dec0191ddf1457fb211062804e4cf9` — Set the production-branch guard step working-directory to the workspace root so it can run before checkout despite the backend job's default working-directory.
- `backend_git_commits`: same key and description.
- Live counts after insertion: frontend 174, backend 252.


### PR #78 CI coverage follow-up — 2026-10-15

- `frontend_git_commits`: `db7ec031caff4d5833201a1caa51f8b39766b909` — Run the backend deployment workflow's test job on pull requests touching backend/scripts/deploy workflow, while skipping the production deploy job and production-branch guard on PR events.
- `backend_git_commits`: same key and description.
- Live counts after insertion: frontend 175, backend 253.


### PR #78 CodeRabbit second-review fixes — 2026-10-15

- `frontend_git_commits`: `290c256a9608d65029994266387492389cdea438` — PR #78 CodeRabbit follow-up: restrict deployment workflow token to contents:read; pin checkout/setup-node/SSH/artifact actions to full SHAs; disable persisted checkout credentials in both jobs; fetch the exact deployment SHA; validate nested article content iterables before render; make browser smoke fail when article section expansion/visibility fails; add regression tests and JSDoc for analyzed functions.
- `backend_git_commits`: same key and description.
- Live counts after insertion: frontend 176, backend 254.


### PR #78 workflow syntax correction — 2026-10-15

- `frontend_git_commits`: `8139baf8ee1c460817cd82084bc09746f8e2842d` — Remove duplicate top-level permissions mapping while retaining the explicit contents:read least-privilege scope; prior workflow push run failed to parse the duplicate key.
- `backend_git_commits`: same key and description.
- Live counts after insertion: frontend 177, backend 255.


## Landing page ledger reconciliation — 2026-10-28

A review of the live ledger found that the three merged landing-page commits below were missing. They have now been inserted into `frontend_git_commits` using the required `key = full SHA`, `value = concise change description` shape:
- `3db601998b8b383dafa2e51560cb495eeb61cc1f` — responsive Tech Katta landing page.
- `0fa822754f4ab7d13285e05c53b6a03ac49d2d7b` — format landing page stylesheet.
- `63c8926871bff6e952e5d1d95a90ea38d52cc721` — homepage route fallback.

The following PR #99 source commits were also inserted into `frontend_git_commits`:
- `b4a1643d59577f3369649cdde96a3e3f96605ca9` — restore readable desktop Quick Notes layout.
- `b137add6ff37bc4123604a71a0de8b624ea4b86e` — improve custom Kafka figure alternative text.
- `53095e740cdfd419d698d6ededdaace44c97e00e` — create original Kafka architecture illustration.

PR #99 is still open. If it is merged, record its merge commit SHA separately after the merge. The missing earlier records were a process gap; do not claim they were present before this reconciliation.

- PR #99 follow-up: `e998197d95b531ae77fcb863cdac4dfc25ecfed5` — show complete consumer partition assignment in the custom Kafka architecture diagram. Inserted into `frontend_git_commits`.

- PR #99 merge commit `a4ab9fb7083015616e474a8f2a943ceeb6f6f201` — desktop layout fix and Swiss-style Kafka block component diagram. Inserted into `frontend_git_commits` after merge.

## Landing page desktop/mobile polish ledger — 2026-10-29

Inserted these PR #100 source commits into `techkatta_history.frontend_git_commits` using the full SHA as `key` and concise commit message as `value`:
- `93e30fbb60fe3c2db35580c0c242ff5af144e43b`
- `c32c3419e69978a8332ab78a76a0e00e917f47c5`
- `ae9e3510d1e9a3888dea22a5845f6ef53af7ab5f`
- `6034f25b0a9ccef6ff21466f55ffc31b58ef6327`
- `3bf9b9c6113b57cef992e64b38e0e5a0843e5b12`

PR #100 remains open pending independent review and verification of CodeQL workflow results. The Vercel preview build is ready; this is not proof of CodeQL success or screenshot-based visual testing.
## PR #100 merge ledger entry — 2026-10-29

Inserted merge commit `30e8d10b5cb3fbf2963a694bbf972c1b98314657` into `techkatta_history.frontend_git_commits` with the concise merge description. The five source commits are also recorded above.

## Full reconciliation against main — 2026-11-04

The ledger had not been updated since the PR #106 merge (`3d3e40fd00c9d2d8868c6f7606b1d8e0ca76c75a`).
Earlier cloud sessions were blocked from connecting (the safety classifier refused
`remote-atlas-connect`); on 2026-11-04 the owner added the MongoDB plugin and asked for the remaining
ledger updates, and the connection was allowed.

Method:
1. A full (unshallowed) clone of `tech-katta`: `git rev-list origin/main` gave 504 commits. The cloud
   checkout is shallow by default, so a plain `git rev-list` there shows only ~150; run
   `git fetch --unshallow origin` first.
2. Every one of the 504 SHAs was checked against the union of `frontend_git_commits`,
   `backend_git_commits` and the legacy `git_commits`, with an aggregation using `$setDifference`.
3. Missing SHAs were classified by the files each commit changed (merges by their first-parent diff):
   `frontend/` or `status-page/` → frontend collection; `backend/`, `content/`, `.github/`, `tools/` or
   repo config → backend collection; both → both. The three "Merge main into the branch" syncs
   (no changes of their own) went with their PR's area (frontend). `27ad6702` (`fix(backend)`, no
   file changes of its own) went to backend.
4. Values are the commit subject; merge commits are `Merge PR #N: ` plus the PR's own commit
   subjects. The PR #141 source commit's message says "WIP … not merged"; its record says it was
   merged, to avoid a misleading permanent entry.

Found missing and inserted:
- **99 commits after the PR #106 merge** (PRs #107–#147, their source commits and merges):
  86 rows into `frontend_git_commits`, 62 into `backend_git_commits`.
- **42 older commits** that the 2026-10-30 note had not covered: the internal Vercel control client
  and CLI (2026-10-08), the VPS static-deploy and HTTPS workflow (2026-10-17), the reset of main for
  a clean rebuild, the minimal API package with health endpoints and tests, the health dashboard and
  status page (2026-10-21), and the Engineering Notebook / system design studio commits and PR #89
  merge (2026-10-22/23): 20 rows into `frontend_git_commits`, 23 into `backend_git_commits`.

Verification after insertion: all 504 SHAs on main are present in at least one canonical
collection (`$setDifference` empty); counts are frontend 345 (was 239) and backend 344 (was 259),
689 rows for 613 distinct keys; the duplicate-key aggregation returns zero groups in both
collections. No existing rows were modified or deleted. Legacy `git_commits` was not written.

From here, record each new PR's source and merge SHAs right after it merges (same rules).


### PRs #176–#195 ledger reconciliation (2026-11-06)

`frontend_git_commits` stopped at PR #175: a note in `agents/TODO.md` wrongly said the ledger now
fills itself on merge. Both canonical collections were checked for the source and merge SHAs of PRs
#176–#195 (taken from the GitHub API); none was present. 51 records were inserted into
`frontend_git_commits` (31 source commits and 20 merge commits, values `<commit subject> (PR #n, date)`
and `Merge PR #n: <title> (date)`). Current count: 445. Record each new PR's SHAs right after merging.

### PRs #196–#203 (2026-11-06)

Recorded right after each merge (source commits and the squash merge), in `frontend_git_commits`.
A check on 11-06 found all 8 merge records present (#196–#203).


### PRs #204–#215 (2026-11-06)

Recorded by the worker right after each merge, in `frontend_git_commits`. A check on 11-06 against the
PR heads and `main` found all 36 SHAs present (24 source commits, 12 squash merges). Count: 501.

### PRs #216–#218 (2026-11-07, 01:15 IST): checked 2026-11-08, all 10 already present

This session could not connect to Atlas (`remote-atlas-connect` refused by the session's safety check,
twice). Whether the worker recorded these after merging is unknown. Check both canonical collections for
each key and insert only the missing ones in `frontend_git_commits` (same rules as above). SHAs from the
GitHub API (PR commits and `merge_commit_sha`):

| PR | Kind | SHA | Value |
|---|---|---|---|
| #216 | source | `4c78226232b3dbbd210a24d77b45b5567c7bc790` | Interview Questions: Q21 Design video streaming (PR #216, 2026-11-06) |
| #216 | source | `680fa62609ff0234dfd208e8003e13625ef63cf6` | Q21 review fixes: keyframes aligned across sizes, a signed address per part (PR #216, 2026-11-06) |
| #216 | merge | `05be25dd2a22bc96152981fe604bfe5bd2361890` | Merge PR #216: Interview Questions: Q21 Design video streaming (2026-11-06) |
| #217 | source | `cfcf4d0c9ccb9ce144419ee1fa2ea239c8886488` | To-do list: ledger and handover checked through #213 (PR #217, 2026-11-06) |
| #217 | source | `3442440f29c0b26e5dedf45be1ac99ef4684161c` | Merge origin/main into the PR #217 branch (2026-11-06) |
| #217 | source | `2527493434df786bbbe168c7999d979b7f530dc6` | To-do list: ledger and handover checked through #215 (PR #217, 2026-11-06) |
| #217 | merge | `b718f8616cc01af3b0c5a86be7786586fc944b20` | Merge PR #217: To-do list: ledger and handover checked through #215 (2026-11-06) |
| #218 | source | `cc7986651024342e4e9bce8db59c6dfa31cfb6c8` | Interview Questions: Q22 Design menu search (PR #218, 2026-11-06) |
| #218 | source | `1378cee746b4a050a954b4bb189ec0e282b1ca3b` | Q22 review fixes: full pages despite sold-out dishes, open-and-delivers as a filter (PR #218, 2026-11-06) |
| #218 | merge | `863069bb65220b07f749a9a322dd67af4daa7300` | Merge PR #218: Interview Questions: Q22 Design menu search (2026-11-06) |

Once checked, replace this heading's "NOT verified, pending" with the result and the new row count.

### PRs #219–#220 (2026-11-07, 02:00 IST): recorded 2026-11-08 13:30 IST

| PR | Kind | SHA | Value |
|---|---|---|---|
| #219 | source | `007e38d2d25e96505d4ac0d3bdeede1192d0d9f5` | To-do list: #216–#218 under Ledger pending; Vercel limit note (PR #219, 2026-11-06) |
| #219 | source | `1ea2115146681a3e2d8e19fc340f145f42ff8775` | Articles: a contents column beside the article on wide screens (PR #219, 2026-11-06) |
| #219 | merge | `af9d7b4d7ba3bdd017557e815514141489d28635` | Merge PR #219: Articles: contents column beside the article on wide screens (2026-11-06) |
| #220 | source | `b735e6760ea9ba91a9c4aae9acfd7429b8c48164` | Merge origin/main into the PR #220 branch (2026-11-06) |
| #220 | source | `e8b7e8fd368f5a6554f2dca17badefe1dd6aa38a` | Problems: open a question as a problem to design on the Lab canvas (PR #220, 2026-11-06) |
| #220 | source | `053816a2dcce4e13f6862ac8feab39b6346caecd` | Interview Questions and Problems: every question in a LeetCode-style workspace (PR #220, 2026-11-06) |
| #220 | merge | `c9563216957ed0235606416a920ef06cfea2aced` | Merge PR #220: every Interview Question in a LeetCode-style workspace (2026-11-06) |

#220 touches frontend, backend (validate.js, test) and content: record it in both collections.

### PRs #221–#231 (2026-11-07, 03:00 IST): recorded 2026-11-08 13:30 IST

Source commits new in each PR, then the squash merge. #221 and #223 touch frontend, backend and content
(both collections); #222 content and tools (backend collection).

- #221: `9c86df52f678eac92f7a36e43ffd6da4b9695462` (merge main into branch), `24c50c779853f4f150b27772e32528a316916846` (judge, WIP Q01), `f13beb6aacdd5efbdfa21501a47f9b61b68bf036` (suites for 22 questions, LB health checks), `3efd9bfedfe65dee3d2ddcd7b94493f81b48e520` (API without calibration designs; to-do), `d53c955a4d341c25cad22c90f0495c7047b3af5b` (reset, prev/next, timer), `3cecbdc016629c54a6464ae32473fa86a3d86e60` (redundancy label); merge `996dbd13db41293c629d3175213da5beb05715da`
- #222: `5c2a56e3e5256175a91317be2cd3cb336c336163` (merge main into branch), `5f8a6674392d005cc98015149f3b213a42a7fabe` (tools/practice), `a7d4eaf33049a2c162740f754707f3dc650d8298` (landing copy); merge `18fa7a720fad7423f1d395a875da7e919aee9d99`
- #223: `222fda3239154a0248d21db0a97ed261a77cdd0a` (merge main into branch), `ea1b2d56fe02859be64a08de0b8bf5e27061b60f` (server-side judging); merge `1b0e213af92b6c29b6a328f70f57d1d06fc70982`
- #224: `5f5e4a43fc838b2cdfc3f6b02b23b640594f1c4a` (merge main into branch), `f5edde277decd7ddc6f821192bc66b2bd67e5164` (review fixes, analytics, Pick one, badge); merge `974113ce99f79c391a1aa13a9adab5deb3ed5c0f` (frontend + backend + content)
- #225: `5de81b5d960520341d03bd25e36f84bf48e2c933` (merge main into branch), `1e1afbf7b8827aadf185ec7021d57c583b6b8d26` (results panel); merge `af15e49ea179ab8a0b60d234dd2dda2b9cb2a2ae` (frontend)
- #226: `3bbb61fa4861ddd96c1875221e4cef40807369b0` (read replicas), `30af4c6b15ec5d496934f6239e8d699f8413a4b9` (merge old branch history, no content change); merge `3719625c46cc84119acd6a3682ddd1e9eb8b677c` (frontend + backend + content)
- #227: `2215877c6f33bac895f58556deaf392421bdce2a` (merge old branch history, no content change), `0ea007466ee598973248652db6e68c111b27f6a4` (roles and key decisions); merge `ffe2911275da62abd1fba9ccdad8794e6ff0e649` (frontend + backend + content + tools)
- #228: `eb032266d93b495b2c222f51bbd4b83ddeedca28` (merge old branch history, no content change), `07d26881e12403c614ff472ef8ab1cb221782657` (rename); merge `2bc1f0730ad906dd4c8734185f8861e57313ab3d` (frontend + backend)
- #229: `ed5da42adf965716b7a8e5e1d7a5c728b471aeac` (merge main into branch), `b7c91503241bc0cc7df5a522c37c8e73f725e244` (engines); merge `f88ae4ed4c67892d14a6dfbf4111d6ec5ce2944f` (frontend + backend + content)
- #230: `47a328eaebce6befaae37167ccb8ccc465742953` (merge main into branch), `f9760ae72ad5dba28515d8664426f4b257e38814` (schemas); merge `d677a8dd39e57b1e408af2e2db6f54a3fea3c95a` (frontend + backend + content)
- #231: `d107647b9571cd0e128a3d03a7a5fe40256f5503` (merge main into branch), `b063c9e33475acf04f3139b875bf696d608f3381` (request tests, Watch, content); merge `77d5be75330e45fb6161c143137fdc155c50e659` (frontend + backend + content + tools)

### PRs #232–#252 (2026-11-07 and 11-08): recorded 2026-11-08 13:30 IST

Atlas was reachable from the 11-08 session. All SHAs of #219–#252 (111) were checked in both canonical
collections, none were present, and each was inserted into the collection(s) for the folders its PR
touched: `frontend/` → `frontend_git_commits`; `backend/`, `content/`, `tools/` → `backend_git_commits`;
docs-only PRs (`agents/`) → `frontend_git_commits`. 97 frontend rows (count now 608) and 101 backend rows
(count now 486). Source commits include the branch-sync merges ("Merge origin/main into the PR #N branch").

| PR | Collections | SHA | Value |
|---|---|---|---|
| #232 | frontend | `8dee8b72cd72e960d55c982fe41719e6dcb0a313` | Merge origin/main into the PR #232 branch (2026-11-07) |
| #232 | frontend | `d9e307adaff2ab0aa98e644e06f847dd8669f1a5` | To-do list: ledger pending for #221-#231; handover checked through #231 (PR #232, 2026-11-07) |
| #232 | frontend | `e7721bf2f7fd718af1693c016abc40e40e3a8465` | Merge PR #232: To-do list: ledger pending for #221–#231 (2026-11-07) |
| #233 | backend + frontend | `50b2238b684f8871b5552f7b6bdef8f1161ae3ca` | Merge origin/main into the PR #233 branch (2026-11-07) |
| #233 | backend + frontend | `a0d16f7ff4801ce604d86d72d32f0443cb7f940e` | Fixes from re-checking the four Lab changes: phones, Cassandra holds, how-to (PR #233, 2026-11-07) |
| #233 | backend + frontend | `db57244ad9c7e61943cd52042d98fb2fdc338e30` | Merge PR #233: Fixes from re-checking the four Lab changes: phones, Cassandra holds, how-to (2026-11-07) |
| #234 | backend + frontend | `d21a2dce6a775bcefa5b776c0b2845e080d946d9` | Solution tab: the solution design, with Copy to my canvas (PR #234, 2026-11-07) |
| #234 | backend + frontend | `50abf2d830f2e604a0fae86219b7c4e4f76c7e4b` | Merge PR #234: Solution tab: the solution design, with Copy to my canvas (2026-11-07) |
| #235 | backend + frontend | `4d0901bc5d7c58f197400b3f6ced658fdcdfd2e1` | Merge origin/main into the PR #235 branch (2026-11-07) |
| #235 | backend + frontend | `30f43ed49e019f1491a774abd013df8a2d4a7b09` | Remove the timed "Practise before you read" checklist (PR #235, 2026-11-07) |
| #235 | backend + frontend | `3c32de32f08ecb48e7ee13a971997f8ae413ea8a` | Merge PR #235: Remove the timed "Practise before you read" checklist (2026-11-07) |
| #236 | backend + frontend | `272d8fb297f60942bcdfb86243a2f979eb3899a1` | Merge origin/main into the PR #236 branch (2026-11-07) |
| #236 | backend + frontend | `d0bd0aa7ee72be2bff4d2ef0ccebeb69c5bbd71f` | Upgrade the guided tours: a problem workspace tour, a dashboard tour that leads to Problems (PR #236, 2026-11-07) |
| #236 | backend + frontend | `30c16ce1714a6d70a60e1400fd1b2d87e7c9bc23` | Merge PR #236: Upgrade the guided tours: a problem workspace tour, a dashboard tour that leads to Problems (2026-11-07) |
| #237 | backend + frontend | `aa01b2611845fc8a3021d77ac29dcf8f3dd1fea9` | Merge origin/main into the PR #237 branch (2026-11-07) |
| #237 | backend + frontend | `583ddaf739a5bab4e9359ab781ed9709e1fb1e4c` | Tours open only from the Tour button, never by themselves (PR #237, 2026-11-07) |
| #237 | backend + frontend | `b8d2b8504d25fbb1ace84c2d6277764fee3085cf` | Merge PR #237: Tours open only from the Tour button, never by themselves (2026-11-07) |
| #238 | backend + frontend | `5e1707b497c214adf0ebc5ce6a88d298192f9471` | Merge origin/main into the PR #238 branch (2026-11-07) |
| #238 | backend + frontend | `6a03fc826dc48c5ad4bf5fdd5aa1697a59722e4b` | Content audit of every problem's tabs: fix contradictions, wrong terms, giveaway decisions (PR #238, 2026-11-07) |
| #238 | backend + frontend | `1cc5a1e4bd8c054c98ca08c18bcf48519e115fa3` | Merge PR #238: Content audit of every problem's tabs: fix contradictions, wrong terms, giveaway decisions (2026-11-07) |
| #239 | backend | `88345014a4b73bf4236ca523225b0bedc536b434` | Merge origin/main into the PR #239 branch (2026-11-07) |
| #239 | backend | `1ecbe6d87ab99bd9d668fa44ef30108d6f13beea` | Worked answers read line by line: fix contradictions with the problems, add missing pipelines (PR #239, 2026-11-07) |
| #239 | backend | `351fc87fbddd0e11b9cd41352c91b7aefc46c9fb` | Merge PR #239: Worked answers read line by line: fix contradictions with the problems, add missing pipelines (2026-11-07) |
| #240 | backend + frontend | `463d6de9c528a21d1509d9527476835afb9bbb04` | Merge origin/main into the PR #240 branch (2026-11-07) |
| #240 | backend + frontend | `2cb82cdde1130b7984fbd760d96144df7118c557` | Grade written requirements on whole words, sharpen every keyword list, make figures readable in the Solution pane (PR #240, 2026-11-07) |
| #240 | backend + frontend | `6a627ff30b955b279dec441895be3c2a62a2c3e1` | Merge PR #240: Grade written requirements on whole words, sharpen every keyword list, readable figures in the Solution pane (2026-11-07) |
| #241 | backend | `1308fd053b809984eae99d98f34b02017790a308` | Merge origin/main into the PR #241 branch (2026-11-07) |
| #241 | backend | `e071331bfa0d78124b86d586527a1cb59b321e66` | Mark every article free or paid (data only; nothing is locked yet) (PR #241, 2026-11-07) |
| #241 | backend | `d3016fd52222a560c86c4513889f54639a9362e4` | Merge PR #241: Mark every article free or paid (data only; nothing is locked yet) (2026-11-07) |
| #242 | backend + frontend | `41e9b7fda76cb0881e8eafed292174c1da157a08` | Merge origin/main into the PR #242 branch (2026-11-07) |
| #242 | backend + frontend | `38825e5a9f9beb9dbeb1b25eaad8785c5deb1d31` | Analytics: signed-in users per day, and a 7-day average tile with the goal of 50 (PR #242, 2026-11-07) |
| #242 | backend + frontend | `6cfc46bca3c3d5176bf5ffdd06e2d2531fc4fba6` | Merge PR #242: Analytics: signed-in users per day, 7-day average against the goal of 50 (2026-11-08) |
| #243 | backend + frontend | `67c7c304b051dd44fb319d056b5f5e2851073492` | Merge origin/main into the PR #243 branch (2026-11-07) |
| #243 | backend + frontend | `78dfb8fd6a1b5cc4523d10d43341d134643bf645` | Research Papers tab replaces Did you know; first paper: Lamport clocks, with two animated figures (PR #243, 2026-11-08) |
| #243 | backend + frontend | `81e79964801a1668b1e4fc6ecb026dafc4fd09a9` | Merge PR #243: Research Papers tab replaces Did you know; first paper: Lamport clocks (2026-11-08) |
| #244 | backend + frontend | `a8ee295b9a23cd5c9208841524bea8b0081ed200` | Merge origin/main into the PR #244 branch (2026-11-08) |
| #244 | backend + frontend | `94019ee8db78332c40cff319425953affc440bd7` | Research Papers: Must know and Worth reading groups; GFS, MapReduce, Dynamo and Raft with eight animated figures (PR #244, 2026-11-08) |
| #244 | backend + frontend | `6e1c957ff05ec159db213e5f51f7d00b4e5afb31` | Merge PR #244: Research Papers batch 1: GFS, MapReduce, Dynamo, Raft and paper groups (2026-11-08) |
| #245 | backend + frontend | `2c97ccbec4d79d96ef2168a4c3ba684e0bbd927f` | Merge origin/main into the PR #245 branch (2026-11-08) |
| #245 | backend + frontend | `fe2772ab61e7981a86766c1b96d2df0824940f0e` | Research Papers batch 2: Bigtable, Kafka and Scaling Memcache, with six animated figures (PR #245, 2026-11-08) |
| #245 | backend + frontend | `6a72217d3d41692044865c0c9e661833072dd049` | Merge PR #245: Research Papers batch 2: Bigtable, Kafka, Scaling Memcache (2026-11-08) |
| #246 | backend + frontend | `a8956ab660faf64320e8033305faeb2a9084b118` | Merge origin/main into the PR #246 branch (2026-11-08) |
| #246 | backend + frontend | `72b49ca2deb886ac1519a23fd0499cb6a26f542c` | Research Papers batch 3 (Worth reading): Bloom filters, Chubby, Haystack, Spanner, The Tail at Scale (PR #246, 2026-11-08) |
| #246 | backend + frontend | `95c5f9c866b7428c38c8a99cb1c392108f9f9d39` | Merge PR #246: Research Papers batch 3 (Worth reading): Bloom filters, Chubby, Haystack, Spanner, The Tail at Scale (2026-11-08) |
| #247 | backend + frontend | `06272b5fce62b4cfb02bc03e8de2a30f7390b8ba` | Merge origin/main into the PR #247 branch (2026-11-08) |
| #247 | backend + frontend | `f0f785640a653586a73b34c000d250515f62113d` | Concepts: networking, API shape and estimation, with six animated figures (PR #247, 2026-11-08) |
| #247 | backend + frontend | `6e7bf550aff8ce869116aa143db872a31ffc6389` | Merge PR #247: Concepts: networking, API shape and estimation, with six animated figures (2026-11-08) |
| #248 | backend + frontend | `c413dfbad2edcd68f82853e6ec8b73c8d9168c31` | Merge origin/main into the PR #248 branch (2026-11-08) |
| #248 | backend + frontend | `45b33fabe7b672364f6cd5cc2ef2029796f1a046` | Concepts: data modelling, indexes and hash rings, with six animated figures (PR #248, 2026-11-08) |
| #248 | backend + frontend | `4a6408e43b6649d72fa00a36d229fdee5b857fb0` | Merge origin/main into the PR #248 branch (2026-11-08) |
| #248 | backend + frontend | `5e7988c71094b7ba8ebadaa00b8231d01e4e0742` | Indexes article: prefix searches can use a B-tree, not always (PR #248, 2026-11-08) |
| #248 | backend + frontend | `09d7cc6d2e3e4c532a614c8858f0f3d4d9382b28` | Merge PR #248: Concepts: data modelling, indexes and hash rings, with six animated figures (2026-11-08) |
| #249 | backend + frontend | `a549e32e28802b6be03177d5437015fcc15829e7` | Merge origin/main into the PR #249 branch (2026-11-08) |
| #249 | backend + frontend | `2709b4d6d794f7aa35448b663b0c65d7ae97ad97` | Concepts: Recurring patterns group (7 articles, 14 figures); Lamport clocks free (PR #249, 2026-11-08) |
| #249 | backend + frontend | `91aac74da12be93482e05967f4e11fca292648ed` | Merge PR #249: Concepts: Recurring patterns group (7 articles, 14 figures); Lamport clocks free (2026-11-08) |
| #250 | backend | `2d9f8c5da355b8b1eab90274e596c8a67cc62cd0` | Merge origin/main into the PR #250 branch (2026-11-08) |
| #250 | backend | `b5b28d56617e2a92d9c5d4b4babdb8c809cecbf0` | Content audit: fixes across Concepts and Components (PR #250, 2026-11-08) |
| #250 | backend | `7791ce8ce1c3ccb49491c619b3bbc4b5f13e98e8` | Merge PR #250: Content audit: fixes across Concepts and Components (2026-11-08) |
| #251 | backend + frontend | `3b26cc3161bbd1ee594c4e6cb0fb84dffb4a9fc9` | Merge origin/main into the PR #251 branch (2026-11-08) |
| #251 | backend + frontend | `3c756c14214f0636fba1dd4aefd7f42c5bdd03e6` | Components: Tools by name group (10 articles, 20 figures), plus cross-links (PR #251, 2026-11-08) |
| #251 | backend + frontend | `77865e5f68f2b174ae43bc17eb7945db71a0f21d` | Tools by name: second pass on the ten articles (PR #251, 2026-11-08) |
| #251 | backend + frontend | `89628e6eec65981e58affcefad386345ff9fc46d` | Merge PR #251: Components: Tools by name group (10 articles, 20 figures) (2026-11-08) |
| #252 | backend + frontend | `8b5ae1c602a6818fb63309706dd01735c9a0de44` | Merge origin/main into the PR #252 branch (2026-11-08) |
| #252 | backend + frontend | `4af6c705379116bf10a750c982fb90d1238f93aa` | Concepts: Specialised data group (5 articles, 10 figures); audit fixes (PR #252, 2026-11-08) |
| #252 | backend + frontend | `78ab5b0684dc8991e14cf1d9a3b09ec5f0f980c6` | Merge PR #252: Concepts: Specialised data group (5 articles, 10 figures); audit fixes (2026-11-08) |

### PRs #253–#255 (2026-11-08): recorded

| PR | Collections | SHA | Value |
|---|---|---|---|
| #253 | frontend | `e0c0951ecdea50d41dde7030e2ba2657155e9c32` | Merge origin/main into the PR #253 branch (2026-11-08) |
| #253 | frontend | `f3f805c9f3a60161fef8d742016d85f37d6548b1` | To-do list: ledger checked and filled through #252; Ledger pending cleared (PR #253, 2026-11-08) |
| #253 | frontend | `d43c83da422043040af797378f1170cd1d89f250` | Merge PR #253: To-do list: ledger filled through #252 (2026-11-08) |
| #254 | backend + frontend | `73d2bd269ecffd7aacd9cbaf19c0e8ab89293393` | Merge origin/main into the PR #254 branch (2026-11-08) |
| #254 | backend + frontend | `0e2e2d0096189ef1facbedefa1d30a106e5ef883` | Article URLs: every article and section at its own address, with its own title, preview and sitemap entry (PR #254, 2026-11-08) |
| #254 | backend + frontend | `e8b72040b7770f7bcc43c074c5b191fff593cf2a` | Article pages: read the live API when the build cannot see the content folder (PR #254, 2026-11-08) |
| #254 | backend + frontend | `ba6908522c79249d1a65e3c2b091e0ba902326d2` | Merge PR #254: Article URLs: a real address, title and preview for every article (2026-11-08) |
| #255 | frontend | `49d1e4d7e131818a58377b67cad2df4a8e2bbe55` | Merge origin/main into the PR #255 branch (2026-11-08) |
| #255 | frontend | `569ad04faa0f5af54be802295811eee9e9446f51` | Dashboard rewrite: also match addresses ending in a slash (PR #255, 2026-11-08) |
| #255 | frontend | `75bdeb77eff995146c31e1118799258886a24524` | Merge PR #255: Dashboard rewrite: match addresses ending in a slash (2026-11-08) |

### PRs #256–#259 (2026-11-08): recorded

#256 was recorded in `frontend_git_commits` at 17:45 IST. #257's frontend rows went in at 18:08 (the owner
stopped that write midway; checked afterwards: the frontend rows were complete, the backend ones missing).
At 18:50 every remaining key was checked in both collections and only the missing ones inserted:
8 frontend, 11 backend. #257–#259 touch frontend and content, so they are in both collections.

| PR | Collections | SHA | Value |
|---|---|---|---|
| #256 | frontend | `a06089e2a5b304577af02e9c525974c64dedb02f` | Merge origin/main into the PR #256 branch |
| #256 | frontend | `f7e39a55e728b4fe4317bf04e64c5c7d3d547b96` | Remove the automatic agents workflow (PR #256) |
| #256 | frontend | `cd1654b0eb7863a071eac1fc259f1eb54482a5de` | Merge PR #256: Remove the automatic agents workflow |
| #257 | both | `a37af5b1847eba18dad2ac31ad2af4d70c08c076` | Merge origin/main into the PR #257 branch |
| #257 | both | `aca4a6b94f4abf078e834e552e44dfb4b078eee9` | Networking tab: 11 articles and 25 animated figures (PR #257) |
| #257 | both | `2e959e656f6bcc0339b59e7dc5b9807642230094` | Merge PR #257: Networking tab |
| #258 | both | `d01c3912254a00c1795ef0fe7e7088d9976ef105` | Merge origin/main into the PR #258 branch |
| #258 | both | `d028e4d52f3221771bb6bc9937d221e750ea3e00` | Networking essentials: a group in Concepts, not a separate tab (PR #258) |
| #258 | both | `340f03a87e5dbdb5a7b86efb5c06ffe392444388` | Networking essentials: cover every point of the reference page (PR #258) |
| #258 | both | `952d99c45b69a976c47a4359ff5ce507821bd83a` | Merge PR #258: Networking essentials into Concepts |
| #259 | both | `54dc6ec1b14fc340f10850802112dcbd97b4b034` | Merge origin/main into the PR #259 branch |
| #259 | both | `3f4d35c45ed3a36e99a80dbec38bb1cfce2b807d` | Networking essentials: last two points and nw-lb-choose (PR #259) |
| #259 | both | `6d8733bddfb6081ff8feda6d4e4292c85378713f` | Concepts: API design group, 7 articles and 9 new figures (PR #259) |
| #259 | both | `6b26d1b254eac42e6ae9a943f427d96db8a03901` | Merge PR #259: Networking essentials completed; API design group |

### PR #260 (2026-11-08): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #260 | `ec604628f8a35783b56575296c3f062a7bdf6c54` | Merge origin/main into the PR #260 branch |
| #260 | `0b83961acbfa6298ffa62099b5653b139035454f` | API design: paragraph-level check; two points and two figures added |
| #260 | `34752ebc4728963894cacde554f7d0a44f933a3b` | Networking essentials: paragraph-level check; nine points and two figures added |
| #260 | `5ba1da5f808af86926fcb62fa8e4ae6914cb7d5e` | Merge PR #260: Paragraph-level check of Networking essentials and API design |

### PR #261 (2026-11-08): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #261 | `419acabcdc5745be7b732d8b49a94e22e294776f` | Merge origin/main into the PR #261 branch |
| #261 | `ca9b947c97231d230680044ec4acb286625d618d` | Data modelling: a new group in Concepts, five articles and nine figures |
| #261 | `3d97fbf6a7e86043013731f8669ab7371cba4a92` | content README: note the API design and Data modelling groups |
| #261 | `f3e96f3181eab959771673f67de8635e419a641b` | Merge PR #261: Data modelling: a new group in Concepts, five articles and nine figures |

### PR #262 (2026-11-08): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #262 | `c7ce448b68c946c5104af36eb262bef86ea8a929` | Merge origin/main into the PR #262 branch |
| #262 | `aa4a7b7da1fefcfd76790d9e6d0e5d51793bb924` | Caching: a new group in Concepts, five articles and thirteen figures |
| #262 | `1d6180fd7f700b399800723627ad4894a07b0586` | Merge PR #262: Caching: a new group in Concepts, five articles and thirteen figures |

### PR #263 (2026-11-09): recorded (frontend only; it changes only `frontend/vercel.json`)

| PR | SHA | Value |
|---|---|---|
| #263 | `871c1ab3481cccb858f017605a4f395c602f9ae4` | Merge origin/main into the PR #263 branch |
| #263 | `87fc56b585c8b4162fb55091d4f94780514eb26c` | Redirect old Networking links that end in a slash |
| #263 | `73f0b38114cfce9507d6aa2c7bd68041aa7fb42f` | Merge PR #263: Redirect old Networking links that end in a slash |

### PR #264 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #264 | `6ab3c5cfee5916b82b2035a522a0d2c24cdc0cee` | Merge origin/main into the PR #264 branch |
| #264 | `77ccf9ce710a417637c2875160de64d6bd7befa3` | Caching audit: consistent latency numbers, the delete-on-write race, Redis's default eviction policy |
| #264 | `97a7223bd59dfa1e114132b9786c077274b4f607` | Merge PR #264 |

### PR #265 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #265 | `2880cd5c9ce7cf875e8f7d9f5a299a68bd4b5c5f` | Merge origin/main into the PR #265 branch |
| #265 | `da445950da485ec3c4f309160da33cf1836a7207` | Sharding: a new group in Concepts, four articles and nine figures |
| #265 | `915bb9e13515a341b264fd155e6fd7c9ef1bc097` | Merge PR #265 |

### PR #266 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #266 | `490432863a52d276c5ce6c172ece15d5ab9f9fde` | Merge origin/main into the PR #266 branch |
| #266 | `ee0ee1092d25e29c6925ce1b1f0129b11e9b95cd` | Consistent hashing: a new group in Concepts, three articles and nine figures |
| #266 | `9b5ea1ffc0495e292cf7b21525935a0c62164f3b` | Merge PR #266 |

### PR #267 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #267 | `8f9565bf606e258f2670967fdf99378c1613259a` | Merge origin/main into the PR #267 branch |
| #267 | `63ae6a8eeadeeb50ca82a8eb6bd84ea2ff7ef409` | CAP theorem: a new group in Concepts, three articles and five figures |
| #267 | `76cbe9a675197854546776bc6b7f124b3a12b8d2` | Merge PR #267 |

### PR #268 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #268 | `638f77863a568eb258541788811e29185a4a5712` | Merge origin/main into the PR #268 branch |
| #268 | `baa5aad8f501d0b011cecc254e376a62725522d6` | Audit of the new groups: one story for Zotato's shard key, softer write-limit claim, DynamoDB placement wording |
| #268 | `2ab636a6a5ab7f05667222a46948efdf01b34183` | Merge PR #268 |

### PR #269 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #269 | `ec7ee4c7d8fbf71ef28c8c3175befab08028c860` | Merge origin/main into the PR #269 branch |
| #269 | `7c2c5cc9bfaf97df6754a1be623bf19ac2862225` | Surprise: an interactive hash ring you can change |
| #269 | `aeb26b57abf775301086cbc6fcba1ef0e8d9cb2f` | content README: note the Sharding, Consistent hashing and CAP groups |
| #269 | `195a16381ad776524935ecd7913e8ff732ed55ee` | Merge PR #269: An interactive hash ring you can change |

### PR #270 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #270 | `fc7afdc82af963307731f2db40b99f0e91414e67` | Merge origin/main into the PR #270 branch |
| #270 | `63b8c4127fbb0059b766f9e37cb8f5bc36db0a76` | Database indexing: a new group in Concepts, four articles and nine figures |
| #270 | `d440752036996cd94d469808a592669730f54928` | Merge PR #270: Database indexing |

### PR #271 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #271 | `31045494f7170927679b75582a342dc6ad80c1be` | Merge origin/main into the PR #271 branch |
| #271 | `498fa39b5c2a9e0a30399bbb1438fa5abd88428c` | Numbers to know: a new group in Concepts, three articles and five figures |
| #271 | `7a6b219dbd06eb8dcbf7cc98b2171396573f7c26` | Merge PR #271: Numbers to know |

### Full reconciliation of main since 11-04 (2026-11-10, 10:45 IST)

Every commit on `main` after the 11-04 reconciliation point (`66c1660`, 153 commits) was checked against both
collections (Atlas `$setDifference`; history unshallowed first). Rule: frontend gets every commit; backend gets
every commit that touches `backend/` or `content/`.
- **Frontend: 5 were missing**, now recorded: `7791ce8` (#250), `d3016fd` (#241), `351fc87` (#239), `18fa7a7`
  (#222), `c70d656` (VPS audit workflow, #176).
- **Backend: 44 were missing**, now recorded: every content/API commit of #170–#218 (11-05 to 11-06: the
  Interview Questions Q01–Q22 articles and their review fixes, Concepts 05–07, Practice mode, the Problems page,
  Lab challenges `sms-link` and `monday-sync`, Vercel Analytics, the landing "What's inside"). Before the 11-08
  reconciliation only the frontend collection was kept for those PRs.
- Rows carry "(PR #N, date; recorded 2026-11-10 in a full reconciliation)"; each PR number was read from the
  commit or the merge that brought it into `main`.

Counts after: **frontend 722, backend 613**, no duplicate keys. Commits on working branches that never reached
`main` (old worker branches) were not checked.

### PR #319 (2026-11-13): recorded

| PR | Collections | SHA | Value |
|---|---|---|---|
| #319 | both | `3c4fbfd22f671e8cdee39bd816986ded1990190a` | steps 6–7: autocomplete, streak |
| #319 | both | `7d9cc2b7c8cd58cf40b610917ab4059a9183f9a3` | step 8: problems 2–10, judge version 2, sweep grid |
| #319 | both | `87772471bbc39e9bd87c80bbc04f8909d62a4898` | squash merge |
| #319 | frontend | `2ca43df42ee2da9196a104a44e7682234323608e` | sync merge (no diff against main) |

### PR #317 (2026-11-12): recorded

| PR | Collections | SHA | Value |
|---|---|---|---|
| #317 | both | `0ad6e01dea2b0f5da0e6b2a02db989b19bb9cc0b` | steps 1–3: TKD engine, problem 1, checker, sweep tool |
| #317 | both | `6b97260f2fcc6847666eef081ba317dd0a3833ce` | step 4: `/v1/practice` API |
| #317 | frontend | `2a7ff7304d1234cc6264973f8eeb91cfdddb9b1d` | steps 5a/5b: Builder and pages |
| #317 | both | `3c695369dee53478d619d9df4a05de1b55039bcd` | squash merge |
| #317 | frontend | `c3301e3323708e76fe92486d7839af31e4717301` | sync merge (`-s ours`; kept older copies of #318's files) |
| #317 | frontend | `4440d780779fcf52c4275cae2fe8f2dbd7324ba3` | restore #318's files on the branch (no change against main) |

### PR #316 (2026-11-12): recorded (docs only; it touched `content/README.md`, so both collections)

| PR | SHA | Collections |
|---|---|---|
| #316 | `f7f887170dcc2bfdc4163b6e79becf0609bba900` | branch commit (both) |
| #316 | `6699bbfe647165acdb4debf34c318ab23c5c6fca` | squash merge (both) |
| — | `272847a8ade2f8349aad2c41287ac5c584b89350` | sync branch (frontend) |

The first attempt was refused by the session's safety check (the owner had asked for docs only); recorded when the
owner asked for ledgers, each key checked absent first. Counts after these: **frontend 853, backend 673**.

### PRs #313–#315 (2026-11-12): recorded

"Both" = frontend and backend collections (the commit touched `backend/` or `content/`); syncs go to frontend only.

| PR | SHA | Collections |
|---|---|---|
| #313 | `cc9ec8e3caa564ec0dba6287e035a0d0d6f01544` | branch commit, phone figures (frontend) |
| #313 | `2e7638f78812a91974e77d7c900dca3641fdb94d` | branch commit, tours (both) |
| #313 | `48a5a7f25ca2b6d1cc740f5c025e9a376db8d8e0` | branch commit, tour on phones (frontend) |
| #313 | `3309252e61977796d9aaa66ac8fec1095cf2b936` | squash merge (both) |
| — | `42ffbe822506badfb160c132049164d200ca049d` | sync branch (frontend) |
| #314 | `21dfabd15e17832136598fb68f87a23e9f34416a` | branch commit, signed-out tour (both) |
| #314 | `834b1d623e5c9dcc056a3e0299b5834167e31582` | squash merge (both) |
| — | `456bb2828330f979a949aff66fd829c91d986340` | sync branch (frontend) |
| #315 | `1bcff96bc2546206544bf1bd3f555e2badd0a716` | branch commit, remove In 30 seconds (both) |
| #315 | `4251e7a2b50f301f71a3d4c39ee2b16ee57eafe2` | squash merge (both) |
| — | `12ec878d685c7664756bbabddfd4c6ef5a920fe9` | sync branch (frontend) |

Each key was checked absent in both collections before inserting. Counts after these: **frontend 850, backend 671**.

### PRs #311 and #312 (2026-11-12): recorded (frontend only; neither touched `backend/` or `content/`)

| PR | SHA | Collections |
|---|---|---|
| #311 | `f03a8a4b4b0540d3e78490f92c1739db04bdabfc` | branch commit, motion grammar (frontend) |
| #311 | `a8497725c01643b100c89d3c96fb2e35928744f2` | branch commit, loops start when seen (frontend) |
| #311 | `e84092b008c8f32e64313b6fa501e04fa0135e32` | squash merge (frontend) |
| — | `25a5b8403dc01513a8af9c2d5994f6897b20d47f` | sync branch (frontend) |
| #312 | `e9956135b2b3120f73e66d203a8505cb7ac22c92` | branch commit, faster animations (frontend) |
| #312 | `63d52fda6e8cf7035d326d58a5c005624d3a18c8` | squash merge (frontend) |
| — | `57c3a223d66a346c7b3df21d778e90fc0b744c9b` | sync branch (frontend) |

Each key was checked absent before inserting. The #311 rows were refused once by the session's safety check and
inserted when the owner asked ("update docs and ledgers"). Counts after these: **frontend 839, backend 665**.

### PRs #309 and #310 (2026-11-12): recorded

#309 touched only `frontend/` (and `Design.md`); it was merged as a merge commit, so each branch commit is on `main`.

| PR | SHA | Collections |
|---|---|---|
| #309 | `6714109cf3b2629f0ad17209c2f03274dc9b22d7` | branch commit, WP1 (frontend) |
| #309 | `a26bcf3b4db59c0c0786a077318b173908572fc9` | branch commit, WP2 (frontend) |
| #309 | `0fbce9bfeea6a7ea78f980670539340e00b6b630` | branch commit, WP3 (frontend) |
| #309 | `42666051c82c04c173ccac75c065cce8ca45f7ca` | branch commit, WP4 (frontend) |
| #309 | `868091099f8c0077c1041f3987c118383a983c71` | branch commit, WP5 (frontend) |
| #309 | `2bf44404c1abf35d572ed8fb5866a93102659b5a` | branch commit, WP6 (frontend) |
| #309 | `828c69024f4577c8fbb5a9daae5ad47dd8a1e290` | branch commit, WP7 (frontend) |
| #309 | `7514b87e3c930ad7bd9756895b09dc79a0d545da` | branch commit, WP8 (frontend) |
| #309 | `c92eb6887d04f9c2da21add12413ea00b4071ea8` | branch commit, WP9 (frontend) |
| #309 | `d45910f59bb101982f86ed35131cf78231cda944` | branch commit, fixes: Pick one, design name (frontend) |
| #309 | `f1780783dfe842930b3afad92f70c1b33d57911c` | branch commit, fix: header 681-900px (frontend) |
| #309 | `d3d7c0aa758592ed3d6c2d8660c1c1868be31b99` | merge commit (frontend) |
| #310 | `186a3666cb29c5a9fa5166adbefb4f5723bf641e` | branch commit, tours + Dashboard button (both: content, backend) |
| #310 | `99d07b8ab61891ab1c46d8577b89ea5062b02be4` | branch commit, Sign in dialog (frontend) |
| #310 | `34cc5ca2970cb3606864eec55005572ac2ee3666` | branch commit, narrow-phone header (frontend) |
| #310 | `d9c5ee9a40195cc345361dcfc7c45946fc3b0f03` | branch commit, judge-pool test (both: backend) |
| #310 | `0c7151fc8121519d8e8807d6bdef22283d45df3f` | squash merge (both) |
| — | `062ec78d59be193b792ed7080dce52b73ccb5177` | sync branch (frontend) |

Each key was checked absent in both collections before inserting. The #309 rows were refused once by the session's
safety check and inserted after the owner asked ("Update docs and ledgers").
Counts after these: **frontend 832, backend 665**.

### PR #308 (2026-11-12): recorded (frontend only, docs)

| PR | SHA | Collections |
|---|---|---|
| #308 | `56f519d35ea22e9dad3cb3a701efdca407525d94` | branch commit (frontend) |
| #308 | `01adfbeaca1f8dfe3a00ad1ab80b25fdd587557c` | squash merge (frontend) |
| — | `7f40dc3e840d53d9514ac72420c0fdd27f5c6772` | sync branch (frontend) |

Counts after these: **frontend 814, backend 662**.

### PR #307 (2026-11-12): recorded (frontend only, docs)

| PR | SHA | Collections |
|---|---|---|
| #307 | `ff05a5114a431e58a3e9e75c56353870d2417354` | branch commit (frontend) |
| #307 | `6eec918527aa1b8f1b62c5d313e5db87631a82ab` | squash merge (frontend) |
| — | `da7c2527d90a69640881416d6ae61db02af0ddc9` | sync branch (frontend) |

Counts after these: **frontend 811, backend 662**.

### PRs #304–#306 (2026-11-12): recorded (frontend only; none touched `backend/` or `content/`)

| PR | SHA | Collections |
|---|---|---|
| #304 | `4c2b559d374da68e3ee1c7ef8bd212fd26eb0ae4` | branch commit (frontend) |
| #304 | `a28dd0dea37717d70a44c693ea186aeff91a533e` | branch commit (frontend) |
| #304 | `734fceba67c064ad991b85760a1fe2c989b1e652` | branch commit (frontend) |
| #304 | `d9dd043dacb5bfd8df479277dfb439ce1c062c07` | squash merge (frontend) |
| — | `9e2eef7f0f14d6ef3f7068fcc34caf4588bddf53` | sync branch (frontend) |
| #305 | `78b668ef7fe647684a54cb180b3e91afe73e43d9` | branch commit (frontend) |
| #305 | `e62d72a6b59135a2063982c56eb4f44bbf1f94db` | branch commit (frontend) |
| #305 | `f0adc9848ef8e011ef45855af2493fc1e8e9695b` | branch commit (frontend) |
| #305 | `c6e62570871dff2230030f186e1a738ab9c809ad` | branch commit (frontend) |
| #305 | `5267f380cfa2f10b414bd08f7695e95de9e63838` | branch commit (frontend) |
| #305 | `c6a719f1378e92440e7bd01bbf3ae5053471489b` | branch commit (frontend) |
| #305 | `41a5c574e15c807a456aac750685d4ce97851dda` | squash merge (frontend) |
| — | `48ef623b087c53edb357a17b54044bee47aae66c` | sync branch (frontend) |
| #306 | `7403846405fb792dc6b770504cf6270879025a34` | branch commit (frontend) |
| #306 | `24ef789f2375f04235fd90c5e5fc50cebed3467d` | squash merge (frontend) |
| — | `83bfa6ca6f2065d43906cb42711afa6a4a1e7400` | sync branch (frontend) |

Counts after these: **frontend 808, backend 662** (counted in Atlas after the inserts).

### PR #303 (2026-11-11): recorded

| PR | SHA | Collections |
|---|---|---|
| #303 | `4d7583d3997353e9d38d744016b45656f2bebb66` | branch commit (frontend, backend) |
| #303 | `b205951b88ad56654c5c1c98aaff467992729e1a` | squash merge (frontend, backend) |
| — | `3b01c22487e03f54513c12c63034a8b65494ba53` | sync branch (frontend) |

Counts after these: frontend 792, backend 662. Checked 2026-11-11: every commit on the branch since #298 (39) is in
`frontend_git_commits`, and every squash merge since then is in both collections with its release.

### PR #302 (2026-11-11): recorded

| PR | SHA | Collections |
|---|---|---|
| #302 | `2cf33d601511741e2d4f106d7572ed679f236829` | branch commit (frontend, backend) |
| #302 | `156d2d40b4a758d22f9559050a40ad12d39ef163` | squash merge (frontend, backend) |
| — | `063ba927c15d36bd3bce2d6d92efcb18a4b7b5d6` | sync branch (frontend) |

Counts after these: frontend 789, backend 660.

### PRs #300 and #301 (2026-11-11): recorded

| PR | SHA | Collections |
|---|---|---|
| #300 | `3b5f4b47dc8b572be15c43f48518a4b26dc89e02` | branch commit (frontend, backend) |
| #300 | `f485ca75d7ea4753aec4f0e5ddc263604e71af54` | squash merge (frontend, backend) |
| — | `3b6948b96c3a09fc5a16f33df0631e4566214ee9` | sync branch (frontend) |
| #301 | `1c318a3bde0b69bf551ca100c1be6bf8c1f541e5` | branch commit (frontend, backend) |
| #301 | `d8ac1e1c2cd1516e992158f2ddfe9b0e10a18415` | squash merge (frontend, backend) |
| — | `4f6aece0a55b311380bbeac437a0508491adbd55` | sync branch (frontend) |

Counts after these: frontend 786, backend 658.

### PR #299 (2026-11-11): recorded

| PR | SHA | Collections |
|---|---|---|
| #299 | `7701fd0d806a4ca0ecac8d39849d27e4fa16e01f` | branch commit (frontend, backend) |
| #299 | `b9dacc794fe07ab91003c3818e95ccab0cd77f44` | branch commit (frontend, backend) |
| #299 | `7d50d5aa691eafc4479296ecd444a424e777181a` | branch commit (frontend, backend) |
| #299 | `816b6c2d1263c68b9b5dd5099832acd77f1e22a1` | branch commit (frontend, backend) |
| #299 | `4ede4fb81fd3ce616774ff0e28ded8b9e78298fb` | branch commit (frontend, backend) |
| #299 | `031d153c6a8dc4644bffa038ac23d6309ba4ec41` | branch commit (frontend, backend) |
| #299 | `0c664ea05ba72a2ce2fd5bb8ce0e17df2168d1f8` | branch commit (frontend, backend) |
| #299 | `69e9c8dd58c47eb16ba4fc3b2052de9fe2197872` | branch commit (frontend, backend) |
| #299 | `dcfa32942fa3f1e6ae6afd91e52c4a7cc16b0304` | branch commit (frontend, backend) |
| #299 | `57126b54c9f76c84b0a0ed96f411b15086ef1c61` | branch commit (frontend, backend) |
| #299 | `43a024b0e490c51df03e422973d7541dee282c77` | branch commit (frontend, backend) |
| #299 | `b256dcd30322618634f4032d13a1feceec050158` | squash merge (frontend, backend) |
| — | `b3df5e9a976b88457ccac0a3a8722f374f62e589` | sync branch (frontend) |

Counts after these: frontend 780, backend 654.

### PR #298 (2026-11-11): recorded

| PR | SHA | Collections |
|---|---|---|
| #298 | `34ecc13e1855e46b54f734d918a77e0284b0db1c` | branch commit (frontend, backend) |
| #298 | `b901226e4572c748175632de5088ebe352f54b23` | branch commit (frontend, backend) |
| #298 | `6161225e7a051429517342ef856221cbe3f9b9bd` | squash merge (frontend, backend) |
| — | `f5164cf5805b5dceb1697c56c0bac9610d3778fd` | sync branch (frontend) |

Counts after these: frontend 767, backend 642.

### PR #297 (2026-11-11): recorded

| PR | SHA | Collections |
|---|---|---|
| #297 | `f5fba1c92e85e38746e74b6dff53050887e17d4a` | branch commit (frontend, backend) |
| #297 | `f123d41ee1742b8d74685eccc1c77ebe7204431b` | squash merge (frontend, backend) |
| — | `9573e1a42827beab20ed08b45001d39dd46014ac` | sync branch (frontend) |

Counts after these: frontend 763, backend 639.

### PR #296 (2026-11-11): recorded

| PR | SHA | Collections |
|---|---|---|
| #296 | `8a1f63338adb5ab516ec5a446c9478df623e8388` | branch commit (frontend, backend) |
| #296 | `12e780ab9facf37d701865b0a498236a0e16fe6d` | branch commit (frontend, backend) |
| #296 | `2399afdd7d8ff53bf08f58531d150eec31a720c9` | branch commit (frontend, backend) |
| #296 | `810744689682ef787af50dea330ad5468045ff9f` | branch commit (frontend, backend) |
| #296 | `419f71b5c4fb20054115b47581126e1b2cad8be3` | squash merge (frontend, backend) |
| — | `492355a16df1e0a8a3acd6432dbda471a5d9464b` | sync branch (frontend) |

Counts after these: frontend 760, backend 637.

### PR #295 (2026-11-11): recorded

| PR | SHA | Collections |
|---|---|---|
| #295 | `599486caeffed4467b4932d3e3e958079796db26` | branch commit (frontend, backend) |
| #295 | `7c20fc1dcdca22c2792c5a03faa1da400d49600a` | squash merge (frontend, backend) |
| — | `42035e6ccb7e4fa0cc81b5865814fe8b5621a334` | sync branch (frontend) |

Counts after these: frontend 754, backend 632.

### PR #294 (2026-11-11): recorded

| PR | SHA | Collections |
|---|---|---|
| #294 | `7900c42868ec3da90727c0ae95166c1ef0617480` | branch commit (frontend, backend) |
| #294 | `02ff1fc9cac94c97969a4e7d4dc3c5ca16b164e4` | branch commit (frontend, backend) |
| #294 | `addf2c9f73e0ddd0e1e223d8be7054db8a100abd` | branch commit (frontend, backend) |
| #294 | `c38f4e180e59fb54c2e7bd98ec7b8888ebab6d6b` | squash merge (frontend, backend) |
| — | `8a0e2369ae743371b753774e8678e3a06c9beb09` | sync branch (frontend) |

Counts after these: frontend 751, backend 630.

### PRs #292 and #293 (2026-11-10): recorded

| PR | SHA | Collections |
|---|---|---|
| #292 | `607ba6298bee941810d941a306daac0152028284` | branch commit (frontend, backend) |
| #292 | `cd326e39b20ccfa3ea94dbe91d30a13adf4974d4` | branch commit (frontend, backend) |
| #292 | `3f4dd4ee88ed20d4228dc72f43ade1d721ff5bd0` | branch commit (frontend) |
| #292 | `f8cdf2715bb1670651391537d815da042cab09de` | squash merge (frontend, backend) |
| — | `1a6367ef6f8dcf3fb8a6beb98f23c563d5c9201b` | sync branch (frontend) |
| #293 | `8145e8c9e09f1154db525488e66f9550981b5f14` | branch commit (frontend, backend) |
| #293 | `85e5b344014e593bc5545cdc77b557d42d0104b6` | squash merge (frontend, backend) |
| — | `eda8b362216635b8a6400786057344f6579bd566` | sync branch (frontend) |

Counts after these: frontend 746, backend 626.

### PRs #290 and #291 (2026-11-10): recorded

| PR | SHA | Collections |
|---|---|---|
| #290 | `28236f9a9f79d6ec0a1cb734793369832ad2e416` | branch commit (frontend, backend) |
| #290 | `a9e073fbc859eb1cb5752afa22bee761112b423c` | squash merge (frontend, backend) |
| — | `9b48c6dbd9a899f0a972930ec3aae6ba2f3cf2f3` | sync branch (frontend) |
| #291 | `b08c7ec2073dab41e0ffa4654d2203f8aebedcda` | branch commit (frontend, backend) |
| #291 | `9dc0ceee744944ce721bf2ae91f473f3cc01ec88` | merge commit, by the owner (frontend, backend) |
| — | `a4da2355487a1950401fb033d2d09e008a5a5078` | sync branch (frontend) |

Counts after these: frontend 738, backend 621.

### PR #289 (2026-11-10): recorded

| PR | SHA | Collections |
|---|---|---|
| #289 | `c1f0c37f18d188e9e53e1b2ed95d5f81d466c12b` | branch commit (frontend, backend) |
| #289 | `63070765396a61ac31b8a41454862e420937b1d5` | squash merge (frontend, backend) |
| — | `1c83e3c6382756c81ce006b212eca91e60d49362` | sync branch (frontend) |

Counts after these: frontend 732, backend 617.

### PR #288 (2026-11-10): recorded

| PR | SHA | Collections |
|---|---|---|
| #288 | `5143bcd12136d0ace528fc2024751c41789313e7` | branch commit (frontend) |
| #288 | `e11950ab90feefe45fd56f87c1ccfe2a5b648a4e` | squash merge (frontend) |
| — | `4f8cecebb1ca11deec5843b6d8f455fd188aee3b` | sync branch (frontend) |

Counts after these: frontend 729, backend 615 (#288 is front end only).

### PR #287 (2026-11-10): recorded

| PR | SHA | Collections |
|---|---|---|
| #287 | `1dd37169d31e07edfb0984c383fafd48a72f6284` | branch commit (frontend, backend) |
| — | `1b42f74190babc5e1eabc99cde87414fa7f6962c` | sync branch (frontend) |
| #287 | `8eacbe83e8957a998ad4e0d10fc47b43da21791f` | squash merge (frontend, backend) |
| — | `35e69cfecdf8d93b9eb0df4e09c91938233ca71b` | sync branch (frontend) |

Counts after these: frontend 726, backend 615.

### PRs #285 and #286 (2026-11-10): recorded

| PR | SHA | Collections |
|---|---|---|
| #285 | `e2ebdfc56f65dd2a2311b59f5d1655522773112f` | branch commit (frontend, backend) |
| #285 | `da8d5b4a7dac108b5e47d83ff3898d9dbddfe0d8` | squash merge (frontend, backend) |
| — | `1bf6f9296bcb1cfb783855857316df24f5d98882` | sync branch (frontend) |
| #286 | `3b34149be7b12c7fae1c9125e4cff4b4cfbb1c1e` | branch commit (frontend) |
| #286 | `599c366a1bbb4873be1f30ce0eccbaa0f801580e` | squash merge (frontend) |
| — | `9c03ab4c00025f3ae5556fa97ff24b1363b26bb0` | sync branch (frontend) |

Counts after these (read from Atlas): frontend 717, backend 569. No duplicate keys (checked with a group-by).

### PR #284 (2026-11-10): recorded

| PR | SHA | Value |
|---|---|---|
| #284 | `fb94cb5e35f2b6b2df86b8b534ea221fa80933ab` | Real systems: a new tab with six case studies (both; recorded 11-09) |
| #284 | `951cf68051c5c9dc82dedb672605883fe01fe3b0` | Squash merge (both; recorded at merge time by session 01Jmp3n5, which merged it) |
| — | `acdfda723f15cec01cc66dc7298f936472919d6a` | Sync branch after #284 (frontend only) |

Counts after these: frontend 711, backend 567.

### PR #284 (2026-11-09, open): branch commit recorded (both collections) — Historical

| PR | SHA | Value |
|---|---|---|
| #284 | `fb94cb5e35f2b6b2df86b8b534ea221fa80933ab` | Real systems: a new tab with six case studies (PR open; the merge commit is recorded when it merges) |

A row with a guessed key (`fb94cb5bfb0f…`, value "PLACEHOLDER") was inserted by mistake while recording this and
corrected in place to the real SHA and value the same evening; no row with the guessed key remains. Rule: read the
full SHA from git before any insert.

### PR #283 (2026-11-09): recorded

| PR | SHA | Value |
|---|---|---|
| #283 | `1f0ecae245b1ff7f61cf75d9031e0a6e94868c13` | Interview Questions › Start here: six new guides (both) |
| #283 | `3fa907be0d669e03b33a1f9bcc650ff9bb703711` | Sync branch (merge -s ours, no content change; frontend only) |
| #283 | `f11f4cb2b63ccafd37a1de965168cc5f17465dbe` | Merge PR #283; API release 20261109T173844Z-f11f4cb, 59 articles (both) |
| — | `1b03fb0637dd31290a823cd8337daa8f40e8fddf` | Sync branch after #283 (frontend only) |

Counts after these: frontend 709, backend 566.

### PR #282 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #282 | `bd69001cc83eb51088adf5814166494e7f4f5a0a` | Concepts: one article per reference topic (21) |
| #282 | `763cf781b6f014b20ad512d5371f21e61d196cb5` | Sync branch (merge -s ours, no content change; frontend only) |
| #282 | `43665ab9d1a03ff6a8bd110d2a7b76ad9824413b` | Merge PR #282 |

### PR #281 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #281 | `d6598d404fc2af1f0c675471e7eb9a2b14487a3b` | Only the reference site's articles: general components, papers and autocomplete removed |
| #281 | `15ba32c280f8823fc9f14550f89aeab7399641a3` | Sync branch (committed conflict markers; frontend only) |
| #281 | `5e146e628776e03da2c5a7412a783ce4abd42dca` | Undo the sync merge's side effects |
| #281 | `8f420cb91bd97195683e7b4469a7b725e1bbed07` | Five more pointers to removed articles (frontend only) |
| #281 | `aff688baa31de88acf18e2b7bb0d58655665ca35` | Merge PR #281 |

### PR #280 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #280 | `29069162b13a07b4ad597c4fb19bf6617256c366` | Concepts: only the reference site's topics, in its order |
| #280 | `de2f0efcf741691403225635b9d8bf5d25f9163f` | Sync branch (frontend only) |
| #280 | `08542ebed60d12d356dc8d9006c940b530143847` | Merge PR #280 |

### PR #279 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #279 | `11e5bafccb9f8d4279a291b3c87e14b1e9b7cab9` | Load each sub-tab's figures when an article needs them |
| #279 | `2399d62ed6a36b1ce363de111007aa406c85a7b8` | Sync branch (frontend only) |
| #279 | `27304d6065891557486fe9474f4606b8a096bf8b` | Figures that fail to download: Try again reloads the page (frontend only) |
| #279 | `225d5e0fff07b32d868ea8948608758b4b3a1373` | Merge PR #279 |

### PR #278 (2026-11-09): recorded (frontend only)

| PR | SHA | Value |
|---|---|---|
| #278 | `b52088cbc46223854625061f0f0a0fcee69335a1` | Faster first load, a stale-article race, accessibility and figure warnings |
| #278 | `fcc5084ffc6c7c86f1357381747d40b02555d8a5` | Sync branch |
| #278 | `4355c31fdab84cf1eb40223eedb91484f1feec70` | Merge PR #278 |

### PRs #328–#329 (2026-11-13): recorded (frontend only)

| PR | SHA | Value |
|---|---|---|
| #328 | `41442369f20bc78dcd246821d9b1e42984a18db3` | Scenes for error and empty states |
| #328 | `78ace04fbe10f07376de077ae38a8f9ed8fa6660` | Sync branch |
| #328 | `6369efba1b01e96c900e9a0e21ff99153eb78204` | Squash merge #328 |
| #329 | `003ea295f2791bdda2f65f931d2a57bb58a93311` | Share as image after Accepted |
| #329 | `3e45cef07a19bd9cd344409bbe993bd46952c7e9` | Sync branch |
| #329 | `35bc56853cb44ba8fdefd193d0a00ad0ab5ae689` | Squash merge #329 |

### PRs #325–#327 (2026-11-13): recorded

| PR | Collections | SHA | Value |
|---|---|---|---|
| #325 | both | `3d23c6a976419b8d9efd4b47df8050b4fdf528d4` | Spec 24 decisions: one loop on phones, solid header, two events |
| #325 | frontend | `f6c8c1b05be9e2587b0fd16ba49048ef36b914f4` | Sync branch |
| #325 | both | `26b8e247fbe2746c70c6e1b617af4e16cce51e6b` | Squash merge #325 |
| #326 | frontend | `c8b8c142b0d276d000f2b484908331c96cbc5491` | The learner's diagram on phones, with motion |
| #326 | frontend | `6311a7068ec612c4698485c17558e868b8214e31` | Sync branch |
| #326 | frontend | `87680d6e384763267cfc430d2258761e8b443b0a` | Squash merge #326 |
| #327 | frontend | `7dbd9ad17c78fbad9d79d41d30572036625b16b2` | One arrow per hop, a key |
| #327 | frontend | `3950bc69f2883e670df29cfd41d698a8de2a46e5` | Sync branch |
| #327 | frontend | `f96ff31f7543e1f8d22c51ee9842b821ab64b059` | Squash merge #327 |

### PRs #323–#324 (2026-11-13): recorded (frontend only; no backend or content change)

| PR | SHA | Value |
|---|---|---|
| #323 | `f941277353644c7089d846e98d8361245fc41e22` | Swipes and figure steps: gesture.js, step controls, drawer and full screen follow the finger |
| #323 | `c68970fa10856a1e6483bb49756746aabf9567ab` | Practice on phones: panes swipe; a drag past its limit never goes |
| #323 | `6625475c332f9e6e0c43dc03f8a17a887cf3743f` | Sync branch after #323 |
| #323 | `a8e1da41db26db0431fc475ec74666e360585a8e` | Squash merge #323 |
| #324 | `fe011d32a8522e50575e0ec77cd95b92505f90ea` | Motion polish: cross-fades, contents marker, stars |
| #324 | `9ecab8577451a8eb3bc8f8efdb93cc64051d2d33` | Sync branch after #324 |
| #324 | `41bef78edc063d661c03827d40f927c6f5b49cb9` | Squash merge #324 |

### PR #277 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #277 | `bca654e43be3f4e424c5682e82241b727032dfd1` | Review fixes for #275 and #276: figure error leak, judging fairness, Cloudflare build, judge errors |
| #277 | `f829ecfde63a157b7797e7203dbffdc97f21c3a2` | Judge pool test: give the follow-up job room to start a fresh worker |
| #277 | `87e2aa95a4e75cdf54c130ce6c7087bf0955aba4` | Merge PR #277 |

### PR #276 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #276 | `db43183bf154a9e297588b4559035a777aada003` | Make hosting portable: one routing file for any host, an API container, and a moving runbook |
| #276 | `4578987948aa764666f99640b99d643ccc95f8b5` | Remove wrangler's local test state and ignore .wrangler/ |
| #276 | `14293b44385403d0fe7378f4a92d0bca11952626` | Merge PR #276 |

### PRs #273–#275 (2026-11-09): recorded

| PR | Collections | SHA | Value |
|---|---|---|---|
| #273 | both | `c49eeb66c5e3ad93f66e7d449c829191ae420977` | Tidy the frontend and backend structure, no behaviour change |
| #273 | both | `c39f37ba0000d8ee0345a35970264c12b41f28d4` | Merge PR #273 |
| #274 | both | `f2259a643bc1ec3f426f1f2b141198efb1899e45` | One figure module per sub-tab, in the frontend and the backend |
| #274 | both | `7db4203d8f1fdc916f72b3b647da89dd5cd24d34` | Merge PR #274 |
| #275 | both | `8fbff71ce3e2b2d45e33251e8ccdd16f90c52679` | Pre-launch audit: fixes for two ways the API could go down, and figure failures |
| #275 | backend | `887516a4a3024376decaf85db16c2c614cc04b45` | Run the backend tests on every PR, not only after merge |
| #275 | backend | `ed95fbaa3ca38e19c74a7b91393d27792d604271` | Log a failed request with a fixed format string |
| #275 | both | `cfa8a550136fae55f33e6b7b9e8da2861cc466b6` | Merge PR #275 |

### PR #272 (2026-11-09): recorded (both collections)

| PR | SHA | Value |
|---|---|---|
| #272 | `c360643ad69f87fadfbe879799d5cee1bf010e07` | Merge origin/main into the PR #272 branch |
| #272 | `017df27b1605a6590623fa85464c5a9ac7f54381` | Real-time updates: a new group in Concepts, four articles and six figures |
| #272 | `ee51a0f67bf2cf3f3aaf2b81eab5917d7fe510b2` | Merge PR #272: Real-time updates |

Note (2026-11-09): twice a placeholder row with a short key (`6ab3c5c`, `2880cd5`) was inserted by mistake. Atlas asks the
owner to confirm deletes, so each row was corrected in place (update-many) to the full SHA and the right value above; no
placeholder rows remain.
