import React, { useEffect, useState } from 'react';
import { Target, Users, BookOpen, Megaphone, BadgePercent, CheckCircle2, MessageCircle } from 'lucide-react';
import { useAcademySettings, whatsappWithText } from '../hooks/useAcademySettings';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton, OrDivider, googleErrorMessage } from '../components/common/GoogleSignInButton';
import { EnglishZoneEmblem } from '../components/common/Logo';

// «سجّلي الآن»: تسجيل مجاني كامل، تظهر صاحبته عند الإدارة في «المسجّلون المحتملون»،
// ومن لوحتها تضغط «للاشتراك في الكورس» متى أرادت
export const VisitorJoinPage: React.FC<{ navigate: (route: string) => void; hideWhatsapp?: boolean }> = ({ navigate, hideWhatsapp }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const { registerVisitor, isAuthenticated } = useAuth();
  const { whatsapp } = useAcademySettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // متصفحات داخل التطبيقات (إنستغرام، فيسبوك، تيك توك، سناب...) يمنع Google الدخول منها
  const inApp = typeof navigator !== 'undefined' && /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Snapchat|TikTok|musical_ly|BytedanceWebview|Line\/|Twitter|WhatsApp|; wv\)/i.test(navigator.userAgent || '');

  // بعد العودة من صفحة Google (على الجوال) ندخلها مباشرة إلى صفحتها
  useEffect(() => {
    if (isAuthenticated) navigate('portal');
  }, [isAuthenticated]);

  const benefits = [
    { icon: Target, text: tr('Free placement test to know your exact level', 'تحديد {مستواك|مستواكِ} مجانًا باختبار دقيق') },
    { icon: Users, text: tr('Join a community of English learners like you', 'مشاركة مجتمع من {يشاركنك|يشاركنكِ} الاهتمام بالإنجليزية') },
    { icon: BookOpen, text: tr('Free books and academy magazine issues', 'كتب ومجلات مجانية من الأكاديمية') },
    { icon: Megaphone, text: tr('First to hear about free workshops', 'إعلانات الورش المجانية أولًا بأول') },
    { icon: BadgePercent, text: tr('Discounted offers for members', 'عروض وخصومات خاصة بالمسجّلات') }
  ];

  const errText = (code?: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return tr('This email already has an account. Please log in.', 'هذا البريد له حساب من قبل، {سجّل|سجّلي} الدخول.');
      case 'auth/weak-password':
        return tr('Password must be at least 6 characters.', 'كلمة المرور 6 أحرف على الأقل.');
      case 'auth/invalid-email':
        return tr('The email address is not valid.', 'البريد الإلكتروني غير صحيح.');
      default:
        return googleErrorMessage(code, isAr) || '';
    }
  };

  // التسجيل: بحساب Google أو بالبريد وكلمة المرور فقط، والاسم ورقم الواتساب يُطلبان داخل المنصة
  const viaGoogle = async () => {
    setError('');
    setBusy(true);
    const r = await registerVisitor({ name: '', google: true });
    setBusy(false);
    if (r.success) navigate('portal');
    else setError(errText(r.code));
  };

  const viaEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || password.length < 6) {
      setError(tr('Write your email and a password (6+ characters).', '{اكتب|اكتبي} {بريدك|بريدكِ} وكلمة مرور من 6 أحرف على الأقل.'));
      return;
    }
    setBusy(true);
    const r = await registerVisitor({ name: '', email, password });
    setBusy(false);
    if (r.success) navigate('portal');
    else setError(errText(r.code));
  };

  const inp = 'w-full px-4 py-3 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#D4AF37]';

  if (isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6 text-center" dir={isAr ? 'rtl' : 'ltr'}>
        <p className="text-sm text-[#0A192F] font-bold">{tr('You are already signed in.', '{أنت|أنتِ} مسجّلة الدخول بالفعل.')}</p>
        <button onClick={() => navigate('portal')} className="px-5 py-2.5 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-sm font-bold">
          {tr('Go to my page', '{اذهب|اذهبي} إلى صفحتي')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* المزايا */}
        <div className="bg-gradient-to-br from-[#0A192F] to-[#102445] text-white rounded-3xl p-7 sm:p-9 border border-[#D4AF37]/40 shadow-xl space-y-6">
          <EnglishZoneEmblem sizeClass="w-16 h-16" glow={true} />
          <div className="space-y-2">
            <h1 className="font-serif-luxury font-bold text-3xl text-[#F3E5AB]">{tr('Join English Zone', '{انضم|انضمي} إلى English Zone')}</h1>
            <p className="text-sm text-gray-300">{tr('Free registration in one minute, and you get:', '{سجّل|سجّلي} مجانًا في دقيقة، {واحصل|واحصلي} على:')}</p>
          </div>
          <ul className="space-y-3">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <li key={b.text} className="flex items-center gap-3 text-sm">
                  <span className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#D4AF37]" />
                  </span>
                  {b.text}
                </li>
              );
            })}
          </ul>
          {whatsapp && !hideWhatsapp && (
            <a
              href={whatsappWithText(whatsapp, tr('Hello English Zone, I would like to know more.', 'مرحبًا English Zone، أريد معرفة المزيد عن الأكاديمية.'))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] text-white text-sm font-bold shadow-lg hover:brightness-105"
            >
              <MessageCircle className="w-5 h-5" />
              {tr('Talk to us on WhatsApp now', '{تواصل|تواصلي} معنا مباشرة على واتساب')}
            </a>
          )}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            {tr(
              'Want to study with us? After signing up, one tap on "Subscribe to the course" in your page.',
              '{تريد|تريدين} الدراسة معنا؟ بعد التسجيل {تضغط|تضغطين} زر «للاشتراك في الكورس» في {صفحتك|صفحتكِ}.'
            )}
          </div>
        </div>

        {/* النموذج */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-bold text-xl text-[#0A192F]">{tr('Sign up now – free', '{سجّل|سجّلي} الآن مجانًا')}</h2>
          <p className="text-xs text-gray-500">{tr('One step: Google or email. We ask for your name and WhatsApp inside.', 'خطوة واحدة: بحساب Google أو بالبريد. {اسمك|اسمكِ} ورقم الواتساب نطلبهما داخل المنصة.')}</p>
          {error && <p className="text-xs font-bold text-red-600 text-center p-2 rounded-lg bg-red-50 border border-red-100">{error}</p>}
          {inApp ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <b className="block">{tr('Google sign-in does not work inside this app', 'الدخول بحساب Google لا يعمل داخل هذا التطبيق')}</b>
              <span>
                {tr(
                  'Open this page in Chrome or Safari (menu ⋮ or ⋯ → Open in browser), or sign up below with your email.',
                  '{افتح|افتحي} الصفحة في Chrome أو Safari (من القائمة ⋮ أو ⋯ ← «فتح في المتصفح»)، أو {سجّل|سجّلي} بالبريد في الأسفل.'
                )}
              </span>
            </div>
          ) : (
            <GoogleSignInButton onClick={viaGoogle} disabled={busy} isAr={isAr} />
          )}
          <OrDivider isAr={isAr} />
          <form onSubmit={viaEmail} className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" placeholder={tr('Email', 'البريد الإلكتروني')} className={inp} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" placeholder={tr('Password (6+ characters)', 'كلمة المرور (6 أحرف على الأقل)')} className={inp} />
            <button type="submit" disabled={busy} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] text-sm font-bold disabled:opacity-50 shadow-lg">
              {busy ? '...' : tr('Create my free account', 'إنشاء حسابي المجاني')}
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center">
            {tr('Already have an account?', '{عندك|عندكِ} حساب؟')}{' '}
            <button onClick={() => navigate('login')} className="font-bold text-[#0A192F] underline">
              {tr('Log in', '{سجّل|سجّلي} الدخول')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
