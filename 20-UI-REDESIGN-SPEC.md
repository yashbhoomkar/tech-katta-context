# 20 — UI redesign spec: "Katta Paper"

**Status:** **built and live** (tech-katta #309, 2026-11-12; three fixes inside the appended blocks are listed in the PR and in `17-SESSION-HANDOVER.md`; follow-ups #310; figure motion #311 and every animation about a quarter faster #312, so the durations in 4.5, 4.6 and Appendix D are now the shorter ones in `theme/motion.css` and `--dur-enter` 0.28 s). Originally: approved direction to build. Written 12 Nov 2026; detailed instructions for animation (4.6) and UI features and behaviour (4.7) added; revised the same day after the owner's reviews: the old blue in figures and the canvas replaced (first by teal, rejected; now by ochre lines with marigold fills, so the whole site stays in one yellow family), and a motion layer added (section 4.5, WP8, Appendix D).
**Who reads this:** the agent that will write the code. It is written so that you can follow it top to bottom
without making design decisions. Where a decision belongs to the owner, it is listed in section 10 and you leave it alone.
**What it replaces:** the "Swiss publishing" look that is live on tech.katta.cc, and the direction in the app repo's
`Design.md` (that file studied one site, fanout.sh; the owner rejected a look that close to it). `Design.md` stays in
the repo as a record of observations only. **Do not use its Part B.**

Pictures of the finished look (a working build made while writing this file) are in [`ui-redesign/`](ui-redesign/).
Look at them before you start, and compare your build against them when you finish.

| Picture | Shows |
|---|---|
| `01-landing-light.png`, `02-landing-dark.png` | Landing page, 1366 px wide |
| `03-start.png` | Dashboard start page |
| `04-section.png` | A section page (Concepts) |
| `05-article.png`, `10-article-body.png` | An article: top, and three pieces of the body (light, dark, light) |
| `06-problems.png` | Problems list |
| `07-workspace.png`, `11-workspace-result.png` | Problem workspace: a component selected on the canvas; the result sheet after Run |
| `08-phones.png` | Pixel 7: landing, section, problems, article (light), article and landing (dark) |
| `09-dark.png` | Dark mode: landing, problems, workspace |
| `12-figures-ochre-marigold.png` | **The final figure colours**: landing diagram light and dark, and the canvas with a component selected |

**Colour note on the pictures.** Pictures 01, 02, 05, 07 and 12 show the final colours. Pictures 08 to 11 were taken
one revision earlier, when figure lines and links were teal: use them for layout, sizes and spacing only. Wherever
they show teal, the build must show ochre lines and marigold fills as in picture 12.

---

## 0. Read this first (rules for the implementing agent)

1. **Do the work packages in section 8 in order.** Each one ends with a check. Do not start the next until the check passes.
2. **Copy the code blocks exactly.** The CSS in Appendix C was built and looked at in a real build of the site
   (commit `01adfbe` of `tech-katta`, the state after PR #308). Do not "improve" values. If something looks wrong,
   first check that you pasted the block at the **end** of the right file.
3. **Do not change any JSX, content, route, test or backend file** except the small edits listed in section 8
   (WP1, WP2 and WP8; WP1 includes one-line edits to `palette.js` and `main.jsx`). The redesign is almost entirely CSS.
4. **No colour codes outside `frontend/src/theme/`.** `theme.test.js` fails the build if you write `#abc`, `rgb(…)`
   or a colour keyword in any other stylesheet or script. Use `var(--name)`.
5. **Every change must look right in light and dark, on a desktop and on a phone.** About three quarters of visitors
   are on phones.
6. **Never copy another site.** Section 4.4 lists what must not appear. In particular the look must not resemble
   fanout.sh: no pixel or dot-matrix lettering, no pastel "folder" cards, no buttons with a thick dark bottom edge.
7. Follow the repo rules in `12-OPERATING-RULES.md` (branch, pull request, ledger, docs). Rule 19 applies: the look
   goes through `frontend/src/theme/`.
8. If a step fails and you cannot fix it in two tries, stop and write what happened in the pull request. Do not skip
   tests, and do not delete a rule from `theme.test.js`.

---

## 1. Why we are doing this

The site was shown to UI/UX reviewers. Their verdict on the current look: it will not sell a subscription. What they
saw, and what an audit of the live pages confirms:

| Problem on the live site | Where | Effect |
|---|---|---|
| Type is too small | Landing hero paragraph 14 px, nav 10 px mono capitals, article body 16 px (15 px on phones) | Hard to read, feels like a wireframe |
| Everything is a thin grey box with square corners | `--radius:2px`, 1 px `--line` borders on every card, table and button | Looks unfinished, nothing invites a tap |
| No brand colour | One blue (`#2855d9`) does links, buttons, labels, active states and figures | Nothing is memorable; the main button looks like a link |
| Grid-paper background behind the dashboard | `.d-body` | Busy, lowers contrast, reads as "engineering tool", not "product" |
| Capital mono labels everywhere | Nav, buttons, tabs, table heads, group titles | Shouts; the real headings do not stand out |
| Section pages are one long column of boxes | `.d-list` | No sense of a library; lots of scrolling |
| The article has a white box inside a grey grid | `.d-panel` | Wastes width on phones (double padding) |
| Main button and second button look alike | `.btn`, `.sv-run`/`.sv-submit` | No clear next step |

The content, the figures, the canvas and the judge are the product's strength. The redesign does not touch them. It
changes the frame around them so the site looks like something worth paying for.

**Goals, in order:** (1) reading is comfortable on a phone, (2) one obvious next action on every screen,
(3) a look people remember and that belongs to Tech Katta, (4) changing the look later stays a one-folder job.

---

## 2. Research: what the best technical-content sites do

Twenty-four sites were opened in a real browser at 1440 px and on a Pixel 7; 22 loaded (LeetCode and GreatFrontEnd
blocked the visit). Fonts, sizes, colours, radii and layout widths were read from the pages, not guessed.

### 2.1 What was measured

| Site | Kind | Body text | Headings | Layout | One thing it does best |
|---|---|---|---|---|---|
| Stripe docs | Documentation | 14/20 system font | 32 px, weight 700 | Three columns: nav, content about 780 px, "On this page" | Explanation next to working code; quiet page, one accent |
| react.dev | Learning docs | 20/32 | 40 px, weight 700 | Sidebar 336 px, tinted pill on the current item | Large comfortable type; the current place is always clear |
| Vercel docs | Documentation | 16/27 Geist | Weight 600, tight tracking | Sidebar 300, contents 240, sticky 64 px header | Speed; transitions of 0.1 to 0.15 s |
| Linear docs | Documentation | 15/24 Inter | 32 px, weight 590 | Sidebar 280 | Restraint: very few colours, very even spacing |
| Tailwind docs | Documentation | Inter | 30 px, weight 500 | Sidebar 240 | Small mono capitals used only as section eyebrows |
| MDN | Reference | 16/28 Inter | 40 px | Nav 297 + contents | Plain, readable, trusted |
| Supabase docs | Documentation | 15/28 Inter | 34 px, a second typeface for headings | Sidebar 325 | A heading typeface with character over a plain body |
| GitHub docs | Documentation | Mona Sans | — | Sidebar 325 | Clear hierarchy with almost no decoration |
| Brilliant | Paid learning | 16/24 | Serif display, 54 px | Marketing page | Serif headline + one bright button colour = warm and confident; this is a page that sells |
| samwho.dev | Visual explainers | 18.7/28, about 80 characters a line | Serif, 48 px | Single column | Warm paper background; the interactive figure is the hero |
| Josh Comeau | Visual explainers | 18/27, about 76 characters | — | Single column | Personality without clutter |
| Ciechanowski | Visual explainers | 19/31, about 73 characters | — | Single column | Figures sit between paragraphs at full width |
| NeetCode | Practice | — | — | Sidebar 280, problem table | Table: status, title, coloured difficulty; pill filters; progress |
| Hello Interview | System design (competitor) | 14/24.5 | 40 px, weight 600 | Sidebar 256, right "On this page" | Teal brand, premium card in the right column |
| ByteByteGo | System design (competitor) | — | — | Marketing | Green brand, colourful course cards |
| Exercism, Khan, Educative, Execute Program, Refactoring.guru, roadmap.sh | Learning | — | — | — | Each owns one colour (purple, blue, indigo, lavender, red) |

### 2.2 Patterns that almost every good site shares

1. **One brand colour on quiet neutrals.** Used for the main button and "you are here". Never for body text.
2. **Body text 15 to 20 px, line height 1.5 to 1.8, 65 to 80 characters a line.** The explainer sites, which are
   closest to our articles, sit at 18 to 20 px.
3. **Headings weight 600 to 700 with slightly tight letter spacing.** The warmest sites use a second typeface for them.
4. **Three columns for reading on a desktop:** navigation 240 to 336 px, content up to about 780 px, contents list
   240 to 300 px. One column on a phone.
5. **Content sits straight on the page.** No box around the article. Boxes are kept for things that are objects: a
   figure, a code sample, a call-out, a card you can click.
6. **Sticky header 56 to 64 px**, often see-through with a blur.
7. **Corners:** 6 to 10 px on controls, 12 to 16 px on cards, full pills for filters and tags.
8. **Fast, small motion:** 0.1 to 0.2 s. A card lifts 2 to 3 px on hover. Nothing bounces.
9. **Light and dark.**
10. **Practice lists are tables:** number, title, coloured difficulty, your progress.

### 2.3 What reviewers and written guides say (secondary sources)

- Stripe's docs are the benchmark, and the three-column layout is widely copied. The lesson is not the layout; it is
  the discipline of explanation beside something you can run. We already have that (article + canvas), so the frame
  should get out of its way.
- Show the real product on the landing page. Ours already does (a live figure and a real problem); keep both large.
- Reading: 45 to 75 characters a line, 16 px minimum, 18 px comfortable on phones, line height 1.5 to 1.8, and do not
  shrink text on phones. Avoid wide tables on phones.

Sources: [draft.dev, documentation examples](https://draft.dev/learn/12-documentation-examples-every-developer-tool-can-learn-from) ·
[Veza Digital, devtool site examples](https://www.vezadigital.com/post/best-devtool-website-design-examples) ·
[Moesif, Stripe docs teardown](https://www.moesif.com/blog/best-practices/api-product-management/the-stripe-developer-experience-and-docs-teardown/) ·
[docsio, Stripe API docs teardown](https://docsio.co/blog/stripe-api-docs-teardown) ·
[Apidog, why Stripe's docs are the benchmark](https://apidog.com/blog/stripe-docs/) ·
[Blake Crosley, Stripe design](https://blakecrosley.com/guides/design/stripe) ·
[TJ VanToll, line length in technical blogs](https://www.tjvantoll.com/2015/12/21/technical-blogs-line-length/) ·
[ConversionWax, mobile article formatting](https://www.conversionwax.com/playbook/mobile-first-article-formatting/) ·
[Merge, best-designed edtech platforms](https://merge.rocks/blog/7-best-designed-edtech-platforms-weve-seen-so-far)

---

## 3. What suits Tech Katta

### 3.1 The product has three jobs, and each has a different best-in-class model

| Job | Pages | Model to learn from | What we take |
|---|---|---|---|
| **Read** | Articles, section pages | Stripe docs, react.dev, samwho, Ciechanowski | Three columns, large type, figure as the star, content on the page not in a box |
| **Practise** | Problems list, workspace, canvas | NeetCode, LeetCode-style lists | A real table, coloured difficulty pills, one bright Submit button |
| **Sell** | Landing, sign-in card | Brilliant, Stripe | Big serif headline, one bright button, the real product shown beside it |

### 3.2 Who it is for

Indian engineers preparing for system design interviews, mostly on a phone, often reading in short sessions. The
examples in the articles are Indian (Zotato, crores and lakhs, IND vs PAK traffic). A *katta* is the spot where
friends sit and talk. So the site should feel like **a senior friend's well-kept notebook**: warm, clear, a bit of
personality, never corporate and never a toy.

### 3.3 The identity: "Katta Paper"

| Element | Decision | Why |
|---|---|---|
| Background | Warm paper `#faf7f0`, white cards on top | Explainer sites that people love to read use warm backgrounds; it also separates us from the cold white or dark of every competitor |
| Text | Warm near-black ink `#1d1b16` | 16:1 contrast on paper |
| **Brand colour** | **Marigold `#ffc233`** with ink text on it | Nobody in this field owns yellow: Stripe is violet-blue, Hello Interview teal, ByteByteGo green, NeetCode violet, Exercism purple, Khan blue. Marigold is also a colour every Indian reader knows. Ink on marigold has 10.7:1 contrast |
| **Signature** | A **highlighter stroke** under one word of the main headline, and under the sentence being read aloud | It is what a person does in a notebook. It is ours, it is cheap (one CSS gradient), and it works in dark mode |
| Small mark | An 8 px marigold square before each eyebrow label, and the 28 px marigold square logo | Ties every page to the brand without more colour |
| Headings | **Fraunces** (a serif), weight 600 | Warm and confident, like Brilliant and samwho; every competitor uses a plain sans, so this alone makes the site recognisable. Tested against seven other typefaces in a specimen |
| Body and controls | **Inter** (already on the site) | The most readable choice at small sizes; no new download for body text |
| Labels | **IBM Plex Mono** (already on the site), only for eyebrows, table heads and figure captions | Keeps the engineering flavour, in small doses |
| **Working colour** | **Ochre `#94600a`**, the dark end of the marigold family, replaces the old blue as `--accent`: links, focus rings, hover outlines, lines and labels of "the path that works" in every figure, handles and live arrows on the canvas. **Filled boxes in figures are marigold with ink text, never a solid ochre block.** In dark mode `--accent` is marigold itself | The owner rejected, in turn, the old blue (cold), teal (a foreign colour in the middle of the page) and solid ochre boxes (muddy). One colour family keeps the whole site in the yellow scheme. `--accent` is read 228 times in the stylesheets and by every figure through `palette.js`, so the token recolours all of them at once |
| Warning colour | Moved from amber to orange | So a warning never looks like the brand |
| One dark card | The "practise this" call-out inside an article is ink-coloured with marigold text | One strong invitation per article; used nowhere else |

### 3.4 What we deliberately do not do

- No pixel, dot-matrix or bitmap lettering. No pastel wash cards in several colours. No buttons with a thick dark
  bottom edge. No tilted cards. (These are another site's signatures.)
- No gradients except the highlighter stroke. No glow, no glass cards, no neon.
- No second hue. Everything coloured is in the marigold family: marigold for fills, ochre for thin lines and small text. **No blue and no teal anywhere**: if you see the old blue (`#2855d9`) in the build, a token was missed. Red, green and orange appear only as status (trouble, passed, warning).
- No large solid ochre areas. Ochre is for lines, outlines, icons and text. A filled shape is marigold (with ink text) or a pale tint.
- No capital mono text for anything a person taps (buttons, tabs, nav).
- No more than **one** marigold button visible in any one region of a screen (header, page body, toolbar).
- No more than **one** highlighter stroke per screen.
- No emoji in the interface.
- No hover or press feedback longer than 0.2 s; no entrance longer than 0.6 s; none of either under reduced motion. Section 4.5 lists every place something moves. Do not add others.

---

## 4. Design system

All values live in `frontend/src/theme/tokens.css` (Appendix A). This section explains them.

### 4.1 Colour roles (light / dark)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--page` | `#faf7f0` | `#15140f` | Page background. **New.** |
| `--bg` | `#fff` | `#1e1c16` | Cards, inputs, figures. Keeps its old meaning so about 60 existing rules still work |
| `--surface` | `#f3efe5` | `#28261e` | Wells, the "In 30 seconds" box, inline code |
| `--surface-2` | `#fcfaf5` | `#191812` | Sidebar, table heads, toolbars |
| `--hover` | `#efeadd` | `#2e2b22` | Hover on rows. **New.** |
| `--inverse` / `--on-inverse` | `#1d1b16` / `#faf7f0` | `#f4f1e8` / `#1d1b16` | The dark call-out; the selected filter pill. **New.** |
| `--ink`, `--ink-2`, `--ink-3` | `#1d1b16`, `#3a372f`, `#4d493f` | `#f4f1e8`, `#dbd7ca`, `#c8c3b4` | Headings; body text; lead paragraphs |
| `--muted`, `--muted-2`, `--faint` | `#625c4f`, `#6b6557`, `#736d5d` | `#aca695`, `#9f9988`, `#8d8777` | Captions; quieter captions; mono labels |
| `--line`, `--line-strong`, `--line-soft`, `--grid` | `#e6e0d1`, `#b9b2a0`, `#ddd6c4`, `#f0ebde` | `#322f26`, `#5e594a`, `#3d3a2f`, `#22201a` | Card borders; button borders; tracks; faint lines |
| `--brand` | `#ffc233` | `#ffc233` | Main button, logo, eyebrow square, active tab line. **New.** |
| `--brand-strong` | `#f2ac00` | `#ffd466` | Main button hover; active marker lines |
| `--brand-edge` | `#d79a00` | `#b88400` | Main button border |
| `--brand-ink` | `#6e4a00` | `#ffd87a` | Brand-coloured text on a tint |
| `--brand-tint`, `--brand-line` | `#fff3cf`, `#f0d388` | `#30260f`, `#5f4813` | Tinted boxes and their border; active sidebar row |
| `--on-brand` | `#1d1b16` | `#1d1b16` | Text on marigold. Always ink, in both themes |
| `--mark` | `#ffd866` | `#7d5c00` | The highlighter stroke |
| `--accent` family (ochre; marigold in dark) | `#94600a`, strong `#754a00`, mid `#e9b949`, line `#f0d388`, soft `#ffe08a`, tints `#ffedb8` `#fff6dc`, `--on-accent` `#fff` | `#ffc233`, `#ffd466`, `#a87a10`, `#5f4813`, `#4a3a12`, `#3a2e10` `#2b230f`, `--on-accent` `#1d1b16` | Links, focus rings, hover outlines, figure lines and labels (works = ochre), tinted figure boxes, canvas handles and live arrows |
| `--danger`, `--success`, `--warn` families | red, green, orange | lighter versions | Status. Difficulty pills: Easy = success, Medium = warn, Hard = danger |

Measured contrast (WCAG needs 4.5:1 for text): ink on page 16.1, body (`--ink-2`) on page 11.1, `--muted` on page
6.2 and on `--surface` 5.8, `--faint` on page 4.8, ink on marigold 10.7, `--accent` (ochre) on page 5.0 and on white 5.3, `--success` on its
tint 5.0, `--warn` on its tint 5.7, `--danger` on its tint 6.1. Dark mode: all of these are 4.7 or higher.

**Rules.** Marigold is a background or a line, **never the colour of text on paper** (it fails contrast); for
brand-coloured text use `--brand-ink`. Text on marigold is always `--on-brand`.

### 4.2 Type

| Role | Typeface | Size / line height | Weight | Letter spacing | Phone (≤ 680 px) |
|---|---|---|---|---|---|
| Landing headline | Fraunces | clamp(40 px, 5.2vw, 66 px) / 1.04 | 600 | −0.025em | 40 px |
| Page title (section, problems) | Fraunces | 44 / 1.08 | 600 | −0.02em | 32 px |
| Article title | Fraunces | 42 / 1.1 | 600 | −0.02em | 31 px |
| Landing section heading | Fraunces | clamp(30 px, 3.6vw, 42 px) / 1.1 | 600 | −0.02em | 30 px |
| Article `h2` | Fraunces | 28 / 1.2 | 600 | −0.015em | 24 px |
| Group heading | Fraunces | 26 (24 on Problems) / 1.15 | 600 | −0.015em | 22 px |
| Card title | Fraunces | 20 to 23 / 1.22 | 600 | −0.01em | same |
| Article `h3` | Inter | 19 | 650 | −0.01em | same |
| Lead paragraph (dek) | Inter | 19 / 1.55 | 400 | 0 | 17 px |
| **Article body** | Inter | **17 / 1.75** | 400 | 0 | **17 px (not smaller)** |
| Landing paragraph | Inter | 18 / 1.6 | 400 | 0 | 17 px |
| Card text | Inter | 14.5 / 1.55 | 400 | 0 | same |
| Button, tab, nav | Inter | 13.5 to 15 | 500 to 600 | 0 | same |
| Eyebrow, table head, caption label | IBM Plex Mono | 10 to 11 | 600 | 0.08 to 0.12em, capitals | same |

Article text column is at most 680 px wide (about 75 characters at 17 px). Fraunces is used only at 19 px and above.
Mono capitals are used only at 10 to 11 px and never on anything you can tap.

### 4.3 Shape, depth, motion

| Token | Value | Use |
|---|---|---|
| `--r-sm` | 6 px | Inline code, tiny chips |
| `--radius` | 8 px | Sidebar rows, inputs, small controls (this token already exists; every old rule that reads it gets rounder) |
| `--r-md` | 10 px | Buttons |
| `--r-lg` | 14 px | Cards, tables, figures, call-outs |
| `--r-xl` | 18 px | The landing figure, the sign-in card, the tour card |
| `--r-full` | 999 px | Pills: filters, difficulty, account button |
| `--shadow-1` | 1 px soft | Resting cards and buttons |
| `--shadow-2` | 10 px soft | A card on hover; the landing figure |
| `--shadow-3` | 18 px | Menus, the sign-in card, the phone drawer |
| `--dur-fast` / `--dur` | 0.12 s / 0.2 s | Colour and border changes / lift on hover |
| `--ease` | `cubic-bezier(.2,.7,.2,1)` | Everything |

Depth comes from a 1 px border **and** a very soft shadow together. Never a hard offset shadow.

### 4.4 Components (what each looks like, and the classes that carry it)

| Component | Look | Classes |
|---|---|---|
| **Main button** | Marigold fill, ink text weight 600, 1 px `--brand-edge` border, 10 px corners; hover `--brand-strong`; pressed moves down 1 px | `.btn.primary`, `.pr-solve`, `.sv-submit`, `.lab-btn`, `.r-btn.primary`, `.acct-signin-link`, `.tour-next`, `.ll-score`, `.sd-copy`, `.pb-pick`, `.st-err button` |
| **Second button** | White (`--bg`) fill, ink text, 1 px `--line-strong` border; hover border turns ink | `.btn`, `.d-tour`, `.d-home`, `.sv-run`, `.sv-reset`, `.sv-clock`, `.lab-btn.ghost`, `.r-btn`, `.a-more>summary`, `.fs-btn`, `.zoom-btn`, `.menu` |
| **Card you can click** | White, 1 px `--line`, 14 px corners, `--shadow-1`; hover: border `--line-strong`, `--shadow-2`, up 2 px | `.d-list a`, `.inside-grid a`, `.card`, `.a-next` link, `.pb-group a` |
| **Eyebrow** | Mono 11 px capitals, `--muted`, with an 8 px marigold square before it | `.d-panel label`, `.hero label`, `.inside>label`, `.lp-eyebrow` |
| **Highlighter** | Gradient band from 60 % to 92 % of the line height in `--mark` | `.tk-mark` (landing headline), `.d-article .reading` (read-aloud sentence) |
| **Top tabs** | Plain text; the current one is ink, weight 600, with a 3 px marigold line under it | `.tab`, `.sv-tabs .on` |
| **Sidebar row** | 38 px tall, 8 px corners; current: `--brand-tint` fill and a 3 px `--brand-strong` bar on the left | `.side-link` |
| **Sidebar sub-list and "On this page"** | A thin vertical line; the current item is ink, weight 600, and its piece of the line is `--brand-strong` | `.side-sub a`, `.d-rail li a` |
| **Filter pills** | White pill with border; selected: ink fill, paper text | `.pb-filter button`, `.qt-levels button` |
| **Difficulty pill** | Tinted pill: Easy green, Medium orange, Hard red | `.pb-tag.easy/.medium/.hard` |
| **Problems table** | One white card; mono capital head on `--surface-2`; rows split by hairlines; row hover `--surface-2`. On phones each row becomes its own card | `.qt-table` |
| **"In 30 seconds"** | `--surface` well, no border | `.a-tldr` |
| **Worked example** | `--accent-tint` (pale yellow) box with `--accent-line` border, mono label in `--accent` | `.a-example` |
| **Analogy** | `--brand-tint` with a 3 px marigold bar on the left | `.a-analogy` |
| **Practise call-out** | The one dark card: `--inverse` fill, Fraunces sentence in `--on-inverse`, label and arrow in marigold | `.a-lab` |
| **Figure** | White card, 14 px corners, mono caption strip on `--surface-2` | `.a-fig`, `.figure` |
| **Header** | 64 px (dashboard 68 px), see-through page colour with a 14 px blur, 1 px line below | `.header`, `.d-head` |
| **Focus ring** | 2 px `--accent` (ochre), 2 px offset, on every link and button | global |

### 4.5 Motion: where things move, and where they do not

The site already has motion where it teaches: every article figure plays a loop, and the canvas replays a load test.
That stays untouched. This redesign adds a thin layer of **interface** motion so the site feels alive and finished.
It is one stylesheet, `frontend/src/theme/motion.css` (Appendix D), CSS only, no library and no JavaScript.

The rules were checked against a public set of UI guidelines the owner pointed to
([ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), MIT; it is a guideline dataset with
GSAP snippets, not a component library, so nothing from it is installed). What we take from it: animate only
`transform` and `opacity`; one or two key elements per view; entrances 300 to 400 ms moving 8 to 16 px; hover
feedback 150 to 200 ms; stagger at most about eight items; looping motion only for loading; a shimmer sweep, not a
pulse, for skeletons; no parallax on text and no scroll-jacking; honour reduced motion by showing the final state.

| # | Where | What happens | Why here | Length |
|---|---|---|---|---|
| 1 | Landing hero | Eyebrow, headline, paragraph and buttons rise 10 px one after another; the figure follows; then **the highlighter is drawn under the last word, left to right** | First impression; the drawn stroke is the brand's signature moment | 0.36 s each, 0.06 s apart; stroke 0.6 s |
| 2 | Every dashboard page | The page content rises once when you arrive (also on moving between pages) | Makes navigation feel like a response, not a jump | 0.36 s |
| 3 | Card grids (sections, start page, problems groups) | The first eight cards rise in turn | Shows the grid as a set; capped so long lists never wait | 0.04 s apart |
| 4 | Article contents column | Fades in just after the article | Keeps attention on the title first | 0.4 s |
| 5 | Cards with an arrow ("Read →", "Explore …") | The arrow slides 4 px on hover, with the existing 2 px card lift | Says "this goes somewhere" | 0.2 s |
| 6 | "Show more" boxes and hints | The revealed content rises in | Confirms the tap did something | 0.24 s |
| 7 | Account menu, canvas menus, tour card, sign-in card | Pop in from 96 % size | They appear over the page; a pop reads as "on top" | 0.16 s |
| 8 | Phone sidebar | The dark backdrop fades in (the drawer itself already slides) | Matches the drawer | 0.2 s |
| 9 | **Result sheet after Run or Submit**, and the score sheet | Slides up 24 px; the first six test rows follow in turn | The most important moment in the product: you get your verdict | 0.26 s; rows 0.05 s apart |
| 10 | Phone problem result | Pops in | Same moment, phone version | 0.22 s |
| 11 | Loading skeleton lines | A light sweep runs across them | Tells the visitor the page is working | 1.4 s loop (the only new loop) |
| 12 | Landing sections below the hero | Cards and the IND vs PAK problem rise as they scroll into view | Rewards scrolling; shows there is more | Tied to scrolling |
| 13 | **Article reading progress** | A 2 px ochre line under the header fills as you read | Long articles (20 minutes and more): shows how far you are | Tied to scrolling |

Items 12 and 13 use CSS scroll timelines. Browsers that do not have them (older Safari and Firefox) simply show the
content with no effect and no progress line. That is intended; do not add a JavaScript fallback.

**Where nothing moves, on purpose:** body text and headings inside an article; tables and their rows; figures (they
have their own loops); nodes and arrows on the canvas (React Flow positions them with `transform`; animating that
breaks dragging); the header and sidebar; anything while the visitor is typing. No parallax, no scroll-jacking, no
auto-rotating carousel, no bouncing or elastic easing, no animated background, no confetti.

**Reduced motion:** all of items 1 to 12 are inside `@media(prefers-reduced-motion:no-preference)`, so a visitor who
asked for less motion gets the finished page at once. Item 13 stays, because it only follows the reader's own scrolling.

**Technical rule that matters:** entrance animations use `backwards`, not `both` or `forwards`. An animation that
stays applied to `transform` after it ends can trap `position:fixed` children (the full-screen figure view on phones).
Do not change this.

### 4.6 Animation: exact instructions

Section 4.5 says **where** things move. This section says **how each one is built**, so you can check your build
line by line and so a later change stays consistent. All of it lives in `frontend/src/theme/motion.css` (Appendix D).

**The seven keyframes.** Each has only a `from` (the element animates *to* its normal style), except the two that need an end value.

| Keyframe | From → to | Used for |
|---|---|---|
| `tk-rise` | 10 px lower and invisible → in place | Anything arriving in the flow of the page |
| `tk-fade` | invisible → visible | Things that should not move (contents column, backdrop) |
| `tk-pop` | 96 % size and invisible → full size | Things that open on top of the page |
| `tk-sheet` | 24 px lower and invisible → in place | Sheets that slide up from the bottom |
| `tk-mark` | background 0 wide → full width | The highlighter stroke |
| `tk-shimmer` | background position sweeps left | Loading lines |
| `tk-progress` | `scaleX(0)` → `scaleX(1)` | Reading progress |

**Every animation, with its selector and timing.**

| # | Selector | Keyframe | Duration | Delay | Easing | Fill |
|---|---|---|---|---|---|---|
| 1a | `.hero>div>*` (eyebrow, h1, p, buttons) | `tk-rise` | `--dur-enter` (0.36 s) | 0, 0.06, 0.12, 0.18 s by child | `--ease` | `backwards` |
| 1b | `.hero>.figure` | `tk-rise` | 0.5 s | 0.16 s | `--ease` | `backwards` |
| 1c | `h1 .tk-mark` | `tk-mark` | 0.6 s | 0.5 s | `--ease` | `backwards` |
| 2 | `.d-body>.d-panel`, `.d-read>.d-article` | `tk-rise` | `--dur-enter` | 0 | `--ease` | `backwards` |
| 3 | first 8 `li`/`.card` inside `.d-list`, `.cards`, `.pb-group` | `tk-rise` | `--dur-enter` | 0.04 s × (position − 1) | `--ease` | `backwards` |
| 4 | `.d-read>.d-rail` | `tk-fade` | 0.4 s | 0.15 s | `--ease` | `backwards` |
| 5 | `em` / `.card-go` inside a hovered card | transition on `transform` to `translateX(4px)` | `--dur` (0.2 s) | 0 | `--ease` | — |
| 6 | `.a-more[open]>:not(summary)`, `.sv-hints li.open>:not(button)` | `tk-rise` | 0.24 s | 0 | `--ease` | `backwards` |
| 7 | `.acct-menu`, `.lab-menu`, `.tour-card`, `.lock-card` | `tk-pop` | 0.16 s | 0 | `--ease` | `backwards` |
| 8 | `.scrim` | `tk-fade` | `--dur` | 0 | `--ease` | `backwards` |
| 9a | `.sv-console`, `.lab-score` | `tk-sheet` | 0.26 s | 0 | `--ease` | `backwards` |
| 9b | first 6 `.sv-test` | `tk-rise` | 0.24 s | 0.05 s × (position − 1) | `--ease` | `backwards` |
| 10 | `.ll-res` | `tk-pop` | 0.22 s | 0 | `--ease` | `backwards` |
| 11 | `.lock-skel i` | `tk-shimmer` | 1.4 s | 0 | `ease-in-out` | loops |
| 12 | `.inside-grid li`, `.lp-lab`, `.lp .ch-title`, `.lp .ch-desc` | `tk-rise` | tied to scroll: `animation-timeline:view()`, range `entry 0% entry 55%` | — | `linear` | `both` |
| 13 | `.dash:has(.d-read) .d-head::after` | `tk-progress` | tied to scroll: `animation-timeline:scroll(root)` | — | `linear` | `both` |

**Rules you must keep when you touch any of this.**

1. **Only `transform` and `opacity` animate** (plus `background-size`/`background-position` for the stroke and the
   shimmer). Never animate `width`, `height`, `margin`, `padding`, `top` or `left`: they make the page re-lay out and stutter on phones.
2. **Entrances use `backwards`.** Only the two scroll-tied ones use `both`. A finished animation that stays applied
   to `transform` traps `position:fixed` children; the phone full-screen figure then no longer covers the screen.
3. **Entrances are 0.16 to 0.5 s. Hover and press feedback is `--dur-fast` or `--dur` (0.12 or 0.2 s).** Nothing is slower than 0.6 s.
4. **Movement is small:** 10 px for content, 24 px for sheets, 4 % scale for pops, 2 to 3 px lift on hover. No rotation, no bounce.
5. **One easing:** `--ease`. Scroll-tied animations use `linear` (the scroll is the easing).
6. **Stagger is capped:** at most 8 cards, at most 6 test rows, never more than 0.3 s until the last one starts. Items after the cap appear at once.
7. **Each entrance runs once**, when the element appears. Nothing replays on scroll, on hover or on a timer.
8. **Nothing loops** except loading marks (`.lock-skel i`, the existing `.st i`) and the figures' own loops.
9. **Everything decorative is inside `@media(prefers-reduced-motion:no-preference)`.** Do not write an entrance animation outside that block.
10. **In `animation` shorthand, write `animation-timeline` after it**, on the same rule. The shorthand resets the timeline.
11. **Do not animate these:** `.react-flow__node` and anything React Flow positions (it uses `transform` itself); the
    sticky header and sidebar; article paragraphs, headings, tables; SVG figures (they have SMIL loops and a still version via `useStill()`).
12. **Hover effects must not be the only signal.** Phones have no hover. Every card is already a link with a visible "Read →".

**How to add an animation later** (for the owner's future requests; not part of this build):

1. Decide which of the four entrance keyframes fits (in the flow → `tk-rise`; on top → `tk-pop`; from the bottom → `tk-sheet`; must not move → `tk-fade`). Do not write a new keyframe unless none fits.
2. Add one rule **inside** the `no-preference` block of `motion.css`, in the numbered group it belongs to:
   `.your-class{animation:tk-rise var(--dur-enter) var(--ease) backwards}`.
3. If the element can appear many times in a list, cap it with `:nth-child(-n+8)`.
4. Add a row to the table in section 4.5 of this file.
5. Check: motion on (it plays once), motion reduced (final state at once), phone (no stutter, full-screen figure still works).

**How to check animations properly.**

- Chrome → DevTools → ⋮ → More tools → **Animations**: reload the page; each animation appears as a bar. Compare names, lengths and delays with the table above. Use 25 % speed to see order.
- DevTools → ⋮ → More tools → **Rendering** → "Emulate CSS media feature prefers-reduced-motion": set to *reduce*, reload. Nothing may move; nothing may be invisible.
- DevTools → **Performance** → record a page load on "4× CPU slowdown": there must be no long purple "Layout" bars during the entrance.
- Firefox or an older Safari: items 12 and 13 do nothing and everything is visible. That is correct.

**If something looks wrong.**

| Symptom | Cause | Fix |
|---|---|---|
| The stroke under the headline flashes fully on, then draws | The `h1 .tk-mark` rule is missing `background-repeat:no-repeat` | Copy the rule from Appendix D again |
| Cards stay invisible | A rule was written with `opacity:0` outside a keyframe | Remove it; the keyframes supply the start state |
| Content stays invisible with reduced motion | An entrance rule was placed outside the `no-preference` block | Move it inside |
| Phone full-screen figure is cut off | Someone changed `backwards` to `both` or `forwards` on `.d-article` | Change it back |
| Canvas nodes jump or cannot be dragged | An animation was added to `.react-flow__node` | Remove it |
| Progress line never appears | Browser without scroll timelines, or the page is not an article | Expected |
| Page content replays its entrance on every state change | The element is re-created by React on each render | Do not animate that element; animate its stable parent |

### 4.7 UI features and behaviour

What each part of the interface must **do**, not only how it looks. All of this already exists in the code unless marked
**new**; the redesign must not break any of it. Use this as a behaviour checklist after each work package.

**States every interactive element must show.**

| State | Main button | Second button | Card link | Input / select | Tab / sidebar row |
|---|---|---|---|---|---|
| Rest | Marigold, `--brand-edge` border | White, `--line-strong` border | White, `--line` border, `--shadow-1` | White, `--line-strong` border | `--muted` text |
| Hover (mouse only) | `--brand-strong` | Border turns `--ink` | Border `--line-strong`, `--shadow-2`, up 2 px, arrow moves 4 px | — | `--ink` text; sidebar row gets `--hover` fill |
| Focus (keyboard) | 2 px `--accent` ring, 2 px away | same ring | same ring | 2 px `--accent` outline | same ring |
| Pressed | Down 1 px | Down 1 px | — | — | — |
| Selected / current | — | Filter pill: `--inverse` fill, `--on-inverse` text | — | — | Tab: ink, weight 600, 3 px marigold line. Sidebar row: `--brand-tint` fill, 3 px `--brand-strong` bar |
| Disabled | `--surface` fill, `--line` border, `--faint` text, no hover | same | — | same | — |

Never remove a focus ring. Never signal a state with colour alone: the current tab also changes weight, a failed
test also shows ✕, difficulty pills also carry the word.

**Features by area.**

| Area | Feature | Required behaviour |
|---|---|---|
| Everywhere | **Light and dark** | The theme button (sun/moon) switches at once and remembers the choice (`tk-theme` in local storage); first visit follows the device. Figures redraw in the new colours. No flash of the wrong theme on load (`public/theme-boot.js` + the inline style in each `index.html`) |
| Everywhere | **Skip link** | First Tab press shows "Skip to content"; it moves focus to the page content |
| Everywhere | **Sticky header** | Stays at the top, page colour at 86 % with blur; content scrolls under it |
| Landing | **Phone menu** | Below 680 px the nav becomes a MENU button that opens a panel; Escape or choosing a link closes it |
| Landing | **Zoom on the figure** | "Tap to zoom" opens the figure in a dialog; Escape, the close button or a tap outside closes it and returns focus |
| Landing | **Try the problem** | The IND vs PAK problem loads only when scrolled near (keeps the first load light); on phones the simplified version shows |
| Dashboard | **Collapsible sidebar** | The button beside the logo folds it to 64 px icons and back; below 900 px it is a drawer with a dark backdrop, closed by the backdrop or Escape |
| Dashboard | **Current place** | The current section row and the current article in the sub-list are marked; top tabs mark the section |
| Dashboard | **Tour** | "Tour" starts a step-by-step guide: the target gets a marigold outline, a card explains it, Next / Skip, a progress bar |
| Section pages | **Card grid** | Two columns from 760 px, one below; each card is one link; descriptions cut at three lines |
| Article | **On this page** | From 1240 px a sticky contents list; the heading in view is marked; clicking scrolls to it with the header's height left clear |
| Article | **Listen** | Play/pause reads the article with the device's voices; speed select; the sentence being read is highlighted and kept in view |
| Article | **Reading progress (new)** | Thin ochre line under the header grows with scroll (Chrome, Edge, Android, new Safari) |
| Article | **Share** | Uses the device's share sheet where there is one, otherwise copies the link |
| Article | **Figures** | Play in a loop; still under reduced motion; on phones a full-screen button turns the figure sideways to fill the screen |
| Article | **Tables on phones** | Each row becomes a stacked card with its column names; no sideways scrolling |
| Article | **Show more / Go deeper** | Tap opens extra content in place; tap again closes |
| Article | **Next article, practise link** | A card to the next article; the dark practise card and the tinted card in the right column lead to the matching problem |
| Problems | **Filters** | All / Not done yet; Easy / Medium / Hard; "Pick one" opens a random unsolved problem |
| Problems | **Progress** | Solved count and stars come from the visitor's saved progress; status column shows done problems |
| Workspace | **Split view** | Problem on the left, canvas on the right; the divider drags; "Hide the problem" gives the canvas the full width |
| Workspace | **Tabs** | Description, Your answer, Hints, Solution, Submissions; the row scrolls sideways if it does not fit |
| Workspace | **Run / Submit** | Run tries the example tests, Submit runs all; the result sheet slides up with a verdict, per-test rows, expected and actual; it can be collapsed or closed |
| Workspace | **Timer, Reset** | Timer shows elapsed time (tinted when on); Reset asks nothing and restores the starting design |
| Canvas | **Build** | Drag a component from the left list (or tap it on touch); join with arrows from the handles; select to edit settings on the right; selected node has a marigold ring |
| Canvas | **Replay** | After a test, replay the load minute by minute; nodes show warning (orange) and down (red) states |
| Phone problem view | **Simplified problem** | Checkboxes, steppers and radios instead of the canvas; one marigold "Play" button; a result card with stars |
| Account | **Sign in** | On production, articles need Google sign-in: a card over a blurred skeleton; the account pill opens a small menu (privacy, sign out) |
| Status | **Loading and errors** | A loading mark while a page loads; an error page with one marigold "Try again" button |

**Sizes that are features, not decoration.**

- Anything tappable is at least **44 × 44 px on phones** (buttons 44 to 50 px tall there; filter pills 34 px tall with 6 px gaps are the one accepted exception, as on the live site).
- Article text column never exceeds **680 px**; body text never goes below **17 px**.
- Breakpoints, as in the code: **1240 px** (contents column appears), **980 px** (landing hero stacks), **900 px** (sidebar becomes a drawer; workspace stacks), **760 px** (card grids and the problems table go to one column / cards), **680 px** (phone type sizes and paddings).
- No page scrolls sideways at 360 px wide.

**Accessibility that must survive the redesign.**

- Text contrast at least 4.5:1 (figures in section 4.1); lines and icons at least 3:1.
- Every control reachable and usable with the keyboard, in visual order; dialogs trap focus and return it on close.
- `aria-current`, `aria-expanded` and labels already in the JSX stay as they are (you are not editing JSX).
- Reduced motion respected everywhere (section 4.6 rule 9, and the figures' still versions).
- Works with the browser zoomed to 200 %: nothing overlaps or is cut off.

### 4.8 Animations that belong to Tech Katta

Sections 4.5 and 4.6 cover the polish any good site has (things rise in, menus pop). This section is about motion
that could only be on **this** site, because it comes from what the product is. Tech Katta is three things: a
notebook you learn from, a system you watch requests flow through, and a judge that gives a verdict. So there are
exactly three motion ideas, and every animation must belong to one of them. If a proposed animation fits none, do not add it.

| Idea | What it means | The motion |
|---|---|---|
| **The marker** | A person marks what matters in a notebook | A marigold stroke is *drawn*, left to right, in about half a second. Never fades in, never blinks |
| **The request** | In every figure, things travel from the client towards the data, left to right | Content arrives in reading order; a dot or a line moves along a path; progress fills left to right |
| **The verdict** | You built something and the judge answers | The answer arrives from below, then is revealed in steps: verdict, then tests, then stars |

#### Built in this redesign (in `motion.css`, group 8, and one line in the `solve` block)

| # | Moment | What the visitor sees | Idea | Code |
|---|---|---|---|---|
| 14 | **A design passes** | The verdict title ("Accepted", "All tests passed") is written in ink and **the marker is drawn under it**, 0.3 s after the result sheet arrives. A failed verdict stays plain red text: no stroke, no shake | Marker + verdict | `.sv-v.good b` gets the stroke as a background (Appendix C, `solve`); `motion.css` draws it with `tk-mark .5s`, delay `.3s` |
| 15 | **Stars are awarded** | On the score sheet and the phone result, the row of stars pops in a moment after the sheet | Verdict | `.lab-score .lab-stars, .ll-res .ll-stars` → `tk-pop .3s`, delay `.25s` |
| 16 | **A server goes down** | During a replay, a node that crashes gives one short sideways shudder (3 px, 0.32 s) as it turns red and dashed. Once, not looping | Request | `.ln.down` → `tk-shake .32s linear` (on the inner `.ln`, never on React Flow's own wrapper) |
| 17 | **Load changes** | The thin load bar in the canvas toolbar slides to its new width instead of jumping | Request | `.lab-meter i{transition:width …}`. This is the **one** permitted width transition: the bar is 4 px tall and nothing else is laid out from it |
| 18 | **A figure is opened** | "Tap to zoom" on the landing figure: the backdrop fades and the figure pops forward | Notebook (you lean in) | `.zoom` → `tk-fade`; `.zoom-box` → `tk-pop .18s` |

Together with the earlier ones, the product's signature moments are: the stroke under the landing headline (item 1c),
the stroke following the sentence read aloud, the stroke under a passed verdict (14), the reading line under the
header (13), and the result sheet rising (9). **A visitor should remember the marker.** That is why the stroke is
used in only these places and always drawn the same way.

These five were added after the main verification pass. The build and the 235 unit tests pass with them, but they
were **not looked at in a browser**. Check each one by eye (a passing design needs a correct solution: use the
problem's Solution tab to build one), and if a selector does not match what you see in the page, fix the selector,
not the idea.

#### Worth building next, but they need JavaScript (owner decides; not in this build)

Each of these fits one of the three ideas and would make the product feel more alive than any amount of fading.
They are listed in the order of value. None may be built with a library; each is a few lines.

| Moment | What the visitor would see | Idea | How (outline) | Where |
|---|---|---|---|---|
| **Score counts up** | "Score 0 … 87 / 100" over 0.8 s, easing out, then stops | Verdict | A small hook that steps a number with `requestAnimationFrame`; under reduced motion show the final number at once | Score sheet in `src/solve/` and `src/lab/Score.jsx` |
| **Stars fill one at a time** | Each earned star turns from grey to gold 0.15 s apart, each with a small pop | Verdict | Render each star as its own element with an `animation-delay` from its index; today the stars are one text string | Same files; `lablite` result |
| **Tests tick off like a test run** | Rows appear in order, each showing ✓ or ✕ as it "finishes"; the verdict comes last | Verdict | The results already exist when the sheet opens: reveal them on a timer (60 ms each, capped at 1.5 s in total), verdict after the last | `src/solve/console.jsx` |
| **Requests visibly flow through your design** | After Run, small dots travel along the arrows of the visitor's own design for a few seconds, the way they do in the article figures; an arrow that drops calls shows red dots stopping | Request | React Flow edges are SVG paths: an `<animateMotion>` dot per live edge, as `figs/parts.jsx` `Dot` does; stop when the replay ends; none under reduced motion | `src/lab/nodes.jsx` (the edge component already draws a circle for live edges) |
| **Numbers on the landing page count up** | "22 problems", "31 articles" run up from 0 when the cards scroll into view | Request (scale) | One `IntersectionObserver`, the same counting hook | `Inside` in `src/main.jsx` |
| **The marker moves between contents items** | In "On this page", the ochre piece of the line slides from the old heading to the new one instead of jumping | Marker | One absolutely positioned bar whose `transform` is set from the active item's position | `src/dashboard/article.jsx` |
| **Solved** | The first time a problem is solved, its status mark in the list is drawn as a tick (stroke drawn over 0.3 s) | Marker | An SVG tick with `stroke-dasharray`; only for a problem solved in this visit | `src/problems.jsx` |
| **"Copied"** | After Share or Copy, the button's label becomes "Copied ✓" for 1.5 s, then returns | Verdict (confirmation) | Local state and a timeout | `src/dashboard/share.jsx`, the solution's copy button |
| **Pages cross-fade** | Moving between dashboard pages cross-fades for 0.15 s instead of swapping | Request | `document.startViewTransition` around the route change, where the browser has it | Router in `src/dashboard.jsx` |

#### Considered and rejected for this site

| Idea | Why not |
|---|---|
| Confetti or fireworks on passing | A toy effect; the audience is preparing for interviews. The marker and the stars are the celebration |
| Shaking the whole result sheet on a wrong design | Punishes the learner; a wrong design is the normal path to a right one |
| Typewriter effect on headlines or article text | Slows reading, which is the product |
| Animated or drifting background, floating shapes, cursor trails | Decoration with no meaning here; costs battery on phones |
| Parallax, pinned scroll sections, scroll-jacking | Fights the reader; three quarters of visitors are on phones |
| Auto-rotating testimonials or carousels | Nothing on the site needs one |
| Pulsing or glowing buttons to draw attention | The single marigold button per region already does that |
| Animating canvas nodes when they are added or moved | React Flow moves nodes with `transform`; a second animation on it breaks dragging |
| Sound | No |

---

## 5. Page by page

Each page: what changes for the visitor. The CSS that does it is in Appendix C; you do not write new CSS for these.

### 5.1 Landing (`/`, `src/main.jsx`, `src/styles.css`) — pictures 01, 02
- Header: sticky, 64 px, blurred. Logo: marigold square + "Tech Katta" in Fraunces. Nav links are 14.5 px Inter in
  `--muted`, ink on hover, no underline, no capitals.
- Hero: two columns (text 1fr, figure 1.05fr), 76 px above and below. Eyebrow with the marigold square. Headline in
  Fraunces up to 66 px, **the last word highlighted** (WP2). Paragraph 18 px. Two buttons 48 px tall: marigold
  "Start practising →" and white "Try IND vs PAK".
- Figure: white card, 18 px corners, `--shadow-2`, not rotated. Its status chip is a green pill.
- "What's inside": Fraunces heading; four white cards; the count chip on each is a marigold-tint pill.
- IND vs PAK problem: same frame as the hero figure (`.lp-lab`).
- Footer: `--surface-2`, brand name in Fraunces.
- Below 980 px: one column, text first. Below 680 px: header 60 px, headline 40 px, both buttons share the row and wrap.

### 5.2 Dashboard frame (`src/dashboard/shell.jsx`, `shell.css`) — pictures 03 to 07
- Sidebar 260 px on `--surface-2`. Logo square and Fraunces name. Section rows as in 4.4. No line under the logo row.
- Header: tabs on the left as in 4.4; Tour, theme and site buttons on the right as second buttons.
- Body: plain `--page`. **The grid-paper background is removed.** Padding 40 px 32 px (24 px 16 px on phones).
- Collapsed sidebar (64 px): icons only; the Privacy and Terms links are hidden there (they wrapped badly).
- Below 900 px the sidebar is a drawer with `--shadow-3`, as today.

### 5.3 Start page and section pages (`pages.jsx`, `pages.css`, `library.css`) — pictures 03, 04
- **No white panel.** Title and description sit on the page.
- Eyebrow, Fraunces 44 px title, 17 px description (max 640 px).
- Articles are a **two-column grid of cards** (one column below 760 px): mono number line, Fraunces 20 px title,
  three lines of description at most, "Read →" pinned to the bottom so cards in a row line up.
- Group headings (Core concepts, Recurring patterns, …) are Fraunces 26 px with no rule above.
- Start page: three library cards, white, with the mini diagram in a `--surface-2` well.

### 5.4 Article (`article.jsx`, `article.css`, `blocks.css`, `figure.css`, `reader.css`) — pictures 05, 10
- Three columns from 1240 px: sidebar, article (max 720 px, text max 680 px), "On this page" (260 px, sticky). The
  gap between article and contents is 56 px.
- Breadcrumb in mono; eyebrow; Fraunces 42 px title; 19 px dek; the Listen bar as a white card with a marigold
  Listen button; meta line in mono with a hairline under it.
- Body 17 px / 1.75. `h2` Fraunces 28 px with 56 px above and no rule. Inline code on `--surface`.
- Blocks as in 4.4. "On this page" is a plain list on the page, not a box. Under it, the practise link is a
  marigold-tint card.
- The sentence being read aloud gets the highlighter.
- Phones: one column, body stays 17 px, tables become stacked cards (existing behaviour, restyled).

### 5.5 Problems (`problems.jsx`, `problems.css`) — picture 06
- Title block as in 5.3. Progress line in mono. Filters are pills; "Pick one" is the marigold pill (the page's main action).
- Each group: Fraunces heading, one-line description, difficulty pills, then the table card.
- Challenge start card (`.qt-start`): marigold tint with border.

### 5.6 Workspace and canvas (`solve/*`, `solve.css`, `lab/lab.css`, `lablite.css`) — picture 07
- Left pane tabs: plain text, current one white with a 3 px marigold line below.
- Problem title Fraunces 30 px. The "how this works" note is a `--surface` box with a marigold bar on the left (not a coloured tint).
- Toolbar: Timer, Reset, Run are second buttons; **Submit is the only marigold button**.
- Palette items: white rows with a border. Selected node on the canvas: 3 px marigold ring.
- Node states (`.ln.warn`, `.ln.down`, `.ln.sel`) keep their borders and meanings. **Do not restyle node internals.** Node labels, handles and live arrows turn ochre by themselves because they read `--accent` (CSS) or `BLUE` from `palette.js` (which is `--accent`).
- **Figures are not edited.** All 232 article figures and the landing diagram take their colours from `palette.js`: the short name `BLUE` is `--accent`, `LB` is `--accent-tint`, `FB` is `--accent-soft`, `GREY` is `--line-strong`. They become ochre lines with pale-yellow boxes as soon as WP1 is done. Leave the names as they are (renaming them is a separate clean-up). The one figure with solid filled boxes, the landing diagram, is switched to marigold fills in WP1 step 7.
- Hints: white cards; an opened hint turns marigold tint.

### 5.7 Sign-in card, account menu, tour, status (`account.css`, `tour.css`, `status.css`)
- Sign-in card: white, 18 px corners, `--shadow-3`, Fraunces 26 px title, marigold sign-in button.
- Account button: white pill; the initial sits on a marigold disc.
- Tour: marigold outline on the highlighted element; card as above; Next is marigold.

### 5.8 Analytics page (`admin.jsx`, `admin.css`)
No specific styling. It reads the same tokens, so it picks up the new colours and radius. Just check it is readable.

---

## 6. How the code is organised (what you need to know)

```
frontend/
  index.html, dashboard/index.html, analytics/index.html   three entry pages (each has a tiny inline <style>)
  public/theme-boot.js          sets <html data-theme> before the page draws; do not edit
  src/theme/                    THE LOOK
    tokens.css                  all colours, fonts, radii, shadows, speeds  (light :root, dark :root[data-theme=dark])
    palette.js                  the same colours for JavaScript (figures, canvas); TOKENS must equal tokens.css
    fonts.js, fonts.css         self-hosted fonts
    base.css, mode.js, ThemeToggle.jsx, toggle.css
    motion.css                  NEW in this redesign: every entrance and feedback animation (Appendix D)
    theme.test.js               the rules (part of npm test)
  src/styles.css                landing
  src/library.css               library cards (start page, landing)
  src/dashboard/index.css       imports shell, pages, article, blocks, reader, figure in that order
  src/dashboard/{shell,pages,article,blocks,figure,reader}.css
  src/problems.css, solve.css, lab/lab.css, lablite.css, account.css, tour.css, status.css, admin.css
```

**Method for this redesign:** new tokens, then **one block of new rules appended to the end of each stylesheet**.
The new rules use the same selectors as the old ones, so being later in the file they win. This keeps the change easy
to review and easy to undo (delete the block). Do not edit or delete the old rules in this pass. Do not reorder the
imports in `dashboard/index.css`.

---

## 7. Commands

```bash
# install (once)
cd frontend && npm ci

# unit tests, includes theme.test.js — must print "fail 0"
npm test

# local API, in a second terminal (articles need it; sign-in is off locally)
cd backend && PORT=5000 HOST=127.0.0.1 FRONTEND_ORIGIN=http://localhost:5482 node src/server.js

# build against the local API
cd frontend && VITE_API_BASE=http://127.0.0.1:5000 npm run build

# look at it
npm run preview        # then open the printed address
```

Pages to open every time you check: `/`, `/dashboard/`, `/dashboard/concepts/`, `/dashboard/concepts/caching/`,
`/dashboard/problems/`, `/dashboard/problems/url-shortener/`, `/dashboard/quick-notes/`, `/dashboard/privacy/`,
`/analytics/`. Each one: desktop 1366 × 900 and a Pixel 7 size, light and dark (use the theme button).

---

## 8. Work packages

One pull request for all of them is fine. Commit after each package.

### WP1 — Tokens, palette, font, page colour

1. `cd frontend && npm install @fontsource-variable/fraunces@^5.3.0` (this edits `package.json` and `package-lock.json`; commit both).
2. Replace the **whole** of `frontend/src/theme/tokens.css` with Appendix A.
3. In `frontend/src/theme/palette.js`, replace the statement that starts `export const TOKENS={` and ends at the first
   `};` (six lines) with the single line in Appendix B. Change nothing else in that file.
4. In `frontend/src/theme/fonts.js`, add this to the end of the last line (the line of imports):
   ```js
   import"@fontsource-variable/fraunces/wght.css";
   ```
5. In `frontend/src/theme/mode.js` there is exactly one `getPropertyValue("--bg")`. Change it to
   `getPropertyValue("--page")` (this keeps the phone's browser bar the colour of the page).
6. In each of `frontend/index.html`, `frontend/dashboard/index.html`, `frontend/analytics/index.html` make two replacements:

   | Find | Replace with |
   |---|---|
   | `<meta name="theme-color" content="#fff"/>` | `<meta name="theme-color" content="#faf7f0"/>` |
   | `<style>html[data-theme=dark]{color-scheme:dark;background:#12171e}</style>` | `<style>html{background:#faf7f0}html[data-theme=dark]{color-scheme:dark;background:#15140f}</style>` |

   (If you skip this, the dark landing page shows the old navy background. That is the sign you missed it.)
7. Marigold fills for the landing diagram (the only figure with solid filled boxes). Four exact replacements:

   In `frontend/src/theme/palette.js`:

   | Find | Replace with |
   |---|---|
   | `CAT_TEAL,CAT_PINK;` | `CAT_TEAL,CAT_PINK,BRAND,BRAND_EDGE,ON_BRAND;` |
   | `"cat-teal":CAT_TEAL,"cat-pink":CAT_PINK}=t)}` | `"cat-teal":CAT_TEAL,"cat-pink":CAT_PINK,brand:BRAND,"brand-edge":BRAND_EDGE,"on-brand":ON_BRAND}=t)}` |

   In `frontend/src/main.jsx`:

   | Find | Replace with |
   |---|---|
   | `import{BG,BLUE,FAINT,ON_ACCENT}from"./theme/palette.js"` | `import{BG,BLUE,FAINT,BRAND,BRAND_EDGE,ON_BRAND}from"./theme/palette.js"` |
   | `C:[BLUE,BLUE,ON_ACCENT]` | `C:[BRAND,BRAND_EDGE,ON_BRAND]` |

   Each "Find" text occurs exactly once. If one is not found, stop and report; do not guess.
   **Rule for any figure you touch later:** a filled shape uses `BRAND` with `ON_BRAND` text; `BLUE` (ochre) is for strokes and text only.

**Check:** `npm test` prints `fail 0`. Build and open `/` and an article: colours are warm, every figure has ochre lines and pale-yellow boxes instead of blue, the landing diagram's filled boxes are marigold with dark text, but the layout is still the old one and old buttons are ochre. That is expected; the next packages fix them.

### WP2 — The highlighter on the landing headline

In `frontend/src/main.jsx`:

1. Find the line that starts `function App(){`. Insert this line **above** it:
   ```jsx
   const mark=t=>{const i=t.lastIndexOf(" ");return i<0?t:<>{t.slice(0,i)} <span className="tk-mark">{t.slice(i+1)}</span></>};
   ```
2. In the same file replace `<h1>{c.hero.title}</h1>` with `<h1>{mark(c.hero.title)}</h1>` (it occurs once).

**Check:** `npm test` passes. (The stroke appears after WP3.)

### WP3 — Landing

Append Appendix C block **styles** to the end of `frontend/src/styles.css`, and block **library** to the end of
`frontend/src/library.css`. Leave one empty line before each block.

**Check:** `/` matches pictures 01 and 02. The last headline word has the marigold stroke.

### WP4 — Dashboard frame and section pages

Append block **shell** to `src/dashboard/shell.css`, **pages** to `src/dashboard/pages.css`, **toggle** to
`src/theme/toggle.css`.

**Check:** `/dashboard/` and `/dashboard/concepts/` match pictures 03 and 04. No grid paper. Collapse the sidebar
(the button beside the logo) and expand it again. On a phone, open and close the drawer.

### WP5 — Article

Append **article** to `src/dashboard/article.css`, **blocks** to `src/dashboard/blocks.css`, **figure** to
`src/dashboard/figure.css`, **reader** to `src/dashboard/reader.css`.

**Check:** `/dashboard/concepts/caching/` matches pictures 05 and 10. Scroll the whole article in light and dark:
"In 30 seconds", figures, tables, code, the example box, the analogy, the dark practise card, the next-article card.
Press Listen: the sentence being read is highlighted. On a phone the body text is 17 px and tables are stacked cards.

### WP6 — Problems and workspace

Append **problems** to `src/problems.css`, **solve** to `src/solve.css`, **lab** to `src/lab/lab.css`, **lablite**
to `src/lablite.css`.

**Check:** `/dashboard/problems/` matches picture 06 and `/dashboard/problems/url-shortener/` matches picture 07.
In the workspace: click each left tab; press Run, then Submit; open a hint; select a node (marigold ring); drag a
component from the palette. On a phone, open a problem (the simplified version shows) and check its buttons.

### WP7 — Account, tour, status

Append **account** to `src/account.css`, **tour** to `src/tour.css`, **status** to `src/status.css`.

**Check:** press Tour in the dashboard header and step through it. Open `/health`. The sign-in card only shows on
production (sign-in is off locally); check it on the preview deployment of the pull request.

### WP8 — Motion

1. Create the file `frontend/src/theme/motion.css` with the content of Appendix D.
2. In `frontend/src/theme/index.js` there is one line of imports. In it, replace `import"./base.css";` with
   `import"./base.css";import"./motion.css";`.
   (`tokens.css` from Appendix A already has the `--dur-enter` token this file reads.)

`motion.css` also holds the five product moments of section 4.8 (its group 8). They depend on the `solve` block from WP6 being in place.

**Check** (with your browser's reduced-motion setting **off**): reload `/`: the hero text steps in and the marigold
stroke is drawn under the last word about half a second later. Scroll down: the four cards rise as they enter.
Open `/dashboard/concepts/`: the cards rise in turn. Open an article and scroll: a thin ochre line grows under the
header (Chrome, Edge or Android). In a problem press Run: the result sheet slides up. On a phone open an article and
tap a figure's full-screen button: it must still fill the screen. Then turn reduced motion **on** and reload: nothing
animates, everything is in its final place, and the progress line still works.

### WP9 — Words and docs in the app repo

1. `frontend/src/theme/README.md`: add a row to its table: `motion.css` — every entrance and feedback animation — change it to: slow down, speed up or remove an animation. Also replace the first paragraph (the one that points to `Design.md`) with:
   `The look is "Katta Paper": warm paper, ink, one brand colour (marigold), Fraunces headings. The spec is tech-katta-context/20-UI-REDESIGN-SPEC.md.`
   In its table, add `--brand…`, `--page`, `--font-display` to the examples for `tokens.css`, and say Fraunces is loaded in `fonts.js`.
   Replace the "New accent colour" bullet with: `**New brand colour**: --brand, --brand-strong, --brand-edge, --brand-ink, --brand-line, --brand-tint, --on-brand, --mark in tokens.css (light and dark) and the same keys in palette.js TOKENS.`
2. Top of `Design.md` (repo root): add one line: `> Superseded by tech-katta-context/20-UI-REDESIGN-SPEC.md. Kept as a record of observations only.`

### WP10 — Final checks, then ship

Run the acceptance list in section 9. Then follow the usual repo flow: draft pull request, checks green, ready,
squash merge, ledger row, context docs (`17-SESSION-HANDOVER.md`, `10-GIT-HISTORY.md`, `11-MONGODB-COMMIT-LEDGER.md`,
`13-CURRENT-STATE.md`), and move the item in `18-TODO.md`.

---

## 9. Acceptance list

- [ ] `npm test` in `frontend`: `fail 0` (235 tests at the time of writing).
- [ ] `npm run build` finishes without errors.
- [ ] The end-to-end scripts the repo already has still pass (`no-lab.js`, `challenges-v2.js`, `eval-problem.js`,
      `solution-tab.js`; `08-TESTING-VALIDATION.md` and the handover say how to run them). They do not depend on colours.
- [ ] Every page in section 7, desktop and phone, light and dark: matches the pictures; no text cut off; no
      sideways scrolling on the phone; no blue or teal anywhere (buttons, figures, canvas handles, note boxes); no solid brown boxes in figures; no grid paper; no navy background.
- [ ] Only one marigold button per region; only one highlighter stroke per screen.
- [ ] Keyboard: Tab through the landing header and an article; every stop shows the ochre focus ring.
- [ ] Reduced motion on (browser setting): no entrance animations, nothing moves on hover, pages are complete at once.
- [ ] The five product moments in section 4.8 (items 14 to 18) were each seen working: stroke under a passed verdict, stars pop, a crashed node shudders once, the load bar slides, the zoomed figure pops.
- [ ] Animations match the table in section 4.6 (names, lengths, delays), checked in DevTools → Animations.
- [ ] Every row of the feature table in section 4.7 still works; every state in its state table is visible.
- [ ] No sideways scroll at 360 px; usable at 200 % zoom.
- [ ] Reduced motion off: the thirteen motions in section 4.5 happen, each once; nothing loops except loading lines and the figures.
- [ ] Phone: a figure's full-screen view still covers the whole screen (this breaks if an animation is changed to `both`).
- [ ] No console errors on any page.
- [ ] `git diff --stat` shows only: `package.json`, `package-lock.json`, three `index.html` files, `main.jsx`,
      files in `src/theme/` (one of them new: `motion.css`), the 16 stylesheets, `Design.md`. **No content, backend or test files.**

**What was verified while writing this spec, and what was not.** Built on commit `01adfbe` with exactly the code in
the appendices: unit tests pass (235), the build succeeds, and these were looked at in a browser — landing, start,
Concepts, the caching article (whole page), Problems, the URL-shortener workspace (with a component selected, and the result sheet after Run), on desktop and Pixel 7, light and
dark. The motion layer was run with motion on: hero and highlighter, card stagger, scroll reveals, reading progress, the
result sheet, and the phone full-screen figure afterwards. **Not looked at:** the sign-in card, the account menu, the tour, the score sheet after Submit (Run was checked), hints, the phone
(simplified) problem view, Quick Notes, Privacy, `/health`, `/analytics/`; and the end-to-end scripts were not run.
Their CSS follows the same patterns, but you must look at each one. If one looks wrong, fix it inside its appended
block using tokens only, and say so in the pull request.

---

## 10. Owner decisions (do not build these without being asked)

These came out of the research and would help, but they need new behaviour or data, so they are choices for the owner.

| Idea | Seen on | What it needs |
|---|---|---|
| "Mark as read" and a progress count on section cards | NeetCode, Khan | Storing read state per account (backend) |
| Bottom tab bar on phones (Read, Practise, Account) | Most learning apps | New component in `shell.jsx`, route changes |
| Search with a keyboard shortcut | Stripe, react.dev, Vercel | A search index (see `16-SEARCH-SEMANTICS-PERFORMANCE.md`) |
| Pricing / what you get section on the landing page | Brilliant, Hello Interview | Copy and a decision on pricing |
| Solved ring by difficulty on Problems | NeetCode | Only layout; data exists in progress storage |
| Merging each appended block into the rules above it | — | A clean-up pass once friends have given feedback on the look |

---

## 11. Changing the look later

Friends will react to this. Most reactions map to one token:

| "I wish…" | Change |
|---|---|
| …the ochre in figures and links were another colour | The nine `--accent…` tokens (light and dark) and the same keys in `palette.js` |
| …the yellow were another colour | The eight `--brand…` tokens and `--mark`, light and dark, and the same keys in `palette.js` |
| …the background were plain white | `--page` (and the three `index.html` inline styles, and `theme-color`) |
| …the headings were not serif | `--font-display` (set it to `var(--font)`), and remove the Fraunces import |
| …it moved less, or not at all | `--dur-enter` in `tokens.css` for speed; delete a numbered group in `motion.css` to remove one effect; remove the `motion.css` import in `theme/index.js` to remove all of it |
| …corners were sharper or rounder | `--radius`, `--r-md`, `--r-lg`, `--r-xl` |
| …the text were bigger | `.d-article>p,.d-article>ul` in the article block |

---

## Appendix A — `frontend/src/theme/tokens.css` (replace the whole file)

```css
/* The site's look in one place: every colour, typeface, radius, shadow and animation speed the pages use.
   Every stylesheet reads these names (var(--brand), var(--line), …) and never a colour code of its own, so a
   new colour scheme is an edit to this file. Code that needs a colour value (figures, the canvas) reads them through theme/palette.js.
   Dark mode: the same names with dark values, below. It follows the device's setting unless the visitor picked
   one with the theme button (<html data-theme="light|dark">, set before the page draws by public/theme-boot.js; theme/mode.js keeps it up to date).
   Rules for colour names: name the role, not the hue (--brand, not --yellow), so a new brand colour still reads right.
   The look ("Katta Paper"): warm paper page, white cards, ink text, one brand colour (marigold) for the main button,
   the highlighter mark and "you are here"; ochre (the dark end of the same family) for links, focus, and lines in figures and on the canvas. */
:root{
  color-scheme:light;
  /* Surfaces */
  --page:#faf7f0;         /* the page background (paper) */
  --bg:#fff;              /* cards, inputs, figure boxes */
  --surface:#f3efe5;      /* wells, quiet panels, inline code */
  --surface-2:#fcfaf5;    /* sidebar, table heads, very faint panels */
  --hover:#efeadd;        /* hover on rows and quiet buttons */
  --inverse:#1d1b16;      /* the one dark card per page (practise call-out), selected chips */
  --on-inverse:#faf7f0;
  /* Text */
  --ink:#1d1b16;
  --ink-2:#3a372f;
  --ink-3:#4d493f;
  --muted:#625c4f;
  --muted-2:#6b6557;
  --faint:#736d5d;
  --disabled:#cdc7b6;
  /* Lines */
  --line-strong:#b9b2a0;
  --line:#e6e0d1;
  --line-soft:#ddd6c4;
  --grid:#f0ebde;
  /* Brand (marigold): main button, highlighter, active marker. Text on it is always --on-brand. */
  --brand:#ffc233;
  --brand-strong:#f2ac00; /* hover on the main button, active marker lines */
  --brand-edge:#d79a00;   /* border of the main button */
  --brand-ink:#6e4a00;    /* brand-coloured text on light tints */
  --brand-line:#f0d388;   /* border of brand-tinted boxes */
  --brand-tint:#fff3cf;   /* brand-tinted boxes, active sidebar row */
  --on-brand:#1d1b16;
  --mark:#ffd866;         /* the highlighter stroke under a headline word */
  /* Accent (ochre; marigold in dark): links, focus rings, hover outlines, lines and labels in figures, canvas handles.
     Use it for lines and text only. A filled shape is --brand with --on-brand text. */
  --accent:#94600a;
  --accent-strong:#754a00;
  --accent-mid:#e9b949;
  --accent-line:#f0d388;
  --accent-soft:#ffe08a;
  --accent-tint-2:#ffedb8;
  --accent-tint:#fff6dc;
  --on-accent:#fff;
  /* Status */
  --danger:#b3261e;
  --red:#d23b30;
  --danger-line:#f3c6c1;
  --danger-soft:#fce1de;
  --danger-tint:#fff4f2;
  --success:#17794a;
  --success-line:#b5e0c6;
  --success-tint:#ecf8f0;
  --warn:#9c4a00;         /* orange, so a warning never reads as the brand */
  --warn-strong:#7a3900;
  --warn-mid:#e8700c;
  --warn-line:#f5cfa9;
  --warn-tint:#fff3e6;
  --star:#e8a308;
  /* Categories, where a figure needs several colours that mean nothing more than "different" */
  --cat-green:#1f8a5b;
  --cat-amber:#b7791f;
  --cat-violet:#7c3aed;
  --cat-teal:#0e7490;
  --cat-pink:#be185d;
  /* The same colours as r g b triples, for see-through shadows and backdrops */
  --ink-rgb:29 27 22;
  --bg-rgb:255 255 255;
  --page-rgb:250 247 240;
  --accent-rgb:148 96 10;
  /* Shadows and backdrops */
  --shadow-1:0 1px 2px rgb(var(--ink-rgb) / .06);
  --shadow-2:0 2px 4px rgb(var(--ink-rgb) / .05),0 10px 24px rgb(var(--ink-rgb) / .09);
  --shadow-3:0 4px 8px rgb(var(--ink-rgb) / .06),0 18px 44px rgb(var(--ink-rgb) / .18);
  --scrim:rgb(var(--ink-rgb) / .36);
  --glass:rgb(var(--page-rgb) / .86);
  /* Type */
  --font:Inter,Arial,sans-serif;
  --font-display:"Fraunces Variable",Georgia,"Times New Roman",serif;
  --mono:"IBM Plex Mono",monospace;
  /* Shape */
  --radius:8px;
  --r-sm:6px;
  --r-md:10px;
  --r-lg:14px;
  --r-xl:18px;
  --r-full:999px;
  /* Motion: every transition uses these, and reduced motion sets them to 0 (theme/base.css) */
  --dur-fast:.12s;
  --dur:.2s;
  --dur-enter:.36s;       /* things arriving on the page (theme/motion.css) */
  --ease:cubic-bezier(.2,.7,.2,1);
}
/* Dark: the same roles. Keep contrast: --ink on --bg and --muted on --surface both at least 4.5:1. */
:root[data-theme=dark]{
  color-scheme:dark;
  --page:#15140f;
  --bg:#1e1c16;
  --surface:#28261e;
  --surface-2:#191812;
  --hover:#2e2b22;
  --inverse:#f4f1e8;
  --on-inverse:#1d1b16;
  --ink:#f4f1e8;
  --ink-2:#dbd7ca;
  --ink-3:#c8c3b4;
  --muted:#aca695;
  --muted-2:#9f9988;
  --faint:#8d8777;
  --disabled:#504c40;
  --line-strong:#5e594a;
  --line:#322f26;
  --line-soft:#3d3a2f;
  --grid:#22201a;
  --brand:#ffc233;
  --brand-strong:#ffd466;
  --brand-edge:#b88400;
  --brand-ink:#ffd87a;
  --brand-line:#5f4813;
  --brand-tint:#30260f;
  --on-brand:#1d1b16;
  --mark:#7d5c00;
  --accent:#ffc233;
  --accent-strong:#ffd466;
  --accent-mid:#a87a10;
  --accent-line:#5f4813;
  --accent-soft:#4a3a12;
  --accent-tint-2:#3a2e10;
  --accent-tint:#2b230f;
  --on-accent:#1d1b16;
  --danger:#ff8a80;
  --red:#ff7b72;
  --danger-line:#6b2c28;
  --danger-soft:#4a2220;
  --danger-tint:#2b1816;
  --success:#5fd38a;
  --success-line:#2c5e3c;
  --success-tint:#15261b;
  --warn:#ffab66;
  --warn-strong:#ffc594;
  --warn-mid:#e8700c;
  --warn-line:#693c14;
  --warn-tint:#2d1d10;
  --star:#f2b01e;
  --cat-green:#3fb97a;
  --cat-amber:#e0a43a;
  --cat-violet:#a78bfa;
  --cat-teal:#22b8cf;
  --cat-pink:#f472b6;
  --ink-rgb:0 0 0;
  --bg-rgb:30 28 22;
  --page-rgb:21 20 15;
  --accent-rgb:255 194 51;
  --shadow-1:0 1px 2px rgb(0 0 0 / .4);
  --shadow-2:0 2px 4px rgb(0 0 0 / .35),0 10px 24px rgb(0 0 0 / .35);
  --shadow-3:0 4px 8px rgb(0 0 0 / .4),0 18px 44px rgb(0 0 0 / .55);
  --scrim:rgb(0 0 0 / .6);
  --glass:rgb(var(--page-rgb) / .86);
}
```

## Appendix B — `TOKENS` in `frontend/src/theme/palette.js` (one line)

```js
export const TOKENS={page:"#faf7f0",bg:"#fff",surface:"#f3efe5","surface-2":"#fcfaf5",hover:"#efeadd",inverse:"#1d1b16","on-inverse":"#faf7f0",ink:"#1d1b16","ink-2":"#3a372f","ink-3":"#4d493f",muted:"#625c4f","muted-2":"#6b6557",faint:"#736d5d",disabled:"#cdc7b6","line-strong":"#b9b2a0",line:"#e6e0d1","line-soft":"#ddd6c4",grid:"#f0ebde",brand:"#ffc233","brand-strong":"#f2ac00","brand-edge":"#d79a00","brand-ink":"#6e4a00","brand-line":"#f0d388","brand-tint":"#fff3cf","on-brand":"#1d1b16",mark:"#ffd866",accent:"#94600a","accent-strong":"#754a00","accent-mid":"#e9b949","accent-line":"#f0d388","accent-soft":"#ffe08a","accent-tint-2":"#ffedb8","accent-tint":"#fff6dc","on-accent":"#fff",danger:"#b3261e",red:"#d23b30","danger-line":"#f3c6c1","danger-soft":"#fce1de","danger-tint":"#fff4f2",success:"#17794a","success-line":"#b5e0c6","success-tint":"#ecf8f0",warn:"#9c4a00","warn-strong":"#7a3900","warn-mid":"#e8700c","warn-line":"#f5cfa9","warn-tint":"#fff3e6",star:"#e8a308","cat-green":"#1f8a5b","cat-amber":"#b7791f","cat-violet":"#7c3aed","cat-teal":"#0e7490","cat-pink":"#be185d"};
```

## Appendix C — blocks to append

Each block goes at the **end** of the file named in its heading, after one empty line. Copy from the comment line to the last line.

### C · styles → `frontend/src/styles.css` (WP3)

```css
/* ===== Katta Paper skin ===== */
:root{background:var(--page)}
a:focus-visible,button:focus-visible,summary:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.header{position:sticky;top:0;z-index:30;height:64px;background:var(--glass);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.brand{gap:10px;font:600 20px var(--font-display);letter-spacing:-.015em}
.brand>i{width:28px;height:28px;border-radius:var(--radius);background:var(--brand)}
.brand em{display:none}
.brand span{font:500 10px var(--mono);letter-spacing:.1em;color:var(--faint)}
.nav{gap:26px;align-items:center;font:500 14.5px var(--font);letter-spacing:0;color:var(--muted)}
.nav a{border-bottom:0;transition:color var(--dur-fast) var(--ease)}
.nav a:hover,.nav a.active{color:var(--ink)}
.hero{grid-template-columns:1fr 1.05fr;gap:56px;padding-top:76px;padding-bottom:76px}
.hero>div{max-width:540px}
.hero label,.section label,.inside>label,.lp-eyebrow{display:inline-flex;align-items:center;gap:8px;color:var(--muted);font:600 11px var(--mono);letter-spacing:.12em;border:0;background:none;padding:0}
.hero label::before,.inside>label::before,.lp-eyebrow::before{content:"";width:8px;height:8px;border-radius:2px;background:var(--brand)}
.hero h1{font:600 clamp(40px,5.2vw,66px)/1.04 var(--font-display);letter-spacing:-.025em;margin:18px 0 20px}
.tk-mark{background:linear-gradient(transparent 60%,var(--mark) 60%,var(--mark) 92%,transparent 92%);padding:0 .06em;margin:0 -.06em;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.hero p{font-size:18px;line-height:1.6;color:var(--ink-3)}
.actions{gap:12px;margin-top:30px;flex-wrap:wrap}
.btn{height:48px;padding:0 20px;border:1px solid var(--line-strong);border-radius:var(--r-md);background:var(--bg);color:var(--ink);font:600 15px var(--font);letter-spacing:0;box-shadow:var(--shadow-1);transition:background var(--dur-fast) var(--ease),border-color var(--dur-fast) var(--ease),transform var(--dur-fast) var(--ease)}
.btn:hover{border-color:var(--ink);background:var(--bg);color:var(--ink)}
.btn:active{transform:translateY(1px)}
.btn.primary{border-color:var(--brand-edge);background:var(--brand);color:var(--on-brand)}
.btn.primary:hover{background:var(--brand-strong);border-color:var(--brand-edge);color:var(--on-brand)}
.figure{border:1px solid var(--line);border-radius:var(--r-xl);background:var(--bg);box-shadow:var(--shadow-2);overflow:hidden}
.fig-head{font:600 10px/1.45 var(--mono);letter-spacing:.08em;color:var(--muted)}
.brand i,.fig-head i,.trade-title i,.foot i{background:var(--brand)}
.fig-head>span{border:0;border-radius:var(--r-full);background:var(--success-tint);color:var(--success);padding:4px 10px}
.figure figcaption{background:var(--surface-2);font:400 13px/1.5 var(--font);color:var(--muted)}
.inside{padding-top:32px;padding-bottom:64px}
.inside h2,.ch-title{font:600 clamp(30px,3.6vw,42px)/1.1 var(--font-display);letter-spacing:-.02em;margin:14px 0 10px}
.inside-desc,.ch-desc{font-size:17px;line-height:1.6;color:var(--ink-3)}
.inside-grid{gap:14px}
.inside-grid a{border:1px solid var(--line);border-radius:var(--r-lg);background:var(--bg);padding:22px 20px 18px;gap:10px;box-shadow:var(--shadow-1);min-height:220px;transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease),border-color var(--dur) var(--ease)}
.inside-grid a:hover{border-color:var(--line-strong);transform:translateY(-3px);box-shadow:var(--shadow-2)}
.inside-grid small{align-self:flex-start;font:600 10px var(--mono);letter-spacing:.08em;color:var(--brand-ink);background:var(--brand-tint);border-radius:var(--r-full);padding:4px 10px}
.inside-grid b{font:600 23px/1.2 var(--font-display);letter-spacing:-.01em}
.inside-grid p{font-size:14.5px;line-height:1.55;color:var(--muted)}
.inside-grid em{font:600 13px var(--font);color:var(--ink)}
.section h2,.notes-box h2{font:600 30px/1.15 var(--font-display);letter-spacing:-.02em}
.lp-lab{border:1px solid var(--line);border-radius:var(--r-xl);background:var(--bg);box-shadow:var(--shadow-2);overflow:hidden}
.text-link,.card-foot a{color:var(--ink)}
.text-link{font:600 14px var(--font)}
.footer{border-top:1px solid var(--line);background:var(--surface-2)}
.foot>div>b{font:600 18px var(--font-display)}
.foot p{font:400 13px/1.6 var(--font);color:var(--muted)}
.foot nav{font:500 14px var(--font);color:var(--muted)}
.foot nav a:hover{color:var(--ink)}
.foot>small{font:500 10px var(--mono);letter-spacing:.06em;color:var(--faint)}
.menu{border:1px solid var(--line-strong);border-radius:var(--r-md);font:600 13px var(--font);letter-spacing:0;padding:8px 12px}
.zoom-btn{border:1px solid var(--line-strong);border-radius:var(--r-md);color:var(--ink);font:600 12px var(--font);letter-spacing:0}
.zoom-box{border-radius:var(--r-xl)}
@media(max-width:980px){.hero{grid-template-columns:1fr;gap:36px;padding-top:44px;padding-bottom:52px}}
@media(max-width:680px){.header{height:60px}.nav{top:59px;gap:0;background:var(--bg);box-shadow:var(--shadow-3);font-size:16px}.brand{font-size:19px}.hero h1{font-size:40px}.hero p{font-size:17px}.btn{flex:1 1 auto;justify-content:center}.inside h2,.ch-title{font-size:30px}}
@media(prefers-reduced-motion:reduce){.btn,.inside-grid a,.nav a{transition:none}.inside-grid a:hover{transform:none}}
```

### C · library → `frontend/src/library.css` (WP3)

```css
/* ===== Katta Paper skin ===== */
.cards{gap:16px}
.card{border:1px solid var(--line);border-radius:var(--r-lg);background:var(--bg);padding:20px 20px 0;box-shadow:var(--shadow-1);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease),border-color var(--dur) var(--ease)}
.card:hover,.card:focus-visible{border-color:var(--line-strong);transform:translateY(-3px);box-shadow:var(--shadow-2)}
.meta{font:600 10px var(--mono);letter-spacing:.1em;color:var(--faint)}
.meta span:first-child{color:var(--brand-ink)}
.mini{border:1px solid var(--line);border-radius:var(--r-md);background:var(--surface-2);margin-bottom:18px}
.card h2{font:600 23px/1.2 var(--font-display);letter-spacing:-.01em;margin:0 0 8px}
.card>p{font-size:14.5px;line-height:1.55;color:var(--muted)}
.card-foot{border-top:1px solid var(--line);min-height:48px;font:500 10px var(--mono);letter-spacing:.08em;color:var(--faint)}
.card-go{font:600 13px var(--font);letter-spacing:0;color:var(--ink)}
.card:hover .card-go,.card:focus-visible .card-go{text-decoration:none}
@media(prefers-reduced-motion:reduce){.card{transition:none}.card:hover,.card:focus-visible{transform:none}}
```

### C · shell → `frontend/src/dashboard/shell.css` (WP4)

```css
/* ===== Katta Paper skin (tech-katta-context/20-UI-REDESIGN-SPEC.md) ===== */
:root{background:var(--page)}
a:focus-visible,button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.icon-btn{width:34px;height:34px;border:1px solid var(--line);border-radius:var(--r-md);background:var(--bg);color:var(--muted);transition:border-color var(--dur-fast) var(--ease),color var(--dur-fast) var(--ease)}
.icon-btn:hover{color:var(--ink);background:var(--bg);border-color:var(--line-strong)}
.side{background:var(--surface-2)}
.side-head{border-bottom:0}
.side-brand{gap:10px}
.side-brand b{display:inline-grid;place-items:center;width:28px;height:28px;flex:none;border-radius:var(--radius);background:var(--brand);color:var(--on-brand);font:700 11px var(--mono);letter-spacing:.02em}
.side-brand span{font:600 19px var(--font-display);letter-spacing:-.015em}
.side-label{padding:12px 22px 6px;border-bottom:0;font:600 10px var(--mono);letter-spacing:.12em;color:var(--faint)}
.side-nav{padding:4px 10px 10px}
.side-link{height:38px;padding:0 12px;border-left:0;border-radius:var(--radius);font-size:14.5px;font-weight:500;color:var(--ink-3);transition:background var(--dur-fast) var(--ease),color var(--dur-fast) var(--ease)}
.side-link:hover{background:var(--hover);color:var(--ink)}
.side-link.active{background:var(--brand-tint);color:var(--ink);font-weight:600;box-shadow:inset 3px 0 0 var(--brand-strong)}
.side-sub{margin:4px 0 8px 22px;border-left:1px solid var(--line)}
.side-sub a{padding:6px 12px;font-size:13.5px;color:var(--muted)}
.side-sub a:hover{color:var(--ink)}
.side-sub a.active{color:var(--ink);border-left-color:var(--brand-strong);font-weight:600}
.side-sub .side-group{padding:10px 12px 2px;font:600 9px var(--mono);letter-spacing:.12em;color:var(--faint)}
.side-foot{color:var(--muted)}
.side-foot:hover,.side-priv:hover{color:var(--ink)}
.d-head{background:var(--glass);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.tabs{gap:26px}
.tab{border-bottom-width:3px;font-size:14.5px;font-weight:500;color:var(--muted);transition:color var(--dur-fast) var(--ease)}
.tab:hover{color:var(--ink)}
.tab.active{color:var(--ink);font-weight:600;border-color:var(--brand)}
.d-tour,.d-home{height:34px;display:inline-flex;align-items:center;padding:0 12px;border:1px solid var(--line-strong);border-radius:var(--r-md);background:var(--bg);font:600 13px var(--font);letter-spacing:0;color:var(--ink);transition:border-color var(--dur-fast) var(--ease)}
.d-home{font-weight:500;color:var(--muted)}
.d-tour:hover,.d-tour:focus-visible,.d-home:hover{border-color:var(--ink);color:var(--ink)}
.d-body{padding:40px 32px 88px;background:var(--page);background-image:none}
.skip{border:2px solid var(--accent);border-radius:var(--r-md)}
@media(max-width:900px){.open .side{box-shadow:var(--shadow-3)}}
@media(max-width:680px){.d-body{padding:24px 16px 56px}}
@media(prefers-reduced-motion:reduce){.icon-btn,.d-tour,.d-home,.side-link,.tab{transition:none}}
@media(min-width:901px){.collapsed .side-priv{display:none}}
```

### C · pages → `frontend/src/dashboard/pages.css` (WP4)

```css
/* ===== Katta Paper skin ===== */
.d-panel{max-width:880px;background:none;border:0;padding:0}
.d-panel label{display:inline-flex;align-items:center;gap:8px;color:var(--muted);font:600 11px var(--mono);letter-spacing:.12em;text-transform:uppercase;border:0;background:none;padding:0}
.d-panel label::before{content:"";width:8px;height:8px;border-radius:2px;background:var(--brand)}
.d-panel .r-rate::before{content:none}
.d-panel h1{margin:14px 0 12px;font:600 44px/1.08 var(--font-display);letter-spacing:-.02em}
.d-desc{max-width:640px;font-size:17px;line-height:1.6;color:var(--ink-3)}
.d-list{margin-top:32px;border-top:0;padding-top:0}
.d-list>span,.d-empty span{font:600 10px var(--mono);letter-spacing:.12em;color:var(--faint)}
.d-list ol{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.d-list ol li+li{margin-top:0}
.d-list a{height:100%;display:flex;flex-direction:column;border:1px solid var(--line);border-radius:var(--r-lg);background:var(--bg);padding:20px 20px 18px;box-shadow:var(--shadow-1);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease),border-color var(--dur) var(--ease)}
.d-list a:hover{border-color:var(--line-strong);box-shadow:var(--shadow-2);transform:translateY(-2px)}
.d-list small{font:600 10px var(--mono);letter-spacing:.1em;color:var(--faint)}
.d-list b{margin:10px 0 6px;font:600 20px/1.22 var(--font-display);letter-spacing:-.01em}
.d-list p{font-size:14.5px;line-height:1.55;color:var(--muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.d-list em{margin-top:auto;padding-top:16px;font:600 13px var(--font);color:var(--ink)}
.d-group{margin-top:44px}
.d-group>h2{padding-top:0;border-top:0;font:600 26px/1.15 var(--font-display);letter-spacing:-.015em;text-transform:none}
.d-group>p{margin:6px 0 0;font-size:15px}
.d-group>ol{margin-top:16px}
.d-group .d-soon{border-radius:var(--r-lg);border-color:var(--line-strong)}
.d-notes{border-top:0;display:grid;gap:8px}
.d-notes li{padding:14px 16px;border:1px solid var(--line);border-radius:var(--r-lg);background:var(--bg)}
.d-notes b{font-size:15px}
.d-notes em{border:0;border-radius:var(--r-full);background:var(--surface);padding:4px 10px}
.d-notes em.draft{color:var(--brand-ink);background:var(--brand-tint)}
.priv h2{font:600 20px var(--font-display)}
.priv p{font-size:16px;line-height:1.7}
.d-panel.d-start{max-width:1100px}
@media(max-width:760px){.d-list ol{grid-template-columns:1fr}}
@media(max-width:680px){.d-panel{padding:0}.d-panel h1{font-size:32px}.d-desc{font-size:16px}.d-group>h2{font-size:22px}}
@media(prefers-reduced-motion:reduce){.d-list a{transition:none}.d-list a:hover{transform:none}}
```

### C · toggle → `frontend/src/theme/toggle.css` (WP4)

```css
/* ===== Katta Paper skin ===== */
.theme-btn{border:1px solid var(--line-strong);border-radius:50%;background:var(--bg);transition:border-color var(--dur-fast) var(--ease)}
.theme-btn:hover,.theme-btn:focus-visible{border-color:var(--ink);color:var(--ink)}
```

### C · article → `frontend/src/dashboard/article.css` (WP5)

```css
/* ===== Katta Paper skin ===== */
.d-read{gap:56px;max-width:1120px}
.d-article{max-width:720px}
.crumbs{margin-bottom:20px;font:500 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
.crumbs a{color:var(--muted)}
.crumbs a:hover{color:var(--ink);text-decoration:none}
.d-article h1{font:600 42px/1.1 var(--font-display);letter-spacing:-.02em;max-width:none;margin:0 0 14px}
.d-article>.d-dek{font-size:19px;line-height:1.55;color:var(--ink-3);max-width:none}
.d-article>.d-meta{margin:20px 0 0;padding-bottom:20px;border-bottom:1px solid var(--line);font:500 11px var(--mono);letter-spacing:.08em;color:var(--faint)}
.d-article>p,.d-article>ul{font-size:17px;line-height:1.75;color:var(--ink-2);max-width:none}
.d-article>p{margin:22px 0 0}
.d-article h2{margin:56px 0 0;padding-top:0;border-top:0;font:600 28px/1.2 var(--font-display);letter-spacing:-.015em}
.d-article h3{font-size:19px;font-weight:650;letter-spacing:-.01em}
.d-article code{font:500 .86em var(--mono);background:var(--surface);border:0;padding:2px 6px;border-radius:var(--r-sm)}
.d-article .reading{background-color:var(--mark);box-shadow:-4px 0 0 var(--mark),4px 0 0 var(--mark);border-radius:2px}
.a-back{font:600 14px var(--font);color:var(--muted)}
.a-back:hover{color:var(--ink);text-decoration:none}
.a-next{margin-top:56px}
.a-next>a:first-child:not(.a-all){border:1px solid var(--line);border-radius:var(--r-lg);background:var(--bg);padding:18px 20px;box-shadow:var(--shadow-1);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease),border-color var(--dur) var(--ease)}
.a-next>a:first-child:not(.a-all):hover{border-color:var(--line-strong);box-shadow:var(--shadow-2);transform:translateY(-2px)}
.a-next small{font:600 10px var(--mono);letter-spacing:.12em;color:var(--faint)}
.a-next b{font:600 20px/1.25 var(--font-display)}
.a-all{font:600 14px var(--font);color:var(--muted)}
.a-all:hover{color:var(--ink)}
@media(min-width:1240px){.d-rail{flex-basis:260px;gap:22px}}
.d-rail nav{background:none;border:0;padding:0}
.d-rail nav b,.rail-lab b{font:600 10px var(--mono);letter-spacing:.12em;color:var(--faint);padding:0 0 10px}
.d-rail li a{padding:6px 0 6px 14px;border-left:2px solid var(--line);font-size:14px;color:var(--muted);transition:color var(--dur-fast) var(--ease),border-color var(--dur-fast) var(--ease)}
.d-rail li a:hover{color:var(--ink);background:none}
.d-rail li a.on{border-left-color:var(--brand-strong);color:var(--ink);font-weight:600;background:none}
.rail-lab{background:var(--brand-tint);border:1px solid var(--brand-line);border-radius:var(--r-lg);padding:16px 18px;transition:border-color var(--dur-fast) var(--ease)}
.rail-lab b{color:var(--brand-ink);padding:0 0 6px}
.rail-lab span{padding:0;font-size:15px;line-height:1.4;font-weight:600;color:var(--ink)}
.rail-lab:hover{background:var(--brand-tint);border-color:var(--brand-edge)}
.pr-solve{min-height:44px;padding:0 20px;border:1px solid var(--brand-edge);border-radius:var(--r-md);background:var(--brand);color:var(--on-brand);font:600 15px var(--font);box-shadow:var(--shadow-1);transition:background var(--dur-fast) var(--ease),transform var(--dur-fast) var(--ease)}
.pr-solve:hover{background:var(--brand-strong)}
.pr-solve:active{transform:translateY(1px)}
@media(max-width:680px){.d-article h1{font-size:31px}.d-article>.d-dek{font-size:17px}.d-article h2{font-size:24px;margin-top:44px}.d-article>p,.d-article>ul,.a-type>p{font-size:17px}}
@media(prefers-reduced-motion:reduce){.a-next>a:first-child:not(.a-all),.pr-solve{transition:none}.a-next>a:first-child:not(.a-all):hover{transform:none}}
```

### C · blocks → `frontend/src/dashboard/blocks.css` (WP5)

```css
/* ===== Katta Paper skin ===== */
.a-tldr{border:0;border-radius:var(--r-lg);background:var(--surface);padding:20px 24px}
.a-tldr>b,.a-ex-head b,.a-analogy b,.a-lab b{font:600 10px var(--mono);letter-spacing:.12em;color:var(--muted)}
.a-tldr ul{font-size:16px;line-height:1.65;color:var(--ink-2)}
.a-example{border:1px solid var(--accent-line);border-radius:var(--r-lg);background:var(--accent-tint);padding:20px 24px}
.a-ex-head b{color:var(--accent)}
.a-ex-head span{font:600 19px var(--font-display);color:var(--ink)}
.a-ex-head small{font:500 10px var(--mono);letter-spacing:.1em;color:var(--muted)}
.a-example p{font-size:16px;line-height:1.65;color:var(--ink-2)}
.a-example dl{border-top:1px solid var(--accent-line)}
.a-example dt,.a-type dt{font:600 10px var(--mono);letter-spacing:.1em;color:var(--muted)}
.a-type{margin-top:18px;padding:22px 24px;border:1px solid var(--line);border-radius:var(--r-lg);background:var(--bg);box-shadow:var(--shadow-1)}
.a-type h3{margin:0;font:600 21px/1.25 var(--font-display)}
.a-type h3 small{font:600 10px var(--mono);letter-spacing:.1em;color:var(--faint)}
.a-type>p,.a-more>p{color:var(--ink-2)}
.a-type dt.ex,.a-type dt.like{color:var(--brand-ink)}
.a-type dd.ex{border-left:3px solid var(--brand)}
.a-table{border:1px solid var(--line);border-radius:var(--r-lg);background:var(--bg);overflow:hidden}
.a-table thead th{font:600 10px var(--mono);letter-spacing:.1em;color:var(--muted);background:var(--surface-2)}
.a-code{border:1px solid var(--line);border-radius:var(--r-lg);overflow:hidden}
.a-code figcaption{background:var(--surface-2);font:600 10px var(--mono);letter-spacing:.1em}
.a-code pre{background:var(--bg)}
.a-more>summary{min-height:44px;padding:8px 16px;border:1px solid var(--line-strong);border-radius:var(--r-md);background:var(--bg);font:600 14px var(--font);letter-spacing:0;color:var(--ink);transition:border-color var(--dur-fast) var(--ease)}
.a-more>summary:hover{border-color:var(--ink);background:var(--bg)}
.a-deeper>summary small{font:500 10px var(--mono);letter-spacing:.1em;color:var(--muted)}
.a-analogy{border-left:3px solid var(--brand);border-radius:0 var(--r-lg) var(--r-lg) 0;background:var(--brand-tint);padding:16px 22px}
.a-analogy b{color:var(--brand-ink)}
.a-analogy p{font-size:16px;line-height:1.65;color:var(--ink-2)}
.a-lab{border:0;border-radius:var(--r-lg);background:var(--inverse);padding:22px 24px;box-shadow:var(--shadow-2);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease)}
.a-lab:hover{background:var(--inverse);transform:translateY(-2px);box-shadow:var(--shadow-3)}
.a-lab b{color:var(--brand)}
.a-lab p{font:600 20px/1.3 var(--font-display);color:var(--on-inverse)}
.a-lab em{font:600 14px var(--font);color:var(--brand)}
:root[data-theme=dark] .a-lab b,:root[data-theme=dark] .a-lab em{color:var(--brand-ink)}
@media(max-width:680px){.a-table{border:0;background:none;overflow:visible}.a-table tr{border-radius:var(--r-md)}}
@media(prefers-reduced-motion:reduce){.a-lab,.a-more>summary{transition:none}.a-lab:hover{transform:none}}
```

### C · figure → `frontend/src/dashboard/figure.css` (WP5)

```css
/* ===== Katta Paper skin ===== */
.a-fig{border:1px solid var(--line);border-radius:var(--r-lg);background:var(--bg);box-shadow:var(--shadow-1);overflow:hidden}
.a-fig-head{border-bottom:1px solid var(--line);background:var(--surface-2);font:600 10px var(--mono);letter-spacing:.1em;color:var(--muted)}
.a-fig figcaption{border-top:1px solid var(--line);font-size:14px;color:var(--muted)}
.fs-btn{border:1px solid var(--line-strong);border-radius:var(--r-md);color:var(--ink)}
.fs-btn:hover,.fs-btn:focus-visible{border-color:var(--ink)}
```

### C · reader → `frontend/src/dashboard/reader.css` (WP5)

```css
/* ===== Katta Paper skin ===== */
.reader{border:1px solid var(--line);border-radius:var(--r-lg);background:var(--bg);padding:10px 12px}
.r-btn{height:36px;padding:0 14px;border:1px solid var(--line-strong);border-radius:var(--r-md);font:600 13px var(--font);letter-spacing:0;transition:border-color var(--dur-fast) var(--ease),background var(--dur-fast) var(--ease)}
.r-btn:hover{border-color:var(--ink);color:var(--ink)}
.r-btn.primary{border-color:var(--brand-edge);background:var(--brand);color:var(--on-brand)}
.r-btn.primary:hover{background:var(--brand-strong);color:var(--on-brand);border-color:var(--brand-edge)}
.r-rate{font:500 10px var(--mono);letter-spacing:.1em}
.r-rate select{height:36px;border:1px solid var(--line-strong);border-radius:var(--r-md);font:500 13px var(--font)}
@media(max-width:680px){.r-btn,.r-rate select{height:44px}}
@media(prefers-reduced-motion:reduce){.r-btn{transition:none}}
```

### C · problems → `frontend/src/problems.css` (WP6)

```css
/* ===== Katta Paper skin ===== */
.pb-bar{border-top:0;border-bottom:0;padding:0;margin-top:24px}
.pb-sum{font:600 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.pb-filter,.qt-levels{gap:6px}
.pb-filter button,.qt-levels button{min-height:34px;padding:0 14px;border:1px solid var(--line-strong);border-radius:var(--r-full);background:var(--bg);color:var(--ink-3);font:500 13.5px var(--font);letter-spacing:0;transition:border-color var(--dur-fast) var(--ease),background var(--dur-fast) var(--ease)}
.pb-filter button:hover,.qt-levels button:hover{border-color:var(--ink);color:var(--ink)}
.pb-filter button.on,.qt-levels button.on{border-color:var(--inverse);background:var(--inverse);color:var(--on-inverse);font-weight:600}
.pb-pick{min-height:34px;padding:0 14px;border:1px solid var(--brand-edge);border-radius:var(--r-full);background:var(--brand);color:var(--on-brand);font:600 13.5px var(--font);letter-spacing:0}
.pb-pick:hover{background:var(--brand-strong)}
.pb-group{margin-top:40px}
.pb-group>h2{padding-top:0;border-top:0;font:600 24px/1.15 var(--font-display);letter-spacing:-.015em;text-transform:none}
.pb-group a:not(.pb-lab){border:1px solid var(--line);border-radius:var(--r-lg);background:var(--bg);padding:18px 20px;box-shadow:var(--shadow-1);transition:transform var(--dur) var(--ease),box-shadow var(--dur) var(--ease),border-color var(--dur) var(--ease)}
.pb-group a:not(.pb-lab):hover{border-color:var(--line-strong);box-shadow:var(--shadow-2);transform:translateY(-2px)}
.pb-meta small{font:600 10px var(--mono);letter-spacing:.1em;color:var(--faint)}
.pb-tag{font:600 11px var(--font);letter-spacing:0;text-transform:none;padding:3px 10px;border:0;border-radius:var(--r-full);background:var(--surface);color:var(--muted)}
.pb-tag.easy{color:var(--success);background:var(--success-tint)}
.pb-tag.medium{color:var(--warn);background:var(--warn-tint)}
.pb-tag.hard{color:var(--danger);background:var(--danger-tint)}
.pb-group b{font-weight:600}
.pb-lab{margin-top:6px;border:0;border-radius:var(--radius);background:var(--surface);font:500 13px var(--font)}
.pb-lab:hover{color:var(--ink);background:var(--hover)}
.pb-none{border-radius:var(--r-lg)}
.qt-table{border-collapse:separate;border-spacing:0;border:1px solid var(--line);border-radius:var(--r-lg);background:var(--bg);overflow:hidden;font-size:15px;box-shadow:var(--shadow-1)}
.qt-table th{padding:12px 16px;font:600 10px var(--mono);letter-spacing:.1em;color:var(--muted);background:var(--surface-2);border-bottom:1px solid var(--line)}
.qt-table td{padding:16px;border-bottom:1px solid var(--line)}
.qt-table tbody tr:last-child td{border-bottom:0}
.qt-table tbody tr:nth-child(even){background:none}
.qt-table tbody tr:hover{background:var(--surface-2)}
.qt-table .c1{font:500 12px var(--mono);color:var(--faint)}
.qt-table .c2 a{font-weight:600}
.qt-table .c2 a:hover{color:var(--accent)}
.pb-group .qt-table a,.pb-group .qt-table a:hover{background:none;border:0;box-shadow:none;border-radius:0;transform:none;padding:0}
.qt-start{border:1px solid var(--brand-line);border-radius:var(--r-lg);background:var(--brand-tint);padding:18px 20px;transition:border-color var(--dur-fast) var(--ease)}
.qt-start small{font:600 10px var(--mono);letter-spacing:.12em;color:var(--brand-ink)}
.qt-start b{font:600 20px/1.25 var(--font-display)}
.qt-start span{color:var(--ink-2)}
.qt-start:hover{background:var(--brand-tint);border-color:var(--brand-edge)}
@media(max-width:760px){.qt-table{border:0;background:none;box-shadow:none;overflow:visible}.qt-table tr{margin-bottom:10px;padding:14px;border:1px solid var(--line);border-radius:var(--r-lg);background:var(--bg)}.qt-table td{border:0;padding:0}.qt-table tbody tr:nth-child(even){background:var(--bg)}}
@media(prefers-reduced-motion:reduce){.pb-group a:not(.pb-lab){transition:none}.pb-group a:not(.pb-lab):hover{transform:none}}
```

### C · solve → `frontend/src/solve.css` (WP6)

```css
/* ===== Katta Paper skin ===== */
.solve{background:var(--page)}
.sv-tabs{background:var(--surface-2)}
.sv-tabs a,.sv-tabs button{font:500 13.5px var(--font);letter-spacing:0;text-transform:none;color:var(--muted);transition:color var(--dur-fast) var(--ease)}
.sv-tabs a:hover,.sv-tabs button:hover{color:var(--ink)}
.sv-tabs .on{color:var(--ink);font-weight:600;background:var(--bg);box-shadow:inset 0 -3px 0 var(--brand)}
.sv-q{background:var(--bg)}
.sv-q>label,.sd-head label{font:600 10px var(--mono);letter-spacing:.12em;color:var(--muted)}
.sv-q h1{font:600 30px/1.15 var(--font-display);letter-spacing:-.015em}
.sv-split:hover,.sv-split:focus-visible{background:var(--brand-strong)}
.sv-how{border-left:3px solid var(--brand-strong);border-radius:0 var(--r-md) var(--r-md) 0;background:var(--surface);padding:14px 16px;color:var(--ink-2)}
.sv-links a{border:1px solid var(--line);border-radius:var(--r-md);background:var(--bg);padding:12px 14px;color:var(--ink)}
.sv-links a:hover{border-color:var(--line-strong);background:var(--surface-2)}
.sv-links .sv-answer{background:var(--brand-tint);border-color:var(--brand-line)}
.sv-bar{background:var(--surface-2)}
.sv-toggle{font:600 12.5px var(--font);letter-spacing:0;color:var(--muted)}
.sv-toggle:hover{color:var(--ink)}
.sv-run,.sv-submit,.sv-clock,.sv-reset{border:1px solid var(--line-strong);border-radius:var(--r-md);background:var(--bg);color:var(--ink);font:600 13.5px var(--font);letter-spacing:0;transition:border-color var(--dur-fast) var(--ease),background var(--dur-fast) var(--ease)}
.sv-run:hover,.sv-reset:hover,.sv-clock:hover{background:var(--bg);color:var(--ink);border-color:var(--ink)}
.sv-clock.on{color:var(--brand-ink);border-color:var(--brand-edge);background:var(--brand-tint)}
.sv-submit{border-color:var(--brand-edge);background:var(--brand);color:var(--on-brand)}
.sv-submit:hover{background:var(--brand-strong);color:var(--on-brand)}
.sv-nav a:hover{border-color:transparent;border-radius:var(--r-sm);background:var(--hover);color:var(--ink)}
.sv-console{border-top:1px solid var(--line);box-shadow:0 -10px 30px rgb(var(--ink-rgb) / .1)}
.sv-v b{font:600 22px/1.2 var(--font-display)}
.sv-linkbtn{color:var(--accent);font:600 13.5px var(--font)}
.sv-why{border-radius:0 var(--r-md) var(--r-md) 0}
.sv-tests h2{border-top:0;font:600 21px var(--font-display)}
.sv-test,.sv-json,.sv-hop{border:1px solid var(--line);border-radius:var(--r-md)}
.sv-json.bad{border-color:var(--danger-line)}
.sv-ans textarea,.sv-in input,.sv-in select,.sv-row select,.sv-row input{border:1px solid var(--line-strong);border-radius:var(--radius);background:var(--bg);color:var(--ink)}
.sv-ans textarea:focus,.sv-ans input:focus,.sv-ans select:focus{outline:2px solid var(--accent);outline-offset:1px}
.sv-row button,.sv-add,.sv-hints button,.sv-watch{border:1px solid var(--line-strong);border-radius:var(--r-md);background:var(--bg);color:var(--ink);font:600 13px var(--font);letter-spacing:0}
.sv-row button:hover,.sv-add:hover,.sv-hints button:hover,.sv-watch:hover{border-color:var(--ink);background:var(--bg)}
.sv-hints li{border:1px solid var(--line);border-radius:var(--r-lg);background:var(--bg);padding:14px 16px}
.sv-hints li.open{background:var(--brand-tint);border-color:var(--brand-line)}
.sv-hints small{font:600 10px var(--mono);letter-spacing:.12em;color:var(--muted)}
.sv-subs th{font:600 10px var(--mono);letter-spacing:.1em;color:var(--muted)}
.sv-dec{border:1px solid var(--line);border-radius:var(--r-lg)}
.sv-dec label{border-radius:var(--r-sm)}
.sd-head h2{font:600 24px/1.2 var(--font-display)}
.sd-copy{border:1px solid var(--brand-edge);border-radius:var(--r-md);background:var(--brand);color:var(--on-brand);font:600 13.5px var(--font);letter-spacing:0}
.sd-copy:hover{background:var(--brand-strong)}
.sd-fig{border:1px solid var(--line);border-radius:var(--r-lg);background-color:var(--bg)}
@media(prefers-reduced-motion:reduce){.sv-run,.sv-submit,.sv-clock,.sv-reset,.sv-tabs a,.sv-tabs button{transition:none}}
.sv-v.good b{display:inline-block;color:var(--ink);padding:0 .08em;background:linear-gradient(transparent 62%,var(--mark) 62%,var(--mark) 94%,transparent 94%) no-repeat}
```

### C · lab → `frontend/src/lab/lab.css` (WP6)

```css
/* ===== Katta Paper skin ===== */
.lab-name{border-radius:var(--radius);font:600 19px var(--font-display)}
.lab-name:hover{border-color:var(--line-strong)}
.lab-name:focus{border-color:var(--accent)}
.lab-btn{border:1px solid var(--brand-edge);border-radius:var(--r-md);background:var(--brand);color:var(--on-brand);font:600 13.5px var(--font);letter-spacing:0;transition:background var(--dur-fast) var(--ease),border-color var(--dur-fast) var(--ease)}
.lab-btn:hover{background:var(--brand-strong);color:var(--on-brand)}
.lab-btn:disabled{background:var(--surface);border-color:var(--line);color:var(--faint)}
.lab-btn.ghost{background:var(--bg);color:var(--ink);border-color:var(--line-strong)}
.lab-btn.ghost:hover{background:var(--bg);border-color:var(--ink);color:var(--ink)}
.lab-meter{border-radius:var(--r-full);overflow:hidden}
.lab-status{background:var(--surface-2);color:var(--ink-2)}
.lab-pal,.lab-ins{background:var(--surface-2)}
.lab-h{font:600 10px var(--mono);letter-spacing:.12em;color:var(--muted)}
.lab-g{font:600 10px var(--mono);letter-spacing:.1em;color:var(--faint)}
.lab-item{min-height:40px;border:1px solid var(--line);border-radius:var(--radius);background:var(--bg);font:500 14px var(--font);transition:border-color var(--dur-fast) var(--ease),box-shadow var(--dur-fast) var(--ease)}
.lab-item:hover{color:var(--ink);border-color:var(--line-strong);box-shadow:var(--shadow-1)}
.lab-ghost{border-radius:var(--radius);box-shadow:var(--shadow-3)}
.lab-canvas{background:var(--page)}
.lab-canvas.drop{box-shadow:inset 0 0 0 2px var(--brand)}
.lab-ins :is(h2,h3,h4){font:600 20px/1.2 var(--font-display)}
.lab-f>span,.lab-kv dt{font:600 10px var(--mono);letter-spacing:.1em;color:var(--muted)}
.lab-f input[type=number],.lab-f select,.lab-speed select,.sch input,.sch select{border:1px solid var(--line-strong);border-radius:var(--radius)}
.lab-f input[type=range],.lab-check input{accent-color:var(--brand-strong)}
.lab-menu,.lab-score,.sch{border:1px solid var(--line);border-radius:var(--r-lg);box-shadow:var(--shadow-3)}
.lab-menu li.cur{background:var(--brand-tint)}
.ln{border-radius:var(--r-md);box-shadow:var(--shadow-1)}
.ln.sel{box-shadow:0 0 0 3px var(--brand),var(--shadow-2)}
.lab .react-flow__controls{border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow-1)}
@media(prefers-reduced-motion:reduce){.lab-btn,.lab-item{transition:none}}
.lab-stars{color:var(--star)}
```

### C · lablite → `frontend/src/lablite.css` (WP6)

```css
/* ===== Katta Paper skin ===== */
.ll-flow{border:1px solid var(--line);border-radius:var(--r-lg);background:var(--surface-2)}
.ll-box{border-radius:var(--radius);box-shadow:var(--shadow-1)}
.ll-check,.ll-step,.ll-radio{border:1px solid var(--line);border-radius:var(--r-lg);background:var(--bg)}
.ll-check input,.ll-radio input{accent-color:var(--brand-strong)}
.ll-step button{border:1px solid var(--line-strong);border-radius:var(--r-md)}
.ll-radio legend{font:600 10px var(--mono);letter-spacing:.1em}
.ll-score{height:50px;border:1px solid var(--brand-edge);border-radius:var(--r-md);background:var(--brand);color:var(--on-brand);font:600 15px var(--font)}
.ll-res{border:1px solid var(--brand-line);border-radius:var(--r-lg);background:var(--brand-tint)}
.ll-stars{color:var(--star)}
```

### C · account → `frontend/src/account.css` (WP7)

```css
/* ===== Katta Paper skin ===== */
.acct-btn{height:36px;border:1px solid var(--line-strong);border-radius:var(--r-full);background:var(--bg)}
.acct-btn:hover,.acct-btn:focus-visible,.acct-btn[aria-expanded=true]{border-color:var(--ink)}
.acct-btn i{background:var(--brand);color:var(--on-brand)}
.acct-menu{top:46px;border:1px solid var(--line);border-radius:var(--r-lg);box-shadow:var(--shadow-3);padding:16px}
.acct-menu a:hover,.acct-menu button:hover{color:var(--ink);text-decoration:underline}
.acct-ads input,.acct-consent input{accent-color:var(--brand-strong)}
.lock-card{width:min(420px,calc(100% - 32px));border:1px solid var(--line);border-radius:var(--r-xl);box-shadow:var(--shadow-3);padding:28px;gap:12px}
.lock-card b{font:600 26px/1.15 var(--font-display);letter-spacing:-.015em}
.lock-card p{font-size:15.5px;line-height:1.55;color:var(--muted)}
.lock-card em{font:500 11px var(--mono);letter-spacing:.06em;color:var(--muted)}
.lock-skel{border:1px solid var(--line);border-radius:var(--r-xl)}
.lock-skel i{border-radius:var(--r-sm)}
.acct-signin-link{height:36px;padding:0 16px;border:1px solid var(--brand-edge);border-radius:var(--r-md);background:var(--brand);color:var(--on-brand);font:600 13.5px var(--font)}
.acct-signin-link:hover{background:var(--brand-strong)}
.header .acct .acct-err{border-radius:var(--r-md)}
```

### C · tour → `frontend/src/tour.css` (WP7)

```css
/* ===== Katta Paper skin ===== */
.tour-hole{border:2px solid var(--brand);border-radius:var(--r-md)}
.tour-card{border:1px solid var(--line);border-radius:var(--r-xl);padding:20px 22px;box-shadow:var(--shadow-3)}
.tour-card small{font:600 10px var(--mono);letter-spacing:.12em;color:var(--muted)}
.tour-card b{font:600 21px/1.2 var(--font-display)}
.tour-act button,.tour-act a{height:38px;padding:0 14px;border:1px solid var(--line-strong);border-radius:var(--r-md);font:600 13.5px var(--font)}
.tour-act a:hover,.tour-act button:hover,.tour-act button:focus-visible,.tour-act a:focus-visible{border-color:var(--ink);color:var(--ink)}
.tour-act .tour-next{background:var(--brand);border-color:var(--brand-edge);color:var(--on-brand)}
.tour-act .tour-next:hover,.tour-act .tour-next:focus-visible{color:var(--on-brand);background:var(--brand-strong);border-color:var(--brand-edge)}
.tour-act .tour-skip{border-color:transparent}
.tour-prog i{background:var(--brand-strong)}
```

### C · status → `frontend/src/status.css` (WP7)

```css
/* ===== Katta Paper skin ===== */
.st i{border-radius:2px;background:var(--brand)}
.st-err button{height:44px;padding:0 20px;border:1px solid var(--brand-edge);border-radius:var(--r-md);background:var(--brand);color:var(--on-brand);font:600 15px var(--font)}
```

## Appendix D — `frontend/src/theme/motion.css` (new file, WP8)

```css
/* Motion: every entrance and feedback animation on the site, in one file. CSS only, no library.
   Rules: only transform and opacity move (never width, height or margins); nothing loops except loading marks and
   the figures' own loops; at most one or two things animate into a screen; everything here is inside
   prefers-reduced-motion:no-preference, so visitors who asked for less motion get the finished state at once.
   Speeds come from tokens.css (--dur-enter, --ease). To switch all of it off, remove this file's import in index.js. */
@keyframes tk-rise{from{opacity:0;transform:translateY(10px)}}
@keyframes tk-fade{from{opacity:0}}
@keyframes tk-pop{from{opacity:0;transform:scale(.96)}}
@keyframes tk-sheet{from{opacity:0;transform:translateY(24px)}}
@keyframes tk-mark{from{background-size:0 100%}to{background-size:100% 100%}}
@keyframes tk-shimmer{to{background-position:-200% 0}}
@keyframes tk-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes tk-shake{20%{transform:translateX(-3px)}40%{transform:translateX(3px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
@media(prefers-reduced-motion:no-preference){
  /* 1. Landing hero: the text steps in, then the figure, then the highlighter is drawn under the last word */
  .hero>div>*{animation:tk-rise var(--dur-enter) var(--ease) backwards}
  .hero>div>:nth-child(2){animation-delay:.06s}
  .hero>div>:nth-child(3){animation-delay:.12s}
  .hero>div>:nth-child(4){animation-delay:.18s}
  .hero>.figure{animation:tk-rise .5s var(--ease) .16s backwards}
  h1 .tk-mark{background-repeat:no-repeat;animation:tk-mark .6s var(--ease) .5s backwards}
  /* 2. Dashboard pages: the page rises once when you arrive; cards follow one after another (first eight only) */
  .d-body>.d-panel,.d-read>.d-article{animation:tk-rise var(--dur-enter) var(--ease) backwards}
  .d-read>.d-rail{animation:tk-fade .4s var(--ease) .15s backwards}
  :is(.d-list,.cards,.pb-group) :is(li,.card):nth-child(-n+8){animation:tk-rise var(--dur-enter) var(--ease) backwards}
  :is(.d-list,.cards,.pb-group) :is(li,.card):nth-child(2){animation-delay:.04s}
  :is(.d-list,.cards,.pb-group) :is(li,.card):nth-child(3){animation-delay:.08s}
  :is(.d-list,.cards,.pb-group) :is(li,.card):nth-child(4){animation-delay:.12s}
  :is(.d-list,.cards,.pb-group) :is(li,.card):nth-child(5){animation-delay:.16s}
  :is(.d-list,.cards,.pb-group) :is(li,.card):nth-child(6){animation-delay:.2s}
  :is(.d-list,.cards,.pb-group) :is(li,.card):nth-child(7){animation-delay:.24s}
  :is(.d-list,.cards,.pb-group) :is(li,.card):nth-child(8){animation-delay:.28s}
  /* 3. Small feedback: the arrow on a card leans forward; opened details and hints fade in */
  .d-list em,.inside-grid em,.card-go,.a-lab em,.a-next b{transition:transform var(--dur) var(--ease)}
  .d-list a:hover em,.inside-grid a:hover em,.card:hover .card-go,.a-lab:hover em{transform:translateX(4px)}
  .a-more[open]>:not(summary),.sv-hints li.open>:not(button){animation:tk-rise .24s var(--ease) backwards}
  /* 4. Things that open over the page: menus pop, the phone drawer's backdrop fades, sheets slide up */
  .acct-menu,.lab-menu,.tour-card,.lock-card{animation:tk-pop .16s var(--ease) backwards}
  .scrim{animation:tk-fade var(--dur) var(--ease) backwards}
  .sv-console,.lab-score{animation:tk-sheet .26s var(--ease) backwards}
  .sv-test:nth-child(-n+6){animation:tk-rise .24s var(--ease) backwards}
  .sv-test:nth-child(2){animation-delay:.05s}
  .sv-test:nth-child(3){animation-delay:.1s}
  .sv-test:nth-child(4){animation-delay:.15s}
  .sv-test:nth-child(5){animation-delay:.2s}
  .sv-test:nth-child(6){animation-delay:.25s}
  .ll-res{animation:tk-pop .22s var(--ease) backwards}
  /* 8. Tech Katta's own moments (spec section 4.8): the verdict, the stars, a server going down, a figure opening */
  .sv-v.good b{animation:tk-mark .5s var(--ease) .3s backwards}
  .lab-score .lab-stars,.ll-res .ll-stars{display:inline-block;animation:tk-pop .3s var(--ease) .25s backwards}
  .ln.down{animation:tk-shake .32s linear}
  .zoom{animation:tk-fade var(--dur) var(--ease) backwards}
  .zoom-box{animation:tk-pop .18s var(--ease) backwards}
  .lab-meter i{transition:width var(--dur) var(--ease)}
  /* 5. Waiting: the grey lines of a loading page shimmer (a sweep, not a pulse) */
  .lock-skel i{background-image:linear-gradient(90deg,transparent 0,rgb(var(--bg-rgb) / .7) 50%,transparent 100%);background-size:200% 100%;background-position:200% 0;animation:tk-shimmer 1.4s ease-in-out infinite}
  /* 6. Landing sections below the fold rise as they scroll into view. Browsers without scroll timelines just show them. */
  @supports (animation-timeline:view()){
    .inside-grid li,.lp-lab,.lp .ch-title,.lp .ch-desc{animation:tk-rise linear both;animation-timeline:view();animation-range:entry 0% entry 55%}
  }
}
/* 7. Reading progress: a thin line under the header fills as you scroll an article. It follows the reader's own
   scrolling, so it stays on under reduced motion. Browsers without scroll timelines show nothing. */
@supports (animation-timeline:scroll()){
  .dash:has(.d-read) .d-head::after{content:"";position:absolute;left:0;right:0;top:100%;height:2px;background:var(--accent);transform-origin:0 50%;animation:tk-progress linear both;animation-timeline:scroll(root)}
}
```
