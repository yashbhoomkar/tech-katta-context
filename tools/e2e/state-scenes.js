// Spec 24 G3: scenes for error and empty states. node scenes.js <base> (base must use a local API you can stop)
const { chromium, devices } = require("playwright");const base=process.argv[2]||"http://localhost:5482";
const ok=(n,c,x="")=>console.log(`${c?"PASS":"FAIL"} ${n}${x?" — "+x:""}`);const S="/tmp/shots/";require("fs").mkdirSync(S,{recursive:true});
(async()=>{const b=await chromium.launch();const errs=[];
for(const [t,rm] of [["light","no-preference"],["dark","reduce"]]){const c=await b.newContext({...devices["Pixel 7"],reducedMotion:rm});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));await p.addInitScript(t=>{try{localStorage.setItem("tk-theme",t)}catch{}},t);
// a problem that doesn't exist
await p.goto(base+"/dashboard/#practice/no-such-problem",{waitUntil:"networkidle"});await p.waitForTimeout(800);
ok(t+": missing problem shows the 404 scene",await p.locator(".pr-missing .scene.sc-missing").count()===1);
const anim=await p.locator(".pr-missing .scene").evaluate(s=>s.querySelectorAll("animate").length);ok(t+(rm==="reduce"?": reduced motion: no animation":": the scene animates"),rm==="reduce"?anim===0:anim>0,String(anim));
await p.locator(".pr-missing").screenshot({path:S+`scene-missing-${t}.png`});
// the API unreachable: block it
await p.route("**/127.0.0.1:5000/**",r=>r.abort());await p.route("**/tech-api.katta.cc/**",r=>r.abort());
await p.goto(base+"/dashboard/concepts/",{waitUntil:"networkidle"});await p.waitForTimeout(1500);
ok(t+": load error shows the offline scene",await p.locator(".st-err .scene.sc-offline").count()===1,await p.locator(".st-err").innerText().catch(()=>"no .st-err"));
await p.locator(".st-err").screenshot({path:S+`scene-offline-${t}.png`});
ok(t+": no sideways scroll",await p.evaluate(()=>document.documentElement.scrollWidth)<=412);
await c.close()}
await b.close();console.log("errors:",JSON.stringify(errs))})();
