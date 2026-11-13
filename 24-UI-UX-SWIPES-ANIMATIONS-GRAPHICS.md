# 24 — UI/UX: swipes, animations, graphics

Written **2026-11-13** at the owner's request ("Think on UI UX part of Tech katta. Think about swipes, animations,
graphics and write a doc"). The owner then asked: "Think more on the .md file" and "start implementing in production".

## Status (2026-11-13)

| Built and live | PR | Squash |
|---|---|---|
| UX1 gesture hook, S4 drawer drag-to-close, S5 swipe down closes a full-screen figure | #323 | `a8e1da41db26db0431fc475ec74666e360585a8e` |
| UX2 figure step controls (A1) and the step-line swipe (S2) on every `Caps` figure | #323 | same |
| UX3 Practice phone panes swipe (S1), each pane keeps its scroll, the tab line slides | #323 | same |
| UX4 page and theme cross-fade (A2 without the title morph, A10), the contents marker slides (A4), stars fill one by one (A5) | #324 | `41bef78edc063d661c03827d40f927c6f5b49cb9` |
| §9 decisions in code: one figure loop at a time on phones (§4.3), solid header on phones, events `fig_step` and `practice_pane` (§11.5) | #325 | `26b8e247fbe2746c70c6e1b617af4e16cce51e6b` |
| §11.1 the learner's diagram on phones (Result pane, "See the diagram" sheet) and its motion (A3) | #326 | `87680d6e384763267cfc430d2258761e8b443b0a` |
| The diagram's doubled arrows fixed: one arrow per hop, a key (owner's screenshot, §10 lesson 10) | #327 | `f96ff31f7543e1f8d22c51ee9842b821ab64b059` |
| G3 scenes for error and empty states (`theme/Scene.jsx`: offline, missing, empty, busy, broken) | #328 | `6369efba1b01e96c900e9a0e21ff99153eb78204` |
| G6 "Share as image" after Accepted: a 1200 × 630 card made in the browser, no names (`practice/card.js`; picture `ui-redesign/13-share-card.png`) | #329 | `35bc56853cb44ba8fdefd193d0a00ad0ab5ae689` |
| A7 landing counts count up when seen (`theme/CountUp.jsx`); A6 the Practice streak gets the marker the day it grows | #330 | `8986c1f9ef921705461b7272c2f2c222c0e2e0ce` |
| G4 section marks (`dashboard/icons.jsx`); S6 the tour card follows a swipe on phones | #331 | `e56c85ab4143072f12994c0b4ee9201a01386362` |
| G1 phone figures, batch 1: `figs/phone.jsx` (`phoneFlow`), the first figure of 20 Interview Questions in portrait | #332 | `ff6fc8ff24d929273adfc80de9a166127febbe89` |
| G1 batch 2: 13 more flows in Concepts, Components, Real systems (33 of the 60 articles with figures) | #333 | `0a67178c7566cb45dcabe386f36977ccbfd8bcc1` |

**Spec 24 is done (2026-11-13), the owner having said "Do all the pending items".** What is not built, and why
(decided by the session, reversible):
- **G2** (the Practice diagram redrawn with the figure parts): dropped. After #326–#327 the diagram follows the
  figures' rules (one arrow per hop, a key, the same motion), and its names are identifiers the learner typed, so the
  code-style font is right for them.
- **G1 for figures that are not flows**: the 27 first figures that are tables, grids, charts, timelines or
  comparisons keep the sideways frame (#313). A portrait does not make a grid or a chart easier to read. A later
  phone-first redraw is possible case by case; `phoneFlow` is for flows only.
- **A8 / S7** ("Show me" motion and its scrubbing): belong to spec 22 phase B, which is not built. Build them with it.
- **G5** link preview per article: not now (§9). **UX6** sheet drag: dropped (§9). Dropped: UX6 (sheet drag) and, for now, G5 (§9).
§10 records what building taught us and changed in this spec. §11 is the second pass on what to do next and why.
Section 9 lists the owner's decisions.

It builds on `20-UI-REDESIGN-SPEC.md` ("Katta Paper", live since #309) and does not replace it. Spec 20's rules still
apply: §3.4 (what we never do), §4.5–4.6 (where things move and how), §4.8 (the three motion ideas). This file adds
the parts spec 20 left out: **touch gestures**, the animations still missing after #311–#318, and the **graphics**
beyond the article figures.

First written against application `main` at `4bc95cc` (#322); §10 is against `41bef78` (#324).

---

## 0. Summary

*(As first written, before #323 and #324; see Status above.)*

1. **Swipes.** Before #323 the site had **no swipe gestures of its own.** The back/forward swipe in `09-MOBILE-SWIPE.md`
   came from the old `App.jsx`. That file is gone, and `grep touchstart` finds nothing in `frontend/src`. The only
   touch behaviour left is native: figures scroll sideways in their frame (#313), palette items drag with pointer
   events, and the split dividers. **Do not bring back the swipe for back/forward**: phones already do that at the
   screen edge (§1.2). Add swipes only where something on the screen moves with the finger: the drawer, the result
   sheet, the three Practice tabs, figure steps, the full-screen figure and the tour card (§2).
2. **Animations.** Spec 20's motion layer and the problem-solving moments (#318: tests tick off, score counts up,
   requests flow through a passing design) are live. Still missing, in order of value: **figure step control** (a
   phone reader can't read a step in 2.5 s), **page view transitions**, the "On this page" marker sliding, stars
   filling one by one, motion in the **Practice diagram** (it is drawn static today) and the motion for spec 22's
   "Show me" (§4). One addition to spec 20's rules: **motion follows the finger** (§1.3).
3. **Graphics.** The 232 figures are the site's best asset, but on a 360 px phone they are drawn for 640 px. Proposed:
   (a) a **phone version of the first figure of each article** (portrait, read top to bottom); (b) **the Practice
   diagram drawn with the figures' parts**, so the learner's design looks like the textbook's; (c) small **scenes for
   empty, error and locked states**, made from the same parts; (d) **section marks** and (e) a **link preview image
   for each article** (§5).
4. One shared piece of code makes the swipes possible: `src/theme/gesture.js`, a hook of about 60 lines with no
   library (§3).

---

## 1. Principles

### 1.1 Who we design for

From spec 20 §3.2: Indian engineers preparing for interviews, **mostly on a phone**, in short sessions. In practice
that means mid-range and low-end Android phones with Chrome, Android gesture navigation, 360–412 px wide screens and
4× slower CPUs than a laptop, plus some iPhones. Design every item in this file for a **Pixel 7 / Redmi-class Android
first**, and check iPhone Safari second.

### 1.2 Who owns which gesture

| Gesture | Owner | Consequence for us |
|---|---|---|
| Swipe in from the **left or right screen edge** | The phone. Android gesture navigation = Back; iOS Safari = history back/forward | **Never start a site gesture within 24 px of either screen edge.** No "swipe in from the edge to open the drawer" |
| Swipe up from the bottom edge | The phone (home / app switcher) | Bottom sheets are dragged from their handle, never from the screen's bottom edge |
| Vertical swipe anywhere | The browser (scroll) | Every site gesture is horizontal, or starts on a sheet handle. Site gestures use `touch-action: pan-y` so vertical scrolling stays native and smooth |
| Pinch | The browser (page zoom) | Never set `user-scalable=no`; never call `preventDefault` on a two-finger gesture |
| Long press on text | The browser (select, copy) | No long-press actions on text. Articles get **no** gestures in the text column |
| Horizontal pan on a scroller (figure frame, table, code, Practice diagram, the tabs row) | That scroller | A gesture that starts inside a horizontal scroller belongs to the scroller until it reaches its end (`overscroll-behavior-x: contain` stops it passing on) |
| Drag on the canvas (React Flow) | React Flow | No site gesture inside `.react-flow` |

This is why the 2026-10 back/forward swipe should stay gone. It took a horizontal swipe **anywhere** on the page, which
is the same movement as panning a figure, a table or the text editor's caret. And the phone already does Back from
the edge, as every app does.

### 1.3 The gesture grammar: "paper follows the finger"

Spec 20 §4.8 says each animation belongs to one of three ideas: the marker, the request, the verdict. Gestures get one
of their own, from the notebook: **paper moves under your finger and settles where you leave it.**

1. **The thing moves 1:1 with the finger** while you drag. No delay, no easing during the drag.
2. **Release decides:** past **35 %** of the distance, or faster than **0.5 px/ms** in that direction → it goes. Otherwise
   it returns. (One rule for every swipe on the site.)
3. **Settling** uses `--ease`. Its length depends on the distance left: `clamp(0.14 s, remaining / width × 0.28 s, 0.28 s)`.
   No springs, no bounce (spec 20 §3.4).
4. **At a limit** (the first tab, a closed drawer) the paper gives a little: it moves at ⅓ of the finger's speed, at
   most 32 px, then settles back. That tells the reader "nothing further this way" without a message.
5. **Direction lock.** Nothing moves for the first **10 px**. After that, the gesture belongs to the site only if
   `|dx| > |dy| × 1.25`. The 2026-10 handler used the same ratio and it worked well. Otherwise it is a scroll and we
   let go of it for the rest of the touch.
6. **Every swipe has a button.** Swipes speed things up; they never hide a feature. The drawer has its close
   backdrop, the sheet its "×", the tabs are tabs, figure steps have ‹ ›. Keyboard and screen-reader users lose nothing.
7. **Reduced motion:** the drag still follows the finger (that is the reader's own movement, like the reading line in
   spec 20 §4.5 item 13), but the settle is instant.
8. **Only `transform` and `opacity` move** (spec 20 §4.6 rule 1). During a drag set `will-change: transform` and remove
   it at the end.

---

## 2. Swipes: what to add

In order of value. "S" numbers are used in the work packages (§7).

| # | Where | The swipe | Button that does the same | Value |
|---|---|---|---|---|
| **S1** | Practice on phones (`/dashboard/practice/<slug>/`, < 900 px): the three tabs Problem · Design · Result (spec 21 §11.4) | Swipe sideways between the three panes, like pages in a notebook; the tab underline slides with the finger | The three tabs | **High.** It is the screen people use the longest on a phone. Reading the statement and then building the design goes back and forth all the time |
| **S2** | Figure step line on phones (`.a-fig-step`, from #313) | Swipe the step line sideways: next / previous step. The figure pauses on that step | ‹ › next to the step line, and tap to pause / play | **High.** The SPEED 0.7 loop leaves about 2.5 s a step (18-TODO). It is too fast for a 20-word caption on a phone. See also A1 |
| **S3** | Result sheet after Run / Submit (`.sv-console` in the workspace; Practice's Result pane on desktop is a split, not a sheet) | Drag the sheet's handle down to fold it to its title bar; drag up to open it | The sheet's fold / close buttons (exist) | Medium. It brings the design back into view to fix it, without losing the verdict |
| **S4** | Phone drawer (`.side`, < 900 px) | Drag the **open** drawer left to close it; it follows the finger and the backdrop fades with it | Backdrop tap, Escape (exist) | Medium. People expect it, and today a swipe on the drawer does nothing |
| **S5** | Full-screen figure (`FullFig` in `dashboard/figure.jsx`) | Swipe **down** (screen direction, also when the figure is turned sideways) to close, as in a photo viewer | "Close ✕" (exists) | Medium |
| **S6** | Tour card on phones (`tour.jsx`) | Swipe the card left: next step; right: back | Next / Back (exist) | Low. Tours are five steps or fewer |
| **S7** | "Show me" timeline (spec 22 §10.2, when built) | Drag along the segment bar to scrub the replay | Tap a segment | Built with spec 22 phase B |

**Considered and rejected**

| Idea | Why not |
|---|---|
| Swipe anywhere for back / forward (the 2026-10 behaviour) | §1.2: the phone already does this from the edge; mid-screen it conflicts with figures, tables and the editor |
| Swipe in from the left edge to open the drawer | That edge belongs to Android Back and iOS Safari history |
| Swipe between articles (next / previous) | It conflicts with text selection and figure pans, and readers can't predict where it goes. The "Next article" card is enough |
| Swipe actions on Problems list rows (mark done, bookmark) | There are no row actions worth a hidden gesture |
| Pull to refresh | Content changes once per deploy. The browser's own pull-to-refresh stays as it is |
| Long-press menus | Not discoverable; long press on text belongs to the browser |
| Pinch to zoom inside article figures | The browser's page zoom already works, and a figure has full screen |

### 2.1 S1 in detail: the Practice pager

> **As built (#323): not scroll snap.** The phone Practice page scrolls as a whole: a sticky problem bar, sticky tab
> rows inside the panes, fixed Run/Submit and tab bars. A scroll-snap pager makes each pane its own scroller, which
> breaks all of that and gives three scroll positions to manage. So S1 uses the shared `useDrag` hook like the other
> swipes: the pane follows the finger, the next pane slides in from that side (`pr-in-r` / `pr-in-l`, 0.22 s), and
> each pane's scroll position is remembered and restored. The original plan is kept below for the record.

Original plan: build it with **CSS scroll snap**, not a JavaScript drag. The browser then gives native momentum, the right feel on
each OS, and correct handling of the scrollers inside a pane.

```css
.pr-phone-body{display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;overscroll-behavior-x:contain;scrollbar-width:none}
.pr-phone-body>section{flex:0 0 100%;scroll-snap-align:start;scroll-snap-stop:always;overflow-y:auto;overscroll-behavior-y:contain}
/* scrollers inside a pane keep their own sideways pan and don't hand it to the pager at their end */
.pr-phone-body :is(.pr-table-w,pre){overscroll-behavior-x:contain}
```

- **Tab → pane:** tapping a tab calls `body.scrollTo({left: i × width, behavior: still ? "auto" : "smooth"})`.
- **Pane → tab:** on `scrollend` (or, where the browser lacks it, 120 ms after the last `scroll`), set `mtab` from
  `Math.round(scrollLeft / width)`. Track `practice_switch_tab` with `via: "swipe" | "tap"`. It goes in the existing
  events if the owner agrees: a new event name counts under operating rule 4.
- **The underline follows the finger:** on `scroll`, set `--p: scrollLeft / width` on the tab bar (`.pr-phone-tabs`, at the bottom). The underline is
  one element with `transform: translateX(calc(var(--p) * 100%))`. This is the marker idea of spec 20 §4.8: the
  marigold line slides; it doesn't jump.
- **All three panes stay mounted.** Today `.pr-phone-body` renders only the current one (`page.jsx` line 205). Mounting them costs little: the Result pane is
  empty until the first Run. It keeps the reader's scroll position in each pane, which today is lost on every tab
  switch.
- **Run / Submit bar** stays fixed above the tabs, as now.
- **After Run on the Design pane**, the pager scrolls to Result itself (`showResult()` already sets `mtab`).
- **Keyboard:** the tabs keep `role="tab"`; ← → move between tabs (add it, it is missing today).

### 2.2 S2 in detail: stepping through a figure

Figures are SMIL animations on a loop. `useStepLine` in `dashboard/figure.jsx` already works out the current step
from `tk-caps` (`data-dur`, number of captions) and the SVG clock. Stepping uses the same numbers:

- **Pause:** `svg.pauseAnimations()`. **Go to step k:** `svg.setCurrentTime(k × d / n + 0.3)`, which lands just after
  the step's fade-in. Every figure written with `Caps` gets stepping **with no change to its file**.
- Figures with a single caption (`Cap`, `tk-cap`) or none show no step controls.
- **Controls** (phones and desktop): under the figure head, `‹  step 2 of 4  ›` and a pause / play button. On phones
  the step line itself takes the swipe. A row of small dots fills **left to right** as the loop plays: the request
  idea.
- **A step the reader picked stays put** until they press play. `useLoopInView` pauses off screen and today
  resumes the loop when the figure comes back; change it so a figure the reader paused stays paused on its step.
- Reduced motion: figures already draw their still version (all steps at once), so there are no controls.
- Accessibility: buttons have labels ("Next step", "Previous step", "Pause figure"); the step line is `aria-live="polite"`
  **only while the reader is stepping**, never while it loops (a looping live region would talk every 2.5 s).

### 2.3 S3 in detail: sheets

Two positions only: **open** and **folded to the title bar**. Drag starts **only on the handle or the title bar**
(the sheet's body scrolls). Release follows §1.3 rule 2. The sheet animates `translateY`; the content under it
doesn't re-lay out. The handle is a 36 × 4 px `--line-strong` bar centred in a 44 px tall hit area.

---

## 3. One gesture hook: `src/theme/gesture.js`

All of S2–S6 use the same small hook. No library (spec 20: "none may be built with a library; each is a few lines").

```js
// useDrag(ref, { axis: "x" | "y", size: () => px, min, max, onMove(d), onEnd(go) })
// pointerdown  → remember x0,y0,t0; ignore if it starts within 24 px of a screen edge (axis x),
//                inside .react-flow, a horizontal scroller that can still scroll that way, an input, select or textarea
// pointermove  → until |d| ≥ 10 px do nothing; then lock: ours if |dx| > |dy| × 1.25 (axis x) else release for good;
//                once ours: setPointerCapture, onMove(d) with rubber band beyond min / max (⅓ speed, ≤ 32 px)
// pointerup    → go = decide(d, v, size()) ; onEnd(go)
// pointercancel→ onEnd(0)  (the browser took the gesture: a scroll, a system back)
export function decide(d, v, size) { /* pure: ±1 if |d| > .35·size or |v| > .5 px/ms in d's direction, else 0 */ }
```

- The element gets `touch-action: pan-y` (axis x) or `none` on a sheet handle (axis y).
- `decide()` is pure and unit-tested in `theme/gesture.test.js` (thresholds, velocity, direction, the 1.25 lock).
- `settle(el, to)` sets `transition: transform <§1.3 rule 3> var(--ease)` once, then `transform` to the end
  position. Under reduced motion there is no transition.
- `09-MOBILE-SWIPE.md` describes the old handler. Rewrite it when S-items are built.

---

## 4. Animations: what is live and what is missing

### 4.1 Live today (for reference; do not rebuild)

| Area | What moves | Where |
|---|---|---|
| Interface | Rise / pop / sheet / fade entrances, card stagger (8), skeleton shimmer, reading line, highlighter under the headline | `theme/motion.css` groups 1–7 (spec 20 §4.5) |
| Verdict | Tests tick off row by row (60 ms), ✓ / ✕ pop, score counts up over 0.8 s, marker under a passed verdict, stars pop, "Running the tests…" sweep | `motion.css` group 8 and `.sv-results`; `CountUp` in `solve/console.jsx` (#318) |
| Request | 232 figures: step fades 0.22 s, request dots with halo and trail, ochre-path glint 1.6 s; loops at `SPEED` 0.7; start at step 1 when seen, pause off screen | `figs/parts.jsx`, `theme/motion.js`, `dashboard/figure.jsx` (#311, #312) |
| Request | Dots travel along the arrows of a passing design on the canvas; a crashed node shudders once; the load bar slides | `lab/nodes.jsx`, `motion.css` (#318) |
| Marker | A first solve draws the marker under that problem's tick on Problems | `.qt-st.done.fresh` |

### 4.2 Missing, in order of value

"A" numbers are used in the work packages. Each names its idea from spec 20 §4.8.

| # | Moment | What the visitor sees | Idea | How | Where |
|---|---|---|---|---|---|
| **A1** | **Figure steps** | Step dots fill left to right; ‹ › and pause (§2.2) | Request | SMIL `pauseAnimations` / `setCurrentTime` | `dashboard/figure.jsx`, `figure.css` |
| **A2** | **Page view transitions** | Moving between dashboard pages cross-fades for 0.15 s. Opening an article from a card: the card's title **becomes** the article title (a shared-element move, 0.24 s) | Request | `document.startViewTransition` around the route change, where it exists; `view-transition-name: tk-title` on the clicked card's title and on `.d-article h1`. Other browsers: unchanged | Router in `dashboard/shell.jsx` |
| **A3** | **Practice diagram comes alive** | When the text compiles to a new design: a new part fades in (0.22 s), a new arrow is **drawn** from its start to its end (`stroke-dashoffset`, 0.3 s), parts that moved slide to their new place (0.2 s) instead of jumping. After a failed Run the blamed part shudders once (`tk-shake`, as on the canvas). After **Accepted**, request dots run along the read routes (ink) and write routes (ochre) for three loops, then stop | Request + verdict | Key each part's `<g>` by name; FLIP its `transform` from the previous layout; `Dot` from `figs/parts.jsx` for the dots. Nothing animates while the learner is typing: wait for 400 ms of no typing (the compile debounce) | `practice/diagram.jsx` |
| **A4** | **"On this page" marker slides** | The ochre piece of the contents line slides to the new heading | Marker | One bar positioned with `transform: translateY` from the active item's `offsetTop` | `dashboard/article.jsx`, `article.css` (spec 20 §4.8 "next") |
| **A5** | **Stars fill one at a time** | Each earned star turns gold 0.15 s after the last, with a small pop | Verdict | Render each star as its own `<i style="--i:n">` (today `Stars` in `lab/Score.jsx` repeats a text string) | `lab/Score.jsx`, `lablite.jsx`, `motion.css` |
| **A6** | **Streak grows** (Practice list, #319) | The day the streak goes up, the number rises in once and the marker is drawn under it | Marker | `.pl-streak.up b` gets `tk-rise` and the `tk-mark` stroke; `up` is set when the API's streak is larger than the one stored in `localStorage` | `practice/list.jsx` |
| **A7** | **Landing numbers count up** | The problem and article counts on the landing cards count up from 0 when they scroll into view | Request (scale) | Move `CountUp` from `solve/console.jsx` to `theme/motion.js`; one `IntersectionObserver` | `main.jsx` |
| **A8** | **"Show me" replay** (spec 22 §10.2) | A segment bar under the diagram; each segment plays for 1.2 s: load bars fill (`scaleX`), a part that goes down turns red and dashed with one shudder, request dots stop at the failing part and turn red; the caption fades per segment. Scrub by dragging the bar (S7) | Request | Reuse A3's diagram motion; the timeline is the judge's native run (no new physics) | Spec 22 phase B |
| **A9** | **"Copied" in place** | Already exists: Share changes its own label to "Link copied" for 2.5 s (found while building #324) | Verdict | — | `dashboard/share.jsx` |
| **A10** | **Theme switch** | Light ↔ dark cross-fades 0.2 s instead of snapping | — (polish) | `startViewTransition` around the theme change, where it exists | `theme/mode.js` |

**Not to be added** (in addition to spec 20 §4.8's list): animated page backgrounds behind figures; "typing" of
compile errors; a celebration screen for streaks; hover tilt or 3D on cards; Lottie or any animation runtime; a
loading spinner where a skeleton or the sweep already exists.

### 4.3 Performance on the phones we design for

| Rule | Why | Check |
|---|---|---|
| At most **one** figure loop runs at a time on a phone: the one most in view. The others pause | Many SVGs with SMIL and a glint each cost CPU on low-end Android. `useLoopInView` pauses off-screen figures but runs every visible one (two can be visible at once) | Performance panel, 4× CPU slowdown, scroll an article with two figures on screen |
| The sticky header's `backdrop-filter: blur(14px)` (`.header`, `.d-head`) is **to measure** on a low-end Android. If scrolling drops frames, use a solid `--page` header below 680 px | A blur behind a fixed element is redrawn on every scroll frame | Chrome remote debugging on a real phone, FPS meter while scrolling an article |
| Long articles: `content-visibility: auto` on article sections below the first screen | Less layout work on first paint for 20-minute articles | Lighthouse "Total Blocking Time" before / after |
| Glints stop when the figure is paused (they are SMIL too, so `pauseAnimations` already covers them) | — | — |
| A drag never triggers layout: transforms only (§1.3 rule 8) | Smooth at 60 fps on old phones | Performance panel: no purple Layout bars during a drag |

---

## 5. Graphics

### 5.1 What we have

- **232 article figures** in code (`frontend/src/figs/`, registered in `figs/index.js`): a 640-wide `viewBox`, parts
  from `figs/parts.jsx` (`Box`, `Arr`, `Dot`, `Glow`, `Caps`, …), colours from `theme/palette.js`, redrawn on theme
  change, a still version under reduced motion. This is the strongest thing on the site. No competitor has animated
  figures in every article.
- The landing figure, the TK marigold square logo, the 8 px eyebrow square, line icons in `dashboard/icons.jsx`,
  one shared link preview image (#320).
- The Practice diagram (`practice/diagram.jsx`): drawn from the compiled design, but with its own boxes and arrows,
  **not** the figure parts. The learner's design doesn't look like the designs in the articles.

### 5.2 Proposals

| # | Graphic | What | Why | Rules |
|---|---|---|---|---|
| **G1** | **Phone figures** | A second, **portrait** drawing for the **first figure of each article** (66), used ≤ 680 px. The request travels **top to bottom**, at most 2 boxes side by side | #313 made figures readable (labels 9.4 px in a sideways frame), but a reader still pans to see the whole idea. Portrait reads in one look | `viewBox` 360 wide (1:1 on a 360 px phone), labels ≥ 12 units, same parts and palette, same caption steps (so S2 / A1 step controls work). Registry entry gains `phone: {C, ar}`; `Fig` picks it when `usePhone()`. A test parses each phone figure and fails on any label under 12 |
| **G2** | **The Practice diagram in the figure grammar** | Draw the learner's compiled design with `Box`, `Arr` and `Dot` from `figs/parts.jsx`: same corners, same ink / ochre paths, same glint on the working path once Accepted | "My design looks like the one in the article" is a strong reward, and one drawing language is easier to keep | Layout stays `layout()` in `diagram.jsx`; only the drawing changes. Read routes ink, write routes ochre (as now). Blamed part: red border (as now) |
| **G3** | **Scenes for empty, error and locked states** | Small 240 × 80 drawings made from the same parts, one per state: *Couldn't load this page* (a request dot stops at a red ✕); *This problem doesn't exist* (a dot reaches a box labelled 404); *No submissions yet* (an empty lane with one dot waiting at the client); *The judge is busy* (dots queue in front of a box); *Part of Tech Katta Plus* (a box with a small lock; wording is the owner's) | Today these states are a line of text. A scene says the same thing in the site's own language, at almost no cost | One short loop or a still; nothing under reduced motion; never more than one scene on a screen; no characters, no mascots |
| **G4** | **Section marks** | A 20 × 20 mark per section built from figure parts: Concepts (a box with one arrow out), Components (three stacked boxes), Interview Questions (a box and a "?"), Quick Notes (a folded page corner), Real systems (two boxes and a dot between them), Problems (a ✓ in a box) | The sidebar and cards use generic icons today; the marks tie each section to the figures | 1.5 px ochre lines on paper, marigold fill only for the current section; they replace the sidebar icons in `icons.jsx` |
| **G5** | **A link preview image per article** | 1200 × 630: the article title in Fraunces on paper, the eyebrow square, and the **still** of the article's first figure | Shared links on WhatsApp and LinkedIn are how this audience finds things; one image for all articles (#320) looks the same in every chat | Generated at build from the still SVGs. Needs an SVG-to-PNG step in the build (a new build dependency, such as resvg): **owner decides** |
| **G6** | **A share card for "Accepted"** | After a first Accepted in Practice: "Accepted · Design a URL shortener · p99 84 ms · ₹ cost", the learner's diagram (G2 still), the TK mark. "Share" uses the share sheet | Growth: learners show off solved problems | Made in the browser (SVG → canvas → PNG), no server. No names unless the learner adds one. **Owner decides** (spec 21 §19 already lists "names on shared solutions") |

**Graphics rules** (in addition to spec 20 §3.4): every drawing is made from the parts in `figs/parts.jsx` and the
colours in `palette.js`, so it changes with the theme and with the tokens; no raster pictures except G5 / G6 output;
no stock illustrations, no characters, no emoji; every drawing has a `<title>` (as the figures do) or `aria-hidden`
when the text next to it already says the same thing.

---

## 6. Accessibility and honesty checks for all of the above

- Every swipe has a button (§1.3 rule 6); every button is reachable with the keyboard; ← → work on tab rows and on
  figure steps when focused.
- Reduced motion: settles are instant, figures are still, A2–A10 don't run, the reading line stays (spec 20).
- No gesture or animation is the only way to learn a result: the verdict is text, stars have `aria-label`, the
  streak is a number.
- 44 × 44 px touch targets for ‹ ›, pause, the sheet handle.
- Testing words (bootstrap §5): Playwright with mobile emulation and CDP touch events (`Input.dispatchTouchEvent`)
  checks the thresholds, the direction lock and the edge exclusion. **It is not a phone test.** Edge-swipe
  interplay with Android gesture navigation and iOS Safari, momentum feel, and frame rate on a low-end Android need a
  real device. The owner's five-friends phone test (Practice step 9, `18-TODO.md`) is the place to do it. A checklist
  for it is in §8.

---

## 7. Work packages (one PR each)

| WP | Contents | Size | Acceptance |
|---|---|---|---|
| **UX1** ✅ #323 | `theme/gesture.js` + tests; S4 drawer drag-to-close; S5 swipe down to close full screen | S | `gesture.test.js` passes; e2e: drawer follows a touch drag and closes past 35 %, returns below; a touch starting within 24 px of the edge does nothing; vertical scroll in the drawer unaffected |
| **UX2** ✅ #323 | A1 + S2: figure step controls on all `Caps` figures | M | All 232 figures still draw (the existing figure sweep); a `Caps` figure: ‹ › land on each step's caption; pause holds; off-screen pause still works; reduced motion shows no controls |
| **UX3** ✅ #323 | S1 Practice pager | M | At 360 px: swipe Problem → Design → Result and back; the underline follows; a sideways pan on a table or code block never changes the tab; each pane keeps its scroll; Run on Design lands on Result |
| **UX4** ✅ #324 | A2 view transitions (no title morph, §10); A4 contents marker; A5 stars; A9 copied; A10 theme fade | S | Chrome: transitions run, no double entrance with `motion.css`; Firefox: nothing changes; reduced motion: none of it |
| **UX5** | G2 + A3: Practice diagram in figure parts, with motion | M | Golden designs from `tkd/golden/` draw without overlap; typing doesn't animate; Accepted runs dots for three loops then stops |
| **UX6** | S3 sheet drag (workspace result sheet) | S | Drag from the handle folds and opens; drag on the body scrolls |
| **UX7** | G3 state scenes; G4 section marks; A6 streak; A7 landing count-up | S | Each state shows its scene in light and dark; one scene per screen |
| **UX8** | G1 phone figures, ten articles per PR, starting with the free and most-read ones | L (7 PRs) | Phone-figure label test passes; side-by-side review screenshots at 360 px light and dark in the PR |
| later | G5 link previews, G6 share card, A8 / S7 with spec 22 phase B, S6 tour swipe | — | owner decisions first |

Each WP follows the normal workflow (handover §3): PR → required checks green → squash merge → verify on production →
ledger → update this file's status and `09-MOBILE-SWIPE.md`.

---

## 8. Phone checklist (for the five-friends test or any real-device check)

1. Android with gesture navigation: from an article, swipe in from the left edge. The phone goes Back; the drawer
   does not open; nothing else moves.
2. Open the drawer from the menu button; drag it left halfway and let go slowly → it closes. A short drag → it returns.
3. In an article, pan a figure sideways to its end and keep going → the page doesn't move sideways and nothing navigates.
4. Step through a figure with ‹ › and by swiping its step line; read every caption without rushing.
5. Full-screen a figure, turn the phone, swipe down → it closes.
6. Practice on a phone: swipe Problem → Design → Result → back; pan a table inside a pane without
   changing tabs; Run from Design lands on Result.
7. Scroll an article quickly on the cheapest phone available: does the header stutter? (§4.3)
8. iPhone Safari: repeat 1 (edge swipe = history back), 3 and 6.

---

## 9. Decisions

The owner, 2026-11-13: **"Take decisions yourself."** So the session decided each item below. Each one can be reversed.

| # | Question | Decision | Why |
|---|---|---|---|
| 1 | Bring back the back/forward swipe? | **No** | Phones do it from the edge (§1.2). Built that way in #323 |
| 2 | The gesture rules (§1.3) | **Keep them as built** | Its numbers live in one file, `theme/gesture.js` |
| 3 | Order of work | **§11.2**, ranks 1–2 done (#325, #326) | |
| 4 | Analytics for swipes and figure steps | **Yes**, `fig_step {fig, via}` once per figure per page view; `practice_pane {problem, to, via}` | Fields only, no design text, no personal data, same 13-month retention. They answer §11.5. Built in #325 |
| 5 | G1 phone figures (66 drawings) | **Yes**, ten articles per PR, free and most-read first | The remaining phone pain in articles |
| 6 | G5 link preview per article | **Not now** | It needs a native SVG-to-PNG build dependency; the one shared image (#320) is fine until launch |
| 7 | G6 share card for Accepted | **Yes, without names**, made in the browser | Growth with no personal data |
| 8 | Header blur on phones | **Solid header below 680 px** | Couldn't measure a cheap phone from here, so take the safe side. Built in #325 |
| 9 | UX6 sheet drag | **Dropped** | The old canvas workspace is likely to be retired (spec 21 §19) |

## 10. What building UX1–UX4 taught us (2026-11-13)

These are rules now. Each one caused a real bug or a wrong plan while building #323 and #324.

| # | Lesson | What happened | Rule |
|---|---|---|---|
| 1 | **`touch-action` must be on every scroll container between the finger and the swipe** | The drawer did not close on a drag. Its link list (`.side-nav`, `overflow-y: auto`) is a scroll container with `touch-action: auto`. Chrome gave it the horizontal pan and sent `pointercancel` after the first move, **although the list cannot scroll sideways** | Give `touch-action: pan-y` to the swiping element **and** to each scroll container inside it that is not meant to pan sideways (`.open .side-nav`; in Practice `.pr-console`, `.pr-editor`, `.pr-left-body`, `.pd`). Leave real sideways scrollers (tables, the request chain) alone: they should keep their pan |
| 2 | **A drag past its limit never commits** | On the last Practice pane, a long swipe left still read as "go" and opened a pane that doesn't exist (empty page) | `release()` in `gesture.js` returns 0 past `min` / `max`, however far or fast; unit-tested. Callers also check that the target exists |
| 3 | **Figures load after the article** | Figure modules are separate chunks, so a figure's SVG often appears after the page and after the IntersectionObserver's first answer. Off-screen figures never learned their step count, so their controls would have popped in later and shifted the page | `useSteps` polls every 200 ms until the SVG exists, reads its structure once even off screen, and starts the loop on its first visible tick |
| 4 | **Reduced motion still needs the caption on phones** | Under reduced motion figures draw their still version with one `Cap`. The phone CSS hides captions inside the SVG, so the step line above must still show it | The step bar renders under reduced motion with the caption only (no buttons) |
| 5 | **Buttons with SVG icons sit inside the figure** | Tests that asked for `.a-fig svg` got the pause icon, not the figure | Query `.a-fig-body svg` for the figure. Any code that looks for a figure's SVG must do the same |
| 6 | **The title morph can't work yet** | A card title can't become the article title, because the article JSON loads after the route changes. When the new view is captured, the title isn't there | The cross-fade stays. A morph needs the article prefetched on press (`pointerdown` on a card) and the transition started only once it's in memory. Not worth it now |
| 7 | **Scroll snap was the wrong tool for Practice** | §2.1: the phone page scrolls as one, with sticky and fixed bars | Same hook as the other swipes; restore each pane's scroll by hand |
| 8 | **`vite preview` doesn't rewrite `/dashboard/practice/<slug>/`** | Locally it serves the landing page; Vercel rewrites it on production | Local tests use `/dashboard/#practice/<slug>` |
| 9 | **The 2.5 s step problem was real** | A 20-word caption on a phone could not be read before the next step faded in | Now solved by stepping, not by slowing every figure. Keep `SPEED` at 0.7 |
| 10 | **One line per kind of request looked like doubled arrows** | The owner's screenshot of #326: "Why such double arrows are present". Since #317 the Practice diagram drew a read line and a write line 3 px apart on every hop they shared, with stacked arrowheads and no key | One arrow per hop (#327): ink for reads, ochre for writes, and one ink band with an ochre core for both. A key above the drawing, and fixed-size arrowheads. Rule for every diagram we draw: a hop is one arrow; what uses it is shown by colour and a key, never by drawing it twice |

Browser checks for all of this are in `tools/e2e/`: `swipes-figures.js` (25 checks), `swipes-practice.js` (29) and
`motion-polish.js` (14). Practice works against production. The article checks need a local API, because articles
need sign-in on production.

---

## 11. Second pass: what to do next, and why

The first pass ranked work by how visible it is. This pass ranks it by **what a learner on a phone actually meets**, now
that swipes and figure steps exist.

### 11.1 A gap found while building: phone learners never see their own design

On a phone, the Practice Design pane is the **Builder** (forms). The diagram (`practice/diagram.jsx`) is shown only in
the desktop split. So the moment the whole product is about, "my design, drawn, with requests flowing through it",
**does not exist on phones**, where most learners are (§1.1).

**Proposal (new, ranks first):** on phones, show the diagram

- at the top of the **Result** pane after Run or Submit, with the blamed part in red (the diagram already marks it);
- behind a "See the diagram" button at the top of the **Design** pane. It opens a bottom sheet that scrolls sideways,
  with the same 24 px edge rule and its own pan (`.pr-diagram` is already excluded from the pane swipe).

That makes G2 + A3 (UX5) worth much more: the motion would be seen by everyone, not only by desktop users.

### 11.2 The new order

| Rank | Work | Why now | Size |
|---|---|---|---|
| 1 ✅ | **UX5+**: diagram on phones (11.1) ✅ #326, motion (A3) ✅ #326, arrows fixed #327; drawn with the figure parts (G2) still to do | The core reward of Practice, missing on the main device. Do it before the five-friends test (Practice step 9), so friends see it | M |
| 2 ✅ #325 | **One figure loop at a time on phones** (§4.3 row 1) | Cheap, and it protects low-end Android from two SMIL loops plus glints at once. Now easy: `useSteps` already knows which figures are visible. Pause all but the most visible | S |
| 3 ✅ #328 | **G3 state scenes** (UX7, first half) | "Couldn't load", "doesn't exist", "No submissions yet" and the judge being busy are moments of friction. A scene in the site's own language softens them, at almost no cost | S |
| 4 | **G1 phone figures** (UX8), first ten articles | Stepping fixed the timing; panning is the remaining phone pain in articles | L |
| 5 | A6 streak, A7 count-up (UX7, second half) | Small delights; no friction removed | S |
| — | **UX6 sheet drag: drop it** unless the canvas stays | The `.sv-console` sheet belongs to the old canvas workspace. Spec 21 §19 asks the owner whether Practice retires the canvas. If it does, this work is wasted | — |
| — | G5 link previews, G6 share card | Growth. They need owner decisions (§9) | — |

### 11.3 Decided while thinking it through (no owner input needed; reversible)

- **No haptics.** iPhone Safari has no Vibration API, so a tick would only exist on Android. Two behaviours for one
  gesture is worse than none.
- **No swipe hints or coach marks.** Every swipe has a visible button or tab (§1.3 rule 6). A swipe is a shortcut for
  people who try it, never something to teach.
- **No trackpad swipes on desktop.** A two-finger sideways swipe is the browser's Back on macOS.
- **No sound**, as in spec 20.
- **Figure stepping stays per figure.** Stepping one figure doesn't pause the others, and there is no global "pause
  all figures" switch. Reduced motion already gives still figures to anyone who wants them.

### 11.4 Watch on real phones (add to the five-friends test, §8)

- **iOS Safari:** pointer events with `touch-action: pan-y` inside the drawer and the Practice panes. Does a vertical
  scroll that starts slightly sideways still scroll? (The 1.25 lock should let it.)
- **Android Chrome:** does a swipe down on a full-screen figure ever start pull-to-refresh? (`touch-action: pinch-zoom`
  on the stage should stop it.)
- **Both:** in Practice, does a quick sideways swipe on the Builder that starts on a select open the select? (Form
  fields are excluded from starting a drag. A select opens on tap, not on drag, but check.)
- **Low-end Android:** frame rate while dragging the drawer and a Practice pane (transforms only, so it should hold 60 fps).

### 11.5 How we'll know it works

Built in #325 (§9 decision 4). They are in `techkatta_app.events`:

- `fig_step` `{ article, fig, via: "button" | "swipe" | "key" }`: do readers actually step through figures, or was
  the timing fine?
- `practice_pane` `{ problem, to, via: "swipe" | "tap" }`: do phone learners swipe, or only tap?
