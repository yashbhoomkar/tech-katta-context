// Regression for the QA findings on challenge scoring (H1, M2, M3, M4): on the landing page's IND vs
// PAK Lab, a CDN with nothing behind it scores 0 stars with a message saying what's missing; the CDN
// panel shows the challenge's fixed settings locked; Run starts at 19:00 (the challenge's hour);
// the challenge panel ticks the goals that were met, not the first N.
const{chromium}=require('playwright');const B=process.argv[2]||'https://tech.katta.cc';
(async()=>{const br=await require('./open-site.js')(chromium).launch();const p=await (await br.newContext({viewport:{width:1440,height:900}})).newPage();const errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&errors.push(m.text()));
const L='#ind-vs-pak ';await p.goto(B+'/#ind-vs-pak');await p.waitForSelector(L+'.react-flow__node',{timeout:20000});await p.locator(L+'.lab-canvas').scrollIntoViewIfNeeded();await p.waitForTimeout(800);
const n=id=>p.locator(`${L}.react-flow__node[data-id="${id}"]`);
const e0=await p.locator(L+'.react-flow__edge-interaction').first().boundingBox();await p.mouse.click(e0.x+e0.width/2,e0.y+e0.height/2);await p.waitForTimeout(200);await p.click(L+'.lab-edge-x');await p.waitForTimeout(200);
await p.click(L+'.lab-item:has-text("CDN")');await p.waitForTimeout(300);const cdn=await p.$eval(L+'.react-flow__node.selected',e=>e.getAttribute('data-id'));
console.log('cdn panel:',(await p.innerText(L+'.lab-ins')).split('\n').filter(x=>/edge|Live/i.test(x)).join(' | '),'| hit input disabled:',await p.isDisabled(L+'.lab-ins input[type=number]'),'| value',await p.inputValue(L+'.lab-ins input[type=number]'));
const drag=async(a,b)=>{const s=await n(a).locator('.react-flow__handle.source').boundingBox(),t=await n(b).locator('.react-flow__handle.target').boundingBox();await p.mouse.move(s.x+s.width/2,s.y+s.height/2);await p.mouse.down();await p.mouse.move(t.x+t.width/2,t.y+t.height/2,{steps:10});await p.mouse.up();await p.waitForTimeout(200)};
await drag('viewers',cdn);await p.click(L+'.react-flow__pane',{position:{x:30,y:30}});
await p.click(L+'.lab-score-btn');await p.waitForSelector('.lab-score');console.log('cdn-only score:',(await p.innerText('.lab-score')).replace(/\n/g,' ').slice(0,260));await p.click('text=Keep improving');
await p.click(L+'.lab-btn.run');await p.waitForTimeout(1200);console.log('run clock:',(await p.innerText(L+'.lab-status')).split('\n')[0]);await p.click(L+'.lab-btn.run');
// fix it: CDN -> LB, 34 servers (buffers in the last over: 2 stars, goals 1 and 2)
await drag(cdn,'lb');await n('origin').click();await p.fill(L+'.lab-f:has-text("Instances") input[type=number]','34');await p.click(L+'.react-flow__pane',{position:{x:30,y:30}});
await p.click(L+'.lab-score-btn');await p.waitForSelector('.lab-score');console.log('34 servers:',(await p.innerText('.lab-score .lab-goals')).replace(/\n/g,' '));await p.click('text=Keep improving');await p.waitForTimeout(300);
console.log('panel ticks:',(await p.$$eval(L+'.lab-ch .lab-goals li',a=>a.map(x=>x.className||'-'))).join(','));
console.log('errors:',JSON.stringify(errors));await br.close()})();
