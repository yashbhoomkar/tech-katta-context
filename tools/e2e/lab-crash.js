const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const B=(process.argv[2]||'https://tech.katta.cc').replace(/\/$/,'');await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.lab .react-flow__node');await p.evaluate(()=>{localStorage.removeItem('tk-lab-v1');localStorage.removeItem('tk-lab-speed')});await p.reload();await p.waitForSelector('.lab .react-flow__node');await p.waitForTimeout(500);
const st=async()=>(await p.innerText('.lab-status')).replace(/\n/g,' | ');const node=t=>p.locator('.react-flow__node').filter({hasText:t});const pane=()=>p.locator('.react-flow__pane').click({position:{x:40,y:40}});
console.log('default speed:',await p.locator('.lab-speed select option:checked').innerText());
await p.selectOption('.lab-speed select',{label:'1 s = 10 minutes'});
await node('COMPUTE').click();await p.locator('.lab-f',{hasText:'Instances'}).locator('input').fill('3');await node('TRAFFIC').click();await p.locator('.lab-f input[type=number]').fill('1600');await pane();
await p.click('.lab-btn.run');await p.waitForSelector('.ln-down',{timeout:20000});console.log('DB crashed:',await st());console.log('  node:',(await node('STORAGE').innerText()).replace(/\n/g,' '),'| grey edges:',await p.locator('.react-flow__edge.dead').count());await p.screenshot({path:'/tmp/shots/crash1.png'});
await p.waitForTimeout(1500);console.log('log:',(await p.locator('.lab-log li').allInnerTexts()).slice(0,3).map(x=>x.replace(/\n/g,' ')).join(' || '));console.log('credit:',(await p.innerText('.lab-budget span')));
await p.click('.lab-btn.run');
// Server crash loop on a fresh example
await p.click('text=Designs ▾');await p.click('text=+ Example: Zotato order API');await p.waitForTimeout(400);await node('TRAFFIC').click();await p.locator('.lab-f input[type=number]').fill('2400');await pane();
await p.click('.lab-btn.run');await p.waitForFunction(()=>[...document.querySelectorAll('.lab-log li')].filter(l=>l.innerText.includes('Server crashed')).length>=2,null,{timeout:30000});
console.log('crash loop log:',(await p.locator('.lab-log li').allInnerTexts()).slice(0,4).map(x=>x.replace(/\n/g,' ')).join(' || '));console.log('status:',await st());await p.waitForSelector('.ln-down',{timeout:10000});await p.screenshot({path:'/tmp/shots/crash2.png'});
console.log('errors:',errs);await b.close()})();
