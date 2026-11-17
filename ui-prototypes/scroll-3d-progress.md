# scroll-3d prototype: progress (resume file for the scheduled run)

Branch `prototype` in /home/user/tech-katta, folder `frontend/prototypes/scroll-3d/` (first build committed and pushed at about 00:05 IST; check the Prototype workflow run).

Decision: the scene is one SVG drawn with an isometric projection in `scripts/scene.js` (not CSS 3D transforms):
crisp edges, upright readable labels, works on every browser. Camera = one CSS transform on `g.cam` per chapter.

- [x] index.html (6 chapters), styles/tokens.css, base.css, story.css, scene.css, scripts/scene.js, scripts/main.js
- [x] first browser look (desktop light/dark, Pixel 7 light): chapters 0-5 render, no page errors, no sideways scroll; text-side wash added, ch3 zoom and logs moved, lb label dropped, hero headline fits
- [ ] README.md in the folder
- [ ] full check under the real CSP (build:prototype:cloudflare + wrangler dev), desktop and Pixel 7, light and dark, reduced motion
- [ ] npm test, commit, push, live check
- [ ] ledger, TRIED.md, handover, report

Still to check closely: hero on desktop (scene starts under the buttons: fine?), chapter 1 and 5 screenshots, phone dark,
reduced motion, the theme switch, and the live site under the real CSP.
