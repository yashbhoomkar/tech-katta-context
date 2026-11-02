// Learn tab, real-life analogies and Lab challenges: the dashboard opens on Learn, levels switch and
// are remembered, an article shows its "In real life" analogies and marks its step done, a challenge
// opens from #lab/<id>, its starting design scores 0 stars, a fixed design scores 3, and Learn shows
// the stars.
const{chromium}=require('playwright');const B=process.argv[2]||'https://tech.katta.cc';
(async()=>{const br=await chromium.launch();const p=await (await br.newContext({viewport:{width:1440,height:900}})).newPage();const errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&errors.push(m.text()));
await p.goto(B+'/dashboard/');await p.waitForSelector('.learn-levels');
console.log('opens on:',await p.innerText('h1'),'| levels:',await p.locator('.learn-level').count(),'| steps:',await p.locator('.learn-steps li').count());
await p.click('.learn-level >> nth=1');await p.waitForTimeout(200);console.log('intermediate steps:',(await p.$$eval('.learn-steps b',a=>a.map(x=>x.textContent))).join(' | '));
await p.reload();await p.waitForSelector('.learn-levels');console.log('remembered level:',await p.getAttribute('.learn-level.on','aria-checked'),await p.innerText('.learn-level.on b'));
await p.goto(B+'/dashboard/#concepts/api-types');await p.waitForSelector('.a-analogy');
console.log('analogy:',(await p.innerText('.a-analogy')).replace(/\n/g,' ').slice(0,90),'| "In real life" on cards:',await p.locator('.a-type dt.like').count());
await p.goto(B+'/dashboard/#learn');await p.click('.learn-level >> nth=0');await p.waitForTimeout(200);console.log('beginner step 1 done:',await p.getAttribute('.learn-steps li >> nth=0','class'));
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
await p.waitForTimeout(600);await p.goto(B+'/dashboard/#learn');await p.waitForSelector('.learn-steps');
console.log('learn after:',(await p.$$eval('.learn-steps li',a=>a.map(x=>x.className+':'+x.querySelector('em').textContent))).join(' | '));
console.log('errors:',JSON.stringify(errors));await br.close()})();
