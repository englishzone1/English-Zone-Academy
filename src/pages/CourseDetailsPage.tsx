import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PROGRAM_CATEGORIES, LEVEL_GROUP_PRICING } from '../data/academyData';
import { CEFRLevel } from '../types';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Clock,
  GraduationCap,
  Users
} from 'lucide-react';

interface CourseDetailsPageProps {
  courseId: string;
  navigate: (route: string, state?: { preselectedLevel?: CEFRLevel }) => void;
}

export const CourseDetailsPage: React.FC<CourseDetailsPageProps> = ({ courseId, navigate }) => {
  const { t, language, dir } = useLanguage();
  const course = PROGRAM_CATEGORIES.find((item) => item.id === courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-[#D4AF37]/30 shadow-lg text-center space-y-5">
          <h1 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
            {language === 'ar' ? 'الدورة غير موجودة' : 'Course Not Found'}
          </h1>
          <p className="text-sm text-gray-600">
            {language === 'ar'
              ? 'يرجى اختيار إحدى الدورات المتاحة من قائمة البرامج الأكاديمية.'
              : 'Please choose one of our available courses from the academic catalog.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('programs')}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-[#0A192F] text-[#F3E5AB] hover:bg-[#162B4D] transition-colors"
            >
              {t.programs.viewAll}
            </button>
            <button
              onClick={() => navigate('home')}
              className="px-6 py-3 rounded-xl font-semibold text-sm border border-gray-300 text-[#0A192F] hover:bg-gray-50 transition-colors"
            >
              {t.nav.home}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSmallGroupCourses = course.id === 'small-group-courses';
  const otherCourses = PROGRAM_CATEGORIES.filter((item) => item.id !== course.id);

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Back Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A192F] hover:text-[#AA820A] transition-colors"
          >
            <ArrowLeft className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            <span>{language === 'ar' ? 'العودة إلى الرئيسية' : 'Back to Home'}</span>
          </button>

          <button
            onClick={() => navigate('programs')}
            className="text-xs font-bold text-[#AA820A] hover:underline"
          >
            {t.programs.viewAll}
          </button>
        </div>

        {/* Hero Summary Banner */}
        <div className="bg-gradient-to-br from-[#0A192F] to-[#102445] text-white rounded-3xl p-7 sm:p-10 lg:p-12 border-2 border-[#D4AF37]/40 shadow-2xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37] text-[#0A192F] text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.brand.name}</span>
            </span>
            {course.badgeEn && (
              <span className="px-3 py-1 rounded-full bg-white/10 border border-[#D4AF37]/40 text-[#F3E5AB] text-xs font-semibold">
                {language === 'ar' ? course.badgeAr : course.badgeEn}
              </span>
            )}
          </div>

          <h1 className="font-serif-luxury font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-4">
            {language === 'ar' ? course.titleAr : course.titleEn}
          </h1>

          <p className="text-base sm:text-lg text-gray-200 max-w-3xl leading-relaxed mb-8">
            {language === 'ar' ? course.fullDescAr : course.fullDescEn}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-[#D4AF37] font-bold mb-1">
                <Users className="w-4 h-4" />
                <span>{t.programs.format}</span>
              </div>
              <p className="text-gray-200">{language === 'ar' ? course.formatAr : course.formatEn}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-[#D4AF37] font-bold mb-1">
                <Clock className="w-4 h-4" />
                <span>{t.programs.duration}</span>
              </div>
              <p className="text-gray-200">{language === 'ar' ? course.durationAr : course.durationEn}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-[#D4AF37] font-bold mb-1">
                <GraduationCap className="w-4 h-4" />
                <span>{t.programs.suitableFor}</span>
              </div>
              <p className="text-gray-200">{language === 'ar' ? course.suitableForAr : course.suitableForEn}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => navigate('register')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{t.programs.enrollNow}</span>
            </button>

            <button
              onClick={() => navigate('curriculum')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm border border-[#D4AF37]/50 text-[#F3E5AB] hover:bg-[#D4AF37]/10 transition-colors"
            >
              {t.curriculum.exploreSyllabus}
            </button>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-white rounded-3xl p-7 sm:p-10 border border-[#D4AF37]/30 shadow-md">
          <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F] mb-5">
            {language === 'ar' ? 'الأهداف والمخرجات التعليمية' : 'Core Learning Objectives'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(language === 'ar' ? course.objectivesAr : course.objectivesEn).map((obj, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200/80"
              >
                <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 leading-relaxed">{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Level-Based Pricing Cards ONLY for Small Group Courses (A1-C2) */}
        {isSmallGroupCourses && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                {t.brand.cefrStandard}
              </span>
              <h2 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F] mt-1">
                {t.pricing.sectionTitle}
              </h2>
              <p className="text-sm text-gray-600 mt-2">{t.pricing.sectionSubtitle}</p>
            </div>

            {/* PROMINENT STUDY & PAYMENT PLAN NOTICE DIRECTLY ABOVE A1-C2 CARDS */}
            <div
              dir={dir}
              className="relative bg-gradient-to-br from-[#0A192F] via-[#0F2042] to-[#0A192F] text-white rounded-3xl p-6 sm:p-8 border-2 border-[#D4AF37] shadow-xl overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37]" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center flex-shrink-0 shadow-md">
                  <CalendarCheck className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-serif-luxury font-bold text-xl sm:text-2xl text-[#F3E5AB]">
                      {t.pricing.studyPaymentTitle}
                    </h3>
                    <span className="inline-flex items-center px-3.5 py-1 rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A192F] text-xs sm:text-sm font-extrabold shadow-sm">
                      {t.pricing.studyPaymentHighlight}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-4xl">
                    {t.pricing.studyPaymentDesc}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {LEVEL_GROUP_PRICING.map((item) => (
                <div
                  key={item.level}
                  className="bg-white rounded-3xl p-7 border-2 border-[#D4AF37]/30 shadow-lg hover:border-[#D4AF37] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <span className="w-12 h-12 rounded-2xl bg-[#0A192F] text-[#F3E5AB] font-serif-luxury font-bold text-xl flex items-center justify-center shadow">
                          {item.level}
                        </span>
                        <div>
                          <h3 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
                            {language === 'ar' ? `المستوى ${item.level}` : `Level ${item.level}`}
                          </h3>
                          <span className="text-xs text-gray-500 font-medium block">
                            {language === 'ar' ? item.nameAr : item.nameEn}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#AA820A] border border-[#D4AF37]/40">
                        {item.durationMonths} {language === 'ar' ? 'أشهر' : 'Months'}
                      </span>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#D4AF37]/35 mb-6">
                      <div className="flex items-baseline justify-between gap-3 flex-wrap">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">
                            {t.pricing.originalPrice}
                          </span>
                          <span className="text-xl font-semibold text-gray-400 line-through inline-block mt-1" dir="ltr">
                            ${item.originalPrice}
                          </span>
                        </div>

                        <div className="text-end">
                          <span className="text-[11px] uppercase tracking-wider text-[#AA820A] font-bold block">
                            {t.pricing.monthlyPrice}
                          </span>
                          <div className="inline-flex items-baseline gap-1 px-3 py-1 rounded-xl bg-[#0A192F] text-[#F3E5AB] mt-1 shadow-sm">
                            <span className="font-serif-luxury font-bold text-3xl" dir="ltr">
                              ${item.offerPrice}
                            </span>
                            <span className="text-xs text-gray-300 font-normal">
                              {t.programs.perMonth}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className="block text-xs font-semibold text-[#AA820A] mt-3 pt-2.5 border-t border-[#D4AF37]/20 text-center"
                        dir="rtl"
                      >
                        {item.priceNoteAr}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('register', { preselectedLevel: item.level })}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] hover:brightness-110 transition-all shadow flex items-center justify-center gap-2 active:scale-95"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>
                      {language === 'ar' ? `سجّل في المستوى ${item.level}` : `Enroll Level ${item.level}`}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explore Other Courses */}
        <div className="pt-4">
          <h3 className="font-serif-luxury font-bold text-xl text-[#0A192F] mb-4">
            {language === 'ar' ? 'دورات أخرى في الأكاديمية' : 'Explore Other Courses'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherCourses.map((other) => (
              <button
                key={other.id}
                onClick={() => navigate(`course/${other.id}`)}
                className="text-start bg-white rounded-2xl p-5 border border-[#D4AF37]/25 hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-serif-luxury font-bold text-base text-[#0A192F]">
                    {language === 'ar' ? other.titleAr : other.titleEn}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {language === 'ar' ? other.shortDescAr : other.shortDescEn}
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 text-[#D4AF37] flex-shrink-0 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
