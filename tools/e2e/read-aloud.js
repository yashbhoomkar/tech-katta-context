const {chromium}=require('playwright');const B=(process.argv[2]||'https://tech.katta.cc').replace(/\/$/,'');(async()=>{const b=await require('./open-site.js')(chromium).launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});
// fake speech engine: each utterance "ends" after 120 ms; log what was spoken
await ctx.addInitScript(()=>{localStorage.setItem('tk-voice','fake');window.__spoken=[];const ss={speaking:false,_t:null,_u:null,getVoices:()=>[{lang:'en-IN',name:'fake'}],speak(u){window.__spoken.push({t:u.text,r:u.rate});this._u=u;this._t=setTimeout(()=>{this._u=null;u.onend&&u.onend()},400)},cancel(){clearTimeout(this._t);const u=this._u;this._u=null;u&&u.onerror&&u.onerror({error:'interrupted'})},pause(){},resume(){}};Object.defineProperty(window,'speechSynthesis',{value:ss});window.SpeechSynthesisUtterance=function(t){this.text=t}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(B+'/dashboard/#concepts/api-types');await p.waitForTimeout(300);
console.log('reader:',await p.innerText('.reader'));
await p.click('.r-btn.primary');await p.waitForTimeout(500);
console.log('playing:',await p.innerText('.r-btn.primary'),'| reading el:',await p.evaluate(()=>document.querySelector('.reading')?.tagName+'.'+document.querySelector('.reading')?.className));
await p.waitForTimeout(900);await p.screenshot({path:'/tmp/shots/reading.png'});
await p.click('.r-btn.primary');const n1=await p.evaluate(()=>__spoken.length);await p.waitForTimeout(500);const n2=await p.evaluate(()=>__spoken.length);
console.log('paused:',await p.innerText('.r-btn.primary'),'| no progress while paused:',n1===n2);
await p.selectOption('.r-rate select','1.5');await p.click('.r-btn.primary');await p.waitForTimeout(300);console.log('resumed at rate:',await p.evaluate(()=>__spoken.at(-1).r),'| repeats chunk:',await p.evaluate(()=>__spoken.at(-1).t===__spoken[__spoken.length-2].t));
await p.click('text=■ Stop');console.log('stopped:',await p.innerText('.r-btn.primary'),'| highlight gone:',await p.locator('.reading').count()===0);
console.log('chunks max len:',await p.evaluate(()=>Math.max(...__spoken.map(s=>s.t.length))),'| sample:',await p.evaluate(()=>__spoken.slice(0,3).map(s=>s.t.slice(0,80))));
// play to the end quickly
await p.click('.r-btn.primary');await p.waitForFunction(()=>document.querySelector('.r-btn.primary').textContent.includes('Listen'),null,{timeout:60000});const all=await p.evaluate(()=>__spoken.map(s=>s.t).join(' '));console.log('finished; total spoken chunks:',await p.evaluate(()=>__spoken.length),'| has backticks:',all.includes('`'),'| has In Zotato:',all.includes('In Zotato'),'| has table:',all.includes('Comparison table'));
// navigation stops reading
await p.click('.r-btn.primary');await p.waitForTimeout(200);await p.click('.crumbs a');await p.waitForTimeout(300);const c1=await p.evaluate(()=>__spoken.length);await p.waitForTimeout(500);console.log('stops on navigation:',c1===await p.evaluate(()=>__spoken.length));
// animation frames
await p.goto(B+'/dashboard/#concepts/api-types');await p.waitForTimeout(300);
for(const t of [1.2,3.0,4.4]){await p.evaluate(t=>{const s=document.querySelector('.a-fig svg');s.pauseAnimations();s.setCurrentTime(t)},t);await p.locator('.a-fig svg').first().screenshot({path:`/tmp/shots/anim${t}.png`})}
console.log('dots:',await p.locator('.a-fig').first().locator('circle').count(),'| all figs:',await p.locator('.a-fig circle').count());
const rm=await b.newPage({reducedMotion:'reduce'});await rm.goto(B+'/dashboard/#concepts/api-types');await rm.waitForTimeout(300);console.log('reduced motion dots:',await rm.locator('.a-fig circle').count());
// no speech support -> no reader
const p3=await b.newPage();await p3.addInitScript(()=>{delete window.speechSynthesis;Object.defineProperty(window,'speechSynthesis',{value:undefined});});await p3.goto(B+'/dashboard/#concepts/api-types');await p3.waitForTimeout(300);
console.log('errors:',errs);await b.close()})();
