// Spec 25 §7 (tech-katta #335): black pill buttons, picture cards, topic cards (spec 27; was Figures only), shorter landing; light, dark, phone. 12 checks. Usage: node premium-look.js <base> (a local API: articles need sign-in on production)
const { chromium, devices } = require("playwright");const fs=require("fs");fs.mkdirSync("/tmp/shots/pr",{recursive:true});
const base=process.argv[2]||"http://localhost:5482";const ok=(n,c,x="")=>console.log(`${c?"PASS":"FAIL"} ${n}${x?" — "+x:""}`);
(async()=>{const b=await chromium.launch();const errs=[];
for(const theme of ["light","dark"]){const c=await b.newContext({viewport:{width:1366,height:860},deviceScaleFactor:1});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));
await p.addInitScript(t=>{try{localStorage.setItem("tk-theme",t);localStorage.setItem("tk-tour-seen","1");if(!sessionStorage.getItem("once")){sessionStorage.setItem("once","1");localStorage.removeItem("tk-skim")}}catch{}},theme);
await p.goto(base+"/",{waitUntil:"networkidle"});await p.waitForTimeout(1000);await p.screenshot({path:`/tmp/shots/pr/landing-${theme}.png`});
if(theme==="light"){const w=await p.evaluate(()=>document.body.innerText.split(/\s+/).length);ok("landing has fewer words (was 666)",w<620,String(w));
const btn=await p.locator(".hero .btn.primary").evaluate(e=>getComputedStyle(e).backgroundColor);ok("light theme: the main button is ink black on the light stage (spec 27)",btn==="rgb(9, 9, 11)",btn)}
await p.goto(base+"/dashboard/concepts/",{waitUntil:"networkidle"});await p.waitForTimeout(600);await p.evaluate(()=>scrollTo(0,400));await p.waitForTimeout(1500);
const th=await p.evaluate(()=>({cards:document.querySelectorAll(".d-list li").length,thumbs:document.querySelectorAll(".d-thumb").length,drawn:document.querySelectorAll(".d-thumb svg").length}));
ok(theme+": section cards are picture cards",th.thumbs>=th.cards-2&&th.drawn>=4,JSON.stringify(th));await p.screenshot({path:`/tmp/shots/pr/concepts-${theme}.png`});
await p.goto(base+"/dashboard/concepts/caching/",{waitUntil:"networkidle"});await p.waitForTimeout(800);
// since #337 (spec 27) an article opens as topic cards; "Figures only" became the Cards / Full text switch (topic-cards.js tests it in full)
const vis=()=>p.evaluate(()=>[...document.querySelectorAll(".d-article>p:not(.d-dek)")].filter(e=>e.offsetParent).length);
ok(theme+": the article opens as picture cards, no paragraphs",await p.locator(".tc").count()>3&&await vis()===0);
await p.getByRole("button",{name:"Full text"}).click();await p.waitForTimeout(300);ok(theme+": Full text shows the paragraphs",await vis()>10);
await p.getByRole("button",{name:"Cards"}).click();await p.waitForTimeout(200);
await c.close()}
const c=await b.newContext({...devices["Pixel 7"],deviceScaleFactor:1});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));
for(const [n,u] of [["phone-landing","/"],["phone-concepts","/dashboard/concepts/"]]){await p.goto(base+u,{waitUntil:"networkidle"});await p.waitForTimeout(1200);if(n==="phone-concepts"){await p.evaluate(()=>scrollTo(0,500));await p.waitForTimeout(1500)}
ok(n+": no sideways scroll",await p.evaluate(()=>document.documentElement.scrollWidth)<=413);await p.screenshot({path:`/tmp/shots/pr/${n}.png`})}
await b.close();console.log("errors:",JSON.stringify(errs))})();
