// Any problem on the v2 evaluator: the calls table, the start design failing, the solution copied and Accepted on
// Submit (every test), per-call results and "How your design was read", no page errors. Desktop.
// Usage: node eval-problem.js <site> <slug> [<slug> …] (default site https://tech.katta.cc, slug notifications).
const { chromium: raw } = require('playwright'); const chromium = require('./open-site.js')(raw);
const base = process.argv[2] || 'https://tech.katta.cc', slugs = process.argv.slice(3).length ? process.argv.slice(3) : ['notifications'];
const errors = [];
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) errors.push(msg); };
const verdict = async (page) => { await page.waitForSelector('.sv-console .sv-v b', { timeout: 30000 }); await page.waitForFunction(() => !document.querySelector('.sv-running'), null, { timeout: 30000 }); return page.$eval('.sv-console .sv-v', (e) => e.textContent); };
(async () => {
  const browser = await chromium.launch();
  for (const slug of slugs) {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    page.on('pageerror', (e) => errors.push(`${slug} pageerror ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`${slug} console ${m.text().slice(0, 200)}`); });
    await page.goto(`${base}/dashboard/#problems/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.sv-run');
    const ops = await page.$$eval('.sv-optable tbody tr', (r) => r.length);
    ok(ops > 0, `${slug}: what the system must do (${ops} calls)`);
    await page.click('.sv-run');
    ok(/Wrong design/.test(await verdict(page)), `${slug}: the start design fails`);
    await page.click('.sv-console button[aria-label="Close results"]');
    await page.click('text=Solution'); await page.click('text=Copy to my canvas'); await page.waitForTimeout(800);
    await page.click('.sv-submit');
    const v = await verdict(page), m = v.match(/(\d+) \/ (\d+) tests passed/);
    ok(/Accepted/.test(v) && m && m[1] === m[2], `${slug}: the solution on Submit: ${v.slice(0, 70)}`);
    ok((await page.$$('.sv-opres li')).length > 0 && !!(await page.$('.sv-read')), `${slug}: per-call results and how the design was read`);
    await page.context().close();
  }
  await browser.close();
  console.log('errors:', errors);
  process.exit(errors.length ? 1 : 0);
})();
