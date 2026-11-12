// The guided tours (site.json `tour`, frontend/src/tour.jsx): the dashboard tour (ends on "Start with Networking
// essentials", which opens it), each section's own tour and the Problems list tour (each ends on a link, since
// tech-katta #313), the problem workspace tour (the settings step selects a part first), the
// Lab tour, no tour by itself on a first visit (only from the Tour button), and a phone.
// Screenshots of every step go to /tmp/shots/tour-*.png. Usage: node tour.js <site>
const { chromium: raw, devices } = require('playwright');
const chromium = require('./open-site.js')(raw);
const fs = require('fs');
const B = process.argv[2] || 'https://tech.katta.cc', O = '/tmp/shots/'; fs.mkdirSync(O, { recursive: true });
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
const errors = [];
async function walk(p, name, shots = true) {
  await p.waitForSelector('.tour-card', { timeout: 15000 });
  const seen = [];
  for (let k = 0; k < 20; k++) {
    await p.waitForTimeout(450);
    const t = await p.locator('.tour-card b').innerText(), n = await p.locator('.tour-card small').innerText();
    const fits = await p.evaluate(() => { const r = document.querySelector('.tour-card').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1 && r.top >= 0 && r.bottom <= innerHeight + 1; });
    seen.push(`${n} ${t}${fits ? '' : ' (card off screen!)'}`);
    if (/settings/i.test(t)) seen.push('    (settings panel shown: ' + await p.locator('.lab-ins[aria-label="Component settings"]').isVisible() + ')');
    if (shots) await p.screenshot({ path: `${O}tour-${name}-${k + 1}.png` });
    const next = p.locator('.tour-card .tour-next');
    if (await next.evaluate((e) => e.tagName) === 'A' || (await next.innerText()) === 'Done') return { seen, last: next };
    await next.click();
  }
  return { seen, last: null };
}
(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1440, height: 950 } });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message));
  // dashboard
  await p.goto(B + '/dashboard/'); await p.waitForSelector('.tabs'); await p.click('.d-tour');
  let r = await walk(p, 'dashboard');
  console.log('dashboard:\n  ' + r.seen.join('\n  '));
  ok(r.seen.length >= 4 && /practise/i.test(r.seen.join()) && !r.seen.some((s) => /off screen/.test(s)), 'dashboard tour: Concepts and practise steps, every card on screen');
  ok(await r.last.evaluate((e) => e.tagName) === 'A', 'ends on a link: ' + (await r.last.innerText()));
  await r.last.click(); await p.waitForSelector('.d-article h1', { timeout: 20000 });
  ok(/networking-essentials/.test(p.url()) && !(await p.locator('.tour-card').count()), 'it opens Networking essentials and the tour closes');
  // each reading section and the Problems list have their own tour, ending on a link to a first step
  for (const [sec, to] of [['concepts', /networking-essentials/], ['components', /redis/], ['interview-questions', /system-design-interviews/], ['real-systems', /shopify-reservations/], ['problems', /url-shortener/]]) {
    await p.goto(B + '/dashboard/' + sec + '/'); await p.waitForSelector('.tabs'); await p.waitForTimeout(400); await p.click('.d-tour');
    const s = await walk(p, sec, false); const link = s.last && await s.last.evaluate((e) => e.tagName) === 'A';
    if (link) { await s.last.click(); await p.waitForTimeout(1500); }
    ok(s.seen.length >= 3 && link && to.test(p.url()) && !s.seen.some((x) => /off screen/.test(x)), `${sec} tour: ${s.seen.length} steps, ends on a link that opens ${p.url().split('/dashboard/')[1]}`);
  }
  await p.goto(B + '/dashboard/problems/#problems/url-shortener'); await p.waitForSelector('.sv-tabs', { timeout: 20000 });
  // problem workspace
  await p.waitForSelector('.sv-lab .react-flow__node', { timeout: 30000 }); await p.waitForTimeout(500);
  await p.click('.d-tour'); r = await walk(p, 'problem');
  console.log('problem:\n  ' + r.seen.join('\n  '));
  ok(r.seen.filter((s) => /^\d/.test(s)).length === 10 && new Set(r.seen).size === r.seen.length && !r.seen.some((s) => /off screen/.test(s)), `problem tour: ${r.seen.filter((s) => /^\d/.test(s)).length} steps, each once, every card on screen`);
  ok(r.seen.some((s) => /settings/.test(s)) && r.seen.some((s) => /Solution/.test(s)) && r.seen.some((s) => /Submit/.test(s)), 'it covers settings, Run/Submit and Solution');
  await r.last.click(); ok(!(await p.locator('.tour-card').count()), 'Done closes it');
  // Esc and arrows
  await p.click('.d-tour'); await p.waitForSelector('.tour-card'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(500);
  const two = await p.locator('.tour-card small').innerText(); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(400);
  const one = await p.locator('.tour-card small').innerText(); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok(/^2 /.test(two) && /^1 /.test(one) && !(await p.locator('.tour-card').count()), `→ ${two}, ← ${one}, Esc closes`);
  // Lab
  await p.goto(B + '/dashboard/#lab'); await p.waitForSelector('.lab-pal', { timeout: 30000 }); await p.waitForTimeout(600);
  await p.click('.d-tour'); r = await walk(p, 'lab', false);
  console.log('lab:\n  ' + r.seen.join('\n  '));
  ok(r.seen.length >= 6 && r.seen.some((s) => /Settings/.test(s)), 'Lab tour with the settings step');
  await r.last.click();
  await ctx.close();
  // first visit: no tour opens by itself (webdriver hidden, as for a person), only from the Tour button
  const c2 = await br.newContext({ viewport: { width: 1440, height: 950 } });
  await c2.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  const q = await c2.newPage(); q.on('pageerror', (e) => errors.push(e.message));
  for (const path of ['/dashboard/', '/dashboard/#problems/restaurants-near-me', '/dashboard/#lab']) {
    await q.goto(B + path); await q.waitForSelector(path.includes('lab') ? '.lab-pal' : path.includes('problems') ? '.sv-lab .react-flow__node' : '.tabs', { timeout: 30000 }); await q.waitForTimeout(3500);
    ok(!(await q.locator('.tour-card').count()), `first visit to ${path}: no tour by itself`);
  }
  await q.click('.d-tour'); ok(await q.waitForSelector('.tour-card', { timeout: 5000 }).then(() => true, () => false), 'the Tour button opens it');
  await c2.close();
  // phone
  const c3 = await br.newContext({ ...devices['iPhone 13'] }); const m = await c3.newPage(); m.on('pageerror', (e) => errors.push(e.message));
  await m.goto(B + '/dashboard/#problems/url-shortener'); await m.waitForSelector('.sv-tabs', { timeout: 30000 }); await m.waitForTimeout(800);
  const tb = m.locator('.d-tour'); if (await tb.isVisible()) { await tb.tap(); r = await walk(m, 'phone'); console.log('phone:\n  ' + r.seen.join('\n  ')); ok(r.seen.length >= 3 && !r.seen.some((s) => /off screen/.test(s)), 'phone: the tour skips what is hidden, cards on screen'); }
  else console.log('phone: no Tour button on this screen');
  console.log('errors:', JSON.stringify(errors));
  await br.close();
})();
