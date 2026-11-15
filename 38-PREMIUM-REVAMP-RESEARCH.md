# 38 · Premium revamp: research and options (no decision yet)

Date: 2026-11-15.

The owner asked: "revamp the entire website in terms of UI UX. Let the rest of the things on website like content,
widgets, tabs, canvas remain the same in terms of how they work. I want to give the user a premium website … First
go on the web or use connectors … Search for best UI UX website for online courses. Gather information, think on it
and then we will take the decision." Also: don't merge PR #365 for now.

**Status:** research only. Nothing is built. The owner decides (§7).

## 1. How the research was done

- **Real sites, looked at in Chromium** (`ref/grab.js`), on 2026-11-15: the first screen and the long page at
  1440 px, plus a Pixel 7 screen. Fonts and backgrounds were read from the live pages.
- **Course sites:**
  - Brilliant, Khan Academy, Scrimba, Boot.dev;
  - Frontend Masters (now master.dev), The Joy of React (Josh Comeau), animations.dev (Emil Kowalski);
  - CodeCrafters.
- **The system-design competitors:**
  - Hello Interview: home and the Bitly breakdown;
  - ByteByteGo: home and a course chapter;
  - Educative: home and the Grokking course page.
- **Premium benchmarks outside education:** Linear and Claude Academy.
- **Web searches:** course roundups (mostly affiliate lists, weak); Brilliant's design (ustwo case study, Rive
  animations); Josh Comeau's and Emil Kowalski's own course platforms; edtech UX guidance on progress and
  orientation (blogs and one 2024 paper; no rigorous studies found).
- **Pictures** are in `ui-redesign/research-2026-11-15/`:
  - `tops.jpg`: first screens of 11 sites;
  - `fulls.jpg`: long pages of the five best;
  - `inner.jpg`: competitor lesson and course pages;
  - `linear.app-top.jpg` and `anthropic.com_learn-top.jpg`.
- **Connectors:**
  - Figma is connected and usable for mock-ups.
  - Mobbin is connected but answers "requires a paid plan" (its pattern library would help here).
  - Nothing else in the registry fits this task.

## 2. What the best ones do

| Site | Look | What makes it feel premium |
|---|---|---|
| **Brilliant** | White page, one green brand colour, serif-ish display (CoFo Robert 500), product cards fanned out in the hero | Hero shows the **product itself** (lesson cards). One headline, one primary button. Each section is one idea: a picture on one side, two lines of text on the other. Rive characters and motion, made with ustwo. |
| **The Joy of React** | Dark, a glowing 3D mascot, purple gradient, Wotfard 600 | **Author-led** ("Taught by Josh W Comeau"). A long, personal sales letter. Whimsy that is crafted, not stock. A custom course platform. |
| **animations.dev** | Near-white `#fdfdfc`, Inter 575, tiny monochrome illustrations | **Restraint.** Almost nothing on the first screen: a question as the headline, one line, the author's face. Interactive demos inside the page. "Hey, I'm Emil" at the end. |
| **CodeCrafters** | Near-black, **Source Serif 4 at 400 for headlines with Geist** for the interface, hairline grid lines | Serif at a light weight on dark looks editorial and serious. Challenge cards everywhere. "Simple by design: 1, 2, 3". Big company logos. |
| **Linear** (benchmark) | Near-black, Inter, very fine lines, product screenshots | Consistency: one type scale, one radius, one line weight, and nothing extra. |
| Frontend Masters | Dark, a photo of a teacher, system font | Credibility from real teachers and video. Less crafted. |
| Khan Academy, Scrimba, Boot.dev | Busy: banners, donation popups, game art | Not premium. They show what to avoid: banners, many colours, many competing buttons. |

**The system-design competitors:**
- **Hello Interview** (the closest): a white page with teal. In a lesson it has:
  - a left course nav with locks;
  - author, updated date, difficulty and "Asked at" company logos;
  - a **video walkthrough card**;
  - a "Premium" card;
  - a **reading-progress bar** and "On this page".

  It is clean but plain, not crafted.
- **ByteByteGo:** a loud green with rainbow cards. The chapter page is a sidebar of chapters with "0/31 completed",
  big chapter numbers and the book's diagrams.
- **Educative:** a dark purple hero, a flash-sale banner, an owl mascot, discount pop-ups. It feels like a sales
  funnel, not premium.

**The gap:** no system-design site has the craft of Brilliant, Joy of React or animations.dev. They are documentation
sites or sales funnels. A crafted, author-led, calm site with moving figures and a real judge is a clear way to stand
out.

## 3. Patterns that repeat on every premium course site

1. **One idea per screen.** The hero is one headline, one line and one primary button; everything else waits for
   the scroll. Ours has a chip, a headline, a line, two buttons, a "New here?" link, a large figure and a judge card,
   all at once.
2. **Show the product, not a description of it.** Brilliant shows lesson cards; CodeCrafters shows challenge cards;
   animations.dev puts a working demo inside the page. Ours shows a Kafka diagram, which is good but very technical
   for a first look.
3. **An author you can see.** "Taught by …" with a face appears on Joy of React, animations.dev and Frontend
   Masters, and on Hello Interview lessons. The owner's coming videos fit this exactly. We have none: "Written and
   maintained by one engineer" sits in the footer.
4. **Calm type with few weights.** One display face at a light weight (400–600) and a clean sans at body size. Ours
   (Source Serif 4, Instrument Sans, Geist Mono) is already the CodeCrafters family. Keep the faces; use fewer
   sizes, fewer mono capitals, and less letter-spacing.
5. **A neutral page and one colour that acts.** Brilliant uses green, Hello Interview teal, animations.dev
   near-monochrome; dark sites use one glow. Many colours read as cheap (Boot.dev, ByteByteGo, Khan).
6. **Progress you can see.**
   - "0/31 completed" in ByteByteGo's chapter list;
   - a reading-progress bar and check marks in Hello Interview;
   - Brilliant's streaks.

   We have a progress ring on the dashboard home, but lessons show no completion.
7. **Orientation in a lesson.** A left course nav, a right "On this page" and a progress bar; difficulty and time at
   the top. We already have the sidebar and rail. The difference is polish and density.
8. **Motion with purpose.** Brilliant's tutor and Joy of React's mascot are crafted characters. animations.dev uses
   small, exact transitions. Our figures that play step by step are already our strongest asset; the chrome around
   them should be quieter so they stand out.
9. **Honest proof.** Logos and testimonials are everywhere, but we have none yet and must not fake them. The honest
   version: the author, real numbers ("22 problems with tests"), and a live demo you can run (IND vs PAK already does
   this).
10. **No noise.** Premium sites have no sale banners, no pop-ups on arrival and no cookie walls covering the hero.
    Education sites that have them (Educative, Khan) look cheap.

## 4. What this means for Tech Katta (the parts that stay)

The owner's rule: content, widgets, tabs and the canvas keep working exactly as they do. A revamp then means
everything around them:
- **The visual system:** colour, type scale, spacing, radius, lines, shadows and motion, in tokens.
- **The landing page:** its structure and order, the hero, a "taught by" section, how it works, the live demo, the
  plain-words explanation.
- **The app shell:** sidebar, header, page headers, breadcrumbs.
- **Catalogue pages:** section lists and topic cards, laid out as a course with modules, progress and difficulty.
- **The lesson page chrome:** title block (author, updated, difficulty, time), the progress bar, check marks, the
  video slot for the owner's videos, the rail.
- **The skin of components:** buttons, tabs, chips, cards, tables, dialogs, empty and loading states, toasts.
- **Phone layouts and gestures:** reviewed screen by screen.

## 5. Three directions

| | Direction | Like | What changes | Risk |
|---|---|---|---|---|
| **1** | **Editorial light, author-led** | Brilliant, animations.dev, Hello Interview's lesson page done with care | A white, calm page. A light serif display. Marigold only on the main action (navy for links, as in 33). A hero with one headline and the product (a moving figure or the judge) beside it. "Taught by Yash" with a photo and the videos. Lessons with a progress bar, check marks, difficulty, updated date and a video slot. A course-like catalogue with completion. | Lowest. It builds on what the owner has chosen before (Brilliant was liked, #334; marigold, #338). |
| 2 | Premium dark | CodeCrafters, Linear, Joy of React | Dark first, a light serif on near-black, hairline grids, glowing figures, and the landing as a crafted sales letter | The owner tried dark-first (#336–#337) and went back to paper (#338). Long articles read worse on dark in daylight on phones. |
| 3 | App first | Brilliant's app, Scrimba | The landing becomes short; the dashboard becomes the product: a "continue" card, paths, streak, catalogue cards. Little marketing. | Good for returning users, weak for a first visit, which matters at launch. |

**Recommendation: 1, with the best parts of 3** (a "continue where you left off" card and progress on the dashboard).
- It matches every pattern in §3.
- It keeps what the owner has already said yes to.
- It gives the coming videos a natural place.
- It stands apart from every system-design competitor.

## 6. How to do it without breaking anything

1. **Owner picks the direction** (§7).
2. **Design system first:** tokens (colour, type scale, spacing, radius, motion) and a component sheet. Mock up key
   screens in **Figma** (connected) for the owner to approve before code: landing, dashboard home, a section, a
   lesson, Problems, the workspace chrome, and phone versions.
3. **Build on a branch,** page by page, with no change to content JSON, widget logic, tabs or the canvas engine.
   Each step gets a Vercel preview for the owner. Existing e2e and unit tests stay green, which proves behaviour is
   unchanged.
4. **Merge once,** after the owner has seen it all, because a half-new look reads worse than either. Rollback is
   one Vercel promote.

**PR #365** (the reviewer's fixes and the navy light theme) is on hold.
- Its functional fixes still apply whatever the direction: locked cards, stars, re-grade, read aloud removed, back to
  top, consent text.
- Its colour commit may be replaced by the revamp.
- Since #366 it conflicts in `dashboard/article.jsx` and `dashboard/shell.jsx`.
- Suggestion: bring it up to date with `main` and keep the functional fixes. Fold the colours into the revamp.

## 7. Decisions for the owner

1. **Direction:** 1 (editorial light, author-led), 2 (premium dark) or 3 (app first)?
2. **Author-led:** put your name, photo and the videos on the landing page and on lessons, as Josh Comeau and Emil
   Kowalski do?
3. **Mock-ups in Figma first,** or straight to a coded preview?
4. **Mobbin:** worth the paid plan for this project (its screen and flow library of real apps), or carry on with
   direct site research?
5. **PR #365:** update it and merge only the functional fixes now, or hold everything for the revamp?
6. **Anything in the brand that must not change:** marigold, the "TK" mark, Zotato, the serif headlines?

## Sources

- Brilliant's design with ustwo: <https://ustwo.com/work/brilliant>
- Brilliant and Rive: <https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations>
- Emil Kowalski on building his course platform: <https://emilkowal.ski/ui/how-i-built-my-course-platform>
- Josh Comeau's courses: <https://www.joshwcomeau.com/courses/>
- Awwwards, culture and education: <https://www.awwwards.com/inspiration_search/culture-education/>
- E-learning UX notes: <https://www.eleken.co/blog-posts/lms-ux>,
  <https://www.scitepress.org/publishedPapers/2024/123746/pdf/index.html>
- The sites themselves, visited 2026-11-15: brilliant.org, joyofreact.com, animations.dev, codecrafters.io,
  linear.app, frontendmasters.com, hellointerview.com, bytebytego.com, educative.io, khanacademy.org, scrimba.com,
  boot.dev, anthropic.com/learn.
