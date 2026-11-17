// يركّب صورًا إعلانية منسقة من لقطات الموقع (إطار هاتف وحاسوب + عنوان)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const SHOTS = path.resolve('shots');
const OUT = path.resolve('shots/promo');
const URL_TEXT = 'english-zone-academy.englishzoneabc123.workers.dev';
const img = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const has = (f) => fs.existsSync(path.join(SHOTS, f));

const css = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@500;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Tajawal',sans-serif;direction:rtl}
.canvas{position:relative;overflow:hidden;background:radial-gradient(circle at 30% 20%,#1b3360 0%,#0A192F 55%,#060D1A 100%);color:#fff}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(212,175,55,.18) 1px,transparent 1px);background-size:26px 26px}
.glow{position:absolute;width:620px;height:620px;border-radius:50%;background:rgba(212,175,55,.16);filter:blur(90px)}
.badge{display:inline-block;padding:10px 22px;border-radius:999px;border:1.5px solid rgba(212,175,55,.6);color:#F3E5AB;font-weight:700;font-size:26px;background:rgba(255,255,255,.05)}
h1{font-weight:800;line-height:1.25}
.gold{background:linear-gradient(90deg,#D4AF37,#F3E5AB,#D4AF37);-webkit-background-clip:text;color:transparent}
.sub{color:#cfd6e4;line-height:1.6;font-weight:500}
.url{direction:ltr;display:inline-block;padding:12px 26px;border-radius:16px;background:linear-gradient(90deg,#D4AF37,#F3E5AB,#D4AF37);color:#0A192F;font-weight:800}
.phone{position:absolute;border-radius:54px;background:#0b0b0b;padding:14px;box-shadow:0 40px 90px rgba(0,0,0,.55),0 0 0 2px rgba(212,175,55,.35)}
.phone .scr{width:100%;height:100%;border-radius:42px;overflow:hidden;background:#fff}
.phone .scr img{width:100%;display:block}
.phone:after{content:'';position:absolute;top:24px;left:50%;transform:translateX(-50%);width:110px;height:28px;border-radius:20px;background:#0b0b0b}
.laptop{position:absolute}
.laptop .lid{border-radius:22px 22px 0 0;background:#111;padding:16px 16px 18px;box-shadow:0 40px 90px rgba(0,0,0,.5),0 0 0 2px rgba(212,175,55,.3)}
.laptop .lid .scr{border-radius:8px;overflow:hidden;background:#fff}
.laptop .lid img{width:100%;display:block}
.laptop .base{height:26px;margin:0 -60px;border-radius:0 0 26px 26px;background:linear-gradient(#cfd2d8,#9aa0aa)}
.logo{display:flex;align-items:center;gap:14px;font-weight:800;letter-spacing:2px;color:#F3E5AB}
`;

const page = (w, h, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="canvas" style="width:${w}px;height:${h}px">${body}</div></body></html>`;

const phone = (file, x, y, w, crop = 0.62) =>
  `<div class="phone" style="left:${x}px;top:${y}px;width:${w}px;height:${Math.round(w * 2.05)}px"><div class="scr"><img src="${img(path.join(SHOTS, file))}"></div></div>`;

const laptop = (file, x, y, w) =>
  `<div class="laptop" style="left:${x}px;top:${y}px;width:${w}px"><div class="lid"><div class="scr"><img src="${img(path.join(SHOTS, file))}"></div></div><div class="base"></div></div>`;

// منشورات عمودية 1080x1350
const posts = [
  {
    name: '01-hero',
    need: ['desktop-home.png', 'mobile-home.png'],
    body: () => `
      <div class="dots"></div><div class="glow" style="top:-120px;left:-160px"></div>
      <div style="position:absolute;top:80px;left:0;right:0;text-align:center;padding:0 70px">
        <span class="badge">منصة تعليمية متكاملة</span>
        <h1 style="font-size:76px;margin-top:28px">أكاديمية <span class="gold">English Zone</span></h1>
        <p class="sub" style="font-size:34px;margin-top:18px">تعلّم الإنجليزية بثقة — مجموعات صغيرة، منهج وفق CEFR، ومتابعة شهرية لكل طالب</p>
      </div>
      ${laptop('desktop-home.png', 70, 560, 760)}
      ${phone('mobile-home.png', 700, 520, 300)}
      <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center"><span class="url" style="font-size:28px">${URL_TEXT}</span></div>`
  },
  {
    name: '02-curriculum',
    need: ['mobile-curriculum.png', 'desktop-curriculum.png'],
    body: () => `
      <div class="dots"></div><div class="glow" style="bottom:-200px;right:-160px"></div>
      <div style="position:absolute;top:90px;right:70px;left:520px">
        <span class="badge">المنهج الدراسي</span>
        <h1 style="font-size:66px;margin-top:28px">من <span class="gold">A1</span> إلى <span class="gold">C2</span></h1>
        <p class="sub" style="font-size:32px;margin-top:22px">6 مستويات و18 مرحلة، خطة واضحة لكل طالب، ومواد المنهج من كتب وصوتيات وفيديو داخل لوحة الطالب.</p>
        <div style="margin-top:40px"><span class="url" style="font-size:24px">${URL_TEXT}</span></div>
      </div>
      ${phone('mobile-curriculum.png', 80, 150, 400)}`
  },
  {
    name: '03-reviews',
    need: ['mobile-testimonials.png'],
    body: () => `
      <div class="dots"></div><div class="glow" style="top:-160px;right:-120px"></div>
      <div style="position:absolute;top:90px;left:70px;right:520px">
        <span class="badge">آراء حقيقية</span>
        <h1 style="font-size:66px;margin-top:28px">طلابنا <span class="gold">يتحدثون</span></h1>
        <p class="sub" style="font-size:32px;margin-top:22px">لقطات حقيقية من تجارب طلابنا وأولياء الأمور مع أكاديمية English Zone.</p>
        <div style="margin-top:40px"><span class="url" style="font-size:24px">${URL_TEXT}</span></div>
      </div>
      ${phone('mobile-testimonials.png', 600, 150, 400)}`
  },
  {
    name: '04-pricing',
    need: ['mobile-pricing.png'],
    body: () => `
      <div class="dots"></div><div class="glow" style="bottom:-200px;left:-160px"></div>
      <div style="position:absolute;top:90px;right:70px;left:520px">
        <span class="badge">الأسعار</span>
        <h1 style="font-size:66px;margin-top:28px">ادفع <span class="gold">شهريًا</span></h1>
        <p class="sub" style="font-size:32px;margin-top:22px">لكل مستوى سعر شهري واضح، بدون التزام بالدفع لستة أشهر مقدمًا.</p>
        <div style="margin-top:40px"><span class="url" style="font-size:24px">${URL_TEXT}</span></div>
      </div>
      ${phone('mobile-pricing.png', 80, 150, 400)}`
  },
  {
    name: '05-avatar',
    need: [],
    body: () => `
      <div class="dots"></div><div class="glow" style="top:-120px;left:200px"></div>
      <div style="position:absolute;top:90px;left:0;right:0;text-align:center;padding:0 70px">
        <span class="badge">لوحة الطالب</span>
        <h1 style="font-size:70px;margin-top:28px">صمّم <span class="gold">شخصيتك</span></h1>
        <p class="sub" style="font-size:32px;margin-top:18px">أفاتار للأولاد والبنات بملابس محتشمة وعصرية، وحجاب بأنواعه، وملابس للمناسبات</p>
      </div>
      <div style="position:absolute;top:470px;left:60px;right:60px;border-radius:36px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.45)"><img src="${img(path.resolve('tools/avatars.png'))}" style="width:100%;display:block"></div>
      <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center"><span class="url" style="font-size:28px">${URL_TEXT}</span></div>`
  },
  {
    name: '06-register',
    need: ['mobile-register.png', 'mobile-english-club.png'],
    body: () => `
      <div class="dots"></div><div class="glow" style="top:300px;left:200px"></div>
      <div style="position:absolute;top:80px;left:0;right:0;text-align:center;padding:0 70px">
        <span class="badge">التسجيل مفتوح</span>
        <h1 style="font-size:72px;margin-top:28px">ابدأ رحلتك <span class="gold">الآن</span></h1>
        <p class="sub" style="font-size:32px;margin-top:18px">سجّل من الموقع، أو انضم إلى نادي المحادثة الإنجليزية</p>
      </div>
      ${phone('mobile-register.png', 130, 400, 380)}
      ${phone('mobile-english-club.png', 570, 440, 380)}`
  }
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const post of posts) {
    if (!post.need.every(has)) continue;
    await p.setContent(page(1080, 1350, post.body()), { waitUntil: 'networkidle' });
    await p.waitForTimeout(800);
    await p.screenshot({ path: path.join(OUT, `${post.name}.png`) });
    console.log('promo', post.name);
  }
  await browser.close();
})();
