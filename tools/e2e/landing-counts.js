// Spec 24 A7 (tech-katta #330; the numbers strip since #336, spec 26): landing counts count up when seen; reduced motion; screen-reader total. 6 checks. Usage: node landing-counts.js <base>
const { chromium, devices } = require("playwright");const base=process.argv[2]||"http://localhost:5482";
const ok=(n,c,x="")=>console.log(`${c?"PASS":"FAIL"} ${n}${x?" — "+x:""}`);
(async()=>{const b=await chromium.launch();const errs=[];
for(const rm of ["no-preference","reduce"]){const c=await b.newContext({...devices["Pixel 7"],reducedMotion:rm});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));
await p.goto(base+"/",{waitUntil:"networkidle"});const read=()=>p.locator(".stats li b").first().innerText();
const before=await p.locator(".stats .tk-count [aria-hidden]").first().textContent();
await p.locator(".stats").scrollIntoViewIfNeeded();await p.waitForTimeout(150);const mid=await p.locator(".stats .tk-count [aria-hidden]").first().textContent();await p.waitForTimeout(1200);
const fin=await read();const sr=await p.locator(".stats .tk-count .sr-only").first().textContent();
if(rm==="reduce")ok("reduced: the final number from the start",before===sr,`${before} / ${sr}`);else ok("counts from 0 before it is seen, then up to the total",before==="0"&&Number(mid)<=Number(sr)&&fin.startsWith(sr),`before ${before}, mid ${mid}, end "${fin}"`);
ok(rm+": screen readers get the total",/^\d+$/.test(sr),sr);ok(rm+": the sr text is hidden",await p.locator(".stats .tk-count .sr-only").first().evaluate(e=>e.getBoundingClientRect().width<=1));
await c.close()}
await b.close();console.log("errors:",JSON.stringify(errs))})();
