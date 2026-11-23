# 49: finishing the 3D migration (instructions for the implementing session)

Written 2026-11-23 for a Claude Sonnet 5.5 session at medium effort. Owner: "This is still the neo-brutalism tech
katta page. I want this also to be in 3d design … WE NEED TO DO THE ENTIRE MIGRATION". The owner's screenshot was the
problem workspace (`/problems/menu-search`) on a phone: the React app's header ("‹ Design menu search"), its bottom
tab bar (Dashboard · Learn · Problems · Search · You), an italic serif title and the old split layout. Only the
colours had changed.

**The goal:** when this is done, nothing on tech.katta.cc looks or behaves like the old React app. Every page has the
3D site's frame, type, panels and motion. The canvas, the judge, Replay, the AWS credit, Ask the interviewer, sign-in
and account sync keep working exactly as they do now.

Read this whole file before writing code. Then read, in this order:
1. `48-3D-SITE-AT-ROOT.md` (this repository): what is already done, and why.
2. In the app repository (`yashbhoomkar/tech-katta`):
   - `frontend/site3d/README.md` and `frontend/site3d/PROTOTYPE-NOTES.md`: how the 3D site is built.
   - `frontend/site3d/scripts/pages/sim.js` and `styles/app.css` (its `.brief`, `.hud`, `.dock`, `.verdict` rules and
     the "simulator, rebuilt for portrait" section of the notes): this is the design language the workspace must
     adopt.
   - `frontend/next/src/features/workspace/Workspace.tsx` and `frontend/next/src/pages/ProblemWorkspace.tsx`: how the
     workspace is mounted today.
   - `frontend/src/solve.jsx`, `frontend/src/lab/Canvas.jsx`, `frontend/src/lab/nodes.jsx`,
     `frontend/src/solve/v2.jsx` (`replayAt`) and `frontend/src/account.js`: the code you keep and restyle.
3. `17-SESSION-HANDOVER.md`, section 0, and `11-MONGODB-COMMIT-LEDGER.md`: the working rules and the ledger.

## Where things stand (2026-11-23, `main` at `78af778` or later)

| Address | Served by today | Target |
|---|---|---|
| `/`, `/home`, `/learn…` (4 sections), `/simulator…`, `/problems` (list) | 3D site (`frontend/site3d`) | done |
| `/problems/<slug>`, `/problems/sandbox`, `/problems/challenge/<id>`, `/problems/shared` | React app (`frontend/next`) in its `3d` look | **3D frame (phase 1), 3D panels (phase 2), 3D replay (phase 3), phone stages (phase 4)** |
| `/practice`, `/practice/<slug>` | React app | **3D frame (phase 1)** |
| `/me` (sign-in, account, settings) | React app | **3D page (phase 5)** |
| `/learn/quick-notes…`, `/privacy`, `/terms`, not-found | React app | **3D pages (phase 5)** |
| `/dashboard…` (old links) | React app (`content/legacy.ts` redirects) | **host redirects (phase 5)** |

How the two apps share the site today:
- **Hand-over:** each address belongs to one app. The three lists of 3D addresses must agree: `OWN` in
  `site3d/scripts/app.js`, and `OWNED_BY_3D` in both `hosting/switch.mjs` and `next/src/app/router.tsx`.
- **Production flags:** the React app is built with `VITE_SITE3D=1` (it hands 3D addresses over with one whole page
  load) and `VITE_STYLE=3d` (its colours).
- **Shared browser data:** the theme key (`tk-theme`, dark by default), and the canvas's own record (`tk-progress-v1`
  steps and stars, `tk-subs-v1`, `tk-lab-v1`), which the 3D Problems list only reads.

## The architecture to reach: one site, React only as islands

Do **not** rewrite the canvas, the judge or account sync in plain JavaScript. They are large, tested and correct. Do
this instead:

1. **The 3D site owns every address.** `site3d/scripts/app.js` routes all of them, and the page frame (top bar,
   sidebar, bottom bar, theme, transitions) is always the 3D one.
2. **The React parts become islands.** A new Vite build in `frontend/next` (e.g. `vite.islands.config.ts`, library
   mode, entry `src/islands/index.tsx`) outputs one ES module, plus its CSS and lazy chunks, into `dist/3d/islands/`.
   It exports plain functions, for example:
   - `mountWorkspace(el, { slug })`, `mountChallenge(el, { id })`, `mountSandbox(el)`, `mountShared(el)`,
     `mountPractice(el, { slug })`;
   - `mountAccount(el)` (sign-in button, account panel, settings) if `/me` needs React (see phase 5);
   - each returns an `unmount()`.

   Each island renders the existing component (`Workspace`, `Challenge`, `Sandbox`, `Practice` from
   `features/workspace/Workspace.tsx`) **without** `AppShell`, the React router's pages or the React sidebar and tab
   bar. Wrap it in a memory router if a component calls `useNavigate`, and turn its navigations into
   `window.tkGo(path)` (the 3D router; whole page loads for anything the 3D site doesn't route).
3. **A 3D page per island.** It renders the 3D frame, imports the island module, calls `mount…` into a container and
   calls `unmount()` in its cleanup.
4. **At the end (phase 6), `frontend/next` is only the islands.** Its `AppShell`, pages, router, the `default` and
   `neo-brutalism` looks, `VITE_SITE3D`, the hand-over code (`ToSite3d`, `Own`) and the 3D app's
   "reload when Back lands on a React address" all go. `hosting/switch.mjs` becomes "write the 3D shell at every
   address, plus the search-engine text".

Keep the content gate exactly as it is: whatever a signed-out visitor can or cannot open today
(`next/src/content/gate.ts`, `ContentGate.tsx`), they can or cannot open after. Port that rule; don't drop it.

## Phase 1: the workspace inside the 3D frame

Addresses: `/problems/<slug>`, `/problems/sandbox`, `/problems/challenge/<id>`, `/problems/shared`, `/practice…`.

1. **Build the islands** as above. Its CSS must be scoped: it may not restyle the 3D site's pages. The legacy CSS
   already lives under `.tk-legacy`; keep it there.
2. **Add the 3D pages** (`site3d/scripts/pages/workspace.js`, …) and their routes in `app.js`.
   - The page is a focus page like the simulator: `body.focus-page`, the sidebar folded to its rail on wide screens,
     no footer, the workspace filling the height below the 3D top bar (`100dvh` minus the bar). On phones the 3D
     bottom bar stays.
   - Breadcrumbs as on other 3D pages: Dashboard / Problems / <problem>.
   - Every `/problems/*`, `/practice*` address joins `OWN` (and the other two lists, until phase 6 deletes them).
3. **Fix the island's links.** `Workspace.tsx` turns the legacy hash links (`#problems/<slug>`, `#concepts/…`) into
   routes; in the island these must call `window.tkGo` instead. Check every way out of the workspace: next problem,
   all problems, a hint's article link, the Solution tab (it opens the article), Ask the interviewer, share links
   (`setShareBase` must keep producing `/problems/shared#problems/shared/<data>`).
4. **SEO:** `switch.mjs` writes the 3D shell at `/problems/<slug>` for each problem (the search-engine pages exist
   today; keep their text).

Done when the owner's screenshot case is fixed on a 412 × 915 phone and on a 1440 × 900 desktop:
- **No React frame:** no "‹ Design menu search" header, no five-tab React bar.
- **The 3D frame:** the 3D top bar, sidebar or rail, and the bottom bar.
- **Nothing broken:** Run, Submit, Replay, Ask the interviewer, Reset, Copy to my canvas, Hints, Submissions, Export
  and share links all work; a submission still counts on `/problems` (solved tick, best score).

## Phase 2: the workspace's own panels in the 3D design language

The canvas stays a 2D React Flow canvas. Everything around it takes the 3D site's grammar (`site3d/styles/app.css`).
The rule of thumb: anything that floats is a glass card like the simulator's `.brief`, `.hud` and `.dock`.

- **Type:** Instrument Sans and Geist Mono only.
  - Remove the serif and the italic titles (the "*Design menu search*" in the screenshot comes from
    `frontend/src/theme/premium.css` and `solve.css`).
  - Use the 3D type scale: 12 / 14 / 16 / 18 / 22 / 28, page titles 40.
  - Text is pure white on dark and pure black on light (the 3D site's rule).
- **Problem pane** (Description, Your answer, Hints, Solution, Submissions):
  - one glass card, its tabs as the 3D segmented control (`.seg` with the sliding pill);
  - the quality table and the callouts as 3D cards.
- **Top actions** (Hide the problem, ‹ ›, bookmark, guided, mock, Timer, Reset, Run, Submit, Ask the interviewer):
  - one glass bar;
  - buttons are the 3D `.btn dark` (Submit, the primary) and `.btn light` (the rest), all pills, 40 px tall (44 on
    touch).
- **Canvas chrome:**
  - the palette, the inspector, the checks line, Export and the minimap are glass cards floating over the canvas,
    which is full-bleed with the 3D dot grid;
  - the cards (`.ln`, `lab/nodes.jsx`) get the 3D look: dark card `--card`, a pastel tile per kind in the 3D
    palette's colours (`figureTokens.module.css` already maps `--cat-*`), radius 14, a soft halo instead of the hard
    outline. Busy is amber, down is coral `#EF4E4E` (pulsing), healthy keeps its colour with a green halo, as on the
    3D models.
- **Results and Replay:**
  - the results console is a bottom sheet like the simulator's `.verdict`;
  - the Replay bar is like the simulator's timeline (time, traffic, errors and p99 at the top as a `.hud`, the
    scrubber at the bottom); the AWS credit meter sits in it.
- **Motion:** the 3D site's easing (`--out`) and durations; nothing new on a timer; reduced motion respected.
- **No colour codes outside theme files** (the `theme.test.js` rule): put new colours in the token files.

Done when a screenshot of the workspace, of Run results, and of Replay at minute 30 of "A zone goes dark" (desktop and
phone, light and dark) could pass for a page of the 3D prototype. Compare them side by side with
`/simulator/ind-vs-pak`.

## Phase 3: Replay in 3D (the signature)

The 3D site's idea is "watch a system fail". Give the learner's own design that.

- **A "3D" toggle** on the canvas toolbar, enabled during ▶ Watch and ▶ Replay. It shows the design in the 3D engine
  (`site3d/scripts/world.js`: `createWorld`, `setSystem`, `setState`, `setCamera`) in place of the 2D canvas, same
  size, same scrubber.
- **Map the design to a 3D system:** `parts[id] = { kind, x, z, name }` and `paths[edgeId] = [from, to]`.
  - Use the node positions: x/240 → x, y/240 → z, then centre.
  - Kinds:

    | Canvas type | 3D kind |
    |---|---|
    | client | laptop |
    | cdn | globe |
    | lb, apigw | lb |
    | server, processor, realtime, scheduler | server |
    | cache | cache |
    | database, coord | db (`layers` 2 for a replica) |
    | queue | queue |
    | stream, pubsub | kafka |
    | external | small |

  - Use the part's name.
- **Drive the states from `replayAt`**, the same data the 2D replay uses:
  - load ρ < 0.7 → `ok`, < 1 → `warn` (amber), > 1 → `alert`; down → `alert` plus `explode` the part;
  - a cache's warm-up → `fill`;
  - arrow rates → path speed;
  - labels show load % and instances.
- **The camera:** frame the system the way `world.frame()` does on the simulator page; no camera move per tick.
- **Watch:** ▶ Watch (one request's trip) highlights the parts and paths of the trip in order.
- **Performance:** the 3D world must stop drawing when hidden (`world.destroy()` on toggle off, and world.js already
  pauses off-screen). Phones use the light quality levels world.js already has.

Done when Replay of the URL shortener solution, scrubbed to the zone going dark, shows the database's standby taking
over in 3D, and the scrubber moves the 3D state backward and forward.

## Phase 4: the workspace on phones, in portrait stages

Follow `PROTOTYPE-NOTES.md`, "the simulator, rebuilt for portrait": one thing on screen at a time, set as
`data-phase` on the page.

1. **Brief:** the problem as a card anchored low, with "Start designing".
2. **Build:** the canvas full screen (pinch to zoom, as now), the palette as a bottom sheet of parts, a slim bar at the
   top with Run and Submit.
3. **Run:** results as a bottom sheet.
4. **Replay:** full screen, the HUD on top, the timeline at the bottom.
5. **Verdict:** a bottom sheet with what broke and "Change the design".

The problem pane's tabs (Your answer, Hints, Submissions) open as sheets from the top bar. Check at 320 × 568,
390 × 844 and 412 × 915, light and dark:
- no panel covers another or the top bar;
- every control is 40 px or more;
- no sideways scroll.

## Phase 5: the remaining pages

- **`/me`:** a 3D page (`site3d/scripts/pages/me-account.js`) with:
  - the Google sign-in (the terms checkbox first; `frontend/src/account.js` is plain JS: import it directly if its
    imports allow, else mount an `account` island);
  - the signed-in panel (name, sign out, sign out everywhere, delete account if it exists today) and the settings the
    React `/me` has (theme, the progress shown there).

  Keep `/v1/auth/config`, `/v1/me`, `/v1/auth/google`, `/v1/auth/signout(-all)` exactly as used now. After sign-in,
  account sync (`syncLab`) must still run. Check with the API locally (sign-in can be tested for the signed-out state
  and the button; ask the owner to try a real Google sign-in on the preview).
- **Quick Notes** (`/learn/quick-notes`, `/learn/quick-notes/<slug>`):
  - a fifth section on the 3D Learn page (its colour: lemon; tab "Quick Notes");
  - the reader as the other 3D articles, without a 3D story unless one fits;
  - its items come from the site content (`site.notes`, see `next/src/pages/QuickNotes.tsx` for the API it reads).
- **`/privacy` and `/terms`:** plain 3D reading pages from the same content the React `Policy.tsx` reads.
- **Not found:** the 3D "Nothing runs at this address" page, with a real 404 status (the host's `404.html` is the 3D
  shell).
- **`/dashboard…` old links:** move the map in `next/src/content/legacy.ts` into `hosting/routes.json` redirects
  (permanent), and regenerate `vercel.json` (`node hosting/emit.mjs vercel`; `hosting.test.js` checks they match).
  Keep `/problems/shared#problems/shared/<data>` working.
- **Search** (the React ⌘K palette and the phone's Search tab): add a 3D search, a sheet over the page listing
  articles and problems by title (the article list is already loaded), opened by ⌘K and a search button in the 3D
  top bar.

## Phase 6: retire the React app

- Delete what phase 1–5 replaced:
  - `next/src/pages/*`, `components/layout/*`, the router and the hand-over (`ToSite3d`, `Own`, `ownedBy3d`,
    `lib/site3d.ts`, `VITE_SITE3D`);
  - the `default` and `neo-brutalism` looks, `scripts/look.mjs`;
  - the e2e specs for retired pages.
- Keep `next/` only as the islands build (or move the islands to `frontend/islands/`, your call; say which in the PR).
- **Hosting:** `package.json` `build` builds the legacy app (the analytics and health pages still come from it), the
  islands, then `switch.mjs`. The three address lists become one (`OWN` in `site3d/scripts/app.js`).
- **The e2e suite** (`.github/workflows/frontend.yml`, job "New frontend end-to-end") must test the real site:
  - serve `frontend/dist` with the host's rewrites (copy the stand-in server below into the repo as
    `frontend/hosting/serve-local.mjs`);
  - run Playwright against it: every address from the table above; a problem opened, run, submitted and replayed; the
    3D replay toggle; Back and Forward; a phone project.
- Remove `frontend/prototypes`-only copies of things now in `site3d` only if the prototype branch doesn't need them
  (the prototype branch is separate; leave it alone).

## Rules you must keep (these have bitten earlier sessions)

- **Branches and PRs:**
  - Work on your session's branch. One phase per PR, as a draft; merge only when the owner says so for that PR.
  - After a merge, check the live site (`curl https://tech.katta.cc/<path>` and a Playwright run against production).
- **Vercel has a limit of 100 deployments a day** on the free plan, and every push makes one. Commit locally as often
  as you like; push once per phase (or when CI must run). Never push screenshots: keep them in your scratchpad
  directory (an earlier session committed 15 by accident).
- **Ledger:** one row per commit (and per merge commit) in MongoDB Atlas, project `6ac298d2a4428fd93e7b3f75`, cluster
  `Cluster0`, database `techkatta_history`.
  - `frontend_git_commits` for frontend commits; `backend_git_commits` too when API code changes (`frontend/src/lab/
    store.js`, `eval/`, `judge/` are also API code).
  - Document `{ key: <full 40-character SHA>, value: <one line> }`. Never a placeholder or a short SHA (an earlier
    session wrote both and had to fix them).
- **Docs:** update `48-3D-SITE-AT-ROOT.md` (or add 50) and `17-SESSION-HANDOVER.md` in this repository as part of
  each phase, plus `frontend/site3d/README.md` in the app.
- **Commit attribution:** commit messages end with the attribution lines your session gives you. Never put a model
  name or ID in a commit, PR or code comment.
- **Address lists:** until phase 6, all three lists of 3D addresses change together.
- **The unlisted prototype address:** never write it in the repository, commits, PRs or docs (the owner shares it
  directly).
- **The API stays on Bluehost.** The owner said: "Unless the bluehost is working let's not shift".
- **Tests:** don't skip, delete or loosen a test to get green. If a test is wrong (it happens: `hosting.test.js` once
  listed only one Cloudflare 404 copy), fix the test and say why in the commit.
- **Theme:** dark is the default, one setting (`tk-theme`) for the whole site.
- **Stored data:**
  - The canvas data the 3D site reads (`tk-progress-v1`, `tk-subs-v1`, `tk-lab-v1`) keeps its shape; signed-in users'
    data syncs through it.
  - `tk-progress-v1` has two writers with different shapes (the legacy `{version, steps, stars, goals}` and
    `next/src/lib/progress.ts`'s per-slug records). Don't make it worse: when you retire `next/src/lib/progress.ts`,
    move article progress to the 3D store (`tk-r3d-progress`) and read the old records once.

## How to check your work locally

Without sign-in, against a local API:
```
cd backend && PORT=5111 FRONTEND_ORIGIN=http://localhost:5199 node src/server.js
cd frontend && VITE_API_BASE=http://127.0.0.1:5111 npm run build
node hosting/serve-local.mjs dist 5199 hosting/routes.json   # files, dir/index.html, rewrites, 404.html
```
Then use Playwright, from your scratchpad, against `http://localhost:5199` (not `127.0.0.1`: the API's CORS allows
only `localhost:5199`). Launch Chromium with `--use-gl=swiftshader --enable-unsafe-swiftshader` so the 3D renders.

For a page with a design on the canvas, seed `tk-lab-v1` with the reference solution from
`GET /v1/articles/url-shortener/solution`:
`{version:1,current:'q-url-shortener',designs:{'q-url-shortener':{id,name,updated,nodes,edges,problem:'url-shortener',v:2}}}`.
Set `tk-r3d-tour` to `"1"` so the tour offer stays out of screenshots.

The stand-in server (add it to the app as `frontend/hosting/serve-local.mjs`):
```js
// a small stand-in for the host: files, dir/index.html, routes.json rewrites, 404.html
import http from "node:http";import fs from "node:fs";import path from "node:path";
const root=process.argv[2],port=+process.argv[3],routes=JSON.parse(fs.readFileSync(process.argv[4],"utf8"));
const T={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".svg":"image/svg+xml",".png":"image/png",".json":"application/json",".txt":"text/plain",".xml":"application/xml",".woff2":"font/woff2"};
const file=p=>{const f=path.join(root,p);try{const st=fs.statSync(f);if(st.isFile())return f;if(st.isDirectory()&&fs.existsSync(path.join(f,"index.html")))return path.join(f,"index.html")}catch{}return null};
const match=(from,p)=>{if(from.endsWith("/*"))return p.startsWith(from.slice(0,-1));return p===from};
http.createServer((q,r)=>{let p=decodeURIComponent(new URL(q.url,"http://x").pathname);let f=file(p);
if(!f)for(const w of routes.rewrites){if(match(w.from,p)){f=file(w.to);break}}
let code=200;if(!f){f=path.join(root,"404.html");code=404}
r.writeHead(code,{"content-type":T[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(r)}).listen(port,"127.0.0.1",()=>console.log("serving",port));
```

Before each push:
- `npm test` in `frontend` (438 tests at the time of writing; grows);
- `npm run check:next` (typecheck, lint, tests) while `next/` exists;
- the full build;
- your Playwright pass on desktop 1440 × 900 and iPhone 13, light and dark, with no script errors.

Look at every screenshot yourself before claiming a phase done.

## Order and size

Phase 1 → 2 → 3 → 4 → 5 → 6. Phases 1 and 5 unblock the owner's main complaint fastest: no React frame anywhere.
Phase 2 is the largest. If a phase grows past roughly 1,500 changed lines, split it into PRs that each leave the site
working.
