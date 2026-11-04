// Landing page with the real Lab: sections (hero, IND vs PAK Lab, library; no "did you know"), hero
// buttons, the embedded Lab loads the IND vs PAK challenge (no Designs/Challenges menus, an "Open in
// the full Lab" link), the starting design scores 0 stars, then add a CDN, rewire the arrows by
// dragging handles, add servers and score 3 stars. Also: the "Did you know" dashboard tab.
const{chromium}=require('playwright');const B=process.argv[2]||'https://tech.katta.cc';
// The landing Lab is locked until sign-in (#154; tested by landing-lock.js). Here the API's sign-in
// config is answered with "off", which opens the Lab exactly as when sign-in is disabled.
const signInOff=c=>c.route('**/v1/auth/config',r=>r.fulfill({contentType:'application/json',body:'{"enabled":false}',headers:{'access-control-allow-origin':new URL(B).origin,'access-control-allow-credentials':'true'}}));
(async()=>{const br=await chromium.launch();const ctx0=await br.newContext({viewport:{width:1440,height:900}});await signInOff(ctx0);const p=await ctx0.newPage();const errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&errors.push(m.text()));
await p.goto(B+'/');await p.waitForSelector('.hero h1');
console.log('sections:',await p.$$eval('main > section',a=>a.map(s=>s.id||s.className.split(' ')[0]).join(', ')),'| fact on landing:',await p.locator('#fact').count());
console.log('hero buttons:',(await p.$$eval('.hero .btn',a=>a.map(x=>x.textContent.trim()+' '+x.getAttribute('href')))).join(' | '));
await p.click('.hero .btn >> nth=1');await p.waitForSelector('#ind-vs-pak .react-flow__node',{timeout:20000});
const lab='#ind-vs-pak ';console.log('design:',await p.inputValue(lab+'.lab-name'),'| designs menu:',await p.locator(lab+'.lab-designs-btn').count(),'| open link:',await p.getAttribute(lab+'.lab-open','href'));
await p.click(lab+'.lab-score-btn');await p.waitForSelector('.lab-score');console.log('start:',(await p.innerText('.lab-score')).replace(/\n/g,' ').slice(0,200));await p.click('text=Keep improving');
const n=id=>p.locator(`${lab}.react-flow__node[data-id="${id}"]`);
await p.click(lab+'.lab-item:has-text("CDN")');await p.waitForTimeout(300);const cdnId=await p.$eval(lab+'.react-flow__node.selected',e=>e.getAttribute('data-id'));
// remove viewers → lb
const e0=await p.locator(lab+'.react-flow__edge-interaction').first().boundingBox();await p.mouse.click(e0.x+e0.width/2,e0.y+e0.height/2);await p.waitForTimeout(200);await p.click(lab+'.lab-edge-x');
const drag=async(from,to)=>{const a=await n(from).locator('.react-flow__handle.source').boundingBox(),b=await n(to).locator('.react-flow__handle.target').boundingBox();await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:12});await p.mouse.up();await p.waitForTimeout(200)};
await drag('viewers',cdnId);await drag(cdnId,'lb');console.log('arrows now:',await p.locator(lab+'.react-flow__edge').count());
await n('origin').click();await p.fill(lab+'.lab-f:has-text("Instances") input[type=number]','40');await p.click(lab+'.react-flow__pane',{position:{x:30,y:30}});await p.waitForTimeout(200);
await p.click(lab+'.lab-score-btn');await p.waitForSelector('.lab-score');console.log('fixed:',(await p.innerText('.lab-score')).replace(/\n/g,' ').slice(0,230));
await p.screenshot({path:'/tmp/shots/landing-lab.png'});await p.click('text=Keep improving');
await p.goto(B+'/dashboard/#did-you-know');await p.waitForSelector('.d-fact');
console.log('dashboard tab:',await p.innerText('h1'),'| sidebar link:',await p.locator('.side-link[href="#did-you-know"]').count(),'| top tab:',await p.locator('.tabs a[href="#did-you-know"]').count(),'| points:',await p.locator('.d-fact li').count());
console.log('errors:',JSON.stringify(errors));await br.close()})();
