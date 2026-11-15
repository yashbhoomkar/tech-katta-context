# Neo-brutalism dark: why it isn't appealing, and what to try next

Owner, 2026-11-15, after round 3 (calmer colours): *"Don't implement, just write it in the docs for now. The dark theme is
not appealing in Neo brutalism. Think on that. Update docs and ledgers."*

**Status (2026-11-15, later): implemented as the comparison in §4**: `/p/nb-dark/` plus `?nbdark=b|d|e` and a "Dark" switch on `/p/neo-brutalism/` (commit `5ac5636`). Waiting for the owner to pick. Before that it was thinking only; the live prototype (`/p/neo-brutalism/`, prototype branch at `37f6dfd`)
still has the round 3 dark: warm black `#121110`, softened cream outlines `#D9D1C0`, calm pastel blocks with dark text,
structure lines `#3B3934`.

---

## 1. Why it doesn't work (the diagnosis)

Three rounds have fixed symptoms: cream everywhere (round 2), loud colours (round 3). The dark is still unappealing
because neo-brutalism's vocabulary does not survive being inverted.

1. **Brutalism is ink on paper.** Its look comes from black outlines and black hard shadows on light paper: a printed
   poster, a rubber stamp, a risograph. Turning it dark means turning the ink into light. Cream lines on black stop
   reading as print and start reading as neon or a wireframe. That is a different style, and nobody chose it.
2. **The shadows are physically wrong.** A hard shadow says "this object sits above the page, and light comes from the
   top left". A shadow lighter than the object (cream under a dark card) cannot exist. The eye reads it as a glow or a
   second, offset border. Round 2 removed the shadows from static cards, but keys and link cards still cast cream
   shadows.
3. **The bright areas are too big and jump too far.** The calm pastel blocks are 11:1 against the page, and the cream
   outlines are 12.4:1. Six pastel tiles on near-black read as light-mode cards pasted onto a black sheet, the same
   patchiness found in full-site's round 1 dark ("A · pastels on ink"). Good dark interfaces keep bright area to about
   10–15 % of the screen. Home's Explore grid alone is about a third.
4. **The hierarchy flips.** In light, the brightest thing is the paper and the content sits on it. In this dark, the
   brightest things are the colour blocks and the cream frames, not the text or the main action. The eye goes to the
   Explore tiles before "Resume".
5. **There is no middle.** Everything is either near-black (page, panels, cards all within a few steps of `#121110`) or
   bright (cream, pastels). Without mid-tones there is no depth, so it looks flat and harsh at the same time.

**In one line:** the light theme is paper with ink; the dark theme is ink with paper cut-outs. The fix is not another
colour adjustment. It is choosing what neo-brutalism *means* at night.

## 2. Rules any new dark must follow (from §1)

1. **Shadows are always darker than the thing that casts them.** No light shadows. So dark surfaces must sit at
   mid-dark (about OKLCH L .20–.30), with shadows near-black below them. The page can't be the darkest colour if
   shadows are to show.
2. **Outlines are never brighter than body text**, and ideally about two thirds of its brightness.
3. **Bright-area budget: at most ~15 % of a screen.** Big colour fills shrink, or turn into lines, chips and stickers.
4. **One bright accent.** The marigold keys stay the brightest thing that isn't text, so "the main action" stays
   obvious.
5. **Three or four real tones**: page, panel, card, raised, each visibly different, so depth comes from tone as well as
   outlines.
6. **The light theme doesn't change.**
7. **Contrast:** every text pair at least 4.5:1, and outlines at least 3:1 against their surface. An outline you can't
   see isn't brutalism.

## 3. Directions worth testing

### B · Chalkboard (recommended to test first)

A coaching-class blackboard at the katta. It fits a learning site and keeps the physics right.

- **Tones:**
  - page `#1E2A25` (slate green-black);
  - panels and cards `#26352F`, raised `#2E3F38`;
  - shadows `#0E1513`: solid, hard, *darker* than the page (they read as depth, not glow).
- **Lines and text:** outlines in chalk `#C9D3CB` (8.4:1 on cards, below text at 10.9:1); text `#E8EEE9`; muted
  `#9DB0A6` (5.6:1).
- **Colour:** the six calm section colours become "coloured chalk":
  - title underlines, sticker chips, progress bars and the 3–4 px edge on cards;
  - big fills only on the four landing cards and section headers, at reduced lightness so they don't glare.
- **Keys:** marigold, with black text.
- **Details:**
  - a faint chalk-dust texture (very low-opacity noise) on the page;
  - outlines could take a hand-drawn wobble (an SVG filter is too heavy; a slightly rounded, uneven radius is
    enough).
- **Risks:** green-black can look dated or "school". Test it with the warmer slate variant `#24282B` as well.

### D′ · Inverted blocks, hard edition

Full-site's chosen dark (F2) works because colour is light, not paint. Do the same with brutal shapes:

- **Blocks:** colour blocks become dark cards (`#1C1B19`) with a **thick coloured outline** (3 px) and a **solid
  coloured shadow** in a darker shade of the same hue (for example sky `#8FCDF5` outline over a `#2E5C78` shadow).
- **Text:** card titles in the hue (9.7–10:1), body text cream.
- **Why it works:** colour turns into lines, so bright area drops to under 10 %. Shadows are darker than their
  object, and every section keeps its colour.
- **Keys:** stay marigold fills, the only big bright shapes.
- **Risks:** it can drift towards "neon". Keep outlines at 3 px with no glow, and keep the shadows clearly darker than
  the line.

### E · Dim paper (lamp-lit, not dark)

Some brutalist sites don't really have a dark mode; they have a dim one. Keep the print look under a warm lamp:

- **Tones:** page `#3A352E`, cards `#4A443B`, **black** outlines and shadows (the physics stay correct), cream text
  `#F3ECDD` (8.2:1).
- **Colour:** calm pastel blocks unchanged, with dark text (10:1).
- **Problems:**
  - black outlines are only 2.0:1 on the dim cards, below the 3:1 rule, so they would need 3 px plus a light inner
    edge;
  - at night it is still quite bright overall.
- **Use:** as an extra option ("Dim") rather than the dark theme, or keep it as the fallback if B and D′ fail.

### Rejected or parked

- **Neon signboard** (glowing coloured strokes): energetic, but it is a different style and glow breaks the
  hard-edge rule.
- **Pure-black OLED**: makes every jump in §1 worse.
- **No dark mode for neo-brutalism at all**: honest, but the site has a theme switch everywhere. Park it as the last
  resort.

## 4. How to decide (when the owner says go)

Same method as full-site's dark: one comparison page with real pieces, then the winner on every screen.

1. Build `/p/nb-dark/` like the retired `/p/dark-modes/`: columns **Now**, **B Chalkboard**, **D′ Inverted blocks**
   and **E Dim paper**, showing the same pieces:
   - landing hero and the four cards;
   - Home's continue card and the Explore grid;
   - a section header and lesson rows;
   - a lesson figure and the "Say this" box;
   - the workspace toolbar and canvas nodes;
   - the toast.
2. Add `?nbdark=b|d|e` to neo-brutalism (a `data-nbdark` attribute on `<html>`, set by a tiny boot step, like the
   `?dark=` switch full-site used) so each option can be judged on the real site.
3. For each option, check:
   - the bright-area share on Home (target ≤ 15 %);
   - outline vs text brightness;
   - shadow darker than its object;
   - contrast (§2.7);
   - phone screenshots at night brightness.
4. The owner picks. The winner replaces the dark block in `neo-brutalism/styles/tokens.css`, plus any component
   overrides, and the comparison page is retired with a redirect.

**Expected effort:** comparison page and switch about 1 hour; folding in the winner and checks about 1 hour.

## 5. References in this repo

- `ui-prototypes/TRIED.md`: neo-brutalism rounds 1–3, and full-site's dark rounds (A, B, C, D, F, F2), which taught
  "colour is light, not paint" and "big dark fills of warm hues turn brown".
- `ui-prototypes/neo-brutalism-spec.md`: the original spec (round 1).
- `frontend/prototypes/neo-brutalism/README.md` (prototype branch): rounds 2 and 3 as built.
