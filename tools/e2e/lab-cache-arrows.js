// Cache behaviour and arrow removal. A write-back cache pushed past 150% crashes: the run log
// reports lost writes, the canvas says its queries go to the database, and it comes back empty and
// warms up. Then arrows: click to select (✕ on the arrow, "Arrow" panel), remove with ✕, with the
// panel button, and with the Delete key.
const{chromium}=require('playwright');const B=process.argv[2]||'https://tech.katta.cc';
(async()=>{const br=await chromium.launch();const p=await (await br.newContext({viewport:{width:1440,height:900}})).newPage();const errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&errors.push(m.text()));
const N=(id,type,x,y,config={})=>({id,type,x,y,config});
const d={id:"k",name:"Cache crash",updated:Date.now(),credit:{spent:0,hours:0},nodes:[N("c","client",0,0,{rps:16000}),N("s","server",240,0,{size:"c5.2xlarge",count:8,queriesPerRequest:2}),N("k","cache",480,0,{hitPct:80,writePct:50,writePolicy:"back"}),N("db","database",720,0,{size:"db.r5.2xlarge"})],
  edges:[{from:"c",to:"s"},{from:"s",to:"k"},{from:"k",to:"db"}]};
await p.addInitScript(([s])=>{if(!sessionStorage.getItem('x')){localStorage.setItem('tk-lab-v1',s);localStorage.setItem('tk-lab-speed',String(1/60));sessionStorage.setItem('x',1)}},[JSON.stringify({version:1,current:"k",designs:{k:d}})]);
await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.react-flow__node');
const txt=async id=>(await p.locator(`.react-flow__node[data-id="${id}"]`).innerText()).replace(/\n/g,' | ');
await p.locator('.react-flow__node[data-id="k"]').click();await p.waitForTimeout(200);
console.log('cache panel selects:',JSON.stringify(await p.$$eval('.lab-ins select',a=>a.map(s=>s.value))));
await p.click('.react-flow__pane',{position:{x:60,y:700}});
await p.click('text=▶ Run traffic');await p.waitForTimeout(7000);
console.log('crashed:',await txt('k'));console.log('db while cache down:',await txt('db'));
await p.waitForTimeout(10000);console.log('after restart:',await txt('k'));await p.click('text=■ Stop');
console.log('design panel:',(await p.innerText('.lab-ins')).replace(/\n/g,' | ').slice(0,200));
console.log('log:',(await p.locator('.lab-log').innerText()).replace(/\n/g,' | ').slice(0,420));
await p.screenshot({path:'/tmp/shots/cache.png'});
// arrows
const count=()=>p.locator('.react-flow__edge').count();
console.log('arrows:',await count());
const clickEdge=async i=>{const b=await p.locator('.react-flow__edge-interaction').nth(i).boundingBox();await p.mouse.click(b.x+b.width/2,b.y+b.height/2);await p.waitForTimeout(250)};
await clickEdge(2);console.log('selected → ✕ shown:',await p.locator('.lab-edge-x').count(),'| panel:',(await p.innerText('.lab-ins')).split('\n').slice(0,2).join(' '));
await p.screenshot({path:'/tmp/shots/arrow-selected.png'});
await p.click('.lab-edge-x');await p.waitForTimeout(250);console.log('after ✕:',await count());
await clickEdge(1);await p.click('text=Remove arrow');await p.waitForTimeout(250);console.log('after panel button:',await count());
await clickEdge(0);await p.keyboard.press('Delete');await p.waitForTimeout(250);console.log('after Delete key:',await count(),'| nodes still',await p.locator('.react-flow__node').count());
await p.waitForTimeout(800);await p.reload();await p.waitForSelector('.react-flow__node');await p.waitForTimeout(500);console.log('after reload (autosaved):',await count());
console.log('errors:',JSON.stringify(errors));await br.close()})();
