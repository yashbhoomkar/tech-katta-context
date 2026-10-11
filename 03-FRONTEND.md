# Frontend Implementation

## Stack

`frontend/package.json` currently specifies:
- React 19.1.1
- React DOM 19.1.1
- React Router DOM 7.9.3
- Vite 7.1.9

Scripts:
- `npm run dev`
- `npm run build`
- `npm run preview`

## Main files

### `frontend/src/main.jsx`

Bootstraps:
- React StrictMode
- BrowserRouter
- App
- global CSS

### `frontend/src/App.jsx`

Owns:
- global application routing
- sidebar
- header/breadcrumb
- homepage
- topic page
- remote article/category loading
- mobile sidebar state
- mobile swipe navigation

### `frontend/src/api.js`

Owns API calls.

Default production API:
`https://tech-api.katta.cc`

Environment override:
`VITE_API_BASE_URL`

### `frontend/src/pages/Article.jsx`

Owns article rendering.

Supported block types:
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

It also owns:
- article metadata
- reading progress
- section collapse state
- mark-as-read localStorage state
- table of contents

### `frontend/src/components/ArticleDiagrams.jsx`

Registry for static diagrams.

Current keys:
- `motivating`
- `architecture`
- `partitions`
- `consumer-group`
- `replication`
- `distributed-architecture`
- `retry`

## Static diagrams

The project deliberately prefers static explanatory diagrams when interaction adds no value.

SVG files live under:

`frontend/public/diagrams/`

Current diagrams:
- `kafka-motivating.svg`
- `kafka-architecture.svg`
- `kafka-partitions.svg`
- `kafka-consumer-groups.svg`
- `kafka-replication.svg`
- `kafka-retry.svg`
- `distributed-system-evolution.svg`

The distributed-system-evolution SVG is a manually created static dark Excalidraw-style SVG. It should not be described as a direct Excalidraw export unless verified separately.

## UI hierarchy

Current hierarchy:

Library
→ Topics
→ Notes
→ Article sections

Article header:
- topic
- article title
- summary
- read time
- updated date

Article body:
- introduction
- collapsible sections
- content blocks
- knowledge-check questions
- summary
- mark-as-read action

Article rail:
- progress
- table of contents

## SEO

`frontend/index.html` includes:
- title
- author
- description
- robots
- OpenGraph metadata
- Twitter metadata
- canonical
- favicon
- noscript fallback links

Static crawler files:
- `frontend/public/robots.txt`
- `frontend/public/sitemap.xml`
- `frontend/public/og-image.svg`

Article.jsx dynamically changes:
- document.title
- description
- OG title/description/url
- Twitter title/description

## Humanization decisions

The site previously used more generic learning-platform language. It was intentionally changed toward personal engineering notes.

Do not reintroduce:
- "Learn Technology"
- "Start Here"
- "Knowledge check"
- "Test your understanding"
- "Summary"
- overly instructional course language

Current equivalents are documented in `01-PROJECT-IDENTITY.md`.

## Upcoming badges

Upcoming topic/unit badges use orange:
- sidebar badge around 9px
- card badge around 10px
- monospace
- subtle orange border/background

Do not make these badges oversized or visually dominant.

## Mobile behavior

Mobile swipe behavior is documented separately in `09-MOBILE-SWIPE.md`.

## UI change discipline

Before changing a UI component:
1. inspect existing CSS and responsive rules
2. understand desktop and mobile states
3. preserve dark-only visual identity
4. avoid broad CSS rewrites for local changes
5. verify that changes do not break the SPA

## Important Vite/React lesson

There was a previous runtime failure caused by calling `navigate()` without initializing `useNavigate()`. Always inspect hook imports and initialization when modifying router behavior.


## Audit follow-up — article metadata lifecycle (2026-10-11)

PR #19 (`fix/audit-frontend-state-metadata`) includes application commit `a1f3b3a803779f5082e3f8a37d65137dd10fc38e`: article metadata effects now restore the previous document title and meta content on cleanup, and remove only meta elements created by the article effect. This prevents Open Graph/Twitter/description metadata from leaking across SPA route changes. Recorded in MongoDB `techkatta_history.frontend_git_commits`. PR #19 is open; build/CI validation is pending.


### PR #19 merged — metadata cleanup (2026-10-11)

Application merge commit `62c4b3ee59a99a57ec98ad221a34d38f37953eb2` contains the swipe dependency and metadata restoration fixes. Frontend CI build and CodeQL passed on PR head `a1f3b3a803779f5082e3f8a37d65137dd10fc38e`. The merge commit is recorded in `techkatta_history.frontend_git_commits`. This is CI/build validation, not a claim of mobile device testing.


## Issue #18 — Kafka fallback content sync candidate (2026-10-11)

PR #20 includes 9b5493801402fa2406542549f2dc87a57478a869 (copy the advanced Kafka sections into the frontend bundle) and a66c7a88eb7a516c25c7bebfb973c24689179a24 (append those sections to the local kafka-basics fallback). Both are recorded in techkatta_history.frontend_git_commits. Frontend CI build passed on the PR head; PR remains open and undeployed.


### PR #20 merged — Kafka fallback content (2026-10-11)

Application merge commit 56b229a2c0fa1d586f200a41c79826ed92a0446b includes the frontend mirror of the advanced Kafka sections and adds them to the local kafka-basics fallback. The merge SHA is recorded in techkatta_history.frontend_git_commits. Frontend build passed on the PR head. Actual API-unavailable/offline browser behavior remains untested; production deployment status is pending.


### PR #20 production deployment context — 2026-10-11

The frontend build passed on merge commit 56b229a2c0fa1d586f200a41c79826ed92a0446b: https://github.com/yashbhoomkar/tech-katta/actions/runs/38137021910. The backend deployment and content sync also passed, but a live Vercel deployment or browser test of API-unavailable Kafka fallback was not independently verified. Do not label that fallback browser-tested.
