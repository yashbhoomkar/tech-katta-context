# 37 · UI/UX review fixes (PR #365)

Date: 2026-11-15 (IST; the scheduled run the owner asked for, 01:29 IST). App PR: **yashbhoomkar/tech-katta#365**
(draft, branch `ccr-b42a0cbb-y2io0r`). The light-theme colours, the reviewer's ninth point, are a separate run
(06:20 IST) and are not in this PR.

The owner passed on a UI/UX reviewer's points. Below: each point, what was decided, and what changed.

## 1. Say what the site is, for someone outside tech

**Point:** the landing page should explain the site so that someone from a non-tech background understands it and
can refer friends who are in tech.

**Change:** an "In plain words" section right after the hero (`content/site.json` `plain`, `Plain` in
`frontend/src/main.jsx`, styles in `styles.css`). It covers:
- what system design is, through a food app at dinner time and a cricket stream;
- what you do on the site: read, practise, and a judge sends traffic through your design;
- that it's free with sign-in;
- who it is for;
- a **Share Tech Katta** button (the system share sheet, or it copies the address).

A "New here? What this site is, in plain words ↓" link under the hero buttons jumps to it (`#what`), because on
phones the hero figure pushes the section a long way down.

## 2. Read aloud

**Point:** it only read the title; do we need it, given the owner's own teaching videos are coming?

**Decided by this session:** removed. Reasons:
- no article ever had a recording;
- the browser voice was unreliable;
- the videos will do the job better.

**Removed:**
- the player: `dashboard/reader.jsx` and `reader.css`;
- `speech.js` and `tools/tts`;
- the article tour's "Listen instead" step, and "Listen" and "read-aloud" in the copy and in `seo.js`;
- `say` on code blocks: the validator no longer asks for it, and the 64 in content were removed;
- `audio` in article summaries.

**Changed alongside:**
- Read times now count the text itself; code counts by its label.
- The small button styles that Share and the figure buttons use moved to `dashboard/buttons.css`.
- `HOSTING.md` step 6 now says to test the videos in Safari when they come.
- The CSP's `media-src` was left as it was.

## 3. Back to top

**Change:** `frontend/src/theme/ToTop.jsx` and `totop.css`, on the landing page and every dashboard page except
the canvas (problem workspace, challenge, practice). It appears after about 1.2 screens of scrolling, sits bottom
right (48 px; 44 px on phones), respects the safe area, and scrolls smoothly (instantly under reduced motion). It
then moves focus to `main`. Label: `site.json` `backToTop`.

## 4. Grammar, capitalisation, keywords

**Scanned:** every article and `site.json`, by script and by reading all of the site copy, for:
- product and acronym casing;
- its / it's and then / than;
- doubled words and punctuation;
- sentences starting in lowercase;
- heading case.

**Found:** headings are sentence case throughout (868 of 869), product names are cased correctly, and the prose had
very few slips.

**Fixed:**
- **"Real systems" → "Real Systems",** so all tab names are title case.
- **The consent sentence was in capitals.** In an article's sign-in card, the consent sentence showed in mono
  capitals: `.d-panel label` (the article's eyebrow style) reached its `<label>`. Fixed in `account.css`.
- **Counts after the re-grade (point 7):**
  - the Questions guide now has Easy, Medium and Hard tables, and IND vs PAK joins Hard;
  - its study plan and How to prepare now say "seven easy";
  - the Problems tour no longer says "four Easy problems".
- **Keys as code:** cache and channel keys in Caching and Real-time updates are now in code spans.

**Open — "capitalise the keywords":** if the reviewer meant something else, such as bold or capitalised key terms
in the prose, the owner should say so; the site's style is sentence case.

## 5. Cards mode bypassed the sign-in gate

**Point:** signed out, Full text shows the opening and then the sign-in box, but Cards seemed to give the whole
article.

**Found:** Cards did use the preview body. But it listed only the preview's topics, with nothing to show that more
existed, and those cards opened like full topics.

**Change:**
- Signed out, Cards lists **every** topic of the article.
- Topics inside the preview open as before.
- A topic cut short by the preview says so at the end of its sheet: "The rest of this topic is free once you sign
  in", with a link.
- The other topics are **locked cards**: a blurred picture, a lock and "Sign in to read". A tap scrolls to the
  sign-in card, focuses its consent box and pulses the card once.
- It uses the same cut as Full text (`preview.js`), computed in `dashboard/article.jsx`. The strings are
  `account.previewLock.card` and `.rest`.

**Known, not changed:** `/v1/articles/<slug>` returns the full body to anyone. The preview is enforced only in the
frontend, as since #320. Locking it server-side is in 18-TODO.

## 6. Problems with no stars

**Found:** five questions had no linked challenge, so their Challenge cell was blank: ticket booking, photo
sharing, leaderboard, video streaming and IND vs PAK. The link comes from the article's first `lab` block pointing
at `problems/challenge/<id>` (`backend/src/content/store.js` `labOf`).

**Change:** each now has a challenge card placed before its existing card to IND vs PAK.

| Question | Challenge | Why |
|---|---|---|
| ticket booking | flash-sale | the sale is a known spike |
| photo sharing | read-heavy | photos are read far more than posted |
| leaderboard | cache-restart | the board lives in a cache |
| video streaming | cache-restart | a cold CDN sends every request to the origin |
| IND vs PAK | flash-sale | the toss is a spike you can see coming |

## 7. Difficulty balance

**Before:** Easy 4, Medium 17, Hard 1. **After:** Easy 7, Medium 7, Hard 8. Only `group` and `tag` changed;
numbers, URLs and order are unchanged, so the list is now mixed, as on LeetCode.

| # | Question | Before | After |
|---|---|---|---|
| 01 | URL shortener | Easy | Easy |
| 02 | File storage and sync | Easy | Easy |
| 03 | Restaurants near me | Easy | Easy |
| 04 | 10-minute grocery delivery | Easy | Easy |
| 05 | Match ticket booking | Medium | **Hard** (50 lakh people for 1 lakh seats, no seat sold twice, fairness) |
| 06 | Photo sharing | Medium | **Easy** (blob storage, CDN, a cache) |
| 07 | News feed | Medium | Medium |
| 08 | Dating swipes | Medium | Medium |
| 09 | Coding judge | Medium | Medium |
| 10 | Chat app | Medium | Medium |
| 11 | Notifications | Medium | **Easy** (a queue per channel, retries) |
| 12 | Payments | Medium | **Hard** (money, exactly once, unknown outcomes) |
| 13 | Job scheduler | Medium | Medium |
| 14 | Web crawler | Medium | **Hard** (100 crore pages, politeness, dedupe) |
| 15 | Leaderboard | Medium | **Easy** (a sorted set) |
| 16 | Ad click counting | Medium | **Hard** (billing-grade counts, streams) |
| 17 | Distributed key-value store | Medium | **Hard** (replication, consistency, rebalancing) |
| 18 | Shared document editor | Medium | **Hard** (concurrent edits, OT/CRDT) |
| 19 | Rider assignment | Medium | **Hard** (real-time matching at 3 lakh riders) |
| 20 | Video streaming | Medium | Medium |
| 21 | Menu search | Medium | Medium |
| 22 | IND vs PAK | Hard | Hard |

**Decision left to the owner:** renumber so that Easy comes first. That would change the `no` labels the site and
tests refer to.

## 8. The logo didn't look clickable

**Change:** in `theme/premium.css`, the logo sits in a bordered pill on the landing header, the sidebar and the phone
header. It has a surface, a soft shadow, a lift and an ink border on hover, a press, and a focus ring. Tooltips:
"Tech Katta home" in the dashboard and "Back to the top" on the landing page, whose logo scrolls to its top.

## Checks (2026-11-15)

- **Frontend tests:** 393/393 (before: 393). **Backend tests:** 114/114.
- **Content check:** OK, 66 articles. **Build:** passed.
- **Browser tested** in Chromium against a local build and API, with sign-in faked as on and the visitor signed out,
  at 1440 px and on a Pixel 7:
  - Cards gate on Scaling writes: 3 open topics and 3 locked; a locked card focuses the consent box; the cut topic's
    note shows.
  - The plain-words section and the hero link.
  - Back to top: visible at the bottom, returns to `scrollY` 0.
  - The logo pill on all three headers.
  - Problems: 22 rows, every one with stars; the 7/7/8 split.
- **Not checked:** Safari, Firefox, a real phone, production (not merged).

## Ledger

Recorded 2026-11-15 for the branch commits:

- `frontend_git_commits`: `d1e841e`, `fe4199e`, `b101628`, `5b6d0bd`.
- `backend_git_commits`: `d1e841e`, `3de2df7`, `fe4199e`, `b101628`, `5b6d0bd`.

The full SHAs are in `17-SESSION-HANDOVER.md`. The squash commit's rows go in after the merge.

## Rollback

Revert the squash commit of #365. To bring back read aloud alone, revert `d1e841e`.
