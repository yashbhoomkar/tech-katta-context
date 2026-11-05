const {chromium}=require('playwright');const B=(process.argv[2]||'https://tech.katta.cc').replace(/\/$/,'');(async()=>{const b=await require('./open-site.js')(chromium).launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('console',m=>m.type()==='error'&&errs.push(m.text()));p.on('pageerror',e=>errs.push(e.message));
await p.goto(B+'/');console.log('footer:',await p.innerText('.footer small'),'| github links:',await p.locator('a[href*="github"]').count());
await p.goto(B+'/dashboard/#concepts');await p.waitForTimeout(200);console.log('list:',await p.innerText('.d-list>span'));await p.screenshot({path:'/tmp/shots/a-list.png'});
await p.click('.d-list a');await p.waitForTimeout(200);console.log('url:',p.url(),'| title:',await p.title(),'| sub active:',await p.innerText('.side-sub a.active'),'| meta:',await p.innerText('.d-meta'));
await p.screenshot({path:'/tmp/shots/a1440.png',fullPage:true});
await p.click('.crumbs a');await p.waitForTimeout(150);console.log('crumb back h1:',await p.innerText('h1'));
await p.goto(B+'/dashboard/#concepts/%');console.log('bad encoding h1:',await p.innerText('h1'));await p.goto(B+'/dashboard/#concepts/nope');console.log('bad slug h1:',await p.innerText('h1'));
await p.setViewportSize({width:390,height:844});await p.goto(B+'/dashboard/#concepts/api-types');await p.waitForTimeout(300);await p.screenshot({path:'/tmp/shots/a390.png',fullPage:true});
const ws=[];for(let w=320;w<=760;w+=10)ws.push(w);for(let w=800;w<=1440;w+=40)ws.push(w);const bad=[];
for(const u of ['/dashboard/#concepts/api-types','/dashboard/#quick-notes','/']){await p.setViewportSize({width:320,height:900});await p.goto(B+u);await p.waitForTimeout(400);for(const w of ws){await p.setViewportSize({width:w,height:900});if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))bad.push(u+'@'+w)}}
console.log('overflow:',bad,'| errors:',errs);await b.close()})();
