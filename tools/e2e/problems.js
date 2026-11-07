// Problems (LeetCode-style workspace) on Q01: tabs, example tests, Run on the start design (fails, with
// reasons), the reference design (the article's practice.reference, read from a tech-katta clone next to
// this repo or TK_CONTENT) passes, Submit with and without a written answer and a hint, Submissions,
// the table's Solved and best score, the Solution tab, a phone. Usage: node problems.js <site>
const{chromium:raw}=require('playwright');const chromium=require('./open-site.js')(raw);const fs=require('fs');
(async()=>{const br=await chromium.launch();const errors=[];const B=process.argv[2];const S='/tmp/shots/';
const ctx=await br.newContext({viewport:{width:1512,height:900}});let p=await ctx.newPage();
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&!/insights|status of 404/.test(m.text())&&errors.push(m.text()));
await p.goto(B+'/dashboard/#problems/url-shortener');await p.waitForSelector('.sv-test');await p.waitForSelector('.react-flow__node',{timeout:15000});await p.waitForTimeout(600);
console.log('tabs',await p.$$eval('.sv-tabs [role=tab]',x=>x.map(e=>e.textContent).join(' | ')),'| examples',await p.$$eval('.sv-test b',x=>x.map(e=>e.textContent).join(' / ')),'| more:',await p.$eval('.sv-more',e=>e.textContent));
console.log('start nodes',await p.$$eval('.react-flow__node',x=>x.length));
await p.screenshot({path:S+'j-desc.png'});
// Run on the starting design
await p.click('.sv-run');await p.waitForSelector('.sv-v');console.log('RUN start:',await p.$eval('.sv-v',e=>e.innerText.replace(/\n/g,' | ')));
console.log('  why:',await p.$$eval('.sv-why li',x=>x.slice(0,2).map(e=>e.textContent).join(' || ')));
await p.screenshot({path:S+'j-run-fail.png'});
// put the reference design in place (as if built on the canvas) and reload
const ref=JSON.parse(fs.readFileSync((process.env.TK_CONTENT||require('path').join(__dirname,'../../../tech-katta/content'))+'/articles/interview-questions/url-shortener.json','utf8')).practice.reference;
const s0=await p.evaluate(()=>localStorage.getItem('tk-lab-v1'));await p.close();
const st=JSON.parse(s0);Object.assign(st.designs['q-url-shortener'],{nodes:ref.nodes,edges:ref.edges,updated:Date.now()});
await ctx.addInitScript(v=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('tk-lab-v1',v);sessionStorage.setItem('seeded','1')}},JSON.stringify(st));
p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(B+'/dashboard/#problems/url-shortener');await p.waitForSelector('.react-flow__node',{timeout:15000});await p.waitForTimeout(800);
console.log('nodes now',await p.$$eval('.react-flow__node',x=>x.length));
await p.click('.sv-run');await p.waitForSelector('.sv-v');console.log('RUN ref:',await p.$eval('.sv-v',e=>e.innerText.replace(/\n/g,' | ')));
// Submit with an empty answer
await p.click('.sv-submit');await p.waitForSelector('.sv-score');console.log('SUBMIT empty answer:',await p.$eval('.sv-v',e=>e.innerText.replace(/\n/g,' | ')),'|',await p.$eval('.sv-score',e=>e.innerText.replace(/\n/g,' ')));
await p.screenshot({path:S+'j-submit1.png'});
// write an answer
await p.click('.sv-tabs button:nth-of-type(1)');await p.waitForSelector('.sv-ans textarea');
await p.fill('.sv-ans textarea','Create a short link for a long URL, with an optional custom alias and an expiry date.\nOpening the short link redirects to the long URL.\nCount clicks.');
const ins=await p.$$('.sv-ans .sv-in input');const vals=['99.9','100','100','1000','300000','40'];for(let k=0;k<ins.length;k++)await ins[k].fill(vals[k]||'1');
await p.selectOption('.sv-ans select:not([aria-label])','eventual').catch(async()=>{const sel=await p.$$('.sv-ans .sv-in select');await sel[0].selectOption('eventual')});
await p.fill('.sv-row input','/{code}');await p.click('.sv-add');const rows=await p.$$('.sv-row');await (await rows[1].$('select')).selectOption('POST');await (await rows[1].$('input')).fill('/v1/links');
// key decisions (tech-katta #227): pick the right option of each, from the tech-katta checkout next to this repo
{const dec=JSON.parse(fs.readFileSync(require('path').join(__dirname,'../../../tech-katta/content/articles/interview-questions/url-shortener.json'),'utf8')).practice.rubric.decisions||[];const boxes=await p.$$('.sv-dec');for(let k=0;k<boxes.length&&k<dec.length;k++)await (await boxes[k].$$('input[type=radio]'))[dec[k].answer].check();console.log('decisions answered',boxes.length)}
await p.screenshot({path:S+'j-answer.png'});
// a hint
await p.click('.sv-tabs button:nth-of-type(2)');await p.click('.sv-hints button');console.log('hint open:',await p.$eval('.sv-hints li.open p',e=>e.textContent.slice(0,60)));
await p.click('.sv-submit');await p.waitForSelector('.sv-score');await p.waitForTimeout(200);console.log('SUBMIT full answer:',await p.$eval('.sv-score',e=>e.innerText.replace(/\n/g,' ')));
await p.click('.sv-tabs button:nth-of-type(1)');await p.waitForSelector('.sv-grade');console.log('graded marks ✓',await p.$$eval('.sv-ans .sv-mk.ok',x=>x.length),'✕',await p.$$eval('.sv-ans .sv-mk.no',x=>x.length));
await p.screenshot({path:S+'j-graded.png',fullPage:false});
await p.click('.sv-tabs button:nth-of-type(3)');console.log('subs rows',await p.$$eval('.sv-subs tbody tr',x=>x.map(e=>e.innerText.replace(/\t/g,' ')).join(' || ')));
await p.goto(B+'/dashboard/#problems');await p.waitForSelector('.qt-table tbody tr');console.log('table row1:',await p.$eval('.qt-table tbody tr',e=>e.innerText.replace(/\s+/g,' ')),'| summary',await p.$eval('.pb-sum',e=>e.textContent));
await p.screenshot({path:S+'j-table.png'});
// solution tab via Interview Questions
await p.goto(B+'/dashboard/#interview-questions/url-shortener');await p.waitForSelector('.sv-q .d-article h1');console.log('solution tab on:',await p.$eval('.sv-tabs .on',e=>e.textContent));
// phone
const ph=await br.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});ph.on('pageerror',e=>errors.push('phone '+e.message));
await ph.goto(B+'/dashboard/#problems/url-shortener');await ph.waitForSelector('.sv-test');console.log('phone overflow',await ph.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth+(innerWidth-390)));await ph.screenshot({path:S+'j-phone.png'});
await ph.click('.sv-run');await ph.waitForSelector('.sv-v');await ph.waitForTimeout(500);console.log('phone run: canvas tab on',await ph.$eval('.sv-tabs .on',e=>e.textContent),'overflow',await ph.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth+(innerWidth-390)));await ph.screenshot({path:S+'j-phone-run.png',fullPage:true});
console.log('errors:',JSON.stringify(errors));await br.close()})();
