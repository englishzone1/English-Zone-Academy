import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { STAGE_PRICING_TABLE } from '../data/academyData';
import { CEFRLevel, LearningFormat } from '../types';
import { 
  Check, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  GraduationCap, 
  HelpCircle,
  TrendingDown,
  Info
} from 'lucide-react';

interface PricingPageProps {
  navigate: (route: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const [selectedFormat, setSelectedFormat] = useState<LearningFormat>('individual');
  const [levelFilter, setLevelFilter] = useState<'ALL' | CEFRLevel>('ALL');

  const filteredPricing = STAGE_PRICING_TABLE.filter((row) => {
    if (levelFilter === 'ALL') return true;
    return row.level === levelFilter;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            Academy Tuition & Plans
          </span>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl text-[#0A192F] mt-2">
            {t.pricing.sectionTitle}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
            {t.pricing.sectionSubtitle}
          </p>
        </div>

        {/* Format Selector Toggle */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="bg-white p-1.5 rounded-2xl border border-[#D4AF37]/30 shadow-md inline-flex">
            <button
              onClick={() => setSelectedFormat('individual')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                selectedFormat === 'individual'
                  ? 'bg-[#0A192F] text-[#F3E5AB] shadow'
                  : 'text-gray-600 hover:text-[#0A192F]'
              }`}
            >
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>{t.pricing.toggleIndividual}</span>
            </button>
            <button
              onClick={() => setSelectedFormat('group')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                selectedFormat === 'group'
                  ? 'bg-[#0A192F] text-[#F3E5AB] shadow'
                  : 'text-gray-600 hover:text-[#0A192F]'
              }`}
            >
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>{t.pricing.toggleGroup}</span>
            </button>
          </div>
        </div>

        {/* Level Quick Filter */}
        <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
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
              {lvl === 'ALL' ? (language === 'ar' ? 'جميع المراحل (18)' : 'All 18 Stages') : `Level ${lvl}`}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Format Feature Highlights Banner */}
        <div className="mb-10 bg-gradient-to-r from-[#0A192F] to-[#102445] text-white rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/30 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-[#0A192F] text-xs font-bold">
                  {selectedFormat === 'individual' ? '60 MIN / LESSON' : '90 MIN / LESSON'}
                </span>
                <span className="font-serif-luxury font-bold text-xl text-[#F3E5AB]">
                  {selectedFormat === 'individual' ? t.formats.individualTitle : t.formats.groupTitle}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                {selectedFormat === 'individual' ? t.formats.individualDesc : t.formats.groupDesc}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 block">
                {language === 'ar' ? 'نظام السداد' : 'Payment Model'}
              </span>
              <span className="font-bold text-sm text-[#F3E5AB]">
                {language === 'ar' ? 'شهري بدون التزام 6 أشهر' : 'Month-by-Month (No 6-mo Lock)'}
              </span>
            </div>
          </div>
        </div>

        {/* PRICING TABLE (ACCURATE TO SPECIFICATION) */}
        <div className="bg-white rounded-3xl border border-[#D4AF37]/30 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0A192F] text-[#F3E5AB] text-xs uppercase tracking-wider font-semibold border-b border-[#D4AF37]/20">
                  <th className="py-4 px-6">{t.pricing.stageHeader}</th>
                  <th className="py-4 px-6">{language === 'ar' ? 'المستوى' : 'CEFR Level'}</th>
                  <th className="py-4 px-6">{t.pricing.durationHeader}</th>
                  <th className="py-4 px-6">{t.pricing.monthlyPrice}</th>
                  {selectedFormat === 'individual' && (
                    <>
                      <th className="py-4 px-6">{t.pricing.originalPrice}</th>
                      <th className="py-4 px-6">{t.pricing.savings}</th>
                    </>
                  )}
                  <th className="py-4 px-6 text-center">{language === 'ar' ? 'الإجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredPricing.map((row) => {
                  const currentPrice = selectedFormat === 'individual' ? row.individualCurrent : row.groupPrice;
                  const originalPrice = row.individualOriginal;
                  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

                  return (
                    <tr 
                      key={row.stage}
                      className="hover:bg-[#FAF8F5] transition-colors"
                    >
                      {/* Stage Identifier */}
                      <td className="py-4 px-6 font-bold text-[#0A192F] font-mono text-base">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#D4AF37]/40 flex items-center justify-center text-xs font-bold text-[#0A192F]">
                            {row.stage}
                          </span>
                          <span>Stage {row.stage}</span>
                        </span>
                      </td>

                      {/* Level */}
                      <td className="py-4 px-6 text-gray-600 font-semibold">
                        Level {row.level}
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-6 text-gray-500 text-xs">
                        {row.months} (2 Months)
                      </td>

                      {/* Current Price */}
                      <td className="py-4 px-6">
                        <span className="font-serif-luxury font-bold text-2xl text-[#0A192F]">
                          ${currentPrice}
                        </span>
                        <span className="text-xs text-gray-500 font-normal ml-1">{t.programs.perMonth}</span>
                      </td>

                      {/* Original Price & Discount (Individual only, as specified in rules 11 & 12) */}
                      {selectedFormat === 'individual' && (
                        <>
                          <td className="py-4 px-6 text-gray-400 line-through text-sm">
                            ${originalPrice}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30">
                              <TrendingDown className="w-3.5 h-3.5" />
                              {discountPercent}% OFF
                            </span>
                          </td>
                        </>
                      )}

                      {/* Register Action */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => navigate('register')}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0A192F] text-white hover:bg-[#D4AF37] hover:text-[#0A192F] transition-all shadow-sm active:scale-95"
                        >
                          {language === 'ar' ? `سجّل في ${row.level}` : `Enroll ${row.level}`}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
