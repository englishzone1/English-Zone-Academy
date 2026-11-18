import React from 'react';
import { GraduationCap, LogIn, Gift, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// «انضم لنا»: ثلاث خيارات جنبًا إلى جنب، والزائر يختار طريقه مباشرة
export const JoinUsPage: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);

  const options = [
    {
      route: 'register',
      icon: GraduationCap,
      highlight: true,
      title: tr('New student', 'طالبة جديدة'),
      sub: tr('I want to study at the academy', 'أريد الدراسة في الأكاديمية'),
      points: [
        tr('Live small-group classes (4–6)', 'حصص مباشرة في مجموعات صغيرة (4–6)'),
        tr('Interactive homework and monthly report', 'واجبات تفاعلية وتقرير شهري'),
        tr('Your account is created with the form', 'يُنشأ حسابك مع نموذج التسجيل')
      ],
      cta: tr('Register for the course', 'سجّلي على الكورس')
    },
    {
      route: 'login',
      icon: LogIn,
      highlight: false,
      title: tr('Enrolled student', 'طالبة مسجّلة في الأكاديمية'),
      sub: tr('I already have an account', 'عندي حساب في المنصة'),
      points: [
        tr('Your dashboard, group and stars', 'لوحتك ومجموعتك ونجومك'),
        tr('Homework, tests and results', 'الواجبات والاختبارات والنتائج'),
        tr('Messages with your teacher', 'الرسائل مع معلمتك')
      ],
      cta: tr('Log in', 'تسجيل الدخول')
    },
    {
      route: 'join',
      icon: Gift,
      highlight: false,
      title: tr('Free account', 'حساب مجاني'),
      sub: tr('Just exploring for now', 'أريد التعرّف أولًا'),
      points: [
        tr('Free books and magazine issues', 'كتب وأعداد مجلة مجانية'),
        tr('Offers and news first', 'العروض والأخبار أولًا'),
        tr('Enroll whenever you are ready', 'سجّلي على الكورس متى أردتِ')
      ],
      cta: tr('Create a free account', 'أنشئي حسابًا مجانيًا')
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-serif-luxury font-bold text-3xl text-[#0A192F]">{tr('Join us', 'انضمي إلينا')}</h1>
          <p className="text-sm text-gray-600">{tr('Choose what fits you', 'اختاري ما يناسبك')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {options.map((o) => {
            const Icon = o.icon;
            return (
              <button
                key={o.route}
                onClick={() => navigate(o.route)}
                className={`text-start rounded-3xl p-6 border-2 shadow-sm flex flex-col gap-4 transition-all hover:-translate-y-1 hover:shadow-lg ${
                  o.highlight ? 'bg-[#0A192F] border-[#D4AF37] text-white' : 'bg-white border-gray-200 text-[#0A192F] hover:border-[#D4AF37]'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${o.highlight ? 'bg-[#D4AF37] text-[#0A192F]' : 'bg-[#F3E5AB]/50 text-[#AA820A]'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className={`font-bold text-lg ${o.highlight ? 'text-[#F3E5AB]' : ''}`}>{o.title}</h2>
                  <p className={`text-xs ${o.highlight ? 'text-gray-300' : 'text-gray-500'}`}>{o.sub}</p>
                </div>
                <ul className={`text-xs space-y-1.5 flex-1 ${o.highlight ? 'text-gray-200' : 'text-gray-600'}`}>
                  {o.points.map((p) => (
                    <li key={p} className="flex items-start gap-1.5">
                      <span className="text-[#D4AF37]">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
                <span
                  className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 ${
                    o.highlight ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F]' : 'bg-[#0A192F] text-[#F3E5AB]'
                  }`}
                >
                  {o.cta}
                  <ArrowLeft className={`w-4 h-4 ${isAr ? '' : 'rotate-180'}`} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
