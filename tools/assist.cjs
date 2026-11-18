const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('https://english-zone-academy.englishzoneabc123.workers.dev/?v='+Date.now()+'#/register',{waitUntil:'load'}); await p.waitForTimeout(7000);
const t=await p.evaluate(()=>(document.querySelector('main')||document.body).innerText.replace(/\n{2,}/g,'\n')); 
const i=t.indexOf('Email'); console.log(t.slice(Math.max(0,i-100),i+600));
console.log('password inputs:',await p.locator('input[type=password]').count());
console.log('errors:',errs.join(' | '));await b.close();})();
