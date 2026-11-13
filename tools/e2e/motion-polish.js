// Spec 24 UX4 (tech-katta #324): page and theme cross-fades (view transitions), none under reduced motion; the contents
// marker lines up with the current heading. 14 checks. Usage: node motion-polish.js <base>
const { chromium } = require("playwright");
const base = process.argv[2] || "https://tech.katta.cc";
const errors = [];const ok = (n, c, x = "") => console.log(`${c ? "PASS" : "FAIL"} ${n}${x ? " — " + x : ""}`);
const spy = () => { window.__vt = []; const o = document.startViewTransition?.bind(document); if (o) document.startViewTransition = cb => { window.__vt.push(document.documentElement.dataset.vt); return o(cb); }; };
(async () => {
  const b = await chromium.launch();
  for (const reduced of [false, true]) {
    const tag = reduced ? "reduced: " : "";
    const ctx = await b.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" });const page = await ctx.newPage();
    page.on("pageerror", e => errors.push(e.message));page.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await page.addInitScript(spy);
    await page.goto(base + "/dashboard/concepts/", { waitUntil: "networkidle" });
    await page.locator(".d-list a").first().click();await page.waitForSelector("#d-title");await page.waitForTimeout(500);
    const vt = await page.evaluate(() => window.__vt);
    ok(tag + "opening an article " + (reduced ? "does not fade" : "cross-fades"), reduced ? vt.length === 0 : vt.length === 1 && vt[0] === "page", JSON.stringify(vt));
    ok(tag + "the article is shown", (await page.locator("#d-title").textContent()).length > 3);
    ok(tag + "no data-vt left behind", await page.evaluate(() => !document.documentElement.dataset.vt));
    const theme0 = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.locator(".d-head").getByRole("button", { name: /dark|light|theme/i }).first().click();await page.waitForTimeout(500);
    const vt2 = await page.evaluate(() => window.__vt), theme1 = await page.evaluate(() => document.documentElement.dataset.theme);
    ok(tag + "theme switches" + (reduced ? "" : " with a fade"), theme1 !== theme0 && (reduced ? vt2.length === 0 : vt2[vt2.length - 1] === "theme"), `${theme0} → ${theme1}, ${JSON.stringify(vt2)}`);
    const figInk = await page.locator(".a-fig .fb").first().evaluate(e => getComputedStyle(e).fill).catch(() => "none");
    ok(tag + "figures redrawn in the new theme", figInk !== "none", figInk);
    // contents marker
    const hs = await page.locator(".d-rail ol a").count();
    if (hs > 2) {
      await page.locator(".d-rail ol a").nth(2).click();await page.waitForTimeout(900);
      const m = await page.evaluate(() => { const a = document.querySelector(".d-rail ol a.on"), k = document.querySelector(".rail-mark"); if (!a || !k) return null; const ra = a.getBoundingClientRect(), rk = k.getBoundingClientRect(); return { dy: Math.round(rk.top - ra.top), dh: Math.round(rk.height - ra.height), text: a.textContent.slice(0, 30) }; });
      ok(tag + "contents marker sits beside the current heading", m && Math.abs(m.dy) <= 1 && Math.abs(m.dh) <= 1, JSON.stringify(m));
      if (!reduced) await page.locator(".d-rail").screenshot({ path: "/tmp/shots/w3-rail.png" });
    } else ok(tag + "(article has no contents list)", true);
    await page.goBack();await page.waitForTimeout(600);
    ok(tag + "Back returns to the list", await page.locator(".d-list").count() === 1);
    await ctx.close();
  }
  await b.close();console.log("errors:", JSON.stringify(errors));
})();
