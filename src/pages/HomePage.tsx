import React, { useState } from 'react';
import { usePlacementLink } from '../hooks/usePlacementLink';
import { ReferralTeaser } from '../components/student/ReferralOffers';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  PROGRAM_CATEGORIES,
  CEFR_LEVELS_INFO
} from '../data/academyData';
import { useAcademySettings } from '../hooks/useAcademySettings';
import { useSiteSection } from '../hooks/useSiteContent';
import { CEFRLevel } from '../types';
import {
  Sparkles,
  ArrowRight,
  Award,
  ShieldCheck,
  GraduationCap,
  ClipboardCheck,
  ExternalLink,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown
, Mic } from 'lucide-react';
import { EnglishZoneEmblem } from '../components/common/Logo';
import { EnglishClubHomeSection } from '../components/englishClub/EnglishClubHomeSection';
import { StudentReviewsSection } from '../components/reviews/StudentReviewsSection';
import { VerifiedTestimonials } from '../components/reviews/VerifiedTestimonials';

interface HomePageProps {
  navigate: (
    route: string,
    state?: { preselectedLevel?: CEFRLevel; curriculumLevel?: CEFRLevel }
  ) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const contacts = useAcademySettings();
  const pt = usePlacementLink();
  const { t, language, dir } = useLanguage();
  const { isAuthenticated } = useAuth();
  const heroAnnouncement = useSiteSection('hero_announcement', language);
  const methodologyIntro = useSiteSection('methodology_intro', language);
  const placementNotice = useSiteSection('placement_notice', language);
  const ar = language === 'ar';
  const [isPackageExpanded, setIsPackageExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0A192F] via-[#0F2042] to-[#0A192F] text-white pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-[#D4AF37]/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {heroAnnouncement && (
              <div className="mx-auto max-w-2xl px-4 py-2.5 rounded-2xl bg-[#D4AF37] text-[#0A192F] text-sm font-bold shadow-lg whitespace-pre-line">
                {heroAnnouncement}
              </div>
            )}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#162B4D] border border-[#D4AF37]/40 text-[#F3E5AB] text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
              <EnglishZoneEmblem sizeClass="w-4 h-4" glow={false} showBevelBorder={false} />
              <span>{t.hero.badge}</span>
            </div>

            <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight">
              {t.hero.title1}
              <span className="block mt-2 gold-gradient-text">
                {t.brand.slogan}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t.hero.desc}
            </p>

            <div className="max-w-xl mx-auto pt-2">
              <ReferralTeaser isAr={language === 'ar'} onClick={() => navigate(isAuthenticated ? 'portal' : 'join-offer')} />
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('join-us')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-xl hover:shadow-[#D4AF37]/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-5 h-5" />
                <span>{t.hero.ctaJoin}</span>
              </button>

              {contacts.placementTestUrl && (
              <a
                href={pt.href}
                target={pt.target}
                rel={pt.rel}
                className="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-base border-2 border-[#D4AF37]/60 text-[#F3E5AB] hover:bg-[#D4AF37]/15 hover:border-[#D4AF37] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <span>{pt.label(language === 'ar')}</span>
              </a>
              )}

              <button
                onClick={() => navigate('programs')}
                className="w-full sm:w-auto px-6 py-4 rounded-xl font-medium text-base text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
              >
                <span>{t.hero.ctaExplore}</span>
                <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 1. ACADEMY FEATURES & BENEFITS (نسخة تجريبية بأسلوب تسويقي) */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">LEARN • PRACTICE • ACHIEVE</span>
          <h2 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-[#0A192F] mt-2 leading-snug">
            {ar ? 'ليست مجرد دورة إنجليزية… بل تجربة متكاملة {تصنع مستقبلك|تصنع مستقبلكِ}!' : 'Not just an English course… a complete experience that shapes your future!'}
          </h2>
          <p className="text-gray-600 mt-4 text-base leading-relaxed">
            {ar
              ? 'مع English Zone، {ستحصل|ستحصلين} على أكثر من دروس اللغة. {اكتشف|اكتشفي} تجربة تعليمية تجمع بين التعلم المنظم، والممارسة الحقيقية، والشهادات، والموارد التعليمية، والأدوات الذكية التي تساعدك على التقدم بثقة.'
              : 'With English Zone, you get more than language lessons. Discover a learning experience that brings together structured learning, real practice, certificates, learning resources and smart tools that help you progress with confidence.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* الميزة الأولى: اختبار تحديد المستوى */}
          <div dir={dir} className="relative bg-white rounded-3xl p-7 sm:p-8 border-2 border-[#D4AF37]/35 shadow-lg hover:border-[#D4AF37] transition-all flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0A192F] via-[#D4AF37] to-[#0A192F]" />
            <div>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#0A192F] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center shadow-md flex-shrink-0">
                  <ClipboardCheck className="w-7 h-7" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold text-[#AA820A] tracking-wide">{ar ? 'مجاني • وفق معايير CEFR' : 'Free • CEFR standards'}</span>
              </div>
              <span className="block text-xs font-bold text-gray-400 mb-1">{ar ? 'اختبار تحديد المستوى' : 'Placement test'}</span>
              <h3 className="font-serif-luxury font-bold text-xl sm:text-2xl text-[#0A192F] mb-3">
                {ar ? 'لا {تبدأ|تبدئي} عشوائيًا… {اكتشف|اكتشفي} {مستواك|مستواكِ} أولًا!' : "Don't start randomly… discover your level first!"}
              </h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-7">
                {placementNotice ||
                  (ar
                    ? '{اختبر|اختبري} {مستواك|مستواكِ} في اللغة الإنجليزية، {وتعرّف|وتعرّفي} على نقطة البداية المناسبة لك من خلال اختبار تحديد المستوى وفق الإطار الأوروبي المرجعي للغات CEFR، {لتبدأ|لتبدئي} رحلة التعلم بخطوات واضحة.'
                    : 'Test your English level and find the right starting point through a placement test based on the Common European Framework (CEFR), so you start your learning journey with clear steps.')}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <a
                href={pt.href}
                target={pt.target}
                rel={pt.rel}
                aria-label={t.features.placementAriaLabel}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-md hover:shadow-lg hover:brightness-105 active:scale-95 transition-all"
              >
                {ar ? '{اختبر|اختبري} {مستواك|مستواكِ} مجانًا' : 'Test your level for free'}
              </a>
            </div>
          </div>

          {/* الميزة الثانية: الشهادات */}
          <div dir={dir} className="relative bg-gradient-to-br from-[#0A192F] to-[#102445] text-white rounded-3xl p-7 sm:p-8 border-2 border-[#D4AF37]/50 shadow-xl hover:border-[#D4AF37] transition-all flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37]" />
            <div>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-[#F3E5AB] border border-[#D4AF37]/50 flex items-center justify-center shadow-md flex-shrink-0">
                  <Award className="w-7 h-7 text-[#D4AF37]" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold text-[#F3E5AB] tracking-wide">{ar ? '3 مزايا وشهادات مجانية' : '3 free benefits & certificates'}</span>
              </div>
              <span className="block text-xs font-bold text-gray-400 mb-1">{ar ? 'الشهادات' : 'Certificates'}</span>
              <h3 className="font-serif-luxury font-bold text-xl sm:text-2xl text-[#F3E5AB] mb-2">
                {ar ? '{تعلّم|تعلّمي}، {أنجز|أنجزي}، {واحصل|واحصلي} على ما يوثّق {تطورك|تطوركِ}!' : 'Learn, achieve, and get proof of your progress!'}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                {ar
                  ? '{استثمر|استثمري} في {مستقبلك|مستقبلكِ}، {واجعل|واجعلي} رحلتك التعليمية تضيف قيمة حقيقية إلى إنجازاتك وملفك المهني.'
                  : 'Invest in your future and let your learning journey add real value to your achievements and professional profile.'}
              </p>
              <ul className="space-y-3.5">
                {(ar
                  ? [
                      ['🏅', 'شهادة إتمام موثقة من الأكاديمية', 'شهادة خاصة بإنجازك، تحمل رقمًا فريدًا للتحقق من صحتها وتوثيقها.'],
                      ['🌍', 'شهادة إثبات مستوى اللغة الإنجليزية', 'فرصة لقياس مستواك اللغوي والحصول على شهادة تثبت مستواك وفق معايير دولية.'],
                      ['🎓', 'شهادة تطوير مهني', 'شهادة تضيف إلى خبراتك، وتعزز ملفك المهني، وتدعم تطورك في مجال التعليم والعمل.']
                    ]
                  : [
                      ['🏅', 'Verified academy completion certificate', 'A certificate of your achievement with a unique number to verify it.'],
                      ['🌍', 'English level certificate', 'A chance to measure your English and get a certificate proving your level to international standards.'],
                      ['🎓', 'Professional development certificate', 'A certificate that adds to your experience, strengthens your profile and supports your growth in education and work.']
                    ]
                ).map(([icon, title, desc]) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="text-xl leading-none mt-0.5" aria-hidden="true">{icon}</span>
                    <div>
                      <div className="font-bold text-sm sm:text-base text-[#F3E5AB]">{title}</div>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-7 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="h-1 w-14 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]" />
              <span className="text-xs font-bold text-[#D4AF37]">{ar ? 'مزايا مجانية ضمن رحلتك التعليمية، دون رسوم إضافية.' : 'Free benefits within your learning journey, at no extra cost.'}</span>
            </div>
          </div>

          {/* الميزة الثالثة: غرف المحادثة الصوتية */}
          <div
            dir={dir}
            className="md:col-span-2 relative rounded-3xl p-7 sm:p-9 border-2 border-[#D4AF37]/50 shadow-xl overflow-hidden text-white"
            style={{ background: 'linear-gradient(135deg, #1E1B4B, #0A192F 55%, #102445)' }}
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37]" />
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1 space-y-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37] text-[#0A192F] text-[11px] font-bold">
                  <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                  {ar ? 'فرصة مجانية للمسجلين' : 'Free for registered members'}
                </span>
                <span className="block text-xs font-bold text-gray-400">{ar ? 'غرف المحادثة الصوتية' : 'Voice conversation rooms'}</span>
                <h3 className="font-serif-luxury font-bold text-xl sm:text-2xl text-[#F3E5AB]">
                  {ar ? 'هل {تفهم|تفهمين} الإنجليزية {ولكنك تخجل|ولكنكِ تخجلين} من التحدث؟ حان وقت التغيير!' : 'Do you understand English but feel shy to speak? It’s time for a change!'}
                </h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  {ar
                    ? 'المعرفة وحدها لا تصنع الطلاقة؛ الممارسة هي المفتاح. {انضم|انضمي} إلى غرف المحادثة الصوتية، {وتحدث|وتحدثي} بالإنجليزية، {وشارك|وشاركي} في نقاشات حقيقية، {وتدرّب|وتدرّبي} على التعبير عن أفكارك في بيئة تفاعلية تشجعك على التحدث بثقة.'
                    : 'Knowledge alone does not create fluency; practice is the key. Join the voice rooms, speak English, take part in real discussions and practise expressing your ideas in an interactive space that encourages you to speak with confidence.'}
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  {(ar
                    ? ['🎙️ محادثات صوتية مباشرة', '👥 ممارسة الإنجليزية مع الآخرين', '💡 موضوعات ونقاشات متنوعة', '🚀 تطوير الطلاقة والثقة في التحدث', '🤝 بيئة تفاعلية تشجع على المشاركة']
                    : ['🎙️ Live voice conversations', '👥 Practise English with others', '💡 Varied topics and discussions', '🚀 Build fluency and confidence', '🤝 An interactive, encouraging space']
                  ).map((x) => (
                    <span key={x} className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15">{x}</span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? 'rooms' : 'join-us')}
                className="self-start md:self-center inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-md hover:brightness-105 active:scale-95 transition-all whitespace-nowrap"
              >
                <Mic className="w-5 h-5" aria-hidden="true" />
                {ar ? '{انضم|انضمي} إلى غرف المحادثة' : 'Join the voice rooms'}
              </button>
            </div>
          </div>

          {/* الميزة الرابعة والخامسة: الحقيبة التعليمية والمنصة الذكية */}
          {(
            [
              {
                key: 'pkg',
                icon: BookOpenCheck,
                badge: ar ? 'مواردك التعليمية بين يديك' : 'Your learning resources in your hands',
                name: ar ? 'الحقيبة التعليمية' : 'Learning package',
                title: ar ? 'كل ما {تحتاجه|تحتاجينه} للتعلم… في مكان واحد!' : 'Everything you need to learn… in one place!',
                desc: ar
                  ? 'لن {تحتاج|تحتاجي} إلى البحث عن مصادر متفرقة؛ {ستحصل|ستحصلين} على حقيبة تعليمية متكاملة تضم مواد وموارد منظمة تساعدك على فهم الدروس، ومراجعة ما {تعلمته|تعلمتِه}، وتطوير مهاراتك خطوة بخطوة.'
                  : 'No need to search for scattered sources; you get a complete learning package of organised materials that help you understand lessons, review what you learned and build your skills step by step.',
                items: ar
                  ? ['منهج تعليمي منظم حسب المستوى.', 'مواد إضافية وموارد داعمة.', 'تدريبات وأنشطة تطبيقية.', 'أدوات للمراجعة وتثبيت المعلومات.', 'محتوى يساعدك على مواصلة التعلم خارج الدرس.']
                  : ['A structured curriculum by level.', 'Extra materials and supporting resources.', 'Practical exercises and activities.', 'Tools for review and retention.', 'Content that helps you keep learning outside class.'],
                cta: ar ? '{اكتشف|اكتشفي} حقيبتك التعليمية' : 'Discover your learning package'
              },
              {
                key: 'platform',
                icon: Sparkles,
                badge: ar ? '{تعلمك|تعلمكِ} أصبح أكثر تنظيمًا' : 'Your learning, better organised',
                name: ar ? 'المنصة التعليمية الذكية' : 'Smart learning platform',
                title: ar ? 'منصة متكاملة… تتابع {تقدمك|تقدمكِ} وتساعدك على التطور!' : 'An all-in-one platform… that tracks your progress and helps you grow!',
                desc: ar
                  ? 'تجربة تعليمية تجمع دروسك واختباراتك وواجباتك ونتائجك في مكان واحد، {لتتعلم|لتتعلمي} بوضوح {وتعرف|وتعرفي} دائمًا أين {وصلت|وصلتِ} وما المهارات التي {تحتاج|تحتاجين} إلى تطويرها.'
                  : 'A learning experience that gathers your lessons, tests, homework and results in one place, so you learn clearly and always know where you are and which skills to develop.',
                items: ar
                  ? ['اختبارات إلكترونية مع تصحيح تلقائي.', 'واجبات وأنشطة تفاعلية.', 'تقارير بعد الاختبارات والدروس.', 'تحليل نقاط القوة والضعف.', 'متابعة التقدم والإنجازات.', 'حساب شخصي للطالب ومحتواه التعليمي.']
                  : ['Online tests with automatic marking.', 'Interactive homework and activities.', 'Reports after tests and lessons.', 'Strengths and weaknesses analysis.', 'Progress and achievement tracking.', 'A personal student account with its content.'],
                cta: ar ? '{اكتشف|اكتشفي} منصتك التعليمية' : 'Discover your learning platform'
              }
            ] as const
          ).map((f) => (
            <div key={f.key} dir={dir} className="relative bg-white rounded-3xl p-7 sm:p-8 border-2 border-[#D4AF37]/40 shadow-lg hover:border-[#D4AF37] transition-all flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0A192F] via-[#D4AF37] to-[#0A192F]" />
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#0A192F] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center shadow-md flex-shrink-0">
                    <f.icon className="w-7 h-7" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold text-[#AA820A] tracking-wide">{f.badge}</span>
                </div>
                <span className="block text-xs font-bold text-gray-400 mb-1">{f.name}</span>
                <h3 className="font-serif-luxury font-bold text-xl sm:text-2xl text-[#0A192F] mb-3">{f.title}</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">{f.desc}</p>
                <ul className="space-y-2.5 mb-6">
                  {f.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-1" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate(isAuthenticated ? 'portal' : 'join-us')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-[#0A192F] text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-[#0A192F] transition-all shadow-sm"
                >
                  {f.cta}
                </button>
              </div>
            </div>
          ))}

          {/* الميزة السادسة: مجتمع المتعلمين */}
          <div dir={dir} className="md:col-span-2 relative bg-[#FAF8F5] rounded-3xl p-7 sm:p-9 border-2 border-[#D4AF37]/40 shadow-lg overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0A192F] via-[#D4AF37] to-[#0A192F]" />
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0A192F] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center shadow-md flex-shrink-0">
                <GraduationCap className="w-7 h-7" aria-hidden="true" />
              </div>
              <div>
                <span className="block text-xs font-bold text-[#AA820A] mb-1">{ar ? 'مجتمع المتعلمين • معًا نحو مستوى أفضل' : 'Learner community • Together toward a better level'}</span>
                <h3 className="font-serif-luxury font-bold text-xl sm:text-2xl text-[#0A192F]">
                  {ar ? 'لا {تتعلم|تتعلمي} {وحدك|وحدكِ}… {كن|كوني} جزءًا من مجتمع ملهم!' : "Don't learn alone… be part of an inspiring community!"}
                </h3>
                <p className="text-sm sm:text-base text-gray-700 mt-2 leading-relaxed">
                  {ar
                    ? '{انضم|انضمي} إلى مجتمع English Zone، {وشارك|وشاركي} رحلتك مع متعلمين يملكون أهدافًا مشابهة لأهدافك. {تبادل|تبادلي} الخبرات، {وشارك|وشاركي} في الأنشطة، {واستفد|واستفيدي} من أجواء تعليمية تشجعك على الاستمرار وتحقيق المزيد.'
                    : 'Join the English Zone community and share your journey with learners who have goals like yours. Exchange experiences, take part in activities and enjoy an atmosphere that encourages you to keep going and achieve more.'}
                </p>
              </div>
            </div>
          </div>

          {/* القسم الختامي: دعوة للتسجيل */}
          <div dir={dir} className="md:col-span-2 relative rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#0A192F] via-[#102445] to-[#0A192F] border-2 border-[#D4AF37] shadow-2xl text-center overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">YOUR JOURNEY STARTS HERE</span>
            <h3 className="font-serif-luxury font-bold text-2xl sm:text-4xl text-[#F3E5AB] mt-3">
              {ar ? '{مستقبلك|مستقبلكِ} باللغة الإنجليزية يبدأ من هنا!' : 'Your future in English starts here!'}
            </h3>
            <p className="text-gray-300 mt-4 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {ar
                ? '{ابدأ|ابدئي} من الصفر، {طوّر|طوّري} مهاراتك، {اكتسب|اكتسبي} الثقة، {واصنع|واصنعي} فرصًا جديدة لنفسك. نحن نوفر لك الأدوات، {وأنت تصنع|وأنتِ تصنعين} الإنجاز.'
                : 'Start from zero, build your skills, gain confidence and create new opportunities for yourself. We give you the tools; you create the achievement.'}
            </p>
            <p className="text-[#D4AF37] font-bold mt-4">{ar ? '{خطوتك|خطوتكِ} الأولى قد تصنع فرقًا كبيرًا.' : 'Your first step can make a big difference.'}</p>
            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? 'portal' : 'join-us')}
              className="mt-6 ez-float-glow inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-base bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-lg"
            >
              {isAuthenticated ? (ar ? 'حسابي' : 'My account') : ar ? '{انضم|انضمي} الآن' : 'Join now'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. ENGLISH COURSES (SUMMARY CARDS ONLY) */}
      <section className="py-16 sm:py-20 bg-[#F3EDE2]/60 border-y border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              {t.brand.name} Courses
            </span>
            <h2 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-[#0A192F] mt-2">
              {language === 'ar' ? 'دورات اللغة الإنجليزية' : 'English Courses'}
            </h2>
            <p className="text-gray-600 mt-3 text-base">
              {t.programs.sectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {PROGRAM_CATEGORIES.map((prog, idx) => {
              const isFeatured = idx === 0;

              if (isFeatured) {
                return (
                  <div
                    key={prog.id}
                    dir={dir}
                    className="md:col-span-2 relative bg-gradient-to-br from-[#0A192F] via-[#0F2042] to-[#102445] text-white rounded-3xl p-7 sm:p-10 border-2 border-[#D4AF37] shadow-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37]" />

                    <div>
                      <div className="mb-4">
                        <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] text-xs font-extrabold tracking-wider uppercase shadow-sm">
                          {language === 'ar' ? prog.badgeAr : prog.badgeEn}
                        </span>
                      </div>

                      <h3 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#F3E5AB] leading-snug mb-4">
                        {language === 'ar' ? prog.titleAr : prog.titleEn}
                      </h3>

                      <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-4xl mb-7">
                        {language === 'ar' ? prog.shortDescAr : prog.shortDescEn}
                      </p>
                    </div>

                    <div>
                      <button
                        onClick={() => navigate(`course/${prog.id}`)}
                        className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] hover:brightness-105 active:scale-95 transition-all shadow-lg inline-flex items-center justify-center gap-2"
                      >
                        <span>{language === 'ar' ? 'عرض تفاصيل الدورة' : 'View Course Details'}</span>
                        <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={prog.id}
                  dir={dir}
                  className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-[#D4AF37]/25 shadow-md hover:border-[#D4AF37] hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-serif-luxury font-bold text-xl text-[#0A192F] mb-3">
                      {language === 'ar' ? prog.titleAr : prog.titleEn}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                      {language === 'ar' ? prog.shortDescAr : prog.shortDescEn}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`course/${prog.id}`)}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#0A192F] text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-[#0A192F] transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>{language === 'ar' ? 'عرض تفاصيل الدورة' : 'View Course Details'}</span>
                    <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. ENGLISH CLUB */}
      <EnglishClubHomeSection navigate={navigate} onJoinClick={() => navigate('english-club')} />

      {/* 4. ABOUT THE ACADEMY */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-[#0A192F] via-[#0F2042] to-[#0A192F] text-white border-t border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* English Zone Academy Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm rounded-3xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-2xl bg-[#060D1A]">
                <img
                  src="/assets/aistudio/file_00000000c3b08210abdde9ab8258756c_98faaab4.png"
                  alt="English Zone Academy"
                  className="w-full h-auto block"
                />
              </div>
            </div>

            {/* Concise Introduction to English Zone Academy */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-[#D4AF37]/30 text-xs text-[#F3E5AB]">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'ar' ? 'عن الأكاديمية' : 'About the Academy'}</span>
              </div>

              <h2 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-white">
                {language === 'ar' ? 'أكاديمية English Zone الدولية' : 'English Zone International Academy'}
              </h2>

              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
                {t.brand.subSlogan}
              </p>

              {methodologyIntro && (
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{methodologyIntro}</p>
              )}

              <blockquote className="border-l-4 rtl:border-l-0 rtl:border-r-4 border-[#D4AF37] pl-4 rtl:pl-0 rtl:pr-4 italic text-base sm:text-lg text-[#F3E5AB] font-serif-luxury leading-relaxed">
                {t.founder.quote}
              </blockquote>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => navigate('about')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] hover:brightness-110 transition-all shadow-md inline-flex items-center justify-center gap-2"
                >
                  <span>{language === 'ar' ? 'اقرأ المزيد عن الأكاديمية' : 'Learn More About Us'}</span>
                  <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => navigate('pricing')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm border border-[#D4AF37]/50 text-[#F3E5AB] hover:bg-[#D4AF37]/10 transition-colors"
                >
                  {t.nav.pricing}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE OUR CURRICULUM (A1-C2 LEVELS) */}
      <section className="py-16 bg-[#FAF8F5] border-t border-[#D4AF37]/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            {t.brand.cefrStandard}
          </span>
          <h2 className="font-serif-luxury font-bold text-3xl text-[#0A192F] mt-2">
            {language === 'ar' ? 'استكشف منهجنا الدراسي' : 'Explore Our Curriculum'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-2xl mx-auto">
            {t.curriculum.sectionSubtitle}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8">
            {CEFR_LEVELS_INFO.map((lvl) => (
              <button
                key={lvl.code}
                onClick={() => navigate('curriculum', { curriculumLevel: lvl.code })}
                className="bg-white rounded-2xl p-4 border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all text-center group"
              >
                <span className="w-10 h-10 mx-auto rounded-xl bg-[#0A192F] text-[#F3E5AB] font-serif-luxury font-bold text-lg flex items-center justify-center mb-2 group-hover:bg-[#D4AF37] group-hover:text-[#0A192F] transition-colors">
                  {lvl.code}
                </span>
                <span className="block font-bold text-xs text-[#0A192F]">
                  {language === 'ar' ? lvl.nameAr : lvl.nameEn}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('curriculum')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] transition-all shadow-md"
            >
              <span>{t.curriculum.exploreSyllabus}</span>
              <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>

            {contacts.placementTestUrl && (
            <a
              href={pt.href}
              target={pt.target}
              rel={pt.rel}
              aria-label={t.features.placementAriaLabel}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] hover:brightness-105 active:scale-95 transition-all shadow-md"
            >
              <ClipboardCheck className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>{pt.label(language === 'ar')}</span>
            </a>
            )}
          </div>
        </div>
      </section>

      {/* STUDENT REVIEWS & FEEDBACK GALLERY */}
      <StudentReviewsSection previewLimit={6} />
      <VerifiedTestimonials limit={3} title />
    </div>
  );
};
