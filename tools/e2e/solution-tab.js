// The Solution tab's design (#problems/<slug>, Solution): the diagram, "What each part does", Copy to my
// canvas (the canvas gets the solution, Run passes), Full size (a dialog; Escape closes it), Undo (the visitor's design comes back), Submit of the
// copied design unchanged (Accepted, but not counted as solved; the Submissions row says "copied
// solution"), a change makes it count, Reset, and a phone (Copy switches to the canvas, no sideways scroll).
// Usage: node solution-tab.js <site> [slug]   (default restaurants-near-me)
const { chromium: raw, devices } = require('playwright');
const chromium = require('./open-site.js')(raw);
const fs = require('fs');
const B = process.argv[2] || 'https://tech.katta.cc', slug = process.argv[3] || 'restaurants-near-me', O = '/tmp/shots/'; fs.mkdirSync(O, { recursive: true });
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const br = await chromium.launch(); const errors = [];
  const ctx = await br.newContext({ viewport: { width: 1440, height: 950 } });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  const nodes = () => p.locator('.react-flow__node').count();
  const stored = () => p.evaluate((s) => { const d = JSON.parse(localStorage.getItem('tk-lab-v1')).designs['q-' + s]; return d && { n: d.nodes.length, e: d.edges.length, ids: d.nodes.map((x) => x.id).sort().join(',') }; }, slug);
  await p.goto(B + '/dashboard/#problems/' + slug); await p.waitForSelector('.react-flow__node', { timeout: 30000 }); await p.waitForTimeout(800);
  // the visitor's own start: one extra component so Undo has something to bring back
  const start = await nodes();
  await p.locator('.lab-pal button, .lab-palette button').filter({ hasText: /^Cache/ }).first().click().catch(() => {});
  await p.waitForTimeout(700); const mine = await stored();
  console.log('my design:', mine.n, 'components (start had', start + ')');
  // Solution tab
  await p.click('.sv-tabs >> text=Solution'); await p.waitForSelector('.sd svg', { timeout: 20000 });
  const boxes = await p.locator('.sd > .sd-fig .sd-node').count(), arrows = await p.locator('.sd > .sd-fig .sd-edge').count();
  ok(boxes >= 4 && arrows >= 3, `diagram: ${boxes} components, ${arrows} arrows`);
  ok(await p.locator('.d-article, .sv-q h1').count() > 0, 'the worked answer is still below it');
  await p.click('.sd-parts summary'); const parts = await p.locator('.sd-parts li').count();
  ok(parts === boxes, `What each part does: ${parts} rows`);
  console.log('  e.g.', (await p.locator('.sd-sch').first().innerText().catch(() => '(no schema)')).replace(/\n/g, ' | '));
  const sw = await p.evaluate(() => { const f = document.querySelector('.sd-fig'); return { pane: document.querySelector('.sv-q').scrollWidth - document.querySelector('.sv-q').clientWidth, fig: f.scrollWidth > f.clientWidth }; });
  ok(sw.pane <= 0, `the pane doesn't scroll sideways (${sw.pane}); the diagram ${sw.fig ? 'scrolls in its box' : 'fits'}`);
  ok(await p.locator('.sd-swipe').count() === (sw.fig ? 1 : 0), 'the scroll hint shows only when the diagram is wider than the pane');
  await p.click('.sd-under >> text=Full size'); await p.waitForTimeout(300);
  const big = await p.evaluate(() => { const d = document.querySelector('.sd-dlg'), f = d.querySelector('.sd-fig'); return { open: d.open, fits: f.scrollWidth <= f.clientWidth + 2, focus: document.activeElement?.getAttribute('aria-label') }; });
  ok(big.open && big.fits && big.focus === 'Close', `Full size: open, the whole design fits (${big.fits}), focus on Close`);
  await p.screenshot({ path: O + 'solution-full.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok(!(await p.evaluate(() => document.querySelector('.sd-dlg').open)), 'Escape closes it');
  await p.screenshot({ path: O + 'solution-design.png' });
  // Copy
  await p.click('.sd-copy'); await p.waitForSelector('.sd-done'); await p.waitForTimeout(1500);
  const after = await nodes(), st = await stored();
  ok(after === boxes && st.n === boxes, `copied: canvas ${after}, saved ${st.n} components`);
  await p.click('.sv-run'); await p.waitForSelector('.sv-console .sv-v', { timeout: 60000 });
  const run = (await p.locator('.sv-console .sv-v b').innerText()).trim();
  ok(run === 'Example tests passed', 'Run on the copied solution: ' + run);
  // Undo
  await p.click('.sd-done .sv-linkbtn'); await p.waitForTimeout(1500);
  const back = await stored();
  ok(back.ids === mine.ids && (await nodes()) === mine.n, `Undo: my ${mine.n} components are back`);
  ok(await p.locator('.sd-copy').isVisible(), 'the button is back to "Copy to my canvas"');
  // Copy again, Submit unchanged → Accepted but not solved
  await p.click('.sd-copy'); await p.waitForTimeout(1500);
  await p.click('.sv-submit'); await p.waitForSelector('.sv-console .sv-v', { timeout: 120000 }); await p.waitForTimeout(300);
  const v = (await p.locator('.sv-console .sv-v b').innerText()).trim(), note = await p.locator('.sv-copied').count();
  const solved = await p.evaluate((s) => !!JSON.parse(localStorage.getItem('tk-progress-v1') || '{}').steps?.['solved:' + s], slug).catch(() => null);
  ok(v === 'Accepted' && note === 1, `Submit unchanged: ${v}, copied note shown`);
  ok(solved === false, 'not marked solved');
  // a reload keeps the design; a change then counts
  await p.reload(); await p.waitForSelector('.react-flow__node', { timeout: 30000 }); await p.waitForTimeout(800);
  ok((await nodes()) === boxes, 'after a reload the canvas still has the solution');
  const srv = p.locator('.react-flow__node').filter({ hasText: /Server|API/ }).first(); await srv.click(); await p.waitForTimeout(300);
  const cnt = p.locator('.lab-ins input[type=number]').first(); const was = Number(await cnt.inputValue()); await cnt.fill(String(was + 1)); await cnt.blur(); await p.waitForTimeout(800);
  await p.click('.sv-submit'); await p.waitForSelector('.sv-console .sv-v', { timeout: 120000 }); await p.waitForTimeout(300);
  const v2 = (await p.locator('.sv-console .sv-v b').innerText()).trim(), note2 = await p.locator('.sv-copied').count();
  const solved2 = await p.evaluate((s) => !!JSON.parse(localStorage.getItem('tk-progress-v1') || '{}').steps?.['solved:' + s], slug).catch(() => null);
  ok(v2 === 'Accepted' && note2 === 0 && solved2, `changed one setting (${was} → ${was + 1}) and submitted: ${v2}, counted as solved`);
  await p.click('.sv-tabs >> text=Submissions');
  const rows = await p.$$eval('.sv-subs tbody tr', (x) => x.map((e) => e.innerText.replace(/\s+/g, ' ')));
  ok(rows.length === 2 && /copied solution/.test(rows[1]) && !/copied/.test(rows[0]), 'Submissions: ' + rows.join(' || '));
  // Reset still works
  p.once('dialog', (d) => d.accept()); await p.click('.sv-reset'); await p.waitForTimeout(1500);
  ok((await nodes()) === start, `Reset: back to the ${start}-component start`);
  await ctx.close();
  // phone
  const ph = await br.newContext({ ...devices['iPhone 13'] }); const q = await ph.newPage(); q.on('pageerror', (e) => errors.push(e.message));
  await q.goto(B + '/dashboard/#problems/' + slug); await q.waitForSelector('.sv-tabs', { timeout: 30000 }); await q.waitForTimeout(800);
  await q.locator('.sv-tabs >> text=Solution').tap(); await q.waitForSelector('.sd svg', { timeout: 20000 }); await q.waitForTimeout(400);
  const over = () => q.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(await over() <= 0, 'phone: Solution tab, no sideways scroll');
  await q.screenshot({ path: O + 'solution-phone.png' });
  await q.locator('.sd-copy').tap(); await q.waitForSelector('.react-flow__node', { timeout: 30000 }); await q.waitForTimeout(1200);
  ok((await q.locator('.react-flow__node').count()) === boxes, 'phone: Copy opens the canvas with the solution');
  await q.locator('.sv-run').tap(); await q.waitForSelector('.sv-console .sv-v', { timeout: 60000 });
  ok((await q.locator('.sv-console .sv-v b').innerText()).trim() === 'Example tests passed', 'phone: Run passes');
  ok(await over() <= 0, 'phone: no sideways scroll on the canvas');
  console.log('errors:', JSON.stringify(errors));
  await br.close();
})();
