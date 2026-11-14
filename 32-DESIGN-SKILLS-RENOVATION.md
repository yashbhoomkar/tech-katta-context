# 32 — Design skills renovation (Geist, one curve, flat surfaces, a new landing)

Written 2026-11-14 by session `ccr-62d2475b-x6ro8o`. Owner's words, before sleeping: "https://github.com/elayadesign/ai-design-skills
— Try to use these skills. Deploy the code on production. I am going to sleep now. Surprise me with the best website
for system design i.e. our website Tech Katta."

**Status labels:** Decided (by this session, on the owner's instruction to use the skills and deploy) · Built · Left for later.

---

## 1. The skills

The repository has two skills plus a companion repo the README points to for existing sites:

| Skill | Used for |
|---|---|
| `landing-page-design` (elayadesign/ai-design-skills) | Part A: page structure (hero, proof, benefits, how it works, FAQ, final CTA), copy rules. Part B: the visual system (type, spacing, radius, backgrounds, hero heading, icons, motion, tagline reveal, states, ship list) |
| `redesign-existing-projects` (elayadesign/redesign-skill) | The audit of an existing site and the fix order: font, surfaces, states, layout, motion, components, copy, type scale |
| `figma-designer` | Not used (no Figma) |

The skills were read from the cloned repos (they were not installed into `.claude/skills/`; the owner can run
`npx skills add elayadesign/ai-design-skills` to have them in every session).

## 2. Diagnosis (the redesign skill's audit on production, `9a89daf`)

1. Two typefaces (Instrument Sans + Source Serif 4) and an italic headline word: the skill allows one face (Geist,
   Manrope, Poppins; Geist Mono beside it only for code and numbers) and no italics.
2. About 160 different font sizes, many off any scale (13.5, 14.5, 17.5 px, clamps); spacing values like 10, 14, 18, 22 px.
3. Radial "glow" gradients behind the landing hero (light and dark): backgrounds must be flat.
4. Dark surfaces `#15140f` / `#1e1c16` / `#28261e`: not in the approved dark set.
5. Motion: an expo-out curve and a spring with overshoot, durations from 0.14 s; reveals tied to scroll position
   (`animation-timeline: view()`), which replay when you scroll back.
6. Landing: centred everything, a pill "New" chip, a filled button beside a ghost button, no FAQ, no closing call to
   action, no legal links on the landing, a header welded to the top edge, a text "MENU" button with a small dropdown.
7. Hand-drawn icons (the skill allows Phosphor, Solar, Iconamoon); a sun/moon switch.
8. Dashboard home: a row of three equal cards ("Explore").
9. No custom 404.
10. Uppercase mono labels in content ("FIG. 01 — KAFKA: …", "THE JUDGE · …", "TRY IT NOW").

## 3. Type (Decided, Built)

- **Geist** (variable, `@fontsource-variable/geist`, Latin file preloaded) for the interface, reading and headlines;
  `--font-display` now points at `--font`. **Geist Mono** stays for figures, code and numbers. Instrument Sans and Source
  Serif 4 are uninstalled. Fallback `TK Sans Fallback` = Arial at 102.3 %, ascent 98.7 %, descent 29.3 % (measured in
  Chromium against Geist).
- No italics anywhere (`em,i,cite,dfn,address,var{font-style:normal}`; emphasis in prose is weight 500 and ink colour).
  Headlines 600; `b,strong` 600.
- Every font size on the reading and interface stylesheets snapped to a Tailwind step (12, 14, 16, 18, 20, 24, 30, 36,
  48, 60): the **nearest** step (the skill says "the step below"; that turned all 13–13.5 px interface text into 12 px,
  so nearest was chosen, still on the scale); sizes under 12 px became 12 px; an explicit line height in a `font:`
  shorthand became the step's paired one. Files: `styles.css`, `dashboard/*.css` (not `figure.css`), `account.css`,
  `library.css`, `numbers.css`, `status.css`, `tour.css`, `problems.css`, `practice/review.css`, `theme/*.css`.
  **Not snapped:** SVG text inside figures and diagrams (any rule with `fill:` or a `text`/`svg` selector keeps its
  size: they are drawn to fit their boxes), and the tools (`solve.css`, `practice/practice.css`, `lab/lab.css`,
  `lablite.css`, `admin.css`), which only changed font and weight.
- Named steps in `tokens.css`: `--t-xs` … `--t-7xl`. The landing uses the skill's text styles (Heading 1 60/60 hero,
  Heading 2 48/48 tagline and closing, Heading 3 36/40 section titles, Body 7 18/28 descriptions and the reading view,
  Body 3 16/24, Title 2 18/28 FAQ questions).
- Reading view: 18/28 at a 36 em measure on desktop, 16/24 on phones; article h2 30/36, h3 20/28.

## 4. Spacing, radius, surfaces (Decided, Built)

- Padding, margin and gap px values snapped to 0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96 (nearest, ties up) in the
  same files as §3; tokens `--s-25` … `--s-900`.
- Radius: `--r-sm` 6, `--radius` 8, `--r-md` 12, `--r-lg` 16, `--r-xl` 24, `--r-full` 9999; buttons `--r-btn` 8 px
  (rounded-lg, not pills) with 8 × 12 px padding. Nested shapes take outer minus gap (the landing window 24 → diagram 12;
  dashboard cards 24 − 16 padding → picture 8).
- Flat backgrounds: the hero's radial glows and the white-to-paper gradient are removed. Light colours unchanged
  (Katta Paper, #338). Dark: page `#131209`, cards `#1F1F1F`, surface `#272727`, faint panels `#181818`, hover `#313131`
  (all from the skill's dark set; text and lines keep their warm values).
- The hero heading gradient: light `#000000 → #666666`, dark `#FFFFFF → #9B9B9B` (tokens `--hero-from`, `--hero-to`).

## 5. Motion (Decided, Built)

- One curve: `--ease: cubic-bezier(.22,1,.36,1)`; `--ease-spring` and `--ease-in-out` point at it.
- `--dur-fast` .2 s (the floor), `--dur` .3 s (colour, opacity), `--dur-move` .5 s (movement), `--dur-enter` .7 s
  (arrivals), `--rise` 32 px. Transitions without a curve now carry `var(--ease)`; animations under 200 ms raised to 200 ms.
- **Scroll reveals** (`theme/reveal.js`, CSS section 10 of `motion.css`): `[data-reveal]` blocks and the long dashboard
  lists rise 32 px and fade in once; siblings 60 ms apart (≤ 400 ms). One IntersectionObserver, a MutationObserver for
  blocks React draws later. The hidden state exists only under `html.tk-reveal`, set only when the observer exists
  and reduced motion is off; anything already above the screen is shown at once. Replaces the scroll-driven
  `animation-timeline: view()` reveals of #344/#347.
- Hero arrival: note, heading, line, actions, window, 60 ms apart.

## 6. The landing (Decided, Built)

Order: floating nav → hero (badge, gradient heading in two lines, line, one button + a text link, the Kafka window with
the judge) → numbers strip (proof) → **tagline** → What's inside (asymmetric bento) → **How it works** → IND vs PAK
(try it) → **Questions** → **closing call to action** → footer with Privacy and Terms.

- **Navigation:** a compact bar floating 16 px off the top, sized to its content, translucent with a blur. On phones
  (≤ 860 px) it spans the width; the menu button's two lines turn into a cross; open, the bar becomes a full-height
  panel and its links arrive one after another (24 px rise, 60 ms apart).
- **Tagline** (the skill's mandatory "tagline reveal"): "Read the idea. Draw the design. Then let real traffic, a dead
  server and the monthly bill tell you if it holds." Heading 2, left aligned, max 680 px; words start at 30 % opacity
  and turn full as they pass a line 62 % down the screen (one scroll listener, rAF-throttled, attached only while the
  section is on screen). Reduced motion: shown in full.
- **How it works:** three steps (Read the idea, Draw your design, Let the judge decide) beside a heading that stays in
  view on wide screens.
- **Questions:** seven, question beside answer (no accordion), every fact taken from the site's own copy (free with a
  Google account, the opening of every article readable signed out, progress in the browser and in the account).
- **Closing:** "Your next interview has a design question. Practise it here first." with the hero's button.
- Copy lives in `content/site.json` (`hero.titleLines`, `tagline`, `how`, `faq`, `final`, `footer.legal`); the code
  shows each section only when its key is present. Uppercase labels became sentence case; the one hyphen in landing
  copy ("4-second") was rewritten.

## 7. Elsewhere (Decided, Built)

- **Icons:** Phosphor (regular, MIT) paths copied into `theme/icons.jsx` (no runtime dependency): sidebar, collapse,
  back, close, the theme switch, arrows on the landing. The hand-drawn spec 24 section marks are kept in
  `dashboard/icons.jsx` for reference but no longer drawn.
- **Dashboard home:** "Explore" is a two-column grid on wide screens, the first card two rows tall.
- **404:** `frontend/public/404.html` (Vercel serves it for any unmatched path): floating brand bar, "Error 404",
  gradient heading, one button home, three section links; follows the visitor's theme (`theme-boot.js`); Geist from
  `/fonts/geist-latin.woff2`.

## 8. What the skills asked for that was not done, and why

- A sun/moon theme switch is listed as a cliché: kept (only the icons changed) — the owner uses it.
- "Skeleton loaders, not spinners": the site already uses skeleton lines for locked pages; the loading mark on first
  load stays.
- Testimonials, logos, risk-reversal badges: none exist and the skill forbids inventing them.
- The tools (canvas, Practice, problem workspace) keep their layouts (spec 30's rule); only font and weight changed.
- Cookie consent: the site sets no tracking cookies (sign-in only).

## 9. Results

| Part | PR | Squash |
|---|---|---|
| Design skills renovation | #355 | `ee9bb6a8c7cd62786de187be09937bfdb8edc9f2` (branch `240b809ad45e9509b0657399fa7dbbf953eb2067`; API release `20261114T113041Z-ee9bb6a`) |
| Header Sign in as a quiet button (one filled action above the fold) | #356 | `28a54b80a7d593ddc46d6b706a7538fae933d2d5` (branch `5336dec3d754c7115d97eb213a2e14509ba8f392`) |

Checked before merge: `npm test` 382/382, build clean, backend content loader accepts `site.json`, Playwright
(Chromium) screenshots 1440 and Pixel 7 in light and dark for landing, dashboard home, Concepts, an article, Problems,
404, the phone menu open; no sideways scroll, no page errors. `tools/e2e/no-lab.js` fails the same 3 checks on this build
and on production (outdated selectors; listed in 18-TODO). Not checked: Safari, Firefox, a real phone.

After merge (production): API `/health` shows release `20261114T113041Z-ee9bb6a`, `/v1/site` serves `tagline`, `how`,
`faq`, `final`; an unknown path answers 404 with the branded page; Chromium screenshots of production (1440 and Pixel 7,
light and dark, landing, dashboard home, Concepts, an article, Problems) show no sideways scroll and no page errors;
`no-lab.js` on production: 30 ok, the same 3 old failures.

## 10. Rollback

Vercel → Deployments → the deployment of `9a89daf` (#354) → Instant Rollback (frontend). The new `site.json` keys are
ignored by the old frontend, so the backend need not roll back. Or revert the squash commit on GitHub.
