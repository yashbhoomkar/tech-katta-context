// Spec 24 §9 decisions (tech-katta #325): phones never run more than one figure loop; desktop plays every figure in view;
// fig_step once per figure; practice_pane on a tap; solid header on phones. 7 checks; articles need a local API.
const { chromium, devices } = require("playwright");
const ok=(n,c,x="")=>console.log(`${c?"PASS":"FAIL"} ${n}${x?" — "+x:""}`);
const base=process.argv[2]||"https://tech.katta.cc";
(async()=>{const b=await chromium.launch();const errs=[];
const count=p=>p.evaluate(()=>[...document.querySelectorAll(".a-fig-body svg")].map(s=>{const r=s.getBoundingClientRect();return{run:!s.animationsPaused(),vis:r.bottom>0&&r.top<innerHeight}}));
for(const [name,opts] of [["phone",{...devices["Pixel 7"]}],["desktop",{viewport:{width:1366,height:1400}}]]){const c=await b.newContext(opts);const p=await c.newPage();await p.addInitScript(()=>Object.defineProperty(Navigator.prototype,"webdriver",{get:()=>false}));p.on("pageerror",e=>errs.push(e.message));
const ev=[];await p.route("**/v1/events",r=>{try{ev.push(...JSON.parse(r.request().postData()).events.map(e=>e.name+":"+JSON.stringify(e.props)))}catch{}r.fulfill({status:204})});
await p.goto(base+"/dashboard/concepts/database-indexing/",{waitUntil:"networkidle"});let maxRun=0,maxBothVis=0;
for(let y=0;y<9000;y+=250){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(450);const f=await count(p);const run=f.filter(x=>x.run).length,vis=f.filter(x=>x.vis).length;maxRun=Math.max(maxRun,run);if(vis>=2)maxBothVis=Math.max(maxBothVis,run)}
if(name==="phone")ok("phone: never more than one figure loop running",maxRun<=1,`max running ${maxRun}`);else ok("desktop: two figures in view both play",maxBothVis>=2,`max running with ≥2 visible ${maxBothVis}`);
const fig=p.locator(".a-fig").filter({has:p.locator(".a-fig-ctl")}).first();await fig.scrollIntoViewIfNeeded();await p.waitForTimeout(500);
await fig.getByRole("button",{name:"Next step"}).click();await fig.getByRole("button",{name:"Next step"}).click();
if(name==="phone"){await p.getByRole("button",{name:"Open menu"}).tap();await p.waitForTimeout(200);await p.keyboard.press("Escape")}
await p.evaluate(()=>{document.dispatchEvent(new Event("visibilitychange"));dispatchEvent(new Event("pagehide"))});await p.waitForTimeout(3000);
const fs=ev.filter(e=>e.startsWith("fig_step"));ok(name+": fig_step sent once for two steps",fs.length===1,JSON.stringify(fs));
const hb=await p.evaluate(()=>getComputedStyle(document.querySelector(".d-head")).backdropFilter);ok(name+": header "+(name==="phone"?"solid":"blurred"),name==="phone"?hb==="none":hb!=="none",hb);
await c.close()}
// practice_pane
const c=await b.newContext({...devices["Pixel 7"]});const p=await c.newPage();await p.addInitScript(()=>Object.defineProperty(Navigator.prototype,"webdriver",{get:()=>false}));const ev=[];await p.route("**/v1/events",r=>{try{ev.push(...JSON.parse(r.request().postData()).events.map(e=>e.name+":"+JSON.stringify(e.props)))}catch{}r.fulfill({status:204})});
await p.goto(base+"/dashboard/#practice/url-shortener",{waitUntil:"networkidle"});await p.waitForSelector(".pr-phone-tabs");await p.locator(".pr-phone-tabs button",{hasText:"Problem"}).tap();await p.waitForTimeout(300);
await p.evaluate(()=>dispatchEvent(new Event("pagehide")));await p.waitForTimeout(3000);const pp=ev.filter(e=>e.startsWith("practice_pane"));ok("practice_pane on a tap",pp.length===1&&/"via":"tap"/.test(pp[0]),JSON.stringify(pp));
await b.close();console.log("errors:",JSON.stringify(errs))})();
