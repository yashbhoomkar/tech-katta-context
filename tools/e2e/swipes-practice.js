// Spec 24 UX3 (tech-katta #323): Practice panes on a phone follow a sideways swipe; scroll kept per pane; steppers and
// the last pane never swipe. 29 checks. Usage: node swipes-practice.js <base>
const { chromium, devices } = require("playwright");
const base = process.argv[2] || "https://tech.katta.cc";
const errors = [];const ok = (n, c, x = "") => console.log(`${c ? "PASS" : "FAIL"} ${n}${x ? " — " + x : ""}`);
async function drag(page, cdp, x0, y0, x1, y1, steps = 12) {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= steps; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + (x1 - x0) * i / steps, y: y0 + (y1 - y0) * i / steps }] }); await page.waitForTimeout(16); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });await page.waitForTimeout(450);
}
(async () => {
  const b = await chromium.launch();
  for (const reduced of [false, true]) {
    const ctx = await b.newContext({ ...devices["Pixel 7"], reducedMotion: reduced ? "reduce" : "no-preference" });const page = await ctx.newPage();const cdp = await ctx.newCDPSession(page);
    page.on("pageerror", e => errors.push(e.message));const tag = reduced ? "reduced: " : "";
    await page.goto(base + "/dashboard/#practice/url-shortener", { waitUntil: "networkidle" });await page.waitForSelector(".pr-phone-tabs");
    const tab = () => page.locator(".pr-phone-tabs .on").textContent();
    ok(tag + "starts on Design", (await tab()) === "Design", await tab());
    const y = 420;
    await drag(page, cdp, 330, y, 120, y + 6);ok(tag + "swipe left → Result", (await tab()) === "Result", await tab());
    await drag(page, cdp, 330, y, 100, y);ok(tag + "swipe left on the last pane stays", (await tab()) === "Result", await tab());
    const tr = await page.locator(".pr-phone-body").evaluate(e => e.style.transform);ok(tag + "pane settled back", !tr || tr === "", tr);
    await drag(page, cdp, 80, y, 300, y);ok(tag + "swipe right → Design", (await tab()) === "Design", await tab());
    await drag(page, cdp, 80, y, 300, y);ok(tag + "swipe right → Problem", (await tab()) === "Problem", await tab());
    await drag(page, cdp, 200, y, 170, y, 3);ok(tag + "short swipe stays", (await tab()) === "Problem");
    // scroll position per pane
    await page.evaluate(() => scrollTo(0, 600));await page.waitForTimeout(200);const sy = await page.evaluate(() => scrollY);
    await page.locator(".pr-phone-tabs button", { hasText: "Design" }).tap();await page.waitForTimeout(300);
    const dy = await page.evaluate(() => scrollY);
    await page.locator(".pr-phone-tabs button", { hasText: "Problem" }).tap();await page.waitForTimeout(300);
    ok(tag + "Problem keeps its scroll position", Math.abs(await page.evaluate(() => scrollY) - sy) < 4, `${sy} → (Design ${dy}) → ${await page.evaluate(() => scrollY)}`);
    // vertical swipe on the problem text scrolls, no tab change
    const s0 = await page.evaluate(() => scrollY);await drag(page, cdp, 200, 600, 210, 300, 10);
    ok(tag + "vertical swipe scrolls, same tab", (await tab()) === "Problem" && (await page.evaluate(() => scrollY)) !== s0);
    // a sideways pan on a table that can scroll does not change tab
    const tw = page.locator(".pr-phone-body .pr-table-w").first();
    if (await tw.count()) { const can = await tw.evaluate(e => e.scrollWidth > e.clientWidth + 1);
      if (can) { await tw.scrollIntoViewIfNeeded();const bb = await tw.boundingBox();await drag(page, cdp, bb.x + bb.width * .8, bb.y + bb.height / 2, bb.x + bb.width * .2, bb.y + bb.height / 2);
        ok(tag + "sideways pan on a wide table keeps the tab", (await tab()) === "Problem", "scrollLeft " + await tw.evaluate(e => e.scrollLeft)); } else ok(tag + "(no wide table on this problem at 412 px)", true); }
    // stepper drag never swipes
    await page.locator(".pr-phone-tabs button", { hasText: "Design" }).tap();await page.waitForTimeout(300);
    const st = page.locator(".pb-step").first();
    if (await st.count()) { await st.scrollIntoViewIfNeeded();const bb = await st.boundingBox();await drag(page, cdp, bb.x + bb.width / 2, bb.y + bb.height / 2, bb.x - 150, bb.y + bb.height / 2);
      ok(tag + "a drag starting on a stepper doesn't change tab", (await tab()) === "Design", await tab()); }
    // keyboard on tabs
    await page.locator(".pr-phone-tabs .on").focus();await page.keyboard.press("ArrowRight");await page.waitForTimeout(200);
    ok(tag + "→ on the tabs moves to Result", (await tab()) === "Result" && await page.evaluate(() => document.activeElement?.textContent) === "Result");
    const ind = await page.locator(".pr-phone-ind").boundingBox(), on = await page.locator(".pr-phone-tabs .on").boundingBox();
    ok(tag + "tab line under the current tab", Math.abs(ind.x - on.x) < 2, `${ind.x} vs ${on.x}`);
    ok(tag + "no sideways page scroll", await page.evaluate(() => document.documentElement.scrollWidth) <= 412);
    if (!reduced) await page.screenshot({ path: "/tmp/shots/w2-phone.png" });
    await ctx.close();
  }
  // desktop unchanged: no pager
  const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } });const page = await ctx.newPage();page.on("pageerror", e => errors.push(e.message));
  await page.goto(base + "/dashboard/#practice/url-shortener", { waitUntil: "networkidle" });await page.waitForTimeout(500);
  ok("desktop: split view, no phone tabs", await page.locator(".pr-split").count() === 1 && await page.locator(".pr-phone-tabs").count() === 0);
  await b.close();console.log("errors:", JSON.stringify(errors));
})();
