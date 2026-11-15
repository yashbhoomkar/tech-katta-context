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

## 9. Round 2: more sites, and Podia (owner: "Don't be in hurry, research more. Did you like Podia?")

**More sites, live in Chromium:**
- **Podia:** the owner's screenshot and its current site.
- **Maven, Teachable, Domestika, Skillshare, SuperHi, Exercism, Interaction Design Foundation.**
- **Phone views** of Podia, Brilliant, Maven, Hello Interview, Joy of React and animations.dev.

**Pictures** (in `ui-redesign/research-2026-11-15/`):
- `tops2.jpg`;
- `podia-full.jpg` and `podia-player.jpg`;
- `podia-owner-screenshot.jpg`;
- `maven-full.jpg`;
- `phones.jpg`.

### Podia

**The owner's screenshot** is Podia's earlier site: a warm off-white page, one headline ("The all-in-one for teams of
one"), one line and one black button, soft coloured shapes floating around, and three colour-coded product cards
(Online store, Website, Email marketing) rising from the bottom. **Today's site** has moved to a bold editorial
collage: photo cut-outs, hand-drawn lines, big type.

**What is good in it, and fits us:**
- **A calm first screen:** one headline, one line, one button. It is the same rule as Brilliant and animations.dev.
- **One soft colour per area.** Each product has its own pastel card, so a visitor sees the three parts at once and
  can tell them apart. For us, each section could have its own soft colour on its cards and in its header: Concepts,
  Components, Interview Questions, Problems, Real Systems. It helps orientation, and it helps someone outside tech
  understand "there are four kinds of things here" (the reviewer's first point).
- **The product rising from the bottom of the hero:** you see the real thing before you scroll.
- **The course player ("Take a look inside", `podia-player.jpg`) is the strongest part for us:**
  - a left curriculum with **"4 of 25 completed (16%)" and a progress bar**;
  - collapsible weeks, with an icon per lesson type (video, text, quiz);
  - at the top, the lesson title, previous and next, and a **"Complete"** button;
  - the video first, then the text, then comments.

  Our sidebar and article already have most of it. Completion, "Mark complete" and a video slot are what is missing.

**What doesn't fit:**
- **It sells software to creators.** It's a marketing page, not a learning experience.
- **The floating pastel blobs** are the "friendly SaaS" look of a few years ago. They are generic, and for system
  design they risk reading as playful rather than expert. Podia itself has since replaced them with a bolder,
  editorial look.
- **Decoration for its own sake:** our moving figures are real content, so they should play that role, not shapes.

**Verdict:** take Podia's **structure** (a calm hero, colour-coded section cards, the course player with completion),
not its decoration.

### The others

- **Maven** (expert-led cohort courses) **is the closest in spirit to what we want:**
  - a navy page with a light serif headline ("Learn GTM / from real-world experts");
  - every course card shows the **teacher's face, name and role**, plus "Live", length and start date;
  - calm white cards on navy, category tiles with a thin coloured glow.

  It shows how "author-led" looks at catalogue scale, and its navy matches 33's accent.
- **Teachable:** a serif headline with a lime button, looking calm. Cookie and migration banners spoil the first
  screen.
- **SuperHi:** big geometric shapes in primary colours. Bold and art-school, too loud for us.
- **Domestika and Skillshare:** a Black Friday banner, a countdown, photo walls and sign-up walls: marketplace
  noise. These show what to avoid.
- **Exercism:** friendly illustrations, a highlighter word in the headline ("really"; we use the same idea), purple.
  Approachable, not premium.
- **Interaction Design Foundation:** quotes from Don Norman and IBM, logos, blue. Credible, but crowded.
- **Phones:** the premium ones (animations.dev, Joy of React, Brilliant) keep one idea per screen on a phone too: a
  big headline, one button, the teacher's face. Podia, Brilliant and Teachable lose the first phone screen to a
  cookie banner; we have none, which is a small advantage.

### What round 2 changes

It confirms direction 1 (editorial light, author-led) and adds three concrete pieces to it:
1. **Colour-coded sections** (Podia): one soft tint per section on cards and section headers. The brand stays
   marigold; links stay navy.
2. **A course player with completion** (Podia, ByteByteGo, Hello Interview):
   - "n of N done" and a progress bar in the sidebar;
   - a "Mark complete" button and previous and next on every article;
   - a video slot above the article for the owner's videos.
3. **The teacher's face on cards** (Maven): on the landing page, on lesson headers and on problem cards once the
   videos exist.

## 10. Figma mock-ups (2026-11-15, in progress)

**The owner's direction:** "The screenshot that I gave you [Podia] was better … think what will be inside the website.
Create figma mockups for the entire website."

**File:** "Tech Katta — Premium revamp", <https://www.figma.com/design/bwoNaFkgsbtA1L4223wRCr>, in the owner's own team.

**The design language** (from Podia's old landing page, carried inside):
- **Page and text:** a warm off-white page `#F6F5F1`, white surfaces, near-black ink `#17161A`.
- **Buttons:** **black pill primary buttons**, white secondary buttons with a hairline.
- **Brand:** marigold only in the TK mark and small highlights.
- **One soft colour per section, used everywhere:**

  | Section | Colour |
  |---|---|
  | Concepts | blue `#A9CBE0` |
  | Components | orange `#E9A050` |
  | Interview Questions | lilac `#CDB8F0` |
  | Problems | mint `#A6DCC5` |
  | Real Systems | coral `#F3B9A6` |
  | Quick Notes | butter `#F4DE8A` |

  Each section also has a pale tint of its colour for backgrounds.
- **Type:** Instrument Sans SemiBold for headings (tight tracking), with "explained." in Source Serif 4 Italic as the one
  serif touch. Geist Mono only for small labels.
- **Tokens:** all colours are Figma variables (collection "Tech Katta colours", 28 tokens).
- **Components:** Button primary and secondary, Chip, Section card, Logo, Sidebar item, Lesson row.

**Built:**
1. **Landing:** the hero has one headline, one line, a black button and soft floating shapes, with four colour-coded
   section cards (each with a mini preview) rising over a white arc. Below it, in order:
   - "In plain words", in 3 steps;
   - "Take a look inside": the course player;
   - the judge, with test rows and a score;
   - "Taught by" Yash;
   - numbers;
   - a dark final call;
   - the footer.
2. **Dashboard home:** a sidebar with a colour dot per section, a greeting, "Continue where you left off" with
   progress, Your progress (lessons, problems, stars), problem of the day, a streak, and Explore cards in the section
   colours with completion.
3. **Section page (Concepts):** a coloured header band with "3 of 21 done" and Continue, then modules (Core concepts,
   Recurring patterns) as lists with done ticks, numbers, read times and "In progress 40%".

**Not built yet:** the Figma MCP's Starter-plan limit was reached after 10 calls (6–20 calls a month on Starter;
Professional allows 200 a day).
- **Specified, waiting to be built:**
  - **lesson page:** a course player with a curriculum and progress, a reading-progress bar, a video slot, Cards / Full
    text, a figure, "Say this in the interview", "Mark complete & next", and a right rail with a Try-it card;
  - **Problems:** a mint header with stats, filter chips, a table with difficulty chips and stars, challenge cards;
  - **problem workspace chrome;**
  - **the sign-in dialog;**
  - **phone versions.**
- The code for the lesson page and Problems is written; it failed only on the limit.

### 10b. Canva, then an HTML prototype (2026-11-15)

**Canva:** Figma takes no UPI, so the owner added the Canva connector. Canva Free has a monthly AI allowance of unpublished
size, reset on the 1st; Pro accepts UPI. One test lesson page was generated (Canva design "Tech Katta lesson website").
It had the right structure, but:
- the title and paragraph were doubled;
- the lesson numbers were wrong;
- it came out as one 1366×768 slide;
- there was no font control, components or shared colours.

**Not used.**

**Decided (owner): an HTML prototype.**
- **Where:** `ui-redesign/prototype-2026-11-15/tech-katta-revamp.html`, published privately as the artifact
  <https://claude.ai/artifact/Li2Z68gdhcUtdY5WPTSAEX>.
- **Style:** the same as the Figma file: tokens, section colours, black pill buttons, Instrument Sans, Source Serif 4
  and Geist Mono, light and dark.
- **Seven screens, switched by hash:**
  - landing (`#home`);
  - dashboard;
  - a section (Concepts);
  - the lesson player;
  - Problems;
  - the workspace;
  - the sign-in dialog.
- **What works:** difficulty filters, "Mark complete & next" (it updates the curriculum progress), Cards / Full text,
  the curriculum drawer on phones, Run and Submit results, the consent box that unlocks the Google button, and a
  theme toggle.
- **Checked:** Chromium at 1440 px and on a Pixel 7: no script errors, no horizontal overflow after the fixes.

## 8. Is Mobbin worth it for us? (checked 2026-11-15)

**What it costs:**
- Pro is about **$10 a month billed yearly ($120), or $45 a quarter.** Its own pricing page shows the price by region;
  the figures are from reviews (noqode.fr, gummble.com).
- The MCP (search screens, flows and website sections from Claude) needs Pro; the free plan doesn't include it.
- Team is about $16 per member per month. There is a student discount.

**What it has for us:** its web "Education" category has signed-in screens of:
- Brilliant;
- MasterClass;
- Codecademy;
- Duolingo;
- Skillshare;
- Udemy;
- Kajabi;
- SuperHi.

They are tagged *Class & Lesson Detail*, *Progress*, *Watching Video*, *Starting & Completing* and *Onboarding*.
That is exactly the part of the revamp we can't research by browsing: the lesson page, progress, video lessons and
dashboards behind a login. Landing pages we can already study for free, as §1–3 did.

**What it doesn't change:** the direction. §2–5 already rest on 13 live sites. Mobbin would sharpen the lesson page,
dashboard and progress designs, not the overall choice.

**Free alternatives:**
- Refero's free tier is about 3% of its library.
- Page Flows has a 3-day trial.
- Hello Interview and ByteByteGo lessons are public, and we have studied them.

**Catch:** the owner pays by UPI and has no credit card (31 §4c). Check that Mobbin accepts the payment method
before planning on it.

**Verdict:** worth one quarter (about $45) if we go ahead with the revamp, bought at the start of the design step and
cancelled after. Skip it if the payment doesn't work: direct research covers direction 1's landing page, and public
lessons cover most of the lesson-page work. Not worth a yearly plan for this project. Rule for using it: references
for patterns only, never copying a product's look.

## Sources

- Brilliant's design with ustwo: <https://ustwo.com/work/brilliant>
- Brilliant and Rive: <https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations>
- Emil Kowalski on building his course platform: <https://emilkowal.ski/ui/how-i-built-my-course-platform>
- Josh Comeau's courses: <https://www.joshwcomeau.com/courses/>
- Awwwards, culture and education: <https://www.awwwards.com/inspiration_search/culture-education/>
- Round 2 sites, visited 2026-11-15: podia.com, maven.com, teachable.com, domestika.org, skillshare.com, superhi.com,
  exercism.org, interaction-design.org
- Mobbin: <https://mobbin.com/pricing>, <https://mobbin.com/explore/web/app-categories/education>,
  <https://www.noqode.fr/en/outils/mobbin>, <https://gummble.com/blog/gummble-mcp-vs-mobbin-mcp>,
  <https://www.saasframe.io/compare>
- E-learning UX notes: <https://www.eleken.co/blog-posts/lms-ux>,
  <https://www.scitepress.org/publishedPapers/2024/123746/pdf/index.html>
- The sites themselves, visited 2026-11-15: brilliant.org, joyofreact.com, animations.dev, codecrafters.io,
  linear.app, frontendmasters.com, hellointerview.com, bytebytego.com, educative.io, khanacademy.org, scrimba.com,
  boot.dev, anthropic.com/learn.


## 11. Outcome so far (2026-11-15)

The research led to the Podia-inspired **full-site** prototype on prototype.katta.cc. It has been through motion, every
control working, a structured rebuild with new navigation, a phone pass, and three rounds of dark mode ending in F2
"vivid, balanced", with light colours balanced to match. A second style, **neo-brutalism**, is on rounds 1–3; its dark
theme is still being rethought. Details and decisions: `ui-prototypes/TRIED.md`. Nothing is built into the real app
yet.
