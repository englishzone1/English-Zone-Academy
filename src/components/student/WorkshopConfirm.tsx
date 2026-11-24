import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, CheckCircle2, LogOut } from 'lucide-react';
import { CompleteProfile } from './CompleteProfile';
import { FALLBACK_PAGE, loadWorkshopPage, tint } from '../../pages/SpeakWorkshopPage';
import { WorkshopPage } from '../../services/workshopService';
import { WsBackdrop, wsVars } from '../common/WorkshopTheme';

// وضع الورشة: من سجّل عبر رابط الورشة يرى هذه الصفحة وحدها (بلا الاشتراك في الكورس ولا غيره)
// حتى تقرر الإدارة إعادة الصفحة العادية (WORKSHOP_ONLY = false)
export const WORKSHOP_ONLY = true;

const fromWorkshopId = (): string => {
  try {
    const v = localStorage.getItem('ez_from_workshop') || '';
    return v.startsWith('{') ? String(JSON.parse(v).id || '') : '';
  } catch {
    return '';
  }
};

export const isWorkshopUser = (u: any): boolean => {
  if (u?.signupSource === 'workshop') return true;
  try {
    return !!localStorage.getItem('ez_from_workshop');
  } catch {
    return false;
  }
};

export const WorkshopConfirm: React.FC<{ isAr: boolean; name: string; onLogout: () => void }> = ({ isAr, name, onLogout }) => {
  // لا نعرض شيئًا حتى تُحمَّل الورشة التي سجّل فيها (حتى لا تظهر الورشة القديمة لحظة)
  const [loaded, setLoaded] = useState<WorkshopPage | null>(null);
  useEffect(() => {
    const id = fromWorkshopId();
    loadWorkshopPage(id || undefined)
      .then((p) => setLoaded(p || FALLBACK_PAGE))
      .catch(() => setLoaded(FALLBACK_PAGE));
  }, []);
  const page = loaded || FALLBACK_PAGE;
  const doneKey = `ez_ws_confirmed_${page.workshopId || 'first'}`;
  const [done, setDone] = useState(false);
  useEffect(() => {
    try {
      setDone(!!localStorage.getItem(doneKey) || (!page.workshopId && !!localStorage.getItem('ez_ws_confirmed')));
    } catch {
      /* ignore */
    }
  }, [doneKey]);

  const confirm = () => {
    try {
      localStorage.setItem(doneKey, String(Date.now()));
    } catch {
      /* ignore */
    }
    setDone(true);
    window.setTimeout(() => {
      window.location.href = page.groupLink;
    }, 1500);
  };

  if (!loaded)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-gray-500 animate-spin" />
      </div>
    );

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 ${page.theme === 'white' ? 'ez-light' : ''}`} dir="rtl" style={wsVars(page.theme, page.color, tint(page.color))}>
      <WsBackdrop theme={page.theme} />
      <CompleteProfile isAr={isAr} />
      <div className="relative z-10 w-full max-w-lg bg-[var(--card)] backdrop-blur-md rounded-3xl p-4 sm:p-8 shadow-xl border border-[var(--line)] space-y-5 text-center">
        {page.poster && <img src={page.poster} alt={page.title} className="w-full h-auto rounded-2xl shadow-md border border-[var(--line)]" />}
        <div className="space-y-1">
          <span className="inline-block px-4 py-1 rounded-full bg-[var(--chipBg)] text-[var(--chipInk)] border border-[var(--chipLine)] text-xs font-bold">ورشة مجانية تفاعلية</span>
          <h1 className="text-3xl font-extrabold text-[var(--ink)] pt-2" style={{ textShadow: 'var(--glow)' }}>{page.title}</h1>
          {name && <p className="text-sm text-[var(--muted)]">أهلًا {name.split(' ')[0]}</p>}
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-bold text-[var(--ink)]">
          {page.date && (
            <span className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--box)] border border-[var(--boxLine)]">
              <CalendarDays className="w-4 h-4" style={{ color: 'var(--wc)' }} /> {page.date}
            </span>
          )}
          {page.time && (
            <span className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--box)] border border-[var(--boxLine)]">
              <Clock className="w-4 h-4" style={{ color: 'var(--wc)' }} /> {page.time}
            </span>
          )}
        </div>

        {!done ? (
          <button onClick={confirm} className="w-full py-4 rounded-2xl text-white text-base font-bold hover:opacity-90 shadow-[0_0_24px_rgba(60,140,255,.35)]" style={{ background: 'var(--btn)' }}>
            تأكيد التسجيل في الورشة
          </button>
        ) : (
          <div className="space-y-3">
            <p className="flex items-center justify-center gap-2 text-lg font-extrabold text-emerald-400">
              <CheckCircle2 className="w-6 h-6" /> تم التسجيل في الورشة
            </p>
            <p className="text-xs text-[var(--muted)]">رابط الورشة وموعدها يُرسلان في مجموعة تيليغرام.</p>
            <a href={page.groupLink} target="_blank" rel="noopener noreferrer" className="block w-full py-3.5 rounded-2xl bg-[#229ED9] hover:bg-[#1c8cc2] text-white font-bold">
              الدخول إلى مجموعة تيليغرام
            </a>
          </div>
        )}

        <button onClick={onLogout} className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600">
          <LogOut className="w-3.5 h-3.5" /> تسجيل الخروج
        </button>
      </div>
    </div>
  );
};
