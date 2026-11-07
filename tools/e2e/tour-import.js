// Website tour and "import your own architecture". The tour starts by itself on the first visit
// (simulated by hiding navigator.webdriver), steps forward and back, closes on its last step (whose
// button links to the first problem; tour.js follows it) and with Esc, and
// doesn't come back; the Tour button replays it, in the Lab too. Import: typed text becomes a laid-out
// design that runs, mistakes are shown by line and block Create, Export downloads JSON that imports back.
const{chromium}=require('playwright');const fs=require('fs');const B=process.argv[2]||'https://tech.katta.cc';
(async()=>{const br=await require('./open-site.js')(chromium).launch();const ctx=await br.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
await ctx.addInitScript(()=>{Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false})});
const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>m.type()==='error'&&errors.push(m.text()));
const card=async()=>(await p.innerText('.tour-card')).split('\n').slice(0,2).join(' ');
await p.goto(B+'/dashboard/');await p.waitForSelector('.tour-card',{timeout:10000});console.log('auto tour:',await card());
await p.click('.tour-next');await p.waitForTimeout(250);console.log('next:',await card());await p.click('.tour-act >> text=Back');await p.waitForTimeout(250);console.log('back:',await card());
for(let i=0;i<12&&await p.locator('.tour-card').count();i++){if(await p.locator('.tour-card a.tour-next').count()){await p.click('.tour-skip')}else await p.click('.tour-next');await p.waitForTimeout(350)}console.log('closed on the last step:',await p.locator('.tour').count()===0);
await p.reload();await p.waitForSelector('.tabs');await p.waitForTimeout(1500);console.log('no auto tour on return:',await p.locator('.tour').count()===0);
await p.click('.d-tour');await p.waitForSelector('.tour-card');await p.keyboard.press('Escape');await p.waitForTimeout(200);console.log('Esc closes:',await p.locator('.tour').count()===0);
await p.goto(B+'/dashboard/#lab');await p.waitForSelector('.tour-card',{timeout:10000});const n=(await card()).match(/\/ (\d+)/)[1];console.log('lab auto tour:',await card(),'| steps',n);
await p.click('.tour-next');await p.click('.tour-next');await p.waitForTimeout(250);await p.screenshot({path:'/tmp/shots/tour-lab.png'});await p.click('.tour-skip');
// import
await p.click('text=Designs ▾');await p.click('text=Import…');await p.waitForSelector('.lab-import textarea');
await p.fill('.lab-import textarea','Clients 2000 -> Spaceship');await p.waitForTimeout(150);console.log('bad line:',(await p.innerText('.lab-imp-res')).replace(/\n/g,' ').slice(0,90),'| create disabled:',await p.isDisabled('text=Create design'));
const ph=await p.getAttribute('.lab-import textarea','placeholder');await p.fill('.lab-import textarea',ph);await p.waitForTimeout(150);console.log('summary:',(await p.innerText('.lab-imp-res')).split('\n')[0]);
await p.screenshot({path:'/tmp/shots/import.png'});
await p.click('text=Create design');await p.waitForTimeout(600);console.log('imported:',await p.inputValue('.lab-name'),'| nodes',await p.locator('.react-flow__node').count(),'| arrows',await p.locator('.react-flow__edge').count());
await p.click('text=▶ Run traffic');await p.waitForTimeout(1500);console.log('runs:',(await p.innerText('.lab-status')).split('\n').slice(0,3).join(' '));await p.click('text=■ Stop');
await p.click('text=Designs ▾');const[dl]=await Promise.all([p.waitForEvent('download'),p.click('text=Export JSON')]);const file='/tmp/shots/'+dl.suggestedFilename();await dl.saveAs(file);
const j=JSON.parse(fs.readFileSync(file,'utf8'));console.log('export:',dl.suggestedFilename(),j.tk,j.design.nodes.length,'nodes');
await p.click('text=Designs ▾');await p.click('text=Import…');await p.setInputFiles('.lab-imp-file input',file);await p.waitForTimeout(300);console.log('file summary:',(await p.innerText('.lab-imp-res')).split('\n')[0]);
await p.click('text=Create design');await p.waitForTimeout(500);console.log('reimported nodes:',await p.locator('.react-flow__node').count());
console.log('errors:',JSON.stringify(errors));await br.close()})();
