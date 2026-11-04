// The landing page Lab is blurred and locked until sign-in; the opt-in box for Facebook/Instagram ads
// is unticked; ticking it before signing in records consent with the first/last name. Phone and
// desktop. Needs the local sign-in stack (README "Testing sign-in") and the MongoDB driver:
//   NODE_PATH=tech-katta/backend/node_modules:$(npm root -g) node landing-lock.js <site> <mint> <uri file> <db>
const{chromium}=require('playwright');const{MongoClient}=require('mongodb');const fs=require('fs');
const[B='http://localhost:5411',MINT='http://127.0.0.1:5191',UF='/tmp/uri.txt',DB='tk_e2e']=process.argv.slice(2);
const GIS=`window.google={accounts:{id:{_cb:null,initialize(o){this._cb=o.callback},disableAutoSelect(){},renderButton(el){el.innerHTML='';const b=document.createElement('button');b.type='button';b.className='test-gsi';b.textContent='Continue with Google';b.onclick=async()=>{const t=await (await fetch(window.__mint)).text();window.google.accounts.id._cb({credential:t})};el.appendChild(b)}}}};`;
(async()=>{const br=await chromium.launch();const errors=[];const mongo=await MongoClient.connect(fs.readFileSync(UF,'utf8').trim());const users=mongo.db(DB).collection('users');
for(const[name,vp,sel,tick]of[['phone',{width:390,height:844},'.ll-score',true],['desktop',{width:1280,height:900},'.lab-score-btn, .lab-btn.run',false]]){
  const sub=name==='phone'?'9101':'9102';const ctx=await br.newContext({viewport:vp});await ctx.route('https://accounts.google.com/gsi/client',r=>r.fulfill({contentType:'text/javascript',body:GIS}));
  await ctx.addInitScript(m=>{window.__mint=m},`${MINT}/mint?sub=${sub}&name=Asha%20Rao&given=Asha&family=Rao&email=asha${sub}%40example.com`);
  const p=await ctx.newPage();p.on('pageerror',e=>errors.push(name+': '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/401/.test(m.text()))errors.push(name+': '+m.text())});
  await p.goto(B+'/#ind-vs-pak');await p.waitForSelector('.lock-card');await p.waitForTimeout(800);
  const blocked=await p.evaluate(s=>{const el=document.querySelector(s);return !el||!!el.closest('[inert]')},sel);
  const box=await p.locator('.lock-card .acct-consent input').isChecked();
  console.log(name,'locked card:',await p.locator('.lock-card').count(),'| Lab behind it inert:',blocked,'| consent box ticked by default:',box);
  if(tick)await p.check('.lock-card .acct-consent input');
  await p.click('.lock-card .test-gsi');await p.waitForSelector('.lock-card',{state:'detached'});await p.waitForTimeout(1000);
  console.log(name,'after sign-in: lock gone, Lab usable:',await p.locator(sel).first().isVisible(),'| avatar:',await p.locator('.header .acct-btn').count());
  const u=await users.findOne({googleSub:sub});console.log(name,'stored:',u.firstName,u.lastName,'| adsConsent:',u.adsConsent?.ads??'(none)');
  if(name==='phone'){await p.click('.header .acct-btn');const t=p.locator('.acct-menu .acct-ads input');console.log('menu switch on:',await t.isChecked());await t.uncheck();await p.waitForTimeout(800);console.log('after turning off:',(await users.findOne({googleSub:sub})).adsConsent.ads)}
  await ctx.close()}
console.log('errors:',JSON.stringify(errors));await mongo.close();await br.close()})();
