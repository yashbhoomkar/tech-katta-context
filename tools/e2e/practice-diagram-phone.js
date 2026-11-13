// Spec 24 §11.1 + A3 (tech-katta #326, #327): the learner diagram on phones (Result pane, See the diagram sheet), one arrow per hop with a key, request dots after Accepted. 20 checks. Usage: node practice-diagram-phone.js <base>
const { chromium, devices } = require("playwright");const fs=require("fs");
const base=process.argv[2]||"http://localhost:5482";const ok=(n,c,x="")=>console.log(`${c?"PASS":"FAIL"} ${n}${x?" — "+x:""}`);
const ref=JSON.parse(fs.readFileSync(process.env.TK_APP+"/content/problems2/001-url-shortener.json","utf8")).reference;
(async()=>{const b=await chromium.launch();const errs=[];
for(const reduced of [false,true]){const tag=reduced?"reduced: ":"";const c=await b.newContext({...devices["Pixel 7"],reducedMotion:reduced?"reduce":"no-preference"});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));
await p.addInitScript(r=>{try{localStorage.setItem("tk-practice-src-1",r)}catch{}},ref);
await p.goto(base+"/dashboard/#practice/url-shortener",{waitUntil:"networkidle"});await p.waitForSelector(".pr-phone-tabs");
ok(tag+"Result pane has no diagram before a run",await p.locator(".pr-pdiag").count()===0);
await p.locator(".pr-seediag").tap();await p.waitForTimeout(400);const sh=await p.locator(".pb-sheet .pd svg").count();ok(tag+"See the diagram opens a sheet with the drawing",sh===1);
await p.screenshot({path:"/tmp/shots/diag-sheet.png"});
await p.keyboard.press("Escape");await p.locator(".pb-sheet button").first().tap().catch(()=>{});await p.waitForTimeout(300);
if(await p.locator(".pb-sheet").count())await p.locator(".pb-scrim").click({position:{x:5,y:5}}).catch(()=>{});await p.waitForTimeout(300);
await p.getByRole("button",{name:/^▶? ?Run/}).first().tap();await p.waitForTimeout(800);
const tab=await p.locator(".pr-phone-tabs .on").textContent();const v=await p.locator(".pr-console").innerText();
ok(tag+"Run lands on Result, Accepted",tab==="Result"&&/Accepted/.test(v),tab+" / "+v.slice(0,40).replace(/\n/g," "));
ok(tag+"the diagram is on top of the Result pane",await p.locator(".pr-pdiag .pd svg").count()===1);
const arrows=await p.locator(".pr-pdiag .pd-edge:not(.pd-core)").evaluateAll(es=>es.map(e=>e.getAttribute("d").split(/[CL]/)[0]+"|"+e.getAttribute("d").split(" ").slice(-2).join(" ")));ok(tag+"one arrow per hop (no doubled arrows)",new Set(arrows).size===arrows.length,arrows.length+" arrows");
ok(tag+"a key says which colour is which",await p.locator(".pr-pdiag .pd-key span").count()>=2,await p.locator(".pr-pdiag .pd-key").innerText().catch(()=>"none"));
const dots=await p.locator(".pr-pdiag .pd-dot").count();ok(tag+(reduced?"no request dots":"request dots run after Accepted"),reduced?dots===0:dots>0,String(dots));
if(!reduced){await p.waitForTimeout(400);await p.locator(".pr-pdiag").screenshot({path:"/tmp/shots/diag-result.png"});
 const st=await p.locator(".pr-pdiag svg").evaluate(s=>({t:s.getCurrentTime(),d:[...s.querySelectorAll(".pd-dot")].map(x=>getComputedStyle(x).opacity)}));
 await p.waitForTimeout(4500);const after=await p.locator(".pr-pdiag svg").evaluate(s=>[...s.querySelectorAll(".pd-dot")].map(x=>+getComputedStyle(x).opacity));ok("dots stop after three loops (hidden)",after.every(o=>o===0),JSON.stringify(after.slice(0,4)))}
// a pan on the diagram doesn't change pane
const d=await p.locator(".pr-pdiag .pd").boundingBox();const cdp=await c.newCDPSession(p);
await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:d.x+d.width*.8,y:d.y+d.height/2}]});for(let i=1;i<=10;i++){await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:d.x+d.width*.8-25*i,y:d.y+d.height/2}]});await p.waitForTimeout(16)}await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});await p.waitForTimeout(400);
ok(tag+"a sideways pan on the diagram keeps the Result pane",await p.locator(".pr-phone-tabs .on").textContent()==="Result");
ok(tag+"no sideways page scroll",await p.evaluate(()=>document.documentElement.scrollWidth)<=412);
await c.close()}
// desktop: diagram in the split, dots after Accepted
const c=await b.newContext({viewport:{width:1366,height:900}});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));await p.addInitScript(r=>{try{localStorage.setItem("tk-practice-src-1",r)}catch{}},ref);
await p.goto(base+"/dashboard/#practice/url-shortener",{waitUntil:"networkidle"});await p.waitForSelector(".pr-diagram svg");
await p.getByRole("button",{name:/Run/}).first().click();await p.waitForTimeout(800);ok("desktop: dots in the split diagram after Accepted",await p.locator(".pr-diagram .pd-dot").count()>0);
await b.close();console.log("errors:",JSON.stringify(errs))})();
