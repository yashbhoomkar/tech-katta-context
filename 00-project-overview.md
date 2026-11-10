# 00 — Project Overview

Rewritten 2026-11-04 to match what is live then; **parts are Historical** (since 2026-11-10 there is no Lab tab, IND vs
PAK is an Interview Question, and the site has 66 articles). The detailed, always-current record is
`17-SESSION-HANDOVER.md`; read that next. Older numbered files describe earlier versions of the
project and are kept for history.

## What Tech Katta is

A system design learning site by Yash Bhoomkar (GitHub `yashbhoomkar`): short, structured articles
with depth on demand, animated diagrams, and the **System Design Lab**, where you build a system from
cloud components, send traffic through it and watch what breaks. About 75% of visitors arrive on
phones from Instagram and LinkedIn, so everything is mobile-first.

- Site: `https://tech.katta.cc` · API: `https://tech-api.katta.cc`
- Application repo: `yashbhoomkar/tech-katta` · Context repo (this one, public): `yashbhoomkar/tech-katta-context`
- Private notes: `yashbhoomkar/tech-katta-private` (owner-side context; attach with `add_repo` only when needed)

## Architecture

| Part | What it is |
|---|---|
| Frontend | React 18 + Vite 6 in `frontend/`, deployed by Vercel on merge to `main`. Two pages: `/` (landing) and `/dashboard/`. No content is hardcoded; everything comes from the API. |
| API | Node 22 using `node:http` (no framework) in `backend/`, on a VPS behind Cloudflare, service `tech-katta-api` on 127.0.0.1:5000. One dependency: the `mongodb` driver (for sign-in). |
| Content | JSON in `content/` (site copy, articles, the Lab catalogue). Validated by `backend/src/content/validate.js`, deployed to the VPS disk as dated releases; invalid content never goes live. |
| Deploy | `.github/workflows/deploy-backend.yml`: tests, then the exact commit is checked out on the VPS, content released, service restarted, `/health` must report the new release; any failure rolls back automatically. |
| Database | MongoDB Atlas, project `tech-katta`, Cluster0 (free tier, AWS Mumbai). `techkatta_history` = the Git commit ledger (key = full SHA, value = what changed). `techkatta_app` = user accounts for sign-in. |
| DNS / proxy | Cloudflare. |

## What is on the site (2026-11-04)

- **Landing**: hero ("System design, explained.") with the animated Kafka figure, buttons to the
  Dashboard and to **IND vs PAK**: the real Lab embedded as a challenge (a three-control version on phones).
- **Dashboard**: starts with no tab selected, showing three Library cards. Tabs:
  - Concepts (1 article: API types)
  - Components (6 articles in subsections Edge, Compute, Storage, Messaging; 3 more planned)
  - Interview Questions (empty)
  - Quick Notes
  - Did you know
  - Lab

  There is also a website tour and a Privacy page.
- **Articles**: In 30 seconds, the Zotato example system (a made-up food delivery app), "In real life"
  analogies, animated figures with a still version for reduced motion and a full-screen view on
  phones, "Go deeper" sections, read aloud (recorded Kokoro voice for the API article), and
  "Try it in the Lab" cards.
- **System Design Lab**: a React Flow canvas with 8 components:
  - Clients, CDN, API Gateway, Load Balancer, Server, Queue, Cache, Database.

  It also has:
  - a simulator using real AWS prices, plus a $200,000 virtual credit that drains as traffic runs;
  - crashes, failover, autoscaling and cache warm-up;
  - 7 challenges scored with 1–3 stars;
  - import and export of designs.
- **Sign in with Google** (on since 2026-11-04): optional. A signed-in user's Lab designs, challenge
  stars and tour progress are saved to their account and synced across devices. Signed out,
  everything stays in the browser.

## How the owner works

- Work end to end without asking permission:
  1. Open a PR.
  2. Wait for CodeQL and the frontend CI to go green (CodeRabbit is skipped).
  3. Merge.
  4. Verify production with the browser scripts in `tools/e2e/`.
  5. Record the commits in the MongoDB ledger.
  6. Update this repo.
  7. Report back.
- Copy must read like a person wrote it, short and concrete. Swiss-style block diagrams. Never show
  a GitHub link on the site.
- Never put secrets in either repo (this one is public). Secrets live only in GitHub Actions
  secrets and, on the VPS, in root-only `/etc/tech-katta/api.env`.
- No monetisation, payments or paid accounts until the owner confirms (see the private repo).
