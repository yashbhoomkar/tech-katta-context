// Time-based traffic and autoscaling: a lunch-and-dinner pattern with an autoscaled server group
// (scales out for the dinner peak, cost rises), the day chart in the Clients panel, and a flash sale
// that crashes a fixed-size group.
const{chromium}=require('playwright');const B=process.argv[2]||'https://tech.katta.cc';
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();const errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&errors.push(m.text()));
const N=(id,type,x,y,config={})=>({id,type,x,y,config});
const design=(id,name,hours,client,server)=>({id,name,updated:Date.now(),credit:{spent:0,hours},nodes:[N("c","client",0,0,client),N("gw","apigw",220,0),N("api","server",440,0,server),N("db","database",660,0,{size:"db.r5.2xlarge"})],edges:[{from:"c",to:"gw"},{from:"gw",to:"api"},{from:"api",to:"db"}]});
const store={version:1,current:"auto",designs:{auto:design("auto","Dinner rush",18,{rps:2000,pattern:"meals"},{size:"m5.large",count:2,maxCount:10,autoscale:true,queriesPerRequest:2}),
  sale:design("sale","Flash sale",19.75,{rps:2400,pattern:"sale"},{size:"m5.large",count:2,queriesPerRequest:2})}};
await p.addInitScript(([s])=>{if(!sessionStorage.getItem('x')){localStorage.setItem('tk-lab-v1',s);localStorage.setItem('tk-lab-speed',String(1));sessionStorage.setItem('x',1)}},[JSON.stringify(store)]);
await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.react-flow__node');
const txt=async id=>(await p.locator(`.react-flow__node[data-id="${id}"]`).innerText()).replace(/\n/g,' | ');
const status=async()=>(await p.innerText('.lab-status')).replace(/\n/g,' | ');
console.log('before:',await txt('c'),'||',await txt('api'),'||',(await p.innerText('.lab-burn')));
await p.locator('.react-flow__node[data-id="c"]').click();await p.waitForTimeout(200);
console.log('pattern:',await p.locator('.lab-ins select').inputValue(),'| chart:',await p.locator('.lab-day svg').count(),'|',await p.innerText('.lab-day figcaption'));
await p.click('.react-flow__pane',{position:{x:60,y:700}});
await p.click('text=▶ Run traffic');
const seen=[];for(let i=0;i<12;i++){await p.waitForTimeout(250*4);seen.push((await status()).split(' | ').slice(0,2).join(' '))}
console.log('status over time:',seen.join(' → '));
console.log('server:',await txt('api'));console.log('burn now:',await p.innerText('.lab-burn'));
await p.click('text=■ Stop');
console.log('log:',(await p.locator('.lab-log').innerText().catch(()=>'')).replace(/\n/g,' | ').slice(0,360));
await p.locator('.react-flow__node[data-id="api"]').click();await p.waitForTimeout(200);
console.log('server panel:',(await p.innerText('.lab-ins')).replace(/\n/g,' | ').slice(0,520));
await p.screenshot({path:'/tmp/shots/traffic-auto.png'});
// flash sale on a fixed group
await p.click('text=Designs ▾');await p.click('.lab-menu >> text=Flash sale');await p.waitForTimeout(400);
await p.selectOption('.lab-speed select',{index:1});await p.click('text=▶ Run traffic');await p.waitForTimeout(3600);await p.click('text=■ Stop');
await p.click('.react-flow__pane',{position:{x:60,y:700}});await p.waitForTimeout(200);
console.log('sale status:',await status());
console.log('sale log:',(await p.locator('.lab-log').innerText().catch(()=>'')).replace(/\n/g,' | ').slice(0,300));
await p.screenshot({path:'/tmp/shots/traffic-sale.png'});
console.log('errors:',JSON.stringify(errors));await br.close()})();
