// Spec 24 G1 (tech-katta #332, #333): portrait phone figures on 33 articles. Usage: node phone-figures.js <base> (a local API: articles need sign-in on production)
const { chromium, devices } = require("playwright");const base=process.argv[2]||"http://localhost:5482";
const ok=(n,c,x="")=>console.log(`${c?"PASS":"FAIL"} ${n}${x?" — "+x:""}`);
const more=["components/api-gateways","components/kafka-in-practice","components/temporal","concepts/change-capture","concepts/networking-essentials","concepts/real-time-updates","concepts/scaling-reads","real-systems/slack-job-queue","concepts/workflows","concepts/big-files","concepts/cap-theorem","real-systems/discord-messages","concepts/api-design"];
const slugs0=["ad-clicks","chat-app","coding-judge","dating-swipes","file-sync","ind-vs-pak","job-scheduler","leaderboard","menu-search","news-feed","notifications","payments","photo-sharing","restaurants-near-me","rider-dispatch","shared-editor","ticket-booking","url-shortener","video-streaming","web-crawler"];const slugs=[...slugs0.map(x=>"interview-questions/"+x),...more];
(async()=>{const b=await chromium.launch();const errs=[];const c=await b.newContext({...devices["Pixel 7"]});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));
let good=0;const bad=[];
for(const s of slugs){await p.goto(`${base}/dashboard/${s}/`,{waitUntil:"networkidle"});await p.waitForTimeout(500);
const r=await p.evaluate(()=>{const f=document.querySelector(".a-fig");if(!f)return{none:1};const svg=f.querySelector(".a-fig-body svg"),bb=svg?.getBoundingClientRect(),fb=f.getBoundingClientRect();
let over=0;for(const t of f.querySelectorAll(".a-fig-body text")){const tb=t.getBBox(),rect=t.parentNode.querySelector("rect");if(rect){const rb=rect.getBBox();if(tb.width>rb.width+1)over++}}
const fs=[...f.querySelectorAll(".a-fig-body text")].filter(t=>!t.closest(".tk-caps")).map(t=>parseFloat(getComputedStyle(t).fontSize)*(bb.width/svg.viewBox.baseVal.width));
return{portrait:f.classList.contains("a-fig-portrait"),fits:bb.width<=fb.width+1,err:!!f.querySelector(".a-fig-err"),steps:f.querySelector(".a-fig-n")?.textContent,over,minPx:Math.min(...fs).toFixed(1),sw:document.documentElement.scrollWidth}});
const pass=r.portrait&&r.fits&&!r.err&&r.over===0&&/of 4/.test(r.steps||"")&&r.sw<=412&&r.minPx>=9.5;if(pass)good++;else bad.push(s+" "+JSON.stringify(r));
if(["concepts/workflows","concepts/networking-essentials","concepts/api-design"].includes(s))await p.locator(".a-fig").first().screenshot({path:`/tmp/shots/portrait-${s.split("/")[1]}.png`})}
ok(`phone: portrait first figure on ${slugs.length} articles (fits, labels inside boxes, ≥ 9.5 px, 4 steps, no sideways scroll)`,good===slugs.length,`${good} good; `+bad.join(" | "));
const d=await b.newPage({viewport:{width:1366,height:900}});await d.goto(`${base}/dashboard/interview-questions/chat-app/`,{waitUntil:"networkidle"});await d.waitForTimeout(400);
ok("desktop keeps the original figure",await d.locator(".a-fig-portrait").count()===0&&await d.locator(".a-fig").count()>0);
const pr=await b.newContext({...devices["Pixel 7"],reducedMotion:"reduce"});const q=await pr.newPage();await q.goto(`${base}/dashboard/interview-questions/chat-app/`,{waitUntil:"networkidle"});await q.waitForTimeout(500);
ok("reduced motion: still portrait, caption in the step line",await q.locator(".a-fig-portrait").count()===1&&(await q.locator(".a-fig-portrait .a-fig-step").count())===1&&await q.locator(".a-fig-portrait animate").count()===0);
await b.close();console.log("errors:",JSON.stringify(errs))})();
