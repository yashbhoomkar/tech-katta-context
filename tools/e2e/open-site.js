// Production checks drive pages that need a signed-in visitor (the landing Lab since #154, the dashboard
// tabs since #159). Wrap `chromium` with this and every page gets the API's sign-in config answered
// with "off", which opens the site exactly as when sign-in is disabled. Set E2E_SIGNIN=on to leave
// sign-in alone (account.js, landing-lock.js, dashboard-lock.js and analytics.js test the real thing).
//   const{chromium}=require('playwright'); ... require('./open-site.js')(chromium).launch()
module.exports=(chromium)=>({launch:async(opts)=>{const br=await chromium.launch(opts);if(process.env.E2E_SIGNIN==='on')return br;
const off=(ctx)=>ctx.route('**/v1/auth/config',(r)=>r.fulfill({contentType:'application/json',body:'{"enabled":false}',headers:{'access-control-allow-origin':r.request().headers().origin||'*','access-control-allow-credentials':'true'}}));
const newContext=br.newContext.bind(br);br.newContext=async(...a)=>{const ctx=await newContext(...a);await off(ctx);return ctx};
br.newPage=async(...a)=>(await br.newContext(...a)).newPage();return br}});
