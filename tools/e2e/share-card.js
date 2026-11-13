// Spec 24 G6: "Share as image" after Accepted makes a 1200x630 PNG with no name. node card.js <base>; TK_APP = app repo
const { chromium, devices } = require("playwright");const fs=require("fs");const base=process.argv[2]||"http://localhost:5482";
const ok=(n,c,x="")=>console.log(`${c?"PASS":"FAIL"} ${n}${x?" — "+x:""}`);fs.mkdirSync("/tmp/shots",{recursive:true});
const ref=JSON.parse(fs.readFileSync((process.env.TK_APP||"/home/user/tech-katta")+"/content/problems2/001-url-shortener.json","utf8")).reference;
(async()=>{const b=await chromium.launch();const errs=[];
for(const [name,opts,theme] of [["phone",{...devices["Pixel 7"],acceptDownloads:true},"dark"],["desktop",{viewport:{width:1366,height:900},acceptDownloads:true},"light"]]){
const c=await b.newContext(opts);const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));await p.addInitScript(([r,t])=>{try{localStorage.setItem("tk-practice-src-1",r);localStorage.setItem("tk-theme",t)}catch{}},[ref,theme]);
await p.goto(base+"/dashboard/#practice/url-shortener",{waitUntil:"networkidle"});await p.waitForTimeout(500);
ok(name+": no card button before a run",await p.getByRole("button",{name:"Share as image"}).count()===0);
await p.getByRole("button",{name:/Run/}).first().click();await p.waitForTimeout(700);
const btn=p.getByRole("button",{name:"Share as image"});ok(name+": card button after Accepted",await btn.count()===1);
const [dl]=await Promise.all([p.waitForEvent("download",{timeout:15000}),btn.click()]);const path=`/tmp/shots/card-${name}.png`;await dl.saveAs(path);
const buf=fs.readFileSync(path);const w=buf.readUInt32BE(16),h=buf.readUInt32BE(20);ok(name+": a 1200x630 PNG is saved",w===1200&&h===630,`${dl.suggestedFilename()} ${w}x${h} ${buf.length} bytes`);
await p.waitForTimeout(300);ok(name+": the button says it was saved",/saved/.test(await p.locator(".pc-row").innerText()));
await c.close()}
await b.close();console.log("errors:",JSON.stringify(errs))})();
