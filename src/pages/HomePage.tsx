import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  OFFICIAL_CONTACTS, 
  CEFR_LEVELS_INFO, 
  PROGRAM_CATEGORIES, 
  TESTIMONIALS_LIST, 
  FAQ_LIST 
} from '../data/academyData';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Clock, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  GraduationCap, 
  HelpCircle,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { EnglishZoneEmblem } from '../components/common/Logo';
import { EnglishClubHomeSection } from '../components/englishClub/EnglishClubHomeSection';

interface HomePageProps {
  navigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0A192F] via-[#0F2042] to-[#0A192F] text-white pt-12 pb-24 lg:pt-20 lg:pb-32 border-b border-[#D4AF37]/30">
        {/* Subtle geometric background grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Slogan Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#162B4D] border border-[#D4AF37]/40 text-[#F3E5AB] text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
              <EnglishZoneEmblem sizeClass="w-4 h-4" glow={false} showBevelBorder={false} />
              <span>{t.hero.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight">
              {t.hero.title1}
              <span className="block mt-2 gold-gradient-text">
                {t.brand.slogan}
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t.hero.desc}
            </p>

            {/* Main Action CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('register')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-xl hover:shadow-[#D4AF37]/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-5 h-5" />
                <span>{t.hero.ctaJoin}</span>
              </button>

              <button
                onClick={() => navigate('placement-test')}
                className="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-base border-2 border-[#D4AF37]/60 text-[#F3E5AB] hover:bg-[#D4AF37]/15 hover:border-[#D4AF37] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <span>{t.hero.ctaTest}</span>
              </button>

              <button
                onClick={() => navigate('programs')}
                className="w-full sm:w-auto px-6 py-4 rounded-xl font-medium text-base text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
              >
                <span>{t.hero.ctaExplore}</span>
                <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Formats Micro Banner */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-300 font-medium">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                {t.hero.trustPill1}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                {t.hero.trustPill2}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                {t.hero.trustPill3}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                {t.hero.trustPill4}
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* STATS OVERVIEW SECTION */}
      <section className="relative -mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="luxury-card p-6 rounded-2xl text-center">
            <span className="block font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F]">
              {t.stats.levelsCount}
            </span>
            <span className="text-xs sm:text-sm text-gray-600 mt-1 block">
              {t.stats.levelsSub}
            </span>
          </div>
          <div className="luxury-card p-6 rounded-2xl text-center">
            <span className="block font-serif-luxury font-bold text-2xl sm:text-3xl text-[#D4AF37]">
              {t.stats.stagesCount}
            </span>
            <span className="text-xs sm:text-sm text-gray-600 mt-1 block">
              {t.stats.stagesSub}
            </span>
          </div>
          <div className="luxury-card p-6 rounded-2xl text-center">
            <span className="block font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F]">
              {t.stats.lessonTypes}
            </span>
            <span className="text-xs sm:text-sm text-gray-600 mt-1 block">
              {t.stats.lessonTypesSub}
            </span>
          </div>
          <div className="luxury-card p-6 rounded-2xl text-center">
            <span className="block font-serif-luxury font-bold text-2xl sm:text-3xl text-[#D4AF37]">
              {t.stats.curriculum}
            </span>
            <span className="text-xs sm:text-sm text-gray-600 mt-1 block">
              {t.stats.curriculumSub}
            </span>
          </div>
        </div>
      </section>

      {/* LEARNING FORMATS: INDIVIDUAL (60 min) vs GROUP (90 min) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            {t.brand.name} Formats
          </span>
          <h2 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-[#0A192F] mt-2">
            {t.formats.title}
          </h2>
          <p className="text-gray-600 mt-3 text-base">
            {t.formats.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Individual Lessons */}
          <div className="relative rounded-3xl p-8 sm:p-10 bg-white border-2 border-[#D4AF37]/30 shadow-xl hover:border-[#D4AF37] transition-all">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A192F] text-[#F3E5AB] text-xs font-semibold mb-4">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t.formats.individualTime}</span>
            </div>
            
            <h3 className="font-serif-luxury font-bold text-2xl text-[#0A192F] mb-3">
              {t.formats.individualTitle}
            </h3>
            
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
              {t.formats.individualDesc}
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm text-[#0A192F]">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <span>{t.formats.individualBenefit1}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#0A192F]">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <span>{t.formats.individualBenefit2}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#0A192F]">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <span>{t.formats.individualBenefit3}</span>
              </li>
            </ul>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <span className="text-xs text-gray-500 block">{t.programs.startingFrom}</span>
                <span className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
                  $80 <span className="text-sm font-normal text-gray-500">{t.programs.perMonth}</span>
                </span>
              </div>
              <button
                onClick={() => navigate('pricing')}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#0A192F] text-white hover:bg-[#162B4D] transition-colors"
              >
                {t.pricing.sectionTitle}
              </button>
            </div>
          </div>

          {/* Card 2: Small Group Courses */}
          <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#0A192F] to-[#0F2042] text-white border-2 border-[#D4AF37]/50 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37] text-[#0A192F] text-xs font-bold mb-4">
              <Clock className="w-3.5 h-3.5 text-[#0A192F]" />
              <span>{t.formats.groupTime}</span>
            </div>
            
            <h3 className="font-serif-luxury font-bold text-2xl text-white mb-3">
              {t.formats.groupTitle}
            </h3>
            
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
              {t.formats.groupDesc}
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <span>{t.formats.groupBenefit1}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <span>{t.formats.groupBenefit2}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <span>{t.formats.groupBenefit3}</span>
              </li>
            </ul>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <span className="text-xs text-gray-400 block">{t.programs.startingFrom}</span>
                <span className="font-serif-luxury font-bold text-2xl text-[#F3E5AB]">
                  $50 <span className="text-sm font-normal text-gray-300">{t.programs.perMonth}</span>
                </span>
              </div>
              <button
                onClick={() => navigate('register')}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] hover:brightness-110 transition-all shadow-md"
              >
                {t.nav.register}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* CEFR LEVELS & PROGRESSION OVERVIEW */}
      <section className="py-16 bg-[#F3EDE2]/60 border-y border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                International CEFR Standard
              </span>
              <h2 className="font-serif-luxury font-bold text-3xl text-[#0A192F] mt-1">
                {language === 'ar' ? 'المستويات الأوروبية الستة (A1 إلى C2)' : 'The 6 CEFR Proficiency Levels'}
              </h2>
            </div>
            <button
              onClick={() => navigate('curriculum')}
              className="mt-4 md:mt-0 font-semibold text-sm text-[#0A192F] hover:text-[#AA820A] flex items-center gap-1"
            >
              <span>{t.curriculum.exploreSyllabus}</span>
              <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CEFR_LEVELS_INFO.map((lvl) => (
              <div 
                key={lvl.code}
                className="bg-white rounded-2xl p-6 border border-[#D4AF37]/25 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-[#0A192F] text-[#F3E5AB] font-serif-luxury font-bold flex items-center justify-center text-lg">
                    {lvl.code}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF8F5] text-gray-600 border border-gray-200">
                    {lvl.durationMonths} {language === 'ar' ? 'أشهر' : 'Months'} (3 {language === 'ar' ? 'مراحل' : 'Stages'})
                  </span>
                </div>
                
                <h3 className="font-serif-luxury font-bold text-lg text-[#0A192F]">
                  {language === 'ar' ? lvl.nameAr : lvl.nameEn}
                </h3>
                
                <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                  {language === 'ar' ? lvl.descriptionAr : lvl.descriptionEn}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-[11px] text-gray-500 font-mono">
                    {lvl.stages.join(' → ')}
                  </div>
                  <button
                    onClick={() => navigate('curriculum')}
                    className="text-xs font-bold text-[#AA820A] hover:underline"
                  >
                    {language === 'ar' ? 'عرض المحتوى' : 'View Units'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROGRAM CATEGORIES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            {t.programs.sectionTitle}
          </span>
          <h2 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-[#0A192F] mt-2">
            {t.programs.sectionSubtitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROGRAM_CATEGORIES.slice(0, 6).map((prog) => (
            <div 
              key={prog.id}
              className="luxury-card rounded-2xl p-7 flex flex-col justify-between hover:border-[#D4AF37] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0A192F] text-[#D4AF37] flex items-center justify-center shadow">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  {prog.badgeEn && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#D4AF37]/20 text-[#0A192F] border border-[#D4AF37]/40">
                      {language === 'ar' ? prog.badgeAr : prog.badgeEn}
                    </span>
                  )}
                </div>

                <h3 className="font-serif-luxury font-bold text-xl text-[#0A192F] mb-2">
                  {language === 'ar' ? prog.titleAr : prog.titleEn}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {language === 'ar' ? prog.shortDescAr : prog.shortDescEn}
                </p>

                <div className="space-y-1.5 text-xs text-gray-500 mb-6">
                  <div>
                    <span className="font-semibold text-gray-700">{t.programs.format}:</span> {language === 'ar' ? prog.formatAr : prog.formatEn}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">{t.programs.duration}:</span> {language === 'ar' ? prog.durationAr : prog.durationEn}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 block">{t.programs.startingFrom}</span>
                  <span className="font-bold text-lg text-[#0A192F]">${prog.monthlyStartingPrice} <span className="text-xs font-normal text-gray-500">/mo</span></span>
                </div>
                <button
                  onClick={() => navigate('programs')}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0A192F] text-white hover:bg-[#162B4D] transition-colors"
                >
                  {t.programs.learnMore}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ENGLISH CLUB PROMOTIONAL FEATURE SECTION */}
      <EnglishClubHomeSection navigate={navigate} onJoinClick={() => navigate('english-club')} />

      {/* ACADEMIC LEADERSHIP SECTION (FOUNDER INTRODUCTION WITH EDITABLE PLACEHOLDER & NO PERSONAL NAME) */}
      <section className="py-20 bg-gradient-to-r from-[#0A192F] via-[#0F2042] to-[#0A192F] text-white border-y border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Editable Image Placeholder for Founder's Real Photograph */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm aspect-[4/5] rounded-3xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-2xl bg-[#060D1A] group">
                {/* Visual placeholder with refined styling */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-t from-[#060D1A] via-[#0A192F] to-[#102445]">
                  <div className="mb-4">
                    <EnglishZoneEmblem sizeClass="w-24 h-24" glow={true} />
                  </div>
                  <span className="font-serif-luxury font-bold text-lg text-[#F3E5AB]">
                    {t.founder.roleTitle}
                  </span>
                  <span className="text-xs text-[#D4AF37] uppercase tracking-widest font-semibold mt-1">
                    English Zone Academy
                  </span>
                  <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-300">
                    <div className="flex items-center justify-center gap-1 text-[#D4AF37] mb-1 font-semibold">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{t.founder.photoPlaceholder}</span>
                    </div>
                    <span>{t.founder.photoUploadNote}</span>
                  </div>
                </div>

                {/* Crest badge overlay */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#D4AF37] text-[#0A192F] text-[10px] font-bold tracking-wider uppercase shadow">
                  Verified Academic Lead
                </div>
              </div>
            </div>

            {/* Founder Message & Academic Mission (Strictly using role title, no personal name) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-[#D4AF37]/30 text-xs text-[#F3E5AB]">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>{t.founder.sectionTitle}</span>
              </div>

              <h2 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-white">
                {t.founder.roleTitle}
              </h2>

              <blockquote className="border-l-4 border-[#D4AF37] pl-4 italic text-lg sm:text-xl text-[#F3E5AB] font-serif-luxury leading-relaxed">
                {t.founder.quote}
              </blockquote>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t.founder.bio1}
              </p>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t.founder.bio2}
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {t.founder.credentials.map((cred, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <span>{cred}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            {t.testimonials.sectionTitle}
          </span>
          <h2 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-[#0A192F] mt-2">
            {t.testimonials.sectionSubtitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS_LIST.map((test) => (
            <div 
              key={test.id}
              className="luxury-card rounded-2xl p-7 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-[#D4AF37] mb-4">
                  {[...Array(test.rating)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm sm:text-base italic leading-relaxed mb-6">
                  "{language === 'ar' ? test.quoteAr : test.quoteEn}"
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#0A192F]">
                    {language === 'ar' ? test.nameAr : test.nameEn}
                  </h4>
                  <span className="text-xs text-gray-500 block">
                    {language === 'ar' ? test.roleAr : test.roleEn}
                  </span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FAF8F5] text-[#AA820A] border border-[#D4AF37]/30">
                  {language === 'ar' ? test.levelAr : test.levelEn}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ PREVIEW */}
      <section className="py-16 bg-[#F3EDE2]/40 border-t border-[#D4AF37]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              FAQ
            </span>
            <h2 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F] mt-1">
              {language === 'ar' ? 'الأسئلة الأكثر شيوعاً' : 'Frequently Asked Questions'}
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_LIST.slice(0, 4).map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm">
                <h3 className="font-bold text-base text-[#0A192F] flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <span>{language === 'ar' ? faq.questionAr : faq.questionEn}</span>
                </h3>
                <p className="text-sm text-gray-600 mt-2 pl-7 leading-relaxed">
                  {language === 'ar' ? faq.answerAr : faq.answerEn}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => navigate('faq')}
              className="font-bold text-sm text-[#0A192F] hover:text-[#AA820A] underline"
            >
              {language === 'ar' ? 'عرض جميع الأسئلة الشائعة' : 'View All Frequently Asked Questions'}
            </button>
          </div>
        </div>
      </section>

      {/* FINAL JOIN NOW CTA BANNER */}
      <section className="py-16 bg-[#0A192F] text-white border-t border-[#D4AF37]/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-white">
            {t.brand.slogan}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-base">
            {language === 'ar' 
              ? 'احجز مقعدك الآن في أكاديمية English Zone الدولية وابدأ رحلتك نحو الطلاقة اللغوية بثقة.'
              : 'Secure your place in English Zone International Academy today and begin your journey toward effortless fluency.'
            }
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] shadow-lg hover:brightness-110 transition-all"
            >
              {t.nav.register}
            </button>
            <a
              href={OFFICIAL_CONTACTS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-base border border-white/20 hover:bg-white/10 text-white flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#25D366]" />
              <span>{language === 'ar' ? 'تواصل عبر الواتساب' : 'WhatsApp Admissions'}</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
