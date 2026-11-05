// Regression for the QA findings on saving (H3, H4, H7, M1): two tabs don't overwrite each other's
// designs; credit spent while running survives a reload; the landing page's Lab doesn't change the
// design the full Lab opens, and a first visit creates one design; blocked storage doesn't blank
// the dashboard.
const{chromium}=require('playwright');const B=process.argv[2]||'https://tech.katta.cc';
(async()=>{const br=await require('./open-site.js')(chromium).launch();const errors=[];const watch=p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&errors.push(m.text()));return p};
const stored=p=>p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('tk-lab-v1')||'{}');return{current:s.current,designs:Object.values(s.designs||{}).map(d=>({name:d.name,n:d.nodes.length,spent:Math.round(d.credit?.spent||0)}))}});
// 1. first visit to the landing page: one design, current not set by the embed
let ctx=await br.newContext({viewport:{width:1440,height:900}});let p=watch(await ctx.newPage());
await p.goto(B+'/#ind-vs-pak');await p.waitForSelector('#ind-vs-pak .react-flow__node',{timeout:20000});await p.waitForTimeout(800);
let s=await stored(p);console.log('landing first visit:',s.designs.map(d=>d.name).join(','),'| designs',s.designs.length);
// 2. my own design stays the one the full Lab opens
await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.lab-name');await p.click('text=Designs ▾');await p.click('text=+ New design');await p.waitForTimeout(300);await p.fill('.lab-name','My own work');await p.click('.lab-item:has-text("Clients")');await p.waitForTimeout(800);
await p.goto(B+'/#ind-vs-pak');await p.waitForSelector('#ind-vs-pak .react-flow__node',{timeout:20000});await p.waitForTimeout(800);
await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.lab-name');await p.waitForTimeout(300);console.log('full Lab opens after the landing page:',await p.inputValue('.lab-name'));
// 3. two tabs
const a=p,b=watch(await ctx.newPage());await b.goto(B+'/dashboard/#lab/flash-sale');await b.waitForSelector('.lab-ch');await b.waitForTimeout(800);
await a.click('.lab-item:has-text("Cache")');await a.waitForTimeout(900);
await b.locator('.react-flow__node').first().click();await b.click('.lab-item:has-text("Queue")');await b.waitForTimeout(900);
s=await stored(a);console.log('two tabs:',s.designs.map(d=>`${d.name}=${d.n}`).join(', '));
await b.close();
// 4. credit spent while running survives a reload
await a.click('text=Designs ▾');await a.click('text=+ Example: Zotato order API');await a.waitForTimeout(500);await a.selectOption('.lab-speed select',{index:4});await a.click('.lab-btn.run');await a.waitForTimeout(3200);const before=await a.innerText('.lab-budget span');await a.reload();await a.waitForSelector('.lab-budget');await a.waitForTimeout(300);
console.log('credit before reload:',before.split(' ')[0],'| after:',(await a.innerText('.lab-budget span')).split(' ')[0]);
await ctx.close();
// 5. storage that throws
ctx=await br.newContext({viewport:{width:1440,height:900}});await ctx.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError')}})});p=await ctx.newPage();const blockedErr=[];p.on('pageerror',e=>blockedErr.push(e.message));
await p.goto(B+'/dashboard/');await p.waitForTimeout(2500);console.log('storage blocked → dashboard h1:',await p.locator('h1').first().innerText().catch(()=>'(none)'),'| page errors',blockedErr.length);
await ctx.close();console.log('errors:',JSON.stringify(errors));await br.close()})();
