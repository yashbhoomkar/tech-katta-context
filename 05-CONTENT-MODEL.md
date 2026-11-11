# Content Model and Authoring

## Current model (2026-11-09) — read this first

Everything below the next heading describes the **MongoDB era (Oct 2026) and is Historical**. Today:

- Content is JSON in the app repo's `content/` folder: `site.json` (landing page, dashboard chrome, sections,
  groups, section headers), `lab.json` (the component catalogue and its 8 challenges, each a small v2 problem since #300: entities, operations, one
  scenario and up to three stars; see evaluator.md §18), `eval.json` (the v2 evaluator's catalogue), `examples/zotato.json`,
  `articles/index.json` (site order) and `articles/<section>/<slug>.json`. The API (`backend/`) validates it
  (`backend/src/content/validate.js`) and serves it; the frontend only renders. Deploys copy it to the VPS as a
  dated release.
- Article fields: `section, slug, group, no, tag, access ("free"|"paid"), date, title, dek, body`; problems also
  have `practice` (tests, rubric, hints, Lab design; never served: the wrong designs).
- Blocks: `tldr, example, fig, h2, h3, p, list, type, code, table, more, analogy, lab`. `h3` is a section inside an
  h2 part (#282). `fig` needs a known id and a `cap`. Inline `` `code` `` is the only inline markup; there are no
  links in text, so articles name other articles in quotes ("'Contention' in Concepts").
- Sections (`site.json` `dashboard.sections`, `[id, label, card|null]`): concepts, components,
  interview-questions, quick-notes, real-systems (no `lab` since #285; the frontend adds Problems from `site.json
  problems`). Groups per section in `dashboard.groups[section]` as `[id, label, desc]`. A section without a library
  card takes its header from `dashboard.heads[section]` = {eyebrow, desc}.
- Cards (`lab` block): `to` is `problems/<problem slug>` or `problems/challenge/<challenge id>` (#285; validated).
  `site.json landingLab.problem` names the problem the landing page runs (IND vs PAK).
- Figures: one module per sub-tab or long article, `frontend/src/figs/<section>/<name>.jsx` exporting `FIGS`
  (one `"id":{C:…}` per line), mirrored by `backend/src/content/figs/<section>/<name>.js`; a backend test checks
  each pair. Modules load per article (`frontend/figs-manifest.js`).
- Counts (2026-11-10, after #285): 66 articles: Concepts 21, Components 10, Interview Questions 29 (7 guides + 22
  problems: the reference's 21 so far and IND vs PAK), Real systems 6. Stage E adds the reference's other 11 problems. Authoring rules: `12-OPERATING-RULES.md` and the app's `content/README.md` (refreshed in #285).


## Canonical article model

The backend documents articles in MongoDB.

Metadata resembles:

```js
{
  slug,
  order,
  title,
  eyebrow,
  description,
  category,
  tags,
  readTime,
  status,
  updated,
  content
}
```

Published status:
- `published`

Upcoming status:
- `soon`

## Content schema

Canonical content:

```js
{
  schemaVersion: 2,
  introduction?: string[],
  sections: [
    {
      id: "unique-section-id",
      title: "Section title",
      blocks: [
        { type: "text", paragraphs: ["..."] },
        { type: "list", items: ["..."], ordered?: false },
        { type: "heading", text: "..." },
        { type: "diagram", name: "diagram-registry-key" },
        { type: "code", language: "javascript", label: "Example", code: "..." },
        { type: "callout", title: "Important", text: "..." },
        { type: "image", src: "...", alt: "..." },
        { type: "video", url: "..." },
        { type: "quote", text: "...", author?: "..." },
        { type: "table", headers: ["A", "B"], rows: [["1", "2"]] },
        { type: "divider" }
      ]
    }
  ],
  knowledgeCheck?: string[],
  summary?: string
}
```

## Supported block types

The backend whitelist is authoritative:
- text
- list
- heading
- diagram
- code
- callout
- image
- video
- quote
- table
- divider

Unknown block types are discarded by normalization.

## Legacy compatibility

Older content may use fields directly on a section:
- paragraphs
- bullets
- diagram
- code
- callout
- subsections

`contentSchema.js` converts these to blocks.

This compatibility layer exists so content can evolve without requiring an immediate destructive database migration.

## Article rendering

Article.jsx maps block types to React components.

Static diagrams are resolved through the diagram registry.

Code blocks support copying through the browser Clipboard API.

Tables are wrapped in a horizontally scrollable container.

Videos support YouTube and Vimeo URL conversion.

## Published catalog

### Distributed Systems

Published:
1. `distributed-systems-concepts`
2. `distributed-system-components-overview`
3. `kafka-basics`

Upcoming:
4. `kafka`

### Databases

Upcoming:
- `cassandra`
- `clickhouse`

### AI Infrastructure

Upcoming:
- `rag`
- `solr`

### Cloud & DevOps

Upcoming:
- `nginx`

### Backend Engineering

Upcoming:
- `docker`
- `kubernetes`

## Canonical slug

The canonical slug is:

`distributed-system-components-overview`

Legacy slug:

`distributed-system-components`

The frontend redirects the legacy route to the canonical route.

The backend seed process also migrates the database document.

## Authoring philosophy

Articles should feel like engineering notes:
- explain the mental model
- use concrete examples
- explain failure behavior
- distinguish guarantees carefully
- call out common misconceptions
- use diagrams where architecture is easier to see than read
- avoid inflated prose

The distributed systems articles explicitly distinguish concepts such as:
- linearizability vs serializability
- replication vs partitioning
- quorum vs consensus
- Saga vs ACID rollback
- crash faults vs Byzantine faults
- CAP vs PACELC
- Kafka consumer groups vs share groups

## Adding a new article

Recommended process:
1. add metadata to `backend/src/data.js`
2. add article content module when large
3. register it in `articleContent`
4. mirror fallback content in frontend when appropriate
5. verify category/order/status
6. seed MongoDB
7. test API endpoint
8. test article route
9. update context documentation if architecture or conventions change

Do not directly mutate production MongoDB as the primary authoring mechanism unless explicitly required. Git-backed content should remain reproducible.

## Important distinction

MongoDB is runtime content storage.

Git is the source-controlled implementation and authoring history.

The commit ledger is separate from article content.


## Kafka local fallback consistency — candidate in PR #20

The backend already appends kafkaAdvancedSections to kafka-basics. The PR mirrors that module to frontend/src/kafkaAdvancedContent.js and appends the same sections from getArticleContent('kafka-basics'), so offline/API-failure fallback content retains the advanced sections. This is a source-level parity fix; frontend build passed, but runtime offline fallback has not been browser-tested. PR #20 is not merged/deployed.


### Kafka fallback parity fix merged — 2026-10-11

PR #20 merged as 56b229a2c0fa1d586f200a41c79826ed92a0446b. The frontend fallback now includes the advanced sections already used by backend content. This avoids a deliberately truncated local version of kafka-basics when API fetching fails. Build passed; no offline browser test has been performed. The merge SHA is recorded in the frontend and backend commit ledgers.


### PR #20 rollout — 2026-10-11

Merge commit 56b229a2c0fa1d586f200a41c79826ed92a0446b deployed successfully. The backend content seed completed with 5 categories and 11 articles; frontend CI build passed. The advanced Kafka sections are now present in the frontend source fallback. Actual offline/browser fallback behavior remains unverified.


## Explicit diagram block contract (2026-10-11)

The distributed-systems overview uses a structured `{ type: 'diagram', name: 'distributed-architecture' }` block in both backend fallback data and the live MongoDB article. Do not infer diagram rendering from slug-specific ASCII code content. `contentSchema.js` normalizes explicit block types and preserves ordinary code blocks as code. PR #27 removed the legacy substring heuristic and added a regression test ensuring code blocks are not rewritten based on article slug.
