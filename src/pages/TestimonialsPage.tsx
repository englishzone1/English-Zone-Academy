import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { studentHubService } from '../services/studentHubService';
import { useLanguage } from '../context/LanguageContext';
import { StudentReviewsSection } from '../components/reviews/StudentReviewsSection';

interface TestimonialsPageProps {
  navigate: (route: string) => void;
}

export const TestimonialsPage: React.FC<TestimonialsPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  // آراء الطلاب المكتوبة التي وافقت عليها الإدارة
  const [written, setWritten] = useState<any[]>([]);
  useEffect(() => {
    studentHubService
      .getApprovedTestimonials()
      .then(setWritten)
      .catch((err) => console.error('Error loading testimonials:', err));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <StudentReviewsSection showHeader={true} />

      {written.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {written.map((w) => (
              <div key={w.id} className="bg-white rounded-3xl p-6 border border-[#D4AF37]/30 shadow-sm space-y-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`w-4 h-4 ${n <= (w.rating || 0) ? 'text-[#D4AF37] fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {(language === 'ar' ? w.quoteAr : w.quoteEn) || w.quoteAr || w.quoteEn}
                </p>
                <div className="text-xs font-bold text-[#0A192F]">
                  {(language === 'ar' ? w.studentNameAr : w.studentNameEn) || w.studentNameAr}
                  {w.level ? <span className="text-gray-400 font-normal"> • {w.level}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to join */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center bg-[#0A192F] text-white p-10 rounded-3xl border border-[#D4AF37]/30">
          <h2 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#F3E5AB]">
            {language === 'ar' ? 'ابدأ قصة نجاحك الخاصة مع English Zone' : 'Begin Your Own Success Story Today'}
          </h2>
          <p className="text-sm text-gray-300 max-w-xl mx-auto mt-2 mb-6">
            {language === 'ar'
              ? 'انضم إلى زملائك وتعلم بالسرعة التي تريحك مع معلمين معتمدين.'
              : 'Join fellow ambitious learners and advance with certified native-level educators.'}
          </p>
          <button
            onClick={() => navigate('register')}
            className="px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] hover:brightness-110 shadow-lg"
          >
            {t.nav.register}
          </button>
        </div>
      </div>
    </div>
  );
};
