# Content Model and Authoring

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
