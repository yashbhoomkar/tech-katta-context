// Spec 24 G4 + S6 (tech-katta #331): section marks; the tour card follows a swipe on phones. 7 checks. Usage: node marks-tour.js <base>
const { chromium, devices } = require("playwright");const base=process.argv[2]||"http://localhost:5482";
const ok=(n,c,x="")=>console.log(`${c?"PASS":"FAIL"} ${n}${x?" — "+x:""}`);
async function drag(p,cdp,x0,y0,x1){await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:x0,y:y0}]});for(let i=1;i<=12;i++){await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:x0+(x1-x0)*i/12,y:y0+i/3}]});await p.waitForTimeout(16)}await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});await p.waitForTimeout(700)}
(async()=>{const b=await chromium.launch();const errs=[];
for(const t of ["light","dark"]){const p=await b.newPage({viewport:{width:1366,height:900}});p.on("pageerror",e=>errs.push(e.message));await p.addInitScript(t=>{try{localStorage.setItem("tk-theme",t);localStorage.setItem("tk-tour-seen","1")}catch{}},t);
await p.goto(base+"/dashboard/concepts/",{waitUntil:"networkidle"});await p.waitForTimeout(500);
ok(t+": six section marks in the sidebar",await p.locator(".side-link .ico-mark").count()===6);
const dot=await p.locator(".side-link.active .ico-dot").evaluate(e=>getComputedStyle(e).fill);ok(t+": the current section's dot is the accent, ochre or marigold (spec 28)",/rgb\(148, 96, 10\)|rgb\(255, 194, 51\)/.test(dot),dot);
await p.locator(".side").screenshot({path:`/tmp/shots/marks-${t}.png`});await p.close()}
const c=await b.newContext({...devices["Pixel 7"]});const p=await c.newPage();const cdp=await c.newCDPSession(p);p.on("pageerror",e=>errs.push(e.message));
await p.goto(base+"/dashboard/concepts/",{waitUntil:"networkidle"});await p.waitForTimeout(500);
if(!await p.locator(".tour-card").count()){await p.getByRole("button",{name:/Tour/}).first().tap();}await p.waitForSelector(".tour-card");await p.waitForTimeout(600);
const n0=await p.locator(".tour-card").innerText();const bb=await p.locator(".tour-card").boundingBox();
await drag(p,cdp,bb.x+bb.width*.8,bb.y+bb.height/2,bb.x+bb.width*.15);await p.waitForSelector(".tour-card");const n1=await p.locator(".tour-card").innerText();
ok("tour: swipe left goes to the next step",n1!==n0,n0.split("\n")[0]+" → "+n1.split("\n")[0]);
const bb2=await p.locator(".tour-card").boundingBox();await drag(p,cdp,bb2.x+bb2.width*.2,bb2.y+bb2.height/2,bb2.x+bb2.width*.85);const n2=await p.locator(".tour-card").innerText();
ok("tour: swipe right goes back",n2===n0,n2.split("\n")[0]);
const bb3=await p.locator(".tour-card").boundingBox();await drag(p,cdp,bb3.x+bb3.width*.2,bb3.y+bb3.height/2,bb3.x+bb3.width*.85);
ok("tour: swipe right on the first step stays",await p.locator(".tour-card").innerText()===n0);
await b.close();console.log("errors:",JSON.stringify(errs))})();
