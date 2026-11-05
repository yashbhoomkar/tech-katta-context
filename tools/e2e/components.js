// Components section: subsections (dashboard.groups), sidebar subs, every Components article opens,
// its figures fit at 320 px and open full screen, the "Try it in the Lab" card opens its challenge.
// Usage: node components.js <site>
const{chromium,devices}=require('playwright');(async()=>{const B=(process.argv[2]||'https://tech.katta.cc').replace(/\/$/,'');const b=await require('./open-site.js')(chromium).launch();const errors=[];
const page=async(opt)=>{const ctx=await b.newContext({deviceScaleFactor:1,...opt});await ctx.addInitScript(()=>{try{localStorage.setItem('tk-progress-v1',JSON.stringify({steps:{'tour:dashboard':true,'tour:lab':true}}))}catch{}});const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});return p};
const p=await page({viewport:{width:1440,height:900}});
await p.goto(B+'/dashboard/#components');await p.waitForSelector('.d-group');
console.log('subsections:',await p.$$eval('.d-group',g=>g.map(x=>`${x.querySelector('h2').textContent} (${x.querySelectorAll('li').length})`).join(' | ')));
console.log('sidebar:',(await p.innerText('.side-sub')).replace(/\n/g,' / '));
const links=await p.$$eval('.d-group li a',a=>a.map(x=>x.getAttribute('href')));
for(const h of links){await p.goto(B+'/dashboard/'+h);await p.waitForSelector('.d-article h1');
  const figs=await p.$$eval('.a-fig-head',e=>e.map(x=>x.textContent.split(' — ')[0]));const lab=await p.$$eval('.a-lab',e=>e.map(x=>x.getAttribute('href')));
  console.log(h,'→',await p.innerText('h1'),'| figs',figs.length,'| lab',lab.join(','));
  for(const to of lab){await p.click(`.a-lab[href="${to}"]`);await p.waitForTimeout(2500);const sub=to.split('/')[1];
    const ok=sub?await p.evaluate(()=>!!document.querySelector('.react-flow')):true;console.log('  lab card →',p.url().split('#')[1],ok?'(Lab open)':'(Lab NOT open)');await p.goBack();await p.waitForSelector('.d-article h1')}}
const m=await page({viewport:{width:320,height:640},isMobile:true,hasTouch:true});
for(const h of links){await m.goto(B+'/dashboard/'+h);await m.waitForSelector('.d-article h1');await m.waitForTimeout(500);
  const ov=await m.evaluate(()=>document.documentElement.scrollWidth-innerWidth);const wide=await m.$$eval('.a-fig svg',s=>s.filter(x=>x.getBoundingClientRect().right>innerWidth+1).length);
  const btn=await m.$('.fs-btn');let fs='no figure';if(btn){await btn.click();await m.waitForSelector('.fs');fs='full screen opens';await m.keyboard.press('Escape');await m.waitForSelector('.fs',{state:'detached'})}
  console.log('320 px',h,'| overflow',ov,'| figures wider than the screen',wide,'|',fs)}
console.log('errors:',JSON.stringify(errors));await b.close()})();
