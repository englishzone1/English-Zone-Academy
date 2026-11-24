import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CEFR_LEVELS_INFO, CURRICULUM_PREVIEW } from '../data/academyData';
import { CEFRLevel, StageId } from '../types';
import { usePublishedCourses } from '../hooks/useSiteContent';
import { 
  BookOpen, 
  MessageSquare, 
  Sparkles, 
  CheckCircle, 
  GraduationCap, 
  Clock, 
  FileText,
  Layers,
  ChevronRight
} from 'lucide-react';

interface CurriculumPageProps {
  navigate: (route: string) => void;
  initialLevel?: CEFRLevel;
}

export const CurriculumPage: React.FC<CurriculumPageProps> = ({ navigate, initialLevel }) => {
  const { t, language } = useLanguage();
  const [activeLevel, setActiveLevel] = useState<CEFRLevel>(initialLevel || 'A1');
  const [activeStageNumber, setActiveStageNumber] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (initialLevel) {
      setActiveLevel(initialLevel);
      setActiveStageNumber(1);
    }
  }, [initialLevel]);

  const currentLevelInfo = CEFR_LEVELS_INFO.find((l) => l.code === activeLevel) || CEFR_LEVELS_INFO[0];
  const activeStageId = `${activeLevel}.${activeStageNumber}` as StageId;

  // Find curriculum data or generate structured curriculum for the selected stage
  const existingStage = CURRICULUM_PREVIEW.find((s) => s.stageId === activeStageId);

  // محتوى المرحلة كما هو موجود فقط؛ لا توجد وحدات مولّدة تلقائيًا
  const displayUnits = existingStage?.units || [];

  // المناهج التي تنشرها من لوحة الإدارة لهذا المستوى
  const publishedCourses = usePublishedCourses();
  const levelCourses = publishedCourses.filter((c) => !c.level || c.level === activeLevel);

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            Structured CEFR Pathways
          </span>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl text-[#0E3A99] mt-2">
            {t.curriculum.sectionTitle}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
            {t.curriculum.sectionSubtitle}
          </p>
        </div>

        {/* Level Switcher (A1 to C2) */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {CEFR_LEVELS_INFO.map((lvl) => {
            const isSelected = activeLevel === lvl.code;
            return (
              <button
                key={lvl.code}
                onClick={() => {
                  setActiveLevel(lvl.code);
                  setActiveStageNumber(1);
                }}
                className={`px-5 py-3 rounded-2xl font-serif-luxury font-bold text-base transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#0E3A99] text-[#F3E5AB] border-2 border-[#D4AF37] shadow-xl scale-105'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#D4AF37] hover:bg-gray-50'
                }`}
              >
                <span>{lvl.code}</span>
                <span className="text-xs font-sans font-normal text-gray-400">
                  ({language === 'ar' ? lvl.nameAr : lvl.nameEn})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Level Summary Banner */}
        <div className="bg-white rounded-3xl p-8 border border-[#D4AF37]/30 shadow-md mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-[#0E3A99] text-[#F3E5AB] font-serif-luxury font-bold text-2xl flex items-center justify-center">
                  {currentLevelInfo.code}
                </span>
                <div>
                  <h2 className="font-serif-luxury font-bold text-2xl text-[#0E3A99]">
                    {language === 'ar' ? currentLevelInfo.nameAr : currentLevelInfo.nameEn}
                  </h2>
                  <span className="text-xs text-[#AA820A] font-semibold">
                    6 {language === 'ar' ? 'أشهر إجمالية للمستوى' : 'Total Months for Full Level'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3 max-w-2xl leading-relaxed">
                {language === 'ar' ? currentLevelInfo.descriptionAr : currentLevelInfo.descriptionEn}
              </p>
            </div>

            <div className="flex flex-col gap-2 self-start md:self-auto">
              <button
                onClick={() => navigate('register')}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0E3A99] hover:brightness-110 shadow transition-all flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{language === 'ar' ? `التسجيل في المستوى ${activeLevel}` : `Enroll in Level ${activeLevel}`}</span>
              </button>
              <span className="text-[11px] text-gray-500 text-center">
                {language === 'ar' ? 'التسجيل بالمستوى الرئيسي فقط' : 'Enrollment is by main CEFR level'}
              </span>
            </div>
          </div>

          {/* 3 Internal Stages Tabs */}
          <div className="pt-6">
            <span className="text-xs uppercase tracking-wider font-bold text-gray-500 block mb-3">
              {language === 'ar' ? 'اختر المرحلة الداخلية (شهران لكل مرحلة):' : 'Select Internal Stage (2 Months each):'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((num) => {
                const stageId = `${activeLevel}.${num}`;
                const isSelected = activeStageNumber === num;
                return (
                  <button
                    key={num}
                    onClick={() => setActiveStageNumber(num as 1 | 2 | 3)}
                    className={`p-4 rounded-xl text-left transition-all border ${
                      isSelected
                        ? 'bg-[#0E3A99] text-white border-[#D4AF37] shadow-md'
                        : 'bg-[#FAF8F5] text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-serif-luxury font-bold text-base ${isSelected ? 'text-[#F3E5AB]' : 'text-[#0E3A99]'}`}>
                        Stage {stageId}
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/10 text-gray-300' : 'bg-white text-gray-500'}`}>
                        {num === 1 ? 'Months 1–2' : num === 2 ? 'Months 3–4' : 'Months 5–6'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 block">
                      {num === 1 
                        ? (language === 'ar' ? 'تأسيس وبناء المفردات' : 'Foundational Mastery')
                        : num === 2 
                        ? (language === 'ar' ? 'توسيع التعبير والطلاقة' : 'Expanding Fluency')
                        : (language === 'ar' ? 'تثبيت المستوى والتقييم' : 'Advanced Synthesis & Review')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {levelCourses.length > 0 && (
          <div className="mb-10 space-y-4">
            <h3 className="font-serif-luxury font-bold text-xl text-[#0E3A99] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" />
              <span>{language === 'ar' ? `المناهج المتاحة للمستوى ${activeLevel}` : `Available Curricula for ${activeLevel}`}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {levelCourses.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl p-5 border border-[#D4AF37]/30 shadow-sm space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-[#0E3A99]">{(language === 'ar' ? c.titleAr : c.titleEn) || c.titleAr || c.titleEn}</span>
                    {c.durationMonths ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#AA820A] border border-[#D4AF37]/40 whitespace-nowrap">
                        {c.durationMonths} {language === 'ar' ? 'أشهر' : 'months'}
                      </span>
                    ) : null}
                  </div>
                  {((language === 'ar' ? c.descriptionAr : c.descriptionEn) || c.descriptionAr || c.descriptionEn) && (
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {(language === 'ar' ? c.descriptionAr : c.descriptionEn) || c.descriptionAr || c.descriptionEn}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage Units Detailed Accordion / Cards */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-luxury font-bold text-xl text-[#0E3A99] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#D4AF37]" />
              <span>
                {language === 'ar' ? `محتوى وحدات المرحلة ${activeStageId}` : `Units & Syllabus for Stage ${activeStageId}`}
              </span>
            </h3>
            {displayUnits.length > 0 && (
              <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                {displayUnits.length} {language === 'ar' ? 'وحدات دراسية مكثفة' : 'Core Units'}
              </span>
            )}
          </div>

          {displayUnits.length === 0 && (
            <div className="p-8 rounded-3xl bg-white border border-gray-200 text-center text-sm text-gray-500">
              {language === 'ar'
                ? 'تفاصيل وحدات هذه المرحلة غير منشورة بعد.'
                : 'The unit details for this stage have not been published yet.'}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {displayUnits.map((unit) => (
              <div 
                key={unit.unitNumber}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm hover:border-[#D4AF37]/50 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-9 h-9 rounded-lg bg-[#0E3A99] text-[#F3E5AB] font-bold text-sm flex items-center justify-center">
                    0{unit.unitNumber}
                  </span>
                  <h4 className="font-serif-luxury font-bold text-xl text-[#0E3A99]">
                    {language === 'ar' ? unit.titleAr : unit.titleEn}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Grammar & Vocabulary */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-gray-100">
                      <span className="text-xs uppercase font-bold tracking-wider text-[#AA820A] flex items-center gap-1.5 mb-1.5">
                        <BookOpen className="w-4 h-4" />
                        {t.curriculum.grammar}
                      </span>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {language === 'ar' ? unit.grammarAr : unit.grammarEn}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-gray-100">
                      <span className="text-xs uppercase font-bold tracking-wider text-[#AA820A] flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-4 h-4" />
                        {t.curriculum.vocabulary}
                      </span>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {language === 'ar' ? unit.vocabularyAr : unit.vocabularyEn}
                      </p>
                    </div>
                  </div>

                  {/* Skills & Speaking Task */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-gray-100">
                      <span className="text-xs uppercase font-bold tracking-wider text-[#0E3A99] flex items-center gap-1.5 mb-1.5">
                        <FileText className="w-4 h-4 text-[#D4AF37]" />
                        {t.curriculum.skills}
                      </span>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {language === 'ar' ? unit.skillsAr : unit.skillsEn}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0E3A99]/5 border border-[#D4AF37]/30">
                      <span className="text-xs uppercase font-bold tracking-wider text-[#0E3A99] flex items-center gap-1.5 mb-1.5">
                        <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                        {t.curriculum.speakingActivity}
                      </span>
                      <p className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed">
                        {language === 'ar' ? unit.speakingActivityAr : unit.speakingActivityEn}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
