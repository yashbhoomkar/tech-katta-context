// v2 challenges in the browser: each opens on a v2 canvas with its challenge box, its start scores 0 stars,
// and one-server fixed in the inspector scores every star.
const{chromium}=require('playwright');const B=process.argv[2]||'https://tech.katta.cc';
const IDS=['one-server','first-rush','flash-sale','read-heavy','sms-link','monday-sync','cache-restart','lost-orders'];
(async()=>{const br=await require("./open-site.js")(chromium).launch();const p=await(await br.newContext({viewport:{width:1440,height:900}})).newPage();const errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&!/\/v1\/me|_vercel|favicon|401|503|404/.test(m.text())&&errors.push(m.text()));
for(const id of IDS){await p.goto(B+'/dashboard/#problems/challenge/'+id);await p.waitForSelector('.lab-ch',{timeout:20000});
 const v1=await p.locator('.lab-budget').count();const goals=await p.locator('.lab-ch .lab-goals li').count();
 await p.click('text=Score my design');await p.waitForSelector('.lab-score',{timeout:60000});
 const t=(await p.innerText('.lab-score')).replace(/\n/g,' ');const stars=await p.getAttribute('.lab-score .lab-stars','aria-label');
 console.log(id.padEnd(14),'| v1 controls:',v1,'| goals:',goals,'|',stars,'|',t.slice(0,150));
 if(v1||stars!=='0 of 3 stars')errors.push(id+': '+stars);await p.click('text=Keep improving')}
// fix one-server: five instances
await p.goto(B+'/dashboard/#problems/challenge/one-server');await p.waitForSelector('.lab-ch');
await p.locator('.react-flow__node[data-id="api"]').click();await p.waitForTimeout(300);
const ins=(await p.innerText('.lab-ins')).replace(/\n/g,' | ');console.log('inspector:',ins.slice(0,200));
const f=p.locator('.lab-ins label:has-text("Instances") input, .lab-ins .lab-f:has-text("Instances") input[type=number]').first();await f.fill('5');await f.press('Tab');
await p.click('.react-flow__pane',{position:{x:60,y:600}});await p.waitForTimeout(300);
await p.click('text=Score my design');await p.waitForSelector('.lab-score',{timeout:60000});
const stars=await p.getAttribute('.lab-score .lab-stars','aria-label');console.log('fixed:',stars,'|',(await p.innerText('.lab-score')).replace(/\n/g,' ').slice(0,200));
if(stars!=='3 of 3 stars')errors.push('fixed one-server: '+stars);
console.log('errors:',JSON.stringify(errors));await br.close()})();
