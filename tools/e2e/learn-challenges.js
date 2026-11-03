// Dashboard, real-life analogies and Lab challenges: the dashboard opens on Concepts (no Learn tab,
// removed 11-03), an article shows its "In real life" analogies, a challenge opens from #lab/<id>, its
// starting design scores 0 stars, a fixed design scores 3, and the Challenges button counts them.
const{chromium}=require('playwright');const B=process.argv[2]||'https://tech.katta.cc';
(async()=>{const br=await chromium.launch();const p=await (await br.newContext({viewport:{width:1440,height:900}})).newPage();const errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&errors.push(m.text()));
await p.goto(B+'/dashboard/');await p.waitForSelector('.tabs');await p.waitForTimeout(400);console.log('opens with no tab selected:',await p.locator('.tabs a.active').count()===0,'| empty:',(await p.locator('main .d-panel').count())===0,'| Learn tab:',await p.locator('.tabs a[href="#learn"]').count());
await p.goto(B+'/dashboard/#concepts/api-types');await p.waitForSelector('.a-analogy');
console.log('analogy:',(await p.innerText('.a-analogy')).replace(/\n/g,' ').slice(0,90),'| "In real life" on cards:',await p.locator('.a-type dt.like').count());
await p.goto(B+'/dashboard/#lab/one-server');await p.waitForSelector('.lab-ch');
console.log('challenge design:',await p.inputValue('.lab-name'),'| goals:',await p.locator('.lab-ch .lab-goals li').count());
await p.click('text=Score my design');await p.waitForSelector('.lab-score');
console.log('start score:',(await p.innerText('.lab-score')).replace(/\n/g,' ').slice(0,260));
await p.click('text=Keep improving');
await p.locator('.react-flow__node[data-id="clients"]').click();await p.waitForTimeout(150);console.log('clients note:',(await p.innerText('.lab-ins .lab-like >> nth=0')).replace(/\n/g,' ').slice(0,110));
await p.locator('.react-flow__node[data-id="api"]').click();await p.waitForTimeout(150);console.log('server real life:',(await p.innerText('.lab-ins .lab-like')).replace(/\n/g,' ').slice(0,80));
await p.fill('.lab-f:has-text("Instances") input[type=number]','4');
await p.locator('.react-flow__node[data-id="db"]').click();await p.waitForTimeout(150);await p.selectOption('.lab-f:has-text("Size") select','db.m5.xlarge');
await p.click('.react-flow__pane',{position:{x:60,y:600}});await p.waitForTimeout(200);
await p.click('text=Score my design');await p.waitForSelector('.lab-score');
console.log('fixed score:',(await p.innerText('.lab-score')).replace(/\n/g,' ').slice(0,260));
await p.screenshot({path:'/tmp/shots/challenge-score.png'});
await p.click('text=Keep improving');await p.click('text=/^Challenges/');await p.waitForTimeout(150);
console.log('menu:',(await p.innerText('.lab-menu')).split('\n').slice(0,4).join(' | '),'| button:',await p.innerText('button:has-text("Challenges")'));
await p.waitForTimeout(600);await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.lab-ch-btn');console.log('stars on the Challenges button:',await p.innerText('.lab-ch-btn'));
// every dashboard tab renders (no "Something went wrong" from the error boundary)
const tabs=await p.$$eval('.tabs a',a=>a.map(x=>x.getAttribute('href')));const bad=[];for(const h of tabs){await p.goto(B+'/dashboard/'+h);await p.waitForTimeout(700);if(await p.locator('text=Something went wrong').count()||!(await p.locator('main h1, .lab-name').count()))bad.push(h)}
console.log('tabs:',tabs.join(' '),'| broken:',JSON.stringify(bad));if(bad.length)errors.push('broken tabs '+bad.join(','));
console.log('errors:',JSON.stringify(errors));await br.close()})();
