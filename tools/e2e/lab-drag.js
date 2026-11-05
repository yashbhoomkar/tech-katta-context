const {chromium,devices}=require('playwright');(async()=>{const B=(process.argv[2]||'https://tech.katta.cc').replace(/\/$/,'');const b=await require('./open-site.js')(chromium).launch();
const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.lab .react-flow__node');await p.evaluate(()=>localStorage.removeItem('tk-lab-v1'));await p.reload();await p.waitForSelector('.lab .react-flow__node');await p.waitForTimeout(500);
const count=()=>p.locator('.react-flow__node').count();const item=t=>p.locator('.lab-item',{hasText:t});
// 1 mouse drag to a chosen spot
let a=await item('Database').boundingBox(),c=await p.locator('.lab-canvas').boundingBox();const tx=c.x+200,ty=c.y+120;
await p.mouse.move(a.x+30,a.y+20);await p.mouse.down();await p.mouse.move(a.x+80,a.y+40,{steps:5});const ghost=await p.locator('.lab-ghost').count();const hl=await p.evaluate(()=>document.querySelector('.lab-canvas').classList.contains('drop'));await p.mouse.move(tx,ty,{steps:15});await p.mouse.up();await p.waitForTimeout(300);
const nb=await p.locator('.react-flow__node.selected').boundingBox();console.log('mouse drag → nodes',await count(),'| ghost shown',ghost,'| canvas highlight',hl,'| dropped near pointer:',Math.abs(nb.x+nb.width/2-tx)<120&&Math.abs(nb.y+nb.height/2-ty)<90,'| ghost gone',await p.locator('.lab-ghost').count()===0);
// 2 tiny move = tap
a=await item('Server').boundingBox();await p.mouse.move(a.x+30,a.y+20);await p.mouse.down();await p.mouse.move(a.x+32,a.y+21);await p.mouse.up();await p.waitForTimeout(300);console.log('press with 2px move → added (tap):',await count());
// 3 drop outside canvas = nothing
a=await item('Server').boundingBox();await p.mouse.move(a.x+30,a.y+20);await p.mouse.down();await p.mouse.move(a.x+30,a.y+300,{steps:10});await p.mouse.up();await p.waitForTimeout(300);console.log('released outside canvas → unchanged:',await count());
// 4 keyboard
await item('Clients').focus();await p.keyboard.press('Enter');await p.waitForTimeout(300);console.log('keyboard Enter → added:',await count());
// 5 touch drag via CDP
const t=await (await b.newContext({...devices['iPad (gen 7) landscape']})).newPage();await t.goto(B+'/dashboard/#lab');await t.waitForSelector('.lab .react-flow__node');await t.waitForTimeout(600);
const n0=await t.locator('.react-flow__node').count();const ib=await t.locator('.lab-item',{hasText:'API Gateway'}).boundingBox(),cb=await t.locator('.lab-canvas').boundingBox();const cdp=await t.context().newCDPSession(t);
const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
await touch('touchStart',ib.x+30,ib.y+20);for(let i=1;i<=12;i++)await touch('touchMove',ib.x+30+(cb.x+300-ib.x-30)*i/12,ib.y+20+(cb.y+150-ib.y-20)*i/12);await touch('touchEnd');await t.waitForTimeout(400);
console.log('touch drag on iPad → nodes',n0,'→',await t.locator('.react-flow__node').count());
const n1=await t.locator('.react-flow__node').count();await t.locator('.lab-item',{hasText:'Server'}).tap();await t.waitForTimeout(300);console.log('touch tap → nodes',n1,'→',await t.locator('.react-flow__node').count());
console.log('errors',errs);await b.close()})();
