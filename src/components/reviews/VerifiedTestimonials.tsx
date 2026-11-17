import React, { useEffect, useState } from 'react';
import { Star, BadgeCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { studentHubService } from '../../services/studentHubService';

// آراء الطلاب المكتوبة التي وافقت عليها الإدارة، مع علامة «تقييم موثّق» لمن كتبها طالب مشترك
export const VerifiedTestimonials: React.FC<{ limit?: number; title?: boolean }> = ({ limit, title = false }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    studentHubService
      .getApprovedTestimonials()
      .then((list) => setItems(limit ? list.slice(0, limit) : list))
      .catch((err) => console.error('Error loading testimonials:', err));
  }, [limit]);

  if (!items.length) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {title && (
        <div className="text-center space-y-1">
          <h2 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F]">{isAr ? 'ماذا يقول طلابنا' : 'What our students say'}</h2>
          <p className="text-sm text-gray-500">{isAr ? 'تقييمات حقيقية من طلاب مشتركين في الأكاديمية' : 'Real reviews from enrolled academy students'}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((w) => (
          <div key={w.id} className="bg-white rounded-3xl p-6 border border-[#D4AF37]/30 shadow-sm space-y-3 flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`w-4 h-4 ${n <= (w.rating || 0) ? 'text-[#D4AF37] fill-current' : 'text-gray-200'}`} />
                ))}
              </div>
              {w.studentId && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1 whitespace-nowrap">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {isAr ? 'تقييم موثّق من طالب مشترك' : 'Verified review from an enrolled student'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line flex-1">
              {(isAr ? w.quoteAr : w.quoteEn) || w.quoteAr || w.quoteEn}
            </p>
            <div className="text-xs font-bold text-[#0A192F]">
              {(isAr ? w.studentNameAr : w.studentNameEn) || w.studentNameAr}
              {w.level ? <span className="text-gray-400 font-normal"> • {w.level}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
