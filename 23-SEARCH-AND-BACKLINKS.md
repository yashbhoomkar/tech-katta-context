# 23 — Search: getting Tech Katta indexed and found

Written 2026-11-13 with PR #320 (merged as `846ee2d`, live the same day) (public article previews, crawlable pages, new link preview image).

## What the site now does (PR #320)

- **Public previews (owner: "Preview only", like fanout.sh).** Signed out, an article shows its opening
  (`frontend/src/preview.js`: about 300 words or 35 %, whichever is less) fading into a "Continue reading" sign-in card.
  Section lists open without sign-in. The rest of every article, Problems, Practice and the Lab still need sign-in.
- **Pages crawlers can read without JavaScript.** `frontend/seo.js` writes into each page's `<div id="root">`:
  - an article page: the same preview, its section list, related links and links to every section;
  - a section page: its article list;
  - the home page: every section and article.
- **Structured data (JSON-LD):** Organization, WebSite, BreadcrumbList, and TechArticle/Article with
  `isAccessibleForFree: false` and `hasPart.cssSelector: ".tk-locked"`. That is Google's markup for content behind a
  login, so a preview is not mistaken for cloaking.
- **Search titles**, e.g. "System Design Interview Questions, with Worked Answers | Tech Katta".
- **Meta and discovery files:** robots meta with `max-snippet:-1`, `<lastmod>` in the sitemap, `llms.txt`, and a
  `robots.txt` that names the search and AI crawlers and keeps `/analytics/` out.
- **Link preview image:** `og-2026-11.png`, made by `tools/og/shot.js`. Apps cache a preview image by its address,
  so after a redesign: make a new picture **with a new file name**, then update `index.html`,
  `dashboard/index.html` and `OG_IMAGE` in `seo.js`.

### Why the shared link showed the old design

`og.png` had not been regenerated since #270, before the Katta Paper look. Instagram and WhatsApp also cache
previews per address for days or weeks. The new file name makes them fetch it again for fresh shares. A chat that
already has the old preview keeps it.

## IndexNow (PR #321, live 2026-11-13)

- Key file: `https://tech.katta.cc/f07a54b9877482a11ce534d4d3cde740.txt` (`frontend/public/`), public by design.
- `tools/indexnow/submit.mjs` submits pages from the live sitemap: those changed in the last 3 days plus the
  undated home, dashboard and section pages; `--all` for every page; or specific URLs.
- `.github/workflows/indexnow.yml` runs on each push to main that touches `frontend/` or `content/`: it waits for
  Vercel, then submits. It can also be run by hand with "all".
- First full submission 2026-11-13: 76 URLs, HTTP 202 (accepted, key being verified).
- Reaches Bing, Yandex, Seznam, Naver and the others that use IndexNow; DuckDuckGo and ChatGPT search use Bing's
  index. **Google does not use IndexNow:** it reads the sitemap and Search Console.

## Steps only the owner can do (in this order)

1. **Google Search Console**
   - Go to https://search.google.com/search-console and add a **Domain property** for `katta.cc`. It verifies
     with a DNS TXT record in Cloudflare and covers `tech.katta.cc` too.
   - Sitemaps → submit `https://tech.katta.cc/sitemap.xml`.
   - URL inspection → "Request indexing" for the home page, `/dashboard/interview-questions/`,
     `/dashboard/concepts/` and five or six strong articles (about 10 requests a day are allowed).
2. **Bing Webmaster Tools** (also feeds DuckDuckGo, Yahoo and ChatGPT search): https://www.bing.com/webmasters →
   "Import from Google Search Console" → submit the same sitemap.
3. **Rich results test** for one article: https://search.google.com/test/rich-results.
4. **Check the link preview**
   - https://developers.facebook.com/tools/debug/ (Facebook, Instagram, WhatsApp): paste `https://tech.katta.cc/`,
     then "Scrape again".
   - https://www.linkedin.com/post-inspector/

## Backlinks (only the owner can make these: they need your accounts)

Good backlinks come from places where developers really read. Do not buy links or post the same text everywhere:
Google discounts that and it can hurt.

| Where | What to post |
|---|---|
| GitHub | Set the `tech-katta` repo's "Website" field to https://tech.katta.cc, and add the link to your GitHub profile README |
| LinkedIn | Profile → Featured + Website; one post per article series (with the new preview card) |
| Instagram / YouTube | The link in bio, and in every video description (the teaching videos) |
| dev.to, Hashnode, Medium | Republish 3–4 articles as a short version with "Full article with animated diagrams: <link>" and the **canonical URL set to tech.katta.cc** |
| Reddit r/systemdesign, r/developersIndia, r/cscareerquestionsIN | Answer questions with substance and link the matching article where it truly helps; no drive-by links |
| Hacker News "Show HN" | Once, for the judged design problems (the canvas + scoring is the unusual part) |
| Product Hunt, Peerlist, indiehackers | A launch post |
| Awesome lists on GitHub (e.g. awesome-system-design style lists) | Open a PR adding Tech Katta under "Learning resources" |
| Quora / Stack Overflow | Answers to system-design questions, linking where relevant |
| College / community groups (GDG, local meetups) | A talk or post; event pages link back |

## Realistic expectations

Ranking first for the bare query "system design" is unlikely in the near term: Wikipedia, GeeksforGeeks,
ByteByteGo and donnemartin/system-design-primer hold it with years of links. What can rank within weeks to months:
long, specific queries the articles answer, such as "design ticket booking system interview", "consistent hashing
interview", "dating app swipes system design" and "system design numbers to know 2026". Track these in Search
Console → Performance, and write the next articles toward queries that show impressions but few clicks.
