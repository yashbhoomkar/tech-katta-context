# 00 — Project Overview

## Identity

Tech Katta is Yash Bhoomkar's personal engineering knowledge base.

- Frontend: `https://tech.katta.cc`
- API: `https://tech-api.katta.cc`
- Main repository: `yashbhoomkar/tech-katta`
- Context repository: `yashbhoomkar/tech-katta-context`
- Frontend framework: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Frontend hosting: Vercel
- Backend primary hosting: VPS
- DNS/CDN/proxy: Cloudflare

## Product philosophy

The site is not intended to look like generic AI-generated documentation.

The desired impression is:

> a real engineer's personal technical notebook that happens to be polished.

Editorial positioning:

- "notes on building systems"
- personal, first-person-adjacent engineering notes
- distributed systems and backend infrastructure are the center of gravity
- databases and AI infrastructure appear when they intersect with something being built or understood
- diagrams should clarify real systems rather than decorate pages
- navigation should feel like a library/notebook rather than a corporate course platform

The homepage currently uses language along the lines of:

> Things I learn, build, and eventually understand.

The description emphasizes that the notes are written while learning, partly to make ideas stick and partly to revisit them later.

## Information architecture

The conceptual hierarchy is:

```
Tech Katta
└── Library
    └── Topics / Units
        └── Notes / Chapters
            └── Article sections
                └── Content blocks
```

The site currently distinguishes:

- Library/home
- Topic/unit pages
- Individual notes/articles
- Upcoming content

The terminology was deliberately humanized from earlier course-like language:

- Start Here → Library
- Overview → All notes
- Units → Topics
- Coming Up → Next
- Chapters → Notes in this topic
- Search chapters → Search notes
- Knowledge check → A few things to think about
- Summary → In short
- On this page → In this note

## Current known content

Distributed Systems is a major topic.

Known chapters include:

1. Distributed Systems Concepts
2. Distributed System Components: An Overview
3. Kafka Fundamentals
4. Kafka — Coming soon

The canonical slug for the components overview is:

`distributed-system-components-overview`

The older route:

`/learn/distributed-system-components`

was changed to redirect to the canonical slug.

## Current production frontend commit

The latest known production frontend state for the mobile swipe work is:

`6af1c16793d4f4dd3b9e76ce04898a9f84ba07e1`

Commit message:

`Open sidebar on home swipe right`

Known Vercel production deployment:

`dpl_ChCm2jSLemuXxaqcNKGUBYFNB7xX`

It was recorded as READY and production.

## Mobile navigation behavior

The intended behavior is:

| Location/state | Gesture | Expected behavior |
|---|---|---|
| Home | swipe right | open mobile sidebar |
| Home | swipe left | no navigation |
| Article/note | swipe right | navigate back |
| Article/note | swipe left | navigate forward |
| Sidebar open | swipe left | close sidebar |
| Any page | short/mostly vertical gesture | ignore |
| Horizontal code/table/diagram content | horizontal swipe | preserve horizontal scrolling |

The implementation uses touchstart/touchend rather than a gesture library.

## Important UX constraints

- Do not reintroduce generic course-platform language.
- Do not turn every component into a pill/card.
- Avoid excessive rounded corners, gradients, shadows, and "AI SaaS" visual conventions.
- Keep the editorial feel.
- Preserve dark mode.
- Diagrams must remain readable in dark mode.
- Static diagrams are preferred when interaction adds no meaningful value.
- Upcoming content should visibly say `UPCOMING` in orange, including in the sidebar.
- Mobile interactions should not break horizontal scrolling.

## Ownership and intent

Yash expects a future coding agent to be able to:

- understand the architecture
- make focused changes
- push changes to GitHub
- verify CI/CD
- verify production where tooling permits
- document each important commit
- preserve rollback ability
- avoid unnecessary rewrites

The agent should behave like a technical collaborator, not like an autonomous product manager inventing unrelated work.
