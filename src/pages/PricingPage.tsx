import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LEVEL_GROUP_PRICING } from '../data/academyData';
import { CEFRLevel } from '../types';
import { 
  Check, 
  Clock,
  Users,
  GraduationCap,
  Info
} from 'lucide-react';

interface PricingPageProps {
  navigate: (route: string, state?: { preselectedLevel?: CEFRLevel }) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const [levelFilter, setLevelFilter] = useState<'ALL' | CEFRLevel>('ALL');

  const filteredLevels = LEVEL_GROUP_PRICING.filter((item) => {
    if (levelFilter === 'ALL') return true;
    return item.level === levelFilter;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            Academy Tuition & Plan
          </span>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl text-[#0A192F] mt-2">
            {t.pricing.sectionTitle}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
            {t.pricing.sectionSubtitle}
          </p>
        </div>

        {/* Level Quick Filter */}
        <div className="flex items-center justify-center flex-wrap gap-2 mt-8">
          {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                levelFilter === lvl
                  ? 'bg-[#D4AF37] text-[#0A192F] font-bold shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {lvl === 'ALL' ? (language === 'ar' ? 'جميع المستويات (6)' : 'All 6 Levels') : `Level ${lvl}`}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Group Format Overview Banner */}
        <div className="mb-10 bg-gradient-to-r from-[#0A192F] to-[#102445] text-white rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/30 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-[#0A192F] text-xs font-bold">
                  90 MIN / LESSON
                </span>
                <span className="font-serif-luxury font-bold text-xl text-[#F3E5AB]">
                  {t.formats.groupTitle}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                {t.formats.groupDesc}
              </p>
            </div>

            <div className="bg-white/5 border border-[#D4AF37]/40 rounded-2xl px-6 py-4 flex-shrink-0 text-center md:text-end">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 block">
                {language === 'ar' ? 'نظام السداد' : 'Payment Model'}
              </span>
              <span className="font-bold text-sm text-[#F3E5AB] block mt-1">
                {language === 'ar' ? 'شهري لكل مستوى بدون التزام 6 أشهر' : 'Month-by-Month per Level'}
              </span>
            </div>
          </div>
        </div>

        {/* 6 SEPARATE LEVEL-BASED PRICING CARDS */}
        <div className={`grid gap-6 ${
          filteredLevels.length === 1
            ? 'grid-cols-1 max-w-md mx-auto'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredLevels.map((item) => (
            <div
              key={item.level}
              className="bg-white rounded-3xl p-7 border-2 border-[#D4AF37]/30 shadow-lg hover:border-[#D4AF37] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-[#0A192F] text-[#F3E5AB] font-serif-luxury font-bold text-xl flex items-center justify-center shadow">
                      {item.level}
                    </span>
                    <div>
                      <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F]">
                        {language === 'ar' ? `المستوى ${item.level}` : `Level ${item.level}`}
                      </h2>
                      <span className="text-xs text-gray-500 font-medium block">
                        {language === 'ar' ? item.nameAr : item.nameEn}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#AA820A] border border-[#D4AF37]/40">
                    {item.durationMonths} {language === 'ar' ? 'أشهر' : 'Months'}
                  </span>
                </div>

                {/* Format Info */}
                <div className="space-y-2 text-xs text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <span>{t.formats.groupTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <span>
                      {language === 'ar'
                        ? `مجموعات صغيرة (4–6 طلاب) • ${item.stagesCount} مراحل`
                        : `Small Groups (4–6 students) • ${item.stagesCount} Stages`}
                    </span>
                  </div>
                </div>

                {/* Pricing Highlight Box */}
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

              {/* Enroll Button */}
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

        {/* PRICING POLICIES & NOTICES */}
        <div className="mt-12 bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm">
          <h3 className="font-serif-luxury font-bold text-xl text-[#0A192F] flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-[#D4AF37]" />
            <span>{t.pricing.noticeTitle}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <span>{t.pricing.notice1}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <span>{t.pricing.notice2}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <span>{t.pricing.notice3}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
              <span>{t.pricing.notice4}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
