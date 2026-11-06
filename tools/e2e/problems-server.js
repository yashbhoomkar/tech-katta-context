// The server check after Submit, with the account API stubbed (signed in, a verdict, stats): the line
// under the verdict, what is posted, the Acceptance column. Usage: node problems-server.js <site>
const{chromium}=require('playwright');const fs=require('fs');
(async()=>{const br=await chromium.launch();const errors=[];const B=process.argv[2],slug='url-shortener';
const art=JSON.parse(fs.readFileSync(`${process.env.TK_CONTENT||require("path").join(__dirname,"../../../tech-katta/content")}/articles/interview-questions/${slug}.json`,'utf8'));
const ctx=await br.newContext({viewport:{width:1440,height:900}});
let posted=null;
const j=(r,o)=>r.fulfill({contentType:'application/json',body:JSON.stringify(o),headers:{'access-control-allow-origin':r.request().headers().origin||'*','access-control-allow-credentials':'true'}});
await ctx.route('**/v1/auth/config',r=>j(r,{enabled:true,clientId:'test.apps.googleusercontent.com'}));
await ctx.route('**/v1/me',r=>j(r,{user:{id:'u1',name:'Asha Rao',firstName:'Asha',email:'asha@example.com',picture:''}}));
await ctx.route('**/v1/me/lab',r=>j(r,{designs:[],deleted:[],progress:{steps:{},stars:{},goals:{}}}));
await ctx.route('**/v1/events',r=>r.fulfill({status:204}));
await ctx.route('**/accounts.google.com/**',r=>r.fulfill({contentType:'text/javascript',body:''}));
await ctx.route('**/v1/me/submissions',r=>{posted=JSON.parse(r.request().postData()||'{}');return j(r,{verdict:'accepted',passed:6,total:6,score:50,submissions:120,accepted:41,cheaperThan:78})});
await ctx.route('**/v1/problems/stats',r=>j(r,{problems:{'url-shortener':{submissions:120,accepted:41,solvers:30}}}));
let p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&!/insights|status of 404/.test(m.text())&&errors.push(m.text()));
await p.goto(B+'/dashboard/#problems/'+slug);await p.waitForSelector('.react-flow__node',{timeout:15000});await p.waitForTimeout(600);
const s0=await p.evaluate(()=>localStorage.getItem('tk-lab-v1'));await p.close();const st=JSON.parse(s0);Object.assign(st.designs['q-'+slug],{nodes:art.practice.reference.nodes,edges:art.practice.reference.edges,updated:Date.now()});
await ctx.addInitScript(v=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('tk-lab-v1',v);sessionStorage.setItem('seeded','1')}},JSON.stringify(st));
p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(B+'/dashboard/#problems/'+slug);await p.waitForSelector('.react-flow__node',{timeout:15000});await p.waitForTimeout(800);
await p.click('.sv-submit');await p.waitForSelector('.sv-server');await p.waitForFunction(()=>!/Checking/.test(document.querySelector('.sv-server').textContent));
console.log('server line:',await p.$eval('.sv-server',e=>e.textContent));
console.log('posted: slug',posted?.slug,'nodes',posted?.design?.nodes?.length,'hints',posted?.hints,'answer keys',Object.keys(posted?.answer||{}).join(','));
await p.screenshot({path:'/tmp/shots/server.png'});
await p.goto(B+'/dashboard/#problems');await p.waitForSelector('.qt-table tbody tr');console.log('table head:',await p.$$eval('.qt-table th',x=>x.map(e=>e.textContent).join(' | ')),'| row1:',await p.$eval('.qt-table tbody tr',e=>e.innerText.replace(/\s+/g,' ')));
await p.screenshot({path:'/tmp/shots/server-table.png'});
console.log('errors:',JSON.stringify(errors));await br.close()})();
