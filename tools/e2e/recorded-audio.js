const {chromium}=require('playwright');const B=(process.argv[2]||'https://tech.katta.cc').replace(/\/$/,'');(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const ctx=await b.newContext();
await ctx.addInitScript(()=>{window.__spoken=[];const ss={_t:null,_u:null,getVoices:()=>[{name:'Google UK English Female',lang:'en-GB'}],speak(u){window.__spoken.push(u.text);this._u=u;this._t=setTimeout(()=>{u.onend&&u.onend()},150)},cancel(){clearTimeout(this._t);const u=this._u;this._u=null;u&&u.onerror&&u.onerror({error:'interrupted'})}};Object.defineProperty(window,'speechSynthesis',{value:ss});window.SpeechSynthesisUtterance=function(t){this.text=t};
 const P=HTMLMediaElement.prototype.play;window.__played=[];HTMLMediaElement.prototype.play=function(){window.__played.push(this.src.split('/').pop()+'@'+this.playbackRate);return P.call(this)}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(B+'/dashboard/#concepts/api-types');await p.waitForTimeout(600);
console.log('note:',await p.innerText('.r-note'),'| voice opts:',await p.$$eval('.r-voice option',o=>o.map(x=>x.textContent)));
await p.click('.r-btn.primary');await p.waitForTimeout(1200);
const st=()=>p.evaluate(()=>{const a=[...document.querySelectorAll('audio')];return{played:__played,spoken:__spoken.length}});
console.log('after 1.2s:',JSON.stringify(await st()),'| highlight:',await p.evaluate(()=>document.querySelector('.reading')?.className));
await p.click('.r-btn.primary');await p.waitForTimeout(800);console.log('paused btn:',await p.innerText('.r-btn.primary'));
await p.selectOption('.r-rate select','1.5');await p.click('.r-btn.primary');await p.waitForTimeout(300);console.log('resumed:',JSON.stringify(await st()));
// let recorded chunks finish fast
// Fully recorded articles never fall back; partly recorded ones fall back to the device voice per chunk.
await p.waitForTimeout(3000);const s2=await st();console.log(s2.spoken?'fell back to device voice for unrecorded chunks:':'all recorded so far, no device voice:',JSON.stringify({played:s2.played.length,spoken:s2.spoken}));
await p.click('text=■ Stop');
await p.selectOption('.r-voice select',{index:1});await p.click('.r-btn.primary');await p.waitForTimeout(500);console.log('device voice chosen → no audio:',JSON.stringify(await st()),'| note:',await p.innerText('.r-note'));
await p.click('text=■ Stop');console.log('errors:',errs);await b.close()})();
