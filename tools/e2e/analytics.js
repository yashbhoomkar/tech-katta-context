// Analytics dashboard (analytics.katta.cc) on the local sign-in stack: signed out, a non-admin account,
// then the same account made admin (role in MongoDB): tiles, chart, funnel, tables, range switch, Meta CSV.
// The dashboard runs on a second port standing in for analytics.katta.cc (start the API with
// ANALYTICS_ORIGIN=http://localhost:<that port>).
//   NODE_PATH=tech-katta/backend/node_modules:$(npm root -g) node analytics.js <site> <dashboard> <mint> <uri file> <db> <screenshot dir>
const{chromium}=require('playwright');const{MongoClient}=require('mongodb');const fs=require('fs');
const[SITE,DASH,MINT,UF,DB,OUT]=process.argv.slice(2);
const GIS=`window.google={accounts:{id:{_cb:null,initialize(o){this._cb=o.callback},disableAutoSelect(){},renderButton(el){el.innerHTML='';const b=document.createElement('button');b.type='button';b.className='test-gsi';b.textContent='Continue with Google';b.onclick=async()=>{const t=await (await fetch(window.__mint)).text();window.google.accounts.id._cb({credential:t})};el.appendChild(b)}}}};`;
const SUB=String(9e5+Date.now()%1e5);
(async()=>{const br=await chromium.launch();const mongo=await MongoClient.connect(fs.readFileSync(UF,'utf8').trim());const users=mongo.db(DB).collection('users');const errors=[];
const ctx=await br.newContext({viewport:{width:390,height:844}});await ctx.route('https://accounts.google.com/gsi/client',r=>r.fulfill({contentType:'text/javascript',body:GIS}));
await ctx.addInitScript(m=>{window.__mint=m},`${MINT}/mint?sub=${SUB}&name=Owner%20K&given=Owner&family=K&email=owner%40example.com`);
const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/40[13]/.test(m.text()))errors.push(m.text())});
await p.goto(DASH+'/analytics/');await p.waitForSelector('.a-msg b');console.log('signed out:',await p.innerText('.a-msg b'));
await p.goto(SITE+'/#ind-vs-pak');await p.waitForSelector('.lock-card .test-gsi');await p.check('.lock-card .acct-consent input');await p.click('.lock-card .test-gsi');await p.waitForSelector('.header .acct-btn');
await p.goto(DASH+'/analytics/');await p.waitForSelector('.a-msg b');console.log('not admin:',await p.innerText('.a-msg b'));
await users.updateOne({googleSub:SUB},{$set:{role:'admin'}});
await p.click('.a-refresh').catch(()=>{});await p.reload();await p.waitForSelector('.a-tiles');await p.waitForTimeout(500);
console.log('admin tiles:',(await p.$$eval('.a-tile',a=>a.map(t=>t.querySelector('span').textContent+'='+t.querySelector('b').textContent))).join(' | '));
console.log('cards:',(await p.$$eval('.a-card h2, .a-chart figcaption b',a=>a.map(x=>x.textContent))).join(' | '));
console.log('funnel:',(await p.$$eval('.a-funnel-row',a=>a.map(x=>x.innerText.replace(/\n/g,' ')))).join(' / '));
const ov=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);console.log('phone overflow:',ov);
await p.screenshot({path:OUT+'/dash-phone.png',fullPage:true});
await p.setViewportSize({width:1280,height:900});await p.waitForTimeout(400);await p.screenshot({path:OUT+'/dash-desk.png',fullPage:true});
await p.click('.a-range button:has-text("30 days")');await p.waitForTimeout(800);console.log('30 days sub:',await p.innerText('.a-sub'));
const csv=await p.evaluate(async h=>{const r=await fetch(h,{credentials:'include'});return r.status+' '+(await r.text()).split('\n')[0]},await p.getAttribute('.a-head a','href'));console.log('csv:',csv);
console.log('errors:',JSON.stringify(errors));await mongo.close();await br.close()})();
