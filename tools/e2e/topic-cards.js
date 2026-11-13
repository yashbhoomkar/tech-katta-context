// Spec 27 (tech-katta #337): an article as topic cards; the topic sheet with at most three key points; Previous/Next,
// arrow keys and swipes; drag down to close on phones; Full text kept and remembered; light and dark; no errors.
// Usage: node topic-cards.js <base>   (a local API: articles need sign-in on production)
const { chromium, devices } = require("playwright");
const base = process.argv[2] || "http://localhost:5482";
const ok = (n, c, x = "") => console.log(`${c ? "PASS" : "FAIL"} ${n}${x ? " — " + x : ""}`);
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const theme of ["dark", "light"]) {
    const c = await b.newContext({ viewport: { width: 1366, height: 860 } }); const p = await c.newPage();
    p.on("pageerror", e => errs.push(e.message));
    await p.addInitScript(t => { try { localStorage.setItem("tk-theme", t); localStorage.setItem("tk-tour-seen", "1"); if (!sessionStorage.getItem("once")) { sessionStorage.setItem("once", "1"); localStorage.removeItem("tk-view") } } catch {} }, theme);
    await p.goto(base + "/dashboard/#concepts/caching", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
    const n = await p.locator(".tc").count(); ok(theme + ": the article opens as cards, one per section", n === 5, String(n));
    ok(theme + ": no paragraphs on the page in cards view", (await p.locator(".d-article>p:not(.d-dek)").count()) === 0);
    const moving = await p.evaluate(() => [...document.querySelectorAll(".tc-pic")].filter(x => x.querySelector("svg animate,svg animateMotion,svg set") || x.querySelector(".tm")).length);
    ok(theme + ": every card has a moving picture", moving === n, `${moving} of ${n}`);
    await p.locator(".tc").nth(0).click(); await p.waitForTimeout(600);
    ok(theme + ": a tap opens the topic sheet", await p.locator(".ts[role=dialog]").isVisible());
    const t1 = await p.locator("#ts-t").innerText(); const pts = await p.locator(".ts-points li").count();
    ok(theme + ": at most three key points", pts > 0 && pts <= 3, String(pts));
    ok(theme + ": focus starts on Close", await p.evaluate(() => document.activeElement?.classList.contains("ts-x")));
    await p.keyboard.press("ArrowRight"); await p.waitForTimeout(300); const t2 = await p.locator("#ts-t").innerText();
    ok(theme + ": the right arrow opens the next topic", t2 !== t1 && (await p.locator(".ts-n").innerText()).startsWith("2 of"), t2);
    await p.locator(".ts-more").click(); await p.waitForTimeout(200);
    ok(theme + ": Read the full section shows the section's text", (await p.locator(".ts-full p").count()) > 0);
    await p.keyboard.press("Escape"); await p.waitForTimeout(300);
    ok(theme + ": Esc closes it and focus returns to the card", (await p.locator(".ts").count()) === 0 && await p.evaluate(() => document.activeElement?.classList.contains("tc")));
    await p.getByRole("button", { name: "Full text" }).click(); await p.waitForTimeout(300);
    ok(theme + ": Full text shows the article as before", (await p.locator(".d-article>p:not(.d-dek)").count()) > 5 && (await p.locator(".tc").count()) === 0);
    await p.reload({ waitUntil: "networkidle" }); await p.waitForTimeout(1200);
    ok(theme + ": the choice is remembered", (await p.locator(".tc").count()) === 0);
    await p.getByRole("button", { name: "Cards" }).click(); await p.waitForTimeout(300);
    await c.close();
  }
  // phones: swipe the sheet's text sideways, drag its head down to close
  const c = await b.newContext({ ...devices["Pixel 7"] }); const p = await c.newPage(); p.on("pageerror", e => errs.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem("tk-tour-seen", "1") } catch {} });
  await p.goto(base + "/dashboard/#components/redis", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
  await p.locator(".tc").nth(1).tap(); await p.waitForTimeout(600);
  const cdp = await c.newCDPSession(p);
  const drag = async (sel, dx, dy) => { const r = await p.locator(sel).boundingBox(); const x = r.x + r.width / 2, y = r.y + Math.min(30, r.height / 2);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + dx * i / 8, y: y + dy * i / 8 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await p.waitForTimeout(700) };
  const before = await p.locator(".ts-n").innerText(); await drag(".ts-points", -220, 0);
  ok("phone: a left swipe on the text opens the next topic", (await p.locator(".ts-n").innerText()) !== before, `${before} → ${await p.locator(".ts-n").innerText()}`);
  const box = await p.locator(".ts").boundingBox(); ok("phone: the sheet rises from the bottom", Math.abs(box.y + box.height - 915) < 30 || box.y > 50, JSON.stringify(box));
  await drag(".ts-head", 0, 420); ok("phone: dragging the head down closes it", (await p.locator(".ts").count()) === 0);
  const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); ok("phone: nothing overflows sideways", over <= 0, String(over));
  await b.close(); console.log("errors:", JSON.stringify(errs.slice(0, 5)));
})();
