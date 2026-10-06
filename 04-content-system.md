# 04 — Content System

## Information model

The site is structured as:

```
Library
  -> Topic / Unit
      -> Note / Chapter
          -> Article
              -> Sections
                  -> Blocks
```

The article model is approximately:

```text
article
├── title
├── slug
├── eyebrow
├── description
├── tags
├── sections[]
│   ├── heading
│   ├── ...
│   └── blocks[]
└── metadata / publication fields
```

The exact schema must always be checked in the current repository before adding fields.

## Block types

Known block types include:

- `text`
- `list`
- `heading`
- `diagram`
- `code`
- `callout`
- `image`
- `video`
- `quote`
- `table`
- `divider`

The frontend article renderer maps these blocks to UI components.

## Article rendering principle

Content should remain semantically content-driven.

Do not hardcode an entire article layout in JSX if the existing schema can represent it.

Prefer:

```
content data -> normalization -> renderer -> visual component
```

rather than:

```
article-specific JSX -> article-specific special cases everywhere
```

A special case is acceptable when it is a compatibility layer with a clear reason, as with the legacy distributed architecture ASCII diagram.

## Current Distributed Systems content

Known slugs:

- `distributed-systems-concepts`
- `distributed-system-components-overview`
- Kafka-related content

The canonical components overview slug is:

`distributed-system-components-overview`

The old:

`distributed-system-components`

route should not become the canonical URL again without a deliberate SEO/content migration decision.

## Article language

The content interface deliberately avoids textbook/course boilerplate.

Preferred:

- In short
- A few things to think about
- Before you move on
- Progress
- In this note

Avoid unless genuinely needed:

- Knowledge check
- Test your understanding
- Learning path
- Course module
- generic AI-generated summary headings

## Editorial quality bar

Articles should:

1. explain why the concept matters
2. show concrete system behavior
3. use examples
4. distinguish mechanism from trade-off
5. avoid pretending a simplified diagram is the whole architecture
6. use diagrams where they reduce cognitive load
7. avoid generic filler

For distributed systems, prefer precise vocabulary:

- latency
- throughput
- availability
- consistency
- partition
- replication
- leader/follower
- consumer group
- ordering
- backpressure
- failure mode
- retry
- dead-letter
- load balancing
- caching
- queueing

## Static vs interactive content

A diagram should be interactive only if interaction materially improves understanding.

For explanatory architecture diagrams, use static SVGs.

Interactive Excalidraw should not be reintroduced merely because it looks impressive.

## Database compatibility

MongoDB is a content source, not a reason to couple presentation details to storage format.

If a legacy record can be safely normalized at the API boundary, prefer normalization over destructive database edits.

Any production MongoDB mutation should be explicit, reviewed, and reversible.
