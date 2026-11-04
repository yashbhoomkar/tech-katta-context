// Sign in with Google and account sync, across two "devices" (two browser profiles). Needs a local
// stack: the API with sign-in on, MongoDB and a stand-in for Google's keys that can mint tokens
// (auth-stack.mjs; see README "Testing sign-in"). Google's own script is replaced by a stub whose button
// hands the page a token minted for the test user. Usage: node account.js <site> <mint base>
const{chromium}=require('playwright');const B=process.argv[2]||'http://localhost:5411',MINT=process.argv[3]||'http://127.0.0.1:5191';
const GIS=`window.google={accounts:{id:{_cb:null,initialize(o){this._cb=o.callback},disableAutoSelect(){},renderButton(el){el.innerHTML='';const b=document.createElement('button');b.type='button';b.className='test-gsi';b.textContent='Sign in with Google';b.onclick=async()=>{const t=await (await fetch(window.__mint)).text();window.google.accounts.id._cb({credential:t})};el.appendChild(b)}}}};`;
(async()=>{const br=await chromium.launch();const errors=[];
const device=async(name,seed)=>{const ctx=await br.newContext({viewport:{width:1440,height:900}});
  await ctx.route('https://accounts.google.com/gsi/client',r=>r.fulfill({contentType:'text/javascript',body:GIS}));
  await ctx.addInitScript(([m,s])=>{window.__mint=m;if(s&&!sessionStorage.getItem('seeded')){for(const[k,v] of Object.entries(s))localStorage.setItem(k,v);sessionStorage.setItem('seeded','1')}},[`${MINT}/mint?sub=777&name=Asha%20Rao&email=asha%40example.com`,seed||null]);
  const p=await ctx.newPage();p.on('pageerror',e=>errors.push(name+': '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/401/.test(m.text()))errors.push(name+': '+m.text())});return p};
const lab=p=>p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('tk-lab-v1')||'{}');return Object.values(s.designs||{}).map(d=>`${d.name}(${d.nodes.length})`).sort().join(', ')});
const server=p=>p.evaluate(async api=>{const r=await fetch(api+'/v1/me/lab',{credentials:'include'});if(!r.ok)return 'HTTP '+r.status;const d=await r.json();return d.designs.map(x=>`${x.name}(${x.nodes.length})`).sort().join(', ')+' | stars '+JSON.stringify(d.progress.stars)},'http://localhost:5181');
// device A: work done before signing in
const seedDesign={version:1,current:'d-laptop',designs:{'d-laptop':{id:'d-laptop',name:'Laptop design',updated:Date.now()-60000,nodes:[{id:'c',type:'client',x:0,y:0,config:{}},{id:'s',type:'server',x:240,y:0,config:{}}],edges:[{from:'c',to:'s'}]}}};
const A=await device('A',{'tk-lab-v1':JSON.stringify(seedDesign),'tk-progress-v1':JSON.stringify({version:1,steps:{},stars:{'one-server':3},goals:{'one-server':[true,true,true]}})});
// sign-in lives on the landing page; the dashboard header only shows the avatar once signed in
await A.goto(B+'/dashboard/');await A.waitForSelector('.d-head');await A.waitForTimeout(1500);console.log('A dashboard signed out, Google buttons:',await A.locator('.test-gsi').count(),'(want 0)');
await A.goto(B+'/');await A.waitForSelector('.header .test-gsi');console.log('A landing signed out: Google button shown, server says',await server(A));
await A.click('.header .test-gsi');await A.waitForSelector('.header .acct-btn');await A.waitForTimeout(1500);console.log('A signed in as:',await A.getAttribute('.acct-btn','aria-label'),'| server now:',await server(A));
await A.goto(B+'/dashboard/');await A.waitForSelector('.d-head .acct-btn');console.log('A dashboard shows the avatar');
// device B: empty browser, signs in → gets A's work
const B2=await device('B');await B2.goto(B+'/dashboard/#lab');await B2.waitForSelector('.lab-name');
await B2.click('text=Designs ▾');console.log('B before sign-in, designs:',(await B2.$$eval('.lab-menu li b',a=>a.map(x=>x.textContent))).join(', '));await B2.keyboard.press('Escape');
await B2.goto(B+'/');await B2.click('.header .test-gsi');await B2.waitForSelector('.acct-btn');await B2.waitForTimeout(1500);
await B2.goto(B+'/dashboard/#lab');await B2.waitForSelector('.lab-name');await B2.waitForTimeout(1500);await B2.click('text=Designs ▾');console.log('B after sign-in, designs:',(await B2.$$eval('.lab-menu li b',a=>a.map(x=>x.textContent))).join(', '),'| stars:',await B2.innerText('.lab-ch-btn'));
// B opens the laptop design, adds a component; A sees it after a sync
await B2.click('.lab-menu li >> text=Laptop design');await B2.waitForTimeout(500);await B2.click('.lab-item:has-text("Database")');await B2.waitForTimeout(4500);
await A.goto(B+'/dashboard/#lab');await A.waitForSelector('.lab-name');await A.waitForTimeout(1500);console.log('A after B edited:',await lab(A));
// B deletes it; A loses it after the next sync
await B2.click('text=Designs ▾');B2.once('dialog',d=>d.accept());await B2.click('.lab-menu li:has-text("Laptop design") button[aria-label^="Delete"]');await B2.waitForTimeout(4500);
await A.reload();await A.waitForSelector('.lab-name');await A.waitForTimeout(1500);console.log('A after B deleted:',await lab(A),'| server:',await server(A));
// account menu, privacy, sign out, delete account
await A.click('.acct-btn');console.log('menu:',(await A.innerText('.acct-menu')).split('\n').filter(Boolean).join(' | '));await A.click('.acct-menu a[href="#privacy"]');await A.waitForTimeout(300);console.log('privacy page:',await A.innerText('main h1'));
await A.click('.acct-btn');await A.click('.acct-menu >> text=Sign out');await A.waitForSelector('.acct-btn',{state:'detached'});console.log('A signed out; server:',await server(A),'| local kept:',await lab(A)||'(none)');
B2.once('dialog',d=>d.accept());await B2.click('.acct-btn');await B2.click('.acct-menu >> text=Delete my account');await B2.waitForSelector('.acct-btn',{state:'detached'});console.log('B deleted account; server:',await server(B2));
await A.goto(B+'/');await A.click('.header .test-gsi');await A.waitForSelector('.acct-btn');await A.waitForTimeout(1500);console.log('A signs in again (new empty account gets A\'s local copy):',await server(A));
// sign out on all devices: B signs in too; A ends every session; both are signed out
await B2.goto(B+'/');await B2.click('.header .test-gsi');await B2.waitForSelector('.acct-btn');await B2.waitForTimeout(1000);
A.once('dialog',d=>d.accept());await A.click('.acct-btn');await A.click('.acct-menu >> text=Sign out on all devices');await A.waitForSelector('.acct-btn',{state:'detached'});
await B2.reload();await B2.waitForSelector('.header');await B2.waitForTimeout(1500);console.log('after sign out on all devices: A server',await server(A),'| B server',await server(B2),'| B avatar',await B2.locator('.acct-btn').count());
console.log('errors:',JSON.stringify(errors));await br.close()})();
