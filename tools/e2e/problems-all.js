// Every problem on a site: the starting design fails Run, and the reference design (with its schemas and
// engines) is Accepted on Submit, with every request test (API call) passing. One line per problem.
// Usage: node problems-all.js <site> [slug …]   (reference designs read from the tech-katta checkout next to this repo)
const { chromium: raw } = require('playwright');
const chromium = require('./open-site.js')(raw);
const fs = require('fs'), path = require('path');
const B = process.argv[2] || 'https://tech.katta.cc';
const dir = path.join(process.env.TK_CONTENT || path.join(__dirname, '../../../tech-katta/content'), 'articles/interview-questions');
const slugs = process.argv.slice(3).length ? process.argv.slice(3) : fs.readdirSync(dir).map((f) => f.replace('.json', '')).filter((s) => JSON.parse(fs.readFileSync(path.join(dir, s + '.json'))).practice);
(async () => {
  const br = await chromium.launch(); const bad = [];
  for (const slug of slugs) {
    const art = JSON.parse(fs.readFileSync(path.join(dir, slug + '.json'), 'utf8')), errors = [];
    const ctx = await br.newContext({ viewport: { width: 1440, height: 950 } });
    let p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(B + '/dashboard/#problems/' + slug); await p.waitForSelector('.react-flow__node', { timeout: 30000 }); await p.waitForTimeout(600);
    // the starting design: Run (example tests) must not pass
    await p.click('.sv-run'); await p.waitForSelector('.sv-console .sv-v', { timeout: 60000 });
    const startV = (await p.locator('.sv-console .sv-v b').innerText()).trim();
    const st = JSON.parse(await p.evaluate(() => localStorage.getItem('tk-lab-v1'))); await p.close();
    Object.assign(st.designs['q-' + slug], { nodes: art.practice.reference.nodes, edges: art.practice.reference.edges, updated: Date.now() });
    await ctx.close();
    const ctx2 = await br.newContext({ viewport: { width: 1440, height: 950 } });
    await ctx2.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('tk-lab-v1', v); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(st));
    p = await ctx2.newPage(); p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(B + '/dashboard/#problems/' + slug); await p.waitForSelector('.react-flow__node', { timeout: 30000 }); await p.waitForTimeout(800);
    await p.click('.sv-submit'); await p.waitForSelector('.sv-console .sv-v', { timeout: 120000 }); await p.waitForTimeout(300);
    const v = (await p.locator('.sv-console .sv-v').innerText()).replace(/\n+/g, ' | ');
    const rows = await p.locator('.sv-results > li').evaluateAll((ls) => ls.map((l) => ({ ok: l.classList.contains('ok'), t: l.querySelector('summary')?.innerText.replace(/\n+/g, ' ') || '' })));
    const req = rows.filter((r) => / → \d{3}/.test(r.t)), reqOk = req.filter((r) => r.ok).length;
    const ok = /^Accepted/.test(v) && reqOk === req.length && req.length > 0 && startV !== 'Accepted' && !/passed/.test(startV.toLowerCase()) && !errors.length;
    if (!ok) bad.push(slug);
    console.log(`${ok ? 'OK ' : 'BAD'} ${slug.padEnd(20)} start: ${startV.padEnd(14)} reference: ${v.split(' | ').slice(0, 2).join(' · ')} · API calls ${reqOk}/${req.length}${errors.length ? ' · errors ' + JSON.stringify(errors) : ''}${ok ? '' : '\n    ' + rows.filter((r) => !r.ok).map((r) => r.t).join('\n    ')}`);
    await ctx2.close();
  }
  console.log(bad.length ? `FAILED: ${bad.join(', ')}` : `all ${slugs.length} problems OK`);
  await br.close();
})();
