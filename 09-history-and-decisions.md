# 09 — History and Decisions

This file records important decisions so a future agent understands not only what exists, but why it exists.

## Humanization

### Decision

Make Tech Katta feel like a personal engineer's notebook rather than AI-generated documentation.

### Why

The site is intended to support Yash's professional reputation and LinkedIn-driven discovery. Engineers should encounter a credible personal technical publication, not a generic AI documentation template.

### Changes

Examples:

- `learn. build. explain.` -> `notes on building systems`
- `Learn Technology` -> `Engineering notes`
- `Start Here` -> `Library`
- `Overview` -> `All notes`
- `Units` -> `Topics`
- `Coming Up` -> `Next`
- `Knowledge check` -> `A few things to think about`
- `Summary` -> `In short`
- `On this page` -> `In this note`

## Visual humanization

Cards were made:

- less rounded
- less shadow-heavy
- less transform/animation-driven
- more transparent/editorial

Search fields and metadata were similarly softened.

Article headings were made less mechanically bold and less tracked.

## Static diagrams

### Decision

Prefer static SVG diagrams for explanatory architecture.

### Why

Interactive Excalidraw canvases added complexity without enough learning value for ordinary explanatory diagrams.

Static SVGs:

- load predictably
- are easier to size
- are easier to make dark-mode safe
- are easier to index/render
- do not hijack gestures
- make the article feel more like a publication

## MongoDB normalization

### Decision

Normalize legacy content at the backend boundary when possible.

### Why

The database may contain older content representations. Mutating production content just to satisfy a new renderer increases risk.

The Distributed Systems architecture block is the concrete example.

## Canonical slug

### Decision

Use:

`distributed-system-components-overview`

instead of:

`distributed-system-components`

### Why

The article is an overview, not a deep component-by-component reference. The slug communicates scope more honestly.

The old route should redirect rather than disappear abruptly.

## Mobile swipe navigation

### Decision

Implement lightweight touchstart/touchend gestures.

### Why

The interaction should feel native on mobile without adding a large gesture dependency.

Behavior:

- home right -> sidebar
- home left -> nothing
- inner right -> back
- inner left -> forward
- open sidebar left -> close

Horizontal content scroll is protected.

### Bug

Initial implementation omitted `useNavigate()`, causing a runtime failure.

Fixed in:

`f3a4058c48f928c33e939bce9762040e6602711a`

Home behavior added in:

`6af1c16793d4f4dd3b9e76ce04898a9f84ba07e1`

## Backend security

### Decision

Add practical API hardening before scaling traffic.

Implemented:

- CORS restriction
- headers
- rate limiting
- regex escaping
- input limits
- slug validation
- graceful shutdown

### Why

The site is public and will be promoted through LinkedIn. Public traffic includes accidental misuse and hostile requests, not only friendly readers.

## VPS-first overflow

### Decision

Prefer VPS as the fast primary and use a secondary only when needed.

### Why

The VPS should handle normal traffic efficiently. Paying/using a secondary continuously would complicate the architecture and make latency worse.

Overflow is a safety valve, not the normal traffic distribution mechanism.

## Deployment discipline

### Decision

Do not use repeated deployments as a testing substitute.

### Why

Rapid deploys add uncertainty and can make it difficult to know which version is actually being tested.

## Git + MongoDB ledger

### Decision

Every important Git commit should have a ledger record:

```
key = Git commit SHA
value = human description
```

### Why

This makes the development history searchable outside Git and provides a simple operational rollback index.

## Context repository

### Decision

Maintain a dedicated `tech-katta-context` repository.

### Why

Chat sessions are not guaranteed to preserve all project context. A versioned Markdown context package gives future agents a durable, reviewable source of project knowledge.

The context repository should be updated when architecture, deployment, important UX behavior, or operational conventions change.
