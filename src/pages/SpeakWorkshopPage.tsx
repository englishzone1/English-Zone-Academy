import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, Hourglass, CheckCircle2, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { validRealName, latinDigits } from '../components/student/CompleteProfile';
import { GoogleSignInButton, OrDivider, googleErrorMessage } from '../components/common/GoogleSignInButton';
import { workshopPageService, WorkshopPage, DEFAULT_GROUP_LINK, joinUrl, currentJoinUrl } from '../services/workshopService';

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

// الورشة الأولى (قبل لوحة الإدارة): تُستعمل إن لم تُنشر ورشة من اللوحة بعد
export const FALLBACK_PAGE: WorkshopPage = {
  workshopId: '',
  published: true,
  title: SPEAK_WORKSHOP.titleAr,
  subtitle: SPEAK_WORKSHOP.subtitleAr,
  date: SPEAK_WORKSHOP.dateAr,
  time: SPEAK_WORKSHOP.timeAr,
  duration: SPEAK_WORKSHOP.durationAr,
  learn: SPEAK_WORKSHOP.learnAr,
  color: '#6b2f3a',
  poster: SPEAK_WORKSHOP.poster,
  groupLink: DEFAULT_GROUP_LINK
};

// لون فاتح من لون الورشة لخلفية الصفحة
export const tint = (hex: string, k = 0.88) => {
  const n = parseInt(hex.replace('#', ''), 16);
  const ch = (v: number) => Math.round(v + (255 - v) * k);
  return `rgb(${ch((n >> 16) & 255)}, ${ch((n >> 8) & 255)}, ${ch(n & 255)})`;
};

// صفحة ورشة: من workshopId، أو الورشة المنشورة الحالية، أو الورشة الأولى
export const loadWorkshopPage = async (workshopId?: string): Promise<WorkshopPage | null> => {
  try {
    if (workshopId) return await workshopPageService.get(workshopId);
    return (await workshopPageService.current()) || FALLBACK_PAGE;
  } catch {
    return workshopId ? null : FALLBACK_PAGE;
  }
};

export const SpeakWorkshopPage: React.FC<{ navigate: (route: string) => void; workshopId?: string }> = ({ navigate, workshopId }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const { registerVisitor, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState<WorkshopPage | null | undefined>(undefined);
  useEffect(() => {
    loadWorkshopPage(workshopId).then(setPage);
  }, [workshopId]);
  const P = page || FALLBACK_PAGE;
  const W = { poster: P.poster, titleAr: P.title, subtitleAr: P.subtitle, dateAr: P.date, timeAr: P.time, durationAr: P.duration, learnAr: P.learn || [] };

  // متصفحات داخل التطبيقات (تيليغرام، واتساب، إنستغرام…): Google يمنع الدخول منها
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const inApp = /Telegram|Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|Snapchat|TikTok|musical_ly|BytedanceWebview|Line\/|Twitter|WhatsApp|; wv\)/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const pageUrl = typeof window !== 'undefined' ? (workshopId ? joinUrl(workshopId) : currentJoinUrl()) : '';
  const chromeIntent = `intent://${pageUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    document.title = `${W.titleAr} | English Zone Academy`;
  }, [W.titleAr]);

  // بعد التسجيل: إلى صفحتها، حيث تُكمل بياناتها ثم يظهر رابط تيليغرام
  useEffect(() => {
    if (isAuthenticated && !isAdmin && !isSuperAdmin) navigate('portal');
  }, [isAuthenticated, isAdmin, isSuperAdmin]);

  const mark = () => {
    try {
      localStorage.setItem('ez_from_workshop', JSON.stringify({ at: Date.now(), id: P.workshopId || '' }));
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

  const viaGoogle = async () => {
    setError('');
    if (!checkBasics()) return;
    mark();
    setBusy(true);
    const r = await registerVisitor({ name: fullName.trim(), age: age.trim(), google: true, source: 'workshop' });
    setBusy(false);
    if (r.success) navigate('portal');
    else {
      const m = googleErrorMessage(r.code, isAr);
      if (m) setError(r.code && r.code !== 'unknown' ? `${m} (${r.code})` : m);
    }
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
    // إن لم يصل رد خلال 40 ثانية: الاتصال بخوادم التسجيل محجوب أو ضعيف
    const r: any = await Promise.race([
      registerVisitor({ name: fullName.trim(), age: age.trim(), email, password, source: 'workshop' }),
      new Promise((res) => setTimeout(() => res({ success: false, code: 'timeout' }), 40000))
    ]);
    setBusy(false);
    if (r.success) navigate('portal');
    else if (r.code === 'timeout')
      setError('الاتصال ضعيف أو محجوب ولم يكتمل التسجيل. {جرّب|جرّبي} شبكة أخرى، أو {شغّل|شغّلي} VPN أو {أوقفه|أوقفيه}، ثم {حاول|حاولي} مرة أخرى.');
    else setError(errText(r.code));
  };

  const inp = 'w-full px-4 py-3 rounded-xl border border-[#d8c4c0] text-sm bg-white focus:outline-none focus:border-[var(--wc)]';

  if (page === undefined) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">...</div>;
  if (page === null || (!page.published && !isAdmin && !isSuperAdmin))
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center" dir="rtl">
        <p className="text-lg font-bold text-[#2b1d1d]">التسجيل في هذه الورشة غير متاح الآن.</p>
        <a href={DEFAULT_GROUP_LINK} className="px-5 py-2.5 rounded-xl bg-[#229ED9] text-white text-sm font-bold">
          تابعنا على تيليغرام لمعرفة الورش القادمة
        </a>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--wl)] py-6 px-4" dir="rtl" style={{ ['--wc' as any]: P.color, ['--wl' as any]: tint(P.color) }}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          {W.poster && <img src={W.poster} alt={W.titleAr} className="w-full rounded-3xl shadow-xl border border-[#e3d2cb]" />}
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#e3d2cb] space-y-5">
          <div className="space-y-2 text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-[var(--wc)] text-white text-xs font-bold">ورشة مجانية تفاعلية</span>
            <h1 className="text-3xl font-extrabold text-[#2b1d1d]">{W.titleAr}</h1>
            <p className="text-sm text-[#6b5b57]">{W.subtitleAr}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: CalendarDays, t: W.dateAr },
              { icon: Clock, t: W.timeAr },
              { icon: Hourglass, t: `المدة: ${W.durationAr}` }
            ].map((x) => (
              <div key={x.t} className="p-3 rounded-2xl bg-[var(--wl)]">
                <x.icon className="w-5 h-5 mx-auto mb-1 text-[var(--wc)]" />
                <p className="text-[11px] font-bold text-[#2b1d1d] leading-snug">{x.t}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="font-bold text-[var(--wc)] mb-2">ماذا {'{ستتعلم|ستتعلمين}'} في الورشة؟</p>
            <ul className="space-y-1.5">
              {W.learnAr.map((l) => (
                <li key={l} className="flex items-center gap-2 text-sm text-[#2b1d1d]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--wc)] shrink-0" />
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
            {inApp ? (
              <div className="rounded-2xl border-2 border-[#a0522d] bg-[#fff4e5] p-3 space-y-2 text-center">
                <p className="text-xs font-bold text-[#7a3a14]">للتسجيل بحساب جيميل {'{افتح|افتحي}'} الرابط في المتصفح، أو {'{سجّل|سجّلي}'} بالبريد في الأسفل مباشرة.</p>
                {isAndroid ? (
                  <a href={chromeIntent} className="block w-full py-3 rounded-xl bg-[#1a73e8] text-white text-sm font-bold">
                    🌐 فتح في Chrome
                  </a>
                ) : (
                  <p className="text-[11px] text-[#7a3a14]">{'{اضغط|اضغطي}'} على ⋯ أو زر المشاركة أعلى الشاشة، ثم «فتح في Safari».</p>
                )}
                <button type="button" onClick={copyLink} className="w-full py-2 rounded-xl bg-white border border-[#a0522d] text-[#7a3a14] text-xs font-bold">
                  {copied ? '✓ تم نسخ الرابط' : '📋 نسخ رابط الورشة'}
                </button>
              </div>
            ) : (
              <>
                <GoogleSignInButton onClick={viaGoogle} disabled={busy} isAr={isAr} />
                <OrDivider isAr={isAr} />
              </>
            )}
            <form onSubmit={viaEmail} className="space-y-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} placeholder="البريد الإلكتروني" autoCapitalize="off" autoCorrect="off" className={inp} dir="ltr" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة مرور (6 أحرف على الأقل)" className={inp} dir="ltr" />
              <button type="submit" disabled={busy} className="w-full py-3.5 rounded-xl bg-[var(--wc)] hover:opacity-90 text-white text-sm font-bold disabled:opacity-50">
                {busy ? '...' : 'التسجيل في الورشة'}
              </button>
            </form>
            <p className="text-[11px] text-center text-[#6b5b57]">
              لديك حساب؟{' '}
              <button onClick={() => navigate('login')} className="font-bold text-[var(--wc)] underline">
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
