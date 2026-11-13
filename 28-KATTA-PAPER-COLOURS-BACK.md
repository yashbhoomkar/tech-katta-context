# 28 · Katta Paper colours back, on the new layout

Date: 2026-11-13. Shipped in tech-katta #338. Follows 26 (Stage layout) and 27 (topic cards, light theme).

The owner's request, after 27: "All the widgets, animations, everything is perfect. Update docs and ledgers. But just
to try: keep everything same, but … the earlier colour scheme of marigold yellow and that warm white. Use that and
deploy. Just change all the colours."

## What changed (colours only)

- **`theme/tokens.css` and `theme/palette.js`:** every colour value, light and dark, is back to Katta Paper, as it was up to #333 (`git show 0a67178:frontend/src/theme/tokens.css`).

  | Role | Light | Dark |
  |---|---|---|
  | Page (paper) | `#faf7f0` | `#15140f` |
  | Cards | `#fff` | `#1e1c16` |
  | Ink | `#1d1b16` | `#f4f1e8` |
  | Brand (marigold) | `#ffc233`, ink text on it | `#ffc233` |
  | Accent: links, focus, figure lines | ochre `#94600a` | marigold `#ffc233` |
  | Stars | `#e8a308` | — |

  Status colours are unchanged. Shapes, radii, shadows (they read the ink colour), motion and type are untouched.
- **Marigold with ink text:**
  - the main buttons, including the landing hero's "Start learning" and the dashboard's "Resume" and "Begin";
  - the TK squares on the landing header, the sidebar, the phone header and the favicon.
- **The default theme is the warm white** (`theme-boot.js`, `mode.js`), so the paper is what a visitor sees first. Dark (warm near-black with marigold) is one tap away on the theme button.
- **Browser bar:** `#faf7f0`; first paint in dark: `#15140f`.

## Unchanged

The Stage layout (26) and the topic cards (27) stay exactly as they were:

- the centred hero with the live figure and the judge's card;
- the numbers strip and the picture tiles;
- one sidebar, and the dashboard home;
- topic cards and the sheet, and every animation.

## To go back

The dark-first Stage colours are #336 and #337. Reverting this PR's changes to `tokens.css`, `palette.js`, the two `index.html` files, `theme-boot.js`, `mode.js`, `favicon.svg`, and the four rules in `styles.css` and `dashboard/stage.css` restores them.

## Checks

- Frontend tests: 371 of 371 pass.
- e2e:
  - `topic-cards` passes 26 of 26;
  - `premium-look`, `marks-tour` and `motion-polish` pass, with their colour checks updated to marigold and ochre.

## Ledger rows still to add

The MongoDB connection failed to connect on 2026-11-13, so these rows wait here. Each row is `{key: branch head SHA, value}`.

- **`techkatta_history.frontend_git_commits`:**
  - **#337:**
    - key: `a3eeea1e2666ef7315ec7083b9af5f14ca09344f`
    - value: "Articles as topic cards (moving pictures, sheet with at most three key points, Cards / Full text); light theme follows the theme (PR #337, 2026-11-13)"
  - **#338:**
    - key: `fb3d5a92bf44fcde0531bab20b2b714f3f33873d`
    - value: "Katta Paper colours back on the Stage layout: warm white default, marigold buttons and TK squares, ochre accent (PR #338, 2026-11-13)"
- **`techkatta_history.backend_git_commits`:**
  - **#337:**
    - key: `a3eeea1e2666ef7315ec7083b9af5f14ca09344f`
    - value: "Analytics allowlist: article_view {view}, topic_open {n, via} (PR #337, 2026-11-13)"
