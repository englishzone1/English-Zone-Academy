// يلتقط صورًا لصفحات الموقع العامة (عربي) للكمبيوتر والهاتف
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = 'https://english-zone-academy.englishzoneabc123.workers.dev/';
const pages = ['home', 'pricing', 'curriculum', 'offers', 'testimonials', 'english-club', 'blog', 'contact', 'register', 'login'];
const devices = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, scale: 1 },
  { name: 'mobile', viewport: { width: 390, height: 844 }, scale: 2, isMobile: true }
];
(async () => {
  fs.mkdirSync('shots', { recursive: true });
  const browser = await chromium.launch();
  for (const d of devices) {
    const ctx = await browser.newContext({ viewport: d.viewport, deviceScaleFactor: d.scale, isMobile: !!d.isMobile, hasTouch: !!d.isMobile, locale: 'ar' });
    await ctx.addInitScript(() => localStorage.setItem('english_zone_lang', 'ar'));
    const page = await ctx.newPage();
    for (const p of pages) {
      await page.goto(`${BASE}#/${p}`, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `shots/${d.name}-${p}.png` });
      await page.screenshot({ path: `shots/${d.name}-${p}-full.png`, fullPage: true });
      console.log('ok', d.name, p);
    }
    await ctx.close();
  }
  await browser.close();
})();
