import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { FeatureArt, FeatureKind } from './FeatureArt';

interface Props {
  ar: boolean;
  isAuthenticated: boolean;
  navigate: (route: string) => void;
}

interface Slide {
  kind: FeatureKind;
  name: string;
  badge: string;
  title: string;
  desc: string;
  items: string[];
  cta: string;
  route: string;
}

// قسم مميزات الأكاديمية: شرائح مربعة زرقاء في الواجهة، أولها ملخص لكل شيء،
// والشريحة التالية ظاهرة جزئيًا على الجانب، والتقليب دائري بلا نهاية (أسهم، سحب، ضغط على الشريحة الجانبية)
export const FeaturesShowcase: React.FC<Props> = ({ ar, isAuthenticated, navigate }) => {
  const home = isAuthenticated ? 'portal' : 'join-us';
  // النص في الشرائح بصيغة المذكر فقط (طلب الإدارة)
  const slides: Slide[] = ar
    ? [
        {
          kind: 'all',
          name: 'كل المميزات',
          badge: 'باختصار',
          title: 'ليست مجرد دورة إنجليزية… بل تجربة متكاملة تصنع مستقبلك!',
          desc: '',
          items: ['📝 اختبار تحديد مستوى مجاني', '🏅 شهادات معتمدة من بريطانيا', '🎙️ غرف محادثة صوتية', '🎒 حقيبة تعليمية متكاملة', '💻 منصة تعليمية ذكية', '🤝 مجتمع متعلمين ملهم'],
          cta: 'انضم الآن',
          route: home
        },
        {
          kind: 'placement',
          name: 'اختبار تحديد المستوى',
          badge: 'مجاني • وفق معايير CEFR',
          title: 'لا تبدأ عشوائيًا… اكتشف مستواك أولًا!',
          desc: 'اختبر مستواك وتعرّف على نقطة البداية المناسبة لك وفق الإطار الأوروبي المرجعي للغات CEFR، لتبدأ رحلتك بخطوات واضحة.',
          items: [],
          cta: 'اختبر مستواك مجانًا',
          route: home
        },
        {
          kind: 'certs',
          name: 'الشهادات المعتمدة',
          badge: '🇬🇧 معتمدة من بريطانيا • مجانًا',
          title: 'تعلّم، أنجز، واحصل على ما يوثّق تطورك!',
          desc: '3 مزايا وشهادات مجانية ضمن رحلتك التعليمية، دون رسوم إضافية.',
          items: ['شهادة تطوير مهني معتمدة من بريطانيا.', 'شهادة إثبات مستوى اللغة وفق معايير دولية.', 'شهادة إتمام موثقة برقم فريد للتحقق.'],
          cta: 'ابدأ رحلتك',
          route: home
        },
        {
          kind: 'rooms',
          name: 'غرف المحادثة الصوتية',
          badge: 'فرصة مجانية للمسجلين',
          title: 'تفهم الإنجليزية وتخجل من التحدث؟ حان وقت التغيير!',
          desc: 'الممارسة هي مفتاح الطلاقة. تحدث بالإنجليزية وشارك في نقاشات حقيقية بثقة.',
          items: ['محادثات صوتية مباشرة.', 'موضوعات ونقاشات متنوعة.', 'تطوير الطلاقة والثقة.'],
          cta: 'انضم إلى غرف المحادثة',
          route: isAuthenticated ? 'rooms' : 'join-us'
        },
        {
          kind: 'package',
          name: 'الحقيبة التعليمية',
          badge: 'مواردك التعليمية بين يديك',
          title: 'كل ما تحتاجه للتعلم… في مكان واحد!',
          desc: 'لا حاجة للبحث عن مصادر متفرقة؛ حقيبة متكاملة تساعدك على الفهم والمراجعة خطوة بخطوة.',
          items: ['منهج منظم حسب المستوى.', 'مواد وموارد داعمة.', 'تدريبات وأنشطة تطبيقية.'],
          cta: 'اكتشف حقيبتك التعليمية',
          route: home
        },
        {
          kind: 'platform',
          name: 'المنصة التعليمية الذكية',
          badge: 'تعلمك أصبح أكثر تنظيمًا',
          title: 'منصة متكاملة… تتابع تقدمك وتساعدك على التطور!',
          desc: 'دروسك واختباراتك وواجباتك ونتائجك في مكان واحد.',
          items: ['اختبارات بتصحيح تلقائي.', 'تقارير وتحليل للقوة والضعف.', 'متابعة التقدم والإنجازات.'],
          cta: 'اكتشف منصتك التعليمية',
          route: home
        },
        {
          kind: 'community',
          name: 'مجتمع المتعلمين',
          badge: 'معًا نحو مستوى أفضل',
          title: 'لا تتعلم وحدك… كن جزءًا من مجتمع ملهم!',
          desc: 'شارك رحلتك مع متعلمين بأهداف مشابهة، وتبادل الخبرات، واستفد من أجواء تشجعك على الاستمرار.',
          items: [],
          cta: 'انضم إلى المجتمع',
          route: home
        }
      ]
    : [
        {
          kind: 'all',
          name: 'All features',
          badge: 'At a glance',
          title: 'Not just an English course… a complete experience that shapes your future!',
          desc: '',
          items: ['📝 Free placement test', '🏅 UK-accredited certificates', '🎙️ Voice conversation rooms', '🎒 Complete learning package', '💻 Smart learning platform', '🤝 Inspiring learner community'],
          cta: 'Join now',
          route: home
        },
        {
          kind: 'placement',
          name: 'Placement test',
          badge: 'Free • CEFR standards',
          title: "Don't start randomly… discover your level first!",
          desc: 'Test your level and find the right starting point based on the CEFR, so you start with clear steps.',
          items: [],
          cta: 'Test your level for free',
          route: home
        },
        {
          kind: 'certs',
          name: 'Accredited certificates',
          badge: '🇬🇧 UK-accredited • Free',
          title: 'Learn, achieve, and get proof of your progress!',
          desc: '3 free benefits and certificates within your journey, at no extra cost.',
          items: ['A UK-accredited professional development certificate.', 'An English level certificate to international standards.', 'A completion certificate with a unique verification number.'],
          cta: 'Start your journey',
          route: home
        },
        {
          kind: 'rooms',
          name: 'Voice rooms',
          badge: 'Free for members',
          title: 'Understand English but shy to speak? Time for a change!',
          desc: 'Practice is the key to fluency. Speak English and join real discussions with confidence.',
          items: ['Live voice conversations.', 'Varied topics and discussions.', 'Build fluency and confidence.'],
          cta: 'Join the voice rooms',
          route: isAuthenticated ? 'rooms' : 'join-us'
        },
        {
          kind: 'package',
          name: 'Learning package',
          badge: 'Your resources in your hands',
          title: 'Everything you need to learn… in one place!',
          desc: 'No scattered sources; a complete package to understand and review step by step.',
          items: ['A structured curriculum by level.', 'Supporting materials.', 'Practical exercises.'],
          cta: 'Discover your package',
          route: home
        },
        {
          kind: 'platform',
          name: 'Smart platform',
          badge: 'Your learning, organised',
          title: 'An all-in-one platform that tracks your progress!',
          desc: 'Your lessons, tests, homework and results in one place.',
          items: ['Auto-marked tests.', 'Reports on strengths and weaknesses.', 'Progress tracking.'],
          cta: 'Discover your platform',
          route: home
        },
        {
          kind: 'community',
          name: 'Learner community',
          badge: 'Together toward a better level',
          title: "Don't learn alone… join an inspiring community!",
          desc: 'Share your journey with learners who have similar goals and keep going together.',
          items: [],
          cta: 'Join the community',
          route: home
        }
      ];
  const n = slides.length;

  const [idx, setIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const [w, setW] = useState(320);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // عرض الشريحة: مربعة تقريبًا، وتبقى مساحة لظهور جزء من الشريحة المجاورة
  useEffect(() => {
    const fit = () => setW(Math.min(340, Math.round(window.innerWidth * 0.74)));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const go = (to: number) => {
    setIdx(((to % n) + n) % n);
    setTick((t) => t + 1);
  };
  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  // موضع كل شريحة بالنسبة للحالية (دائري): -3 … 3
  const rel = (i: number) => {
    let d = (i - idx) % n;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };
  const gap = 18;
  const H = w + 310;
  const imgH = Math.round(w * 0.68);
  const PrevIcon = ar ? ChevronRight : ChevronLeft;
  const NextIcon = ar ? ChevronLeft : ChevronRight;

  return (
    <section className="py-14 sm:py-16 overflow-hidden" dir={ar ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes ezRibbon { 0% { opacity: 0; transform: translateY(-12px) scale(.9); } 60% { opacity: 1; transform: translateY(2px) scale(1.05); } 100% { transform: none; } }
        .ez-ribbon { animation: ezRibbon .7s .2s ease both; }
      `}</style>

      <div className="text-center max-w-3xl mx-auto mb-8 px-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">LEARN • PRACTICE • ACHIEVE</span>
        <h2 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-[#0A192F] mt-2">{ar ? 'مميزات وفوائد الأكاديمية' : 'Academy features & benefits'}</h2>
      </div>

      <div
        className="relative mx-auto select-none"
        style={{ height: H + 20 }}
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          const s = touch.current;
          touch.current = null;
          if (!s) return;
          const dx = e.changedTouches[0].clientX - s.x;
          const dy = e.changedTouches[0].clientY - s.y;
          if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
          // السحب نحو الشريحة الظاهرة على الجانب يجلبها
          if ((dx > 0) === ar) next();
          else prev();
        }}
      >
        {slides.map((f, i) => {
          const d = rel(i);
          const visible = Math.abs(d) <= 1;
          const x = d * (w + gap) * (ar ? -1 : 1);
          const active = d === 0;
          return (
            <div
              key={f.kind}
              onClick={() => !active && visible && go(i)}
              className={`absolute top-0 rounded-3xl overflow-hidden border-2 shadow-2xl text-white bg-gradient-to-br from-[#0A192F] via-[#102445] to-[#0A192F] ${
                active ? 'border-[#D4AF37] cursor-default' : 'border-[#D4AF37]/40 cursor-pointer'
              }`}
              style={{
                width: w,
                height: H,
                left: '50%',
                transform: `translateX(calc(-50% + ${x}px)) scale(${active ? 1 : 0.9})`,
                opacity: visible ? (active ? 1 : 0.55) : 0,
                zIndex: active ? 3 : visible ? 2 : 1,
                pointerEvents: visible ? 'auto' : 'none',
                transition: 'transform .55s cubic-bezier(.2,.8,.2,1), opacity .45s ease'
              }}
            >
              {/* الصورة */}
              <div className="relative" style={{ height: imgH }}>
                <FeatureArt kind={f.kind} />
                {active && (
                  <button
                    key={`rib-${tick}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(home);
                    }}
                    className="ez-ribbon absolute top-3 start-3 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] text-xs font-bold shadow-xl border border-white/60"
                  >
                    ✨ {ar ? 'انضموا لنا' : 'Join us'}
                  </button>
                )}
                <span className="absolute bottom-2.5 end-3 text-[10px] font-bold text-[#F3E5AB] bg-black/35 rounded-full px-2 py-0.5">
                  {i + 1} / {n}
                </span>
              </div>

              {/* الشرح */}
              <div className="p-5 flex flex-col" style={{ height: H - imgH }}>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#0A192F] text-[11px] font-bold">{f.name}</span>
                  <span className="text-[11px] font-bold text-[#F3E5AB]/85">{f.badge}</span>
                </div>
                <h3 className="font-serif-luxury font-bold text-lg text-[#F3E5AB] leading-snug">{f.title}</h3>
                {f.desc && <p className="text-[13px] text-gray-300 leading-relaxed mt-2">{f.desc}</p>}
                {f.items.length > 0 && (
                  <ul className={`mt-3 ${f.kind === 'all' ? 'grid grid-cols-2 gap-x-2 gap-y-2' : 'space-y-1.5'}`}>
                    {f.items.map((it) => (
                      <li key={it} className="flex items-start gap-1.5 text-[12.5px] text-gray-200 leading-snug">
                        {f.kind !== 'all' && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0 mt-0.5" aria-hidden="true" />}
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (active) navigate(f.route);
                      else go(i);
                    }}
                    className="px-4 py-2.5 rounded-xl font-bold text-[13px] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-md active:scale-95 transition-transform"
                  >
                    {f.cta}
                  </button>
                  {f.kind === 'all' && (
                    <span className="text-[11px] text-[#F3E5AB]/80 font-bold flex items-center gap-0.5">
                      {ar ? 'اسحب للتفاصيل' : 'Swipe for details'}
                      <NextIcon className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* الأسهم على حافتي الشريحة الحالية */}
        <button
          onClick={prev}
          aria-label={ar ? 'السابق' : 'Previous'}
          className="absolute z-10 w-11 h-11 rounded-full bg-white text-[#0A192F] shadow-xl border border-[#D4AF37]/50 flex items-center justify-center hover:bg-[#D4AF37] transition-colors"
          style={{ top: Math.round(imgH / 2) - 22, [ar ? 'right' : 'left']: `calc(50% - ${w / 2 + 22}px)` }}
        >
          <PrevIcon className="w-6 h-6" />
        </button>
        <button
          onClick={next}
          aria-label={ar ? 'التالي' : 'Next'}
          className="absolute z-10 w-11 h-11 rounded-full bg-white text-[#0A192F] shadow-xl border border-[#D4AF37]/50 flex items-center justify-center hover:bg-[#D4AF37] transition-colors"
          style={{ top: Math.round(imgH / 2) - 22, [ar ? 'left' : 'right']: `calc(50% - ${w / 2 + 22}px)` }}
        >
          <NextIcon className="w-6 h-6" />
        </button>
      </div>

      {/* المؤشر */}
      <div className="mt-2 flex items-center justify-center gap-1.5">
        {slides.map((f, i) => (
          <button
            key={f.kind}
            onClick={() => go(i)}
            aria-label={f.name}
            className={`h-2.5 rounded-full transition-all ${i === idx ? 'w-8 bg-[#D4AF37]' : 'w-2.5 bg-[#0A192F]/25 hover:bg-[#0A192F]/50'}`}
          />
        ))}
      </div>
    </section>
  );
};
