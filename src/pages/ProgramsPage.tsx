import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PROGRAM_CATEGORIES, CEFR_LEVELS_INFO } from '../data/academyData';
import { 
  BookOpen, 
  Clock, 
  Users, 
  CheckCircle, 
  GraduationCap, 
  Sparkles, 
  ArrowRight,
  Filter
} from 'lucide-react';

interface ProgramsPageProps {
  navigate: (route: string) => void;
}

export const ProgramsPage: React.FC<ProgramsPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'levels' | 'formats'>('all');

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            {t.brand.name} Academic Catalog
          </span>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl text-[#0A192F] mt-2">
            {t.programs.sectionTitle}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
            {t.programs.sectionSubtitle}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedFilter === 'all'
                ? 'bg-[#0A192F] text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {language === 'ar' ? 'جميع المسارات (7 برامج)' : 'All Programs (7 Tracks)'}
          </button>
          <button
            onClick={() => setSelectedFilter('levels')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedFilter === 'levels'
                ? 'bg-[#0A192F] text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {language === 'ar' ? 'مستويات CEFR الأوروبية' : 'CEFR Levels (A1–C2)'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* CEFR LEVELS BANNER */}
        {selectedFilter !== 'formats' && (
          <div className="mb-16 bg-white rounded-3xl p-8 border border-[#D4AF37]/30 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                  Academic Progression Matrix
                </span>
                <h2 className="font-serif-luxury font-bold text-2xl text-[#0A192F] mt-1">
                  {language === 'ar' ? 'هيكلية المستويات الستة والـ 18 مرحلة' : '6 Core CEFR Levels & 18 Internal Stages'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {language === 'ar' 
                    ? 'يستغرق كل مستوى 6 أشهر مقسمة إلى 3 مراحل داخلية (شهران لكل مرحلة) لتدرج مستمر ونتائج ملموسة.'
                    : 'Each main level is a 6-month program with 3 progressive stages of 2 months each.'
                  }
                </p>
              </div>
              <button
                onClick={() => navigate('curriculum')}
                className="mt-4 md:mt-0 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#0A192F] text-white hover:bg-[#162B4D] transition-colors self-start md:self-auto"
              >
                {t.curriculum.exploreSyllabus}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {CEFR_LEVELS_INFO.map((lvl) => (
                <div key={lvl.code} className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 text-center hover:border-[#D4AF37] transition-all">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[#0A192F] text-[#F3E5AB] font-serif-luxury font-bold text-xl flex items-center justify-center mb-2">
                    {lvl.code}
                  </div>
                  <h3 className="font-bold text-sm text-[#0A192F]">
                    {language === 'ar' ? lvl.nameAr : lvl.nameEn}
                  </h3>
                  <div className="text-[11px] text-gray-500 font-mono mt-1">
                    {lvl.stages.join(' • ')}
                  </div>
                  <span className="inline-block mt-2 text-[10px] font-semibold text-[#AA820A] bg-[#D4AF37]/15 px-2 py-0.5 rounded-full">
                    6 {language === 'ar' ? 'أشهر' : 'Months'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROGRAM CATEGORY CARDS */}
        {selectedFilter !== 'levels' && (
          <div className="space-y-10">
            {PROGRAM_CATEGORIES.map((prog, index) => (
              <div 
                key={prog.id}
                className="bg-white rounded-3xl p-8 sm:p-10 border border-[#D4AF37]/30 shadow-md hover:border-[#D4AF37] transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Info */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#0A192F] text-[#F3E5AB]">
                        Program 0{index + 1}
                      </span>
                      {prog.badgeEn && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#0A192F] border border-[#D4AF37]/40">
                          {language === 'ar' ? prog.badgeAr : prog.badgeEn}
                        </span>
                      )}
                    </div>

                    <h2 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F]">
                      {language === 'ar' ? prog.titleAr : prog.titleEn}
                    </h2>

                    <p className="text-base text-gray-700 leading-relaxed">
                      {language === 'ar' ? prog.fullDescAr : prog.fullDescEn}
                    </p>

                    {/* Learning Objectives */}
                    <div className="pt-2">
                      <h4 className="text-xs uppercase font-bold tracking-wider text-[#0A192F] mb-3">
                        {language === 'ar' ? 'الأهداف التعليمية الرئيسية:' : 'Core Learning Objectives:'}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(language === 'ar' ? prog.objectivesAr : prog.objectivesEn).map((obj, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                            <span>{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Details pill row */}
                    <div className="pt-4 flex flex-wrap gap-4 text-xs text-gray-600 border-t border-gray-100">
                      <div>
                        <span className="font-bold text-[#0A192F] block">{t.programs.format}:</span>
                        <span>{language === 'ar' ? prog.formatAr : prog.formatEn}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#0A192F] block">{t.programs.duration}:</span>
                        <span>{language === 'ar' ? prog.durationAr : prog.durationEn}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#0A192F] block">{t.programs.suitableFor}:</span>
                        <span>{language === 'ar' ? prog.suitableForAr : prog.suitableForEn}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Pricing & Enrollment Action */}
                  <div className="lg:col-span-4 bg-[#FAF8F5] rounded-2xl p-6 border border-gray-200/80 flex flex-col justify-between h-full">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block">
                        {t.pricing.monthlyPrice}
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xs text-gray-500">{language === 'ar' ? 'من' : 'From'}</span>
                        <span className="font-serif-luxury font-bold text-3xl text-[#0A192F]">
                          ${prog.monthlyStartingPrice}
                        </span>
                        <span className="text-xs text-gray-500">{t.programs.perMonth}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-2">
                        {t.pricing.notice1}
                      </p>
                    </div>

                    <div className="pt-6 space-y-3">
                      <button
                        onClick={() => navigate('register')}
                        className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] hover:brightness-110 shadow transition-all flex items-center justify-center gap-2"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>{t.programs.enrollNow}</span>
                      </button>

                      <button
                        onClick={() => navigate('curriculum')}
                        className="w-full py-2.5 rounded-xl font-semibold text-xs border border-gray-300 text-[#0A192F] hover:bg-white transition-colors"
                      >
                        {t.curriculum.exploreSyllabus}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
