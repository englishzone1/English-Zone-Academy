import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TESTIMONIALS_LIST } from '../data/academyData';
import { Sparkles, Star, Quote, GraduationCap, CheckCircle } from 'lucide-react';

interface TestimonialsPageProps {
  navigate: (route: string) => void;
}

export const TestimonialsPage: React.FC<TestimonialsPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            Real Student Experiences
          </span>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl text-[#0A192F] mt-2">
            {t.testimonials.sectionTitle}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
            {t.testimonials.sectionSubtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS_LIST.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-3xl p-8 border border-[#D4AF37]/30 shadow-md hover:border-[#D4AF37] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-[#D4AF37]">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#AA820A] border border-[#D4AF37]/30 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[#25D366]" />
                    <span>{t.testimonials.verifiedStudent}</span>
                  </span>
                </div>

                <div className="text-gray-300 mb-2">
                  <Quote className="w-8 h-8 text-[#D4AF37]/40 rotate-180" />
                </div>

                <p className="text-gray-700 text-sm sm:text-base leading-relaxed italic mb-6">
                  "{language === 'ar' ? test.quoteAr : test.quoteEn}"
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif-luxury font-bold text-base text-[#0A192F]">
                    {language === 'ar' ? test.nameAr : test.nameEn}
                  </h3>
                  <span className="text-xs text-gray-500 block">
                    {language === 'ar' ? test.roleAr : test.roleEn}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                    {language === 'ar' ? 'المستوى' : 'Level'}
                  </span>
                  <span className="text-xs font-bold text-[#0A192F]">
                    {language === 'ar' ? test.levelAr : test.levelEn}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to join */}
        <div className="mt-16 text-center bg-[#0A192F] text-white p-10 rounded-3xl border border-[#D4AF37]/30">
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
