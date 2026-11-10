// IND vs PAK is a problem and there is no Lab tab (tech-katta #285, #286): tabs, Problems with its 8 challenges, a
// challenge's own page and score, old #lab links, the IND vs PAK workspace and article, repointed cards, the landing
// canvas and phone controls, no sideways scroll. Usage: node no-lab.js <site> (default http://localhost:5484).
const { chromium: raw, devices } = require('playwright'); const chromium = require('./open-site.js')(raw);
const base = process.argv[2] || 'http://localhost:5484';
const errors = [], bad = new Set();
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) errors.push(msg); };
const watch = (page, tag) => {
  page.on('pageerror', (e) => errors.push(`${tag} pageerror ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`${tag} console ${m.text().slice(0, 200)}`); });
  page.on('response', (r) => { if (r.status() >= 400) bad.add(`${r.status()} ${r.url().replace(/\?.*/, '')}`); });
};
const sideways = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
(async () => {
  const browser = await chromium.launch();
  // ---- desktop
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage(); watch(page, 'desktop');
  await page.goto(base + '/dashboard/', { waitUntil: 'networkidle' });
  const tabs = await page.$$eval('.tabs a', (a) => a.map((x) => x.textContent));
  ok(!tabs.includes('Lab') && tabs.includes('Problems'), `top tabs have no Lab: ${tabs.join(', ')}`);
  const side = await page.$$eval('.side-nav a', (a) => a.map((x) => x.textContent));
  ok(!side.some((t) => t === 'Lab'), 'sidebar has no Lab');

  // Problems: questions table includes IND vs PAK; challenges list links to their own addresses
  await page.goto(base + '/dashboard/problems/', { waitUntil: 'networkidle' });
  const rows = await page.$$eval('table tbody tr', (r) => r.map((x) => x.textContent));
  ok(rows.some((t) => /IND vs PAK/.test(t)), `Problems table lists IND vs PAK (${rows.length} rows)`);
  const chLinks = await page.$$eval('a[href^="#problems/challenge/"]', (a) => [...new Set(a.map((x) => x.getAttribute('href')))]);
  ok(chLinks.length === 8 && !chLinks.some((h) => h.endsWith('ind-vs-pak')), `8 challenge links, none for IND vs PAK: ${chLinks.join(' ')}`);
  ok(!(await page.$('a[href^="#lab"]')), 'no #lab links on Problems');

  // a challenge opens on its own address, with a back link, scores, and offers the next challenge
  await page.click('a[href="#problems/challenge/one-server"]');
  await page.waitForSelector('.lab-canvas', { timeout: 15000 });
  ok(page.url().endsWith('/dashboard/problems/challenge/one-server/'), `address bar: ${page.url()}`);
  ok(!(await page.$('.lab-designs-btn')) && !(await page.$('.lab-ch-btn')), 'no Designs or Challenges menus');
  const back = await page.$eval('.lab-open', (a) => [a.textContent, a.getAttribute('href')]);
  ok(back[1] === '#problems' && back[0].startsWith('←'), `back link: ${back.join(' ')}`);
  ok(!!(await page.$('h1.sr')), 'the challenge page has an h1');
  await page.click('.lab-score-top');
  await page.waitForSelector('.lab-score', { timeout: 10000 });
  const scoreTxt = await page.$eval('.lab-score', (e) => e.textContent);
  ok(/CHALLENGE SCORE/.test(scoreTxt), 'Score dialog opens');
  // the tour on a challenge page: steps exist and don't point at removed menus
  await page.keyboard.press('Escape');
  await page.click('.d-tour');
  await page.waitForSelector('.tour', { timeout: 5000 }).catch(() => {});
  ok(!!(await page.$('.tour, [role="dialog"]')), 'the challenge tour opens');
  await page.keyboard.press('Escape');

  // old Lab links: #lab → Problems, #lab/<challenge> → the challenge, #lab/ind-vs-pak → the problem
  await page.goto(base + '/dashboard/#lab/flash-sale', { waitUntil: 'networkidle' });
  await page.waitForSelector('.lab-canvas', { timeout: 15000 });
  ok(page.url().endsWith('/dashboard/problems/challenge/flash-sale/'), `#lab/flash-sale → ${page.url()}`);
  await page.goto(base + '/dashboard/#lab', { waitUntil: 'networkidle' });
  ok(page.url().endsWith('/dashboard/problems/'), `#lab → ${page.url()}`);
  await page.goto(base + '/dashboard/#lab/ind-vs-pak', { waitUntil: 'networkidle' });
  await page.waitForSelector('.sv-tabs, .lab-canvas', { timeout: 15000 });
  ok(page.url().endsWith('/dashboard/problems/ind-vs-pak/'), `#lab/ind-vs-pak → ${page.url()}`);

  // the IND vs PAK workspace: description with example tests; Run on the start design fails
  const desc = await page.textContent('main');
  ok(/Design live streaming for IND vs PAK/.test(desc) && /The toss/.test(desc) && /The last over/.test(desc), 'workspace shows the problem and its example tests');
  const run = await page.$('button:has-text("Run")');
  await run.click();
  await page.waitForFunction(() => /fail|pass|Wrong|Accepted|✕/i.test(document.querySelector('.sv-res, .sv-results, [class*="res"]')?.textContent || ''), null, { timeout: 20000 }).catch(() => {});
  const resTxt = await page.evaluate(() => (document.querySelector('.sv-res, .sv-results') || document.querySelector('main')).textContent);
  ok(/The toss/.test(resTxt) && /✕|fail/i.test(resTxt), 'Run on the starting design fails the toss');

  // the worked answer: both figures drawn, no figure error, cards point to problems
  await page.goto(base + '/dashboard/interview-questions/ind-vs-pak/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const figs = await page.$$eval('.a-fig svg', (s) => s.length), figErr = await page.$$('.a-fig-err');
  ok(figs >= 2 && figErr.length === 0, `IND vs PAK article: ${figs} figures, ${figErr.length} errors`);
  await page.goto(base + '/dashboard/interview-questions/video-streaming/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const card = await page.$eval('.a-lab', (a) => [a.getAttribute('href'), a.textContent]).catch(() => null);
  ok(card && card[0] === '#problems/ind-vs-pak' && /ON THE CANVAS/.test(card[1]), `video streaming card: ${card && card.join(' | ').slice(0, 120)}`);
  await page.goto(base + '/dashboard/concepts/networking-essentials/', { waitUntil: 'networkidle' });
  const card2 = await page.$eval('.a-lab', (a) => a.getAttribute('href')).catch(() => null);
  ok(card2 === '#problems/challenge/one-server', `networking card: ${card2}`);

  // the landing page: a canvas for IND vs PAK with Run; the starting design fails,
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.locator('#ind-vs-pak').scrollIntoViewIfNeeded();
  await page.waitForSelector('#ind-vs-pak .lab-canvas', { timeout: 20000 });
  ok(!!(await page.$('#ind-vs-pak .lp-run button')), 'landing: Run the tests button above the canvas');
  ok(!!(await page.$('#ind-vs-pak .lab-open[href="/dashboard/problems/ind-vs-pak/"]')), 'landing: link to the full problem');
  const navs = await page.$$eval('header nav a, footer nav a', (a) => a.map((x) => x.textContent + ' ' + x.getAttribute('href')));
  ok(!navs.some((t) => /Lab|\/lab/.test(t)), `landing nav and footer have no Lab: ${navs.join(', ')}`);
  await page.click('#ind-vs-pak .lp-run button');
  await page.waitForSelector('#ind-vs-pak .lp-res', { timeout: 20000 });
  const lres = await page.textContent('#ind-vs-pak .lp-res');
  ok(/0 of 2/.test(lres) && /The toss/.test(lres), `landing Run on the start: ${lres.slice(0, 120)}`);
  ok((await sideways(page)) <= 0, 'landing desktop: no sideways scroll');
  await page.screenshot({ path: '/tmp/shots/no-lab-landing.png' });
  await ctx.close();

  // ---- phone: the three controls, judged by the same tests
  const pctx = await browser.newContext({ ...devices['iPhone 13'] });
  const ph = await pctx.newPage(); watch(ph, 'phone');
  await ph.goto(base + '/', { waitUntil: 'networkidle' });
  await ph.locator('#ind-vs-pak').scrollIntoViewIfNeeded();
  await ph.waitForSelector('#ind-vs-pak .ll', { timeout: 20000 });
  ok(!(await ph.$('#ind-vs-pak .lab-canvas')), 'phone: no canvas');
  await ph.click('#ind-vs-pak .ll-score');
  let t = await ph.textContent('#ind-vs-pak .ll-res');
  ok(/0 of 2/.test(t) && /CDN/.test(t), `phone start (no CDN, 10 servers): ${t.slice(0, 90)}`);
  await ph.check('#ind-vs-pak .ll-check input');
  for (let i = 0; i < 6; i++) await ph.click('#ind-vs-pak button[aria-label="More servers"]');
  ok((await ph.textContent('#ind-vs-pak .ll-step output')) === '40', 'phone: 40 servers');
  await ph.click('#ind-vs-pak .ll-score');
  t = await ph.textContent('#ind-vs-pak .ll-res');
  ok(/2 of 2/.test(t), `phone CDN + 40 before the toss: ${t.slice(0, 90)}`);
  ok((await sideways(ph)) <= 0, 'phone landing: no sideways scroll');
  await ph.screenshot({ path: '/tmp/shots/no-lab-phone.png', fullPage: false });
  // phone: the challenge page and the problem page don't scroll sideways
  for (const p of ['/dashboard/problems/', '/dashboard/problems/challenge/one-server/', '/dashboard/problems/ind-vs-pak/', '/dashboard/interview-questions/ind-vs-pak/']) {
    await ph.goto(base + p, { waitUntil: 'networkidle' }); await ph.waitForTimeout(400);
    ok((await sideways(ph)) <= 0, `phone ${p}: no sideways scroll`);
  }
  await pctx.close();
  await browser.close();
  console.log('failed responses:', [...bad]);
  console.log('errors:', JSON.stringify(errors, null, 1));
})();
