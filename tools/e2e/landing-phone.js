// Landing page on a phone (QA H5, H6): the IND vs PAK challenge is the three-control version (no
// canvas, so swiping scrolls the page), its controls work by tap, it scores 0 then 3 stars, the
// stars reach the dashboard's Learn path, and nothing overflows. On a laptop width the full Lab shows.
const{chromium,devices}=require('playwright');const B=process.argv[2]||'https://tech.katta.cc';
(async()=>{const br=await chromium.launch();const ctx=await br.newContext(devices['iPhone 13']);const p=await ctx.newPage();const errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&errors.push(m.text()));
await p.goto(B+'/');await p.waitForSelector('#ind-vs-pak');await p.evaluate(()=>document.querySelector('#ind-vs-pak').scrollIntoView());await p.waitForSelector('.ll-flow',{timeout:20000});
console.log('phone version:',await p.locator('.ll').count(),'| canvas:',await p.locator('#ind-vs-pak .react-flow').count());
const y0=await p.evaluate(()=>scrollY);const box=await p.locator('.ll-flow').boundingBox();
const cdp=await ctx.newCDPSession(p);const touch=async(type,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x:box.x+box.width/2,y}]});
await touch('touchStart',box.y+box.height-10);for(let i=1;i<=10;i++)await touch('touchMove',box.y+box.height-10-i*25);await touch('touchEnd');await p.waitForTimeout(600);
console.log('swipe on the diagram scrolls the page:',y0,'→',await p.evaluate(()=>scrollY));
await p.tap('.ll-score');await p.waitForSelector('.ll-res');console.log('start:',(await p.innerText('.ll-res')).replace(/\n/g,' ').slice(0,140));
await p.tap('.ll-check input');for(let i=0;i<6;i++)await p.tap('.ll-step button >> nth=1');console.log('servers:',await p.innerText('.ll-step output'),'| boxes:',(await p.$$eval('.ll-box b',a=>a.map(x=>x.textContent))).join(' → '));
await p.tap('.ll-score');await p.waitForSelector('.ll-res');console.log('fixed:',(await p.innerText('.ll-res')).replace(/\n/g,' ').slice(0,260));
const touchTargets=await p.$$eval('.ll button, .ll input',a=>a.map(e=>{const r=e.getBoundingClientRect();return Math.round(Math.min(r.width,r.height))}));console.log('smallest control (px):',Math.min(...touchTargets));
console.log('overflow:',await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth));
await p.screenshot({path:'/tmp/shots/landing-phone.png',fullPage:false});
await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.lab-ch-btn');
console.log('stars reach the full Lab:',await p.innerText('.lab-ch-btn'));
const d=await (await br.newContext({viewport:{width:1280,height:800}})).newPage();await d.goto(B+'/#ind-vs-pak');await d.waitForSelector('#ind-vs-pak .react-flow__node',{timeout:20000});console.log('laptop gets the full Lab:',await d.locator('#ind-vs-pak .ll').count()===0);
console.log('errors:',JSON.stringify(errors));await br.close()})();
