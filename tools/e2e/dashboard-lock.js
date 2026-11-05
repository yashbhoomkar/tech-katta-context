// Dashboard tabs need a signed-in visitor (#159): signed out, an article, a section list and the Lab
// show the sign-in card with the page's title over a blurred stand-in, and the real page is not loaded
// (no article fetch); the start page, Privacy and Terms stay open. Signing in from the card (Terms box
// ticked) opens the page. Phone and desktop. Needs the local sign-in stack (README "Testing sign-in").
//   node dashboard-lock.js <site> <mint>
const{chromium}=require('playwright');const[B='http://localhost:5411',MINT='http://127.0.0.1:5191']=process.argv.slice(2);
const GIS=`window.google={accounts:{id:{_cb:null,initialize(o){this._cb=o.callback},disableAutoSelect(){},renderButton(el){el.innerHTML='';const b=document.createElement('button');b.type='button';b.className='test-gsi';b.textContent='Continue with Google';b.onclick=async()=>{const t=await (await fetch(window.__mint)).text();window.google.accounts.id._cb({credential:t})};el.appendChild(b)}}}};`;
(async()=>{const br=await chromium.launch();const errors=[];
for(const[name,vp]of[['phone',{width:390,height:844}],['desktop',{width:1440,height:900}]]){
  const ctx=await br.newContext({viewport:vp});await ctx.route('https://accounts.google.com/gsi/client',r=>r.fulfill({contentType:'text/javascript',body:GIS}));
  await ctx.addInitScript(m=>{window.__mint=m},`${MINT}/mint?sub=96${name.length}&name=Asha%20Rao&email=asha.dash%40example.com`);
  const p=await ctx.newPage();p.on('pageerror',e=>errors.push(name+': '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/401/.test(m.text()))errors.push(name+': '+m.text())});
  const fetched=[];p.on('request',r=>{if(/\/v1\/articles\/[a-z]/.test(r.url()))fetched.push(r.url())});
  for(const h of['#concepts/api-types','#concepts','#quick-notes','#lab']){await p.goto(B+'/dashboard/'+h);await p.waitForSelector('.lock-page .lock-card');
    console.log(name,h,'→ card:',JSON.stringify(await p.innerText('.lock-card em').catch(()=>'')),'| stand-in inert:',await p.evaluate(()=>document.querySelector('.lock-skel').inert),'| Lab mounted:',await p.locator('.lab-name').count())}
  console.log(name,'article fetched while locked:',fetched.length);
  for(const h of['','#privacy','#terms']){await p.goto(B+'/dashboard/'+h);await p.waitForSelector(h?'main h1':'.d-start .cards');console.log(name,h||'start page','→ open, locked:',await p.locator('.lock-page').count())}
  await p.goto(B+'/dashboard/#concepts/api-types');await p.waitForSelector('.lock-page .test-gsi');await p.check('.lock-page .acct-consent input');await p.click('.lock-page .test-gsi');
  await p.waitForSelector('.lock-page',{state:'detached'});await p.waitForSelector('article, .d-panel h1');console.log(name,'after sign-in: article title:',await p.innerText('main h1'),'| avatar:',await p.locator('.d-head .acct-btn').count());
  await ctx.close()}
console.log('errors:',JSON.stringify(errors));await br.close()})();
