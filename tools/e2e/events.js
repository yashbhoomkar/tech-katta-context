// Usage events end to end: a visitor on a phone opens the landing page, an article, the Lab, adds a
// component, starts a run and scores the IND vs PAK challenge; then the events stored in MongoDB are
// listed. Needs the local sign-in stack (README "Testing sign-in") and the MongoDB driver on NODE_PATH:
//   NODE_PATH=tech-katta/backend/node_modules node events.js <site> <mongo uri file> <db>
const{chromium}=require('playwright');const{MongoClient}=require('mongodb');const fs=require('fs');
const B=process.argv[2]||'http://localhost:5411',URI=fs.readFileSync(process.argv[3]||'/tmp/uri.txt','utf8').trim(),DB=process.argv[4]||'tk_e2e';
(async()=>{const br=await chromium.launch();const errors=[];
const ctx=await br.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await ctx.route('https://accounts.google.com/gsi/client',r=>r.fulfill({contentType:'text/javascript',body:'window.google={accounts:{id:{initialize(){},renderButton(){},disableAutoSelect(){}}}}'}));
// the site sends nothing from automated browsers; pretend not to be one for this test
await ctx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));
const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const mongo=await MongoClient.connect(URI);const events=mongo.db(DB).collection('events');const start=new Date();
await p.goto(B+'/');await p.waitForSelector('#ind-vs-pak');await p.locator('#ind-vs-pak').scrollIntoViewIfNeeded();await p.waitForSelector('.ll-score');
await p.check('.ll-check input');for(let i=0;i<6;i++)await p.click('.ll-step button:last-child');await p.click('.ll-score');await p.waitForTimeout(500);
await p.goto(B+'/dashboard/#concepts/api-types');await p.waitForSelector('article, .d-panel h1');await p.waitForTimeout(6000);
await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await p.waitForTimeout(800);
await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.lab-name');await p.waitForTimeout(500);
await p.click('.lab-item:has-text("Cache")');await p.waitForTimeout(300);
const run=p.locator('.lab-btn.run');if(await run.isEnabled())await run.click();await p.waitForTimeout(500);
await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
await p.waitForTimeout(2000);
const got=await events.find({at:{$gte:new Date(start-60000)}}).sort({at:1}).toArray();
for(const e of got)console.log(e.name.padEnd(16),e.device,e.page.padEnd(32),JSON.stringify(e.props),e.userId?'user':'anon');
const vis=new Set(got.map(e=>e.visitor));console.log('events:',got.length,'| visitors:',vis.size,'| names:',[...new Set(got.map(e=>e.name))].join(','));
console.log('errors:',JSON.stringify(errors));await mongo.close();await br.close()})();
