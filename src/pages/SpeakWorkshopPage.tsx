import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, Hourglass, CheckCircle2, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { validRealName, latinDigits } from '../components/student/CompleteProfile';

// صفحة الورشة المجانية «تحدّث بالإنجليزية وابنِ ثقتك» برابط مستقل (/workshop):
// تسجيل حساب في الأكاديمية ← إكمال البيانات (الاسم، الجنس، الدولة، العمر، الهاتف) ← «تم» ← نافذة الانضمام لقناة تيليغرام
export const SPEAK_WORKSHOP = {
  poster: '/workshops/speak-confidence-2026-12-03.jpg',
  titleAr: 'تحدّث بالإنجليزية وابنِ ثقتك',
  subtitleAr: 'خطوتك الأولى نحو التحدث بطلاقة وتجاوز الخوف',
  dateAr: 'الخميس 3 ديسمبر 2026',
  timeAr: '8:00 مساءً',
  durationAr: 'ساعتان',
  learnAr: ['كيف تبدأ التحدث باللغة الإنجليزية', 'بناء الجمل والتعبير عن أفكارك', 'التغلب على الخوف والتردد أثناء الحديث', 'ممارسة المحادثة في مواقف واقعية']
};

export const SpeakWorkshopPage: React.FC<{ navigate: (route: string) => void }> = ({ navigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const { registerVisitor, isAuthenticated } = useAuth();
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const W = SPEAK_WORKSHOP;

  useEffect(() => {
    document.title = `${W.titleAr} | English Zone Academy`;
  }, []);

  // بعد التسجيل: إلى صفحتها، حيث تُكمل بياناتها ثم يظهر رابط تيليغرام
  useEffect(() => {
    if (isAuthenticated) navigate('portal');
  }, [isAuthenticated]);

  const mark = () => {
    try {
      localStorage.setItem('ez_from_workshop', String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const errText = (code?: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return tr('This email already has an account. Please log in.', 'هذا البريد له حساب من قبل، {سجّل|سجّلي} الدخول.');
      case 'auth/weak-password':
        return tr('Password must be at least 6 characters.', 'كلمة المرور 6 أحرف على الأقل.');
      case 'auth/invalid-email':
        return tr('The email address is not valid.', 'البريد الإلكتروني غير صحيح.');
      case 'auth/network-request-failed':
        return 'تحقّق من اتصال الإنترنت ثم {حاول|حاولي} مرة أخرى.';
      case 'auth/too-many-requests':
        return 'محاولات كثيرة، {انتظر|انتظري} دقيقة ثم {حاول|حاولي} مرة أخرى.';
      default:
        return `تعذّر التسجيل، {حاول|حاولي} مرة أخرى${code ? ` (${code})` : ''}.`;
    }
  };

  // الاسم والعمر قبل التسجيل (يُملآن تلقائيًا في نموذج البيانات بعده)
  const checkBasics = () => {
    if (!validRealName(fullName)) {
      setError('{اكتب|اكتبي} {اسمك|اسمكِ} الكامل (الاسم والعائلة) أولًا.');
      return false;
    }
    if (!(Number(age) > 0)) {
      setError('{اكتب|اكتبي} {عمرك|عمركِ} أولًا.');
      return false;
    }
    return true;
  };

  const viaEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!checkBasics()) return;
    if (!email.trim() || password.length < 6) {
      setError(tr('Write your email and a password (6+ characters).', '{اكتب|اكتبي} {بريدك|بريدكِ} وكلمة مرور من 6 أحرف على الأقل.'));
      return;
    }
    mark();
    setBusy(true);
    const r = await registerVisitor({ name: fullName.trim(), age: age.trim(), email, password });
    setBusy(false);
    if (r.success) navigate('portal');
    else setError(errText(r.code));
  };

  const inp = 'w-full px-4 py-3 rounded-xl border border-[#d8c4c0] text-sm bg-white focus:outline-none focus:border-[#6b2f3a]';

  return (
    <div className="min-h-screen bg-[#f6ede6] py-6 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <img src={W.poster} alt={W.titleAr} className="w-full rounded-3xl shadow-xl border border-[#e3d2cb]" />
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#e3d2cb] space-y-5">
          <div className="space-y-2 text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-[#6b2f3a] text-white text-xs font-bold">ورشة مجانية تفاعلية</span>
            <h1 className="text-3xl font-extrabold text-[#2b1d1d]">{W.titleAr}</h1>
            <p className="text-sm text-[#6b5b57]">{W.subtitleAr}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: CalendarDays, t: W.dateAr },
              { icon: Clock, t: W.timeAr },
              { icon: Hourglass, t: `المدة: ${W.durationAr}` }
            ].map((x) => (
              <div key={x.t} className="p-3 rounded-2xl bg-[#f6ede6]">
                <x.icon className="w-5 h-5 mx-auto mb-1 text-[#6b2f3a]" />
                <p className="text-[11px] font-bold text-[#2b1d1d] leading-snug">{x.t}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="font-bold text-[#6b2f3a] mb-2">ماذا {'{ستتعلم|ستتعلمين}'} في الورشة؟</p>
            <ul className="space-y-1.5">
              {W.learnAr.map((l) => (
                <li key={l} className="flex items-center gap-2 text-sm text-[#2b1d1d]">
                  <CheckCircle2 className="w-4 h-4 text-[#6b2f3a] shrink-0" />
                  {l}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm font-bold text-[#2b1d1d] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#b58a3c]" /> الورشة مجانية بالكامل + شهادة حضور مجانية وموثّقة
            </p>
          </div>

          <div className="border-t border-[#eadbd5] pt-5 space-y-3">
            <p className="font-bold text-[#2b1d1d] text-center">{'{سجّل|سجّلي}'} الآن مجانًا</p>
            <p className="text-[11px] text-[#6b5b57] text-center">
              {'{تنشئ|تنشئين}'} حسابًا مجانيًا في English Zone Academy، ثم {'{تكتب|تكتبين}'} {'{اسمك|اسمكِ}'} وبياناتك، وبعدها يظهر لك رابط قناة تيليغرام التي نرسل فيها رابط الورشة وموعدها.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم الكامل" className={`${inp} col-span-2`} />
              <input value={age} onChange={(e) => setAge(latinDigits(e.target.value).replace(/[^\d]/g, '').slice(0, 2))} inputMode="numeric" placeholder="العمر" className={inp} />
            </div>
            {error && <p className="text-sm font-bold text-red-700 bg-red-50 border border-red-300 rounded-xl p-3 text-center">{error}</p>}
            <form onSubmit={viaEmail} className="space-y-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} placeholder="البريد الإلكتروني" autoCapitalize="off" autoCorrect="off" className={inp} dir="ltr" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة مرور (6 أحرف على الأقل)" className={inp} dir="ltr" />
              <button type="submit" disabled={busy} className="w-full py-3.5 rounded-xl bg-[#6b2f3a] hover:bg-[#5a2630] text-white text-sm font-bold disabled:opacity-50">
                {busy ? '...' : 'التسجيل في الورشة'}
              </button>
            </form>
            <p className="text-[11px] text-center text-[#6b5b57]">
              لديك حساب؟{' '}
              <button onClick={() => navigate('login')} className="font-bold text-[#6b2f3a] underline">
                تسجيل الدخول
              </button>
            </p>
          </div>
        </div>
      </div>
      <p className="text-center text-[11px] text-[#6b5b57] mt-6">English Zone Academy | Learn • Speak • Grow</p>
    </div>
  );
};
