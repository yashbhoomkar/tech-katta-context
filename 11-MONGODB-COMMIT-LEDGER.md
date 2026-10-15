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
