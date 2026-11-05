// Browser chaos experiments. Faults are injected inside the test browser only (Playwright request
// interception), so this is safe to run against production: real visitors are never affected.
//   node frontend.js [site]      (default https://tech.katta.cc)
// API down · API slow past the timeout · one article erroring · offline in the Lab · storage blocked
// (private mode) · Google's script blocked · a stale chunk after a deploy. Each checks what the visitor
// sees: a clear message and a way out, never a blank page, an endless spinner or a crash.
const { chromium } = require('playwright');
const B = process.argv[2] || 'https://tech.katta.cc';
const results = [];
const note = (exp, what, value, ok) => { results.push({ ok }); console.log(`${ok ? 'ok  ' : 'FAIL'} ${exp} · ${what}: ${value}`); };
const json = (body) => ({ contentType: 'application/json', body: JSON.stringify(body), headers: { 'access-control-allow-origin': B, 'access-control-allow-credentials': 'true' } });
const signInOff = (ctx) => ctx.route('**/v1/auth/config', (r) => r.fulfill(json({ enabled: false })));

(async () => {
  const br = await chromium.launch();
  const page = async (setup, vp = { width: 390, height: 844 }) => { const ctx = await br.newContext({ viewport: vp }); const errs = []; if (setup) await setup(ctx); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); return { ctx, p, errs }; };
  const text = (p) => p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 140));

  // 1. the API is down: every request to it fails
  { let down = true;
    const { ctx, p, errs } = await page(async (c) => { await c.route('**/tech-api.katta.cc/**', (r) => (down ? r.abort('connectionrefused') : r.continue())); });
    await p.goto(B + '/dashboard/'); await p.waitForTimeout(12_000);
    const t = await text(p), retry = await p.locator('button:has-text("Try again")').count();
    note('1 API down', 'dashboard explains and offers a retry', `${JSON.stringify(t.slice(0, 80))} · retry button: ${retry}`, retry === 1 && !/^Loading/.test(t));
    down = false; await p.click('button:has-text("Try again")'); await p.waitForSelector('.d-start .cards, .lock-page, main h1', { timeout: 20_000 }).catch(() => {});
    note('1 API back', 'Try again loads the page', (await p.locator('.d-start .cards').count()) ? 'loaded' : 'not loaded', (await p.locator('.d-start .cards').count()) === 1);
    note('1 API down', 'no crash', JSON.stringify(errs), errs.length === 0); await ctx.close(); }

  // 2. the API answers too slowly (12 s, past the 8 s timeout and one retry)
  { const { ctx, p } = await page(async (c) => { await c.route('**/v1/site', async (r) => { await new Promise((res) => setTimeout(res, 12_000)); r.continue().catch(() => {}); }); });
    const t0 = Date.now(); await p.goto(B + '/'); await p.waitForSelector('button:has-text("Try again")', { timeout: 40_000 }).catch(() => {});
    const has = await p.locator('button:has-text("Try again")').count();
    note('2 API slow (12 s)', 'gives up with a retry instead of spinning', has ? `after ${Math.round((Date.now() - t0) / 1000)} s` : 'still loading after 40 s', has === 1); await ctx.close(); }

  // 3. one article fails (500) while the rest of the site works
  { const { ctx, p } = await page(async (c) => { await signInOff(c); await c.route('**/v1/articles/sharding', (r) => r.fulfill({ status: 500, body: '{}' })); });
    await p.goto(B + '/dashboard/#components/sharding'); await p.waitForTimeout(12_000);
    const retry = await p.locator('button:has-text("Try again")').count(), side = await p.locator('.side-link').count();
    note('3 one article errors', 'error with retry, navigation still works', `retry: ${retry} · sidebar links: ${side}`, retry === 1 && side > 3); await ctx.close(); }

  // 4. offline in the Lab: keep designing, nothing lost
  { const { ctx, p, errs } = await page(signInOff, { width: 1440, height: 900 });
    await p.goto(B + '/dashboard/#lab'); await p.waitForSelector('.lab-name');
    await ctx.setOffline(true);
    const before = await p.locator('.react-flow__node').count();
    await p.locator('.lab-item:has-text("Cache")').evaluate((b) => b.click()); await p.waitForTimeout(800);
    const after = await p.locator('.react-flow__node').count();
    const saved = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('tk-lab-v1') || '{}'); return Object.values(s.designs || {}).reduce((n, d) => n + d.nodes.length, 0); });
    note('4 offline in the Lab', 'adding a component still works and is saved in the browser', `${before} → ${after} components, ${saved} saved`, after === before + 1 && saved >= after);
    note('4 offline in the Lab', 'no crash', JSON.stringify(errs), errs.length === 0);
    await ctx.setOffline(false); await ctx.close(); }

  // 5. storage blocked (some private modes): every localStorage call throws
  { const { ctx, p, errs } = await page(async (c) => { await signInOff(c); await c.addInitScript(() => { const deny = () => { throw new DOMException('blocked', 'SecurityError'); }; Object.defineProperty(window, 'localStorage', { get: deny }); Object.defineProperty(window, 'sessionStorage', { get: deny }); }); }, { width: 1440, height: 900 });
    await p.goto(B + '/'); await p.waitForSelector('.hero h1', { timeout: 20_000 }).catch(() => {});
    const landing = await p.locator('.hero h1').count();
    await p.goto(B + '/dashboard/#lab'); await p.waitForSelector('.lab-name', { timeout: 20_000 }).catch(() => {});
    const lab = await p.locator('.lab-name').count();
    note('5 storage blocked', 'landing and Lab still work', `landing: ${landing} · Lab: ${lab}`, landing === 1 && lab === 1);
    note('5 storage blocked', 'no crash', JSON.stringify(errs.slice(0, 2)), errs.length === 0); await ctx.close(); }

  // 6. Google's sign-in script blocked (ad blocker, strict privacy settings)
  { const { ctx, p } = await page(async (c) => { await c.route('https://accounts.google.com/**', (r) => r.abort('blockedbyclient')); });
    await p.goto(B + '/#ind-vs-pak'); await p.waitForSelector('.lock-card', { timeout: 20_000 }).catch(() => {}); await p.waitForTimeout(3000);
    const msg = await p.locator('.lock-card .acct-err').innerText().catch(() => '');
    note('6 Google script blocked', 'the lock card says why sign-in is missing', JSON.stringify(msg.slice(0, 90)), /blocked/i.test(msg)); await ctx.close(); }

  // 7. a stale tab after a deploy: the Lab's chunk is gone (404)
  { const { ctx, p } = await page(async (c) => { await signInOff(c); await c.route(/\/assets\/Lab-[^/]+\.js$/, (r) => r.fulfill({ status: 404, body: 'gone' })); }, { width: 1440, height: 900 });
    let loads = 0; p.on('load', () => { loads += 1; });
    await p.goto(B + '/dashboard/#lab'); await p.waitForTimeout(10_000);
    const t = await text(p);
    note('7 stale chunk after a deploy', 'reloads once, then shows an error (no reload loop)', `${loads} page loads · ${JSON.stringify(t.slice(0, 60))}`, loads === 2); await ctx.close(); }

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  await br.close(); process.exit(failed ? 1 : 0);
})();
