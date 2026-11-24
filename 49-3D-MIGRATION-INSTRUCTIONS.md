# 49: finishing the 3D migration: detailed instructions for the implementing session

Written 2026-11-23 for a Claude Sonnet 5.5 session at medium effort. The owner asked for this twice:
- "This is still the neo-brutalism tech katta page. I want this also to be in 3d design … WE NEED TO DO THE ENTIRE
  MIGRATION"
- "It should be in detail"

Follow it in order. Where it says "check", run the check and look at the result yourself before going on. Where it
gives a value (a colour, a size, a file name), use that value; if the code has moved since, find the equivalent and
say so in the commit.

---

## 0. What you are doing, in one paragraph

tech.katta.cc is two apps today:
- **The 3D site** (`frontend/site3d`, plain ES modules, three.js) answers at the landing, `/home`, Learn,
  `/problems` (the list) and `/simulator`.
- **The React app** (`frontend/next`) answers at everything else: the problem workspace, sandbox, challenges,
  `/practice`, `/me`, Quick Notes, the policies and not-found. It wears the 3D site's colours (its `3d` look) but keeps
  its own frame, layout and type. The owner's screenshot shows it:
  - the React header "‹ Design menu search";
  - the React five-tab bottom bar (Dashboard · Learn · Problems · Search · You);
  - a serif italic title;
  - the old split layout squeezed onto a phone.

Your job: make every address a 3D page. **Keep** the canvas, the judge, Replay, the AWS credit, Ask the interviewer,
sign-in and account sync: their code stays and runs as React **islands** inside 3D pages. Then restyle them in the 3D
design language, add a 3D replay, give phones the 3D portrait layout, port the small pages, and delete the rest of the
React app.

## 1. Read first (about 30 minutes; don't skip)

In this repository (`tech-katta-context`):
1. `48-3D-SITE-AT-ROOT.md`: how the 3D site was put at the root, and the decisions.
2. `17-SESSION-HANDOVER.md` § 0 and the latest "Update" entries: the working rules.
3. `11-MONGODB-COMMIT-LEDGER.md`: the ledger (you add a row for every commit).

In the app repository (`yashbhoomkar/tech-katta`), branch from the latest `main`:
1. `frontend/site3d/README.md`, then `frontend/site3d/PROTOTYPE-NOTES.md`. Read the whole of "2026-11-20: the
   simulator, rebuilt for portrait": phase 4 copies it.
2. `frontend/site3d/scripts/app.js` (router, `OWN`, `go`, theme), `shell.js` (sidebar, bottom bar, `PLACES`), and
   `pages/sim.js`, `pages/problems.js`, `pages/learn.js`, `pages/article.js`: the patterns you reuse.
3. `frontend/site3d/scripts/world.js`, lines 1–20 and the `setSystem`, `setState`, `setCamera` and `frame`
   functions: the 3D engine phase 3 uses.
4. `frontend/hosting/switch.mjs` and `hosting/routes.json`: how the site is assembled and served.
5. React side:
   - `frontend/next/src/app/router.tsx`;
   - `features/workspace/Workspace.tsx`, `pages/ProblemWorkspace.tsx`;
   - `content/ContentProvider.tsx`, `content/gate.ts`, `components/SignIn.tsx`;
   - `pages/Me.tsx`, `pages/QuickNotes.tsx`, `pages/Policy.tsx`, `pages/NotFound.tsx`, `pages/Legacy.tsx`,
     `content/legacy.ts`;
   - `lib/analytics.ts`.
6. Legacy code the islands keep:
   - `frontend/src/solve.jsx` (workspace layout; classes `sv-*`), `solve.css`;
   - `src/lab/Canvas.jsx` and `lab.css` (canvas; classes `lab-*`), `src/lab/nodes.jsx` (cards `.ln`, arrows);
   - `src/solve/console.jsx` (results), `src/solve/v2.jsx` (`replayAt`, `ReplayBar`), `src/solve/credit.jsx`;
   - `src/account.js` (sign-in), `src/analytics.js` (`track`, `readArticle`, `referrer`);
   - `src/theme/tokens.css`, `src/theme/premium.css` (the serif titles come from here and from `solve.css` line ~146).

## 2. Where things stand, and two regressions to fix first

### 2.1 Who answers what (main at `78af778` or later)

| Address | Today | After this work |
|---|---|---|
| `/`, `/home`, `/learn`, `/learn/{concepts,components,interview-questions,real-systems}[/<slug>]`, `/problems`, `/simulator[/<id>]` | 3D | 3D |
| `/problems/<slug>`, `/problems/sandbox`, `/problems/challenge/<id>`, `/problems/shared` | React (3d colours) | 3D page + workspace island |
| `/practice`, `/practice/<slug>` | React | 3D page + practice island |
| `/me` | React | 3D page (sign-in sheet, account, settings) |
| `/learn/quick-notes`, `/learn/quick-notes/<slug>` | React | 3D (Learn's fifth section) |
| `/privacy`, `/terms` | React | 3D reading pages |
| unknown address | React 404 | 3D "Nothing runs at this address", status 404 |
| `/dashboard`, `/dashboard/<key>/`, `/dashboard/#<key>` | React redirect (`content/legacy.ts`) | 3D route doing the same redirect (the `#` part never reaches the host, so it can't be a host rule) |

### 2.2 Regressions since #374 (fix in phase 0, before anything else)

1. **The content lock is gone on 3D pages.**
   - The rule (`next/src/content/gate.ts`, copy in `content/site.json` → `account.pageLock`, `account.previewLock`):
     when sign-in is available (`GET /v1/auth/config` → `{enabled: true}`, which it is in production) and the visitor
     is signed out:
     - lists are open;
     - an article shows its opening and then a "Continue reading" sign-in card (`previewLock`);
     - the workspace and challenges show "Sign in to open this" (`pageLock`);
     - Home, the landing, You, Privacy and Terms are always open.
   - Today the 3D Learn articles are fully readable while signed out.
2. **The 3D pages send no analytics.** The React app sends:
   - `track("page_view", {...pageOf(path), ref})` on every route change (`next/src/lib/analytics.ts`
     `usePageViews`);
   - reading time and depth per article (`readArticle` in `src/analytics.js`);
   - Vercel Web Analytics (`src/hostanalytics.jsx`).

   The 3D site sends none of these, so the owner's analytics page (`/analytics`) has had no data for the 3D pages
   since #374.

---

## 3. The target architecture

```
tech.katta.cc/*  ──►  the 3D page shell (dist/index.html and one copy per address, with SEO text)
                      └─ /3d/scripts/app.js  (router for EVERY address)
                           ├─ 3D pages  (site3d/scripts/pages/*.js)
                           └─ island pages: import('/3d/islands/islands.js') → mountWorkspace(el, …)
                                                                        → mountPractice(el, …)
                                                                        → mountAccount(el) (only if needed)
```

- `frontend/next` becomes **the islands build only** (phase 6 deletes the React pages and router).
- The islands keep the legacy code as it is (`frontend/src/...` through the `@legacy` alias). Each island renders
  **one component without the React frame**: no `AppShell`, `Sidebar`, `TabBar`, React header or `PageMeta`
  title handling (the 3D router sets titles).
- The 3D router owns navigation. Islands navigate with `window.tkGo(path)`: same-page for 3D addresses, a whole page
  load for others. Once everything is 3D, every address is in-page.
- One theme setting, `tk-theme`, dark by default (already shared). Islands follow `<html data-theme>`. When the 3D
  theme button changes it, the island must re-render its canvas (the canvas reads colours when it draws:
  `Workspace.tsx` keys the frame by theme for this reason). Listen for a `tk-theme-change` event that `app.js`
  dispatches (add it).

### 3.1 The islands build (phase 1 creates it)

- **Config:** `frontend/next/vite.islands.config.ts`, a copy of `vite.config.ts` with these changes:
  - `build.lib = { entry: "src/islands/index.tsx", formats: ["es"], fileName: () => "islands.js" }`;
  - `build.outDir = "dist-islands"`, `build.cssCodeSplit = true`;
  - `base: "/3d/islands/"`, so lazy chunks and fonts load from there;
  - keep the `@legacy` and `@` aliases and `VITE_STYLE=3d` (`@look` → `styles/looks/3d`).
  - React and react-dom are bundled (no CDN).
- **Script:** add `"build:islands": "vite build -c vite.islands.config.ts"` to `frontend/next/package.json`, and
  run it from `frontend/package.json` `build` before `switch.mjs`.
- **Copying:** `hosting/switch.mjs` copies `next/dist-islands/` to `dist/3d/islands/`.
- **Caching:** `hosting/routes.json` headers gain `"/3d/islands/assets/*"` with
  `Cache-Control: public, max-age=31536000, immutable`, like `/assets/*`. Keep `islands.js` itself not immutable
  (no hash in its name) or give it a hash and write the name into the shell; choose one and say which.
- **The entry,** `src/islands/index.tsx`, with exactly this shape:

```tsx
// Islands: the React parts of tech.katta.cc, mounted by 3D pages (frontend/site3d/scripts/pages/*). Each mount*
// renders one component without the React frame and returns unmount().
import { createRoot } from "react-dom/client";
import { MemoryRouter, useNavigate, useLocation } from "react-router-dom";
import "@/styles/global.css";            // trim in phase 2: nothing here may style 3D pages (see 3.2)
import "@look";
import { Providers } from "@/app/Providers";   // content, account, toast, theme (check what Workspace needs)
import { ProblemWorkspaceIsland, ChallengeIsland, SandboxIsland, SharedIsland, PracticeIsland } from "./workspace";

/** react-router navigations inside an island go to the 3D router (a whole page load for non-3D addresses) */
function Bridge({ path }: { path: string }) {
  const loc = useLocation();
  useEffect(() => { if (loc.pathname !== path) window.tkGo?.(loc.pathname + loc.search + loc.hash); }, [loc, path]);
  return null;
}
function mount(el: HTMLElement, path: string, node: React.ReactNode) {
  const root = createRoot(el);
  root.render(<MemoryRouter initialEntries={[path]}><Providers><Bridge path={path} />{node}</Providers></MemoryRouter>);
  return () => root.unmount();
}
export const mountWorkspace = (el: HTMLElement, { slug }: { slug: string }) => mount(el, `/problems/${slug}`, <ProblemWorkspaceIsland slug={slug} />);
// … mountChallenge, mountSandbox, mountShared, mountPractice
```

Adapt it to the real component names and props. The rule that matters: **an island never shows React chrome**, and
every way out of it goes through `tkGo`. That includes:
- the hash links that `Workspace.tsx` `useHashRoutes` turns into routes;
- the Solution tab opening the article;
- "Next problem" and "All problems";
- links inside hints;
- the share-link base (`setShareBase` must keep producing `/problems/shared#problems/shared/<data>`).

### 3.2 CSS isolation (decide this in phase 1, keep it all the way)

- **No global rule from an island may change a 3D page.** Island CSS must be scoped under its container
  (`.tk-island`) or under `.tk-legacy` (already used by the legacy code).
- **`global.css` and the look's `theme.css`** style `html`, `body` and `:root`. In the islands build, either:
  - drop them and set the tokens on `.tk-island` (preferred), or
  - wrap every selector with a PostCSS step that prefixes `.tk-island`.
- **The theme is the exception.** `data-theme` lives on `<html>` and both apps read it; that's intended.
- **Check:** with an island mounted, the 3D sidebar, top bar and bottom bar look pixel-identical to the same bars on
  `/problems`. Screenshot both and compare.

### 3.3 The address lists

- **Until phase 6,** three lists must agree: `OWN` in `site3d/scripts/app.js`, and `OWNED_BY_3D` in
  `hosting/switch.mjs` and in `next/src/app/router.tsx`.
- **As each phase moves addresses to 3D,** add them to all three.
- **Phase 6** deletes the React router; `OWN` then matches every path, and `switch.mjs` writes the shell everywhere.

---

## 4. The 3D design language, exactly

Measured on production (`/simulator/ind-vs-pak`, 2026-11-23). Use these values. They are the computed values after
all the overrides in `site3d/styles/app.css`, which overrides itself several times; trust these over the first rule
you find.

### 4.1 Tokens (`:root` / `[data-theme="dark"]`)

| Token | Dark | Light |
|---|---|---|
| `--page` | `#121218` | `#FAF8F5` |
| `--card` | `#1C1B24` | `#FFFFFF` |
| `--sunken` | `#26242F` | `#F1EEF4` |
| `--ink` (all text; `--ink-2` and `--ink-3` equal it: the owner's "pure white / pure black text" rule) | `#FFFFFF` | `#000000` |
| `--line` / `--line-2` | `rgba(237,234,245,.10)` / `.22` | `rgba(27,26,34,.10)` / `.20` |
| `--alert` (text) / `--alert-fill` | `#FF8A8A` / `#EF4E4E` | `#B42323` / `#EF4E4E` |
| `--ok` / `--ok-fill` | `#75D079` / `#2FA36B` | `#17794A` / `#2FA36B` |
| `--beacon` ("look here": tour, tap ring; nothing else) | `#ff4a3d` | `#ff4a3d` |
| part pastels: `--sky --lilac --peach --mint --lemon --rose --lime` | `#3DB5FF #C98BFF #FFA24D #3DDC97 #FFD43B #FF7AC6 #A3E635` | same |
| `--mist` | `#5E5B68` | `#D9D6E4` |
| glass panel background / edge / top highlight | `rgb(22 21 30 / .92)` / `rgb(255 255 255 / .14)` / `linear-gradient(rgb(255 255 255 / .09), transparent 40%)` | `rgb(255 255 255 / .92)` / `rgb(255 255 255 / .75)` / `linear-gradient(rgb(255 255 255 / .55), transparent 40%)` |
| glass shadow | `0 24px 60px -20px rgb(0 0 0 / .75)` | `0 20px 50px -24px rgb(30 25 60 / .35)` |
| `--shadow` | `0 0 0 1px rgba(242,240,235,.07), 0 18px 40px -22px rgba(0,0,0,.8)` | `0 1px 0 rgba(23,22,26,.04), 0 10px 26px -18px rgba(23,22,26,.35)` |
| `--sans` / `--mono` | `"Instrument Sans"` / `"Geist Mono"` | same |
| `--out` (all easing) | `cubic-bezier(.2,.8,.2,1)` | same |

They live in `site3d/scripts/palette.js` (pastels) and `site3d/styles/app.css` (the rest). The React `3d` look
(`next/src/styles/looks/3d/theme.css`) and `next/src/features/reader/figureTokens.module.css` (the canvas and figures)
already carry most of them. Make them **one source**: islands read the 3D site's variables wherever they can. Use
`var(--card)`, not a copy of `#1C1B24`.

### 4.2 Components (copy these, don't invent)

- **Glass panel** (`.brief`, `.hud`, `.dock`, `.verdict` in the 3D CSS): the glass background above with the top
  highlight as `background-image`, `1px solid` edge, `border-radius: 24px`, the glass shadow, no backdrop blur.
  Padding: 22px for a content panel, 14px 20px for a HUD, 12px 12px 12px 18px for a dock.
- **Buttons** (`.btn`):
  - Primary is `.btn.dark`: background `--ink`, text `--page`.
  - Secondary is `.btn.light`: background `--card`, `1px` `--line` border, text `--ink`.
  - Shape and type: `border-radius: 10px` (not pills), height 48 (`.sm` 40), padding `0 18–20px`, Instrument Sans
    600, 14–16px.
  - Press: `transform: scale(.97)`.
  - On touch screens every control is at least 40 px tall, and taps reach 44 px.
- **Segmented control** (`.seg` with `.seg-pill`): used for Learn's difficulty filter and Problems' filter. Use it for
  the problem pane's tabs and any two-to-five-way choice.
- **Tabs that scroll** (`.tabs a`): `padding: 9px 14px`, `1px` `--line-2` border, `border-radius: 10px`, 14px 600.
- **Kicker** (`.kicker`): a small mono label in a bordered box, 12px Geist Mono. Use it for "Problem · Medium",
  "Interview question 01".
- **List rows** (`.lesson`): grid `40px 1fr auto`, a status disc (`.st`; done = filled `--acc` with a tick; started =
  half disc), a mono number, a title at 18px 600, a 14px second line, a mono tag on the right.
- **Progress card** (`.cprog`): bold "x of y", a thin bar, "Next up", a `.btn.dark.sm`.
- **Bottom sheet (phones):** a glass panel anchored to the bottom with a 36×4 px grab handle and `border-radius: 24px
  24px 0 0`, above the 3D bottom bar. It never covers the top bar.

### 4.3 Type

- **Faces:** Instrument Sans for everything, Geist Mono for labels, numbers in HUDs and code. No serif and no italics
  anywhere. That includes the workspace title in the owner's screenshot (`.sv-q h1` uses `var(--font-display)`, the
  serif) and `.tk-mark{font-style:italic}` in `src/styles.css`.
- **Sizes:** 12 / 14 / 16 / 18 / 22 / 28 for text; 40 for page titles on wide screens.
- **Weights:** 400 / 600 / 700.
- **Headlines:** the 3D two-line `.headline` (a `.thin` line and a `.heavy` line) on page heads only, not inside the
  workspace.

### 4.4 Motion

- **Easing:** `--out` everywhere.
- **Durations:** state changes 150–250 ms, panels and sheets 300–400 ms, nothing longer than 600 ms.
- **Reduced motion:** honour `prefers-reduced-motion` (no movement; fades at most).
- **Timers:** no new animation runs on its own timer. Motion follows the user, or the replay clock while it plays.

### 4.5 The canvas's part colours (already mapped in `figureTokens.module.css`)

| Tint | Dark | Light |
|---|---|---|
| teal: servers, CDN, processors | sky `#3DB5FF` | deep sky `#0B6FB8` |
| violet: clients, load balancers, realtime | lilac `#C98BFF` | `#7E3FC2` |
| green: databases, coordination | mint `#3DDC97` | `#12895A` |
| amber: caches, external, scheduler | peach `#FFA24D` | `#C2620F` |
| pink: queues, streams, pub/sub | rose `#FF7AC6` | `#C2338A` |

State colours on a card match the 3D models:
- healthy keeps the kind's colour with a green halo (`--ok-fill`);
- busy (load ≥ 70 %) is amber;
- down is coral `--alert-fill`, pulsing (`--beacon` is NOT for status).

---

## Phase 0: fix the two regressions (small, ship first)

### 0.1 The content lock on 3D pages

1. **Account state:** add `site3d/scripts/account.js`, a thin module over the existing `frontend/src/account.js`.
   That file is plain JS: check its imports (`call`, `track`, `syncLab`). If any of them pulls in React or Vite-only
   code, copy only what's needed. It must expose:
   - `accountState()`: `{ ready, enabled, user }`;
   - `onAccount(cb)`;
   - `signIn` via Google: `renderGoogleButton(el)` after the terms checkbox is ticked, as `next/src/components/
     SignIn.tsx` does (`setTermsChoice(true)` first);
   - `signOut()`.

   Copy the exact terms wording from `site.json` → `account`. If the legacy module can be imported as is, use
   `/3d/legacy/account.js` built by a tiny Vite lib build; otherwise port it (about 70 lines). Keep the endpoints:
   `/v1/auth/config`, `/v1/me`, `/v1/auth/google` (POST `{credential, termsAccepted: true}`), `/v1/auth/signout`,
   `/v1/auth/signout-all`. After a sign-in, `syncLab` must still run (it syncs the canvas designs). The API's CORS and
   cookies already work for tech.katta.cc.
2. **A sign-in sheet in 3D** (`site3d/scripts/signin.js`): a glass dialog with the `pageLock` or `previewLock`
   title and text, the terms checkbox (with links to `/privacy` and `/terms`), the Google button, and "Not now".
   Open it from:
   - a "Sign in" item in the 3D sidebar's Account group (it becomes the user's name and picture when signed in, and
     links to `/me`);
   - the lock cards below.
3. **The gate:** port `gateFor` (`next/src/content/gate.ts`) into `site3d/scripts/gate.js`, word for word in
   behaviour, and add tests (see phase 6 for where tests live).
   - `article.js`: when `preview`, render the article up to the same cut the SEO pages use (`seo.js` decides the
     preview length; use the same rule), then a `previewLock` card that opens the sign-in sheet.
   - When `wait`, show the opening only, without the card, until the account is known.
   - The 3D story at the top of an article stays visible (it is the hook).
   - The workspace (phase 1): `locked` shows the `pageLock` card instead of mounting the island.
4. **Check:** signed out on a fresh browser profile:
   - `/learn/concepts/caching` shows the opening and the card;
   - `/learn/concepts` (a list) is fully open;
   - `/home`, `/`, `/me`, `/privacy` and `/terms` are open;
   - with the API unreachable (block `tech-api.katta.cc`), nothing is locked.

   Ask the owner to test a real Google sign-in on the Vercel preview, since you can't.

### 0.2 Analytics on 3D pages

- **Page views:** call the same `track("page_view", {...pageOf(path), ref})` on every 3D route change from
  `site3d/scripts/app.js` (`route()`). Reuse `frontend/src/analytics.js` the same way as the account module
  (import or port).
  - `pageOf` must give the same `{section, slug}` shape `next/src/lib/analytics.ts` gives, so the owner's analytics
    page groups old and new views together. Read `pageOf` there and copy it.
- **Reading:** call `readArticle(section, slug)` when an article opens, and its returned stop function in the page
  cleanup.
- **Vercel Web Analytics:** see how `src/hostanalytics.jsx` loads it, and do the same once per page load in the 3D
  shell (respect the same opt-out, `vercelGate`). The CSP already allows `/_vercel/insights`.
- **Check:** in a local run with the analytics endpoint reachable, the network panel shows one `page_view` per 3D
  navigation, with the right section and slug.

PR title: "3D site: sign-in, the content lock and analytics (regressions since #374)".

---

## Phase 1: the workspace and practice as islands in 3D pages

1. **Create the islands build (§ 3.1)** with these exports:
   - `mountWorkspace(el, {slug})`, `mountChallenge(el, {id})`, `mountSandbox(el)`, `mountShared(el)`;
   - `mountPractice(el, {slug?})`.
2. **Create `site3d/scripts/pages/workspace.js`:**
   - a `mount(view, params, ctx)` like the other pages, which renders the frame below and imports the islands module;
   - a frame of `<section class="ws"><div class="tk-island ws-host"></div></section>`, with no footer;
   - `document.body.classList.add('focus-page')`, so the sidebar folds to its rail on wide screens and the page doesn't
     scroll;
   - `.ws-host` fills `100dvh` minus the top bar (desktop) or minus the top bar and the bottom bar (phones). Measure
     them; don't hard-code.
   - Import the island with `await import('/3d/islands/islands.js')` (add `/* @vite-ignore */` only if a bundler
     ever processes this file; the 3D site has none).
   - Show a skeleton (a glass panel with three grey bars) while it loads.
   - Call `mountWorkspace(host, {slug})`, keep the `unmount`, and call it in the cleanup.
   - **Gate:** if `gateFor('workspace')` is `locked`, render the `pageLock` card instead (phase 0).
   - **Title:** `<problem title> · Problems · Tech Katta` (use the article list for the title).
3. **Routes in `app.js`:** `/problems/sandbox`, `/problems/shared`, `/problems/challenge/<id>`, `/problems/<slug>`
   (in that order: sandbox and shared before the slug), `/practice` and `/practice/<slug>`. Add all of them to `OWN`
   and to the other two lists.
4. **`switch.mjs`:** each `/problems/<slug>` search-engine page is written from the 3D shell (they are in `pagesOf`
   already; the 3D-address test makes it happen once the address is in `OWNED_BY_3D`). Sandbox, shared, challenge
   and practice get a plain 3D shell with a title and `noindex` (as today). Add rewrites to `hosting/routes.json`:
   `/problems/challenge/*` and `/practice/*` → their shell file, then regenerate `vercel.json` (§ rules).
5. **The React app** (until phase 6) hands these addresses over like the others (`Own` in `router.tsx`).
6. **Remove the React chrome the legacy workspace draws itself:**
   - `solve.jsx`'s `.sv-bar` has its own "‹ ›" problem navigation and "Hide the problem". Keep them; phase 2 restyles
     them.
   - The React header "‹ Design menu search" and the React tab bar come from `AppShell`. They're simply absent in the
     island; check.

**Done when** (Playwright, desktop 1440 × 900 and Pixel 7 / 412 × 915, dark and light):
- **The 3D frame:** `/problems/menu-search` shows the 3D top bar, the 3D sidebar rail (desktop) or the 3D bottom bar
  (phone), and the workspace. No element with the React app's header or tab-bar classes exists.
- **Everything still works** with the URL shortener solution seeded (§ 9): Run, Submit (results appear), ▶ Replay of
  "A zone goes dark", Reset, Copy to my canvas (Solution tab), Hints, Submissions, Export → Download PNG, Ask the
  interviewer opens.
- **Results count:** after Submit, `/problems` shows the row's best score.
- **Ways out:** Next problem opens the next workspace; the Solution tab's article opens the 3D article; a hint's
  article link opens the 3D article; Back returns to the workspace with the design still on the canvas.
- **Locked when signed out:** the `pageLock` card shows, sign-in is offered, and no island loads (check the network
  panel).
- **No script errors.**

PR title: "Problems: the workspace runs inside the 3D site (islands)".

---

## Phase 2: the workspace in the 3D design language

The canvas stays a 2D React Flow canvas. Everything around it changes. Do it with CSS first (a new file
`frontend/src/theme/look-3d.css`, imported only by the islands and scoped under `.tk-island`), and change markup in
`solve.jsx` and `Canvas.jsx` only where CSS can't do it. Follow the project rule: **no colour codes outside the theme
files**. `src/theme/theme.test.js` enforces it; use `var(--…)`.

### 2.1 Desktop layout target (1440 × 900)

```
┌ 3D top bar ───────────────────────────────────────────────────────────────────────────────┐
│rail│ ┌ problem card (glass, 380 px, resizable 320–560, collapsible) ┐   ┌ actions bar (glass) ┐ │
│    │ │ kicker "Problem 21 · Medium"                                 │   │ Timer Reset Run      │ │
│    │ │ title 22px 600, dek 16px                                     │   │ [Submit] Ask ▾ ⋯     │ │
│    │ │ seg: Description | Your answer | Hints 6 | Solution | Subs.  │   └──────────────────────┘ │
│    │ │ scrolling content                                            │                            │
│    │ └──────────────────────────────────────────────────────────────┘   canvas: full-bleed,      │
│    │   palette: a glass column at the canvas's left edge                3D dot grid, cards      │
│    │   inspector: a glass card at the right when a part is selected                             │
│    │ ┌ results / replay: a glass sheet at the bottom (dock), 40 % tall, resizable ──────────────┐│
└────┴──────────────────────────────────────────────────────────────────────────────────────────┘
```

- **The canvas** fills everything behind the panels.
  - Its background is `--page` with the 3D dot grid: React Flow `Background` gap 22, dots `--line-2`.
  - The canvas's "fit" must leave room for the panels: `Canvas.jsx` already fits around the results panel (context
    36). Extend it to the problem card and the actions bar.
- **The problem card** replaces the split pane (`.sv-q` and `.sv-split`). "Hide the problem" collapses it into a glass
  chip "Show the problem" at the top left. The resize handle is the card's right edge.
- **The actions bar** is the old `.sv-bar` restyled:
  - order: Timer, Reset, Run, **Submit** (`.btn.dark`), Ask the interviewer (`.btn.light`), then ⋯ (bookmark,
    guided, mock interview, ‹ › problem navigation);
  - the emoji buttons (🧭 🎤 ☆) become line icons in the 3D style (copy the SVG style of `shell.js` `ICONS`: 24 viewBox,
    stroke 1.7, round joins).
- **The palette** (`lab/Palette.jsx`): a narrow glass column; each part a 40 × 40 tile with its kind's pastel tile
  (as on the cards). The "»" expander is kept. Its tooltips follow the 3D style: a glass pill with 12px text.
- **The inspector** (`lab/Inspector.jsx`): a glass card on the right, 320 px, opened on selection, closed with Esc
  or ✕. Field labels are 12px Geist Mono; inputs 40 px tall, `--sunken` background, 10px radius.
- **The checks line** (`.lab-checks`, "1 thing to fix ▾"): a glass pill at the top centre of the canvas. Red dot
  for errors, amber for warnings.
- **Export ▾, ⌨ and Present:** in a small glass toolbar at the top right of the canvas, under the actions bar.
- **The minimap:** a glass card at the bottom right, 180 × 120.

### 2.2 Cards and arrows (`lab/nodes.jsx`, `lab.css` `.ln…`)

- **Card:**
  - `--card` background, 1px `--line-2` border, `border-radius: 14px`, padding 12, width 200 (unchanged: the
    layout depends on it);
  - the tile is 32 × 32 with radius 9, a pastel fill at 16 % and the glyph in the kind's colour.
  - **Selected:** a 2px ring in the kind's colour.
  - **Replay states** (`.ln-rp.ok / .warn / .over / .down`): ok gets a soft halo
    `0 0 0 3px color-mix(in srgb, var(--ok-fill) 35%, transparent)`; warn gets the amber halo; over and down get
    `--alert-fill` and a 1.2 s pulse (none under reduced motion); down also dashes the border.
  - Keep the existing heartbeat, slots, discs, ring and backlog blocks, recoloured with tokens.
- **Arrow pills** (`.lab-pill`): a glass pill (the glass background, 1px edge, radius 999 here: pills on the canvas
  are the one exception, and they are small), 11px 600 text with the protocol dot.
- **Dots on arrows** during Replay: 4.5 px in the arrow's colour, as now.

### 2.3 Problem card content (`solve.jsx`, `solve/*.jsx`, the legacy `d-article` blocks)

- **Header:** the `.sv-q > label` line ("PROBLEMS / Q21") becomes a 3D `.kicker`. The title `.sv-q h1` is 22px 600
  Instrument Sans, no italic, no serif (this is the screenshot's main complaint). The dek is 16px.
- **Tabs** (`.sv-tabs`): the 3D segmented control, full width of the card, labels 14px 600. On narrow cards it
  scrolls sideways like `.tabs`.
- **The callout** ("Design it on the canvas …"): a `--sunken` card, radius 16, with no amber left rule (that was the
  old look).
- **Tables** (Quality / Target): the 3D `.tbl-scroll` style (radius 14, 1px `--line-2`), header row 12px mono.
- **Your answer** (`solve/answer.jsx`): textareas `--sunken`, radius 12, 16px text; the step list like 3D list rows.
- **Hints:** each hint a `.lesson`-like row with a lock and reveal; revealing animates height (250 ms, `--out`).
- **Submissions:** 3D list rows (score as the mono tag on the right; Accepted as a filled disc).

### 2.4 Results, Replay, the credit (`solve/console.jsx`, `solve/v2.jsx`, `solve/credit.jsx`)

- **Results** (`.sv-console`):
  - the bottom glass sheet; its header row has the verdict as a 3D kicker ("ACCEPTED" in `--ok`, "3 OF 10 PASSED" in
    `--alert`), the score at 28px 700, and ✕;
  - test rows are 3D list rows (pass disc, name, the mono tag "p99 96 ms");
  - findings and "Why did this part crash?" are cards inside.
- **Replay** (`ReplayBar`):
  - the sheet becomes the simulator's run layout: a `.hud` at the top right of the canvas with Time, Traffic, Errors
    and p99 (Geist Mono 18px numbers; Errors in `--alert` when above 1 %), and the scrubber along the bottom of the
    sheet;
  - the scrubber's event marks are 8 px discs (red for faults, green for recoveries), not tall ovals;
  - ▶ and ✕ are icon buttons 40 px.
- **The AWS credit meter** (`.sv-credit`): inside the replay sheet, a 3D `.cprog`-style block: the amount in Geist Mono
  22px, "of $200,000", a 4 px bar (`--ok-fill` until 25 % left, then amber, then `--alert-fill`), and the note line
  at 14px.
- **Break it yourself:** a `.btn.light.sm` row of fault choices.

### 2.5 Global replacements inside `.tk-island`

- Map the legacy token names onto 3D ones, extending `figureTokens.module.css` (it already does colours):
  - `--font` → `var(--sans)`, `--font-display` → `var(--sans)`, `--mono` → the 3D mono;
  - `--bg` → `var(--card)`, `--surface` → `var(--sunken)`, `--surface-2` → `var(--card)`;
  - `--brand` (marigold) → `var(--ink)` for primary buttons (the 3D primary is ink); keep marigold only for stars.
- Remove the neo-brutalism leftovers the islands inherit: hard offset shadows (`--sh`, `nb-*` keyframes), 2–3 px
  outlines, `Archivo` and `Space Mono` (these come from the `neo-brutalism` look; the islands must build with `3d`).

**Done when:** for each of these, take a screenshot on desktop and phone, light and dark, and put it beside
`/simulator/ind-vs-pak`, `/problems` and a 3D article; nothing on it should look like the old app:
- the workspace (problem card open);
- the workspace with the problem hidden;
- Run results;
- Replay at minute 30 of "A zone goes dark";
- an article tab with a figure;
- Your answer;
- Hints;
- Submissions.

Then go through this list: no serif, no italics, no hard shadows, no marigold primary buttons, no element below 40 px
that takes a tap. Attach the screenshots to the PR (as PR comments or images uploaded to GitHub, not committed).

PR titles (split if large): "Workspace: 3D panels, cards and type"; "Workspace: 3D results, replay HUD and credit".

---

## Phase 3: Replay in 3D

**Goal:** the learner watches their own design live and fail as 3D models, as on the landing and the simulator.

1. **A "2D | 3D" segmented control** in the replay HUD (and the ▶ Watch player), only while a replay or watch is
   open. 3D replaces the canvas area with a WebGL view of the same size; 2D brings the canvas back. Remember the
   choice (`tk-replay-view` in localStorage, try/catch).
2. **The engine:** load `/3d/scripts/world.js` at runtime from the island (`await import('/3d/scripts/world.js')`).
   Don't bundle three.js twice. Call `createWorld(canvas, overlay, { reduced, still: false })`. It returns `null`
   without WebGL: then disable the 3D option with a tooltip "3D needs WebGL".
3. **The system from the design:** this function lives in `site3d/scripts/replay3d.js` (plain JS, so a test can import
   it):

```js
// design: { nodes: [{id,type,name,x,y}], edges: [{from,to}] } (lab/shared.jsx fromFlow), positions in stored units
const KIND = { client: 'laptop', cdn: 'globe', lb: 'lb', apigw: 'lb', server: 'server', processor: 'server',
  realtime: 'server', scheduler: 'server', cache: 'cache', database: 'db', coord: 'db', queue: 'queue',
  stream: 'kafka', pubsub: 'kafka', external: 'small' };
export function systemOf(design) {
  const xs = design.nodes.map((n) => n.x), ys = design.nodes.map((n) => n.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const parts = Object.fromEntries(design.nodes.map((n) => [n.id, {
    kind: KIND[n.type] || 'small', x: (n.x - cx) / 60, z: (n.y - cy) / 60, name: n.name || undefined,
    ...(n.type === 'database' && n.config?.replicas ? { layers: 2 } : {}) }]));
  const paths = Object.fromEntries((design.edges || []).filter((e) => parts[e.from] && parts[e.to]).map((e, i) => [`e${i}`, [e.from, e.to]]));
  return { parts, paths };
}
```

   Tune the `/60` scale so a typical design (5–12 parts) fills the view like the simulator's systems. Clients stay
   at the far left (the canvas already lays them out that way).
4. **The state per minute,** from `replayAt(rep, P)` (`src/solve/v2.jsx`), which returns for each node
   `{ rho, up, inst, backlog, held, peak, fo, warm, fresh, perHour }`, plus `arrows['from>to']` (calls a second):

```js
export function stateAt(at, design) {
  const parts = {}, labels = {}, fill = {}, explode = [];
  for (const n of design.nodes) {
    const r = at.nodes[n.id]; if (!r) { parts[n.id] = 'dim'; continue; }
    parts[n.id] = r.up === 0 ? 'alert' : r.rho > 1 ? 'alert' : r.rho >= 0.7 ? 'warn' : 'ok';
    if (r.up === 0 && r.fresh?.includes('crash')) explode.push(n.id);   // check the real event names in simulate.js
    if (n.type === 'cache') fill[n.id] = r.warm ?? 1;
    if (r.backlog > 0) fill[n.id] = Math.min(1, r.backlog / r.peak);
    labels[n.id] = r.up === 0 ? 'DOWN' : `${Math.round(r.rho * 100)}%${r.inst ? ` · ${r.inst}×` : ''}`;
  }
  const busiest = Math.max(1, ...Object.values(at.arrows || {}));
  return { parts, labels, fill, explode, speed: 0.6 + 1.6 * Math.min(1, busiest / 50000) };
}
```

   Read `world.js` to see what `labels`, `fill`, `explode` and `speed` accept, and adjust. The rules:
   - colour comes only from state (ok, warn, alert);
   - a part that is down explodes once, when it goes down, and not again while you scrub inside the outage;
   - a failover shows on the database label ("standby took over").
5. **The camera:** after `setSystem`, frame it once: `const f = world.frame(); world.setCamera({ t: f.t, dist: f.dist * 0.85,
   az: 42, el: 32, sx: 0.5, sy: 0.55 })`. Never move the camera per tick; scrubbing must not make the view swim.
6. **Scrubbing:** on every replay index change, call `world.setState(stateAt(at, design))`. While playing, the replay
   clock already advances the index; don't add a second timer.
7. **▶ Watch** (one request's trip, `trace.hops`): highlight the current hop's part (`warn`), dim the others, and
   set its path's state to make the dots run along it.
8. **Performance:**
   - `world.destroy()` when switching to 2D or closing the replay;
   - phones start at the light quality level (`world.js` handles it);
   - check that a 30-part design stays above 40 fps on a mid phone profile (Chrome DevTools, 4× CPU slowdown).
9. **Accessibility:** the canvas has `aria-label` "3D view of your design at <time>: <n> parts, <k> down". Labels
   stay HTML (they already are).
10. **Tests:** `site3d/test/replay3d.test.js` (node:test) covers `systemOf` (kinds, centring, unknown types) and
    `stateAt` (ok, warn and alert thresholds; down → alert + explode once; cache warm → fill).

**Done when:** Replay of the URL shortener solution on "A zone goes dark", in 3D:
- **Healthy start:** at minute 0, every part is green-haloed and the dots run.
- **The zone goes dark:** at the outage minute, the Link service shows fewer instances and goes amber; the database's
  standby takes over (its label says so).
- **Scrubbing:** scrubbing back to minute 0 restores everything without an explosion replaying.
- **Toggle:** switching to 2D and back keeps the minute.
- **Phone:** it works on a phone.
- **Without WebGL:** the 3D option is disabled with its tooltip.

PR title: "Replay in 3D: watch your own design live and fail".

---

## Phase 4: the workspace on phones (portrait stages)

Copy the simulator's phone design (`PROTOTYPE-NOTES.md`, "the simulator, rebuilt for portrait"; `site3d/scripts/pages/
sim.js` and its `[data-phase]` CSS). On screens up to 760 px wide, the workspace page has `data-phase` on its root, and
shows one thing at a time.

1. **`brief`** (first visit to a problem, or "Brief" tapped):
   - the canvas visible dimmed behind;
   - a bottom card with the kicker, title, dek, the quality targets as chips, and "Start designing" (`.btn.dark`);
   - "Read the full problem" opens the Description tab as a full-height sheet.
2. **`build`:**
   - a slim glass bar at the top: problem title (one line, ellipsis), "Brief", Run (`.btn.light.sm`), Submit
     (`.btn.dark.sm`), ⋯ (Your answer, Hints, Submissions, Solution, Ask the interviewer, Export, Reset, Timer);
   - the canvas full screen (pinch zoom, pan, tap a part for its inspector as a bottom sheet);
   - the palette as a bottom sheet of parts: rows with tile, name and a one-line "what it is", tap to add at the
     centre of the view. Its handle folds it to a 56 px strip, so the canvas is reachable.
3. **`run`:** the results as a bottom sheet (§ 2.4); tapping a test's ▶ Replay goes to `replay`.
4. **`replay`:** the canvas (or 3D, phase 3) full screen, the HUD at the top, the timeline and the credit at the
   bottom, "Back to results".
5. **`answer`, `hints`, `subs`:** full-height sheets over `build`, with a "Done" button that returns to `build`.

Rules:
- **Layout:** the 3D bottom bar stays visible in `brief` and `build` and hides in `replay`.
- **The view:** the canvas's fit uses the free band between the top bar and whatever sheet is open (measure; the
  simulator does the same with its camera).
- **Back:** the Android back gesture closes the open sheet first (push a history state per sheet; `popstate` closes
  it).
- **Check at 320 × 568, 375 × 667, 390 × 844, 412 × 915, and the sideways 844 × 390,** light and dark, with the
  owner's case (`/problems/menu-search`) and the URL shortener solution:
  - no panel covers another or the top bar;
  - every tap target is ≥ 40 px;
  - no sideways page scroll;
  - text ≥ 14 px (labels 12 px mono are fine);
  - no layout jump when a sheet opens.

PR title: "Workspace on phones: brief, build, run, replay".

---

## Phase 5: the remaining pages

### 5.1 `/me` (You)

- A 3D page `site3d/scripts/pages/you.js` with the 3D page head (`.headline` "You" / "Your account and how Tech
  Katta looks for you").
- **Profile card:**
  - signed in: picture, name, email · "signed in with Google", Sign out, Sign out everywhere;
  - signed out: "Your progress is kept in this browser." and Sign in (opens the phase 0 sheet).
- **Appearance:** System / Light / Dark as three preview cards (the React `Me.tsx` layout), writing `tk-theme`.
- **Your progress:** articles read per section, problems solved, simulator bests (the 3D store and the canvas's
  record), and "Clear progress on this device" with a confirm.
- **Keyboard shortcuts:** the list from `components/Shortcuts.tsx`, as a 3D card.
- **Links:** Privacy, Terms.
- Always open (no gate).

### 5.2 Quick Notes

- **The fifth Learn section:** add `{ id: 'quick-notes', name: 'Quick Notes', … }` to `SECTIONS` in
  `site3d/scripts/articles.js`, with the sidebar row (lemon), a Learn tab, and the `OWN` pattern. The list comes from
  `GET /v1/site` → `site.notes` (`eyebrow`, `title`, `desc`, `items: [[no, title, topic, status], …]`).
  - Published notes link to their article (`/learn/quick-notes/<slug>`, from the article list).
  - Notes still being written show their status as a mono tag and aren't links.
- **The notes page also has "Numbers worth knowing":** the legacy chart and estimation shortcuts
  (`@legacy/numbers.jsx`, data `site.numbers`). Mount it as an island (`mountNumbers(el)`) inside a 3D card; restyle
  as in phase 2.
- **Articles** use the 3D reader (`article.js`) with the gate. With no 3D story recipe for a note, show the article
  without the story (`figures.js` may give a generic figure; the owner said interview questions and real systems
  have none in lists, so don't add an animation the owner didn't ask for).

### 5.3 `/privacy`, `/terms`

- 3D reading pages (the article reader's text styles, no 3D story) from `site.privacy` and `site.terms` in
  `GET /v1/site` (see `pages/Policy.tsx` for the structure).
- Always open. Keep the search-engine pages `switch.mjs` writes.

### 5.4 Not found

- The 3D "Nothing runs at this address" page (`app.js` already renders it for unknown 3D routes).
- `dist/404.html` becomes the 3D shell with that page, so the host returns status 404 with it. Check
  `curl -sI https://<preview>/no-such-page` gives 404 and a 3D page.

### 5.5 `/dashboard…` old links

Port `next/src/content/legacy.ts` (`legacyKey`, `legacyTarget`, with `fromLab` from `src/routes.js`) to
`site3d/scripts/legacy.js` with its tests (`content/legacy.test.ts` has the cases; port them all). Route `/dashboard`
and `/dashboard/*` in `app.js`: compute the target from the path and the hash, then `go(target, {replace: true})`.
Keep the existing host redirects in `routes.json` (`/dashboard/lab…`).

### 5.6 Search

- The React app had ⌘K and a phone Search tab. Add `site3d/scripts/search.js`:
  - a glass dialog with an input and results (articles by title and dek, problems, Quick Notes, places: Dashboard,
    Problems, Simulator, You);
  - arrow keys and Enter; Esc closes.
- Open it with ⌘K / Ctrl+K and from a search button in the 3D top bar and the sidebar.
- On phones the bottom bar gets a fifth item "Search" (check the bar still fits at 320 px; it was tuned for four,
  § "bottom bar" in `app.css`; adjust widths).

PR titles: "You, Quick Notes, the policies and not-found in 3D"; "Search in 3D; old /dashboard links".

---

## Phase 6: retire the React app

1. **Delete:**
   - `next/src/pages/*`, `components/layout/*`, `app/router.tsx`, `ToSite3d`, `Own`, `lib/site3d.ts`,
     `VITE_SITE3D`;
   - the `default` and `neo-brutalism` looks (`styles/looks/default`, `styles/looks/neo-brutalism`), their blocks in
     every `*.module.css` (search `data-style="neo-brutalism"`), and `scripts/look.mjs` (the islands build sets the
     `3d` tokens directly);
   - `components/CommandPalette*`, `Overlays*`, and anything else only the React pages used (let `tsc` and the
     bundler tell you: build the islands, then delete what nothing imports).
2. **Keep** `next/` as the islands package, or move it to `frontend/islands/`. Your call; state it in the PR. Update
   `frontend/package.json` scripts and `HOSTING.md`.
3. **`switch.mjs`:** every page is the 3D shell, written per address with its search-engine text. One address list:
   `OWN` in `site3d/scripts/app.js`. Delete the other two.
4. **The old legacy app build** (`vite build` in `frontend/`) stays only for `/analytics` (the owner's page) and
   `/health`. Leave them as they are.
5. **Tests:**
   - Move the 3D site's unit tests into `frontend/site3d/test/*.test.js` (node:test, like `frontend/src/**/*.test.js`)
     and add them to `frontend/package.json` `test`: gate, legacy addresses, replay3d, `pageOf`, store sync.
   - Rewrite the end-to-end suite to test the real site:
     - add `frontend/hosting/serve-local.mjs` (§ 9) and point Playwright's `webServer` at
       `npm run build && node hosting/serve-local.mjs dist 4173 hosting/routes.json`;
     - projects: desktop 1366 × 900, Pixel 7, dark;
     - specs: every address in the table in § 2.1 opens the right page; a problem opened, run, submitted and replayed
       (2D and 3D); Back and Forward across pages; the lock signed out; search; theme switch persists; no sideways
       scroll on phones; axe accessibility checks on the main pages (`e2e/a11y.spec.ts` shows how).
   - Update `.github/workflows/frontend.yml`: the e2e job's working directory and command. Keep "Test and build
     frontend".
6. **Docs:** `HOSTING.md`, `frontend/site3d/README.md` (the architecture after the migration), this repository's
   `48-…` (a final "Update"), `17-SESSION-HANDOVER.md`, and a short `50-3D-MIGRATION-DONE.md` listing what was
   removed and where each old feature lives now.

PR title: "Retire the React app: the 3D site is the whole site".

---

## 7. Rules (each one has bitten an earlier session)

- **Branches and PRs:**
  - Your session's branch; one PR per phase (split big phases); open as draft.
  - CI must be green (all checks).
  - Merge only when the owner says so for that PR. Then check the live site with `curl` and a Playwright pass against
    `https://tech.katta.cc`.
- **Vercel's free plan allows 100 deployments a day; every push is one.** Commit locally as often as you like; push
  when a phase (or a split part) is ready.
- **Never commit screenshots** or scratch files. Keep them in your scratchpad directory, and run `git status` before
  every commit (an earlier session committed 15 PNGs from a script's working directory).
- **The ledger** (MongoDB Atlas, project `6ac298d2a4428fd93e7b3f75`, cluster `Cluster0`, database
  `techkatta_history`):
  - one document per commit, and per merge commit, in `frontend_git_commits`;
  - also in `backend_git_commits` if the commit touches API code (`frontend/src/lab/store.js`, `frontend/src/eval/**`,
    `frontend/src/judge/**`, `backend/**`);
  - shape `{ key: "<full 40-character SHA>", value: "<one line> (#PR)" }`;
  - never a placeholder, never a short SHA. Count before and after, and write the counts in the handover.
- **Commits:** end every message with the attribution lines your session gives you. Never write a model name or model
  ID in a commit, PR, comment or code.
- **The prototype's unlisted address** (prototype.katta.cc/p/<random>/) must never appear in the repository, commits,
  PRs or docs.
- **Bluehost:** the API stays on Bluehost (owner: "Unless the bluehost is working let's not shift"). No API move,
  no DNS change.
- **Backend:** if you change API code, run "Deploy backend" by hand after the merge (handover § 0) and say so.
- **Tests:** never skip, delete or loosen a test to get green. If a test is wrong, fix it and say why in the commit.
  This happened before: `hosting.test.js` listed only `/dashboard`'s Cloudflare 404 copy.
- **Colours:** no colour codes outside theme files (`src/theme/theme.test.js`).
- **Hosting:** `hosting/routes.json` is the source; regenerate with `node hosting/emit.mjs vercel`
  (`hosting.test.js` checks they match).
- **Stored data:**
  - The canvas's browser data keeps its shape: `tk-lab-v1` (designs), `tk-progress-v1` (the legacy
    `{version, steps, stars, goals}`; the 3D site reads `solved:<slug>`, `practice:<slug>` and stars), `tk-subs-v1`,
    `tk-answers-v1`, `tk-hints-v1`, `tk-solution-v1`. Signed-in users' data syncs through them.
  - `tk-progress-v1` has a second writer with another shape (`next/src/lib/progress.ts`, per-slug article records).
    The 3D store reads it (`store.syncFrom`) and writes only when it has that shape. When phase 6 deletes
    `next/src/lib/progress.ts`, keep `syncFrom` reading old records once, and stop writing.
- **Theme:** `tk-theme` for the whole site, dark by default.
- **3D site conventions:**
  - plain ES modules, no build step, no new dependencies (three.js is vendored);
  - every page module exports `mount(view, params, ctx)` returning a cleanup;
  - the cleanup frees the 3D context (`world.destroy()`).

## 8. Order, size and time

Order: phase 0, then 1, 2, 3, 4, 5, 6. Phases 0 and 1 fix what the owner sees first: no React frame, and nothing
readable or uncounted that shouldn't be. Phase 2 is the largest. If any PR grows past about 1,500 changed lines, split
it so each part leaves the site working.

After each phase, write a short "Update" in `48-3D-SITE-AT-ROOT.md` covering:
- what changed;
- what you checked;
- the ledger counts;
- anything left over.

## 9. Checking locally

```
# terminal 1: the API, sign-in off
cd backend && PORT=5111 FRONTEND_ORIGIN=http://localhost:5199 node src/server.js
# terminal 2: build the whole site and serve it the way the host does
cd frontend && VITE_API_BASE=http://127.0.0.1:5111 npm run build
node hosting/serve-local.mjs dist 5199 hosting/routes.json
```

- Use `http://localhost:5199`, not `127.0.0.1`: the API's CORS allows only that origin.
- Launch Chromium with `--use-gl=swiftshader --enable-unsafe-swiftshader` so the 3D renders.
- Phones: Playwright `devices['iPhone 13']` and `devices['Pixel 7']`.
- Screenshots go to your scratchpad. Look at every one before you call a phase done.

**Seeding a design on the canvas:** fetch `GET http://127.0.0.1:5111/v1/articles/url-shortener/solution`, then in an
init script, once per session:

```js
localStorage.setItem('tk-lab-v1', JSON.stringify({ version: 1, current: 'q-url-shortener', designs: { 'q-url-shortener': {
  id: 'q-url-shortener', name: 'URL', updated: Date.now(), nodes: sol.nodes, edges: sol.edges, problem: 'url-shortener', v: 2 } } }));
localStorage.setItem('tk-r3d-tour', '1');   // keeps the tour offer out of screenshots
```

Use a `sessionStorage` flag so a reload doesn't reseed.

**Seeding progress:**
`tk-progress-v1 = {version:1, steps:{'solved:url-shortener':true}, stars:{}, goals:{}}` and
`tk-subs-v1 = {'url-shortener':[{at:Date.now(),score:88}]}`. The Problems list should show "1 of 22 solved" and
"best 88".

**`frontend/hosting/serve-local.mjs`** (add it in phase 1; it's what CI uses in phase 6):

```js
// A small stand-in for the host: files, dir/index.html, routes.json rewrites, 404.html (status 404).
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const [root, port, routesFile] = [process.argv[2], +process.argv[3], process.argv[4]];
const routes = JSON.parse(fs.readFileSync(routesFile, "utf8"));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
  ".png": "image/png", ".json": "application/json", ".txt": "text/plain", ".xml": "application/xml", ".woff2": "font/woff2" };
const file = (p) => { const f = path.join(root, p); try { const st = fs.statSync(f); if (st.isFile()) return f;
  if (st.isDirectory() && fs.existsSync(path.join(f, "index.html"))) return path.join(f, "index.html"); } catch {} return null; };
const matches = (from, p) => (from.endsWith("/*") ? p.startsWith(from.slice(0, -1)) : p === from);
http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let f = file(p);
  if (!f) for (const w of routes.rewrites) if (matches(w.from, p)) { f = file(w.to); break; }
  let code = 200; if (!f) { f = path.join(root, "404.html"); code = 404; }
  res.writeHead(code, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(port, "127.0.0.1", () => console.log(`serving ${root} on ${port}`));
```

(It doesn't do redirects or headers; check those on the Vercel preview.)

**Before every push:**
1. `cd frontend && npm test` (438 tests on 2026-11-23; the number only grows);
2. `npm run check:next` (typecheck, lint, unit tests) while `next/` exists;
3. the full build above;
4. your Playwright pass (desktop and phone, light and dark, no script errors), and look at the screenshots.

## 10. The whole migration is done when

1. **No React frame or old look anywhere.** Every address in § 2.1 opens a page with the 3D top bar, the sidebar or
   rail, the bottom bar on phones, and no element of the old React frame. Check in the DOM: no `AppShell` classes, no
   `data-style="neo-brutalism"`, no `Archivo`, `Space Mono` or `Source Serif` font in computed styles on any page.
2. **The owner's case** (`/problems/menu-search` on a 412 × 915 phone) shows the brief card; Start designing →
   build; Run → results; Replay → the HUD and timeline, with a 3D view.
3. **Nothing lost:** Run, Submit, Replay (2D and 3D), Break it yourself, the AWS credit, Ask the interviewer,
   hints, submissions, Copy to my canvas, Export (PNG, SVG, Mermaid, JSON), share links, the sandbox, challenges,
   practice, sign-in and sign-out, account sync, bookmarks, the plan, the timer and the mock interview all work.
4. **The lock and analytics behave as before #374;** the owner's `/analytics` page shows views for every page.
5. **Old links:** `/dashboard/<key>/` and `/dashboard/#<key>` links land on the right page.
6. **Gone:** the React app's pages, router and looks are deleted.
7. **CI** tests the real site end to end.
8. **Docs and ledger:** the docs and the ledger are complete; the owner has merged each PR and seen it live.
