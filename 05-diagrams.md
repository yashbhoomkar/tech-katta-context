# 05 — Diagrams

## Philosophy

Diagrams are one of Tech Katta's main differentiators.

They should communicate engineering structure, not act as decoration.

The current preferred style is a static, dark, Excalidraw-like SVG.

## Renderer

Main component:

`frontend/src/components/ArticleDiagrams.jsx`

The component maintains a map from diagram type to static asset and alt text.

Known diagram names:

- `motivating`
- `architecture`
- `partitions`
- `consumer-group`
- `replication`
- `distributed-architecture`
- `retry`

Known files:

- `/diagrams/kafka-architecture.svg`
- `/diagrams/kafka-consumer-groups.svg`
- `/diagrams/kafka-motivating.svg`
- `/diagrams/kafka-partitions.svg`
- `/diagrams/kafka-replication.svg`
- `/diagrams/kafka-retry.svg`
- `/diagrams/distributed-system-evolution.svg`

## Article integration

`frontend/src/pages/Article.jsx` maps:

`distributed-architecture`

to the distributed systems architecture diagram component.

The corresponding content can use:

```
{ type: 'diagram', name: 'distributed-architecture' }
```

## Distributed architecture diagram

The current static diagram communicates the evolution from:

```
Client -> Application -> Database
```

to a system involving:

```
Client
  |
Load Balancer
  |
API servers
 |   |    \
 |   |     -> Cache
 |   -> Database cluster
 -> Queue -> Workers
```

Workers may update state or call other services.

The diagram was corrected so that cache, database, and queue are not presented as a misleading serial pipeline.

The `distributed-system-evolution.svg` asset was manually created as a static dark Excalidraw-style SVG. Do **not** claim that it is a direct Excalidraw export unless the current repository proves that.

## Accessibility

Each diagram should have meaningful alt text describing its engineering meaning.

Example:

> Distributed system architecture evolving from one application into load-balanced stateless compute, cache, database, queue, and workers.

## Dark mode

A previous problem caused diagram content and background to both appear white.

The invariant is:

- dark site
- readable diagram background
- readable diagram labels
- no white-on-white content
- no accidental light-mode export

When changing a diagram, test it in the production dark theme.

## Diagram sizing

The renderer uses a static frame with a configurable minimum height.

Avoid aggressive zooming.

The image should fit the reading column and preserve enough whitespace to understand the architecture.

Do not embed an interactive canvas merely to solve sizing.

## Adding a new diagram

Preferred process:

1. design the conceptual flow
2. create/export the static SVG
3. put it under `frontend/public/diagrams/`
4. add an entry in `ArticleDiagrams.jsx`
5. add the corresponding article block
6. give it accurate alt text
7. test desktop and mobile
8. verify dark mode
9. commit and ledger the change
