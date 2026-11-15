# UI/UX prototypes: how to make one and put it on prototype.katta.cc/p/&lt;name&gt;/

Owner, 2026-11-15: "We will be needing a lot of prototypes. But we will be building on the frontends… Can we have
prototype.katta.cc. Only the frontend." Later: "dont make changes in tech-katta now, we need the prototype only".

This folder is the manual for that work. Specs for prototypes being built by another session sit here too (e.g. `neo-brutalism-spec.md`), and design thinking that is not built yet (e.g. `neo-brutalism-dark-thinking.md`). **TRIED.md** lists every prototype (and earlier redesign attempt), what it
showed and what the owner said. Read both before starting a new one.

---

## 1. What prototype.katta.cc is

| Address | What it serves |
|---|---|
| `https://prototype.katta.cc/` and `/dashboard/…` | the real React app, built from the **`prototype` branch** of `yashbhoomkar/tech-katta` |
| `https://prototype.katta.cc/p/` | the list of design prototypes, grouped by type (written at build time) |
| `https://prototype.katta.cc/p/<name>/` | one design prototype (`frontend/prototypes/<name>.html` or `frontend/prototypes/<name>/`) |

- **Content is live.** Since 2026-11-15 (owner: "use the actual tech-api.katta.cc from now on") the app on
  prototype.katta.cc reads `https://tech-api.katta.cc` like production. Content endpoints (`/v1/site`,
  `/v1/articles…`, `/v1/lab`, `/v1/problems/stats`) send `Access-Control-Allow-Origin: *`, and the site's CSP already
  lists the API in `connect-src`.
- **No sign-in.** The API accepts accounts, progress, saving and judging only from `FRONTEND_ORIGIN`
  (`https://tech.katta.cc`, `backend/src/server.js`). Calls to `/v1/auth/config` and `/v1/me` from the prototype are
  refused (a CORS error in the console), and the app opens signed out. Opening it would need a backend change (a
  second allowed origin), Google sign-in's authorised origins, and agreement that a prototype may write real user
  data. Don't do it without the owner.
- **Not indexed.** `robots.txt` says `Disallow: /` and every prototype page has `<meta name="robots" content="noindex">`.
- Design prototypes under `/p/` are static: they don't call the API. They carry their own sample data (`scripts/data/`).

## 2. How it is hosted

- **Cloudflare Worker** `tech-katta-prototype`, static assets only. Config:
  `frontend/hosting/wrangler.prototype.jsonc` (custom domain `prototype.katta.cc`, `assets.directory ../dist`,
  `not_found_handling: 404-page`, `html_handling: auto-trailing-slash`). DNS for katta.cc is on Cloudflare; the
  Worker's custom domain creates the record by itself.
- **Deploys on every push to `prototype`**: `.github/workflows/prototype.yml` runs `npm ci`, `npm test`,
  `npm run build:prototype:cloudflare` and `npx wrangler@4 deploy --config hosting/wrangler.prototype.jsonc`.
  Secrets: `CLOUDFLARE_PROTOTYPE_TOKEN` (made from the "Edit Cloudflare Workers" template, scoped to the one account
  and the katta.cc zone; not an account-wide token) and `CLOUDFLARE_ACCOUNT_ID`. A deploy takes about 2 minutes.
- **The build** (`frontend/package.json`):
  `build:prototype:cloudflare` = `VITE_HOST_ANALYTICS=none vite build && node hosting/emit.mjs cloudflare dist && node hosting/prototype.mjs --cloudflare`
  - `vite build` builds the app (default API base `https://tech-api.katta.cc`).
  - `emit.mjs cloudflare` writes `_headers` and `_redirects` from `hosting/routes.json`, the same security headers
    as production, **including the CSP**.
  - `hosting/prototype.mjs` copies every prototype to `dist/p/<name>/`, writes `dist/p/index.html` and
    `robots.txt`, and adds old-address redirects (`/p/revamp-2026-11-15/` → `/p/full-site/`).
- Production (tech.katta.cc, Vercel) never runs `prototype.mjs` and is not affected by anything here.

## 3. Make a new prototype, step by step

### 3.1 Pick the shape

| Shape | Use it for | Example |
|---|---|---|
| **One file**: `frontend/prototypes/<name>.html` | a single idea: an animation study, one screen, a component | `motion.html` |
| **A folder**: `frontend/prototypes/<name>/index.html` + `styles/` + `scripts/` | a whole site or a style that could become the real frontend | `full-site/` |

Name it by **what kind of prototype it is**, not by date (owner: "instead of revamp-2026-11-15 give the names for the
type of prototype"): `full-site`, `motion`, `neo-brutalism`, `checkout-flow`. Lower case, hyphens.

### 3.2 Start from the right base

- **A new visual style for the whole site** (e.g. neo-brutalism): don't copy the scripts. Make
  `frontend/prototypes/<name>/index.html` and `styles/`, and load full-site's logic:
  `<script type="module" src="/p/full-site/scripts/main.js"></script>` and
  `<script src="/p/full-site/scripts/boot-theme.js"></script>`. All pages, routes, navigation, search and
  interactions come for free; the new prototype is a new set of tokens and component styles. Copy
  `full-site/styles/` as the starting point and change `tokens.css` first. Change markup only if the style truly needs
  it; if it does, copy just the page module that changes and import the rest from full-site.
- **A new screen or flow**: add a page module to `full-site/scripts/pages/`, a route in `core/router.js` and its CSS
  in `styles/pages/`, or start a one-file prototype if it is a throwaway study.
- **A one-off study**: copy the head of `motion.html` (meta tags, fonts, tokens) and write one file.

### 3.3 Required in every prototype's `index.html` (or the single file)

```html
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="prototype:type" content="Full site">          <!-- group heading on /p/ -->
<meta name="prototype:summary" content="One line: what this prototype shows.">
<title>Neo-brutalism</title>                                  <!-- card title on /p/ -->
```

### 3.4 The rules the site's security policy enforces

The prototype site sends production's Content-Security-Policy. Breaking these makes things silently not work
(lesson of 2026-11-15: "most of the motions dont work" was the CSP blocking inline scripts).

- **Scripts**: only files from this site (`script-src 'self'`). For a **folder** prototype, write scripts as files
  (`scripts/*.js`, ES modules are fine). No `<script>…</script>` with code inside, **no `onclick="…"` attributes**
  (inline handlers are blocked too), no `eval`, no scripts from CDNs. For a **one-file** prototype, a plain
  `<script>` block (no attributes) is allowed: `prototype.mjs` moves it to `page-N.js` at build time.
- **Styles**: `<style>` and `style=""` are allowed (`'unsafe-inline'`), stylesheets from this site and Google Fonts.
- **Fonts**: Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`) or files in the folder.
- **Images**: from this site or `data:` URIs. No hot-linked images.
- **Network**: `fetch` only to this site or `https://tech-api.katta.cc` (public content only, see §1).
- **The hash is the route** in folder prototypes (`#/learn/…`). In-page links must not use `href="#id"`; scroll with a
  button and `scrollIntoView` (see `landing.js`, `data-scroll`).

### 3.5 Design rules every prototype keeps

- Colours only as tokens (`--surface`, `--ink`, `--c-concepts` …) in one `tokens.css`, with light and dark values for
  the same names. Check contrast: every text pair at least 4.5:1 (full-site's lowest is 5.1:1).
- Dark mode is part of the prototype, not later: System / Light / Dark, set before first paint (`boot-theme.js`).
- Motion follows `/p/motion/` (rules from Emil Kowalski's review-animations, MIT): press `scale(.97)`; hover movement
  only under `@media (hover:hover) and (pointer:fine)`; ease-out for arrivals; no bounce except celebrations; page
  change 160 ms fade; modal 260 ms from .96; drawers and sheets on the drawer curve; things opened from the keyboard
  appear at once; `prefers-reduced-motion` keeps fades and colour, drops movement and loops.
- Works at 375 px wide: no sideways scroll, 16 px side gutters, safe-area insets.
- Plain English in copy (the owner's style: short sentences, no jargon, Indian context: crores, ₹, IND vs PAK).

### 3.6 Try it locally, under the real security policy

Opening the file directly (`file://`) does **not** apply the CSP and hides exactly the bugs that break on the site.
Always test like this:

```bash
cd frontend
npm run build:prototype:cloudflare
npx --yes wrangler@4 dev --config hosting/wrangler.prototype.jsonc --port 8799
# open http://localhost:8799/p/<name>/   (restart wrangler dev after adding new files: it lists assets at start)
```

Then check with Playwright (Chromium is pre-installed in the cloud sessions):

- every screen at 1440 × 900 and at a phone (`devices['Pixel 7']`), in `colorScheme: 'light'` and `'dark'`;
- no `pageerror`, no console errors except the Cloudflare Insights beacon (blocked by the CSP, harmless);
- `document.documentElement.scrollWidth - innerWidth === 0` (no sideways scroll);
- click through every control; look at the screenshots yourself.

`npm test` must still pass (the deploy runs it).

### 3.7 Ship it

```bash
git checkout prototype            # never main, never the PR branch
git add frontend/prototypes/<name>
git commit -m "Prototype: <name> …"
git push origin prototype         # the Prototype workflow deploys in ~2 min
```

Wait until it is live (e.g. `curl -s https://prototype.katta.cc/p/<name>/ | grep '<title>'`), run the same Playwright
checks against `https://prototype.katta.cc/p/<name>/`, then send the owner the link and a short list of what to look at.

### 3.8 After the owner looks

Write the outcome into **TRIED.md** (what was shown, what the owner said, what was kept or dropped) and add a line to
`17-SESSION-HANDOVER.md`. Rename or remove a prototype only if asked; when renaming, add a redirect in
`prototype.mjs` (the `_redirects` block) so old links still work.

## 4. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Buttons or animations do nothing on the site but work locally from a file | CSP blocked an inline script or `onclick`. Move code into a file. |
| A new folder or file is 404 under `wrangler dev` | wrangler dev lists assets when it starts: stop and start it again. |
| Deploy failed: "Maximum number of dynamic _redirects rules" | A wildcard (`*` or `:name`) rule was added to `_redirects`. The site's own file already uses the free plan's 100 dynamic rules; add only exact-path rules. |
| Deploy failed: authentication error | `CLOUDFLARE_PROTOTYPE_TOKEN` expired or lacks Workers Scripts Edit on the account. A new token from the "Edit Cloudflare Workers" template, scoped to the account and katta.cc. |
| Console: CORS error on `/v1/auth/config` or `/v1/me` | Expected: the API allows accounts only from tech.katta.cc. The page opens signed out. |
| Page shows a white flash in dark mode | The prototype is missing `boot-theme.js` in `<head>` (a classic script, not a module). |
| `/p/` doesn't list the prototype | Missing `index.html` in the folder, or the `<title>` / `prototype:type` meta. |

## 5. Files

| File | Role |
|---|---|
| `frontend/prototypes/` | all prototypes (on the `prototype` branch) |
| `frontend/prototypes/full-site/README.md` | the full-site structure, navigation and dark-mode decisions |
| `frontend/hosting/prototype.mjs` | copies prototypes into `dist/p/`, writes `/p/` and `robots.txt`, redirects |
| `frontend/hosting/wrangler.prototype.jsonc` | the Cloudflare Worker |
| `frontend/hosting/routes.json` → `emit.mjs` | headers and CSP shared with production |
| `.github/workflows/prototype.yml` | build and deploy on push to `prototype` |
