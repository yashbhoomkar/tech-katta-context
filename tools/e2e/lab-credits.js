const {chromium}=require('playwright');(async()=>{const b=await require('./open-site.js')(chromium).launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const B=(process.argv[2]||'https://tech.katta.cc').replace(/\/$/,'');const status=async()=>(await p.innerText('.lab-status')).replace(/\n/g,' | ');const credit=async()=>(await p.innerText('.lab-budget')).replace(/\n/g,' | ');
await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.lab .react-flow__node');await p.evaluate(()=>localStorage.removeItem('tk-lab-v1'));await p.reload();await p.waitForSelector('.lab .react-flow__node');await p.waitForTimeout(600);
for(let i=0;i<3;i++){await p.locator('.lab-item',{hasText:'Clients'}).click();await p.waitForTimeout(250)}
const rects=await p.locator('.react-flow__node').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return{t:n.innerText.split('\n')[1],x:r.x,y:r.y,w:r.width,h:r.height}}));
const overlap=rects.some((a,i)=>rects.some((c,j)=>i<j&&a.x<c.x+c.w&&c.x<a.x+a.w&&a.y<c.y+c.h&&c.y<a.y+a.h));console.log('nodes:',rects.length,'| any overlap:',overlap);
await p.locator('.react-flow__controls-fitview').click();await p.waitForTimeout(400);
const cl=p.locator('.react-flow__node').filter({hasText:'TRAFFIC'});const gwIn=p.locator('.react-flow__node').filter({hasText:'API Gateway'}).locator('.react-flow__handle-left');
for(let i=1;i<await cl.count();i++){const h=cl.nth(i).locator('.react-flow__handle-right');const a=await h.boundingBox(),g=await gwIn.boundingBox();await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(g.x+g.width/2,g.y+g.height/2,{steps:12});await p.mouse.up();await p.waitForTimeout(150)}
console.log('edges:',await p.locator('.react-flow__edge').count());await p.screenshot({path:'/tmp/shots/ref1.png'});
console.log('before run:',await status(),'||',await credit());
await p.selectOption('.lab-speed select','168');await p.click('.lab-btn.run');await p.waitForTimeout(3000);console.log('after 3s @1 week/s:',await status(),'||',await credit());await p.screenshot({path:'/tmp/shots/ref2.png'});
await p.click('.lab-btn.run');const c1=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('tk-lab-v1'));return d.designs[d.current].credit});await p.waitForTimeout(600);
const c2=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('tk-lab-v1'));return d.designs[d.current].credit});console.log('saved credit:',JSON.stringify(c2));
await p.reload();await p.waitForSelector('.lab .react-flow__node');await p.waitForTimeout(500);console.log('after reload:',await credit());
// make it expensive and run to exhaustion
const srv=p.locator('.react-flow__node').filter({hasText:'COMPUTE'});await srv.click();await p.selectOption('.lab-f select','c5.2xlarge');await p.fill('.lab-ins input[type=number]','50');await p.waitForTimeout(300);console.log('expensive:',await credit());
await p.click('.lab-btn.run');await p.waitForFunction(()=>document.querySelector('.lab-status').innerText.includes('used up'),null,{timeout:60000});console.log('exhausted:',await status(),'|| run disabled:',await p.locator('.lab-btn.run').isDisabled());await p.screenshot({path:'/tmp/shots/ref3.png'});
await p.click('text=Designs ▾');await p.locator('.lab-menu li').first().locator('button[title="Duplicate with fresh credit"]').click();await p.waitForTimeout(500);console.log('duplicate:',await p.inputValue('.lab-name'),'||',await credit(),'|| nodes',await p.locator('.react-flow__node').count());
console.log('errors:',errs);await b.close()})();
