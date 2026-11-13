# 27 · Articles as topic cards, and a light theme that holds together

Date: 2026-11-13. Shipped in tech-katta #337. Follows 26 (Stage, dark first).

The owner asked:

1. "Think for the light theme".
2. "There is a lot of textual content in every content topic of every article. When you open an article there should be animation cards for every topic. On tapping the card the pop-up will have limited textual content."

## 1. Light theme

Dark stays the default. Light is a choice made with the theme button.

### What was wrong (screenshots of #336 in light)

- **The dashboard was split in two.** A black sidebar sat next to a light grey page.
- **The landing page jumped colours.** The hero was black, then the page turned light grey under it, so light never looked like a theme of its own.
- **The article page still had small mono capitals:** "CONCEPTS / CONCEPT // 04" and "9 NOV 2026 · 24 MIN READ".

### What changed

- **The hero, header and sidebar follow the theme.** `.on-dark` is no longer used on them; it stays in `tokens.css` for later use.
- **Light landing page:**
  - The stage runs white to grey (`--bg` to `--page`) with a soft indigo glow.
  - The figure sits in a white window: a hairline border, an indigo-tinted shadow and a light grey drawing area.
  - The chip and the judge's card are white sheets.
  - The header is translucent white with a hairline under it.
- **Light dashboard:** the sidebar is white beside the grey page, the current row is a soft grey pill, and the brand square is black.
- **Article header, both themes:**
  - A plain "← Concepts" link instead of the mono breadcrumb.
  - The meta line is in sentence case: "5 topics · 24 min read".

## 2. Articles as topic cards (`dashboard/topics.jsx`, `topics.css`)

### Cards

- An article opens as **one card per section** (h2). Sections with only h3s under them, such as "5. Deep dives", are skipped.
- **Each card's picture moves:**
  - **The section's first figure,** playing on its own clock, paused off screen.
  - **Phones** play one figure at a time, so phone cards show the finished drawing, and the topic you open plays.
  - **A section without a figure** (371 of 516) gets a small CSS animation built from what it holds:
    - component types: their names popping in as chips;
    - a table: its column names, then rows filling in;
    - code: its lines typing in, with a caret;
    - a list: ticks and lines, one after another;
    - otherwise: boxes on a line, with a request travelling between them.
  - Under reduced motion every picture is still.
- **Under each picture:** the number, the title, one short line (the first key point, at most 16 words) and "Open →".
- **The example system** is folded into one line above the cards: "Examples use Zotato, a made-up food delivery app ↓". It used to be the first card of every article.

### The topic sheet

- **Where it opens:** a centred card on wide screens, and a bottom sheet on phones.
- **Contents:**
  - "2 of 6", the title, and the picture (the figure with its step controls, or a larger version of the animation).
  - **At most three key points.** These come from the section's `gist` (an array on the h2 block in content) when it has one. Otherwise:
    1. Take the first sentence of each paragraph, list item and component type, in order.
    2. Cut a long sentence at its last comma, semicolon, colon or dash before 24 words, never inside brackets. If there is no such break, cut at 24 words with "…".
  - Any "try it on the canvas" link in the section, as a button.
  - **"Read the full section ↓"**, which shows every block of the section, so nothing is lost.
- **Moving between topics:**
  - Previous and Next buttons, each naming the topic it leads to.
  - ← and → keys, unless focus is in a figure's step controls.
  - On phones, a sideways swipe on the text.
- **Closing:** Esc, ✕, the backdrop, or on phones a downward drag on the sheet's head. The page behind is inert while the sheet is open, and focus returns to the card.

### Full text, Listen and analytics

- **"Full text"** sits beside "Cards" in the meta row (`tk-view`, remembered) and shows the article as before, with the "On this page" rail.
- **Listen** switches to the full text, where the sentence being read is marked.
- **New analytics events** (`backend/src/auth/events.js`):
  - `article_view {view}`: the switch;
  - `topic_open {n, via}`: each topic opened, via card, button, key or swipe.
- "Figures only" (25 §7) is replaced by the cards.
- Cards apply everywhere an article is drawn, including the Interview Questions workspace's answer tab.

## 3. Checks

- Unit tests: frontend 371 of 371, backend 89 of 89.
- **e2e `topic-cards.js`:** 26 checks, all passing. It covers:
  - one card per section, each with a moving picture, and no paragraphs in cards view;
  - the sheet: at most three points, focus starts on Close, → moves to the next topic, Read the full section;
  - Esc returns focus to the card; Full text works and the choice is remembered;
  - phones: a left swipe moves to the next topic, the sheet comes up from the bottom, dragging down closes it, nothing overflows.
- **`premium-look.js`** now checks the switch instead of "Figures only".

## 4. Next

- Write `gist` for the most-read sections (start with the nine core concepts), so the key points read as written, not as extracted.
- If `topic_open` shows readers moving through the topics in order, open the sheet as a story (auto-advance with a progress bar).
