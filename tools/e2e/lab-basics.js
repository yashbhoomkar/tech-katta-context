const {chromium}=require('playwright');(async()=>{const B=(process.argv[2]||'https://tech.katta.cc').replace(/\/$/,'');const b=await require('./open-site.js')(chromium).launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.lab .react-flow__node',{timeout:20000});await p.waitForTimeout(800);
console.log('tabs:',(await p.locator('.tab').allInnerTexts()).join(' | '),'| nodes:',await p.locator('.react-flow__node').count(),'| edges:',await p.locator('.react-flow__edge').count());
console.log('budget:',await p.innerText('.lab-budget span'));await p.screenshot({path:'/tmp/shots/lab1.png'});
await p.click('.lab-btn.run');await p.waitForTimeout(700);console.log('status:',(await p.innerText('.lab-status')).replace(/\n/g,' | '));await p.screenshot({path:'/tmp/shots/lab2.png'});
// select clients, raise traffic to 1800
await p.locator('.react-flow__node').filter({hasText:'Clients'}).click();await p.fill('.lab-f input[type=number]','1800');await p.waitForTimeout(500);
console.log('at 1800:',(await p.innerText('.lab-status')).replace(/\n/g,' | '));await p.locator('.react-flow__node').filter({hasText:'Server'}).click();await p.waitForTimeout(300);await p.screenshot({path:'/tmp/shots/lab3.png'});
// add a server via palette click, then count
const before=await p.locator('.react-flow__node').count();await p.locator('.lab-item',{hasText:'Server'}).click();await p.waitForTimeout(300);console.log('palette add:',before,'→',await p.locator('.react-flow__node').count());
// drag and drop a database from the palette
const box=await p.locator('.lab-canvas').boundingBox();await p.locator('.lab-item',{hasText:'Database'}).dragTo(p.locator('.lab-canvas'),{targetPosition:{x:200,y:box.height-120}});await p.waitForTimeout(300);console.log('drag add:',await p.locator('.react-flow__node').count());
await p.waitForTimeout(600);console.log('saved designs:',await p.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('tk-lab-v1')).designs).map(d=>d.name+':'+d.nodes.length).join(',')));
await p.reload();await p.waitForSelector('.lab .react-flow__node');await p.waitForTimeout(500);console.log('after reload nodes:',await p.locator('.react-flow__node').count());
await p.click('text=Designs ▾');await p.click('text=+ New design');await p.waitForTimeout(500);console.log('new design nodes:',await p.locator('.react-flow__node').count(),'| status:',await p.innerText('.lab-status'));
await p.click('text=Designs ▾');await p.waitForTimeout(200);await p.screenshot({path:'/tmp/shots/lab4.png'});console.log('designs listed:',await p.locator('.lab-menu li').count());
console.log('errors:',errs);await b.close()})();
