import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StudentReviewsSection } from '../components/reviews/StudentReviewsSection';

interface TestimonialsPageProps {
  navigate: (route: string) => void;
}

export const TestimonialsPage: React.FC<TestimonialsPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <StudentReviewsSection showHeader={true} />

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
