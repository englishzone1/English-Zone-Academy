const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
for(const r of ['pricing','offers']){ await p.goto('https://english-zone-academy.englishzoneabc123.workers.dev/#/'+r,{waitUntil:'load'}); await p.waitForTimeout(9000);
 const t=await p.evaluate(()=>document.querySelector('main')?document.querySelector('main').innerText:document.body.innerText); console.log('=====',r,'\n'+t.replace(/\n{2,}/g,'\n')); }
await b.close();})();
