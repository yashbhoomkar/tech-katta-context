// Dashboard start page (owner, 11-03): no tab selected; the three library cards (moved from the
// landing page) with their mini diagrams; a card selects its tab in the sidebar and top bar and opens
// the section's first article (or the section while it has none). The landing page no longer has
// the cards. Desktop and iPhone 13, no overflow.
const{chromium,devices}=require('playwright');const B=process.argv[2]||'https://tech.katta.cc';
(async()=>{const br=await chromium.launch();const errors=[];
for(const [n,o] of [["desktop",{viewport:{width:1440,height:900}}],["phone",devices['iPhone 13']]]){const p=await (await br.newContext(o)).newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&errors.push(m.text()));
await p.goto(B+'/dashboard/');await p.waitForSelector('.d-start .card');await p.waitForTimeout(400);
console.log(n,'| tab selected:',await p.locator('.tabs a.active').count(),'| h1:',await p.innerText('.d-start h1'),'| cards:',(await p.$$eval('.d-start .card h3',a=>a.map(x=>x.textContent))).join(', '),'| diagrams:',await p.locator('.d-start .mini svg').count(),'| overflow:',await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth));
if(n==='desktop')await p.screenshot({path:'/tmp/shots/dashboard-home.png'});else await p.screenshot({path:'/tmp/shots/dashboard-home-phone.png',fullPage:true});
for(const i of [0,1,2]){await p.goto(B+'/dashboard/');await p.waitForSelector('.d-start .card');await p.locator('.d-start .card').nth(i).click();await p.waitForTimeout(500);
console.log(n,'card',i,'→',new URL(p.url()).hash,'| active tab:',await p.locator('.tabs a.active').innerText().catch(()=>'-'),'| h1:',await p.locator('main h1').first().innerText())}
await p.goto(B+'/');await p.waitForSelector('.hero h1');console.log(n,'landing sections:',await p.$$eval('main > section',a=>a.map(s=>s.id||'hero').join(', ')),'| cards on landing:',await p.locator('.card').count())}
console.log('errors:',JSON.stringify(errors));await br.close()})();
