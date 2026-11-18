const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
for(const r of ['join-us','home']){ await p.goto('https://english-zone-academy.englishzoneabc123.workers.dev/?v='+Date.now()+'#/'+r,{waitUntil:'load'}); await p.waitForTimeout(7000);
 const t=await p.evaluate(()=>(document.querySelector('main')||document.body).innerText.replace(/\n{2,}/g,'\n').slice(0,600)); console.log('=====',r,'\n'+t); }
console.log('errors:',errs.join(' | '));await b.close();})();
