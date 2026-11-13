import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  PROGRAM_CATEGORIES,
  CEFR_LEVELS_INFO,
  EF_SET_PLACEMENT_TEST_URL
} from '../data/academyData';
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
} from 'lucide-react';
import { EnglishZoneEmblem } from '../components/common/Logo';
import { EnglishClubHomeSection } from '../components/englishClub/EnglishClubHomeSection';
import { StudentReviewsSection } from '../components/reviews/StudentReviewsSection';

interface HomePageProps {
  navigate: (
    route: string,
    state?: { preselectedLevel?: CEFRLevel; curriculumLevel?: CEFRLevel }
  ) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { t, language, dir } = useLanguage();
  const [isPackageExpanded, setIsPackageExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0A192F] via-[#0F2042] to-[#0A192F] text-white pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-[#D4AF37]/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
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

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('register')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-xl hover:shadow-[#D4AF37]/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-5 h-5" />
                <span>{t.hero.ctaJoin}</span>
              </button>

              <a
                href={EF_SET_PLACEMENT_TEST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-base border-2 border-[#D4AF37]/60 text-[#F3E5AB] hover:bg-[#D4AF37]/15 hover:border-[#D4AF37] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <span>{t.hero.ctaTest}</span>
                <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
              </a>

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

      {/* 1. ACADEMY FEATURES & BENEFITS */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            {t.features.sectionEyebrow}
          </span>
          <h2 className="font-serif-luxury font-bold text-3xl sm:text-4xl text-[#0A192F] mt-2">
            {t.features.sectionTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Feature 1: Free Placement Test */}
          <div
            dir={dir}
            className="relative bg-white rounded-3xl p-7 sm:p-8 border-2 border-[#D4AF37]/35 shadow-lg hover:border-[#D4AF37] transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0A192F] via-[#D4AF37] to-[#0A192F]" />
            <div>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#0A192F] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center shadow-md flex-shrink-0">
                  <ClipboardCheck className="w-7 h-7" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold text-[#AA820A] tracking-wide">
                  {t.features.placementBadge}
                </span>
              </div>

              <h3 className="font-serif-luxury font-bold text-xl sm:text-2xl text-[#0A192F] mb-3">
                {t.features.placementTitle}
              </h3>

              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-7">
                {t.features.placementDesc}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <a
                href={EF_SET_PLACEMENT_TEST_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.features.placementAriaLabel}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-md hover:shadow-lg hover:brightness-105 active:scale-95 transition-all"
              >
                <span>{t.features.placementCta}</span>
                <ExternalLink className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Feature 2: Free CPD Certificate */}
          <div
            dir={dir}
            className="relative bg-gradient-to-br from-[#0A192F] to-[#102445] text-white rounded-3xl p-7 sm:p-8 border-2 border-[#D4AF37]/50 shadow-xl hover:border-[#D4AF37] transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37]" />
            <div>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-[#F3E5AB] border border-[#D4AF37]/50 flex items-center justify-center shadow-md flex-shrink-0">
                  <Award className="w-7 h-7 text-[#D4AF37]" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold text-[#F3E5AB] tracking-wide">
                  {t.features.cpdBadge}
                </span>
              </div>

              <h3 className="font-serif-luxury font-bold text-xl sm:text-2xl text-[#F3E5AB] mb-3">
                {t.features.cpdTitle}
              </h3>

              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                {t.features.cpdDesc}
              </p>
            </div>

            <div className="mt-7 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="h-1 w-14 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]" />
              <span className="text-xs font-bold text-[#D4AF37]">
                {t.features.cpdFooterNote}
              </span>
            </div>
          </div>

          {/* Feature 3: Complete Learning Package */}
          <div
            dir={dir}
            className="md:col-span-2 relative bg-white rounded-3xl p-7 sm:p-9 border-2 border-[#D4AF37]/40 shadow-lg hover:border-[#D4AF37] transition-all overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0A192F] via-[#D4AF37] to-[#0A192F]" />

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0A192F] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center shadow-md flex-shrink-0">
                  <BookOpenCheck className="w-7 h-7" aria-hidden="true" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#AA820A] mb-1">
                    {t.features.packageBadge}
                  </span>
                  <h3 className="font-serif-luxury font-bold text-xl sm:text-2xl text-[#0A192F]">
                    {t.features.packageTitle}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 mt-2 leading-relaxed">
                    {t.features.packageDesc}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPackageExpanded((prev) => !prev)}
                aria-expanded={isPackageExpanded}
                className="w-full sm:w-auto self-start inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[#0A192F] text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-[#0A192F] transition-all shadow-sm flex-shrink-0 whitespace-nowrap"
              >
                <span>{isPackageExpanded ? t.features.hideDetails : t.features.viewDetails}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isPackageExpanded ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {(isPackageExpanded
                  ? t.features.packageItems
                  : t.features.packageItems.slice(0, 4)
                ).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
                    <CheckCircle2
                      className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-1"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
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

            <a
              href={EF_SET_PLACEMENT_TEST_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.features.placementAriaLabel}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] hover:brightness-105 active:scale-95 transition-all shadow-md"
            >
              <ClipboardCheck className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>{t.hero.ctaTest}</span>
              <ExternalLink className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* STUDENT REVIEWS & FEEDBACK GALLERY */}
      <StudentReviewsSection previewLimit={6} />
    </div>
  );
};
