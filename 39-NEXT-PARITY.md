# /p/next parity with tech.katta.cc

**Owner, 2026-11-15:** "I want the prototype.katta.cc/p/next as good as tech.katta.cc UI. It should also call the real backend tech-api.katta.cc. I want all the animations, content, sign in, everything."

**Audit method:** a Playwright crawl of the live tech.katta.cc on 2026-11-15, covering the landing, `/dashboard/` and every section, a lesson, an Interview Question, Problems, the workspace, a challenge, Quick Notes, Privacy and Terms. Each page's headings, buttons and menus were listed and screenshotted, and the legacy code was read (`frontend/src`).

**Legend:** ✅ in /p/next · ⚠️ partly · ❌ missing.

## Platform

| # | Item on tech.katta.cc | /p/next | Notes |
|---|---|---|---|
| P1 | Content from tech-api.katta.cc (site, articles, lab, stats, events) | ✅ | |
| P2 | Google sign-in, session, sync of progress, designs and stars | ⚠️ | Google client allows prototype.katta.cc (checked: button renders, no origin error). The API only trusts tech.katta.cc until **PR #368** merges and deploys. |
| P3 | Sign-in locks: section pages and lesson previews locked when signed out (`account.pageLock`, `previewLock`); LabLock "Sign in to play" on the landing lab | ❌ | |
| P4 | Account menu: avatar, sync status, Sign out, Sign out on all devices, Delete my account, Privacy | ⚠️ | Only sign in/out on You. |
| P5 | Privacy and Terms pages (`site.privacy`, `site.terms`), linked in the sidebar and sign-in dialog | ❌ | |
| P6 | Tour button on every dashboard page (`site.tour`) | ⚠️ | Only Home has a tour. |
| P7 | Analytics: page views and reading | ✅ | |

## Landing

| # | Item | /p/next | Notes |
|---|---|---|---|
| L1 | Hero: chip, title, lead, CTAs | ✅ | |
| L2 | Hero animated figure (Kafka producer, broker, consumer group) with the judge card floating beside it | ❌ | |
| L3 | Stats: problems with tests, challenge stars, visual notes, 3.5 cr, counting up | ⚠️ | Counts differ. |
| L4 | "Practise system design the way interviews test it": Interview Questions preview and Problems, judged (`site.inside`) | ⚠️ | Has a different "look inside". |
| L5 | "Can your design survive IND vs PAK?": the landing lab (`site.landingLab`), a real canvas with Sign in to play | ❌ | |
| L6 | Footer: brand, descriptor, links, last updated | ⚠️ | |

## Dashboard

| # | Item | /p/next | Notes |
|---|---|---|---|
| D1 | Sidebar: sections, and the active section's lessons listed under it; Privacy, Terms, Back to site; fold | ⚠️ | No lesson list, no policy links. |
| D2 | Home: greeting, Continue reading with the lesson's figure thumbnail and progress; problems solved ring; challenge stars; Explore cards with figure thumbnails; Up next | ⚠️ | No thumbnails, ring or stars. |
| D3 | Section pages: groups with lesson cards and figure thumbnails | ⚠️ | No thumbnails. |
| D4 | Interview Questions section: difficulty filter (All, Easy, Medium, Hard) and the guides group | ⚠️ | |
| D5 | Lesson: ▶ Listen (read aloud, recorded or device voice, speed); Share; "Examples use Zotato"; topic count, read time, "with details" | ⚠️ | No Listen. |
| D6 | Lesson Cards view: a grid of topic cards with a picture each and "Open", opening a sheet (TopicCards and TopicSheet) | ⚠️ | /p/next has a one-at-a-time deck instead. |
| D7 | Problems: Your plan (problem of the day, next in plan, weekly order); filters All, Not done yet, ★ Bookmarked, ⚄ Pick one, difficulty; table with accepted %; Sandbox; Challenges | ⚠️ | No plan, bookmarks, accepted % or sandbox. |
| D8 | Workspace (`solve.jsx`), challenges (Lab), practice pages | ✅ | Imported as they are. |
| D9 | Quick Notes: the notes list (draft and planned) and "The numbers behind a design" figure | ❌ | Shown as "soon". |
| D10 | Real systems section | ✅ | |
| D11 | Theme toggle | ✅ | |

## Plan

1. **Platform:** P3 locks, P4 account menu, P5 policy pages, P6 tour on every page.
2. **Dashboard:** D1 sidebar lessons and links, D9 Quick Notes, D5 Listen, D6 topic cards, D2 and D3 thumbnails, D7 plan, bookmarks and accepted %.
3. **Landing:** L2, L5, then L3, L4 and L6.

Where tech.katta.cc's code is the product (read aloud, topic sheet, plan, landing lab, numbers figure, account menu), it is imported from `frontend/src` like the figures and the workspace, and styled into the new design.

Every item is checked live, in light and dark, on desktop and phone, before it is marked ✅ here.
