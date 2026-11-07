// Database engines in the Lab: pick DynamoDB (no sizes, per-request price, zones note), then MongoDB
// (its own sizes, Multi-AZ option, replicas), check the node summary and that the design still runs.
const { chromium: raw } = require('playwright');
const B = process.argv[2] || 'http://localhost:4173';
const chromium = B.startsWith('http://localhost') ? raw : require('./open-site.js')(raw);
const O = '/tmp/shots/'; require('fs').mkdirSync(O, { recursive: true });
(async () => {
  const br = await chromium.launch(); const errors = [];
  const p = await br.newPage({ viewport: { width: 1440, height: 950 } });
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(B + '/dashboard/#lab'); await p.waitForSelector('.react-flow__node', { timeout: 20000 }); await p.waitForTimeout(800);
  await p.locator('.react-flow__node', { hasText: 'Database' }).first().click(); await p.waitForSelector('.lab-ins');
  const engine = p.locator('.lab-ins select').first();
  console.log('engines:', (await engine.locator('option').allInnerTexts()).join(' | '));
  console.log('groups:', (await engine.locator('optgroup').evaluateAll((g) => g.map((x) => x.label))).join(', '));
  await engine.selectOption('dynamodb'); await p.waitForTimeout(300);
  const ins = async () => (await p.locator('.lab-ins').innerText()).replace(/\n+/g, ' / ');
  let t = await ins();
  console.log('dynamo: size field?', /SIZE/.test(t), '| price:', (t.match(/Price \/ [^/]+/) || [''])[0], '| zones note:', /three zones/.test(t), '| good at:', (t.match(/Good at:[^/]+/) || [''])[0]);
  console.log('node:', (await p.locator('.react-flow__node', { hasText: 'Database' }).first().innerText()).replace(/\n/g, ' | '));
  await p.locator('.lab-ins').screenshot({ path: O + 'engine-dynamo.png' });
  await engine.selectOption('mongodb'); await p.waitForTimeout(300); t = await ins();
  const size = p.locator('.lab-ins select').nth(2);
  console.log('mongo sizes:', (await p.locator('.lab-ins select').evaluateAll((ss) => ss.map((s) => [...s.options].map((o) => o.value).join(',')))).filter((x) => x.includes('docdb')).join(''));
  console.log('mongo multi-az box:', await p.locator('.lab-ins .lab-check', { hasText: 'Multi-AZ' }).count(), '| replicas:', /READ REPLICAS/.test(t));
  console.log('node:', (await p.locator('.react-flow__node', { hasText: 'Database' }).first().innerText()).replace(/\n/g, ' | '));
  // run the design for a moment
  await p.locator('button', { hasText: /^▶|Run/ }).first().click().catch(() => {}); await p.waitForTimeout(2500);
  console.log('status:', (await p.locator('.lab-status').innerText().catch(() => '')).slice(0, 160));
  console.log('errors:', JSON.stringify(errors));
  await br.close();
})();
