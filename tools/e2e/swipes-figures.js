// Spec 24 UX1+UX2 (tech-katta #323): figure step controls and step-line swipe, drawer drag-to-close, full-screen
// swipe down, edge exclusion, reduced motion. 25 checks. Usage: node swipes-figures.js <base>
const { chromium, devices } = require("playwright");
const base = process.argv[2] || "https://tech.katta.cc"; // articles need sign-in on production: run against a local API + preview
const art = "/dashboard/concepts/database-indexing/";
const out = [];const errors = [];const ok = (name, cond, extra = "") => console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
async function touchDrag(page, cdp, x0, y0, x1, y1, steps = 12, ms = 16) {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= steps; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + (x1 - x0) * i / steps, y: y0 + (y1 - y0) * i / steps }] }); await page.waitForTimeout(ms); }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
(async () => {
  const b = await chromium.launch();
  // desktop: controls exist on a Caps figure, step through, pause holds
  {
    const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } });const page = await ctx.newPage();
    page.on("pageerror", e => errors.push("desktop: " + e.message));
    await page.goto(base + art, { waitUntil: "networkidle" });
    const fig = page.locator(".a-fig").filter({ has: page.locator(".a-fig-ctl") }).first();
    await fig.scrollIntoViewIfNeeded();await page.waitForTimeout(800);
    const nctl = await page.locator(".a-fig-ctl").count(), nfig = await page.locator(".a-fig").count();
    ok("desktop: step controls on Caps figures", nctl > 0, `${nctl} of ${nfig} figures`);
    const label = () => fig.locator(".a-fig-n").textContent();
    await fig.getByRole("button", { name: "Pause the figure" }).click();
    const t1 = await fig.locator(".a-fig-body svg").evaluate(s => s.getCurrentTime());await page.waitForTimeout(700);
    const t2 = await fig.locator(".a-fig-body svg").evaluate(s => s.getCurrentTime());
    ok("desktop: pause stops the clock", Math.abs(t2 - t1) < 0.01, `${t1.toFixed(2)} → ${t2.toFixed(2)}`);
    await fig.getByRole("button", { name: "Previous step" }).click({ trial: false }).catch(() => {});
    // go to step 1 explicitly via keyboard Home-like presses
    for (let i = 0; i < 6; i++) if (await fig.getByRole("button", { name: "Previous step" }).isEnabled()) await fig.getByRole("button", { name: "Previous step" }).click();
    ok("desktop: back to step 1", /Step 1 of/.test(await label()), await label());
    await fig.getByRole("button", { name: "Next step" }).click();
    ok("desktop: next → step 2", /Step 2 of/.test(await label()), await label());
    const live = await fig.locator(".sr-only").textContent();ok("desktop: live text while stepping", /Step 2 of \d+: \S/.test(live), live.slice(0, 60));
    await fig.locator(".a-fig-ctl").focus().catch(() => {});await fig.getByRole("button", { name: "Next step" }).focus();await page.keyboard.press("ArrowRight");
    ok("desktop: → key steps", /Step 3 of/.test(await label()), await label());
    // scroll away and back: stays held
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));await page.waitForTimeout(500);await fig.scrollIntoViewIfNeeded();await page.waitForTimeout(800);
    ok("desktop: a paused figure stays paused after scrolling away", /Step 3 of/.test(await label()) && await fig.locator(".a-fig-body svg").evaluate(s => s.animationsPaused()));
    await fig.getByRole("button", { name: "Play the figure" }).click();await page.waitForTimeout(400);
    ok("desktop: play resumes", !(await fig.locator(".a-fig-body svg").evaluate(s => s.animationsPaused())));
    await page.screenshot({ path: "/tmp/shots/w1-desktop.png", clip: await fig.boundingBox() });
    await ctx.close();
  }
  // phone
  {
    const ctx = await b.newContext({ ...devices["Pixel 7"] });const page = await ctx.newPage();const cdp = await ctx.newCDPSession(page);
    page.on("pageerror", e => errors.push("phone: " + e.message));
    await page.goto(base + art, { waitUntil: "networkidle" });
    const fig = page.locator(".a-fig").filter({ has: page.locator(".a-fig-ctl") }).first();
    await fig.scrollIntoViewIfNeeded();await page.waitForTimeout(600);
    const label = () => fig.locator(".a-fig-n").textContent();
    // put it on step 2 by tapping next after holding at step 1
    await fig.getByRole("button", { name: "Pause the figure" }).tap();
    for (let i = 0; i < 6; i++) if (await fig.getByRole("button", { name: "Previous step" }).isEnabled()) await fig.getByRole("button", { name: "Previous step" }).tap();
    const before = await label();const st = await fig.locator(".a-fig-step").boundingBox();
    await touchDrag(page, cdp, st.x + st.width * .75, st.y + st.height / 2, st.x + st.width * .2, st.y + st.height / 2);
    await page.waitForTimeout(400);
    ok("phone: swipe the step line left → next step", /Step 2 of/.test(await label()), `${before} → ${await label()}`);
    await touchDrag(page, cdp, st.x + st.width * .2, st.y + st.height / 2, st.x + st.width * .8, st.y + st.height / 2);await page.waitForTimeout(400);
    ok("phone: swipe right → previous step", /Step 1 of/.test(await label()), await label());
    await touchDrag(page, cdp, st.x + st.width * .5, st.y + st.height / 2, st.x + st.width * .45, st.y + st.height / 2, 3);await page.waitForTimeout(400);
    ok("phone: a short swipe does nothing", /Step 1 of/.test(await label()), await label());
    const y0 = await page.evaluate(() => scrollY);
    await touchDrag(page, cdp, st.x + st.width * .5, st.y + 4, st.x + st.width * .55, st.y - 200, 10);await page.waitForTimeout(600);
    ok("phone: a vertical swipe on the step line scrolls, no step change", /Step 1 of/.test(await label()), `scrollY ${y0} → ${await page.evaluate(() => scrollY)}`);
    const bb = await fig.locator(".a-fig-ctl").boundingBox();ok("phone: controls fit the screen", bb.x >= 0 && bb.x + bb.width <= 413, JSON.stringify(bb));
    const tgt = await fig.locator(".a-fig-b").first().boundingBox();ok("phone: 44 px buttons", tgt.width >= 44 && tgt.height >= 44);
    await fig.screenshot({ path: "/tmp/shots/w1-phone-fig.png" });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);ok("phone: no sideways page scroll", sw <= 412, String(sw));
    // full screen: swipe down closes, a short one does not
    await fig.locator(".fs-btn").tap();await page.waitForSelector(".fs");await page.waitForTimeout(300);
    await touchDrag(page, cdp, 200, 400, 200, 440, 4);await page.waitForTimeout(500);
    ok("phone: full screen, short drag down returns", await page.locator(".fs").count() === 1 && await page.locator(".fs").evaluate(e => e.style.transform === "" || e.style.transform === "translateY(0px)" || !e.style.transform));
    await touchDrag(page, cdp, 200, 300, 200, 700, 12);await page.waitForTimeout(600);
    ok("phone: full screen, swipe down closes", await page.locator(".fs").count() === 0);
    // drawer: open, drag left closes; short drag returns; edge start ignored
    await page.evaluate(() => scrollTo(0, 0));await page.getByRole("button", { name: "Open menu" }).tap();await page.waitForTimeout(400);
    await touchDrag(page, cdp, 200, 400, 170, 402, 4, 40);await page.waitForTimeout(500);
    const t = await page.locator(".side").evaluate(e => getComputedStyle(e).transform);
    ok("drawer: a short slow drag returns", await page.locator(".dash.open").count() === 1 && (t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)"), t);
    await touchDrag(page, cdp, 230, 400, 60, 405, 10);await page.waitForTimeout(600);
    ok("drawer: drag left closes it", await page.locator(".dash.open").count() === 0);
    ok("drawer: focus back on the menu button", await page.evaluate(() => document.activeElement?.getAttribute("aria-label")) === "Open menu");
    await page.getByRole("button", { name: "Open menu" }).tap();await page.waitForTimeout(400);
    await touchDrag(page, cdp, 10, 400, 250, 400, 10);await page.waitForTimeout(400);
    ok("drawer: a drag from the screen edge is ignored", await page.locator(".dash.open").count() === 1);
    await touchDrag(page, cdp, 200, 600, 205, 300, 10);await page.waitForTimeout(400);
    ok("drawer: vertical drag keeps it open", await page.locator(".dash.open").count() === 1);
    await ctx.close();
  }
  // reduced motion: no controls, still figures, phone step line still shows the caption
  {
    const ctx = await b.newContext({ ...devices["Pixel 7"], reducedMotion: "reduce" });const page = await ctx.newPage();
    page.on("pageerror", e => errors.push("reduced: " + e.message));
    await page.goto(base + art, { waitUntil: "networkidle" });await page.waitForTimeout(800);
    ok("reduced: no step controls", await page.locator(".a-fig-ctl").count() === 0);
    const lines = await page.locator(".a-fig-step").count(), figs = await page.locator(".a-fig").count();
    ok("reduced: phone step line shows a caption", lines > 0, `${lines} of ${figs}`);
    ok("reduced: figures drawn", await page.locator(".a-fig-err").count() === 0);
    await ctx.close();
  }
  await b.close();
  console.log(out.join("\n"));console.log("errors:", JSON.stringify(errors));
})();
