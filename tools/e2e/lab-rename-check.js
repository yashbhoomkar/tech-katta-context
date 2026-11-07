// Rename a component in the Lab: the canvas, the panel, the "Connect to" menu, and a reload keep it.
const { chromium: raw } = require('playwright');
const B = process.argv[2] || 'http://localhost:4173';
const chromium = B.startsWith('http://localhost') ? raw : require('./open-site.js')(raw);
(async () => {
  const br = await chromium.launch(); const errors = [];
  const p = await br.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(B + '/dashboard/#lab'); await p.waitForSelector('.react-flow__node', { timeout: 20000 }); await p.waitForTimeout(800);
  await p.locator('.react-flow__node', { hasText: 'Server' }).first().click(); await p.waitForSelector('.lab-ins');
  const box = p.locator('.lab-ins input[type=text]').first();
  console.log('placeholder:', await box.getAttribute('placeholder'));
  await box.fill('Orders API'); await box.blur(); await p.waitForTimeout(500);
  console.log('canvas:', (await p.locator('.react-flow__node', { hasText: 'Orders API' }).first().innerText()).replace(/\n/g, ' | '));
  console.log('panel title:', await p.locator('.lab-ins h3').innerText());
  await p.waitForTimeout(2500); await p.reload(); await p.waitForSelector('.react-flow__node', { timeout: 20000 }); await p.waitForTimeout(800);
  console.log('after reload:', await p.locator('.react-flow__node', { hasText: 'Orders API' }).count());
  // clearing the name brings back the kind
  await p.locator('.react-flow__node', { hasText: 'Orders API' }).first().click();
  const b2 = p.locator('.lab-ins input[type=text]').first(); await b2.fill(''); await b2.blur(); await p.waitForTimeout(300);
  console.log('cleared:', await p.locator('.react-flow__node', { hasText: 'Orders API' }).count());
  console.log('errors:', JSON.stringify(errors));
  await br.close();
})();
