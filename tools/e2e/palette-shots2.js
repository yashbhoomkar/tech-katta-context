// Round 2 renders: node palshots2.js <base>
const { chromium, devices } = require("playwright");const P=require("../palettes2.js");const fs=require("fs");
const base=process.argv[2]||"http://localhost:5482";const OUT="/tmp/shots/pal2";fs.mkdirSync(OUT,{recursive:true});
const vars=o=>Object.entries(o||{}).map(([k,x])=>`--${k}:${x}`).join(";");
const css=p=>!p.light&&!p.dark?"":`:root:root:root{${vars(p.light)}}:root:root:root[data-theme=dark]{${vars(p.dark)}}`+(p.extra?.light?`:root:not([data-theme=dark]) ${"" }{}`+wrap(p.extra.light,":root:not([data-theme=dark])"):"")+(p.extra?.dark?wrap(p.extra.dark,":root[data-theme=dark]"):"");
function wrap(rules,scope){return rules.split("}").filter(r=>r.trim()).map(r=>{const [sel,body]=r.split("{");return sel.split(/,(?![^()]*\))/).map(s=>`${scope} ${s.trim()}`).join(",")+"{"+body+"}"}).join("")}
const plan=process.argv[3]?JSON.parse(process.argv[3]):[["current","light"],["current","dark"],["paper-ink","light"],["paper-ink","dark"],["pure-mono","light"],["pure-mono","dark"],["obsidian","dark"]];
(async()=>{const b=await chromium.launch();const errs=[];
for(const [key,theme] of plan){const p=P[key];
  const shot=async(name,opts,url,prep)=>{const c=await b.newContext({...opts,deviceScaleFactor:1});const pg=await c.newPage();pg.on("pageerror",e=>errs.push(key+": "+e.message));
    await pg.addInitScript(([c,t])=>{try{localStorage.setItem("tk-theme",t);localStorage.setItem("tk-tour-seen","1")}catch{}const add=()=>{const s=document.createElement("style");s.id="pal";s.textContent=c;document.documentElement.appendChild(s)};if(document.documentElement)add();else new MutationObserver((m,o)=>{if(document.documentElement){add();o.disconnect()}}).observe(document,{childList:true})},[css(p),theme]);
    await pg.goto(base+url,{waitUntil:"networkidle"});await pg.waitForTimeout(900);if(prep)await prep(pg);await pg.waitForTimeout(700);
    await pg.screenshot({path:`${OUT}/${key}-${theme}-${name}.png`});await c.close()};
  await shot("landing",{viewport:{width:1366,height:860}},"/");
  await shot("article",{viewport:{width:1366,height:860}},"/dashboard/concepts/caching/",async pg=>{await pg.evaluate(()=>{const f=document.querySelector(".a-fig");if(f)scrollTo(0,f.getBoundingClientRect().top+scrollY-330)})});
  await shot("phone",{...devices["Pixel 7"]},"/dashboard/#practice/url-shortener");
}
await b.close();console.log("errors:",JSON.stringify(errs.slice(0,5)),fs.readdirSync(OUT).length)})();
