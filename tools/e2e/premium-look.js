// Spec 25 §7 (tech-katta #335): black pill buttons, picture cards, Figures only (remembered), shorter landing; light, dark, phone. 12 checks. Usage: node premium-look.js <base> (a local API: articles need sign-in on production)
const { chromium, devices } = require("playwright");const fs=require("fs");fs.mkdirSync("/tmp/shots/pr",{recursive:true});
const base=process.argv[2]||"http://localhost:5482";const ok=(n,c,x="")=>console.log(`${c?"PASS":"FAIL"} ${n}${x?" — "+x:""}`);
(async()=>{const b=await chromium.launch();const errs=[];
for(const theme of ["light","dark"]){const c=await b.newContext({viewport:{width:1366,height:860},deviceScaleFactor:1});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));
await p.addInitScript(t=>{try{localStorage.setItem("tk-theme",t);localStorage.setItem("tk-tour-seen","1");if(!sessionStorage.getItem("once")){sessionStorage.setItem("once","1");localStorage.removeItem("tk-skim")}}catch{}},theme);
await p.goto(base+"/",{waitUntil:"networkidle"});await p.waitForTimeout(1000);await p.screenshot({path:`/tmp/shots/pr/landing-${theme}.png`});
if(theme==="light"){const w=await p.evaluate(()=>document.body.innerText.split(/\s+/).length);ok("landing has fewer words (was 666)",w<620,String(w));
const btn=await p.locator(".hero .btn.primary").evaluate(e=>getComputedStyle(e).backgroundColor);ok("main button is light on the dark stage (spec 26)",btn==="rgb(250, 250, 250)",btn)}
await p.goto(base+"/dashboard/concepts/",{waitUntil:"networkidle"});await p.waitForTimeout(600);await p.evaluate(()=>scrollTo(0,400));await p.waitForTimeout(1500);
const th=await p.evaluate(()=>({cards:document.querySelectorAll(".d-list li").length,thumbs:document.querySelectorAll(".d-thumb").length,drawn:document.querySelectorAll(".d-thumb svg").length}));
ok(theme+": section cards are picture cards",th.thumbs>=th.cards-2&&th.drawn>=4,JSON.stringify(th));await p.screenshot({path:`/tmp/shots/pr/concepts-${theme}.png`});
await p.goto(base+"/dashboard/concepts/caching/",{waitUntil:"networkidle"});await p.waitForTimeout(800);
const vis=()=>p.evaluate(()=>[...document.querySelectorAll(".d-article>p:not(.d-dek)")].filter(e=>e.offsetParent).length);const before=await vis();
await p.getByRole("button",{name:"Figures only"}).click();await p.waitForTimeout(400);const after=await vis();const figs=await p.evaluate(()=>[...document.querySelectorAll(".d-article>.a-fig")].filter(e=>e.offsetParent).length);
ok(theme+": Figures only hides the paragraphs, keeps figures",before>10&&after===0&&figs>3,`${before} → ${after} paragraphs, ${figs} figures`);
await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(300);await p.screenshot({path:`/tmp/shots/pr/skim-${theme}.png`});
const h=await p.evaluate(()=>document.documentElement.scrollHeight);await p.reload({waitUntil:"networkidle"});await p.waitForTimeout(600);
ok(theme+": the choice is remembered",await p.locator(".a-skim").count()===1,"page height "+h);await p.getByRole("button",{name:"Show the full text"}).click();await p.waitForTimeout(200);ok(theme+": full text back",await vis()>10);
await c.close()}
const c=await b.newContext({...devices["Pixel 7"],deviceScaleFactor:1});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));
for(const [n,u] of [["phone-landing","/"],["phone-concepts","/dashboard/concepts/"]]){await p.goto(base+u,{waitUntil:"networkidle"});await p.waitForTimeout(1200);if(n==="phone-concepts"){await p.evaluate(()=>scrollTo(0,500));await p.waitForTimeout(1500)}
ok(n+": no sideways scroll",await p.evaluate(()=>document.documentElement.scrollWidth)<=413);await p.screenshot({path:`/tmp/shots/pr/${n}.png`})}
await b.close();console.log("errors:",JSON.stringify(errs))})();
