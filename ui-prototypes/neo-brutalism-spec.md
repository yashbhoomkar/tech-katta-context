# Neo-brutalism prototype: spec for the implementer

Target: **https://prototype.katta.cc/p/neo-brutalism/**. Written 2026-11-15 by the design session; implemented by a
separate session. Every design decision is made here; the implementer should not invent new ones. When something
is not covered, choose the option closest to §2's principles and note it in the README (§9).

Read first: `ui-prototypes/README.md` (how prototypes are built, the CSP rules, testing, shipping),
`frontend/prototypes/full-site/README.md` (structure, routes, navigation, dark-mode lessons).

---

## 1. What we are making

The same site as `/p/full-site/` (same screens, routes, navigation, interactions, content), in a **neo-brutalist**
visual style:
- flat, saturated colour blocks;
- thick black outlines;
- hard offset shadows with no blur;
- chunky grotesque headlines;
- stickers;
- buttons that press in like physical keys.

Rooted in Indian street signage and chai-stall posters, so it feels like a *katta*, not a generic SaaS.

It is a **new style layer, not a new app**. The page logic is full-site's, loaded unchanged. This also proves the
folder structure: a new look is a new set of styles.

## 2. Principles (decide anything unlisted by these)

1. **Loud chrome, calm reader.** Buttons, cards, section blocks, nav, landing, results and stars are loud. Lesson
   text and the canvas stay calm: there are no hard shadows behind paragraphs, and figures get an outline only.
   Long reading must not tire the eye. (The owner never chose between "loud everywhere" and "calm reader"; this
   spec takes the calm reader, as proposed. Mention it in the hand-back so the owner can say otherwise.)
2. **Text on colour is always near-black** (`#111111`); never white on colour.
3. **Colour is a flat fill or a line, never a dark wash or a gradient.** This is the lesson from the dark-mode
   rounds: a dark orange is brown and a dark yellow is olive.
4. **One border weight, one shadow distance.** Everything uses 2 px borders and 4 px shadows, except where §4 says
   otherwise. Consistency is what makes brutalism look designed rather than broken.
5. **No section colour may match a status colour or the brand** (lesson from F2): Problems green ≠ "Passed" green;
   Quick Notes yellow ≠ the brand.
6. **Motion stays in the full-site system** (Emil Kowalski's rules): press feedback 100–160 ms, no bounce except
   celebrations, hover movement only with a mouse, reduced motion keeps fades only.

## 3. How it is built (architecture)

```
frontend/prototypes/neo-brutalism/
  index.html                 copy of full-site/index.html with the changes in §3.1
  README.md                  §9 (not published; prototype.mjs skips README.md)
  styles/
    tokens.css               §4: colours, fonts, borders, shadows; light and dark
    brutal.css               §5: every component restyle, in the same order as the table
    phone.css                §6: phone-only adjustments
```

### 3.1 index.html

Start from a copy of `frontend/prototypes/full-site/index.html` and change only this:

- **Meta and title:**
  - `<title>Neo-brutalism</title>`
  - `<meta name="prototype:type" content="Visual style">`
  - `<meta name="prototype:summary" content="The whole site in a neo-brutalist style: flat bold colour, thick outlines, hard shadows, keys that press in. Same pages and navigation as full-site; calm reader.">`
- **Theme script:** `<script src="scripts/boot-theme.js">` → `<script src="/p/full-site/scripts/boot-theme.js"></script>`
- **Main script:** `<script type="module" src="scripts/main.js">` → `<script type="module" src="/p/full-site/scripts/main.js"></script>`.
  Modules import their siblings relative to their own URL, so the whole app loads from full-site.
- **Fonts:** replace the Google Fonts URL with
  `https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap`
- **Stylesheets:** keep all of full-site's stylesheets but make their paths absolute (`/p/full-site/styles/...`), in
  the same order. After `/p/full-site/styles/phone.css`, add the three new files:
  `styles/tokens.css`, `styles/brutal.css`, `styles/phone.css`. Full-site's CSS is the base and ours is a layer
  over it, so layout, responsive rules and motion keep working.
- **Theme colour:** `<meta name="theme-color" content="#FFF4DC">`
- **Body:** keep everything inside `<body>` exactly as it is. The scripts look up these ids: `side`, `side-scrim`,
  `topbar`, `main`, `tabbar`, `signin`, `agree`, `agreel`, `gbtn`, `cmsg`, `cmdk`, `cq`, `cres`, `keys`, `keys-body`,
  `tourpop`, `tstep`, `ttitle`, `ttext`, `tskip`, `tnext`, `toast`, `toast-t`, `switcher`.

**Do not edit anything in `full-site/`.** If a style seems to need a markup change, find a CSS way instead (pseudo-
elements, `:has()`, attribute selectors). If one truly cannot be done in CSS, leave it and list it in the README.

**Known effect:** the theme choice (`tk-proto-theme` in localStorage) is shared with full-site. That's fine.

### 3.2 Winning over full-site's CSS

Our files load last, so equal specificity wins. Where full-site uses a more specific selector, match it, for
example `:root[data-theme="dark"] .block`, `@media (hover:hover) and (pointer:fine) { .btn:hover … }`, or
`.rcard:active`. Don't use `!important` except where full-site itself does (search its CSS for `!important` on
the same property).

## 4. Tokens (`styles/tokens.css`)

Redefine full-site's token names; component CSS reads roles, so most of the site re-colours by itself.

### 4.1 Light

```css
:root {
  --sans: "Archivo", ui-sans-serif, system-ui, sans-serif;
  --display: "Archivo Black", "Archivo", ui-sans-serif, system-ui, sans-serif;
  --mono: "Space Mono", ui-monospace, Menlo, monospace;
  --serif: var(--display);                       /* full-site's italic serif accent is replaced (§5 hero) */

  --bw: 2px;                                     /* border width, everywhere */
  --bw-strong: 3px;                              /* hero cards, dialogs, the sidebar's right edge */
  --sh-d: 4px;                                   /* shadow distance */
  --sh: var(--sh-d) var(--sh-d) 0 var(--edge);   /* the one shadow */
  --sh-lg: 6px 6px 0 var(--edge);                /* hover, dialogs, hero cards */
  --r-sm: 6px; --r-md: 8px; --r-lg: 10px; --r-xl: 12px; --r-pill: 8px;   /* square-ish, not pills */

  color-scheme: light;
  --page: #FFF4DC;        /* chai-stall cream */
  --surface: #FFFFFF;
  --raised: #FFFFFF;
  --sunken: #FBE9C4;      /* tracks, inputs, hover */
  --ink: #111111; --ink-2: #333333; --muted: #5C5C5C;
  --edge: #111111;        /* every outline and shadow */
  --line: #111111; --line-strong: #111111;
  --btn: #111111; --on-btn: #FFFFFF;
  --marigold: #FFC233; --on-marigold: #111111;
  --link: #1E40D8; --focus: #1E40D8;
  --pass: #0B7A3E; --fail: #C21F1F; --warn: #9A4A00; --star: #111111;   /* stars are black on yellow stickers (§5) */
  --video: #111111; --on-video: #FFF4DC;
  --scrim: rgb(17 17 17 / .55);
  --shadow: var(--sh); --shadow-pop: var(--sh-lg); --hl: 0 0 0 0 transparent;
  --band-strong: #111111; --on-band-strong: #FFF4DC;
  --selection: #FFE14D;

  /* sections: one flat colour each; fill = accent; tint = a light version for soft areas */
  --c-concepts: #5EC2FF;   --a-concepts: #5EC2FF;   --t-concepts: #DDF2FF;
  --c-components: #FF9330; --a-components: #FF9330; --t-components: #FFE6CC;
  --c-interview: #B48CFF;  --a-interview: #B48CFF;  --t-interview: #EFE5FF;
  --c-problems: #19D3A2;   --a-problems: #19D3A2;   --t-problems: #D6F7EC;
  --c-real: #FF6B6B;       --a-real: #FF6B6B;       --t-real: #FFE0E0;
  --c-notes: #E8F55C;      --a-notes: #E8F55C;      --t-notes: #F7FCD6;   /* lime-lemon: clear of the marigold brand */
  --on-c: #111111; --on-c-2: rgb(17 17 17 / .78);
  --track-on-c: rgb(17 17 17 / .18); --fill-on-c: #111111;
  --preview: #FFFFFF; --on-preview: #111111;
}
```

Why these values:
- Every section colour carries `#111111` text at 7:1 or better.
- Problems teal `#19D3A2` sits clear of "Passed" `#0B7A3E` (a dark green used only as text).
- Quick Notes lime `#E8F55C` sits clear of the brand marigold `#FFC233`.
- The cream page is warmer and more poster-like than full-site's paper.

### 4.2 Dark

```css
:root[data-theme="dark"] {
  color-scheme: dark;
  --page: #121212; --surface: #1C1C1C; --raised: #242424; --sunken: #2A2A2A;
  --ink: #FFF4DC; --ink-2: #E5DCC8; --muted: #B3AA98;
  --edge: #FFF4DC;        /* cream outlines and shadows */
  --line: #FFF4DC; --line-strong: #FFF4DC;
  --btn: #FFF4DC; --on-btn: #111111;
  --link: #8FB0FF; --focus: #FFE14D;
  --pass: #6EE7A0; --fail: #FF8A80; --warn: #FFB26B; --star: #111111;
  --video: #000000; --on-video: #FFF4DC;
  --scrim: rgb(0 0 0 / .7);
  --band-strong: #FFC233; --on-band-strong: #111111;   /* the final call-to-action band turns marigold in dark */
  --selection: rgb(255 225 77 / .35);
  /* section fills stay the same vivid colours with black text (never darkened: §2.3); tints become neutral */
  --t-concepts: #242424; --t-components: #242424; --t-interview: #242424; --t-problems: #242424; --t-real: #242424; --t-notes: #242424;
  --track-on-c: rgb(17 17 17 / .22); --fill-on-c: #111111;
  --preview: #1C1C1C; --on-preview: #FFF4DC;
}
/* in dark, a section-coloured card casts its shadow in its own colour, so it glows like a sign; plain cards cast cream */
:root[data-theme="dark"] .block { box-shadow: var(--sh-d) var(--sh-d) 0 var(--edge); }
```

Dark-mode rules:
- Outlines and the default shadow are cream.
- Section-coloured blocks keep their vivid fill and black text.
- Soft tinted areas become neutral `#242424` with a 2 px outline and a 4 px left edge in the section colour.
- Check that every text pair is ≥ 4.5:1 (§8).

## 5. Components (`styles/brutal.css`)

Apply these in this order. Selectors are full-site's class names (see its `styles/` and `scripts/pages/`). Where
"outline" is written, it means `border: var(--bw) solid var(--edge)`; "shadow" means `box-shadow: var(--sh)`.

| Area | Selectors | Treatment |
|---|---|---|
| Base type | `body` | `font-family: var(--sans)`; `h1, h2, h3, h4` use `var(--display)`, weight 400 (Archivo Black has one weight), `letter-spacing: -.01em`, `line-height: 1.05`. `.mono` uses `var(--mono)`, 11px, `letter-spacing: .04em`, uppercase, and stays muted. |
| Focus | `:focus-visible` | `outline: 3px solid var(--focus); outline-offset: 2px`. |
| Buttons | `.btn` | Outline, shadow, `border-radius: var(--r-md)`, `font-weight: 700`, background `var(--surface)`. `.btn.primary`: background `var(--marigold)`, text `#111`. Dark: same marigold with `#111` text (a yellow key on black). `.btn.ghost`: no outline, no shadow. `.btn.icon`: square, 36×36. `.btn.accent`: background `var(--c-concepts)`, text `#111`. |
| Press / hover | `.btn`, `.fbtn`, `.ecard`, `.rcard`, `.hub-card`, `.pcard`, `.palette .p`, `.mega-i`, `.theme-card` | **Press:** `transform: translate(var(--sh-d), var(--sh-d)); box-shadow: 0 0 0 var(--edge)`, 100 ms ease-out. The key sinks into its shadow. **Hover, mouse only** (`@media (hover:hover) and (pointer:fine)`): `transform: translate(-2px,-2px); box-shadow: var(--sh-lg)`, 120 ms ease-out. Override full-site's `translateY(-1px)` / `scale(.97)` on the same selectors. Keep `.rcard`'s rotation: `transform: rotate(var(--r)) translate(…)`. |
| Chips | `.chip`, `.easy`, `.medium`, `.hard`, `.newchip` | Outline, `border-radius: 6px`, `font-weight: 700`, no shadow. Easy: background `var(--c-problems)`; Medium: `var(--c-components)`; Hard: `var(--c-real)`. All with `#111` text in both themes. `.newchip`: background `var(--c-notes)`, rotated `-2deg`, shadow (a sticker). |
| Stars | `.stars` | A sticker: `display: inline-flex`, background `var(--marigold)`, outline, `border-radius: 6px`, padding `0 6px`, text `#111`, rotated `-3deg`. In tables, no rotation. |
| Progress | `.bar`, `.bar i`, `.pb` | Track: outline, height 10px, background `var(--surface)`, radius 4px. Fill: section colour (`var(--a)`), or `#111` inside coloured blocks; no radius on the fill. |
| Cards | `.card` | Outline, shadow, `border-radius: var(--r-lg)`, background `var(--surface)`. |
| Section blocks | `.block` (landing `.rcard`, home `.ecard`, `.thumb`, `.sechead`, `.hub-card`, `.stage`) | Flat `var(--c)` fill, outline, shadow, `border-radius: var(--r-xl)`. No gradients, no filters. `.ecard`/`.rcard` titles in `var(--display)`. `.pane` inside blocks: background `var(--preview)`, outline, radius 8px (on `.rcard .pv` only the top corners are rounded). |
| Logo | `.logo`, `.logo b` | `.logo`: outline, shadow, radius 8px, background `var(--surface)`, `font-family: var(--display)`. `.logo b`: square (radius 4px), background `#111`, text `var(--marigold)`, outline. In dark the square stays `#111` with a cream outline. |
| Landing nav | `.lnav`, `.lnk`, `.mega`, `.mega-i` | `.lnav` on scroll (`.stuck`): `border-bottom: var(--bw) solid var(--edge)` and a solid `var(--page)` background with no blur. `.lnk`: weight 700. `.mega`: outline, `var(--sh-lg)`, radius 12px. `.mega-i:hover`: background `var(--t)` with outline. |
| Hero | `.hero h1`, `.hero h1 em`, `.hero .shape` | `h1`: `var(--display)`, `font-size: clamp(44px, 8vw, 96px)`, uppercase off. `em`: no italic, no serif. Instead a **highlighter block**: `background: var(--c-notes)`, `padding: 0 .12em`, outline, `box-shadow: var(--sh)`, `display: inline-block`, `transform: rotate(-1.5deg)`. Text stays `#111` in both themes. `.shape`: outline, `box-shadow: var(--sh)`, fills unchanged. |
| Bands | `.band`, `.band.alt`, `.final` | `.band`: `border-top: var(--bw) solid var(--edge)`. `.final`: background `var(--band-strong)`, text `var(--on-band-strong)`. Its `.btn` is marigold with `#111` text. |
| Steps, judge, nums | `.step`, `.jcard`, `.jrow`, `.jscore`, `.nums .card`, `.face` | `.step`: flat `var(--t)` fill, outline, shadow. `.jrow` borders: `var(--bw) solid var(--edge)`. `.jscore`: background `var(--c-problems)`, text `#111`. `.nums b`: `var(--display)`. `.face`: outline, shadow. |
| Sidebar | `.side`, `.nav-i`, `.nav-h`, `.side .search`, `.me`, `.theme-sw` | `.side`: `border-right: var(--bw-strong) solid var(--edge)`. `.nav-i[aria-current="page"]`: background `var(--a, var(--marigold))`, text `#111`, outline, shadow, weight 700; hide full-site's `::before` marker. `.nav-i:hover`: background `var(--sunken)`. `.side .search`: outline, radius 8px, background `var(--surface)`. `.me`: outline, radius 10px. `.theme-sw`: outline; the pressed button is `var(--marigold)` with `#111` icon. |
| Top bar, tab bar | `.topbar`, `.tabbar`, `.tab`, `.tab::before` | Solid backgrounds (no blur), `border-bottom` / `border-top: var(--bw) solid var(--edge)`. Current tab: `.tab::before` pill becomes a `var(--marigold)` block with outline and radius 8px; icon `#111`. |
| Overlays | `.dialog`, `.cbox`, `.sheet`, `.tourpop`, `.sw-list`, `.ask` | Outline `var(--bw-strong)`, `box-shadow: var(--sh-lg)`, radius 12px (sheets: top corners only). `.tourpop`: background `var(--c-notes)`, text `#111`, outline, `var(--sh-lg)`. `.cres a[aria-selected="true"]`: background `var(--marigold)`, text `#111`, outline. `.toast`: background `var(--marigold)`, text `#111`, outline, shadow, radius 8px. |
| Problems | `table`, `th`, `td`, `#ptable tr:hover`, `.pcard`, `.fbtn` | Table: wrap card outline; `th` background `#111` with text `var(--page)` in light (in dark: background `var(--edge)`, text `#111`), mono font. `td` borders: `var(--bw) solid var(--edge)`. Row hover: background `var(--sunken)`. `.fbtn`: outline, radius 8px, weight 700; pressed: marigold with `#111`. `.pcard`: outline, shadow, radius 10px. |
| Section page | `.module`, `.mhead`, `.lesson`, `.lesson.now`, `.lesson .st`, `.jump a`, `.cprog` | `.lesson` borders: `var(--bw) solid var(--edge)`. `.lesson.now`: background `var(--a)`, text `#111`. `.st` circles: `var(--bw)` outline; done is a filled `#111` with a ✓ via `::after` in `var(--page)`. `.jump a`: outline, shadow, radius 8px. `.cprog`: card style. |
| **Reader (calm)** | `.art`, `.art .body`, `.fig`, `.say`, `.node`, `.wire`, `.seg`, `.prail`, `.pcur`, `.lrow`, `.finish`, `.deck`, `.player` | **No shadows on anything inside `.art` except buttons.** `.art .body`: `var(--sans)` 18px/1.7, `var(--ink-2)`. `h1`/`h2`: `var(--display)`. `.fig`: background `var(--t)`, outline, no shadow, radius 10px. `.say`: background `var(--t-notes)`, outline, `border-left-width: 6px`, no shadow. `.node`: outline, radius 6px; `.node.hl`: background `var(--c-concepts)`, text `#111`. `.wire`: height 3px, background `var(--edge)` (fill `i` stays). `.seg`: outline, radius 8px; `.seg-i`: background `var(--marigold)` with outline. `.pcur`: `border-right: var(--bw) solid var(--edge)`. `.lrow.cur-l`: background `var(--a)`, text `#111`, outline. `.finish`: card style. `.player`: outline. |
| Workspace | `.wtop`, `.tabs`, `.tab-ul`, `.palette`, `.palette .p`, `.canvas`, `.cv rect`, `.results`, `.results .r`, `.panes`, `.msg` | `.wtop` / `.results` borders: `var(--bw) solid var(--edge)`. `.tab-ul`: height 4px, background `var(--marigold)` with `box-shadow: 0 0 0 1px var(--edge)`. `.palette`: outline, shadow. `.palette .p`: outline, radius 6px, small shadow `2px 2px 0 var(--edge)`. Canvas SVG: `.cv rect { stroke: var(--edge); stroke-width: 2px }`; the dot grid stays. `.results .r`: outline, radius 6px. `.panes`: outline; the selected half is marigold. `.msg.me`: `#111` background with cream text in light; marigold with `#111` text in dark. `.msg.them`: outline. |
| You page | `.theme-card`, `.tprev`, `.profile`, `.keys kbd` | `.theme-card`: outline, shadow; selected: marigold background. `kbd`: outline, `2px 2px 0 var(--edge)` shadow, mono font. |

## 6. Phones (`styles/phone.css`)

Full-site's `phone.css` already handles layout (swipe rows, problem cards, Brief / Canvas, sheets). Ours only adds:

- `--sh-d: 3px` and `--bw-strong: 2px` under `@media (max-width: 640px)`, so thick shadows don't eat the narrow
  screen.
- Hero `h1`: `font-size: clamp(40px, 12vw, 56px)`; the highlighter `em` rotation becomes `-1deg`.
- `.rcard` in the swipe row: no rotation (full-site already sets `--r: 0`); the shadow stays.
- The tab bar's current-tab block: 48×30.
- Check §8's phone screenshots for clipped shadows. Containers with `overflow: hidden` cut off the 4 px shadow; add
  `padding` to the scroller (e.g. `.rise { padding-bottom: 14px }`) rather than removing the shadow.

## 7. Motion

Full-site's `motion.css` stays loaded. Only these changes:

- **Press:** `translate(var(--sh-d), var(--sh-d))` with the shadow going to 0, as in §5. This replaces `scale(.97)`
  for the listed selectors.
- **Hover (mouse):** `translate(-2px,-2px)` with `var(--sh-lg)`.
- **Card arrivals:** `.rcard`, `.ecard` and `.hub-card` use a "stamp" arrival: `@keyframes nb-stamp { from { opacity: 0;
  transform: translate(0, -10px) rotate(var(--r, 0deg)); box-shadow: 0 0 0 var(--edge); } }`, 360 ms
  `cubic-bezier(.23,1,.32,1)`. The card lands and its shadow appears. Use full-site's `--dl` delays where present.
- **Reduced motion:** none of the translate effects; arrivals fade only (full-site's reduced-motion rules already
  cover most of this; add `.btn:active { transform: none }` etc. for ours).

## 8. Checks before shipping (all must pass)

Run the way `ui-prototypes/README.md` §3.6 says: `npm run build:prototype:cloudflare`, then `npx --yes wrangler@4 dev
--config hosting/wrangler.prototype.jsonc --port 8799`. Restart wrangler dev after adding files.

1. **Every screen, both themes, both sizes.** Routes `''`, `home`, `learn`, `learn/concepts`, `learn/concepts/caching`,
   `problems`, `problems/url-shortener`, `me`, `nowhere`, at 1440×900 and on Playwright's `devices['iPhone 13']`, with
   `colorScheme: 'light'` and `'dark'`. Collect `pageerror` and console errors (ignore the Cloudflare Insights beacon
   CSP message). There must be none. `document.documentElement.scrollWidth - innerWidth === 0` on every page.
   Screenshot each one and **look at them**: clipped shadows, text on colour that isn't `#111`, and leftover
   full-site pills or soft shadows are the usual misses.
2. **Interactions still work:** the Learn menu, the phone menu sheet, search (Ctrl+K, type "cache", Enter), the tour
   on Home, Cards mode and Mark complete in the lesson, Run and Submit in the workspace, the sign-in dialog nudge,
   the theme switch, and `[` for the sidebar rail. Use full-site's own test flow as a model (the design session's
   Playwright scripts did exactly these clicks).
3. **Contrast:** compute WCAG contrast for every text/background pair in §4 (both themes), including `#111` on each
   section colour, `--muted` on `--page` / `--surface` / `--raised`, `--link` on `--page`, and `--pass` / `--fail` /
   `--warn` on `--surface`. Every pair must be ≥ 4.5:1. Adjust only the failing token, and note the change in the
   README.
4. `npm test` passes (the deploy runs it).
5. **Full-site is unchanged:** `git diff --stat` touches only `frontend/prototypes/neo-brutalism/` (plus the context repo).

## 9. Ship and record

- **README** in `neo-brutalism/`: what it is, the principles (§2), the file list, and any deviation from this spec
  with the reason.
- **Commit** on the `prototype` branch only. Message `Prototype: neo-brutalism …`, ending with the session's
  co-author and session trailer lines. Push. The Prototype workflow deploys in about 2 minutes. Then repeat check 1
  against `https://prototype.katta.cc/p/neo-brutalism/`.
- **Context repo:** add an entry to `ui-prototypes/TRIED.md` under "Live on prototype.katta.cc" (source, look,
  screens, open questions for the owner: "loud everywhere or calm reader?", headline font Archivo Black). Move
  "Planned · neo-brutalism" into it. Commit on the context working branch.
- **Hand-back to the owner:**
  - the link;
  - five things to look at: the landing hero, Home's Explore tiles, a section page, the lesson in Cards mode,
    and the workspace after Submit, each in light and dark;
  - the two open questions.

## 10. Out of scope

- Any change to `full-site/` files, to the real app (`frontend/src`) or to the backend.
- New pages, routes or interactions.
- New images or icon sets. Icons stay full-site's line icons; they follow `currentColor`.
- Making this the real site's style.
