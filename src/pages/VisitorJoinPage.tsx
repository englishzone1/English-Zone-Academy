import React, { useState } from 'react';
import { Gift, BookOpen, Newspaper, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton, OrDivider, googleErrorMessage } from '../components/common/GoogleSignInButton';

// إنشاء حساب زائر مجاني: يفتح الكتب والمواد المخصّصة «للمسجّلين مجانًا»
export const VisitorJoinPage: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const { registerVisitor, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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

  const done = () => navigate('portal');

  const viaGoogle = async () => {
    setBusy(true);
    setError('');
    const r = await registerVisitor({ name, phone, google: true });
    setBusy(false);
    if (r.success) done();
    else setError(errText(r.code));
  };

  const viaEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError(tr('Fill in your name, email and a password (6+ characters).', 'اكتبي اسمك وبريدك وكلمة مرور من 6 أحرف على الأقل.'));
      return;
    }
    setBusy(true);
    setError('');
    const r = await registerVisitor({ name, phone, email, password });
    setBusy(false);
    if (r.success) done();
    else setError(errText(r.code));
  };

  const inp = 'w-full px-4 py-3 rounded-xl border border-gray-300 text-sm bg-white';

  if (isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6 text-center" dir={isAr ? 'rtl' : 'ltr'}>
        <p className="text-sm text-[#0A192F] font-bold">{tr('You are already signed in.', 'أنتِ مسجّلة الدخول بالفعل.')}</p>
        <button onClick={done} className="px-5 py-2.5 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-sm font-bold">
          {tr('Go to my page', 'اذهبي إلى صفحتي')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0A192F] text-[#D4AF37] flex items-center justify-center">
            <Gift className="w-7 h-7" />
          </div>
          <h1 className="font-serif-luxury font-bold text-2xl text-[#0A192F]">{tr('Free account', 'حساب مجاني')}</h1>
          <p className="text-sm text-gray-600">{tr('Sign up free and unlock extra books and materials.', 'سجّلي مجانًا وافتحي كتبًا ومواد إضافية من English Zone.')}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-[#0A192F]">
          <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-1">
            <BookOpen className="w-5 h-5 mx-auto text-[#D4AF37]" />
            {tr('Free books', 'كتب مجانية')}
          </div>
          <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-1">
            <Newspaper className="w-5 h-5 mx-auto text-[#D4AF37]" />
            {tr('Magazine issues', 'أعداد المجلة')}
          </div>
          <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-1">
            <Sparkles className="w-5 h-5 mx-auto text-[#D4AF37]" />
            {tr('News & offers', 'العروض أولًا')}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr('Your name', 'اسمك')} className={inp} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" placeholder={tr('WhatsApp number (optional)', 'رقم واتساب (اختياري)')} className={inp} />
          <GoogleSignInButton onClick={viaGoogle} disabled={busy} isAr={isAr} />
          <OrDivider isAr={isAr} />
          <form onSubmit={viaEmail} className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" placeholder={tr('Email', 'البريد الإلكتروني')} className={inp} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" placeholder={tr('Password (6+ characters)', 'كلمة المرور (6 أحرف على الأقل)')} className={inp} />
            <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-sm font-bold disabled:opacity-50">
              {busy ? '...' : tr('Create free account', 'إنشاء حساب مجاني')}
            </button>
          </form>
          {error && <p className="text-xs font-bold text-red-600 text-center">{error}</p>}
          <p className="text-[11px] text-gray-500 text-center">
            {tr('Already have an account?', 'عندك حساب؟')}{' '}
            <button onClick={() => navigate('login')} className="font-bold text-[#0A192F] underline">
              {tr('Log in', 'سجّلي الدخول')}
            </button>
          </p>
        </div>

        <p className="text-[11px] text-gray-500 text-center">
          {tr(
            'Want to study with us? The free account is not a subscription — you can enroll anytime from the Register page.',
            'تريدين الدراسة معنا؟ الحساب المجاني ليس اشتراكًا، وتستطيعين التسجيل في الأكاديمية في أي وقت من صفحة «سجّل الآن».'
          )}
        </p>
      </div>
    </div>
  );
};
