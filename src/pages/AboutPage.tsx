import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  Award, 
  Globe, 
  Users, 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  GraduationCap
} from 'lucide-react';

interface AboutPageProps {
  navigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();

  const values = [
    {
      titleEn: 'Academic Rigor & CEFR Alignment',
      titleAr: 'الدقة الأكاديمية ومطابقة معايير CEFR',
      descEn: 'Every stage, lesson, and assessment strictly reflects international Common European Framework benchmarks.',
      descAr: 'جميع المراحل والدروس والتقييمات تتبع بدقة معايير الإطار الأوروبي المشترك لتحديد الكفاءة اللغوية.'
    },
    {
      titleEn: 'Active Conversational Fluency',
      titleAr: 'التركيز على الطلاقة والمحادثة الحية',
      descEn: 'We prioritize live, spontaneous speaking over mechanical grammar drills, eliminating internal translation barriers.',
      descAr: 'نركز على التحدث التلقائي الحي بدلاً من حفظ القواعد الجاف، لإزالة حاجز التردد والترجمة الذهنية.'
    },
    {
      titleEn: 'Transparent Academic Progress',
      titleAr: 'الشفافية الكاملة في التطور الأكاديمي',
      descEn: 'Students advance through tangible 2-month stages with continuous teacher feedback and verifiable milestone certificates.',
      descAr: 'يتقدم الطالب عبر مراحل ملموسة مدتها شهران مع تقارير أداء دورية وشهادات إتمام موثقة برمز تحقق.'
    },
    {
      titleEn: '100% Online Dedicated Classrooms',
      titleAr: 'تعليم تفاعلي حي عبر الإنترنت 100%',
      descEn: 'Accessible anywhere in the world with state-of-the-art interactive digital tools and high-engagement learning formats.',
      descAr: 'إمكانية الانضمام من أي مكان في العالم مع أدوات تعليمية تفاعلية حديثة وبيئة تدريس متطورة.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            {t.brand.tagline}
          </span>
          <h1 className="font-serif-luxury font-bold text-3xl sm:text-5xl text-[#0A192F] mt-2">
            {language === 'ar' ? 'عن أكاديمية English Zone' : 'About English Zone Academy'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-4 leading-relaxed">
            {t.brand.subSlogan}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Mission & Positioning Grid */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#D4AF37]/30 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] block">
                Brand Positioning
              </span>
              <h2 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F]">
                {t.brand.slogan}
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {language === 'ar'
                  ? 'أكاديمية English Zone هي صرح تعليمي دولي عبر الإنترنت متخصص في تقديم برامج لغة إنجليزية منهجية عالية الجودة، تشمل دورات المجموعات التفاعلية الصغيرة، تدريب المحادثة والطلاقة، والمسارات الإنجليزية المتخصصة للأعمال والأكاديميا.'
                  : 'English Zone is a premium international online English academy offering structured CEFR learning pathways, interactive small groups, conversation mastery, and specialized English programs for career and academic excellence.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <span className="px-3 py-1.5 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-semibold">
                  {language === 'ar' ? 'تعليم عبر الإنترنت فقط' : 'Online Only Format'}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D4AF37]/40 text-[#0A192F] text-xs font-semibold">
                  {language === 'ar' ? 'للأطفال والناشئة والكبار' : 'Children, Teens & Adults'}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D4AF37]/40 text-[#0A192F] text-xs font-semibold">
                  {language === 'ar' ? 'معايير CEFR الأوروبية' : 'CEFR A1 to C2 Standard'}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0A192F] to-[#102445] text-white p-8 rounded-2xl border border-[#D4AF37]/30 shadow-inner space-y-4">
              <h3 className="font-serif-luxury font-bold text-xl text-[#F3E5AB]">
                {language === 'ar' ? 'الفئات المستهدفة بأكاديمية English Zone' : 'Our Target Learners'}
              </h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'الأطفال والناشئة (بناء أساس لغوي متين وشغف باللغة)' : 'Children & Teens (solid foundational phonics & love of English)'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'طلاب الجامعات والدراسات العليا' : 'University & Postgraduate Students'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'المحترفون ورواد الأعمال والباحثون عن وظائف دولية' : 'Professionals, Executives & Career Climbers'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'المتعلمون الساعون لكسر حاجز الخوف والتحدث بطلاقة' : 'Learners seeking to eliminate hesitation and speak with ease'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Academic Leadership / Founder Section (Strictly no personal name) */}
        <div className="bg-[#0A192F] text-white rounded-3xl p-8 sm:p-12 border border-[#D4AF37]/40 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* English Zone Academy Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-xs sm:max-w-sm rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-xl bg-[#060D1A]">
                <img
                  src="/assets/aistudio/file_00000000c3b08210abdde9ab8258756c_98faaab4.png"
                  alt="English Zone Academy"
                  className="w-full h-auto block"
                />
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                {t.founder.sectionTitle}
              </span>
              <h2 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-white">
                {t.founder.roleTitle}
              </h2>
              <blockquote className="border-l-4 border-[#D4AF37] pl-4 italic text-base sm:text-lg text-[#F3E5AB] font-serif-luxury">
                {t.founder.quote}
              </blockquote>
              <p className="text-sm text-gray-300 leading-relaxed">
                {t.founder.bio1}
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                {t.founder.bio2}
              </p>
              <div className="pt-2 space-y-2">
                {t.founder.credentials.map((cred, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                    <Award className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <span>{cred}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Pillars & Values */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              Academic Pillars
            </span>
            <h2 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-[#0A192F] mt-1">
              {language === 'ar' ? 'قيم وركائز التدريس بالأكاديمية' : 'Our Educational Philosophy'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:border-[#D4AF37]/50 transition-all">
                <h3 className="font-serif-luxury font-bold text-lg text-[#0A192F] mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                  <span>{language === 'ar' ? v.titleAr : v.titleEn}</span>
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {language === 'ar' ? v.descAr : v.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
