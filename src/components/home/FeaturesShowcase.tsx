import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ClipboardCheck, Award, Mic, BookOpenCheck, Sparkles, Users, CheckCircle2, LayoutGrid } from 'lucide-react';
import { FeatureArt, FeatureKind } from './FeatureArt';

interface Props {
  ar: boolean;
  isAuthenticated: boolean;
  navigate: (route: string) => void;
  placementNotice?: string;
}

interface Feature {
  kind: FeatureKind;
  icon: any;
  name: string;
  badge: string;
  title: string;
  desc: string;
  items: string[];
  cta: string;
  go: () => void;
}

// قسم مميزات الأكاديمية: نظرة عامة، ثم شرائح تفصيلية دائرية بلا نهاية (أسهم، سحب باللمس، وضغط على الميزة)
export const FeaturesShowcase: React.FC<Props> = ({ ar, isAuthenticated, navigate, placementNotice }) => {
  const home = isAuthenticated ? 'portal' : 'join-us';
  const features: Feature[] = [
    {
      kind: 'placement',
      icon: ClipboardCheck,
      name: ar ? 'اختبار تحديد المستوى' : 'Placement test',
      badge: ar ? 'مجاني • وفق معايير CEFR' : 'Free • CEFR standards',
      title: ar ? 'لا {تبدأ|تبدئي} عشوائيًا… {اكتشف|اكتشفي} {مستواك|مستواكِ} أولًا!' : "Don't start randomly… discover your level first!",
      desc:
        placementNotice ||
        (ar
          ? '{اختبر|اختبري} {مستواك|مستواكِ} في اللغة الإنجليزية، {وتعرّف|وتعرّفي} على نقطة البداية المناسبة لك من خلال اختبار تحديد المستوى وفق الإطار الأوروبي المرجعي للغات CEFR، {لتبدأ|لتبدئي} رحلة التعلم بخطوات واضحة.'
          : 'Test your English level and find the right starting point through a placement test based on the Common European Framework (CEFR), so you start your journey with clear steps.'),
      items: [],
      cta: ar ? '{اختبر|اختبري} {مستواك|مستواكِ} مجانًا' : 'Test your level for free',
      go: () => navigate(home)
    },
    {
      kind: 'certs',
      icon: Award,
      name: ar ? 'الشهادات والمزايا المجانية' : 'Free certificates & benefits',
      badge: ar ? '3 مزايا وشهادات مجانية' : '3 free benefits & certificates',
      title: ar ? '{تعلّم|تعلّمي}، {أنجز|أنجزي}، {واحصل|واحصلي} على ما يوثّق {تطورك|تطوركِ}!' : 'Learn, achieve, and get proof of your progress!',
      desc: ar
        ? '{استثمر|استثمري} في {مستقبلك|مستقبلكِ}، {واجعل|واجعلي} رحلتك التعليمية تضيف قيمة حقيقية إلى إنجازاتك وملفك المهني. مزايا مجانية ضمن رحلتك التعليمية، دون رسوم إضافية.'
        : 'Invest in your future and let your learning journey add real value to your achievements and profile. Free benefits within your journey, at no extra cost.',
      items: ar
        ? ['🏅 شهادة إتمام موثقة من الأكاديمية برقم فريد للتحقق منها.', '🌍 شهادة إثبات مستوى اللغة الإنجليزية وفق معايير دولية.', '🎓 شهادة تطوير مهني تعزز ملفك المهني وتطورك في التعليم والعمل.']
        : ['🏅 A verified academy completion certificate with a unique number.', '🌍 An English level certificate to international standards.', '🎓 A professional development certificate that strengthens your profile.'],
      cta: ar ? '{ابدأ|ابدئي} رحلتك' : 'Start your journey',
      go: () => navigate(home)
    },
    {
      kind: 'rooms',
      icon: Mic,
      name: ar ? 'غرف المحادثة الصوتية' : 'Voice conversation rooms',
      badge: ar ? 'فرصة مجانية للمسجلين' : 'Free for registered members',
      title: ar ? 'هل {تفهم|تفهمين} الإنجليزية {ولكنك تخجل|ولكنكِ تخجلين} من التحدث؟ حان وقت التغيير!' : 'Understand English but shy to speak? Time for a change!',
      desc: ar
        ? 'المعرفة وحدها لا تصنع الطلاقة؛ الممارسة هي المفتاح. {تحدث|تحدثي} بالإنجليزية، {وشارك|وشاركي} في نقاشات حقيقية في بيئة تفاعلية تشجعك على التحدث بثقة.'
        : 'Knowledge alone does not create fluency; practice is the key. Speak English and join real discussions in an interactive space that builds your confidence.',
      items: ar
        ? ['محادثات صوتية مباشرة.', 'ممارسة الإنجليزية مع الآخرين.', 'موضوعات ونقاشات متنوعة.', 'تطوير الطلاقة والثقة في التحدث.']
        : ['Live voice conversations.', 'Practise English with others.', 'Varied topics and discussions.', 'Build fluency and confidence.'],
      cta: ar ? '{انضم|انضمي} إلى غرف المحادثة' : 'Join the voice rooms',
      go: () => navigate(isAuthenticated ? 'rooms' : 'join-us')
    },
    {
      kind: 'package',
      icon: BookOpenCheck,
      name: ar ? 'الحقيبة التعليمية المتكاملة' : 'Complete learning package',
      badge: ar ? 'مواردك التعليمية بين يديك' : 'Your resources in your hands',
      title: ar ? 'كل ما {تحتاجه|تحتاجينه} للتعلم… في مكان واحد!' : 'Everything you need to learn… in one place!',
      desc: ar
        ? 'لن {تحتاج|تحتاجي} إلى البحث عن مصادر متفرقة؛ حقيبة تعليمية متكاملة تساعدك على فهم الدروس، ومراجعة ما {تعلمته|تعلمتِه}، وتطوير مهاراتك خطوة بخطوة.'
        : 'No more scattered sources; a complete package that helps you understand lessons, review what you learned and grow step by step.',
      items: ar
        ? ['منهج تعليمي منظم حسب المستوى.', 'مواد إضافية وموارد داعمة.', 'تدريبات وأنشطة تطبيقية.', 'أدوات للمراجعة وتثبيت المعلومات.']
        : ['A structured curriculum by level.', 'Extra materials and resources.', 'Practical exercises and activities.', 'Tools for review and retention.'],
      cta: ar ? '{اكتشف|اكتشفي} حقيبتك التعليمية' : 'Discover your package',
      go: () => navigate(home)
    },
    {
      kind: 'platform',
      icon: Sparkles,
      name: ar ? 'المنصة التعليمية الذكية' : 'Smart learning platform',
      badge: ar ? '{تعلمك|تعلمكِ} أصبح أكثر تنظيمًا' : 'Your learning, better organised',
      title: ar ? 'منصة متكاملة… تتابع {تقدمك|تقدمكِ} وتساعدك على التطور!' : 'An all-in-one platform that tracks your progress!',
      desc: ar
        ? 'دروسك واختباراتك وواجباتك ونتائجك في مكان واحد، {لتعرف|لتعرفي} دائمًا أين {وصلت|وصلتِ} وما المهارات التي {تحتاج|تحتاجين} إلى تطويرها.'
        : 'Your lessons, tests, homework and results in one place, so you always know where you are and what to improve.',
      items: ar
        ? ['اختبارات إلكترونية مع تصحيح تلقائي.', 'واجبات وأنشطة تفاعلية.', 'تقارير وتحليل نقاط القوة والضعف.', 'متابعة التقدم والإنجازات.']
        : ['Online tests with automatic marking.', 'Interactive homework and activities.', 'Reports with strengths and weaknesses.', 'Progress and achievement tracking.'],
      cta: ar ? '{اكتشف|اكتشفي} منصتك التعليمية' : 'Discover your platform',
      go: () => navigate(home)
    },
    {
      kind: 'community',
      icon: Users,
      name: ar ? 'مجتمع المتعلمين' : 'Learner community',
      badge: ar ? 'معًا نحو مستوى أفضل' : 'Together toward a better level',
      title: ar ? 'لا {تتعلم|تتعلمي} {وحدك|وحدكِ}… {كن|كوني} جزءًا من مجتمع ملهم!' : "Don't learn alone… join an inspiring community!",
      desc: ar
        ? '{شارك|شاركي} رحلتك مع متعلمين يملكون أهدافًا مشابهة لأهدافك. {تبادل|تبادلي} الخبرات، {وشارك|وشاركي} في الأنشطة، {واستفد|واستفيدي} من أجواء تشجعك على الاستمرار وتحقيق المزيد.'
        : 'Share your journey with learners who have goals like yours. Exchange experiences, take part in activities and keep going.',
      items: [],
      cta: ar ? '{انضم|انضمي} إلى المجتمع' : 'Join the community',
      go: () => navigate(home)
    }
  ];
  const n = features.length;

  const [mode, setMode] = useState<'overview' | 'detail'>('overview');
  const [idx, setIdx] = useState(0);
  const [dirAnim, setDirAnim] = useState<'next' | 'prev'>('next');
  const [tick, setTick] = useState(0); // لإعادة تشغيل الحركة مع كل تقليبة
  const boxRef = useRef<HTMLDivElement | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // دائري بلا نهاية: بعد الأخيرة الأولى، وقبل الأولى الأخيرة
  const go = (to: number, d: 'next' | 'prev') => {
    setDirAnim(d);
    setIdx(((to % n) + n) % n);
    setTick((t) => t + 1);
  };
  const next = () => go(idx + 1, 'next');
  const prev = () => go(idx - 1, 'prev');

  const open = (i: number) => {
    go(i, 'next');
    setMode('detail');
    setTimeout(() => boxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  };

  // أسهم لوحة المفاتيح عند فتح العرض التفصيلي
  useEffect(() => {
    if (mode !== 'detail') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (ar) next();
        else prev();
      }
      if (e.key === 'ArrowRight') {
        if (ar) prev();
        else next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const f = features[idx];
  const joinLabel = ar ? 'انضموا لنا' : 'Join us';
  // في العربية «التالي» على اليسار
  const PrevIcon = ar ? ChevronRight : ChevronLeft;
  const NextIcon = ar ? ChevronLeft : ChevronRight;

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir={ar ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes ezInNext { from { opacity: 0; transform: translateX(${ar ? '-' : ''}40px); } to { opacity: 1; transform: none; } }
        @keyframes ezInPrev { from { opacity: 0; transform: translateX(${ar ? '' : '-'}40px); } to { opacity: 1; transform: none; } }
        @keyframes ezZoom { from { opacity: 0; transform: scale(1.06); } to { opacity: 1; transform: none; } }
        @keyframes ezRibbon { 0% { opacity: 0; transform: translateY(-14px) scale(.9); } 60% { opacity: 1; transform: translateY(2px) scale(1.04); } 100% { transform: none; } }
        .ez-in-next { animation: ezInNext .5s cubic-bezier(.2,.8,.2,1) both; }
        .ez-in-prev { animation: ezInPrev .5s cubic-bezier(.2,.8,.2,1) both; }
        .ez-zoom { animation: ezZoom .6s ease both; }
        .ez-ribbon { animation: ezRibbon .7s .15s ease both; }
      `}</style>

      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">LEARN • PRACTICE • ACHIEVE</span>
        <h2 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-[#0A192F] mt-2 leading-snug">
          {ar ? 'ليست مجرد دورة إنجليزية… بل تجربة متكاملة {تصنع مستقبلك|تصنع مستقبلكِ}!' : 'Not just an English course… a complete experience that shapes your future!'}
        </h2>
        <p className="text-gray-600 mt-3 text-sm sm:text-base leading-relaxed">
          {ar
            ? 'تعلّم منظم، وممارسة حقيقية، وشهادات، وموارد، وأدوات ذكية تساعدك على التقدم بثقة. {اضغط|اضغطي} على أي ميزة {لتكتشفها|لتكتشفيها}.'
            : 'Structured learning, real practice, certificates, resources and smart tools. Tap any feature to explore it.'}
        </p>
      </div>

      {mode === 'overview' ? (
        /* المرحلة الأولى: نظرة عامة */
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {features.map((x, i) => (
              <button
                key={x.kind}
                onClick={() => open(i)}
                className="group relative text-start rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white border-2 border-[#D4AF37]/30 shadow-sm hover:shadow-xl hover:border-[#D4AF37] hover:-translate-y-1 transition-all overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0A192F] via-[#D4AF37] to-[#0A192F] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-[#0A192F] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                  <x.icon className="w-5 h-5 sm:w-7 sm:h-7" aria-hidden="true" />
                </div>
                <span className="block text-[10px] sm:text-xs font-bold text-[#AA820A] mb-1">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-serif-luxury font-bold text-sm sm:text-lg text-[#0A192F] leading-snug">{x.name}</h3>
                <p className="text-[11px] sm:text-sm text-gray-500 mt-1 leading-snug">{x.badge}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#0A192F] group-hover:text-[#AA820A]">
                  {ar ? 'اكتشف المزيد' : 'Explore'}
                  <NextIcon className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => open(0)}
              className="ez-float-glow inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-lg"
            >
              {ar ? 'استكشف المميزات' : 'Explore the features'}
              <NextIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* المرحلة الثانية: الشرائح التفصيلية الدائرية */
        <div ref={boxRef} className="max-w-6xl mx-auto">
          <div
            className="relative rounded-3xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-2xl bg-gradient-to-br from-[#0A192F] via-[#102445] to-[#0A192F] text-white select-none"
            onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
            onTouchEnd={(e) => {
              const s = touch.current;
              touch.current = null;
              if (!s) return;
              const dx = e.changedTouches[0].clientX - s.x;
              const dy = e.changedTouches[0].clientY - s.y;
              if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
              // في العربية السحب لليمين = التالي
              if ((dx > 0) === ar) next();
              else prev();
            }}
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] z-10" />

            <div className="grid grid-cols-1 md:grid-cols-2 md:min-h-[460px]">
              {/* الصورة */}
              <div key={`art-${tick}`} className="relative aspect-[4/3] md:aspect-auto md:h-full ez-zoom">
                <FeatureArt kind={f.kind} />
                {/* «انضموا لنا» مع كل تقليبة */}
                <button
                  key={`rib-${tick}`}
                  onClick={() => navigate(home)}
                  className="ez-ribbon absolute top-4 start-4 px-4 py-2 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] text-xs sm:text-sm font-bold shadow-xl border border-white/60"
                >
                  ✨ {joinLabel}
                </button>
                <button
              onClick={prev}
              aria-label={ar ? 'السابق' : 'Previous'}
              className="flex md:hidden absolute top-1/2 -translate-y-1/2 start-2 z-10 w-11 h-11 rounded-full bg-white/90 text-[#0A192F] shadow-lg items-center justify-center hover:bg-[#D4AF37] transition-colors"
            >
              <PrevIcon className="w-6 h-6" />
            </button>
                <button
              onClick={next}
              aria-label={ar ? 'التالي' : 'Next'}
              className="flex md:hidden absolute top-1/2 -translate-y-1/2 end-2 z-10 w-11 h-11 rounded-full bg-white/90 text-[#0A192F] shadow-lg items-center justify-center hover:bg-[#D4AF37] transition-colors"
            >
              <NextIcon className="w-6 h-6" />
            </button>
                <span className="absolute bottom-3 end-4 text-[11px] font-bold text-[#F3E5AB] bg-black/30 rounded-full px-2.5 py-1">
                  {idx + 1} / {n}
                </span>
              </div>

              {/* المحتوى */}
              <div key={`txt-${tick}`} className={`p-6 sm:p-9 flex flex-col justify-center ${dirAnim === 'next' ? 'ez-in-next' : 'ez-in-prev'}`}>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37] text-[#0A192F] text-[11px] font-bold">
                    <f.icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {f.name}
                  </span>
                  <span className="text-[11px] font-bold text-[#F3E5AB]/80">{f.badge}</span>
                </div>
                <h3 className="font-serif-luxury font-bold text-xl sm:text-3xl text-[#F3E5AB] leading-snug">{f.title}</h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed mt-3">{f.desc}</p>
                {f.items.length > 0 && (
                  <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {f.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-xs sm:text-sm text-gray-200 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={f.go}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-md hover:brightness-105 active:scale-95 transition-all"
                  >
                    {f.cta}
                  </button>
                </div>
              </div>
            </div>

            {/* أسهم التنقل (الكمبيوتر) */}
            <button
              onClick={prev}
              aria-label={ar ? 'السابق' : 'Previous'}
              className="hidden md:flex absolute top-1/2 -translate-y-1/2 start-3 z-10 w-11 h-11 rounded-full bg-white/90 text-[#0A192F] shadow-lg items-center justify-center hover:bg-[#D4AF37] transition-colors"
            >
              <PrevIcon className="w-6 h-6" />
            </button>
            <button
              onClick={next}
              aria-label={ar ? 'التالي' : 'Next'}
              className="hidden md:flex absolute top-1/2 -translate-y-1/2 end-3 z-10 w-11 h-11 rounded-full bg-white/90 text-[#0A192F] shadow-lg items-center justify-center hover:bg-[#D4AF37] transition-colors"
            >
              <NextIcon className="w-6 h-6" />
            </button>
          </div>

          {/* المؤشر: أيقونة لكل ميزة + العودة للنظرة العامة */}
          <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
            {features.map((x, i) => (
              <button
                key={x.kind}
                onClick={() => go(i, i > idx ? 'next' : 'prev')}
                title={x.name}
                aria-label={x.name}
                className={`h-10 rounded-full flex items-center justify-center transition-all border ${
                  i === idx ? 'w-16 bg-[#0A192F] text-[#D4AF37] border-[#D4AF37]' : 'w-10 bg-white text-[#0A192F] border-[#D4AF37]/40 hover:border-[#D4AF37]'
                }`}
              >
                <x.icon className="w-4 h-4" />
              </button>
            ))}
            <button
              onClick={() => setMode('overview')}
              className="ms-2 h-10 px-4 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600 flex items-center gap-1.5 hover:border-[#D4AF37]"
            >
              <LayoutGrid className="w-4 h-4" />
              {ar ? 'كل المميزات' : 'All features'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
