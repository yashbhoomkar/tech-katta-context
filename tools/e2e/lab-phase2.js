const{chromium}=require('playwright');const B=process.argv[2];
(async()=>{const br=await require('./open-site.js')(chromium).launch();const ctx=await br.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();const errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&errors.push(m.text()));
const N=(id,type,x,y,config={})=>({id,type,x,y,config});
const d={id:"p2",name:"Phase 2",updated:Date.now(),credit:{spent:0,hours:0},nodes:[N("c","client",0,100,{rps:500}),N("lb","lb",220,100),N("api","server",440,100,{size:"m5.large",count:2,queriesPerRequest:2}),N("k","cache",660,0,{hitPct:80,writePct:10}),N("db","database",880,0,{size:"db.t3.medium"}),N("q","queue",660,220),N("w","server",880,220,{size:"t3.medium",count:1,queriesPerRequest:1})],
edges:[{from:"c",to:"lb"},{from:"lb",to:"api"},{from:"api",to:"k"},{from:"k",to:"db"},{from:"api",to:"q"},{from:"q",to:"w"},{from:"w",to:"db"}]};
await p.addInitScript(([s])=>{if(!sessionStorage.getItem('x')){localStorage.setItem('tk-lab-v1',s);sessionStorage.setItem('x',1)}},[JSON.stringify({version:1,current:"p2",designs:{p2:d}})]);
await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.react-flow__node');
const pal=await p.$$eval('.lab-item span',a=>a.map(x=>x.textContent));console.log('palette:',pal.join(', '));
console.log('nodes',await p.locator('.react-flow__node').count(),'edges',await p.locator('.react-flow__edge').count());
await p.click('text=▶ Run traffic');await p.waitForTimeout(2500);
const txt=async id=>(await p.locator(`.react-flow__node[data-id="${id}"]`).innerText()).replace(/\n/g,' | ');
for(const id of ["lb","k","db","q","w"])console.log(id,':',await txt(id));
console.log('status:',(await p.innerText('.lab-status')).replace(/\n/g,' | '));
// faster clock to see backlog grow, then inspect the queue
await p.selectOption('select >> nth=0',{index:2});await p.waitForTimeout(2000);
await p.locator('.react-flow__node[data-id="q"]').click();await p.waitForTimeout(300);
console.log('queue panel:',(await p.innerText('.lab-ins')).replace(/\n/g,' | ').slice(0,400));
await p.locator('.react-flow__node[data-id="k"]').click();await p.waitForTimeout(300);
console.log('cache panel:',(await p.innerText('.lab-ins')).replace(/\n/g,' | ').slice(0,420));
await p.click('.react-flow__pane',{position:{x:50,y:600}});await p.waitForTimeout(300);
console.log('log:',(await p.locator('.lab-log').innerText().catch(()=>'')).replace(/\n/g,' | ').slice(0,300));
await p.screenshot({path:'/tmp/shots/phase2.png'});
console.log('errors',JSON.stringify(errors));await br.close()})();
