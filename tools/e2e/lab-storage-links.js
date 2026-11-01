const{chromium}=require('playwright');const B=process.argv[2];
(async()=>{const br=await chromium.launch();const errors=[];
for(const [label,raw] of [["garbage","{not json"],["wrong shape",'{"designs":[1,2,3]}'],["proto ids",'{"current":"constructor","designs":{"__proto__":{"name":"P","nodes":[{"id":"a","type":"constructor"},{"id":"c","type":"client","x":0,"y":0}],"edges":[]}}}'],["bad design",'{"current":"a","designs":{"a":{"name":"Mine","nodes":[{"id":"c","type":"client","config":{"rps":"lots"}},{"id":"x","type":"alien"},{"id":"s","type":"server","x":300,"y":0,"config":{"size":"nope"}}],"edges":[{"from":"c","to":"s"},{"from":"s","to":"c"},{"from":"c","to":"ghost"}]}}}']]){
 const ctx=await br.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>errors.push(label+': '+e.message));p.on('console',m=>m.type()==='error'&&errors.push(label+': '+m.text()));
 await p.addInitScript(([r])=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('tk-lab-v1',r);localStorage.setItem('tk-lab-speed','999');sessionStorage.setItem('seeded','1')}},[raw]);
 await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.react-flow__node',{timeout:15000});
 const n=await p.locator('.react-flow__node').count(),e=await p.locator('.react-flow__edge').count();
 const speed=await p.locator('select').first().inputValue().catch(()=>'?');
 await p.waitForTimeout(700);const saved=JSON.parse(await p.evaluate(()=>localStorage.getItem('tk-lab-v1')));
 console.log(label,'| nodes',n,'edges',e,'| saved version',saved.version,'| speed select',speed);await ctx.close()}
const ctx=await br.newContext();const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
await p.goto(B+'/');await p.waitForSelector('.card');
const cards=await p.$$eval('.card .card-foot a',a=>a.map(x=>x.getAttribute('href')));const notes=await p.$$eval('.note',a=>a.map(x=>x.getAttribute('href')));const all=await p.getAttribute('.text-link','href');
console.log('card links',cards.join(' '),'| notes',[...new Set(notes)].join(' '),'| all',all);
await p.click('.card .card-foot a');await p.waitForURL(/dashboard/);await p.waitForSelector('h1');console.log('after click:',p.url(),'| h1',await p.textContent('h1'));
await p.goto(B+'/');await p.waitForSelector('.note');await p.click('.note');await p.waitForURL(/dashboard/);await p.waitForSelector('h1');console.log('note click:',p.url(),'| h1',await p.textContent('h1'));
console.log('errors',JSON.stringify(errors));await br.close()})();
