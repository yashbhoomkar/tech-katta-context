// Request tests in the workspace (Restaurants near me): the Description shows the request and the expected
// response; Run on the reference without a schema fails with the reason; with the reference's schema it
// passes; Watch plays the request across the canvas (highlighted component, a dot on the arrow).
const { chromium: raw, devices } = require('playwright');
const B = process.argv[2] || 'http://localhost:4173';
const chromium = B.startsWith('http://localhost') ? raw : require('./open-site.js')(raw);
const fs = require('fs');
const O = process.env.OUT || '/tmp/shots/'; require('fs').mkdirSync(O, { recursive: true });
const slug = process.argv[3] || 'restaurants-near-me';
const art = JSON.parse(fs.readFileSync(require('path').join(process.env.TK_CONTENT || require('path').join(__dirname, '../../../tech-katta/content'), 'articles/interview-questions', slug + '.json'), 'utf8'));
(async () => {
  const br = await chromium.launch(); const errors = [];
  const ctx = await br.newContext({ viewport: { width: 1440, height: 950 } });
  let p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(B + '/dashboard/#problems/' + slug); await p.waitForSelector('.react-flow__node', { timeout: 20000 }); await p.waitForTimeout(800);
  console.log('description io blocks:', await p.locator('.sv-test .sv-io').count(), '|', (await p.locator('.sv-test .sv-io').first().innerText()).replace(/\s+/g, ' ').slice(0, 220));
  const st = JSON.parse(await p.evaluate(() => localStorage.getItem('tk-lab-v1'))); await p.close();
  const noSchema = art.practice.reference.nodes.map((n) => { if (n.type !== 'database') return n; const { schema, ...config } = n.config; return { ...n, config }; });
  Object.assign(st.designs['q-' + slug], { nodes: noSchema, edges: art.practice.reference.edges, updated: Date.now() });
  await ctx.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('tk-lab-v1', v); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(st));
  p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(B + '/dashboard/#problems/' + slug); await p.waitForSelector('.react-flow__node', { timeout: 20000 }); await p.waitForTimeout(1000);
  await p.click('.sv-run'); await p.waitForSelector('.sv-console .sv-v', { timeout: 30000 }); await p.waitForTimeout(400);
  const fail = p.locator('.sv-results li', { hasText: 'Test' }).filter({ has: p.locator('.sv-io') }).first();
  console.log('RUN without schema:', (await p.locator('.sv-console .sv-v').innerText()).replace(/\n+/g, ' | '));
  const reqLi = p.locator('.sv-results > li').filter({ hasText: /GET|POST|PUT|PATCH/ }).first();
  console.log('request test row:', (await reqLi.locator('summary').innerText()).replace(/\n+/g, ' | '));
  await reqLi.locator('details').evaluate((d) => { d.open = true; }); await p.waitForTimeout(200);
  console.log('why:', (await reqLi.locator('.sv-why').innerText().catch(() => '')).slice(0, 200));
  // now the reference with its schema (as if the user built it), in a fresh browser
  await p.close(); const st2 = JSON.parse(JSON.stringify(st)); Object.assign(st2.designs['q-' + slug], { nodes: art.practice.reference.nodes, edges: art.practice.reference.edges, updated: Date.now() });
  const ctx2 = await br.newContext({ viewport: { width: 1440, height: 950 } }); await ctx2.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('tk-lab-v1', v); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(st2));
  p = await ctx2.newPage(); p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(B + '/dashboard/#problems/' + slug); await p.waitForSelector('.react-flow__node', { timeout: 20000 }); await p.waitForTimeout(1000);
  await p.click('.sv-run'); await p.waitForSelector('.sv-console .sv-v', { timeout: 30000 }); await p.waitForTimeout(400);
  console.log('RUN with schema:', (await p.locator('.sv-console .sv-v').innerText()).replace(/\n+/g, ' | '));
  const li = p.locator('.sv-results > li').filter({ hasText: /GET|POST|PUT|PATCH/ }).first();
  await li.locator('details').evaluate((d) => { d.open = true; }); await p.waitForTimeout(200);
  console.log('io:', (await li.locator('.sv-io').innerText()).replace(/\s+/g, ' ').slice(0, 300));
  await li.locator('.sv-watch').click(); await p.waitForSelector('.sv-player');
  await p.waitForTimeout(150);
  console.log('steps:', (await p.locator('.sv-trace li').allInnerTexts()).join(' → '));
  // pause and step through, checking the highlight and the dot
  await p.locator('.sv-player button[aria-label="Pause"]').click().catch(() => {});
  const seen = [];
  for (let k = 0; k < 12; k++) {
    const on = await p.locator('.ln-trace').count(), dot = await p.locator('.lab-dot').count();
    seen.push(`${(await p.locator('.sv-trace li.on').innerText()).slice(0, 28)}[node:${on} dot:${dot}]`);
    if (k === 4) { await p.screenshot({ path: O + 'watch.png' }); console.log('hop json:', (await p.locator('.sv-hop pre').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 160)); }
    const next = p.locator('.sv-player button[aria-label="Next step"]'); if (await next.isDisabled()) break; await next.click(); await p.waitForTimeout(150);
  }
  console.log(seen.join(' | '));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  console.log('player closed:', await p.locator('.sv-player').count() === 0);
  const ph = await br.newPage({ ...devices['iPhone 13'] }); ph.on('pageerror', (e) => errors.push(e.message));
  await ph.goto(B + '/dashboard/#problems/' + slug); await ph.waitForTimeout(3000);
  console.log('phone overflow:', await ph.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth));
  console.log('errors:', JSON.stringify(errors));
  await br.close();
})();
