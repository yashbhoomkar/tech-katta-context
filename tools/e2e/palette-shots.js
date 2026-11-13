// Render the real site in each candidate palette: node palshots.js <base>
const { chromium, devices } = require("playwright");const P=require("../palettes.js");const fs=require("fs");
const base=process.argv[2]||"http://localhost:5482";const OUT="/tmp/shots/pal";fs.mkdirSync(OUT,{recursive:true});
const css=(p)=>{if(!p)return"";const v=o=>Object.entries(o).map(([k,x])=>`--${k}:${x}`).join(";");return `:root:root:root{${v(p.light)}}:root:root:root[data-theme=dark]{${v(p.dark)}}`};
const inject=(c)=>{const add=()=>{const s=document.createElement("style");s.id="pal";s.textContent=c;(document.head||document.documentElement).appendChild(s)};if(document.documentElement)add();else document.addEventListener("readystatechange",add,{once:true})};
(async()=>{const b=await chromium.launch();const errs=[];
for(const [key,p] of Object.entries(P)){for(const theme of ["light","dark"]){
  const shot=async(name,opts,url,prep)=>{const c=await b.newContext({...opts,deviceScaleFactor:1});const pg=await c.newPage();pg.on("pageerror",e=>errs.push(key+": "+e.message));
    await pg.addInitScript(([c,t])=>{try{localStorage.setItem("tk-theme",t);localStorage.setItem("tk-tour-seen","1")}catch{}const add=()=>{const s=document.createElement("style");s.id="pal";s.textContent=c;document.documentElement.appendChild(s)};if(document.documentElement)add();else new MutationObserver((m,o)=>{if(document.documentElement){add();o.disconnect()}}).observe(document,{childList:true})},[css(p),theme]);
    await pg.goto(base+url,{waitUntil:"networkidle"});await pg.waitForTimeout(900);if(prep)await prep(pg);await pg.waitForTimeout(600);
    await pg.screenshot({path:`${OUT}/${key}-${theme}-${name}.png`});await c.close()};
  await shot("landing",{viewport:{width:1366,height:860}},"/");
  await shot("article",{viewport:{width:1366,height:860}},"/dashboard/interview-questions/url-shortener/",async pg=>{await pg.evaluate(()=>{const f=document.querySelector(".a-fig");if(f)scrollTo(0,f.getBoundingClientRect().top+scrollY-260)})});
  await shot("phone",{...devices["Pixel 7"]},"/dashboard/#practice/url-shortener");
}}
await b.close();console.log("errors:",JSON.stringify(errs.slice(0,5)));console.log(fs.readdirSync(OUT).length,"shots")})();
