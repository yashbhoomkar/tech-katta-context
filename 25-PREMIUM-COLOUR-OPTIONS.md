# 25 — Premium colour options

> **Current (2026-11-13, tech-katta #335): §7.** The industry expert said marigold isn't premium and there is too much to
> read. Marigold is out: black pill buttons and an indigo accent. Section cards show pictures, and articles have
> "Figures only". §6 (P4) is history.

> **Shipped (2026-11-13): P4, Brilliant-inspired, tech-katta #334** (squash `fd621c2af1d58f906f52a67677ba52448a5ed28e`).
> The owner repeated "I liked the brilliant.org website", taken as the go-ahead. Pictures of the shipped site:
> `ui-redesign/palettes/p4-shipped.png`, `p4-shipped-phone.png`.

> **Round 2 and the decision (2026-11-13).** Owner: "More premium options. Look at best UI websites on the net and
> then think and decide." The research, three new directions and the decision are in §5. **Decided: P1, Paper & Ink
> with marigold as a signal.** It supersedes the round-1 recommendation (A). **Round 3 (§6): the owner likes
> brilliant.org; decided P4, Brilliant-inspired.**

Written **2026-11-13**. The owner: "The colour scheme on our website does not look premium. I showed the website to an
industry expert. Think of more premium colour schemes." **Options only. Nothing is changed on the site** until the
owner picks one. This would replace the colour part of spec 20 ("Katta Paper": cream paper and marigold).

## 1. Why the current look reads as "not premium"

- **Yellow is doing a loud job.** Marigold fills the main buttons, the logo, the highlighter under the headline, the
  current-row tints and the figure highlights. Bright yellow buttons read as consumer, sale or budget, not as a
  serious tool.
- **The page is tinted everywhere.** Cream paper, cream surfaces and pale-yellow tints all at once. Premium tech sites
  (Linear, Stripe, Vercel, Arc, Raycast) keep the page close to neutral and let one accent appear rarely.
- **Too many soft colours, not enough contrast in the hierarchy.** Ink on cream with yellow tints flattens the page.
  Premium palettes rely on near-black ink, near-white surfaces and one accent.
- Typography also matters (the highlighter band and the many mono capital labels). These options change **colour
  only**, so they can be judged side by side.

## 2. The four options

Every option keeps the same token roles (`frontend/src/theme/tokens.css`), so switching is a token swap. The figures
follow the tokens through `palette.js`, and status colours (passed, warning, failed) are unchanged. The exact values
are in `tools/palettes.js`. The screenshots below are the **real site**, built from `main` and rendered with each
palette (`tools/e2e/palette-shots.js`).

| | Option | Idea | Main button | Accent (links, highlights, figure path) | Risk |
|---|---|---|---|---|---|
| **A** | **Ink & Brass** (recommended) | Keep the warmth and the Indian brass/gold heritage, but quiet: near-neutral warm white, true black ink, **black** main buttons, brass used sparingly | Black, white text (white in dark) | Brass `#8a6a2f` (dark: `#d4b77c`) | Closest to the current identity, so the change is calm, not a rebrand |
| **B** | Graphite & Saffron | Monochrome like Vercel or Linear, with one saffron accent | Black (white in dark) | Saffron `#c2410c` (dark: `#fb923c`) | The warning colour is also orange; it would need to move (for example to amber) |
| **C** | Midnight Indigo | Cool neutrals and a deep indigo brand, like Stripe | Indigo `#4338ca` | Indigo | Common in SaaS; the owner rejected blue earlier ("cold") |
| **D** | Oxblood & Ivory | Editorial: ivory page, deep oxblood (kumkum red) | Oxblood `#7a1f2b` | Oxblood | Brand red next to "failed" red in results; the danger colour would need to move |

Pictures (in `ui-redesign/palettes/`): `pal-landing-light.png`, `pal-landing-dark.png`, `pal-article-light.png` (a
problem workspace), `pal-article-dark.png`, `pal-phone-light.png`, `pal-phone-dark.png`. Each sheet shows the current
look and A to D.

## 3. Recommendation: A, Ink & Brass

- **Premium comes from restraint:** black primary buttons and a near-neutral page are what the best tool sites do.
  One accent, used rarely, reads as confident.
- **It keeps what is ours:** warmth, the gold family (brass is marigold's grown-up sibling), the highlighter idea
  (now a soft brass band), and Fraunces headings. Readers who know the site still recognise it.
- **No new conflicts:** brass doesn't clash with any status colour (green, orange, red).
- **Dark mode is the strongest of the four:** a near-black page, white primary buttons and gold accents.

If A is chosen, the follow-ups, each small and in its own PR:
1. Swap the token values in `tokens.css` and `palette.js` (the theme test keeps them in step). Check every page for
   AA contrast (§4.1 of spec 20 lists the pairs).
2. Make the highlighter thinner (a 3 px underline instead of a band), and use mono capital labels only where they
   label data.
3. Update the link preview image (`og-2026-11.png`) and the share card (`practice/card.js` reads `TOKENS`, so it
   follows automatically).

## 4. Owner decision

Pick **A**, **B**, **C**, **D**, or "keep the current one". A mix also works (for example, A's neutrals with C's
accent).

## 5. Round 2: what the best sites do, and the decision

### 5.1 Research (16 sites, loaded in a browser, colours read from the page)

`tools/e2e/reference-sites.js` loads each site, reads the page background, headline and body text, and the main
buttons, and takes a screenshot. The results are in `ui-redesign/palettes/reference-colours.json` and
`reference-sites.png`. The sites: Linear, Stripe, Vercel, Raycast, Mercury, Anthropic, Notion, Brilliant, Framer,
Resend, Ramp, Apple, Arc, Figma, PostHog (and read.cv, which was paused).

| Finding | Evidence |
|---|---|
| **The main button is near-black, not the brand colour** | Vercel `#171717`, Figma `#000`, Ramp black, Brilliant `#323232`, Resend black; on dark sites a light grey (Linear `#e5e5e6`, Raycast `#e6e6e6`) |
| **Brand-coloured buttons belong to big brands with a single famous colour** | Stripe `#533afd`, Mercury `#5266eb`, Notion `#0075de`, Apple `#0071e3` |
| **Pages are near-white, or warm paper** | Vercel `#fafafa`; Apple, Notion, Figma `#fff`; **Anthropic `#faf9f5` with `#141413` ink**, almost our cream. Paper is not the problem |
| **One vivid accent, used as a small signal next to black** | Ramp: a bright yellow-green "See a demo" beside a black "Get started". PostHog's amber buttons everywhere read playful, not premium |
| **Dark-first reads as the premium developer look** | Linear `#08090a`, Raycast `#07080a`, Framer and Resend `#000`, Arc `#0b0b0b`; body text a soft grey (Linear `#8a8f98`) |
| **Serif headlines are set light** | Anthropic Serif 400, Resend (Domaine) 400, Brilliant 500. Our Fraunces is 600 |

**Conclusion:** what makes Tech Katta look cheap is **marigold as the button colour and the tint everywhere**, plus
heavy headings, not the cream paper or marigold itself.

### 5.2 Three directions (rendered: `pal2-landing.png`, `pal2-article.png`, `pal2-phone.png`, `pal2-before-after.png`)

| | Direction | What changes | Verdict |
|---|---|---|---|
| **P1** | **Paper & Ink, marigold as a signal** (Anthropic's paper, Vercel's buttons, Ramp's single accent) | Paper `#faf9f5`, ink `#141413`, **main buttons in ink** (white in dark), tints halved; marigold stays only for the logo, the thin underline under the headline (was a thick band), the current tab or row marker and the figures' working path; headings Fraunces 500 | **Chosen.** The biggest premium gain for the smallest change; still unmistakably Tech Katta |
| P2 | Pure white & black (Vercel, Figma) | No hue at all; figures go monochrome | Very clean, but loses the brand and the figures' "path that works" colour |
| P3 | Obsidian, dark first (Linear, Raycast) | Near-black by default, light-grey buttons, marigold accent | Striking for developers, but long articles read better on paper in daylight on phones; keep it as the dark theme's direction, not the default |

### 5.3 Decision and how to build it (one PR)

1. **Tokens** (`tokens.css` and `palette.js`): P1's light and dark neutrals and tints (values in `tools/palettes2.js`).
   Add `--button`, `--button-strong` and `--on-button` (ink in light, near-white in dark), and point every main-button
   rule (spec 20 §4.4: `.btn.primary`, `.pr-solve`, `.sv-submit`, `.lab-btn`, `.r-btn.primary`, `.acct-signin-link`,
   `.tour-next`, `.ll-score`, `.sd-copy`, `.pb-pick`, `.st-err button`, `.pr-primary`) at them. `--brand` stays
   marigold.
2. **Headline marker:** `.tk-mark` becomes a thin marigold underline (84–94 % of the line), not a band.
3. **Headings:** Fraunces 600 → 500 where it is used (spec 20 §4.2).
4. **Checks:** the theme test, AA contrast of every pair in spec 20 §4.1 (ink on paper 18.6:1), every page in light
   and dark, the figures (marigold stays theirs), the share card (reads `TOKENS`), and a new link preview image.
5. Spec 20 §3.3 ("Brand colour: marigold with ink text on it") changes to "marigold is the signal; buttons are ink".

## 6. Round 3: the owner likes brilliant.org (2026-11-13)

Owner: "I liked the brilliant.org website." Brilliant was studied in a browser: home and courses, desktop and
phone. Screenshots are in `ui-redesign/palettes/brilliant/`.

**What makes Brilliant feel premium** (measured):
- Restraint everywhere except one thing. The page is warm light grey `#f5f3f1` alternating with white sections; text
  is pure black, and secondary text is black at 40–60 % (`#666`-ish). Hairline borders `#e4e4e4`, no tints, almost no
  shadows.
- One vivid **pill** button: green `#29cc57` with white text, beside a white pill with grey text. Selected tabs are
  black pills. Every button has fully round ends (radius 54–9999 px), 46–48 px tall.
- Headline serif (CoFo Robert) at **500**, with **italic words for emphasis** ("*math* and *coding*") instead of
  colour. Body sans 400, light and roomy.
- The product shown as fanned, tilted lesson cards.

**P4 · Brilliant-inspired** (rendered: `pal4-landing.png`, `pal4-article.png`, `pal4-phone.png`; values in
`tools/palettes2.js` `brilliant`): the same structure as Brilliant, with our own brand colour.
- Warm grey page `#f5f3f1`, white cards, black ink `#0d0d0d`, grey secondary text, hairline lines, no yellow tints
  (the selected sidebar row is a soft grey).
- **Marigold as the one vivid pill** (our equivalent of Brilliant's green), ink text on it. All buttons are pills.
- The headline highlighter becomes **italic emphasis** ("System design, *explained.*"); headings at 500.
- Figures keep marigold and ochre for the working path. Dark: `#121212` page, the same single marigold pill.
- Not copied: Brilliant's green, its fonts, logo or illustrations.

**Decision: P4**, because it matches the owner's taste and the research (§5): restraint plus one signal. P1 stays the
fallback if a single marigold pill still feels too loud (P1 = the same restraint, buttons in ink).

Build (one PR, as §5.3, with these differences): keep `--brand` marigold on the main buttons; add pill radius to
buttons (`--r-btn: 999px`); neutral tints (the `brand-tint` and `accent-tint` family to warm greys); `.tk-mark`
becomes italic emphasis; headings at 500; then the same checks as §5.3 (contrast, every page in light and dark,
figures, share card, link preview).

### 6.1 As shipped (#334)

- `tokens.css` / `palette.js`: P4 light and dark values (see §6); `--faint` is `#6b6b6b` (4.81:1 on the page; the
  rendered `#707070` was 4.47). New `--r-btn: 999px` on the 15 button rules that used `--r-md`.
- Fraunces headings at 500 (32 rules). `.tk-mark` is italic emphasis; its highlighter animation was removed. The
  marker colour (`--mark`) stays for read aloud, a passed verdict and a fresh solve.
- Contrast: all 18 checked text pairs are at least 4.5:1 in light and dark.
- Not changed yet: the link preview image (`og-2026-11.png`) still shows the old look. The share card follows the
  tokens.

## 7. The expert's notes, shipped (#335, squash `f0706d411926d11d116b316242f1719ecc1ed917`)

Owner: "Think. Make changes. Push to production. Make the website premium. Also the suggestions from the industry
expert: there is a lot to read. The website should be less textual and more graphics, animations. The yellow
marigold is not looking premium I think."

**Colour (decided):** no marigold anywhere.
- Main buttons are black pills (white in dark), as on Vercel, Figma, Ramp and Brilliant (§5.1).
- One accent, indigo `#4f46e5` (dark `#a5a1ff`), as on Linear and Stripe, for links, the active tab, focus, the
  figures' working path and the step dots. It clashes with no status colour (green, orange, red).
- The figures' glints, request halos and glows use the accent's mid tone (`figs/parts.jsx` imports `ACCENT_MID` as
  `GLOW`); the landing figure's highlighted cells are indigo with white text.
- The marker (read aloud, a passed verdict, a fresh solve) is a soft indigo `#dfe1ff`.
- Favicon, `theme-color` and the no-flash page colours follow. Every new text pair is at least 4.5:1 (accent on the
  page 5.7, on white 6.3; dark accent 8.2).
- Token roles keep their names (`--brand` now means "the main button": black), so nothing else had to move.

**Fewer words, more pictures (decided):**
- **Picture cards** in every section list: the article's first figure, still and small (`Thumb` in
  `dashboard/figure.jsx`, loaded when the card nears the screen), the short title (the part before ":") and two lines.
  The article list carries `fig` (backend `content/store.js`, tested).
- **"Figures only"** on every article, beside Share: hides the paragraphs, lists, tables, asides and "Go deeper", and
  keeps the headings, figures and captions. It is remembered (`tk-skim`); event `article_skim {on}`. Caching goes
  from 23,393 px tall to 8,969.
- **Landing copy** cut from 217 words to 92 (hero line, "What's inside" cards, IND vs PAK intro).

**Verified on production** (desktop and Pixel 7, light and dark): black/white pill main button, the short hero
line, picture cards on Concepts, no sideways scroll, no page errors. Locally: `tools/e2e/premium-look.js` 12 and the
earlier suites (swipes-practice 29, motion-polish 14, swipes-figures 25, state-scenes 8, phone-figures 33 articles).
Picture: `ui-redesign/palettes/premium-live.png`.

**Next, to go further on "less textual":**
1. Open phones in "Figures only" the first time and let readers switch to the text, if `article_skim` shows people
   prefer it.
2. Shorten section introductions and the Interview Questions guide cards (about 40 words each).
3. A new link preview image in the new look.
