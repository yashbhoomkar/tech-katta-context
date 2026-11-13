# 26 · Stage: dark first, and a layout that looks like a product

Date: 2026-11-13. Shipped in tech-katta #336. Follows 25 (colour rounds A to D, and the expert's notes in §7–§8).

## 1. Why

After #335 (black buttons, indigo accent) the owner still found the site "not premium":

- "Still the yellow (marigold) white colour scheme does not look premium at all."
- "I think the problem is with the white background. … we need to think on UI UX placement as well. It is also not premium."

A scan of production found almost no yellow left. What read as "yellow-white" was the warm off-white page and the
white browser bar. The deeper problem was **placement**: the site looked like a notebook, not a product.

## 2. What was wrong with the layout

1. **Two navigations.** The dashboard had top tabs and a sidebar listing the same six sections.
2. **Small mono capitals over every heading:** "FIELD NOTES / DISTRIBUTED SYSTEMS", "SECTION // 01", "21 PAGES", "START HERE".
3. **The dashboard home was a wall of text.** Its title was a list of sections over three paragraph cards. It had no "continue" and no progress.
4. **Section pages were stacked boxes of text.**
5. **The landing hero hid the product.** The figure sat small in a corner, and the judge (the thing only Tech Katta has) did not appear.
6. **The header was noisy:** Tour, theme and a "tech.katta.cc" chip.

## 3. Directions shown, and the decision

Three boards (`ui-redesign/15-17`), each showing the landing page and a new dashboard home:

- **A · Night:** dark everywhere.
- **B · Stage:** a dark hero and sidebar, a soft grey page and floating white cards.
- **C · Studio:** all light on mid grey.

The owner left the choice to us ("You decide"). B was built first. On seeing it, the owner wrote: "The upper part looks
great! Continue with it only", meaning the dark hero. So the site is now **dark first**:

- Dark is the default for every visitor (`theme-boot.js`, `theme/mode.js`).
- Light is a choice made with the theme button, and it uses the Stage light values (grey page, white cards).

## 4. What changed

### Tokens (`theme/tokens.css`, `palette.js`)

- **Light (by choice only):**
  - Page #eef0f3, cards #fff.
  - Cool lines: line #e2e5e9, line-soft #e9ebee, line-strong #c3c7ce.
  - Faint text #64646d, which gives 5.13:1 on the page.
- **`--card-shadow`** makes cards float on the grey. In dark it is a 1px line.
- **`.on-dark`** reuses the dark values on one element (the selector list is `.on-dark,:root[data-theme=dark]`). The landing hero, the landing header, the zoom dialog and the dashboard sidebar are dark in both themes.
- **The hero's Kafka figure** reads its slot colours from the stage element (`palOf`, `PAL` in `main.jsx`), so it draws dark colours even when the page is light.
- **Browser bar and first paint** are #09090b. In light: #eef0f3.

### Landing (`main.jsx`, `styles.css`, `site.json` hero and inside)

- **Centred hero** with:
  - a "New" chip (`hero.chip`, `chipText`, `chipHref`);
  - a 92px serif headline;
  - "Start learning" (opens `/dashboard/`) and "Try IND vs PAK".
- **Product window:**
  - The live Kafka figure sits in a window frame with an indigo glow behind it.
  - The judge's card (`hero.judge`) shows the URL shortener's real test names, ticked one by one, with ★★★.
  - On wide screens the card hangs beside the window. Below 1340px it sits under the figure.
  - The caption is kept for screen readers only.
- **Numbers strip** (`hero.stats`): problems, challenge stars, visual notes and 3.5 crore. The first three come from `/v1/site` counts and count up.
- **"What's inside" as four picture tiles** (`inside.items[].visual`), with no eyebrow and no count chips:
  - Interview Questions: the library diagram.
  - Problems: three test results.
  - Challenges: big stars.
  - Concepts: the CAP diagram.
- **Try it now:** a centred heading, with the canvas in a floating card.

### Dashboard (`dashboard/shell.jsx`, `stage.css`, `pages.jsx`, `article.jsx`)

- **Navigation:**
  - The sidebar is the only navigation. It is dark, has a new **Home** row, and no "SYSTEM DESIGN LIBRARY" label.
  - The top tabs and the "tech.katta.cc" chip are gone.
  - On phones the header shows the logo next to the menu button.
- **New start page** (`dashboard.home` copy):
  - A greeting.
  - **Continue reading:** the last article opened, with its figure, a bar showing how far you got (`tk-last` in localStorage, `{slug, p}`) and Resume. With no history it shows "Start here" and the first guide.
  - **Progress:** a ring for problems solved and the challenge stars, from `progress.js`, so it follows account sync.
  - **Explore:** the three library cards as picture cards.
  - **Up next:** the next four unsolved problems, each with a difficulty dot.
- **Section pages:**
  - No eyebrow labels, no "N PAGES" counter and no "CONCEPT // 01" over card titles.
  - Cards float (`--card-shadow`).

## 5. Checks

- Unit tests: frontend 371 of 371, backend 89 of 89.
- Contrast: faint text on the light page is 5.13:1. Dark is unchanged.
- e2e suites run against a local API and preview. The results are in the PR.

## 6. Next

- The article page: one toolbar row (Listen · Figures only · Share), and no "CONCEPTS / CONCEPT // 04" line.
- The Interview Questions start list as picture cards. The Problems table in a floating card.
- A new link preview image (`og-2026-11.png`) in the dark look.
