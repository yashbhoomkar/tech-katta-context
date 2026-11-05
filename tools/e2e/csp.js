// Opens every kind of page under the production CSP and reports any violation. The sign-in config is
// stubbed "on" for the landing page (so Google's real script and button load under the policy) and
// "off" elsewhere (so locked pages open).
const { chromium } = require('playwright');
const B = process.argv[2] || 'http://localhost:5430';
const stub = (on) => (r) => r.fulfill({ contentType: 'application/json', body: on ? '{"enabled":true,"clientId":"1084375438071-8ssv8q2lmh8odjb1vsms7va7bpcjmjn8.apps.googleusercontent.com"}' : '{"enabled":false}', headers: { 'access-control-allow-origin': B, 'access-control-allow-credentials': 'true' } });
(async () => {
  const br = await chromium.launch(); const out = [];
  const pages = [['/', true, '.lock-card iframe, .acct-g iframe'], ['/dashboard/', false, '.d-start .cards'], ['/dashboard/#concepts/api-types', false, 'main figure svg'], ['/dashboard/#components/sharding', false, 'main figure svg'], ['/dashboard/#lab', false, '.lab-name'], ['/dashboard/#privacy', false, 'main h1'], ['/analytics/', false, '.a-msg b']];
  for (const [url, on, sel] of pages) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.route('**/v1/auth/config', stub(on));
    const p = await ctx.newPage(); const v = [];
    await p.addInitScript(() => { document.addEventListener('securitypolicyviolation', (e) => { (window.__csp ||= []).push(e.violatedDirective + ' ' + e.blockedURI); }); });
    p.on('console', (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) v.push(m.text().slice(0, 160)); });
    await p.goto(B + url);
    let ok = true; try { await p.waitForSelector(sel, { timeout: 20000 }); } catch { ok = false; }
    await p.waitForTimeout(2500);
    const ev = await p.evaluate(() => window.__csp || []);
    out.push([url, ok ? 'rendered' : 'NOT RENDERED (' + sel + ')', [...new Set([...v, ...ev])]]);
    await ctx.close();
  }
  for (const o of out) console.log(o[0], '|', o[1], '| violations:', JSON.stringify(o[2]));
  await br.close();
})();
