# 33 · Light theme colours: Marigold & Navy

Date: 2026-11-15 (the owner's scheduled run, 06:20 IST). Follows 28 (Katta Paper colours back, #338) and 37 (the
same reviewer's other points, PR #365).

**The complaint:** a UI/UX reviewer "hated our website in the light theme".

**The owner's order:** "think for the colour schemes first, then write all the decisions taken for the colour
schemes, then implement it and push, then update docs and ledgers".

## 1. What is wrong with the current light theme

From Chromium screenshots of the current light look (a local build of the PR #365 branch; production has the same
colours). The pages were the landing page, dashboard home, an article in Full text and Cards, Problems, the URL
shortener workspace and the sign-in dialog, at 1440 px and on a Pixel 7.

- **The page looks sepia, not white.** The page `#faf7f0`, wells `#f3efe5`, hover `#efeadd` and lines `#e6e0d1` are
  all beige. White cards on beige paper read as old paper or a faded print, not as a clean tool.
- **Muddy ochre does too much.** `--accent` `#94600a` is a brown-ochre, and it is used for links, focus rings, figure
  lines and labels, "Start here", "Explore Concepts →", the progress ring and the rail. Next to marigold buttons it
  makes the whole page brown and yellow.
- **There are too many yellows at once.**
  - The pale-yellow tints (`--accent-tint` `#fff6dc`, `--accent-soft` `#ffe08a`) fill the example-system box, the
    problem's how-to box and the figures' highlighted boxes.
  - The marigold buttons, the logo, the "New" chip and "Pick one" add more yellow on top.
  - With nothing cool on the page, nothing reads as a link and nothing stands out.
- **The figures inherit the brown.** Highlighted paths and boxes are ochre lines on pale yellow, on beige. Figures
  look dated and low in contrast.
- **The contrast numbers pass, but the page reads as flat.** Body text passes AA (ink on paper 16:1, muted 6.2:1,
  accent 5.3:1). The flatness comes from warm on warm on warm.

What already works and stays: marigold as the brand (the owner chose it back, #338), the near-black ink, white cards,
the status colours, the figure category colours, and the whole dark theme.

## 2. History to respect

| When | What | Owner's call |
|---|---|---|
| 20 (11-12) | Katta Paper: cream paper, marigold, ochre | shipped |
| 25 P4 (#334) | Brilliant-inspired | shipped, then replaced |
| 25 §7 (#335) | Expert: "no marigold", black pill buttons, indigo accent | shipped, then replaced |
| 26/27 (#336–#337) | dark-first Stage colours | replaced |
| 28 (#338) | "keep everything same, but … marigold yellow and that warm white" | **current** |
| 32 (#355) | design-skills renovation (type, motion, landing) | reverted: "Earlier it was better" |
| earlier | blue as the main colour | "cold", rejected |

So the owner wants **marigold kept**, a warm feel, and no cold blue main colour. The reviewer dislikes the beige
paper and the brown.

## 3. Reference sites (light mode)

How well-regarded learning and developer sites build their light themes:

- **Stripe docs, Vercel, Linear:** a near-neutral page (`#fafafa` to `#ffffff`), white or near-white cards, a neutral
  near-black ink, and one saturated accent used only for links, focus and the current item.
- **Brilliant, Khan Academy:** a white page with one friendly brand colour on the main action, and a second, cooler
  colour for links and progress.
- **roadmap.sh:** a neutral page, a yellow highlight used sparingly, and dark ink.
- **Notion:** off-white neutrals with very slight warmth; colour only in tags and callouts.

**The common rule:** the page and surfaces are neutral; warmth comes from one brand colour on the main action; links
and highlights use a second colour that contrasts with the brand. Yellow with navy is a classic pair: high contrast,
warm plus serious, and readable for colour-blind readers.

## 4. Candidates

All three share a new neutral base: near-white page, white cards, neutral warm-grey lines and text (§6). Marigold
stays on the main buttons, the logo and the highlighter. They differ only in the accent: links, focus, figure lines,
tints and the progress ring. Rendered on the real pages by overriding the tokens in Chromium (`pal/shots.js`); the
comparison sheets are in `ui-redesign/light-2026-11-15/`.

| | Name | Accent | Accent tint | AA: accent on white | Verdict |
|---|---|---|---|---|---|
| A | Marigold & Ink | `#1c1b19` (ink) | grey `#f6f6f4`, figure fill marigold `#ffe08a` | 17.2:1 | Very clean, but links look like plain text, and the figures' highlighted boxes turn solid black and harsh. Loses hierarchy. |
| **B** | **Marigold & Navy** | **`#26449e`** | `#f3f5fb` | **8.7:1** | **Chosen.** Links, focus and figure paths stand out; navy and marigold read as one brand; figures look crisp. |
| C | Marigold & Saffron | `#c2410c` | `#fff5ee` | 5.2:1 | Warm and Indian, but orange links next to yellow buttons are loud, it sits close to the error red, and the warning colour would have to move to amber. |

**Contrast** (WCAG, `pal/contrast.js`), for every candidate:
- ink on page 16.5:1, muted on page 6.7:1, muted on surface 6.3:1, faint on page 5.3:1;
- marigold with ink text 10.7:1; brand ink on brand tint 7.4:1.

Two pairs fail, as they do today: `--line-strong` on white (2.1:1, decorative borders) and the filled star (2.2:1;
each star row also has a text label). §6 says what is done about them.

## 5. Decision: B, Marigold & Navy

- **Neutral page and surfaces.** The beige goes, so the page reads as white and clean, as on the reference sites. A
  hint of warmth stays in the greys (`#fafaf9`, stone, not blue-grey), so the page is not clinical.
- **Marigold stays the brand.** It is on the main buttons, the logo, the highlighter and the active marker, exactly
  where it is now, as the owner chose in #338.
- **Navy replaces the brown-ochre accent.** It covers links, focus rings, the current item, figure lines and
  highlighted boxes, the progress ring and "Start here". Navy is deep (8.7:1 on white), so it is not "cold blue" as a
  main colour; it is the ink-like partner to marigold.
- **The tints follow the accent.** The example-system box, the how-to box and the figures' filled boxes become a very
  pale navy (`#f3f5fb` and `#dbe2f6`) instead of pale yellow. Yellow now appears only where the brand acts.
- **Unchanged:**
  - marigold (`--brand*`, `--mark`, `--on-brand`);
  - status colours: danger, success, and warn (orange, distinct from navy);
  - the stars and the figure category colours;
  - shapes, type, motion and layout;
  - **the whole dark theme**, including `.on-dark` sections;
  - the favicon (marigold with TK).
- **Not fixed now:**
  - `--line-strong` stays a decorative border. Input borders read through their label and focus ring; darkening it
    to 3:1 makes every card border heavy.
  - The star stays `#e8a308`. A darker gold turns brown. Rows carry "n of 3 stars" as an aria-label.

## 6. Token table: light values, old → new (`frontend/src/theme/tokens.css` and `theme/palette.js` TOKENS)

| Token | Old | New |
|---|---|---|
| `--page` | `#faf7f0` | `#fafaf9` |
| `--bg` | `#fff` | `#fff` (same) |
| `--surface` | `#f3efe5` | `#f3f3f1` |
| `--surface-2` | `#fcfaf5` | `#fbfbfa` |
| `--hover` | `#efeadd` | `#ededea` |
| `--inverse` | `#1d1b16` | `#1c1b19` |
| `--on-inverse` | `#faf7f0` | `#fafaf9` |
| `--ink` | `#1d1b16` | `#1c1b19` |
| `--ink-2` | `#3a372f` | `#34322e` |
| `--ink-3` | `#4d493f` | `#46443f` |
| `--muted` | `#625c4f` | `#5b5953` |
| `--muted-2` | `#6b6557` | `#64625c` |
| `--faint` | `#736d5d` | `#6b6963` |
| `--disabled` | `#cdc7b6` | `#d2d1cc` |
| `--line-strong` | `#b9b2a0` | `#b4b2ab` |
| `--line` | `#e6e0d1` | `#e6e5e1` |
| `--line-soft` | `#ddd6c4` | `#dddcd7` |
| `--grid` | `#f0ebde` | `#f0f0ed` |
| `--accent` | `#94600a` | `#26449e` |
| `--accent-strong` | `#754a00` | `#1b3278` |
| `--accent-mid` | `#e9b949` | `#8ea3dc` |
| `--accent-line` | `#f0d388` | `#ccd5f0` |
| `--accent-soft` | `#ffe08a` | `#dbe2f6` |
| `--accent-tint-2` | `#ffedb8` | `#e8ecf8` |
| `--accent-tint` | `#fff6dc` | `#f3f5fb` |
| `--on-accent` | `#fff` | `#fff` (same) |
| `--ink-rgb` | `29 27 22` | `28 27 25` |
| `--page-rgb` | `250 247 240` | `250 250 249` |
| `--accent-rgb` | `148 96 10` | `38 68 158` |

All other light tokens are unchanged: `--brand` and the rest of the marigold family, `--on-brand`, `--mark`, the
danger, success and warn families, `--star`, and `--cat-*`.

**Outside the tokens:**
- `index.html` and `dashboard/index.html`: `theme-color` and the first-paint background `#faf7f0` → `#fafaf9`. The
  dark `#15140f` is unchanged.
- `seo.js`: the static article page for crawlers: link `#94600a` → `#26449e`, and its beige greys → the new greys.
- `theme/mode.js` reads `--page` for the browser bar, so it follows on its own.

## 7. Rejected, and why

- **Back to black main buttons (#335 / 25 §7):** the owner replaced them with marigold in #338. Marigold stays.
- **A full indigo brand (25 C):** blue as the main colour was rejected as "cold". Here navy is only the accent.
- **Keep beige and only change the accent:** the beige page is half the complaint. A sheet with the new accent on the
  old paper still looked sepia.
- **Saffron (C) and ink (A):** see §4.

## 8. Rollback

Revert the commit that changes `tokens.css`, `palette.js`, the two `index.html` files and `seo.js`. Nothing else
depends on the values.

## 9. Status (2026-11-15)

Written before the code (owner's order, commit `ca534b6` here), then built.

- **App commits:** on PR **#365** (draft, branch `ccr-b42a0cbb-y2io0r`, together with doc 37's fixes):
  - `488806b5f16d41bfbc94e554b580a55c98fadd83`: the tokens, `palette.js`, both `index.html` files, `seo.js`;
  - `936959ee08ac994818138846d0d5e1037bdde180`: the dashboard's link preview text drops "read-aloud".
- **Ledger:** both rows recorded in `frontend_git_commits`. The backend is unchanged.
- **Checks:**
  - Frontend tests 393/393. The theme test keeps `palette.js` equal to `tokens.css` and passed.
  - Build passed.
  - Browser tested in Chromium against a local build at 1440 px and on a Pixel 7, light before and after and dark
    after. Pages: landing, dashboard home, Caching in Full text and Cards, Problems, the URL shortener workspace and
    the sign-in dialog.
  - Dark is unchanged: the diff touches only the light `:root` block (lines 7–83; dark starts at line 124).
- **Pictures:** in `ui-redesign/light-2026-11-15/`:
  - `before-after-desk.jpg` and `before-after-phone.jpg`;
  - `after-dark-sheet.jpg`;
  - `cmp-*.jpg`, the candidates.
- **What the after shots show:**
  - Pages read white.
  - Links, the "Start here" label, the progress ring, the rail and the figure paths are navy. In the Kafka hero
    figure, the filled boxes are navy with white text.
  - The example-system box is pale navy.
  - Marigold appears only on Start learning, Begin, Submit, Pick one, the logo and the "New" dot.
- **Still warm:** the problem workspace's how-to box keeps its pale marigold with a marigold edge. It uses the brand
  tint (`--brand-tint`), on purpose a brand callout. The `og-2026-11.png` link preview image is unchanged.
- **Not checked:** Safari, Firefox, a real phone, production (not merged).
- **Rollback:** before a merge, drop `488806b` from the branch. After a merge, revert its changes to
  `tokens.css`, `palette.js`, the two `index.html` files and `seo.js`, or use Vercel Instant Rollback to the
  production deployment before #365 (currently `613442a`, #364).
