// One problem: Run on its starting design, then Submit its reference design. Usage:
// node problems-medium.js <site> <slug>
const{chromium:raw}=require('playwright');const chromium=require('./open-site.js')(raw);const fs=require('fs');
const[,,B,slug]=process.argv;
(async()=>{const br=await chromium.launch();const errors=[];
const art=JSON.parse(fs.readFileSync(`${process.env.TK_CONTENT||require("path").join(__dirname,"../../../tech-katta/content")}/articles/interview-questions/${slug}.json`,'utf8'));
const ctx=await br.newContext({viewport:{width:1440,height:900}});let p=await ctx.newPage();
const watch=pg=>{pg.on('pageerror',e=>errors.push(e.message));pg.on('console',m=>m.type()==='error'&&!/insights|status of 404/.test(m.text())&&errors.push(m.text()))};watch(p);
await p.goto(B+'/dashboard/#problems/'+slug);await p.waitForSelector('.sv-test');await p.waitForSelector('.react-flow__node',{timeout:15000});await p.waitForTimeout(500);
let t0=Date.now();await p.click('.sv-run');await p.waitForSelector('.sv-v');console.log(slug,'RUN start ('+(Date.now()-t0)+' ms):',await p.$eval('.sv-v',e=>e.innerText.replace(/\n/g,' | ')));
const s0=await p.evaluate(()=>localStorage.getItem('tk-lab-v1'));await p.close();
const st=JSON.parse(s0);Object.assign(st.designs['q-'+slug],{nodes:art.practice.reference.nodes,edges:art.practice.reference.edges,updated:Date.now()});
await ctx.addInitScript(v=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('tk-lab-v1',v);sessionStorage.setItem('seeded','1')}},JSON.stringify(st));
p=await ctx.newPage();watch(p);await p.goto(B+'/dashboard/#problems/'+slug);await p.waitForSelector('.react-flow__node',{timeout:15000});await p.waitForTimeout(800);
t0=Date.now();await p.click('.sv-submit');await p.waitForSelector('.sv-score');console.log(slug,'SUBMIT reference ('+(Date.now()-t0)+' ms):',await p.$eval('.sv-v',e=>e.innerText.replace(/\n/g,' | ')),'|',await p.$eval('.sv-score',e=>e.innerText.replace(/\n/g,' ')));
await p.screenshot({path:`/tmp/shots/u2-${slug}.png`});
console.log('errors:',JSON.stringify(errors));await br.close()})();
