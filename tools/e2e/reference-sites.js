// Sample real colours from well-designed sites: page bg, body text, headline, primary button bg/text, link/accent.
const { chromium } = require("playwright");const fs=require("fs");fs.mkdirSync("/tmp/shots/ref",{recursive:true});
const sites=["https://linear.app","https://stripe.com","https://vercel.com","https://www.raycast.com","https://mercury.com","https://www.anthropic.com","https://www.notion.com","https://brilliant.org","https://www.framer.com","https://resend.com","https://ramp.com","https://www.apple.com","https://read.cv","https://arc.net","https://www.figma.com","https://posthog.com"];
(async()=>{const b=await chromium.launch();const out=[];
for(const u of sites){const c=await b.newContext({viewport:{width:1366,height:860},userAgent:"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"});const p=await c.newPage();
try{await p.goto(u,{waitUntil:"domcontentloaded",timeout:25000});await p.waitForTimeout(3500);
const r=await p.evaluate(()=>{const cs=e=>e?getComputedStyle(e):null;const bgOf=e=>{for(let n=e;n;n=n.parentElement){const c=getComputedStyle(n).backgroundColor;if(c&&c!=="rgba(0, 0, 0, 0)"&&c!=="transparent")return c}return"none"};
const h=document.querySelector("h1")||document.querySelector("h2");const ps=[...document.querySelectorAll("p")].find(x=>x.innerText.length>60);
const btns=[...document.querySelectorAll("a,button")].filter(x=>{const r=x.getBoundingClientRect();return r.top<900&&r.width>60&&r.height>28&&r.height<70&&x.innerText.trim().length>2&&x.innerText.trim().length<30}).map(x=>({t:x.innerText.trim().slice(0,20),bg:cs(x).backgroundColor,fg:cs(x).color,br:cs(x).borderRadius})).filter(x=>x.bg!=="rgba(0, 0, 0, 0)").slice(0,3);
const a=[...document.querySelectorAll("p a")].slice(0,1).map(x=>cs(x).color)[0];
return{page:bgOf(document.body),h1:h?cs(h).color:"",h1font:h?cs(h).fontFamily.split(",")[0]+" "+cs(h).fontWeight:"",body:ps?cs(ps).color:"",bodyFont:ps?cs(ps).fontFamily.split(",")[0]:"",btns,link:a}});
out.push({u,...r});await p.screenshot({path:`/tmp/shots/ref/${new URL(u).hostname.replace("www.","")}.png`})}catch(e){out.push({u,err:String(e).slice(0,80)})}await c.close()}
await b.close();fs.writeFileSync("/tmp/shots/ref/colours.json",JSON.stringify(out,null,1));for(const o of out)console.log(JSON.stringify(o).slice(0,420))})();
