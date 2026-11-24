import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, CheckCircle2, LogOut } from 'lucide-react';
import { CompleteProfile } from './CompleteProfile';
import { FALLBACK_PAGE, loadWorkshopPage, tint } from '../../pages/SpeakWorkshopPage';
import { WorkshopPage } from '../../services/workshopService';

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
  const [page, setPage] = useState<WorkshopPage>(FALLBACK_PAGE);
  useEffect(() => {
    const id = fromWorkshopId();
    loadWorkshopPage(id || undefined).then((p) => p && setPage(p));
  }, []);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl" style={{ background: tint(page.color) }}>
      <CompleteProfile isAr={isAr} />
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#e3d2cb] space-y-5 text-center">
        {page.poster && <img src={page.poster} alt={page.title} className="w-40 h-40 mx-auto rounded-2xl object-cover border border-[#e3d2cb]" />}
        <div className="space-y-1">
          <p className="text-xs font-bold" style={{ color: page.color }}>ورشة مجانية تفاعلية</p>
          <h1 className="text-2xl font-extrabold text-[#2b1d1d]">{page.title}</h1>
          {name && <p className="text-sm text-[#6b5b57]">أهلًا {name.split(' ')[0]}</p>}
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-bold text-[#2b1d1d]">
          {page.date && (
            <span className="flex items-center gap-1 px-3 py-2 rounded-xl" style={{ background: tint(page.color) }}>
              <CalendarDays className="w-4 h-4" style={{ color: page.color }} /> {page.date}
            </span>
          )}
          {page.time && (
            <span className="flex items-center gap-1 px-3 py-2 rounded-xl" style={{ background: tint(page.color) }}>
              <Clock className="w-4 h-4" style={{ color: page.color }} /> {page.time}
            </span>
          )}
        </div>

        {!done ? (
          <button onClick={confirm} className="w-full py-4 rounded-2xl text-white text-base font-bold hover:opacity-90" style={{ background: page.color }}>
            تأكيد التسجيل في الورشة
          </button>
        ) : (
          <div className="space-y-3">
            <p className="flex items-center justify-center gap-2 text-lg font-extrabold text-green-700">
              <CheckCircle2 className="w-6 h-6" /> تم التسجيل في الورشة
            </p>
            <p className="text-xs text-[#6b5b57]">رابط الورشة وموعدها يُرسلان في مجموعة تيليغرام.</p>
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
