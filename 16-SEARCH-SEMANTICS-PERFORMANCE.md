# Search Semantics and Performance Audit

**Audit date:** 2026-10-11  
**Application revision inspected:** `efbc810f08f210e83cff41415280c1a0aaffc8c6`  
**Database:** live Atlas database `techkatta`

## Current behavior

### Frontend

The current React UI fetches the article list once via `fetchArticles()` and performs topic/chapter filtering in memory. The chapter search lowercases a concatenated haystack of `title`, `eyebrow`, `description`, and `tags`, then uses JavaScript `includes()`. This is case-insensitive substring matching, not tokenized full-text search. The home page search is a separate substring filter over unit label and description.

The current UI does not send its search term to the backend API. Therefore, the MongoDB regex search query is not on the interactive UI's normal search path today.

### Backend API

`GET /api/articles?category=...&search=...` remains available. `backend/src/modules/content/contentRepository.js`:
- trims and caps search text at 100 characters;
- escapes regex metacharacters;
- applies case-insensitive, unanchored regex matching to `title`, `eyebrow`, `description`, and `tags`;
- applies a category equality filter when supplied;
- projects full article `content` out of list responses.

The fallback implementation uses case-insensitive `includes()` against the same fields. This is intentionally substring-style behavior. Replacing it with MongoDB `$text` would change semantics through tokenization, stemming/term matching, and ranking behavior; do not do that silently.

## Live Atlas inspection

Live state at audit time:
- `techkatta.articles`: 11 documents.
- `techkatta.categories`: 5 documents.
- Article indexes: `_id_`, unique `slug_1`, and `category_1`.
- No Atlas Search index was present.

Read-only `explain("executionStats")` observations:

| Query | Winning plan | Docs/keys examined | Returned | Reported execution time |
|---|---|---:|---:|---:|
| `category = distributed-systems` | `IXSCAN` on `category_1` | 4 docs / 4 keys | 4 | 1 ms |
| case-insensitive substring regex for `kafka` across the four search fields | `COLLSCAN` | 11 docs / 0 keys | 2 | 0 ms |

The category index is working. Search does a collection scan because the pattern is an unanchored, case-insensitive regex across multiple fields. On the current 11-document collection, the explain output shows no meaningful latency issue; the plan is a scalability concern as content grows, not evidence of a current production bottleneck. Millisecond timings on this small collection should not be treated as a load benchmark.

## Decision

**No search implementation change in this audit step.** Preserve current substring matching and response behavior. Do not add a text index and switch to `$text` solely to eliminate `COLLSCAN`.

Re-evaluate when either:
- the article collection grows materially beyond the current small set;
- search becomes a measured latency/CPU contributor;
- the frontend is changed to query the backend interactively.

At that point:
1. Define the exact semantics to preserve (substring vs token match, case folding, tags, empty query, and category+search combinations).
2. Benchmark representative queries and query plans with realistic collection size.
3. Evaluate Atlas Search autocomplete or a dedicated normalized/ngram strategy if true substring matching is still required.
4. Add regression tests comparing database and fallback results before changing behavior.
5. Re-run explain and production-safe load validation after the implementation.

## Evidence boundaries

- This was a read-only live database query-plan inspection plus source inspection.
- It was not a stress test, capacity test, or full search correctness test across a large corpus.
- No MongoDB documents, indexes, application code, or production configuration were changed.
