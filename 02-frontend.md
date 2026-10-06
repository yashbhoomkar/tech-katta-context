# 02 — Frontend

## Stack

The frontend is a React/Vite application.

Important areas:

- `frontend/src/App.jsx`
- `frontend/src/pages/Article.jsx`
- article data/content modules
- `frontend/src/components/ArticleDiagrams.jsx`
- CSS files
- `frontend/public/diagrams/`
- `frontend/index.html`

## Routes

Known routes:

- `/`
- `/unit/:unitId`
- `/learn/:slug`

The article route is the primary content-reading experience.

## App navigation

The header includes a breadcrumb-like path:

`Notes / [Topic] / [Note]`

The wording is deliberately concise and editorial.

The sidebar contains:

- Tech Katta identity
- library/navigation
- topics
- upcoming topics/notes
- navigation back to Tech Katta

The homepage lists topics rather than dumping every article into the first view.

## Homepage positioning

Current intended copy is concise and personal.

Hero direction:

- eyebrow: `Yash's engineering notes`
- heading: `Things I learn, build, and eventually understand.`
- supporting copy focuses on distributed systems/backend infrastructure and notes written while learning
- last-updated indicator is intentionally subtle

The page should look like a personal technical publication, not an enterprise documentation product.

## Visual language

Humanization changes intentionally moved the UI away from:

- excessive rounded cards
- large shadows
- animated card transforms
- search-pill styling
- uppercase corporate metadata
- generic "knowledge base" copy
- course-platform vocabulary

The preferred visual language:

- dark
- restrained
- editorial
- compact
- technical
- subtle borders
- limited radius
- typography carrying hierarchy
- accent color used deliberately

Article containers such as code, callouts, tables, and media use small radii rather than giant rounded containers.

## Upcoming badges

Upcoming items use an orange badge.

The latest known size increase resulted in:

Sidebar:

```
padding: 4px 7px
font-size: 9px
```

Unit card:

```
padding: 6px 10px
font-size: 10px
```

Badge colors use orange `#f59e0b` with restrained translucent background/border.

Do not silently turn these into giant labels.

## SEO

`frontend/index.html` includes:

- author metadata
- description
- robots index/follow
- Open Graph metadata
- Twitter card metadata
- canonical URL
- title
- noscript fallback with published article links

Known title:

`Tech Katta — Engineering notes by Yash Bhoomkar`

There is also:

- `frontend/public/robots.txt`
- `frontend/public/sitemap.xml`
- `frontend/public/og-image.svg`

Article pages update document title and description dynamically and set social metadata.

## Mobile swipe navigation

The implementation lives in `frontend/src/App.jsx`.

It uses touchstart/touchend and intentionally avoids a third-party gesture dependency.

Rules:

- minimum horizontal movement is approximately 70px
- horizontal dominance is required
- vertical gestures are ignored
- when sidebar is open, a left swipe closes it
- when on home, right swipe opens the sidebar
- on non-home pages, right swipe navigates back and left swipe navigates forward
- horizontally scrollable content is protected

Protected selectors include content such as:

- `.doc-code`
- `.doc-table-wrap`
- `.doc-figure`
- `.diagram-static-frame`
- `[data-horizontal-scroll]`

The protection only applies when actual horizontal overflow exists.

## Important bug history

The first swipe implementation caused a runtime failure because it used `navigate(...)` without declaring `const navigate = useNavigate()`.

That was fixed in:

`f3a4058c48f928c33e939bce9762040e6602711a`

Then home right-swipe behavior was added in:

`6af1c16793d4f4dd3b9e76ce04898a9f84ba07e1`

The latter is the known production state.

## Browser testing rule

Do not claim the swipe behavior is browser-tested merely because source inspection looks correct.

Actual browser/touch testing requires an interactive browser/sandbox capable of dispatching touch gestures.

A previous Vercel MCP session returned 403 for team scope `yashbhoomkars-projects`, preventing actual sandbox testing in that conversation. Another new ChatGPT conversation could access Vercel. This was a tooling-session issue, not evidence of a frontend failure.

## Editing principle

Before changing the frontend:

1. inspect the current implementation
2. understand existing CSS/layout constraints
3. preserve current visual language
4. make one coherent change
5. build/test
6. commit
7. record the commit in the MongoDB ledger
8. verify deployment when possible
