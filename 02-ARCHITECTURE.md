# System Architecture

## High-level architecture

Current production topology:

```
Internet
   |
   +--> Cloudflare
   |      |
   |      +--> tech.katta.cc
   |             |
   |             +--> Vercel
   |                    |
   |                    +--> React/Vite SPA
   |
   +--> tech-api.katta.cc
          |
          +--> Ubuntu VPS
                 |
                 +--> Node.js / Express
                 |
                 +--> MongoDB Atlas
```

The planned overflow architecture adds a secondary Render backend:

```
Internet
   |
Cloudflare
   |
tech-api.katta.cc
   |
routing/proxy
   +--> VPS primary
   |
   +--> Render secondary/overflow
          |
       MongoDB Atlas
```

Important: the intended Render design is **not ordinary active-active load balancing**. VPS is the primary. Render is an overflow/failover target only when the VPS is saturated or unhealthy.

## Frontend

Frontend repository directory:

`frontend/`

Technology:
- React 19
- React DOM 19
- React Router 7
- Vite 7

Production:
- Vercel project: `tech-katta`
- Vercel project ID: `prj_7GIELC6DNWbKJSaluZwo373Pn8ZF`
- Vercel team ID: `team_ESVBoCGScxPRCW4TxwcTeJCg`
- Vercel team slug: `yashbhoomkars-projects`
- domain: `https://tech.katta.cc`

## Backend

Backend directory:

`backend/`

Technology:
- Node.js 22 in CI/deployment
- Express 5
- MongoDB Node driver 7
- CORS
- dotenv

API:
- `https://tech-api.katta.cc`
- local application port: 5000

VPS:
- origin IP: `129.121.133.47`
- systemd service: `tech-katta-api`
- application directory: `/opt/tech-katta`
- service user: `techkatta`

## MongoDB

Atlas project:
- `tech-katta`

Cluster:
- `Cluster0`

Application database:
- `techkatta`

History/ledger database:
- `techkatta_history`

Application collections:
- `categories`
- `articles`

History collections currently observed:
- `frontend_git_commits`
- `backend_git_commits`
- `git_commits` (legacy/older collection that currently still exists; do not assume it is absent)

## Request flow

### Homepage

```
Browser
  -> Vercel React app
  -> initial fallback data
  -> GET https://tech-api.katta.cc/api/articles
  -> GET https://tech-api.katta.cc/api/categories
  -> replace fallback data when remote data is available
```

### Article

```
Browser
  -> /learn/:slug
  -> Article.jsx
  -> fetchArticleBySlug(slug)
  -> GET /api/articles/:slug
  -> MongoDB article document
  -> normalizeArticleContent()
  -> React renderer
```

If the API fails, the frontend falls back to local article data.

## Why fallback exists

The fallback architecture prevents the reading UI from becoming completely dependent on API availability.

The backend also has fallback data if MongoDB is unavailable.

This creates a layered degradation model:

1. MongoDB available → backend serves DB content.
2. MongoDB unavailable → backend serves local fallback.
3. Backend unavailable → frontend serves local fallback.

## Routing

Frontend routes:
- `/`
- `/unit/:unitId`
- `/learn/:slug`

Legacy redirect:
- `/learn/distributed-system-components`
  → `/learn/distributed-system-components-overview`

## Important architectural principle

Keep the frontend, API and database concerns separate.

Do not move article content into the frontend just because it is convenient unless there is a deliberate fallback requirement. Do not move UI state into MongoDB. Do not couple the frontend directly to MongoDB.
