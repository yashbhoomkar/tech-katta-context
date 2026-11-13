# 30 — Premium renovation: type, motion and surfaces

Written 2026-11-14 (02:20–03:00 IST) by the overnight session the owner scheduled before sleeping. Owner's words:
"I want it to think more on fonts and animations. The current font used make the website looks like it is
developed by vibe coding. The overall website does not look rich and premium. Think for entire renovation of
website UI/UX. Ask it to write docs. Write code and write code in production directly." The owner gave the
go-ahead to merge and deploy tonight without waiting; every part still goes PR → CI → squash merge → live check.

**Status labels:** Decided (by this session, on the owner's instruction to decide) · Built · Left for later.

---

## 1. Diagnosis: what reads as "vibe coded" today

Screenshots of production and a local build of `main` (`253d4bf`) at 1440×900 and Pixel 7, light and dark, landing,
dashboard home, Concepts, an article, a problem with the canvas and Practice.

1. **The type is the default type of AI-built sites.** Inter for everything plus a soft, "wonky" variable serif
   (Fraunces) for headlines is the stock pairing of template generators and AI page builders. Inter at 14–15 px in
   grey on cream reads like a dashboard kit, not a publication.
2. **Mono uppercase everywhere.** 297 uses of the mono font, most of them tiny uppercase labels with wide tracking
   ("CORE CONCEPTS", "FIG. 01 —", "SPEED", "QUALITY"). One or two per screen gives a technical voice; dozens become
   noise and make every screen look like a terminal theme.
3. **One card for everything.** White rounded card, figure on top, serif title, two grey lines, "Read →". The same
   object on the landing, the dashboard home, every section list and every article's topic cards: nothing has
   rank, so nothing feels curated.
4. **The template hero.** A centred "New" pill, a two-line headline, a grey sub-line and two pill buttons is the most
   recognisable landing pattern of 2024–26 SaaS templates.
5. **Pills and borders on every control.** Header buttons, chips, segmented controls and secondary buttons are all
   1 px bordered pills of the same weight, so primary and secondary actions look alike.
6. **Motion is only "rise and fade".** Everything that moves uses one 10 px rise with one curve and 0.12–0.28 s
   (theme/motion.css). Nothing responds to the pointer except colour, nothing has weight, and sections below the fold
   are already in place before they are seen.
7. **Reading view.** Body text at 15–16 px with long measures (over 90 characters per line on desktop articles),
   which is tiring and looks like documentation rather than a well-set book.

What is already good and stays: the Katta Paper colours (owner's latest choice, #338), the 232 hand-drawn animated
figures and their motion grammar (#311/#312), the canvas and Practice layouts, the view-transition cross-fade between
pages (spec 24 A2/A10), tours and swipes.

## 2. References (what premium sites do, transferable techniques only)

- **Stripe, Linear, Vercel:** one neutral grotesk set tightly at display sizes and loosely at small sizes (tracking
  changes with size); very few weights (two or three); hierarchy by size and colour, not by boxes; borders replaced by
  hairlines and layered soft shadows; motion that is fast out, slow in (expo-out curves, 200–600 ms), and pointer-aware
  hover (lift, light, follow).
- **FT, NYT interactives, The Pudding:** an editorial serif for headlines with real optical contrast, a sober sans
  for UI, a reading column of 60–70 characters at 18–20 px with 1.6–1.7 line height, numbered sections, figures that
  break out wider than the text column, captions in a small sans.
- **Apple:** scroll-revealed sections where each block arrives once as you reach it, with a short stagger; big
  numbers that count up; no motion that loops for no reason.
- **Brilliant:** generous whitespace, one strong colour used sparingly, illustrations that move only when they teach.

## 3. Type system (Decided, Built in part A)

### 3.1 Faces

| Role | Face | Why |
|---|---|---|
| Interface and reading (`--font`) | **Instrument Sans** (variable 400–700) | A refined neo-grotesk with a little warmth: sharper than Inter, not on every template; very good at 14–18 px; numbers clear in tables |
| Headlines, card titles, emphasis (`--font-display`) | **Source Serif 4** (variable, with italic) | A true text-and-display serif (Adobe, Frank Grießhammer) with crisp contrast at large sizes: reads as an engineering journal, like the FT/NYT pages, instead of the soft "friendly" serif of templates. The italic carries the emphasised headline word |
| Figures, code, labels, numbers (`--mono`) | **Geist Mono** (variable) | Clean, contemporary monospace; the same 600-unit advance as IBM Plex Mono, so the text inside all 232 figures keeps its width and nothing overflows |

All three are SIL Open Font Licence, self-hosted from `@fontsource-variable/*` (no third-party request; the CSP
allows `font-src 'self'`). Rejected after rendering real pages (screenshots in the session scratchpad):
Instrument Serif (too condensed for card titles), Newsreader (too close to Fraunces, no change of feel), Bricolage
Grotesque (too loud for reading), Hanken/Schibsted Grotesk (good, but Schibsted reads newspaper and Hanken plainer),
Geist sans (now the default face of AI app builders: the opposite of the brief).

### 3.2 Loading

- Latin files on first load: Instrument Sans 30 KB + Source Serif 4 51 KB + Geist Mono 23 KB ≈ 104 KB (budget 120 KB).
  The serif italic (51 KB) loads only on pages that use it. Other scripts' subsets load only if a page needs them.
- The sans and serif Latin files are preloaded in every page's head (`vite.config.js`, `fontPreload`).
- `font-display: swap` with **metric-matched fallbacks** in `tokens.css` (`TK Sans Fallback` = Arial at 101.6 %,
  `TK Serif Fallback` = Georgia at 103 % / Times at 118 %, `TK Mono Fallback` = Courier New at 100 %, with ascent and
  descent overrides), measured in Chromium against each font so line breaks don't move when the font arrives.

### 3.3 Scale and setting

- Tracking follows size: display −0.02 em, headings −0.015 em, body 0, small caps and mono labels +0.04 em.
- Weights: sans 400 / 500 / 600 only; serif 500 for headlines, 600 for card titles; mono 400 / 500.
- Reading column: max 68 ch, body 17.5 px (desktop) / 17 px (phone), line height 1.68 (part D).
- `text-wrap: balance` on headings, `pretty` on paragraphs; kerning on; antialiased rendering; tabular numerals in
  tables and stats (`theme/base.css`).

## 4. Motion system (Decided, Built in part B)

One language, written as tokens in `tokens.css` and used through `theme/motion.css` and `theme/reveal.js`:

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` (expo-out) | everything that arrives |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | things that move from one place to another |
| `--ease-spring` | a `linear()` spring with a 3 % overshoot (cubic fallback) | hover lift, press release, toggles |
| `--dur-fast` / `--dur` / `--dur-enter` / `--dur-slow` | .14s / .24s / .5s / .8s | feedback / state / arrival / hero |
| `--rise` | 18 px | how far arriving things travel |
| `--stagger` | 60 ms | gap between siblings |

Rules: only `transform`, `opacity`, `clip-path` and `filter` move; nothing loops except loading marks and the
figures; everything is inside `prefers-reduced-motion: no-preference` (reduced motion gets the end state at once).

Patterns:
1. **Scroll reveal:** `[data-reveal]` blocks start hidden and arrive (rise + fade + slight de-blur) the first time a
   quarter of them is on screen; children with `[data-reveal-stagger]` follow at `--stagger`. One IntersectionObserver
   for the page (`theme/reveal.js`), no library. Without JavaScript or with reduced motion, everything is simply shown.
2. **Headline reveal:** the landing and section headlines arrive line by line from behind a mask (clip-path), the
   italic word last.
3. **Pointer feedback:** cards lift 3 px with a deeper layered shadow on hover (spring), press down 1 px on click;
   primary buttons get a soft glow on hover; arrows slide; links grow an underline from the left.
4. **Page changes:** the existing view-transition cross-fade gets a short rise for the new page (dashboard).
5. **Numbers:** the existing count-up (CountUp.jsx) uses `--ease-out`.
6. **Figures:** unchanged grammar (#311/#312: play when seen, one loop speed), framed by the reveal.

## 5. Whole-site plan (surfaces, layout, components)

| Area | Change | Why it feels more premium |
|---|---|---|
| Landing hero | No "New" pill: a quiet eyebrow line instead; larger serif headline with masked reveal; the sub-line in the sans at 19–20 px; primary button with depth (inner highlight + soft shadow), secondary as a text button with an arrow; a soft radial light behind the figure | Removes the template signature; one clear action |
| Landing sections | Numbered section eyebrows, more vertical space, scroll reveal per section, bento cards with hairline borders and layered shadows | Rhythm and rank, "designed" not "generated" |
| Header | Hairline border, translucent glass that firms up after scrolling, nav links with animated underline | Calm, product-grade chrome |
| Dashboard shell | Sidebar active row with a sliding marker; quieter section labels (sans small caps instead of mono caps) | Fewer mono labels, clearer state |
| Cards (everywhere) | Fewer borders, layered shadow, 3 px lift and image zoom (1.02) on hover, title in serif 600 | Depth and response |
| Article reading view | 68 ch column, 17.5 px / 1.68, serif section headings with numbered eyebrows, figures wider than the text, callouts as tinted panels without heavy borders, code in Geist Mono | Reads like a well-set book |
| Problems / canvas / Practice | Only type and token changes (no layout change: these are tools people use) | Keep what works |
| Sign-in dialog, account menu | Spring pop-in, larger radius, layered shadow | Feels native |
| Empty and error states | Unchanged scenes (spec 24 G3), new type | — |
| Dark mode | Same tokens; shadows become darker and a 1 px top highlight replaces them on cards | Depth in the dark |

## 6. Phases shipped tonight

| Part | What | Acceptance |
|---|---|---|
| A | Fonts and typesetting (tokens, fallbacks, preload, base) | No page errors, no sideways scroll 320–1440, all figures drawn, fonts ≤ 120 KB first load |
| B | Motion tokens, scroll reveal, pointer feedback, headline reveal | Same, plus reduced motion shows everything at once; nothing hidden without JavaScript |
| C | Landing and shell polish (hero, sections, header, cards) | Same; light and dark; Pixel 7 |
| D | Reading view (measure, size, headings, callouts) | Same on 3 articles |

Results and PR numbers: §8.

## 7. Rollback

- Production before the first merge of tonight: `253d4bff4c6b9ec006453669248e5a67f7e6b4ed` (#342).
- One step: Vercel dashboard → tech-katta → Deployments → the deployment of `253d4bf` → "Instant Rollback"
  (frontend only; the backend is not changed by this work).
- Or revert the PRs on GitHub (each is one squash commit).

## 8. Decision log and results

- 2026-11-14 02:40 IST, Decided: fonts as §3.1 after rendering six candidate systems on the landing, dashboard home
  and an article.
- Decided: keep the Katta Paper colours (#338, owner's latest choice); premium comes from type, space, depth and
  motion, not from another palette change.
- Decided: canvas, Practice and the problem workspace get type and token changes only.
- Decided: no new libraries (no Framer Motion / GSAP): CSS plus one IntersectionObserver.

Shipped (all merged and checked live, 2026-11-14):

| Part | PR | Squash |
|---|---|---|
| A fonts and typesetting | #343 | `a819f6f20489b7346bfa9acd90dfa846ca7f601d` |
| B motion and depth | #344 | `678667baf25b408af421416a56c62a31652dd982` |
| C+D landing, shell, reading | #345 | `d56cb182738ad6fd824e0c3084f27010eb1d53b6` |
| docs (theme README, Design.md) | #346 | `e2e6191fa61e3f7a1cd4fc8d187b3681ec8bbd6a` |
| E sliding sidebar marker, header that firms up, numbered landing sections | #347 | `ee4b6a7f68bdc61c115fcc575c5e8bbd55baf07a` |

Built differently from the plan, with reasons:
- §4.1 scroll reveal uses scroll-driven animations (`animation-timeline: view()`, already used on the landing)
  instead of a new `theme/reveal.js`: no JavaScript, no hidden-until-loaded risk; browsers without it show content
  at once.
- §4.2 the headline "comes into focus" (rise + blur 8 px → 0) instead of a clip-path mask: a mask clipped the
  italic word's overhang and descenders.
- The reading measure is 37 em, not 68 ch: in Instrument Sans `ch` (the width of "0") is wide, so 68 ch was 769 px.
- `premium.css` selectors start with `:root:not(#_)` (the weight of one id): the page stylesheets carry several
  layers of older `:hover` rules from earlier redesigns (#309, #334–#338) at up to four classes.

Part E (owner: "Proceed", 2026-11-14), #347: the sidebar's active fill is one marker that slides between rows and
morphs across page changes (`SideMark` in `dashboard/shell.jsx`, measured from its own parent because a child's layout
effect runs before the parent's ref is attached); the landing header has no edge at the top and gains its hairline and
shadow as you scroll (scroll-driven; a fully clear header showed the beige page as a band above the lighter hero, so
only the edge animates); landing sections are numbered ("— 01 —", "02 |", a CSS counter).

Left for later: a check in Safari and Firefox (only Chromium is installed in the session container) and on a real
mid-range phone; the owner's verdict on the look.
