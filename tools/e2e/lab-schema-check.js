// Schema editor in the Lab: add a table on PostgreSQL, a location field (warning: no geo index), a geo
// index (warning gone), switch to DynamoDB (error: no geo index there), close with Escape, check the
// node line and that a reload keeps it; then a phone.
const { chromium: raw, devices } = require('playwright');
const B = process.argv[2] || 'http://localhost:4173';
const chromium = B.startsWith('http://localhost') ? raw : require('./open-site.js')(raw);
const O = '/tmp/shots/'; require('fs').mkdirSync(O, { recursive: true });
(async () => {
  const br = await chromium.launch(); const errors = [];
  const p = await br.newPage({ viewport: { width: 1440, height: 950 } });
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(B + '/dashboard/#lab'); await p.waitForSelector('.react-flow__node', { timeout: 20000 }); await p.waitForTimeout(800);
  await p.locator('.react-flow__node', { hasText: 'Database' }).first().click(); await p.waitForSelector('.lab-sch');
  console.log('section:', (await p.locator('.lab-sch').innerText()).replace(/\n+/g, ' / '));
  await p.locator('.lab-sch button').click(); await p.waitForSelector('.sch');
  await p.locator('.sch-foot button', { hasText: 'Add a table' }).click();
  const t = p.locator('.sch-t').first();
  await t.locator('.sch-name input').fill('restaurants');
  await t.locator('.sch-add', { hasText: 'field' }).click();
  await t.locator('.sch-f tbody tr').nth(1).locator('input').first().fill('location');
  await t.locator('.sch-f tbody tr').nth(1).locator('select').selectOption('geo'); await p.waitForTimeout(200);
  console.log('issues (pg, no geo index):', (await t.locator('.sch-issues').innerText().catch(() => 'none')).replace(/\n/g, ' / '));
  await t.locator('.sch-add', { hasText: 'index' }).click();
  await t.locator('.sch-ix select').first().selectOption('geo'); await t.locator('.sch-ix select').nth(1).selectOption('location'); await p.waitForTimeout(200);
  console.log('issues (pg + geo index):', await t.locator('.sch-issues').count());
  await p.screenshot({ path: O + 'schema-editor.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  console.log('closed:', await p.locator('.sch').count() === 0);
  console.log('node:', (await p.locator('.react-flow__node', { hasText: 'Database' }).first().innerText()).replace(/\n/g, ' | '));
  await p.locator('.lab-ins select').first().selectOption('dynamodb'); await p.waitForTimeout(300);
  console.log('section on dynamo:', (await p.locator('.lab-sch').innerText()).replace(/\n+/g, ' / '));
  await p.locator('.lab-sch button').click(); await p.waitForSelector('.sch');
  console.log('dynamo issues:', (await p.locator('.sch-issues').first().innerText()).replace(/\n/g, ' / '));
  console.log('dynamo words:', (await p.locator('.sch-f th').allInnerTexts()).join(','), '|', await p.locator('.sch-row .sch-name span').allInnerTexts());
  await p.locator('.sch-foot button', { hasText: 'Done' }).click();
  await p.waitForTimeout(2500); await p.reload(); await p.waitForSelector('.react-flow__node', { timeout: 20000 }); await p.waitForTimeout(800);
  console.log('after reload:', (await p.locator('.react-flow__node', { hasText: 'Database' }).first().innerText()).replace(/\n/g, ' | '));
  const ph = await br.newPage({ ...devices['iPhone 13'] }); ph.on('pageerror', (e) => errors.push(e.message));
  await ph.goto(B + '/dashboard/#lab'); await ph.waitForTimeout(3000);
  console.log('phone overflow:', await ph.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth));
  console.log('errors:', JSON.stringify(errors));
  await br.close();
})();
