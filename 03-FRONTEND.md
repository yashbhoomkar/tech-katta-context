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


## Issue #18 follow-up — Kafka fallback parity (2026-10-11)

PR #20 merge 56b229a2c0fa1d586f200a41c79826ed92a0446b adds frontend/src/kafkaAdvancedContent.js and appends kafkaAdvancedSections to the local kafka-basics fallback. This keeps advanced Kafka sections available when the API is unreachable and brings frontend fallback content closer to the backend source. Vercel preview status passed; production frontend rollout should be confirmed independently.


## Editorial visual redesign — PR #79 (2026-10-16)

- Application branch: `design/editorial-visual-redesign`.
- Pull request: https://github.com/yashbhoomkar/tech-katta/pull/79 (draft; not merged or deployed).
- `6997dbbb661c55d635c9ab6a57fe919c2469f2d4` — homepage now uses an editorial hero with a CSS request-flow illustration and a dynamic list of published notes.
- `25fda2df01da1b167a66aa33c5b7c680d4cf4dcb` — adds a restrained visual layer for topic rows, recent notes, article hierarchy, focus states, and responsive breakpoints.
- Both application commits were checked for duplicates and recorded in `techkatta_history.frontend_git_commits`.
- Frontend CI passed on the PR head; Vercel preview status and Semgrep passed. CodeQL and the bounded local k6 workflow were still running at the last check. No browser screenshot comparison or production deployment has been verified.
- Preserve all existing route behavior, topic search semantics, article schema, collapsible article sections, read-progress/mark-read state, mobile sidebar/swipe behavior, upcoming labels, and dark-only editorial identity.

- Follow-up cleanup commit `a1519bb4b9144f77d786e121f3edbe74e1c79ac8` removes an unused local binding; recorded in the MongoDB frontend commit ledger. PR #79 head advanced to this commit; CI reruns are pending.

- Contrast refinement commit `76454c3d0f5a5917f3316065e4f1a99eadfa96db` increases contrast for small metadata and technical illustration labels; recorded in the MongoDB frontend commit ledger. CI and preview redeployment are pending for this latest head.


### PR #79 review fixes — 2026-10-16

- Source commits `369a2046d3d993db532c7f32ae1dfa163fb55e11` and `170c0b391a88b5b5737acd2ce68d82446738b730` are recorded in `techkatta_history.frontend_git_commits`.
- Added deterministic `slug` tie-breaking for published notes with equal `order`; strengthened `.library-search:focus-within` border/halo and raised decorative system visual label sizes (top/footer to 10px/9px, node index to 9px).
- CodeRabbit identified these three actionable items. They are addressed in source; latest-head CI is running. No merge or production deployment has been performed.


- Mobile follow-up commit `e31b86f220e96839233f59bdf32df5b8e541f5c2` removes narrow-screen overrides that reduced request-flow labels to 7–8px; the top label and node-detail labels now remain at 9px. Recorded in the MongoDB frontend commit ledger. Latest-head CI and CodeRabbit review are pending.


### PR #79 final pre-merge validation — 2026-10-16

- Final candidate head: `e31b86f220e96839233f59bdf32df5b8e541f5c2`. Frontend CI, CodeQL, Semgrep, Vercel preview, and bounded local k6 integration/rate-limit workflow all passed on this head.
- Local smoke profile: 442 requests (~7.37 req/s), p95 2.79 ms, zero failed requests, zero dropped iterations, 884/884 checks passed. Separate rate-limit profile: 150 requests (~3.00 req/s), 30 HTTP 429 responses, p95 2.21 ms, zero failed requests, zero dropped iterations, 750/750 checks passed. Local-only validation, not a production capacity test.
- CodeRabbit's three actionable findings were fixed; all four inline review threads are resolved. A requested fresh review for the final mobile-only CSS override fix has not published a new review; the CSS and built preview were manually checked. No screenshot-based visual comparison or real-device test is claimed.
- Preview deployment for this exact SHA is READY. PR #79 remains open pending merge; production has not yet been changed.


## PR #79 merged and deployed — 2026-10-16

- PR #79 merged to `main` with merge commit `f5e422b4459928168a6779211aa0d0ef3fa54951`. The merge SHA is recorded in `techkatta_history.frontend_git_commits`.
- Vercel production deployment `dpl_ELdg2b94QGGQckwEAfRDH8nfbhtS` is `READY` for the exact merge SHA and has alias `tech.katta.cc`. Production home, `/unit/distributed-systems`, and `/learn/distributed-system-components-overview` return HTTP 200 and serve the new built JS/CSS assets.
- Post-merge frontend CI, Semgrep, CodeQL, and production read-only Chromium smoke passed. Browser smoke verified home/unit/article routes, browser-origin API/CORS contract, mobile-emulated navigation swipes, and no uncaught page exceptions.
- The backend was unchanged; no backend deployment was required. The bounded local-only k6 smoke/rate-limit test passed before merge; do not present it as production capacity evidence.
- CodeRabbit's three original actionable findings were fixed and all inline review threads resolved. A fresh review request for the final mobile CSS override has not returned a separate result; monitor for late comments and handle actionable findings in a follow-up PR.
- No screenshot-based visual comparison or real physical-device test is claimed.


## Tech Katta learning-library MVP — 2026-10-21

The previous minimal deployment-smoke-test frontend was replaced with the first public learning-platform MVP.

Application commits:
- `6f62cb80160e744e9280d098e8aab9a53b186e0c` — learning library UI and interaction model
- `6da8361e3c810b1670386a813cc44293173c39f9` — responsive editorial dark-theme styling
- `35f1d30309a9d3062ac1b577f416afe3dd093826` — title, description, Open Graph and font preconnect metadata

Current MVP includes six topic areas, client-side search, category filtering, six starter notes, three curated roadmap entry points, note detail modals, and browser-local saved notes. It uses vanilla JavaScript on the existing Vite frontend; no new runtime dependency was added. Starter notes are local seed content, not yet backed by MongoDB or the existing article API. The system-design evaluator is intentionally deferred to a later phase.

Vercel production build for commit `6da8361e3c810b1670386a813cc44293173c39f9` completed successfully. A follow-up production deployment targeting commit `35f1d30309a9d3062ac1b577f416afe3dd093826` reached `READY` (deployment `dpl_89bjmM6KDH5rPLoiQzuGYFHSwHS7`); the `tech.katta.cc` alias was explicitly assigned to it. Public interactive browser testing remains unverified.


## Landing page desktop layout correction — PR #99 (in review, 2026-10-28)

- The new frontend-only landing page uses `frontend/src/home-page.js` and `frontend/src/home-page.css`; content remains hardcoded for this phase.
- Screenshot review exposed a desktop Quick Notes bug: `.tk-note-body` used `padding-left: calc(55% + 22px)` with a max-width, leaving too little width for expanded note text.
- PR #99 changes each desktop note into a grid; the expanded body occupies columns 2–3 under the title/summary area. At the 620px breakpoint, notes return to block flow and use the existing mobile summary layout.
- The Kafka architecture figure is an original manually authored SVG at `frontend/public/diagrams/kafka-architecture.svg`, not the Excalidraw reference/export. It shows producers, a three-broker cluster, topic partitions, consumers, and key properties.
- PR: https://github.com/yashbhoomkar/tech-katta/pull/99. Vercel preview build passed for head `53095e740cdfd419d698d6ededdaace44c97e00e`; visual browser comparison and mobile-device testing remain pending. Do not merge until independent code review is completed.
