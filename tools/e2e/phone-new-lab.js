// On a phone (iPhone 13): rename, engine and schema in the Lab, and Watch in a problem, without the page
// scrolling sideways. Usage: node phone-new-lab.js <site>
const { chromium: raw, devices } = require('playwright');
const chromium = require('./open-site.js')(raw);
const fs = require('fs'), path = require('path');
const B = process.argv[2] || 'https://tech.katta.cc', O = '/tmp/shots/'; fs.mkdirSync(O, { recursive: true });
const art = JSON.parse(fs.readFileSync(path.join(process.env.TK_CONTENT || path.join(__dirname, '../../../tech-katta/content'), 'articles/interview-questions/restaurants-near-me.json'), 'utf8'));
(async () => {
  const br = await chromium.launch(); const errors = [];
  const ctx = await br.newContext({ ...devices['iPhone 13'] });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message));
  const over = () => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await p.goto(B + '/dashboard/#lab'); await p.waitForSelector('.react-flow__node', { timeout: 30000 }); await p.waitForTimeout(800);
  await p.locator('.react-flow__node', { hasText: 'Database' }).first().tap(); await p.waitForTimeout(500);
  const ins = p.locator('.lab-ins');
  console.log('settings visible:', await ins.isVisible());
  await ins.locator('input[type=text]').first().fill('Orders DB'); await ins.locator('input[type=text]').first().blur();
  await ins.locator('select').first().selectOption('dynamodb'); await p.waitForTimeout(300);
  console.log('node:', (await p.locator('.react-flow__node', { hasText: 'Orders DB' }).first().innerText()).replace(/\n/g, ' | '), '| overflow', await over());
  await ins.locator('.lab-sch button').tap(); await p.waitForSelector('.sch');
  await p.locator('.sch-foot button', { hasText: 'Add a table' }).tap(); await p.waitForTimeout(200);
  const box = await p.locator('.sch').boundingBox(), vw = await p.evaluate(() => innerWidth);
  console.log('schema dialog width', Math.round(box.width), 'of', vw, '| overflow', await over());
  await p.screenshot({ path: O + 'phone-schema.png' });
  await p.locator('.sch-foot button', { hasText: 'Done' }).tap(); await p.waitForTimeout(300);
  // Watch in a problem, with the reference design
  const st = JSON.parse(await p.evaluate(() => localStorage.getItem('tk-lab-v1')));
  st.designs['q-restaurants-near-me'] = { id: 'q-restaurants-near-me', name: art.title, problem: 'restaurants-near-me', updated: Date.now(), nodes: art.practice.reference.nodes, edges: art.practice.reference.edges, credit: { spent: 0, hours: 0 } };
  await p.evaluate((v) => localStorage.setItem('tk-lab-v1', v), JSON.stringify(st));
  await p.goto(B + '/dashboard/#problems/restaurants-near-me'); await p.waitForTimeout(3000);
  await p.click('.sv-run'); await p.waitForSelector('.sv-console .sv-v', { timeout: 60000 }); await p.waitForTimeout(300);
  console.log('run:', (await p.locator('.sv-console .sv-v b').innerText()));
  const li = p.locator('.sv-results > li').filter({ hasText: /GET|POST/ }).first();
  await li.locator('details').evaluate((d) => { d.open = true; });
  await li.locator('.sv-watch').tap(); await p.waitForSelector('.sv-player'); await p.waitForTimeout(1500);
  for (let k = 0; k < 4; k++) await p.locator('.sv-player button[aria-label="Next step"]').tap();
  await p.waitForTimeout(700);
  console.log('watch on phone: step', (await p.locator('.sv-trace li.on').innerText()), '| highlighted', await p.locator('.ln-trace').count(), '| dot', await p.locator('.lab-dot').count(), '| overflow', await over());
  await p.screenshot({ path: O + 'phone-watch.png' });
  console.log('errors:', JSON.stringify(errors));
  await br.close();
})();
