// Regression for the QA findings on keyboard use and small Lab issues: connect and remove arrows from
// the component panel (M6), Back returns to the same place in an article (M8), the tour card takes
// focus and keeps Tab (M9), menus close on Esc and outside clicks (L1), a heading for the Lab (L2), an
// unknown challenge link says so (L3), numbers stay after Stop (L18), MENU has aria-expanded and
// closes on Esc (L24).
const{chromium,devices}=require('playwright');const B=process.argv[2]||'https://tech.katta.cc';
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();const errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&errors.push(m.text()));
await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.react-flow__node');console.log('lab h1:',await p.locator('.lab h1').innerText());
// M6: select the database's left neighbour by keyboard-reachable panel: add a Cache, connect Server → Cache from the panel
await p.click('.lab-item:has-text("Cache")');await p.waitForTimeout(200);
const sv=p.locator('.react-flow__node').filter({hasText:'Server'}).first();await sv.click();await p.waitForTimeout(200);
const opts=await p.$$eval('.lab-conn select option',a=>a.map(o=>o.textContent));console.log('connect to options:',opts.join(' | '));
const before=await p.locator('.react-flow__edge').count();await p.selectOption('.lab-conn select',{label:'Cache'});await p.waitForTimeout(200);console.log('arrows',before,'→',await p.locator('.react-flow__edge').count());
await p.click('.lab-conn button[aria-label="Remove the arrow to Cache"]');await p.waitForTimeout(200);console.log('after remove:',await p.locator('.react-flow__edge').count());
// L1: menus close on Esc / outside
await p.click('.lab-designs-btn');await p.keyboard.press('Escape');await p.waitForTimeout(100);console.log('menu after Esc:',await p.locator('.lab-menu').count());
await p.click('.lab-ch-btn');await p.mouse.click(700,600);await p.waitForTimeout(100);console.log('menu after outside click:',await p.locator('.lab-menu').count());
// L18: numbers stay after Stop
await p.click('.lab-btn.run');await p.waitForTimeout(1200);await p.click('.lab-btn.run');await p.waitForTimeout(200);console.log('after stop:',(await p.innerText('.lab-status')).split('\n').slice(0,3).join(' '));
// L3
await p.goto(B+'/dashboard/#lab/no-such-thing');await p.reload();await p.waitForSelector('.lab-status');console.log('unknown challenge:',await p.innerText('.lab-status'));
// M8: Back returns to the same place
await p.goto(B+'/dashboard/#concepts/api-types');await p.waitForSelector('.a-analogy');await p.evaluate(()=>scrollTo(0,3000));await p.waitForTimeout(300);
await p.click('.tabs a[href="#lab"]');await p.waitForSelector('.lab-name');console.log('after link, scrollY:',await p.evaluate(()=>scrollY));
await p.goBack();await p.waitForSelector('.a-analogy');await p.waitForTimeout(1200);console.log('after Back, scrollY:',await p.evaluate(()=>Math.round(scrollY)));
// M9: tour focus
await p.goto(B+'/dashboard/#learn');await p.waitForSelector('.learn-levels');await p.click('.d-tour');await p.waitForSelector('.tour-card');await p.waitForTimeout(300);
const inCard=()=>p.evaluate(()=>!!document.activeElement?.closest('.tour-card'));console.log('tour focus on card:',await inCard());
for(let i=0;i<6;i++)await p.keyboard.press('Tab');console.log('after 6 Tabs still in card:',await inCard());await p.keyboard.press('Escape');
// L24
const m=await (await br.newContext(devices['iPhone 13'])).newPage();await m.goto(B+'/');await m.waitForSelector('.menu');console.log('MENU aria-expanded:',await m.getAttribute('.menu','aria-expanded'));await m.tap('.menu');console.log('open:',await m.getAttribute('.menu','aria-expanded'));await m.keyboard.press('Escape');await m.waitForTimeout(100);console.log('after Esc:',await m.getAttribute('.menu','aria-expanded'));
console.log('errors:',JSON.stringify(errors));await br.close()})();
