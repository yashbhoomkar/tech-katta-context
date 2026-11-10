// Payments on the v2 evaluator (tech-katta #293): the payment provider is placed and locked on the canvas, the start
// design fails, the solution is Accepted on Submit (the provider's webhooks, charges made after answering), and the
// provider's panel can't be changed or removed. Usage: node eval-payments.js <site> (default https://tech.katta.cc).
const { chromium: raw } = require('playwright'); const chromium = require('./open-site.js')(raw);
const base = process.argv[2] || 'https://tech.katta.cc';
const errors = [];
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) errors.push(msg); };
const verdict = async (page) => { await page.waitForSelector('.sv-console .sv-v b', { timeout: 30000 }); await page.waitForFunction(() => !document.querySelector('.sv-running'), null, { timeout: 30000 }); return page.$eval('.sv-console .sv-v', (e) => e.textContent); };
(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  page.on('pageerror', (e) => errors.push(`pageerror ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`console ${m.text().slice(0, 200)}`); });
  await page.goto(base + '/dashboard/#problems/payments', { waitUntil: 'networkidle' });
  await page.waitForSelector('.sv-run');
  const ops = await page.$$eval('.sv-optable tbody tr', (r) => r.map((x) => x.textContent));
  ok(ops.length === 3 && ops.some((t) => /never twice/.test(t)), `calls table: ${ops.length} (${ops[0]?.slice(0, 50)})`);
  ok(!!(await page.$('.react-flow__node:has-text("Payment provider")')), 'the payment provider is on the canvas');
  await page.click('.react-flow__node:has-text("Payment provider")');
  const panel = await page.$eval('.lab-ins', (e) => e.textContent);
  ok(/SET BY THE PROBLEM/.test(panel) && !/Remove from design/.test(panel), 'its panel is locked');
  await page.keyboard.press('Delete');
  await page.waitForTimeout(200);
  ok(!!(await page.$('.react-flow__node:has-text("Payment provider")')), 'Delete does not remove it');
  await page.click('.sv-run');
  ok(/Wrong design/.test(await verdict(page)), 'the start design fails');
  await page.click('.sv-console button[aria-label="Close results"]');
  await page.click('text=Solution'); await page.click('text=Copy to my canvas'); await page.waitForTimeout(800);
  await page.click('.sv-submit');
  const v = await verdict(page);
  ok(/Accepted/.test(v) && /10 \/ 10/.test(v), `the solution on Submit: ${v.slice(0, 80)}`);
  const opres = await page.$$eval('.sv-opres li', (l) => l.map((x) => x.textContent));
  ok(opres.some((t) => /The provider confirms a payment/.test(t)) && opres.some((t) => /done later within/.test(t)), 'webhooks and charges made after answering show in the results');
  await browser.close();
  console.log('errors:', errors);
  process.exit(errors.length ? 1 : 0);
})();
