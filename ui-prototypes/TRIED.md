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
- **Outcome**: waiting for the owner's pick. The winner moves into full-site's `tokens.css` and `dark-candidates.css` goes.

## Planned

### `/p/neo-brutalism/` (not built yet)

Proposed to the owner on 2026-11-15:

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
