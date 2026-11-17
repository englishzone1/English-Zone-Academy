const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('https://english-zone-academy.englishzoneabc123.workers.dev/?v='+Date.now()+'#/home',{waitUntil:'load'}); await p.waitForTimeout(9000);
const btn=p.locator('button[aria-label="المساعد"], button[aria-label="Assistant"]');
console.log('assistant buttons:',await btn.count());
if(await btn.count()){ await btn.first().click(); await p.waitForTimeout(800);
 const inp=p.locator('input[placeholder*="سؤال"], input[placeholder*="question"]'); 
 for(const t of ['بكم السعر','عندي سؤال عن شيء آخر']){ await inp.fill(t); await inp.press('Enter'); await p.waitForTimeout(600); }
 const panel=await p.locator('div.fixed.bottom-5').innerText(); console.log('PANEL:\n'+panel);
 await p.screenshot({path:'/tmp/assist.png'}); }
console.log('errors:',errs.join(' | '));await b.close();})();
