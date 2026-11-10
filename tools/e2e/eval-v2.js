// The v2 evaluator's workspace on the URL shortener (tech-katta #291, evaluator.md §12.1, §14.6): the Description's
// "What the system must do", the start design failing with a plan error, the solution copied and Accepted on Run and
// Submit, per-call results, "How your design was read", Replay on the canvas, Watch, the generated settings panel,
// an arrow's "Carries", and the same on a phone. Usage: node eval-v2.js <site> (default https://tech.katta.cc).
const { chromium: raw, devices } = require('playwright'); const chromium = require('./open-site.js')(raw);
const base = process.argv[2] || 'https://tech.katta.cc';
const errors = [], bad = new Set();
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) errors.push(msg); };
const watch = (page, tag) => {
  page.on('pageerror', (e) => errors.push(`${tag} pageerror ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`${tag} console ${m.text().slice(0, 200)}`); });
  page.on('response', (r) => { if (r.status() >= 400 && !/\/v1\/auth\//.test(r.url())) bad.add(`${r.status()} ${r.url().replace(/\?.*/, '')}`); });
};
const sideways = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const verdict = async (page) => { await page.waitForSelector('.sv-console .sv-v b', { timeout: 30000 }); await page.waitForFunction(() => !document.querySelector('.sv-running'), null, { timeout: 30000 }); return page.$eval('.sv-console .sv-v', (e) => e.textContent); };

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); watch(page, 'desktop');
  await page.goto(base + '/dashboard/#problems/url-shortener', { waitUntil: 'networkidle' });
  await page.waitForSelector('.sv-run');
  const ops = await page.$$eval('.sv-optable tbody tr', (r) => r.map((x) => x.textContent));
  ok(ops.length === 3 && /Open a short link/.test(ops[0]) && /99.9%/.test(ops[0]), `What the system must do: ${ops.length} calls (${ops[0]?.slice(0, 60)})`);
  ok((await page.$$('.sv-test .sv-io')).length >= 2, 'example trace tests show a request and the expected response');

  // the starting design: wrong, with the plan's reason
  await page.click('.sv-run');
  let v = await verdict(page);
  ok(/Wrong design/.test(v), `start design on Run: ${v.slice(0, 80)}`);
  const why = await page.$$eval('.sv-why li', (l) => l.map((x) => x.textContent));
  ok(why.some((w) => /reaches no database/.test(w)), `the reason names the missing database: ${why[0]?.slice(0, 90)}`);

  // the generated settings panel and an arrow's Carries (the results cover the canvas: close them first)
  await page.click('.sv-console button[aria-label="Close results"]');
  await page.click('.react-flow__node:has-text("Server")');
  const labels = await page.$$eval('.lab-ins .lab-f > span, .lab-ins .lab-check', (l) => l.map((x) => x.textContent));
  ok(labels.some((t) => /Availability zones/.test(t)) && labels.some((t) => /Circuit breaker/.test(t)), `Service settings come from eval.json (${labels.length})`);
  ok(!(await page.$('.lab-budget')) && !(await page.$('.lab-btn.run')), 'no credit meter and no Run traffic in a v2 problem');
  await page.click('.react-flow__edge', { force: true });
  ok(!!(await page.$('.lab-ins select option[value="reads"]')), 'a selected arrow offers Carries: only reads');

  // copy the solution, Run and Submit
  await page.click('text=Solution');
  await page.click('text=Copy to my canvas');
  await page.waitForTimeout(800);
  await page.click('.sv-run');
  v = await verdict(page);
  ok(/Example tests passed/.test(v), `solution on Run: ${v.slice(0, 80)}`);
  await page.click('.sv-submit');
  v = await verdict(page);
  ok(/Accepted/.test(v) && /10 \/ 10/.test(v), `solution on Submit: ${v.slice(0, 90)}`);
  const opres = await page.$$eval('.sv-opres li', (l) => l.map((x) => x.textContent));
  ok(opres.some((t) => /Open a short link .*% · p50 \d+ ms · p99 \d+ ms/.test(t)), `per-call results (${opres[0]?.slice(0, 70)})`);
  ok(!!(await page.$('.sv-read')), 'How your design was read');
  await page.click('.sv-read summary');
  const hops = await page.$$eval('.sv-hops li', (l) => l.map((x) => x.textContent));
  ok(hops.some((t) => /on a miss: .*by its key on links/.test(t)), `the plan reads through the cache (${hops.length} hops)`);

  // Replay a load test on the canvas
  await page.click('.sv-results li:has-text("The evening peak") summary');
  await page.click('.sv-results li:has-text("The evening peak") .sv-watch');
  await page.waitForSelector('.sv-scrub');
  await page.$eval('.sv-scrub', (e) => { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; s.call(e, '30'); e.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(300);
  const status = await page.$eval('.lab-status', (e) => e.textContent);
  ok(/8:30 pm/.test(status) && /\/s, 100% ok/.test(status), `Replay status at minute 30: ${status.slice(0, 90)}`);
  const bars = await page.$$eval('.react-flow__node .ln-bar', (b) => b.length);
  ok(bars >= 4, `nodes show their load during the replay (${bars})`);
  await page.click('button[aria-label="Close the replay"]');

  // Watch a trace test
  await page.click('.sv-results li:has-text("Open a short link") summary');
  await page.click('.sv-results li:has-text("Open a short link") .sv-watch');
  await page.waitForSelector('.sv-trace');
  const steps = await page.$$eval('.sv-trace li', (l) => l.map((x) => x.textContent));
  ok(steps.some((t) => /finds the links row by its key/.test(t)), `Watch: ${steps.length} steps`);
  ok((await sideways(page)) <= 0, 'no sideways scroll on desktop');

  // phone
  const ph = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage(); watch(ph, 'phone');
  await ph.goto(base + '/dashboard/#problems/url-shortener', { waitUntil: 'networkidle' });
  await ph.waitForSelector('.sv-run');
  ok((await ph.$$('.sv-optable tbody tr')).length === 3, 'phone: the calls table');
  ok((await sideways(ph)) <= 0, `phone: no sideways scroll (${await sideways(ph)})`);
  await ph.click('.sv-run');
  v = await verdict(ph);
  ok(/Wrong design/.test(v), `phone: start design on Run: ${v.slice(0, 60)}`);

  await browser.close();
  console.log('bad responses:', [...bad]);
  console.log('errors:', errors);
  process.exit(errors.length ? 1 : 0);
})();
