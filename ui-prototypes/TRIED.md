# Prototypes already tried

Newest first. Each entry: where it lives, what it showed, what happened. Before this folder existed, redesigns were
tried directly in the real app; those are summarised at the end so a new prototype doesn't repeat them.

---

## Live on prototype.katta.cc

### `/p/full-site/`: the premium revamp as a structured frontend (Full site)

- **Source**: `frontend/prototypes/full-site/` (branch `prototype`). Structure and decisions:
  `frontend/prototypes/full-site/README.md`.
- **Style**: Podia-inspired, chosen after research (38-PREMIUM-REVAMP-RESEARCH.md §9). The owner liked Podia's
  older landing ("The screenshot that I gave you was better right").
  - Page `#F6F5F1`, white cards, ink `#17161A`, black pill buttons, marigold `#FFC233` for the TK mark and highlights.
  - One soft colour per section: Concepts blue, Components orange, Interview violet, Problems green, Real Systems
    coral, Quick Notes yellow.
  - Instrument Sans, with Source Serif 4 italic as an accent ("System design, *explained.*") and Geist Mono labels.
- **Screens**: landing, Home (dashboard), Learn hub, every section, the lesson reader (Caching in full, others as a
  sample), Problems, the workspace (URL shortener), You (account and settings), not found, the sign-in dialog.
- **How it got here** (all 2026-11-15):
  1. `revamp-2026-11-15.html`: one clickable HTML file with landing, dashboard, section, lesson, Problems,
     workspace and sign-in. Renamed `full-site` when the owner asked for names by type; the old address redirects.
  2. The motion system from `/p/motion/` applied ("apply these animations to the full-site prototype"):
     - landing: hero words rise, cards rise into their tilt, shapes drift, sections reveal, the judge card runs its
       tests when seen;
     - app: bars fill, numbers count up, today's streak fills;
     - lesson: figure stepper, sliding Cards / Full text, Mark complete burst;
     - workspace: sliding tab underline, requests travel the canvas on Run, Submit judges then scores;
     - overlays: sign-in dialog and sheet, toast.
  3. "Work more on it": every control made to work, among them:
     - search with ⌘K, the Tour, Share, a video player with captions, Cards mode, Pick one for me;
     - workspace tabs (notes, hints one at a time, Solution unlocks after Submit, Submissions), timer, palette drag;
     - Ask the interviewer drawer.
  4. "Think more on the dark mode / make the frontend as if we are going to switch to this, proper folder
     structure / think more on navigation":
     - Rebuilt as `index.html` + `styles/` (tokens, base, components, layout, pages, motion) + `scripts/` (core,
       components, pages, data, ES modules). Each page module is shaped like a React route component.
     - **Navigation**:
       - sidebar with section progress, folding to a rail with `[`;
       - lesson and workspace pages: a drawer, breadcrumbs, previous / next;
       - phone tab bar (Home, Learn, Problems, Search, You) that hides on scroll; ‹ goes up a level; Back restores
         the scroll position;
       - search with recent pages; Learn mega menu and phone sheet on the landing;
       - `?` and `g`-key shortcuts; a 404 page.
     - **Dark mode**:
       - System / Light / Dark, set before first paint;
       - warm near-black (`#121110` / `#1A1917` / `#23211E`), depth from lighter layers;
       - section blocks become deep hues with a bright accent edge;
       - every text pair at least 5:1; cross-fade on switch.
- **Owner's feedback so far**: asked for the motion, then more work, then structure, dark mode and navigation (above).
  Nothing rejected yet. Not built into the real app ("dont make changes in tech-katta now").

### `/p/motion/`: the motion system (Motion)

- **Source**: `frontend/prototypes/motion.html`.
- **What**: 25 live demos in six groups (tokens, arrive, respond, learn, canvas, navigate, feedback), a speed control
  (0.25×–2×) and a reduced-motion switch. Includes a review panel crediting Emil Kowalski's skills
  (github.com/emilkowalski/skills, MIT): the owner found it ("check if this is worth for you"), and it was worth it.
  Its review-animations and choreograph rules shaped the system:
  - no bounce on hover or press;
  - press `scale(.97)`, 160 ms;
  - non-uniform staggers;
  - transform and opacity only;
  - drawers on the iOS curve;
  - interruptible toasts;
  - nothing below `scale(.9)`.
- **What went wrong**: the owner said "most of the motions dont work". The site's CSP was blocking the inline script
  (it had only been tested from `file://`). The fix was the build step that moves inline scripts into `page-N.js`, and
  the rule to always test under `wrangler dev` (README §3.6).

### The app itself at `prototype.katta.cc/` and `/dashboard/`

- The real React app from the `prototype` branch. First with content bundled at build time (`/proto-api/*.json`) and
  sign-in off; since 2026-11-15 it reads the live `tech-api.katta.cc` (owner: "use the actual tech-api.katta.cc from
  now on") and opens signed out (README §1).

### `/p/dark-modes/`: four dark palettes side by side (Colour)

- **Source**: `frontend/prototypes/dark-modes/`; the palettes also live in `full-site/styles/dark-candidates.css`, chosen with `?dark=a|b|c` or the Screens menu.
- **Why**: owner, 2026-11-15: "light theme is brilliant. but i did not like the colour schemes for the dark mode". Diagnosis: deep brown, olive and maroon blocks read as muddy, and the warm brown-black backfired.
- **Options**: Now (current); A pastels on ink (neutral black, the light theme's pastels dimmed ~12 %, dark text on colour); B tinted glass (charcoal, a faint wash of colour, bright edges and titles); C midnight (deep navy, near-full pastels, marigold glows).
- **Round 1 outcome**: owner: "A · Pastels on ink is still better … but i am still not convinced", then "its dull". Why: the light theme's pastels are low in saturation; on black they look grey, A dimmed them further, and nothing else on the page had colour. Also learnt: orange, yellow and coral cannot be dark fills (they turn brown, olive, maroon), which is what made the current dark and B muddy. B and C dropped.
- **Round 2** (same page): A (reference), **F · Vivid** (A's blocks with saturated sky `#78C2F2`, orange `#FFA24C`, violet `#B892FF`, mint `#5FD6A4`, coral `#FF8F73`, yellow `#FFD452`, dark text, warm graphite base `#131312` / `#1C1C1A`), **D · Colour as light** (dark cards; the same vivid colours glow in a corner and light the title, a 2 px top edge and the progress bar), Now. Owner picked **F**, "but still think more on this".
- **Round 3**: F, **F2 · Vivid, balanced**, D, Now. F2 fixes F's flaws found by measuring in OKLCH: uneven weights (L .74 violet to .88 yellow; F2 puts all at L .80, chroma up to .14, yellow a little brighter as lemon `#EADB58` because yellow at equal L reads mustard); Quick Notes yellow almost equal to the marigold brand (now lemon, hue 103 vs 83); Problems mint almost equal to Passed green (Problems teal `#3FD9AE`, Passed leaf `#75D079`); muddy 13 % tints (now neutral `#232321` with a 3 px coloured edge); filled difficulty chips (now outlined); section headers 10 % darker. Colours: concepts `#6ACAFF`, components `#FAAA51`, interview `#CCABFE`, real `#FFA384`. **Decided: owner, "F2 it is, make it the dark theme".** F2 is now full-site's dark theme (`tokens.css` + `cards.css`); the comparison page was retired and `/p/dark-modes/` redirects to `/p/full-site/`.

### `/p/neo-brutalism/`: the whole site in a neo-brutalist style (Visual style)

- **Source**: `frontend/prototypes/neo-brutalism/` on the `prototype` branch (commit 4377d40), built exactly from
  `ui-prototypes/neo-brutalism-spec.md`. Live 2026-11-15 at https://prototype.katta.cc/p/neo-brutalism/.
- **Look**: the same site as `/p/full-site/` (same screens, routes, navigation, interactions, dark mode and phone
  layout) restyled neo-brutalist: flat saturated colour blocks, 2 px black outlines and hard 4 px offset shadows with
  no blur, Archivo Black headlines, Space Mono labels, sticker chips, and buttons that press into their own shadow
  like physical keys. The palette leans on Indian street signage and chai-stall posters (cream `#FFF4DC` page,
  marigold keys, lime highlighter); dark is `#121212` with cream outlines. Lesson text and the canvas stay calm.
- **How it is built**: a style layer, not a new app. `index.html` is full-site's with the head changed (body
  identical); it loads full-site's scripts and all twelve of its stylesheets from `/p/full-site/`, then three of its
  own (`styles/tokens.css`, `brutal.css`, `phone.css`). Nothing in `full-site/` changed.
- **Checks**: every route light/dark, desktop/iPhone 13, no errors or sideways scroll (local and live); 15
  interaction checks (local and live); contrast lowest 5.43:1 light, 6.23:1 dark.
- **Status**: waiting for the owner's look.
- **Open questions for the owner**: loud everywhere, or calm reader (current)? Headlines in Archivo Black (current)
  or Space Grotesk?
- **Deviations from the spec**: none.

Original proposal to the owner (2026-11-15):

- **Look**:
  - flat saturated blocks, 2.5 px black outlines, hard `4px 4px 0` shadows, square-ish corners, sticker tags;
  - Indian street-sign and chai-stall palette on cream `#FFF8E7`;
  - section colours sky `#7CC6FE`, orange `#FF9F1C`, violet `#B79CFF`, green `#3DDC97`, coral `#FF6B6B`, yellow
    `#FFE66D`;
  - text on colour always black.
- **Headlines**: Archivo Black or Space Grotesk (owner to choose).
- **Motion**: buttons press into their own shadow (4 px), hover grows the shadow to 6 px, 100–150 ms.
- **Dark mode**: near-black page, cream outlines, shadows in the section's colour.
- **Loudness**: on the landing and app chrome. The reader and canvas stay calm, because long reading tires under
  brutalism.
- **Build**: reuse full-site's scripts unchanged (`/p/full-site/scripts/main.js`) and write only new `styles/`. That
  also proves a new look is a new style layer, not a new app.
- **Open questions for the owner**: how loud (everywhere, or calm reader), and which headline font.

## Tools tried for mock-ups (2026-11-15), before HTML prototypes

| Tool | Result | Why we moved on |
|---|---|---|
| **Figma** (MCP connector) | A start was made on whole-site mock-ups | The Starter plan's MCP call limit was reached, and Figma doesn't take UPI for an upgrade (owner). |
| **Canva** (MCP connector) | A test design was generated | Not suitable: text came out doubled and layouts weren't controllable. Free-tier limits also checked. |
| **Claude artifact** (`tech-katta-context/ui-redesign/prototype-2026-11-15/tech-katta-revamp.html`) | One HTML page shown as an artifact | The owner couldn't judge it inside an artifact. This led to prototype.katta.cc. |
| **Mobbin** (connector) | Checked as a research source | Useful for real app screens; see 38-PREMIUM-REVAMP-RESEARCH.md §8. |

Decision: **HTML prototypes on prototype.katta.cc**. They run in a real browser and on the owner's phone, can be
shared by link, and are built from the same tokens the real frontend would use.

## Redesigns tried earlier in the real app (before prototypes)

Shipped to tech.katta.cc, one after another. A new prototype should know what was already tried and why it changed.

| Doc | Date / PR | Direction | What happened |
|---|---|---|---|
| 20-UI-REDESIGN-SPEC.md | 2026-11 | First full spec: "Katta Paper" (warm paper, ink, marigold) | Base of everything since |
| 24-UI-UX-SWIPES-ANIMATIONS-GRAPHICS.md | 2026-11 | Swipes, animations, graphics | Mobile swipe gestures and figure motion |
| 25-PREMIUM-COLOUR-OPTIONS.md | 2026-11-13, #335 | Colour rounds A–D | An industry expert said marigold isn't premium and there was too much to read: black pill buttons and an indigo accent instead |
| 26-STAGE-DARK-FIRST-LAYOUT.md | 2026-11-13, #336 | "Stage": dark first, layouts A Night / B Stage / C Studio | Stage shipped |
| 27-TOPIC-CARDS-AND-LIGHT-THEME.md | 2026-11-13, #337 | Articles as topic cards; a light theme that holds together | Shipped |
| 28-KATTA-PAPER-COLOURS-BACK.md | 2026-11-13, #338 | Katta Paper colours back on the new layout | The owner wanted the old colours back with the new layout |
| 30-PREMIUM-RENOVATION.md | 2026-11-14 | Type (Instrument Sans, Source Serif 4, Geist Mono), motion, surfaces | The owner: the old font "looks like vibe coding" |
| 33-LIGHT-THEME-COLOURS.md | 2026-11-15, PR #365 (draft) | Light theme "Marigold & Navy" | A reviewer "hated" the old light theme. Not merged |
| 37-UI-UX-REVIEW-FIXES.md | 2026-11-15, PR #365 (draft) | Reviewer's points (plain-words landing, read-aloud removed, back to top, grammar, cards past the sign-in box, stars, difficulty balance, logo) | Not merged; conflicts with main since #366 |
| 38-PREMIUM-REVAMP-RESEARCH.md | 2026-11-15 | Research on premium course sites, Podia | Led to full-site |

Lessons from that history, for the next prototype:

- **Colour has been changed many times.** Show colour in a prototype with both themes before touching the app.
- **The owner reacts to the real thing.** Static images and artifacts didn't land; a clickable site on a phone did.
- **Keep content, widgets, tabs and the canvas working the same.** The owner's standing rule for the revamp is to
  change the look, not how things work.

### Light theme follow-up (2026-11-15)

Owner: after the dark change, "when i … change the theme to light theme the colours becoming dull". Cause: not a switching bug (fresh and switched light pages get identical tokens) but the light pastels themselves: chroma from .047 (concepts, nearly grey) to .129, uneven, and faded next to the vivid dark. Fix: the same hues as the dark at one lightness (OKLCH L .85, notes .90), chroma up to .105: concepts `#95D8FF`, components `#FDC082`, interview `#D8C0FF`, problems `#82E4C3`, real `#FEBCA6`, notes `#EBE18E`; tints `#E2F7FF` `#FFF0E0` `#F7EFFF` `#E2FAF0` `#FFEEE6` `#F7F5DF`. Dark text on every block at least 11:1.

### Neo-brutalism round 2 (2026-11-15)

Owner: "think more … add more details, add more animations; the dark theme especially is not up to the mark". Diagnosis: the first dark drew every line in cream (cards, dividers, rows, bars, panel edges) and gave static cards cream shadows, which read as second borders: a glowing wireframe with little colour. Fix: cream outlines only on objects, structure in a quiet warm grey (`--rule` `#3B3934`), warmer page `#121110`; a hard shadow means "pressable" (none on static cards in dark, 2 px in light). Added colour sticker labels, halftone on big blocks, a landing ticker, boxed lesson numbers, a DONE stamp; motion: highlighter wipe, sticker slap, running ticker, stepped progress bars, stamping nav and filters, shutter theme change. Files: `neo-brutalism/styles/details.css`, `motion.css` (README "Round 2"). All checks pass locally and live.

### Neo-brutalism round 3: calmer colours (2026-11-15)

Owner: "Calmer colours for neo-brutalism please on both light and dark". Same hues at about half the saturation, even lightness (OKLCH L .82, chroma ~.085): concepts `#8FCDF5`, components `#EFB78E`, interview `#CBB9F5`, problems `#8CD6BA`, real `#F7AFAB`, notes `#DCE29E`, keys `#F3C766`; page `#F8F2E5`, surfaces `#FFFDF8`, ink `#1C1B1A`; dark outlines `#D9D1C0`, text `#EDE6D6`. Structure, shadows and motion unchanged.

### Neo-brutalism dark: still not appealing (2026-11-15, thinking only)

Owner, after round 3: "Don't implement just write it in the docs … The dark theme is not appealing in Neo brutalism.
Think on that." The analysis and the next options are in **`ui-prototypes/neo-brutalism-dark-thinking.md`**.

In short: brutalism is ink on paper, and inverted it becomes neon on black. Light shadows are physically wrong. Calm
pastel blocks still jump 11:1 off the page, the bright area is about a third of Home, the hierarchy flips, and there
are no mid-tones. Directions to test on a comparison page:
- **B Chalkboard**: slate surfaces, chalk outlines, shadows darker than the page;
- **D′ Inverted blocks**: dark cards with thick coloured outlines and darker coloured shadows;
- **E Dim paper**: lamp-lit, black ink kept.

Nothing built yet.

### Neo-brutalism dark: three candidates built (2026-11-15)

Owner: "Start implementing it" (the plan in `neo-brutalism-dark-thinking.md`). Built:
- **`/p/nb-dark/`**: four columns, the same pieces each: Now, **B chalkboard**, **D inverted blocks**, **E dim paper**; one column at a time on phones.
- **On the prototype itself:** `?nbdark=b|d|e` (or `now`), or the small "Dark" switch at the bottom right in dark mode (`styles/dark-candidates.css`, `scripts/nbdark.js`).

What each does:
- **B:** slate-green tones `#1E2A25` / `#26352F`, chalk outlines `#C9D3CB` (8.4:1), shadows `#0E1513` darker than the page.
  - Small blocks become chalk cards with a coloured title, an underline and bars.
  - Only the hero cards and section headers keep a fill, dimmed 20 %.
- **D:** cards `#1C1B19` with a 3 px outline in the section colour and a solid shadow in a darker shade of it. Colour is carried by lines, so the bright area is smallest.
- **E:** page `#3A352E`, cards `#5C5549`, black ink outlines and shadows (3 px), cream text 6.3:1, calm pastels with dark text. Black on the dim cards is only 2.7:1, offset by thickness.

Checked: every route in all four palettes, desktop and phone, no errors or sideways scroll; 15 interaction checks; the switch; also live.
Not yet decided: **the owner picks.** The winner moves into `neo-brutalism/styles/tokens.css` and `dark-candidates.css`, `nbdark.js` and `/p/nb-dark/` are retired (with a redirect).

### Neo-brutalism dark: D chosen and finalized (2026-11-15)

Owner: "Finalize option D". Neo-brutalism's dark theme is now **D, inverted blocks**: the section blocks are dark cards `#1C1B19` with a 3 px outline in the section colour, a solid shadow in a darker shade of it, coloured titles and bars; page `#131211`; cream outlines on objects, quiet grey for structure. Rules live in `neo-brutalism/styles/tokens.css` (dark block) and the end of `styles/details.css`.
- **Removed:** `dark-candidates.css`, `scripts/nbdark.js` (the Dark switch) and `frontend/prototypes/nb-dark/`. `/p/nb-dark/` now 301s to `/p/neo-brutalism/`.
- **Rejected:** B chalkboard and E dim paper (kept as ideas in `neo-brutalism-dark-thinking.md`).
- **Lesson:** a style's dark theme needs its own physics. For brutalism: shadows darker than their object, colour as lines not paint, and a small bright area.
- **Checks:** every route in light and dark, desktop and phone; 15 interactions; contrast; local and live.

### Neo-brutalism built into the real app: /p/neo-brutalism (2026-11-16)

The scheduled task's step 2 ("as we did for /p/next, create /p/neo-brutalism, production ready"). The owner said "continue" while sign-in on /p/next still waited on PR #368.
- **What it is:** the new frontend (`frontend/next`) itself, with the same pages, API, figures, gestures and motion. It is built a second time with `VITE_STYLE=neo-brutalism`.
- **How the look is switched:** the build puts `data-style="neo-brutalism"` on `<html>`. `src/styles/themes/neo-brutalism.css` holds the tokens (round 3 light, dark D), fonts and type. Each `*.module.css` has a neo-brutalism block for its own pieces. Without the attribute nothing changes, so /p/next and tech.katta.cc/next/ are untouched.
- **Decisions carried over:**
  - round 3 calmer colours;
  - dark D, "inverted blocks";
  - Archivo Black headlines and Space Mono labels;
  - keys that press into a 4 px hard shadow;
  - sticker chips and toast, stepped progress bars, boxed lesson numbers;
  - a calm reader.
- **Not carried over:** the mock-up's landing ticker and halftone texture, because the app's landing has no such elements.
- **Owner's open questions:** still open. Loud everywhere, or calm reader (calm for now)? Archivo Black or Space Grotesk (Archivo Black for now)?
- **Mock-up:** the static design mock-up moved to `/p/neo-brutalism-mockup/`.


### Neo-brutalism figures and motion, redesigned (2026-11-16)

Owner: "You have copied the animations from the katta even with their colour scheme. You had to redesign the animation tailored to neo brutalism … Do this for every figure/animation." Done in `4bc0eec`. Everything below applies only in the neo-brutalism build; the default look is unchanged.
- **Figures:** all 232 lesson figures, the landing figure, the card pictures, the library minis and the scenes.
  - **Palette:** ink outlines and sticker fills. The working path is cobalt on sky, the request and highlights are marigold, trouble is coral with red ink, good is mint. Archivo and Space Mono. Dark D.
  - **Shapes:** 2 px square-capped lines and hard shadows under boxes. The frame has a marigold title bar, key buttons and square step marks.
  - **Motion (`figs/parts.jsx`):**
    - a packet is an outlined square chip that ratchets along in three hops (the default look uses a glowing dot that glides);
    - a working line carries a marching conveyor dash (instead of a soft glint);
    - a highlight stamps on as an ink outline with a marigold offset (instead of a glow);
    - a step cuts in with a 3 px key-press jolt (instead of a fade).
- **App motion (`styles/looks/neo-brutalism/motion.css`):**
  - arrivals drop onto their shadow;
  - hero words slap down;
  - done, stars and today stamp in;
  - bars and marks count up in steps;
  - the shapes tick and the spinner ratchets;
  - loading is a marching hatched block;
  - the burst throws square outlined confetti;
  - page and theme changes are a stepped shutter.

### Neo-brutalism: figures in the cards' colours, and no shrunken figures (2026-11-16, 8:15 am run)

Owner: "Colour scheme of the figures should match the colour scheme of the cards. Also the zoomed out version of figures is not looking good … Take a decision of how to keep figures." Done in `5b4be8b`.

**Decision:**
- **Colour:**
  - In each section, a figure's path that works is filled with that section's card colour and drawn in a deep ink of the same hue (Concepts sky, Components orange, Interview Questions violet, Problems mint, Real systems coral, Quick Notes lime).
  - Trouble is the coral, good the mint, and requests and highlights the marigold.
  - In dark, the section colour is the line and the fill is a dark tint of it.
  - The rules are in `figureTokens.module.css`, keyed by `[data-accent]`.
- **Size:** a figure is drawn only where it can be read: lessons, full screen, the topic sheet, the landing figure, and Cards mode (now one wide card per row).
  - Cards and thumbnails show a **MarkSticker**: the section's mark drawn large in ink on a tile in the card colour, with a halftone and the lesson's tag.
  - Lesson rows have no thumbnail.
- **Also added from the mock-up:**
  - the hero highlighter wipe;
  - a running ticker of live counts;
  - stamping keys;
  - DONE stamps, sticker labels and halftone;
  - quarter-turn shapes;
  - a marigold print shadow on lesson titles.

### Card pictures: a small figure drawn for the card (2026-11-16)

Owner, with marked screenshots of Home and Learn on a phone: the lone section icon "looks so empty… same with /p/next… smaller figures will make sense".

Decision, in both looks: **SectionMini**.
- **What it shows:** the section's mark, then a short path through the section's real lessons: the one to read next and the two after it. A request travels along the line, the current lesson is filled with the card's colour, and finished ones carry a tick.
- **Readable at card size:** it is drawn for the card, not shrunk from a figure. The labels are text and wrap to two lines. Narrow cards stack the path, and from 300 px wide it runs sideways.
- **Home's Continue card** shows the lesson you are on between its neighbours.
- **Neo-brutalism:** outlined boxes, a tilted mark sticker, and a square chip that hops box to box.
- **Commits:** `ce2b659` (prototype) and `f3748fb` (PR #367).

### 3D scroll story: /p/scroll-3d/ (2026-11-18, 00:00–00:40 IST)

Owner, after looking at rca.gg: "On scrolling down the background animation changes … That is soo cool", then
"create a new prototype at prototype.katta.cc which will follow the colour schemes [and] 3d animations of rca.gg".
- **What it is:** a Tech Katta landing page whose background is one isometric 3D scene of a URL shortener. Six
  screens: hero, 01 the spike (IND vs PAK, 40,000 opens a second), 02 it breaks (the only cache dies, the database
  overloads, a blinking SEV-1 tag), 03 find the cause (the camera flies to the database, its layers pull apart with
  readings, log lines), 04 fix it (a second cache and a read replica, paths turn green), 05 your turn.
- **Taken from rca.gg:** the colours (lavender page, one violet accent, orange only for broken, green only for
  fixed), Manrope + IBM Plex Mono, thin-plus-heavy headlines, translucent stacked blocks, dotted paths with moving
  dots, label pills, a 01 / 05 progress bar, one camera moving between chapters. **Not taken:** their words, logo,
  story or images.
- **Decision:** the scene is one SVG with an isometric projection computed in `scene.js`, not CSS 3D or WebGL:
  crisp edges, upright labels, no libraries (the CSP allows only same-site scripts), works on any phone.
- **Checked live** (desktop 1440×900 and Pixel 7, light and dark): every screen, no page errors, no sideways
  scroll, "See how it works" and the next button scroll to the right chapter, the theme switch cycles, reduced
  motion shows final states with no camera move, dots or blinking.
- **To look at:** whether the 3D feels as good as rca.gg's; the chapter 3 database pulling apart; dark mode; the
  phone layout (scene on top, text below). Open: the hero scene starts low on short laptop screens.
- Commits `0d4c2d7`, `8cf97d3` on `prototype` (ledgered). Folder README explains how to add a chapter.
- **Round 2, real WebGL (2026-11-18).** Owner, comparing with rca.gg: "Theirs look sooo good!! Fix everything".
  The flat SVG lacked depth, light and shadow. Rebuilt with three.js 0.170 (vendored in the folder, since the CSP
  allows no CDN): soft shadows, translucent rounded slabs with outlines, a glossy database, fog, a faded grid, an
  orange glow and pulsing ring on broken parts, green on fixed ones, instanced request dots, and a camera that scrubs
  with the scroll between chapters (damped). Labels stay HTML pills, placed from 3D each frame. Also: lighter
  headline weights (300 / 600), a hero "break." filled with live log text, chapter reveal, a scroll progress line.
  Desktop: the scene fades out under the text column. Phone: scene in the top 46 %, only broken/fixed labels.
  The SVG scene stays as the fallback without WebGL. Checked live: desktop and Pixel 7, light and dark, no errors,
  no sideways scroll. Commits `3c326b9`, `5e7b2ba` (ledgered).

### Soft 3D: the whole app in an rca.gg-like look, /p/soft-3d/ (2026-11-18)

Owner: "As we created full fledged prototypes on prototype.katta.cc create a new prototype with this design similar to
rca.gg".
- **What it is:** the real new frontend (`frontend/next`, the code of tech.katta.cc), built in a third look,
  `VITE_STYLE=soft-3d`, the same way `/p/neo-brutalism/` is. Every page works: landing, Home, Learn, lessons, Quick
  Notes, Problems, the workspace, You (signed out on the prototype site, as always).
- **The look** (`frontend/next/src/styles/looks/soft-3d/`): the scroll-3d palette (lavender page with a faint grid,
  one violet accent, orange only for broken, green only for fixed), Manrope + IBM Plex Mono, dark pill buttons,
  glass sidebar and bars, hairline cards with a soft violet shadow, softer section pastels, the lesson's brand
  colour (Listen, highlights) violet. Light and dark.
- **The landing** opens with the scroll-3d story (`pages/landing/Story3d.tsx` + `scene3d.js`, three.js from npm):
  six chapters over a sticky WebGL stage, the camera scrubbed by scroll; then the usual landing bands. Loaded only in
  this build: the default and neo-brutalism bundles carry none of it (checked). Without WebGL the chapters read alone.
- **Also:** the prototype branch's `frontend/next` styles were brought up to `main`, so `/p/neo-brutalism/` now
  matches production.
- **Checked live:** desktop 1440×900 and Pixel 7, light and dark: landing story, Learn, a lesson, Problems, the
  workspace, You; no page errors, no sideways scroll; axe colour contrast (two misses fixed in `0eb7a0f`).
- **To look at:** whether the app pages feel as calm as rca.gg; the section card colours (softened; dark mode is
  still vivid); the phone story (scene on top, words below).
- Commits `99f9d92`, `df276d9`, `0eb7a0f` on `prototype` (ledgered).

### Neo-brutalism goes to production, calmer (2026-11-18)

The owner showed neo-brutalism to two people; both liked it, one found it "too gamified". The production version
(tech.katta.cc, PR #372) drops the tilts, sticker labels, slap and bounce motion, confetti, halftones and the reader
title shadow; headings are Archivo Bold; one 3 px shadow; one control height. Settled: a calm reader everywhere, and
Archivo Bold rather than Archivo Black or Space Grotesk. Details and the audit: `47-NEO-BRUTALISM-PRODUCTION.md`.
