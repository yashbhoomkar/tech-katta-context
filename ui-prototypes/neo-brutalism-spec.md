# Neo-brutalism prototype: complete spec for the implementer

**Target:** https://prototype.katta.cc/p/neo-brutalism/
**Written:** 2026-11-15 by the design session. Implemented by a separate session.

**Status of this spec:** every file below was **dry-run** by the design session. The files were copied into a local
build and served under the site's real security policy (`wrangler dev`). Then:
- every route was checked in light and dark, at 1440 × 900 and on an iPhone 13: **no errors, no sideways scroll**;
- **15 interaction checks** passed;
- the **contrast check** passed (lowest pair 5.4 : 1 in light, 6.2 : 1 in dark).

Nothing was committed. The implementer's job is to create these files exactly, run the checks, look at the
screenshots, ship and record. **No design decisions are left to make.** If something looks wrong in a screenshot,
§10 lists the known trade-offs; anything else goes in the README as a note for the owner. Don't redesign.

Read first, in this order:
1. `ui-prototypes/README.md`: how prototypes are built and hosted, the CSP rules, testing, shipping.
2. `frontend/prototypes/full-site/README.md` (on the `prototype` branch): structure, routes, navigation, dark mode.

---

## 0. Steps at a glance

| # | Step | Section |
|---|---|---|
| 1 | `git checkout prototype && git pull` in `tech-katta` | §6 |
| 2 | Create `frontend/prototypes/neo-brutalism/index.html` | §3 |
| 3 | Create `styles/tokens.css`, `styles/brutal.css`, `styles/phone.css` | §4 |
| 4 | Create `README.md` | §5 |
| 5 | Build, serve with `wrangler dev`, run the 3 check scripts, **look at the screenshots** | §6, §7 |
| 6 | `npm test`, commit, push, wait for the deploy, rerun the checks against the live site | §8 |
| 7 | Update `tech-katta-context/ui-prototypes/TRIED.md`, commit, push | §8 |
| 8 | Send the owner the hand-back message | §9 |

Time: about 30–45 minutes, most of it waiting for builds and looking at screenshots.

---

## 1. What we are making, and why it looks like this

The same site as `/p/full-site/`: the same screens, routes, navigation, interactions, content, dark mode and phone
layout. It is restyled **neo-brutalist**:
- flat, saturated colour blocks;
- black outlines and hard offset shadows with no blur;
- a heavy grotesque headline face;
- sticker chips;
- buttons that **press into their own shadow** like physical keys.

The palette leans on Indian street signage and chai-stall posters (a cream page, marigold keys, a lime highlighter),
so it reads as a *katta*, not a generic startup site.

**It is a style layer, not a new app.** The page logic and full-site's stylesheets load unchanged from
`/p/full-site/`; this prototype adds three stylesheets on top. That proves the folder structure: a new look is a
new set of styles.

### 1.1 Principles (the reasons behind every rule in §4)

1. **Loud chrome, calm reader.** Buttons, cards, section blocks, navigation, the landing, results and stars are loud.
   Lesson text and the canvas stay calm: outlines, no hard shadows behind paragraphs. Long reading must not tire
   the eye.
2. **Text on colour is always near-black `#111111`**, in both themes. Never white on colour.
3. **Colour is a flat fill or a line.** No gradients, glows, blur or dark washes of colour. This is the lesson from
   full-site's dark-mode rounds: a dark orange is brown, a dark yellow is olive.
4. **One outline weight (2 px), one shadow distance (4 px).** Consistency is what makes brutalism look designed
   rather than broken. Dialogs and the sidebar edge use 3 px; small buttons use a 2 px shadow.
5. **No section colour may match a status colour or the brand** (lesson from full-site's palette work):
   - Problems teal `#19D3A2` vs "Passed" dark green `#0B7A3E`, which is used only as text;
   - Quick Notes lime `#E8F55C` vs the marigold brand `#FFC233`.
6. **Keys are marigold.** Primary buttons, the selected tab, the selected filter, the current sidebar item when it
   has no section colour, and the toast. Marigold always means "this is the active or main thing".
7. **Motion stays in full-site's system** (Emil Kowalski's rules):
   - press feedback in 100 ms;
   - hover movement only with a real mouse;
   - no bounce;
   - reduced motion means fades only.

   The brutal twist: a pressed key moves into its shadow, a hovered card lifts by 2 px and its shadow grows, and
   cards land with a short "stamp".

### 1.2 The two open questions for the owner (don't block on them)

The owner never chose between these; the spec uses the defaults. List them in the hand-back (§9).
- **Loud everywhere, or calm reader?** Default: calm reader.
- **Headline face:** Archivo Black (default) or Space Grotesk?

---

## 2. How it is built (architecture)

```
frontend/prototypes/neo-brutalism/          (on the prototype branch of yashbhoomkar/tech-katta)
  index.html          a copy of full-site/index.html with the head changed (§3)
  README.md           §5; not published (prototype.mjs skips README.md)
  styles/
    tokens.css        §4.1: colours, fonts, outline and shadow sizes, light and dark
    brutal.css        §4.2: the component restyle, layered over full-site's CSS
    phone.css         §4.3: phone-only adjustments
```

How the pieces load:
- **Scripts:** `/p/full-site/scripts/boot-theme.js` (theme before first paint) and
  `/p/full-site/scripts/main.js` (the app). ES modules import their siblings relative to their own URL, so the
  whole app comes from full-site. **Nothing in `full-site/` is edited.**
- **Styles:** all twelve of full-site's stylesheets by absolute path, in full-site's order. Then our three, last,
  so they win at equal specificity.
- **`prototype.mjs`** copies a folder prototype as it is to `dist/p/neo-brutalism/` and lists it on `/p/` under
  its `prototype:type` ("Visual style"). No hosting changes are needed.
- **Theme choice** (`tk-proto-theme` in localStorage) is shared with full-site. Expected and harmless.
- **The body** must stay identical to full-site's: the scripts look up `side`, `side-scrim`, `topbar`, `main`,
  `tabbar`, `signin`, `agree`, `agreel`, `gbtn`, `cmsg`, `cmdk`, `cq`, `cres`, `keys`, `keys-body`, `tourpop`,
  `tstep`, `ttitle`, `ttext`, `tskip`, `tnext`, `toast`, `toast-t` and `switcher`.

**Specificity rule** (already followed in `brutal.css`; repeat it if you ever add a rule): where full-site uses a
more specific selector, repeat that selector, for example `:root[data-theme="dark"] .block`,
`@media (hover:hover) and (pointer:fine) { .btn:hover … }` or `.rcard:active`. Use `!important` only where
full-site already does on the same property: inline `style="background:var(--star)"` on a bar, full-site's dark
`box-shadow … !important` on `.fig`, `.say`, `.tryit`, `.pod`, `.lock.open` and hints, and its reduced-motion
`animation-name`.

---

## 3. `index.html`

Make it **programmatically from full-site's file**, so the body stays byte-identical. From `frontend/prototypes/`:

```bash
python3 - <<'PY'
import re
s = open('full-site/index.html').read()
s = s.replace('<meta name="theme-color" content="#F6F5F1">', '<meta name="theme-color" content="#FFF4DC">')
s = s.replace('<meta name="prototype:type" content="Full site">', '<meta name="prototype:type" content="Visual style">')
s = re.sub(r'<meta name="prototype:summary" content="[^"]*">', '<meta name="prototype:summary" content="The whole site in a neo-brutalist style: flat bold colour, thick outlines, hard shadows, keys that press in. Same pages and navigation as full-site; a calm reader.">', s)
s = s.replace('<title>Premium Revamp</title>', '<title>Neo-brutalism</title>')
s = s.replace('<script src="scripts/boot-theme.js"></script>', '<script src="/p/full-site/scripts/boot-theme.js"></script>')
s = s.replace('<script type="module" src="scripts/main.js"></script>', '<script type="module" src="/p/full-site/scripts/main.js"></script>')
s = re.sub(r'https://fonts.googleapis.com/css2\?[^"]*', 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap', s)
s = s.replace('href="styles/', 'href="/p/full-site/styles/')
s = s.replace('<link rel="stylesheet" href="/p/full-site/styles/phone.css">',
  '<link rel="stylesheet" href="/p/full-site/styles/phone.css">\n<!-- the neo-brutalism layer -->\n'
  '<link rel="stylesheet" href="styles/tokens.css">\n<link rel="stylesheet" href="styles/brutal.css">\n<link rel="stylesheet" href="styles/phone.css">')
import os; os.makedirs('neo-brutalism/styles', exist_ok=True)
open('neo-brutalism/index.html', 'w').write(s)
PY
```

Then check the result. Its `<head>` must read exactly:

```html
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#FFF4DC">
<meta name="prototype:type" content="Visual style">
<meta name="prototype:summary" content="The whole site in a neo-brutalist style: flat bold colour, thick outlines, hard shadows, keys that press in. Same pages and navigation as full-site; a calm reader.">
<title>Neo-brutalism</title>
<script src="/p/full-site/scripts/boot-theme.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap">
<link rel="stylesheet" href="/p/full-site/styles/tokens.css">
<link rel="stylesheet" href="/p/full-site/styles/base.css">
<link rel="stylesheet" href="/p/full-site/styles/components/controls.css">
<link rel="stylesheet" href="/p/full-site/styles/components/cards.css">
<link rel="stylesheet" href="/p/full-site/styles/components/overlays.css">
<link rel="stylesheet" href="/p/full-site/styles/layout/shell.css">
<link rel="stylesheet" href="/p/full-site/styles/pages/landing.css">
<link rel="stylesheet" href="/p/full-site/styles/pages/app.css">
<link rel="stylesheet" href="/p/full-site/styles/pages/lesson.css">
<link rel="stylesheet" href="/p/full-site/styles/pages/workspace.css">
<link rel="stylesheet" href="/p/full-site/styles/motion.css">
<link rel="stylesheet" href="/p/full-site/styles/phone.css">
<!-- the neo-brutalism layer -->
<link rel="stylesheet" href="styles/tokens.css">
<link rel="stylesheet" href="styles/brutal.css">
<link rel="stylesheet" href="styles/phone.css">
<script type="module" src="/p/full-site/scripts/main.js"></script>
</head>
```

and its `<body>` must be identical to full-site's. Confirm with
`diff <(sed -n '/<body/,$p' full-site/index.html) <(sed -n '/<body/,$p' neo-brutalism/index.html)`, which should
print nothing.

If full-site's `index.html` has changed since this spec (a different title or font URL, for example), a
replacement may silently not happen. Check every line of the head against the block above and fix by hand if
needed.

---

## 4. The stylesheets (create exactly as written)

### 4.1 `styles/tokens.css`

What it does:
- It redefines full-site's token names, so most of the site re-colours by itself.
- It adds `--display`, `--bw` (outline width), `--bw-strong`, `--sh-d` (shadow distance), `--sh`, `--sh-sm`,
  `--sh-lg` and `--edge` (the outline and shadow colour: black in light, cream in dark).

**Colour reference:**

| Role | Light | Dark |
|---|---|---|
| Page | `#FFF4DC` cream | `#121212` |
| Surface / raised / sunken | `#FFFFFF` / `#FFFFFF` / `#FBE9C4` | `#1C1C1C` / `#242424` / `#2A2A2A` |
| Ink / ink-2 / muted | `#111111` / `#333333` / `#5C5C5C` | `#FFF4DC` / `#E5DCC8` / `#B3AA98` |
| Outlines and shadows (`--edge`) | `#111111` | `#FFF4DC` |
| Keys (`--marigold`) | `#FFC233` with `#111` text | same |
| Link / focus | `#1E40D8` / `#1E40D8` | `#8FB0FF` / `#E8F55C` |
| Pass / fail / warn | `#0B7A3E` / `#C21F1F` / `#9A4A00` | `#6EE7A0` / `#FF8A80` / `#FFB26B` |
| Concepts | `#5EC2FF` sky | same |
| Components | `#FF9330` orange | same |
| Interview | `#B48CFF` violet | same |
| Problems | `#19D3A2` teal | same |
| Real Systems | `#FF6B6B` coral | same |
| Quick Notes | `#E8F55C` lime | same |
| Soft tints (`--t-*`) | light versions of each colour | neutral `#242424` (no dark washes) |
| Final call-to-action band | `#111111` with cream text | marigold `#FFC233` with `#111` text |

Section colours are the **same in both themes**, always with `#111` text. That keeps them recognisable and never
muddy.

```css
/* Neo-brutalism tokens. Loaded after all of full-site's stylesheets, so these values win.
   Same token names as full-site (components read roles, not hex codes) plus a few of our own:
   --display, --bw, --bw-strong, --sh-d, --sh, --sh-sm, --sh-lg, --edge. */

:root {
  --sans: "Archivo", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
  --display: "Archivo Black", "Archivo", ui-sans-serif, system-ui, sans-serif;
  --mono: "Space Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --serif: var(--display);

  --bw: 2px;                 /* every outline */
  --bw-strong: 3px;          /* dialogs, sheets, the sidebar edge */
  --sh-d: 4px;               /* the one shadow distance */
  --sh: var(--sh-d) var(--sh-d) 0 var(--edge);
  --sh-sm: 2px 2px 0 var(--edge);
  --sh-lg: calc(var(--sh-d) + 2px) calc(var(--sh-d) + 2px) 0 var(--edge);
  --r-sm: 6px; --r-md: 8px; --r-lg: 10px; --r-xl: 12px; --r-pill: 8px;

  color-scheme: light;
  --page: #FFF4DC;           /* chai-stall cream */
  --surface: #FFFFFF;
  --raised: #FFFFFF;
  --sunken: #FBE9C4;
  --ink: #111111; --ink-2: #333333; --muted: #5C5C5C;
  --edge: #111111;
  --line: #111111; --line-strong: #111111;
  --btn: #111111; --on-btn: #FFFFFF;
  --marigold: #FFC233; --on-marigold: #111111;
  --link: #1E40D8; --focus: #1E40D8;
  --pass: #0B7A3E; --fail: #C21F1F; --warn: #9A4A00; --star: #111111;
  --video: #111111; --on-video: #FFF4DC;
  --scrim: rgb(17 17 17 / .55);
  --shadow: var(--sh); --shadow-pop: var(--sh-lg); --hl: 0 0 0 0 transparent;
  --band-strong: #111111; --on-band-strong: #FFF4DC;
  --selection: #E8F55C;

  --c-concepts: #5EC2FF;   --a-concepts: #5EC2FF;   --t-concepts: #DDF2FF;
  --c-components: #FF9330; --a-components: #FF9330; --t-components: #FFE6CC;
  --c-interview: #B48CFF;  --a-interview: #B48CFF;  --t-interview: #EFE5FF;
  --c-problems: #19D3A2;   --a-problems: #19D3A2;   --t-problems: #D6F7EC;
  --c-real: #FF6B6B;       --a-real: #FF6B6B;       --t-real: #FFE0E0;
  --c-notes: #E8F55C;      --a-notes: #E8F55C;      --t-notes: #F7FCD6;
  --on-c: #111111; --on-c-2: rgb(17 17 17 / .78);
  --track-on-c: rgb(17 17 17 / .18); --fill-on-c: #111111;
  --preview: #FFFFFF; --on-preview: #111111;
}

:root[data-theme="dark"] {
  color-scheme: dark;
  --page: #121212;
  --surface: #1C1C1C;
  --raised: #242424;
  --sunken: #2A2A2A;
  --ink: #FFF4DC; --ink-2: #E5DCC8; --muted: #B3AA98;
  --edge: #FFF4DC;
  --line: #FFF4DC; --line-strong: #FFF4DC;
  --btn: #FFF4DC; --on-btn: #111111;
  --marigold: #FFC233; --on-marigold: #111111;
  --link: #8FB0FF; --focus: #E8F55C;
  --pass: #6EE7A0; --fail: #FF8A80; --warn: #FFB26B; --star: #111111;
  --video: #000000; --on-video: #FFF4DC;
  --scrim: rgb(0 0 0 / .7);
  --shadow: var(--sh); --shadow-pop: var(--sh-lg); --hl: 0 0 0 0 transparent;
  --band-strong: #FFC233; --on-band-strong: #111111;
  --selection: rgb(232 245 92 / .35);

  /* section fills stay vivid with black text (never darkened); soft tints become a neutral raised grey */
  --c-concepts: #5EC2FF;   --a-concepts: #5EC2FF;
  --c-components: #FF9330; --a-components: #FF9330;
  --c-interview: #B48CFF;  --a-interview: #B48CFF;
  --c-problems: #19D3A2;   --a-problems: #19D3A2;
  --c-real: #FF6B6B;       --a-real: #FF6B6B;
  --c-notes: #E8F55C;      --a-notes: #E8F55C;
  --t-concepts: #242424; --t-components: #242424; --t-interview: #242424; --t-problems: #242424; --t-real: #242424; --t-notes: #242424;
  --on-c: #111111; --on-c-2: rgb(17 17 17 / .78);
  --track-on-c: rgb(17 17 17 / .22); --fill-on-c: #111111;
  --preview: #1C1C1C; --on-preview: #FFF4DC;
}
```

### 4.2 `styles/brutal.css`

The whole restyle, in sections that follow full-site's areas:
- base type;
- buttons, and press / hover;
- chips, stickers, stars;
- progress;
- cards and section blocks;
- logo;
- landing;
- sidebar;
- top bar and tab bar;
- overlays;
- Problems;
- section page;
- Home;
- reader (calm);
- workspace;
- You;
- not found;
- motion.

Each rule names full-site's class, so it can be traced back to `full-site/styles/` and `full-site/scripts/pages/`.

```css
/* Neo-brutalism component layer, over full-site's styles. Order follows the spec's table.
   Rules: one outline (--bw), one shadow (--sh), flat fills, black text on colour, calm reader.
   Specificity: where full-site uses a more specific selector, this file repeats it (never more). */

/* ---------- base type ---------- */
body { font-family: var(--sans); background: var(--page); }
h1, h2, h3, h4 { font-family: var(--display); font-weight: 400; letter-spacing: -.01em; line-height: 1.05; }
b, strong { font-weight: 700; }
.mono { font-family: var(--mono); font-weight: 700; font-size: 11px; letter-spacing: .04em; }
:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
kbd { font-family: var(--mono); border: var(--bw) solid var(--edge); border-bottom-width: var(--bw); box-shadow: var(--sh-sm); background: var(--surface); color: var(--ink); }

/* ---------- buttons ---------- */
.btn { border: var(--bw) solid var(--edge); border-radius: var(--r-md); background: var(--surface); color: var(--ink); font-weight: 700; box-shadow: var(--sh);
  transition: transform 100ms cubic-bezier(.23,1,.32,1), box-shadow 100ms cubic-bezier(.23,1,.32,1), background-color 120ms ease; }
.btn.primary { background: var(--marigold); color: #111111; border-color: var(--edge); }
.btn.ghost { border-color: transparent; box-shadow: none; background: transparent; }
.btn.accent { background: var(--c-concepts); color: #111111; border-color: var(--edge); }
.btn.sm { box-shadow: var(--sh-sm); }
.btn:disabled, .btn[aria-disabled="true"] { box-shadow: none; opacity: .4; }
.gbtn { border: var(--bw) solid var(--edge); border-radius: var(--r-md); box-shadow: var(--sh); font-weight: 700; background: var(--surface); }

/* ---------- press and hover: the key sinks into its shadow; with a mouse it lifts ---------- */
.btn:active, .gbtn:active, .fbtn:active, .ecard:active, .hub-card:active, .pcard:active, .palette .p:active, .mega-i:active, .theme-card:active, .jump a:active {
  transform: translate(var(--sh-d), var(--sh-d)); box-shadow: 0 0 0 var(--edge); }
.btn.sm:active, .palette .p:active { transform: translate(2px, 2px); }
.btn.ghost:active { transform: scale(.94); box-shadow: none; }
.rcard:active { transform: rotate(var(--r, 0deg)) translate(var(--sh-d), var(--sh-d)); box-shadow: 0 0 0 var(--edge); }
@media (hover: hover) and (pointer: fine) {
  .btn:hover, .gbtn:hover, .fbtn:hover, .jump a:hover { transform: translate(-2px, -2px); box-shadow: var(--sh-lg); }
  .btn.sm:hover { box-shadow: var(--sh); }
  .btn.ghost:hover { transform: none; box-shadow: none; background: var(--sunken); }
  .btn:active, .gbtn:active, .fbtn:active, .jump a:active { transform: translate(var(--sh-d), var(--sh-d)); box-shadow: 0 0 0 var(--edge); }
  .ecard:hover, .hub-card:hover, .pcard:hover { transform: translate(-2px, -2px); box-shadow: var(--sh-lg); }
  .rcard:hover { transform: rotate(0deg) translate(-2px, -6px); box-shadow: var(--sh-lg); }
  :root[data-theme="dark"] :is(.ecard, .rcard, .hub-card):hover { filter: none; }
}

/* ---------- chips, stickers, stars ---------- */
.chip { border: var(--bw) solid var(--edge); border-radius: var(--r-sm); font-weight: 700; background: var(--surface); color: var(--ink); }
.easy, :root[data-theme="dark"] .easy { background: var(--c-problems); color: #111111; box-shadow: none; }
.medium, :root[data-theme="dark"] .medium { background: var(--c-components); color: #111111; box-shadow: none; }
.hard, :root[data-theme="dark"] .hard { background: var(--c-real); color: #111111; box-shadow: none; }
.newchip { border: var(--bw) solid var(--edge); border-radius: var(--r-sm); background: var(--c-notes); color: #111111; font-weight: 700; box-shadow: var(--sh); transform: rotate(-2deg); }
.newchip i { background: #111111; }
.stars { display: inline-flex; align-items: center; padding: 0 6px; border: var(--bw) solid var(--edge); border-radius: var(--r-sm); background: var(--marigold); color: #111111; letter-spacing: 1px; transform: rotate(-3deg); }
td .stars, .pcard .stars, .results .stars { transform: none; }

/* ---------- progress ---------- */
.bar { height: 10px; border: var(--bw) solid var(--edge); border-radius: 4px; background: var(--surface); }
.bar i { border-radius: 0; background: var(--a, var(--pass)); }
.ecard .pb .bar, .hub-foot .bar { background: var(--surface); }
.ecard .pb .bar i { background: #111111; }
.readbar { height: 4px; } .readbar i { background: var(--marigold); }

/* ---------- cards and section blocks ---------- */
.card { border: var(--bw) solid var(--edge); border-radius: var(--r-lg); box-shadow: var(--sh); background: var(--surface); }
.block, :root[data-theme="dark"] .block { background: var(--c); color: #111111; border: var(--bw) solid var(--edge); box-shadow: var(--sh); }
:root[data-theme="dark"] .sechead.block { background: var(--c); }
.ecard, .rcard, .hub-card, .sechead, .stage { border-radius: var(--r-xl); }
.ecard h3, .rcard h3, .hub-main h2, .sechead h1 { font-family: var(--display); font-weight: 400; color: #111111; }
.ecard p, .rcard p, .sechead p, .sechead .mono, .hub-main .mono, .hub-main p:last-child { color: rgb(17 17 17 / .8); }
.pane { background: var(--preview); color: var(--on-preview); border: var(--bw) solid var(--edge); }
.rcard .pv { border-bottom: 0; }
.cprog, .pstats div, .hub-foot { border-radius: var(--r-md); }
.thumb { border-radius: var(--r-md); }

/* ---------- logo ---------- */
.logo { border: var(--bw) solid var(--edge); border-radius: var(--r-md); box-shadow: var(--sh-sm); background: var(--surface); font-family: var(--display); font-weight: 400; letter-spacing: -.01em; }
.logo b { border-radius: 4px; background: #111111; color: var(--marigold); font-family: var(--mono); font-weight: 700; box-shadow: 0 0 0 var(--bw) var(--edge); }

/* ---------- landing ---------- */
.lnav, .lnav.stuck { background: var(--page); backdrop-filter: none; -webkit-backdrop-filter: none; }
.lnav.stuck { border-bottom: var(--bw) solid var(--edge); }
.lnk { font-weight: 700; color: var(--ink); border-radius: var(--r-md); }
.mega { border: var(--bw-strong) solid var(--edge); border-radius: var(--r-xl); box-shadow: var(--sh-lg); background: var(--raised); }
.mega-i { border: var(--bw) solid transparent; border-radius: var(--r-md); }
@media (hover: hover) and (pointer: fine) { .mega-i:hover { background: var(--a); border-color: var(--edge); color: #111111; } .mega-i:hover small { color: rgb(17 17 17 / .8); } }
.hero h1 { font-family: var(--display); font-weight: 400; font-size: clamp(44px, 8vw, 96px); letter-spacing: -.02em; line-height: 1; }
.hero h1 em { font-family: var(--display); font-style: normal; letter-spacing: -.02em; display: inline-block; background: var(--c-notes); color: #111111; padding: 0 .14em .04em; border: var(--bw-strong) solid var(--edge); box-shadow: var(--sh-lg); transform: rotate(-1.5deg); }
.hero .shape { border: var(--bw) solid var(--edge); box-shadow: var(--sh); }
.arc { display: none; }
.hero { border-bottom: var(--bw) solid var(--edge); padding-bottom: 48px; }
.rise { height: auto; padding-bottom: 8px; }
.rcard { height: 330px; }
.rcard .pv { border-radius: var(--r-md) var(--r-md) 0 0; }
.pv .flow span { border: var(--bw) solid var(--edge); border-radius: 4px; }
.pv .tags span { border: var(--bw) solid var(--edge); border-radius: 4px; background: var(--c-components); color: #111111; }
.band { border-top: var(--bw) solid var(--edge); }
.band:first-of-type { border-top: 0; }
.step { background: var(--t); border: var(--bw) solid var(--edge); border-radius: var(--r-lg); box-shadow: var(--sh); }
.stage { padding-top: 40px; }
.win { border: var(--bw) solid var(--edge); border-bottom: 0; box-shadow: none; border-radius: var(--r-md) var(--r-md) 0 0; }
.win .cur { border-right: var(--bw) solid var(--edge); }
.video { border: var(--bw) solid var(--edge); border-radius: var(--r-md); }
.vpill { border: var(--bw) solid var(--edge); border-radius: var(--r-md); box-shadow: var(--sh-sm); font-weight: 700; background: var(--marigold); color: #111111; }
.jrow { border-top: var(--bw) solid var(--edge); }
.jscore { background: var(--c-problems); color: #111111; box-shadow: none; border-top: var(--bw) solid var(--edge); }
:root[data-theme="dark"] .jscore { box-shadow: none; }
.nums b, .nums .card b { font-family: var(--display); font-weight: 400; }
.face { border: var(--bw-strong) solid var(--edge); box-shadow: var(--sh); background: var(--c-components); color: #111111; }
.final { background: var(--band-strong); color: var(--on-band-strong); border-top: var(--bw) solid var(--edge); }
.final h2 { font-family: var(--display); }
.final .btn { background: var(--marigold); color: #111111; border-color: var(--on-band-strong); box-shadow: 4px 4px 0 var(--on-band-strong); }
:root[data-theme="dark"] .final .btn { background: #111111; color: var(--marigold); border-color: #111111; box-shadow: 4px 4px 0 #111111; }
.foot { border-top: var(--bw) solid var(--edge); }

/* ---------- sidebar ---------- */
.side { border-right: var(--bw-strong) solid var(--edge); box-shadow: none; }
.side .search { border: var(--bw) solid var(--edge); border-radius: var(--r-md); background: var(--surface); color: var(--ink-2); box-shadow: var(--sh-sm); }
.nav-h { font-family: var(--mono); font-weight: 700; color: var(--ink); }
.nav-i { border: var(--bw) solid transparent; border-radius: var(--r-md); font-weight: 600; color: var(--ink); }
.nav-i .dot { border: var(--bw) solid var(--edge); width: 12px; height: 12px; }
.nav-i[aria-current="page"] { background: var(--a, var(--marigold)); color: #111111; border-color: var(--edge); box-shadow: var(--sh-sm); font-weight: 700; }
.nav-i[aria-current="page"] small { color: rgb(17 17 17 / .75); }
.nav-i[aria-current="page"]::before { display: none; }
@media (hover: hover) and (pointer: fine) { .nav-i:hover { background: var(--sunken); border-color: var(--edge); } .nav-i[aria-current="page"]:hover { background: var(--a, var(--marigold)); } }
.me { border: var(--bw) solid var(--edge); border-radius: var(--r-lg); background: var(--surface); }
.me[aria-current="page"] { background: var(--marigold); color: #111111; box-shadow: var(--sh-sm); }
.me[aria-current="page"] small { color: rgb(17 17 17 / .75); }
.avatar { border: var(--bw) solid var(--edge); }
.theme-sw { border: var(--bw) solid var(--edge); border-radius: var(--r-md); background: var(--surface); }
.theme-sw button { border-radius: 4px; }
.theme-sw button[aria-pressed="true"] { background: var(--marigold); color: #111111; box-shadow: none; }

/* ---------- top bar, tab bar ---------- */
.topbar, .tabbar { background: var(--page); backdrop-filter: none; -webkit-backdrop-filter: none; }
.topbar { border-bottom: var(--bw) solid var(--edge); }
.tabbar { border-top: var(--bw) solid var(--edge); }
.tab { color: var(--ink-2); font-weight: 700; }
.tab::before { border-radius: var(--r-md); background: var(--marigold); border: var(--bw) solid var(--edge); }
.tab[aria-current="page"] { color: var(--ink); }
.tab[aria-current="page"] .ic { color: #111111; }
.crumbs [aria-current] { font-weight: 700; }

/* ---------- overlays ---------- */
.dialog, .cbox { border: var(--bw-strong) solid var(--edge); border-radius: var(--r-xl); box-shadow: var(--sh-lg); background: var(--raised); }
.dialog h2 { font-family: var(--display); }
.dialog .x { border: var(--bw) solid var(--edge); }
.cin { border-bottom: var(--bw) solid var(--edge); }
.cfoot { border-top: var(--bw) solid var(--edge); }
.cres a { border: var(--bw) solid transparent; border-radius: var(--r-md); }
.cres a[aria-selected="true"] { background: var(--marigold); color: #111111; border-color: var(--edge); }
.cres a[aria-selected="true"] small, .cres a[aria-selected="true"] mark { color: #111111; }
.cres mark { color: var(--link); background: none; text-decoration: underline; text-decoration-thickness: 2px; }
.sheet { border: var(--bw-strong) solid var(--edge); border-bottom: 0; box-shadow: none; border-radius: var(--r-xl) var(--r-xl) 0 0; background: var(--raised); }
.sheet::before { background: var(--edge); }
.tourpop { background: var(--c-notes); color: #111111; border: var(--bw-strong) solid #111111; border-radius: var(--r-xl); box-shadow: 6px 6px 0 #111111; }
.tourpop .mono { color: #111111; opacity: .7; }
.tourpop .btn { background: #FFFFFF; color: #111111; border-color: #111111; box-shadow: 2px 2px 0 #111111; }
.tourpop .btn.primary { background: #111111; color: var(--c-notes); }
.spot { border-radius: var(--r-lg); }
.toast { background: var(--marigold); color: #111111; border: var(--bw) solid #111111; border-radius: var(--r-md); box-shadow: 4px 4px 0 #111111; }
.toast > i { background: #111111; color: var(--marigold); }
.toast .tm b { background: #111111; }
.sw-btn { border: var(--bw) dashed var(--edge); border-radius: var(--r-md); color: var(--ink-2); }
.sw-list { border: var(--bw) solid var(--edge); border-radius: var(--r-lg); box-shadow: var(--sh); }
.keys div { border-top: var(--bw) solid var(--edge); }

/* ---------- problems ---------- */
.tbl { overflow: hidden; }
th { background: #111111; color: var(--page); font-family: var(--mono); font-weight: 700; }
:root[data-theme="dark"] th { background: var(--edge); color: #111111; }
td { border-top: var(--bw) solid var(--edge); }
td.tt, td.best { font-weight: 700; }
@media (hover: hover) and (pointer: fine) { #ptable tr:hover { background: var(--sunken); } }
#ptable tr.picked td { box-shadow: inset 0 3px 0 var(--marigold), inset 0 -3px 0 var(--marigold); }
.fbtn { border: var(--bw) solid var(--edge); border-radius: var(--r-md); font-weight: 700; box-shadow: var(--sh-sm); background: var(--surface); color: var(--ink); transition: transform 100ms cubic-bezier(.23,1,.32,1), box-shadow 100ms cubic-bezier(.23,1,.32,1); }
.fbtn[aria-pressed="true"] { background: var(--marigold); color: #111111; border-color: var(--edge); }
.pcard { border: var(--bw) solid var(--edge); border-radius: var(--r-lg); box-shadow: var(--sh); background: var(--surface); }
.pcard .pt { font-weight: 700; }
.pcard.picked { box-shadow: var(--sh), 0 0 0 4px var(--marigold); }
.chals .card h3 { font-family: var(--display); font-weight: 400; }

/* ---------- section page ---------- */
.module { overflow: hidden; }
.mhead h3 { font-family: var(--display); font-weight: 400; }
.lesson { border-top: var(--bw) solid var(--edge); }
.lesson.now, :root[data-theme="dark"] .lesson.now { background: var(--a); color: #111111; box-shadow: none; }
.lesson.now .n, .lesson.now .m { color: rgb(17 17 17 / .75); }
.lesson .st { border: var(--bw) solid var(--edge); position: relative; }
.lesson.done .st { background: var(--edge); border-color: var(--edge); }
.lesson.done .st::after { content: "✓"; position: absolute; inset: 0; display: grid; place-items: center; font-size: 11px; font-weight: 700; color: var(--page); }
.lesson.now .st { border-color: #111111; background: #FFFFFF; }
.now-chip { background: #FFFFFF; color: #111111; }
.jump a { border: var(--bw) solid var(--edge); border-radius: var(--r-md); box-shadow: var(--sh-sm); font-weight: 700; background: var(--surface); transition: transform 100ms cubic-bezier(.23,1,.32,1), box-shadow 100ms cubic-bezier(.23,1,.32,1); }
.cprog { border: var(--bw) solid var(--edge); box-shadow: var(--sh-sm); }
.cprog .bar i { background: var(--c-problems); }
.pstats div { border: var(--bw) solid var(--edge); }

/* ---------- home ---------- */
.pod, :root[data-theme="dark"] .pod { background: var(--t); border: var(--bw) solid var(--edge); border-radius: var(--r-lg); box-shadow: var(--sh); }
:root[data-theme="dark"] .pod { box-shadow: inset 6px 0 0 var(--a), var(--sh) !important; }
.days i { border: var(--bw) solid var(--edge); }
.topline h1 { font-family: var(--display); font-weight: 400; }
.h2, .h3 { font-family: var(--display); font-weight: 400; }
.link { font-weight: 700; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; }

/* ---------- reader (calm): outlines, no hard shadows behind text ---------- */
.reader { border-top: 0; }
.pcur { border-right: var(--bw) solid var(--edge); }
.pcur h3 { font-family: var(--display); font-weight: 400; }
.lrow { border: var(--bw) solid transparent; border-radius: var(--r-md); }
.lrow .st { border: var(--bw) solid var(--edge); }
.lrow.done .st { background: var(--edge); border-color: var(--edge); }
.lrow.cur-l, :root[data-theme="dark"] .lrow.cur-l { background: var(--a, var(--a-concepts)); color: #111111; border-color: var(--edge); box-shadow: none; }
.lrow.cur-l .st { border-color: #111111; background: #FFFFFF; }
.contents-btn { border-bottom: var(--bw) solid var(--edge); font-weight: 700; }
.art h1, .art h2 { font-family: var(--display); font-weight: 400; }
.art .body { font-family: var(--sans); font-size: 18px; line-height: 1.7; color: var(--ink-2); }
.art .by i { border: var(--bw) solid var(--edge); }
.fig, :root[data-theme="dark"] .fig { background: var(--t); border: var(--bw) solid var(--edge); border-radius: var(--r-lg); box-shadow: none !important; }
:root[data-theme="dark"] .fig { box-shadow: inset 6px 0 0 var(--a) !important; }
.node { border: var(--bw) solid var(--edge); border-radius: var(--r-sm); background: var(--surface); }
.node.hl { background: var(--c-concepts); color: #111111; border-color: var(--edge); box-shadow: none; }
.node.hl span { color: rgb(17 17 17 / .75); }
.wire { height: 3px; background: color-mix(in srgb, var(--edge) 25%, transparent); }
.wire i { background: var(--edge); }
.dots i { border: 1px solid var(--edge); }
.dots i.on { background: var(--edge); }
.say, :root[data-theme="dark"] .say { background: var(--t-notes); border: var(--bw) solid var(--edge); border-left-width: 6px; border-left-color: var(--edge); border-radius: var(--r-lg); box-shadow: none !important; }
:root[data-theme="dark"] .say { border-left-color: var(--a-notes); }
.say .mono, :root[data-theme="dark"] .say .mono { color: var(--ink); }
.seg { border: var(--bw) solid var(--edge); border-radius: var(--r-md); background: var(--surface); }
.seg button { border-radius: 4px; font-weight: 700; }
.seg-i { background: var(--marigold); border: var(--bw) solid var(--edge); border-radius: 4px; box-shadow: none; top: 2px; bottom: 2px; }
.seg button[aria-pressed="true"] { color: #111111; }
.player { border: var(--bw) solid var(--edge); }
.ptrack i { background: var(--marigold); }
.finish { border: var(--bw) solid var(--edge); box-shadow: var(--sh); }
#complete.ok { background: var(--c-problems); color: #111111; border-color: var(--edge); }
.tick { background: #111111; color: var(--c-problems); }
.deck { border: var(--bw) solid var(--edge); border-radius: var(--r-lg); background: var(--surface); }
.deck .dbar { border: var(--bw) solid var(--edge); height: 10px; border-radius: 4px; background: var(--surface); }
.deck .dbar i { background: var(--marigold); }
.prail a.on { color: var(--ink); font-weight: 700; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; }
.tryit, :root[data-theme="dark"] .tryit { background: var(--t); border: var(--bw) solid var(--edge); border-radius: var(--r-lg); box-shadow: var(--sh) !important; }
.tryit a { color: var(--ink); text-decoration: underline; text-decoration-thickness: 2px; }

/* ---------- workspace ---------- */
.wtop { border-bottom: var(--bw) solid var(--edge); }
.wtop .t { font-family: var(--display); font-weight: 400; }
.wleft { border-right: var(--bw) solid var(--edge); }
.tabs { border-bottom: var(--bw) solid var(--edge); }
.tabs button { font-weight: 700; }
.tab-ul { height: 4px; background: var(--marigold); box-shadow: 0 0 0 1px var(--edge); }
.wdesc .how, :root[data-theme="dark"] .wdesc .how { background: var(--t-problems); border: var(--bw) solid var(--edge); border-radius: var(--r-lg); box-shadow: none; }
textarea#notes { border: var(--bw) solid var(--edge); border-radius: var(--r-md); }
.hint > div > p, :root[data-theme="dark"] .hint > div > p { background: var(--t-notes); border: var(--bw) solid var(--edge); border-radius: var(--r-md); box-shadow: none !important; }
.lock { border: var(--bw) dashed var(--edge); border-radius: var(--r-lg); }
.lock.open, :root[data-theme="dark"] .lock.open { background: var(--t-problems); border-style: solid; box-shadow: var(--sh) !important; }
.sub { border: var(--bw) solid var(--edge); border-radius: var(--r-md); box-shadow: var(--sh-sm); }
.palette { border: var(--bw) solid var(--edge); border-radius: var(--r-lg); box-shadow: var(--sh); }
.palette .p { border: var(--bw) solid var(--edge); border-radius: var(--r-sm); box-shadow: var(--sh-sm); background: var(--surface); transition: transform 100ms cubic-bezier(.23,1,.32,1), box-shadow 100ms cubic-bezier(.23,1,.32,1); }
.palette .p .dot { border: 1px solid var(--edge); }
.cv rect { stroke: var(--edge); stroke-width: 2px; }
.cv .newn rect { stroke: var(--edge); }
.results { border-top: var(--bw) solid var(--edge); }
.results .r { border: var(--bw) solid var(--edge); border-radius: var(--r-sm); background: var(--surface); }
.timer.low { background: var(--c-real); color: #111111; }
.panes { border: var(--bw) solid var(--edge); border-radius: var(--r-md); background: var(--surface); }
.panes::before { background: var(--marigold); border: var(--bw) solid var(--edge); border-radius: 4px; box-shadow: none; }
.panes button[aria-selected="true"] { color: #111111; }
.ask { border-left: var(--bw-strong) solid var(--edge); box-shadow: none; background: var(--raised); }
.ahead { border-bottom: var(--bw) solid var(--edge); }
.msg { border: var(--bw) solid var(--edge); border-radius: var(--r-md); }
.msg.them { background: var(--surface); }
.msg.me { background: #111111; color: var(--page); border-color: #111111; }
:root[data-theme="dark"] .msg.me { background: var(--marigold); color: #111111; border-color: var(--edge); }
.asugg button { border: var(--bw) solid var(--edge); border-radius: var(--r-sm); font-weight: 700; box-shadow: var(--sh-sm); background: var(--surface); }
.ain { border-top: var(--bw) solid var(--edge); }
.ain input { border: var(--bw) solid var(--edge); border-radius: var(--r-md); }

/* ---------- you ---------- */
.theme-card { border: var(--bw) solid var(--edge); border-radius: var(--r-lg); box-shadow: var(--sh-sm); background: var(--surface); transition: transform 100ms cubic-bezier(.23,1,.32,1), box-shadow 100ms cubic-bezier(.23,1,.32,1); }
.theme-card[aria-pressed="true"] { background: var(--marigold); color: #111111; border-color: var(--edge); box-shadow: var(--sh); }
.tprev { border: var(--bw) solid #111111; border-radius: var(--r-sm); }
.profile b { font-family: var(--display); font-weight: 400; }

/* ---------- not found ---------- */
.nf h1 { font-family: var(--display); font-weight: 400; }

/* ---------- motion: cards land like a stamp (shadow appears as they land) ---------- */
@keyframes nb-stamp { from { opacity: 0; transform: rotate(var(--r, 0deg)) translate(0, -10px); box-shadow: 0 0 0 var(--edge); } }
.rcard { animation: nb-stamp 360ms cubic-bezier(.23,1,.32,1) both; animation-delay: var(--dl, 0ms); }
main.enter .ecard, main.enter .hub-card { animation: nb-stamp 360ms cubic-bezier(.23,1,.32,1) both; }
main.enter .ecard:nth-child(2), main.enter .hub-card:nth-child(2) { animation-delay: 40ms; }
main.enter .ecard:nth-child(3), main.enter .hub-card:nth-child(3) { animation-delay: 70ms; }
main.enter .ecard:nth-child(4), main.enter .hub-card:nth-child(4) { animation-delay: 110ms; }
main.enter .ecard:nth-child(5), main.enter .hub-card:nth-child(5) { animation-delay: 130ms; }
main.enter .ecard:nth-child(6) { animation-delay: 160ms; }

@media (prefers-reduced-motion: reduce) {
  .btn:active, .gbtn:active, .fbtn:active, .ecard:active, .hub-card:active, .pcard:active, .palette .p:active, .mega-i:active, .theme-card:active, .jump a:active { transform: none; box-shadow: var(--sh); }
  .rcard:active { transform: rotate(var(--r, 0deg)); }
  .rcard, main.enter .ecard, main.enter .hub-card { animation-name: m-fade !important; }
}
@media (prefers-reduced-motion: reduce) and (hover: hover) and (pointer: fine) {
  .btn:hover, .gbtn:hover, .fbtn:hover, .jump a:hover, .ecard:hover, .hub-card:hover, .pcard:hover { transform: none; }
  .rcard:hover { transform: rotate(var(--r, 0deg)); }
}

/* the "Challenge stars" bar reads --star, which is black here (stars sit on marigold stickers): give it marigold */
.bar i[style*="--star"] { background: var(--marigold) !important; }
```

### 4.3 `styles/phone.css`

Full-site's own `phone.css` already does the phone layout (swipe rows, problem cards, Brief / Canvas, sheets,
gestures). This file only scales the brutal details down:
- 3 px shadows instead of 4;
- 2 px for the strong outlines;
- a smaller hero;
- no floating shapes;
- room for shadows inside clipped swipe rows.

```css
/* Neo-brutalism on phones. Full-site's phone.css already does the layout (swipe rows, problem cards,
   Brief / Canvas, sheets); this only scales the brutal details so they don't crowd a narrow screen. */
@media (max-width: 640px) {
  :root { --sh-d: 3px; --bw-strong: 2px; }
  .hero { padding-bottom: 32px; }
  .hero h1 { font-size: clamp(40px, 12vw, 56px); }
  .hero h1 em { transform: rotate(-1deg); box-shadow: var(--sh); }
  /* the swipe row clips anything outside it: leave room for the shadows */
  .rise { padding: 8px 20px 16px 16px; }
  .rcard { box-shadow: var(--sh); }
  .tab::before { width: 48px; margin-left: -24px; }
  .hero .shape { display: none; }   /* outlined shapes crowd the sticker and logo on a narrow screen */
  .stars { transform: none; }
  .newchip { transform: rotate(-1deg); }
  .tbl, .plist { padding-right: 4px; }
  .explore { padding: 0 4px 4px 0; }
}
```

---

## 5. `README.md` (in `frontend/prototypes/neo-brutalism/`)

```markdown
# Neo-brutalism prototype (prototype.katta.cc/p/neo-brutalism/)

The whole of /p/full-site/ in a neo-brutalist style: flat bold colour, 2 px black outlines, hard 4 px shadows,
Archivo Black headlines, Space Mono labels, sticker chips, and keys that press into their own shadow. Cream
"chai-stall" page in light; near-black with cream outlines in dark. Same pages, routes, navigation, interactions
and phone layout as full-site. Lesson text and the canvas stay calm.

## How it is built

A style layer, not a new app. index.html loads full-site's scripts (/p/full-site/scripts/boot-theme.js and
main.js) and all of full-site's stylesheets, then three of its own:

- styles/tokens.css: the colours, fonts, outline and shadow sizes, for light and dark
- styles/brutal.css: the component restyle (selectors are full-site's class names)
- styles/phone.css: smaller shadows and hero on phones; no floating shapes

Nothing in full-site/ is changed. The body of index.html is identical to full-site's, because the scripts look
up its element ids.

## Principles

1. Loud chrome, calm reader (no hard shadows behind lesson text).
2. Text on colour is always #111111, in both themes.
3. Colour is a flat fill or a line: no gradients, glows or dark washes.
4. One outline (2 px) and one shadow (4 px); 3 px for dialogs and the sidebar edge.
5. No section colour matches a status colour or the brand (Problems teal vs "Passed" green; Quick Notes lime vs
   marigold).
6. Marigold means the key or active thing.
7. Motion: keys press into their shadow (100 ms), cards lift 2 px on mouse hover, cards land with a short stamp;
   reduced motion keeps fades only.

Spec and the reasons for every value: tech-katta-context/ui-prototypes/neo-brutalism-spec.md.

## Open questions for the owner

- Loud everywhere, or calm reader (current)?
- Headline face: Archivo Black (current) or Space Grotesk?

## Notes

(Add any deviation from the spec here, with the reason. "None" if there are none.)
```

---

## 6. Build and serve locally

```bash
cd /home/user/tech-katta                    # or wherever tech-katta is cloned
git checkout prototype && git pull --ff-only
# … create the files (§3, §4, §5) …
cd frontend
npm run build:prototype:cloudflare          # last line: "prototype: 2 design prototype(s) written into dist" (3 if motion.html still exists)
npx --yes wrangler@4 dev --config hosting/wrangler.prototype.jsonc --port 8799   # run in the background
curl -s -o /dev/null -w '%{http_code}\n' localhost:8799/p/neo-brutalism/       # 200
```

- `wrangler dev` lists the assets **when it starts**. After any new file or rebuild, stop it and start it again,
  or new files return 404.
- Never test by opening the file directly (`file://`). That skips the site's security policy and hides the bugs
  that break on the live site.

---

## 7. Checks (all three scripts must print PASS / all ok; then look at the screenshots)

Put the scripts in your scratchpad (not in the repo). Playwright and Chromium are pre-installed in cloud sessions:
`require('playwright')` works from any directory.

### 7.1 Every screen: `nb-screens.js`

```js
// Dry run of the neo-brutalism layer: every route, light and dark, desktop and phone.
const {chromium,devices}=require('playwright');
const BASE=process.env.BASE||'http://localhost:8799', OUT=process.env.OUT||'nbs';
const ROUTES=['','home','learn','learn/concepts','learn/concepts/caching','problems','problems/url-shortener','me','nowhere'];
(async()=>{const b=await chromium.launch();let bad=0;
for(const [size,opt] of [['desk',{viewport:{width:1440,height:900}}],['phone',devices['iPhone 13']]])
for(const scheme of ['light','dark']){
  const p=await b.newPage({...opt,colorScheme:scheme});const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/cloudflareinsights/.test(m.text()))errs.push(m.text())});
  for(const r of ROUTES){
    await p.goto(`${BASE}/p/neo-brutalism/#/${r}`);await p.waitForTimeout(r===''?1500:800);
    if(r===''||r==='home')await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,40));}scrollTo(0,0);});
    await p.waitForTimeout(400);
    const ov=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    if(ov>0){bad++;console.log('OVERFLOW',size,scheme,r,ov);}
    await p.screenshot({path:`${OUT}/${size}-${scheme}-${r.replace(/\//g,'_')||'landing'}.png`,fullPage:r!=='problems/url-shortener'});
  }
  if(errs.length){bad++;console.log('ERRORS',size,scheme,errs);}
  await p.close();}
await b.close();console.log(bad?`FAIL (${bad})`:'PASS');process.exit(bad?1:0);})();
```

Run: `node nb-screens.js` (local) and later `BASE=https://prototype.katta.cc node nb-screens.js` (live). It writes
36 screenshots to `./nbs/`.

### 7.2 Interactions: `nb-flows.js`

```js
// Interactions on /p/neo-brutalism/ still work (the logic is full-site's; this proves the style layer broke nothing).
const {chromium,devices}=require('playwright');
const B=(process.env.BASE||'http://localhost:8799')+'/p/neo-brutalism/';
const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)process.exitCode=1;};
(async()=>{const b=await chromium.launch();
let p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'#/');await p.waitForTimeout(1200);
await p.hover('#learn-btn');await p.waitForTimeout(400);ok(await p.isVisible('#mega'),'Learn menu opens');
await p.click('#mega a[data-sec="components"]');await p.waitForTimeout(600);ok((await p.evaluate(()=>location.hash))==='#/learn/components','menu link opens Components');
await p.keyboard.press('[');await p.waitForTimeout(300);ok(await p.evaluate(()=>document.documentElement.classList.contains('rail')),'[ folds the sidebar');await p.keyboard.press('[');
await p.keyboard.press('Control+k');await p.waitForTimeout(150);await p.keyboard.type('cach');await p.waitForTimeout(150);await p.keyboard.press('Enter');await p.waitForTimeout(600);
ok((await p.evaluate(()=>location.hash))==='#/learn/concepts/caching','search "cach" + Enter opens Caching');
await p.goto(B+'#/home');await p.waitForTimeout(600);await p.click('#tourbtn');await p.waitForTimeout(500);ok(await p.isVisible('#tourpop'),'tour opens');await p.keyboard.press('Escape');
await p.goto(B+'#/learn/concepts/caching');await p.waitForTimeout(800);
await p.click('.seg button:first-of-type');await p.waitForTimeout(300);ok(await p.isVisible('.deck'),'Cards mode shows the deck');
await p.click('#complete');await p.waitForTimeout(1800);ok((await p.evaluate(()=>location.hash))==='#/learn/concepts/sharding','Mark complete moves to the next lesson');
await p.goto(B+'#/problems/url-shortener');await p.waitForTimeout(700);await p.click('#submit');await p.waitForTimeout(2600);
ok(/92 \/ 100/.test(await p.textContent('#results')),'Submit shows the score');
await p.goto(B+'#/');await p.waitForTimeout(400);await p.locator('[data-signin]:visible').first().click();await p.waitForTimeout(500);await p.click('#gbtn');await p.waitForTimeout(200);
ok(/Tick the box/.test(await p.textContent('#cmsg')),'sign-in nudges before the box is ticked');await p.keyboard.press('Escape');
await p.goto(B+'#/me');await p.waitForTimeout(500);await p.click('.theme-card[data-theme-set="dark"]');await p.waitForTimeout(500);
ok((await p.evaluate(()=>document.documentElement.dataset.theme))==='dark','theme switch to dark');await p.click('.theme-card[data-theme-set="system"]');
ok(errs.length===0,'no page errors on desktop '+JSON.stringify(errs));await p.close();
p=await b.newPage(devices['iPhone 13']);const e2=[];p.on('pageerror',e=>e2.push(e.message));
await p.goto(B+'#/');await p.waitForTimeout(800);await p.click('#lmenu-btn');await p.waitForTimeout(500);ok(await p.isVisible('#lmenu .sheet'),'phone menu sheet opens');
await p.click('#lmenu a[data-sec="concepts"]');await p.waitForTimeout(600);ok((await p.evaluate(()=>location.hash))==='#/learn/concepts','sheet link works');
await p.goto(B+'#/problems/url-shortener');await p.waitForTimeout(600);await p.click('#run');await p.waitForTimeout(400);ok((await p.getAttribute('.wbody','data-pane'))==='canvas','Run switches to the canvas on phones');
ok(e2.length===0,'no page errors on phone '+JSON.stringify(e2));await b.close();})();
```

Run: `node nb-flows.js`. Every line must start with `ok`. (Search uses "cach": search matches substrings, and
"cache" is not a substring of "Caching". This is expected.)

### 7.3 Contrast: `nb-contrast.py`

```python
# WCAG contrast for every text/background pair in the neo-brutalism tokens. All must be >= 4.5.
def s(c): c/=255; return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
def L(h): r,g,b=[s(int(h[i:i+2],16)) for i in (1,3,5)]; return .2126*r+.7152*g+.0722*b
def cr(a,b): x,y=L(a),L(b); return (max(x,y)+.05)/(min(x,y)+.05)
SEC=['#5EC2FF','#FF9330','#B48CFF','#19D3A2','#FF6B6B','#E8F55C','#FFC233']
light=[('#111111',c) for c in SEC]+[(t,b) for t in ['#111111','#333333','#5C5C5C'] for b in ['#FFF4DC','#FFFFFF','#FBE9C4']]+[(t,'#FFFFFF') for t in ['#1E40D8','#0B7A3E','#C21F1F','#9A4A00']]+[('#1E40D8','#FFF4DC'),('#FFF4DC','#111111'),('#FFFFFF','#111111')]
dark=[('#111111',c) for c in SEC]+[(t,b) for t in ['#FFF4DC','#E5DCC8','#B3AA98'] for b in ['#121212','#1C1C1C','#242424','#2A2A2A']]+[(t,b) for t in ['#8FB0FF','#6EE7A0','#FF8A80','#FFB26B'] for b in ['#121212','#1C1C1C','#242424']]+[('#111111','#FFF4DC')]
bad=0
for name,pairs in (('light',light),('dark',dark)):
    for a,b in pairs:
        r=cr(a,b)
        if r<4.5: bad+=1; print('FAIL',name,a,'on',b,round(r,2))
    print(name,'lowest',min(round(cr(a,b),2) for a,b in pairs))
print('PASS' if not bad else f'FAIL ({bad})')
```

Run: `python3 nb-contrast.py`. Expected: `light lowest 5.43`, `dark lowest 6.23`, `PASS`. If you ever change a
colour, rerun it.

### 7.4 Look at the screenshots (required)

Open at least these and compare with the "what it should look like" list:

| File in `nbs/` | Should show |
|---|---|
| `desk-light-landing.png` | A cream page. "System design," in heavy black. "explained." in a tilted lime highlighter box with a black outline and shadow. A lime "New · 22 design problems" sticker, tilted. Marigold "Start learning, free" and white "Try IND vs PAK" keys with hard shadows. Four tilted section cards (sky, orange, violet, teal) with black outlines and hard shadows. No soft arc under the hero; a black rule instead. Bands separated by black rules. A black final band with a marigold key. |
| `desk-dark-landing.png` | The same on `#121212`, with cream outlines and shadows. Section colours and the lime highlighter unchanged, with black text. The final band is marigold with a black key. |
| `desk-light-home.png` / `desk-dark-home.png` | The sidebar's "Home" item is a marigold block with an outline. Six Explore tiles are flat colours with black text, outlines and shadows. Progress bars are outlined tracks. In dark, the "Challenge stars" bar fill is marigold, not invisible. |
| `desk-light-problems.png` | The table header is black with cream mono text (in dark: cream with black text). Difficulty chips are filled sky/orange/coral with black text. Stars are tilted marigold stickers. |
| `desk-light-learn_concepts_caching.png` | **Calm:** the article text is plain and the figure and "Say this" box are outlined with no shadow. "Say this" has a thick left edge. The current lesson in the left list is a sky block. Cards / Full text is an outlined segmented control with a marigold pill. |
| `desk-light-problems_url-shortener.png` | Palette items and canvas nodes are outlined black. Submit is marigold, "Ask the interviewer" sky. The tab underline is marigold. |
| `phone-light-landing.png` | No floating shapes. A smaller hero. The section cards are a swipe row with shadows not clipped at the bottom. |
| `phone-light-home.png` | Two-up Explore tiles with shadows. The tab bar's current tab is a marigold block. |

If anything differs from this, compare against the spec's CSS first (a copy mistake is the likeliest cause), then
§10.

---

## 8. Ship and record

1. `cd frontend && npm test`: every test passes (the deploy runs it).
2. `git status`: only `frontend/prototypes/neo-brutalism/` is new. **Nothing else changed.**
3. Commit on `prototype`:
   ```
   git add frontend/prototypes/neo-brutalism
   git commit -m "Prototype: neo-brutalism

   The whole of full-site in a neo-brutalist style: flat bold colour, 2 px
   outlines, hard 4 px shadows, Archivo Black and Space Mono, sticker chips,
   keys that press into their shadow; cream page in light, near-black with
   cream outlines in dark; calm reader. A style layer: full-site's scripts
   and stylesheets load unchanged, three stylesheets on top.
   Spec: tech-katta-context/ui-prototypes/neo-brutalism-spec.md

   <the attribution trailer lines your session was given>"
   git push origin prototype
   ```
   Retry the push up to 4 times with a short wait if it fails on the network. Push to no other branch.
4. Wait for the deploy (about 2 minutes):
   `until curl -s https://prototype.katta.cc/p/neo-brutalism/ | grep -q '<title>Neo-brutalism'; do sleep 20; done`
5. Rerun §7.1 and §7.2 against `BASE=https://prototype.katta.cc`. Both must pass. The live console may show one
   Cloudflare Insights CSP message; the script ignores it.
6. Check that `https://prototype.katta.cc/p/` lists "Neo-brutalism" under "Visual style".
7. Context repo (`tech-katta-context`, on its working branch):
   - In `ui-prototypes/TRIED.md`, replace the "Planned · `/p/neo-brutalism/`" section with an entry under "Live on
     prototype.katta.cc" giving: the source, the look (one paragraph from §1), how it is built (style layer), the
     status ("waiting for the owner's look"), the two open questions, and any deviation.
   - Add one line to `17-SESSION-HANDOVER.md`.
   - Commit (`TRIED: neo-brutalism live`) with the attribution trailers, and push.

---

## 9. Hand-back message to the owner

Fill in the blanks and send:

> Neo-brutalism is live: https://prototype.katta.cc/p/neo-brutalism/
>
> It's the whole site (same pages, navigation, phone layout and dark mode as full-site) in a neo-brutalist style:
> flat bold colours, black outlines, hard shadows, heavy headlines, sticker chips, and buttons that press in like
> keys. The light theme is on a cream "chai-stall" page; dark is near-black with cream outlines.
>
> Five things to look at, in light and dark (theme switch at the bottom of the sidebar):
> 1. The landing hero: "explained." in the lime highlighter, and the tilted section cards.
> 2. Home: the Explore tiles, and how the keys press.
> 3. A section page (Concepts): the current lesson as a coloured block.
> 4. The Caching lesson in Cards mode: the reader stays calm on purpose.
> 5. The workspace: press Submit.
>
> Two choices for you:
> - Loud everywhere, or keep the calm reader (current)?
> - Headlines in Archivo Black (current) or Space Grotesk?
>
> Checked: every screen in light and dark, on desktop and phone (no errors, no sideways scroll), 15 interaction
> checks, contrast (lowest 5.4:1). [Any deviation from the spec, or "No deviations from the spec."]

---

## 10. Known trade-offs (already decided; don't "fix")

- **Rotated stickers** (the "New" chip, stars, landing cards, the hero highlighter) are deliberate. Stars stop
  rotating inside tables, cards and results, and on phones, where tilt hurts alignment.
- **Section colours don't change in dark.** Vivid fills with black text in both themes is intended; darker fills
  turn muddy.
- **Soft areas in dark are neutral grey with a coloured left edge** (figures, "Say this", Problem of the day,
  canvas challenge, hints). This comes from full-site's dark rules and is intended.
- **The video stays a plain black box** with a marigold play key.
- **The prototype's "Screens" button** keeps its dashed look. It isn't part of the design.
- **Search is substring-only**, for example "cache" doesn't find "Caching". This is full-site behaviour and out of
  scope here. It's noted for the owner as a later improvement.
- **Theme choice is shared** with full-site (same storage key).
- **Fonts load from Google Fonts.** Until they arrive, headlines show the fallback sans for a moment.

## 11. Out of scope

- Any change to `full-site/` files, the real app (`frontend/src`), the backend or hosting files.
- New pages, routes, interactions, images or icons. Icons are full-site's line icons and follow `currentColor`.
- Making this the real site's style.
