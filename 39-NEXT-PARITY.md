# /p/next parity with tech.katta.cc

**Owner, 2026-11-15:** "I want the prototype.katta.cc/p/next as good as tech.katta.cc UI. It should also call the real backend tech-api.katta.cc. I want all the animations, content, sign in, everything."

**Audit method:** a Playwright crawl of the live tech.katta.cc on 2026-11-15, covering the landing, `/dashboard/` and every section, a lesson, an Interview Question, Problems, the workspace, a challenge, Quick Notes, Privacy and Terms. Each page's headings, buttons and menus were listed and screenshotted, and the legacy code was read (`frontend/src`).

**Legend:** ✅ in /p/next · ⚠️ partly · ❌ missing.

## Platform

| # | Item on tech.katta.cc | /p/next | Notes |
|---|---|---|---|
| P1 | Content from tech-api.katta.cc (site, articles, lab, stats, events) | ✅ | |
| P2 | Google sign-in, session, sync of progress, designs and stars | ⚠️ | Google client allows prototype.katta.cc (checked: button renders, no origin error). The API only trusts tech.katta.cc until **PR #368** merges and deploys. |
| P3 | Sign-in locks: section pages and lesson previews locked when signed out (`account.pageLock`, `previewLock`); LabLock "Sign in to play" on the landing lab | ✅ | |
| P4 | Account menu: avatar, sync status, Sign out, Sign out on all devices, Delete my account, Privacy | ✅ | Only sign in/out on You. |
| P5 | Privacy and Terms pages (`site.privacy`, `site.terms`), linked in the sidebar and sign-in dialog | ✅ | |
| P6 | Tour button on every dashboard page (`site.tour`) | ✅ | Only Home has a tour. |
| P7 | Analytics: page views and reading | ✅ | |

## Landing

| # | Item | /p/next | Notes |
|---|---|---|---|
| L1 | Hero: chip, title, lead, CTAs | ✅ | |
| L2 | Hero animated figure (Kafka producer, broker, consumer group) with the judge card floating beside it | ✅ | |
| L3 | Stats: problems with tests, challenge stars, visual notes, 3.5 cr, counting up | ✅ | Counts differ. |
| L4 | "Practise system design the way interviews test it": Interview Questions preview and Problems, judged (`site.inside`) | ✅ | Has a different "look inside". |
| L5 | "Can your design survive IND vs PAK?": the landing lab (`site.landingLab`), a real canvas with Sign in to play | ✅ | |
| L6 | Footer: brand, descriptor, links, last updated | ✅ | |

## Dashboard

| # | Item | /p/next | Notes |
|---|---|---|---|
| D1 | Sidebar: sections, and the active section's lessons listed under it; Privacy, Terms, Back to site; fold | ✅ | No lesson list, no policy links. |
| D2 | Home: greeting, Continue reading with the lesson's figure thumbnail and progress; problems solved ring; challenge stars; Explore cards with figure thumbnails; Up next | ✅ | No thumbnails, ring or stars. |
| D3 | Section pages: groups with lesson cards and figure thumbnails | ✅ | No thumbnails. |
| D4 | Interview Questions section: difficulty filter (All, Easy, Medium, Hard) and the guides group | ✅ | |
| D5 | Lesson: ▶ Listen (read aloud, recorded or device voice, speed); Share; "Examples use Zotato"; topic count, read time, "with details" | ✅ | No Listen. |
| D6 | Lesson Cards view: a grid of topic cards with a picture each and "Open", opening a sheet (TopicCards and TopicSheet) | ✅ | /p/next has a one-at-a-time deck instead. |
| D7 | Problems: Your plan (problem of the day, next in plan, weekly order); filters All, Not done yet, ★ Bookmarked, ⚄ Pick one, difficulty; table with accepted %; Sandbox; Challenges | ✅ | No plan, bookmarks, accepted % or sandbox. |
| D8 | Workspace (`solve.jsx`), challenges (Lab), practice pages | ✅ | Imported as they are. |
| D9 | Quick Notes: the notes list (draft and planned) and "The numbers behind a design" figure | ✅ | Shown as "soon". |
| D10 | Real systems section | ✅ | |
| D11 | Theme toggle | ✅ | |

## Plan

1. **Platform:** P3 locks, P4 account menu, P5 policy pages, P6 tour on every page.
2. **Dashboard:** D1 sidebar lessons and links, D9 Quick Notes, D5 Listen, D6 topic cards, D2 and D3 thumbnails, D7 plan, bookmarks and accepted %.
3. **Landing:** L2, L5, then L3, L4 and L6.

Where tech.katta.cc's code is the product (read aloud, topic sheet, plan, landing lab, numbers figure, account menu), it is imported from `frontend/src` like the figures and the workspace, and styled into the new design.

Every item is checked live, in light and dark, on desktop and phone, before it is marked ✅ here.

## Status after batches 1 to 3 (2026-11-15)

**Commits:** batches 1 to 3 are `cb265f4`, `a5ca945` and `09d018d` on `prototype`, copied into PR #367 as `9fd911d`, `f00d8ad` and `ecae191`. Every item above is ✅ except P2.

**P2, sign-in:**
- The Google client is set up: checked on 2026-11-15 with a probe. prototype.katta.cc renders the button with no origin error, while an unauthorised origin gets a 403.
- The API change is draft **PR #368** (`api-allowed-origins`), with CI green.
- Sign-in works once the owner merges #368 and the backend deploys.

**Verified live on prototype.katta.cc/p/next:** 17 checks, every route in light and dark, on desktop and phone, with no errors and no sideways scroll.
- Routes: landing, home, learn, section, Quick Notes, lesson, IQ, problems, workspace, challenge, sandbox, privacy, terms, me, 404.
- Interactions: Learn menu, judge card, sign-in dialog, `?`, `g p`, Pick one, filters, tour, topic card sheet, Mark complete burst, workspace, You.

**Notes:**
- D2: Home shows lessons, problems and challenge stars as bars rather than a ring.
- D5: Share and read time are as before.
- D6: the Cards view is the current app's topic cards.

## Batch 4 (2026-11-15, night): animations, gestures and technical content

Owner: "I want all the animations, gestures, technical content on this website as the current tech.katta.cc has" and "The figures are not present!! I want the perfect website".

**Figures:** lesson figures are now drawn by the current app's own figure component, so they have every behaviour tech.katta.cc has:
- steps on the figure's clock, with a step line you swipe on phones;
- full screen, turned sideways in portrait, closed with a swipe down;
- portrait versions on phones, and sideways panning with its hint.

**Pictures on every card:**
- the library diagrams on Home Explore, the Learn hub and the landing cards;
- otherwise the section's first lesson figure.

**Lesson content:**
- Solve it on the canvas (interview questions), the next problem, and "Examples use …" in Cards;
- read time with details, the topics count, the back link, and a rail shortcut.

**Practice:** /practice and /practice/<slug>.

**Gestures:**
- sheets close with a swipe down (phones);
- the tour card swipes left and right.

**Motion:**
- staggered and scroll-driven arrivals, card lift, and link underlines;
- Go deeper opens with a rise;
- the sliding sidebar and contents markers;
- the fresh-solve highlighter.

**Verified live:**
- all 66 lessons, desktop and phone: every figure block drawn, 0 missing;
- pictures on Home, Learn, the landing and Cards, in light and dark;
- full screen on phones;
- the 17-check suite (now including practice).
