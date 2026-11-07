// Parts with a job and key decisions (tech-katta #227) on Restaurants near me: Run on the reference without
// roles fails the role check; giving the database its job (Geo index) passes; Submit grades the key decisions
// (all right but the last) with reasons; a phone. Usage: node problems-roles.js <site>
const { chromium: raw, devices } = require('playwright');
const B = process.argv[2] || 'http://localhost:4173';
const chromium = B.startsWith('http://localhost') ? raw : require('./open-site.js')(raw);
const fs = require('fs');
const O = '/tmp/shots/'; fs.mkdirSync(O, { recursive: true });
const slug = 'restaurants-near-me';
const art = JSON.parse(fs.readFileSync(require('path').join(process.env.TK_CONTENT || require('path').join(__dirname, '../../../tech-katta/content'), 'articles/interview-questions', slug + '.json'), 'utf8'));
(async () => {
  const br = await chromium.launch(); const errors = [];
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 } });
  const watch = (p) => { p.on('pageerror', (e) => errors.push(e.message)); };
  let p = await ctx.newPage(); watch(p);
  await p.goto(B + '/dashboard/#problems/' + slug); await p.waitForSelector('.react-flow__node', { timeout: 20000 }); await p.waitForTimeout(800);
  const st = JSON.parse(await p.evaluate(() => localStorage.getItem('tk-lab-v1'))); await p.close();
  // the reference without roles: right sizes, general parts
  const general = art.practice.reference.nodes.map((n) => { const { role, ...config } = n.config || {}; return { ...n, config }; });
  Object.assign(st.designs['q-' + slug], { nodes: general, edges: art.practice.reference.edges, updated: Date.now() });
  await ctx.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('tk-lab-v1', v); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(st));
  p = await ctx.newPage(); watch(p);
  await p.goto(B + '/dashboard/#problems/' + slug); await p.waitForSelector('.react-flow__node', { timeout: 20000 }); await p.waitForTimeout(1000);
  await p.click('.sv-run'); await p.waitForSelector('.sv-console .sv-v', { timeout: 20000 }); await p.waitForTimeout(500);
  const run1 = (await p.locator('.sv-console').innerText()).replace(/\n+/g, ' | ');
  console.log('RUN general parts:', run1.slice(0, 600));
  // give the database its job
  await p.click('.sv-vbtns button:last-child'); await p.waitForTimeout(300);
  await p.locator('.react-flow__node', { hasText: 'Database' }).first().click(); await p.waitForSelector('.lab-ins');
  const sel = p.locator('.lab-ins select').first();
  console.log('role options:', (await sel.locator('option').allInnerTexts()).join(', '));
  await sel.selectOption('geo'); await p.waitForTimeout(300);
  console.log('node now:', (await p.locator('.react-flow__node', { hasText: 'Geo index' }).first().innerText()).replace(/\n/g, ' | '));
  await p.locator('.lab-ins').screenshot({ path: O + 'role-panel.png' });
  await p.click('.sv-run'); await p.waitForTimeout(1500);
  console.log('RUN with geo index:', (await p.locator('.sv-console').innerText()).replace(/\n+/g, ' | ').slice(0, 200));
  // answer: decisions right except the last
  await p.locator('.sv-tabs button', { hasText: 'Your answer' }).click(); await p.waitForSelector('.sv-dec');
  const decs = art.practice.rubric.decisions;
  for (let i = 0; i < decs.length; i++) { const box = p.locator('.sv-dec').nth(i); const want = i < decs.length - 1 ? decs[i].answer : (decs[i].answer + 1) % decs[i].options.length; await box.locator('input[type=radio]').nth(want).check(); }
  await p.click('.sv-submit'); await p.waitForSelector('.sv-score', { timeout: 30000 }); await p.waitForTimeout(500);
  console.log('SUBMIT:', (await p.locator('.sv-console').innerText()).replace(/\n+/g, ' | ').slice(0, 400));
  await p.locator('.sv-tabs button', { hasText: 'Your answer' }).click(); await p.waitForTimeout(400);
  console.log('marks:', (await p.locator('.sv-dec legend').allInnerTexts()).join(' / '));
  console.log('why shown:', await p.locator('.sv-why').count());
  await p.locator('.sv-dec').last().screenshot({ path: O + 'decision.png' });
  const ph = await br.newPage({ ...devices['iPhone 13'] }); watch(ph);
  await ph.goto(B + '/dashboard/#problems/' + slug); await ph.waitForTimeout(2500);
  await ph.locator('.sv-tabs button', { hasText: 'Your answer' }).click().catch(() => {}); await ph.waitForTimeout(800);
  console.log('phone overflow:', await ph.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 'decisions:', await ph.locator('.sv-dec').count());
  console.log('errors:', JSON.stringify(errors));
  await br.close();
})();
