# 13 — File Map and Technical Contracts

This is the practical map a future coding agent should use before editing.

## Main repository

`yashbhoomkar/tech-katta`

Expected top-level areas:

```
tech-katta/
├── frontend/
├── backend/
├── scripts/
└── .github/
    └── workflows/
```

The exact tree can evolve. Always inspect live GitHub before editing.

## Frontend contract

### App

`frontend/src/App.jsx`

Responsibilities include:

- routing
- navigation
- sidebar
- homepage/topic navigation
- mobile navigation behavior
- touch gesture handling

Known mobile gesture dependency:

`useLocation()` + `useNavigate()`

The gesture implementation must preserve horizontal scrolling.

### Article page

`frontend/src/pages/Article.jsx`

Responsibilities:

- article route
- article metadata
- section rendering
- block rendering
- diagram selection
- article footer language

Known diagram mapping:

```
distributed-architecture -> DistributedSystemsArchitectureDiagram
```

### Diagram component

`frontend/src/components/ArticleDiagrams.jsx`

Responsibilities:

- map semantic diagram names to static assets
- render accessible `img`
- provide static frame sizing

Do not put article-specific layout logic into this component.

### Public assets

`frontend/public/diagrams/`

Contains static SVG diagrams.

Other important public files:

- `robots.txt`
- `sitemap.xml`
- `og-image.svg`

## Backend contract

### server.js

`backend/src/server.js`

Owns:

- Express application
- middleware
- CORS
- security headers
- request limits
- rate limiting
- API routes
- content normalization integration
- shutdown

### contentSchema.js

`backend/src/contentSchema.js`

Owns:

- content validation/normalization
- compatibility transformations
- legacy content adaptation

Do not use it as a dumping ground for UI components.

### db.js

Owns MongoDB connection behavior.

### seed.js

Seeds/initializes known content.

Do not assume seeding is idempotent without checking the current implementation.

## CI contract

`.github/workflows/deploy-backend.yml`

Backend deployment should remain capable of:

- clean dependency install
- syntax checks
- VPS deployment
- systemd restart
- local health verification
- public smoke tests
- overflow monitor installation

Changes to workflow paths should be considered production-impacting.

## Production smoke contract

`scripts/production-smoke.mjs`

This script is the executable definition of the minimum public API/frontend smoke test.

If a production behavior is important enough to guard, consider adding a deterministic smoke assertion.

## Overflow script contract

`scripts/vps-overflow-router.sh`

It:

- checks local API health
- computes CPU utilization
- persists state
- applies hysteresis
- remains disabled when no overflow upstream is configured

It does not itself perform Nginx routing.

Do not change the script to silently route to an arbitrary service.

## Content contract

Article content uses semantic blocks.

Known block types:

```
text
list
heading
diagram
code
callout
image
video
quote
table
divider
```

A block should be renderable without article-specific assumptions whenever possible.

## URL contract

Frontend:

- `/`
- `/unit/:unitId`
- `/learn/:slug`

API:

- `/api/health`
- category/article/search endpoints as implemented by the live backend

Do not invent endpoint names from this context file; inspect the live server.

## Metadata contract

Homepage metadata is in `frontend/index.html`.

Article metadata is set dynamically by the article page.

Canonical URLs matter because LinkedIn traffic may land directly on an article.

## UX contract

The following are deliberate, not accidental:

- dark theme
- restrained radius
- editorial language
- static explanatory diagrams
- orange upcoming badges
- mobile swipe navigation
- horizontal scroll protection

Changing any of these should be treated as a product decision, not merely a CSS cleanup.

## Code-change contract

A good change is:

- localized
- understandable
- testable
- reversible
- documented when it changes behavior

A bad change is:

- broad rewrite
- unrelated refactor mixed with feature work
- new dependency for a trivial behavior
- database migration to avoid a renderer fix
- production change without verification
