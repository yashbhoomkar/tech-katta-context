# 00 — Project Overview

Refreshed 2026-11-23. The architecture table below is current. For anything dated or changing (what is live, open
items, decisions) the always-current record is `17-SESSION-HANDOVER.md`; read that next. The 2026-11-04 and
2026-11-11 snapshots of the site that used to be here (the Lab tab, 7 challenges, the $200,000 credit) were removed as
stale (`14-context-maintenance.md`); they are in git history.

## What Tech Katta is

A system design learning site by Yash Bhoomkar (GitHub `yashbhoomkar`): short, structured articles
with depth on demand, animated diagrams, and practice problems (the former System Design Lab canvas, now inside each
problem) where you build a system from cloud components, send traffic through it and watch what breaks. About 75% of visitors arrive on
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

## What is on the site

The detail is in handover §1; in short (checked against the handover and `47-NEO-BRUTALISM-PRODUCTION.md`, 2026-11-23):

- `tech.katta.cc` serves the neo-brutalism frontend (`frontend/next/`) since 2026-11-18 (PR #372). The older React app in
  `frontend/src` is still in the repository.
- 66 real articles in four sections: Concepts, Components, Interview Questions (including IND vs PAK) and Real systems.
  There is no Lab tab; the canvas opens inside each problem. Every problem and challenge is judged by the v2 evaluator
  (`evaluator.md`).
- Sign in with Google is optional; signed out, everything stays in the browser.
- Design work happens on `prototype.katta.cc` (branch `prototype`), not in the app: `ui-prototypes/README.md` is the
  manual and `ui-prototypes/TRIED.md` records everything tried. The current 3D redesign is an **unlisted** prototype
  whose address the owner shares directly (not written in this repository; see `14-context-maintenance.md`).

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
