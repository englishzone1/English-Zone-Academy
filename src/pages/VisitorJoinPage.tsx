import React, { useState } from 'react';
import { Target, Users, BookOpen, Megaphone, BadgePercent, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton, OrDivider, googleErrorMessage } from '../components/common/GoogleSignInButton';
import { EnglishZoneEmblem } from '../components/common/Logo';

// «سجّلي الآن»: تسجيل مجاني كامل، تظهر صاحبته عند الإدارة في «المسجّلون المحتملون»،
// ومن لوحتها تضغط «للاشتراك في الكورس» متى أرادت
export const VisitorJoinPage: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const { registerVisitor, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // تمييز الحقول الناقصة باللون الأحمر
  const [missing, setMissing] = useState(false);

  const benefits = [
    { icon: Target, text: tr('Free placement test to know your exact level', 'تحديد مستواكِ مجانًا باختبار دقيق') },
    { icon: Users, text: tr('Join a community of English learners like you', 'مشاركة مجتمع من يشاركنكِ الاهتمام بالإنجليزية') },
    { icon: BookOpen, text: tr('Free books and academy magazine issues', 'كتب ومجلات مجانية من الأكاديمية') },
    { icon: Megaphone, text: tr('First to hear about free workshops', 'إعلانات الورش المجانية أولًا بأول') },
    { icon: BadgePercent, text: tr('Discounted offers for members', 'عروض وخصومات خاصة بالمسجّلات') }
  ];

  const errText = (code?: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return tr('This email already has an account. Please log in.', 'هذا البريد له حساب من قبل، سجّلي الدخول.');
      case 'auth/weak-password':
        return tr('Password must be at least 6 characters.', 'كلمة المرور 6 أحرف على الأقل.');
      case 'auth/invalid-email':
        return tr('The email address is not valid.', 'البريد الإلكتروني غير صحيح.');
      default:
        return googleErrorMessage(code, isAr) || '';
    }
  };

  const valid = () => {
    if (!name.trim() || !phone.trim()) {
      setMissing(true);
      setError(tr('Write your name and WhatsApp number first, then continue with Google or email.', 'اكتبي اسمكِ ورقم الواتساب أولًا، ثم تابعي بحساب Google أو بالبريد.'));
      return false;
    }
    setMissing(false);
    return true;
  };

  const details = () => ({ name: name.trim(), phone: phone.trim(), country: country.trim(), age: age.trim() });

  const viaGoogle = async () => {
    setError('');
    if (!valid()) return;
    setBusy(true);
    const r = await registerVisitor({ ...details(), google: true });
    setBusy(false);
    if (r.success) navigate('portal');
    else setError(errText(r.code));
  };

  const viaEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!valid()) return;
    if (!email.trim() || password.length < 6) {
      setError(tr('Write your email and a password (6+ characters).', 'اكتبي بريدكِ وكلمة مرور من 6 أحرف على الأقل.'));
      return;
    }
    setBusy(true);
    const r = await registerVisitor({ ...details(), email, password });
    setBusy(false);
    if (r.success) navigate('portal');
    else setError(errText(r.code));
  };

  const inp = 'w-full px-4 py-3 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#D4AF37]';

  if (isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6 text-center" dir={isAr ? 'rtl' : 'ltr'}>
        <p className="text-sm text-[#0A192F] font-bold">{tr('You are already signed in.', 'أنتِ مسجّلة الدخول بالفعل.')}</p>
        <button onClick={() => navigate('portal')} className="px-5 py-2.5 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-sm font-bold">
          {tr('Go to my page', 'اذهبي إلى صفحتي')}
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
            <h1 className="font-serif-luxury font-bold text-3xl text-[#F3E5AB]">{tr('Join English Zone', 'انضمي إلى English Zone')}</h1>
            <p className="text-sm text-gray-300">{tr('Free registration in one minute, and you get:', 'سجّلي مجانًا في دقيقة، واحصلي على:')}</p>
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
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            {tr(
              'Want to study with us? After signing up, one tap on "Subscribe to the course" in your page.',
              'تريدين الدراسة معنا؟ بعد التسجيل تضغطين زر «للاشتراك في الكورس» في صفحتكِ.'
            )}
          </div>
        </div>

        {/* النموذج */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-bold text-xl text-[#0A192F]">{tr('Sign up now – free', 'سجّلي الآن مجانًا')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr('Full name *', 'الاسم الكامل *')} className={`${inp} ${missing && !name.trim() ? 'border-red-400 bg-red-50' : ''}`} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" placeholder={tr('WhatsApp number *', 'رقم واتساب *')} className={`${inp} ${missing && !phone.trim() ? 'border-red-400 bg-red-50' : ''}`} />
            <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder={tr('Country', 'الدولة')} className={inp} />
            <input value={age} onChange={(e) => setAge(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} inputMode="numeric" placeholder={tr('Age', 'العمر')} className={inp} />
          </div>
          {error && <p className="text-xs font-bold text-red-600 text-center p-2 rounded-lg bg-red-50 border border-red-100">{error}</p>}
          <GoogleSignInButton onClick={viaGoogle} disabled={busy} isAr={isAr} />
          <OrDivider isAr={isAr} />
          <form onSubmit={viaEmail} className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" placeholder={tr('Email', 'البريد الإلكتروني')} className={inp} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" placeholder={tr('Password (6+ characters)', 'كلمة المرور (6 أحرف على الأقل)')} className={inp} />
            <button type="submit" disabled={busy} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] text-sm font-bold disabled:opacity-50 shadow-lg">
              {busy ? '...' : tr('Create my free account', 'إنشاء حسابي المجاني')}
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center">
            {tr('Already have an account?', 'عندكِ حساب؟')}{' '}
            <button onClick={() => navigate('login')} className="font-bold text-[#0A192F] underline">
              {tr('Log in', 'سجّلي الدخول')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
