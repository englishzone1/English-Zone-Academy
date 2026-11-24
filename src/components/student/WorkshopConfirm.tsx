import React, { useState } from 'react';
import { CalendarDays, Clock, CheckCircle2, LogOut } from 'lucide-react';
import { CompleteProfile } from './CompleteProfile';
import { SPEAK_WORKSHOP } from '../../pages/SpeakWorkshopPage';

// وضع الورشة: من سجّل عبر رابط الورشة يرى هذه الصفحة وحدها (بلا الاشتراك في الكورس ولا غيره)
// حتى تقرر الإدارة إعادة الصفحة العادية (WORKSHOP_ONLY = false)
export const WORKSHOP_ONLY = true;
export const WORKSHOP_GROUP = 'https://t.me/EnglishZ0ne1';

export const isWorkshopUser = (u: any): boolean => {
  if (u?.signupSource === 'workshop') return true;
  try {
    return !!localStorage.getItem('ez_from_workshop');
  } catch {
    return false;
  }
};

export const WorkshopConfirm: React.FC<{ isAr: boolean; name: string; onLogout: () => void }> = ({ isAr, name, onLogout }) => {
  const W = SPEAK_WORKSHOP;
  const [done, setDone] = useState(() => {
    try {
      return !!localStorage.getItem('ez_ws_confirmed');
    } catch {
      return false;
    }
  });

  const confirm = () => {
    try {
      localStorage.setItem('ez_ws_confirmed', String(Date.now()));
    } catch {
      /* ignore */
    }
    setDone(true);
    window.setTimeout(() => {
      window.location.href = WORKSHOP_GROUP;
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f6ede6] flex items-center justify-center p-4" dir="rtl">
      <CompleteProfile isAr={isAr} />
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#e3d2cb] space-y-5 text-center">
        <img src={W.poster} alt={W.titleAr} className="w-40 h-40 mx-auto rounded-2xl object-cover border border-[#e3d2cb]" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#6b2f3a]">ورشة مجانية تفاعلية</p>
          <h1 className="text-2xl font-extrabold text-[#2b1d1d]">{W.titleAr}</h1>
          {name && <p className="text-sm text-[#6b5b57]">أهلًا {name.split(' ')[0]}</p>}
        </div>
        <div className="flex justify-center gap-3 text-xs font-bold text-[#2b1d1d]">
          <span className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#f6ede6]">
            <CalendarDays className="w-4 h-4 text-[#6b2f3a]" /> {W.dateAr}
          </span>
          <span className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#f6ede6]">
            <Clock className="w-4 h-4 text-[#6b2f3a]" /> {W.timeAr}
          </span>
        </div>

        {!done ? (
          <button onClick={confirm} className="w-full py-4 rounded-2xl bg-[#6b2f3a] hover:bg-[#5a2630] text-white text-base font-bold">
            تأكيد التسجيل في الورشة
          </button>
        ) : (
          <div className="space-y-3">
            <p className="flex items-center justify-center gap-2 text-lg font-extrabold text-green-700">
              <CheckCircle2 className="w-6 h-6" /> تم التسجيل في الورشة
            </p>
            <p className="text-xs text-[#6b5b57]">رابط الورشة وموعدها يُرسلان في مجموعة تيليغرام.</p>
            <a href={WORKSHOP_GROUP} target="_blank" rel="noopener noreferrer" className="block w-full py-3.5 rounded-2xl bg-[#229ED9] hover:bg-[#1c8cc2] text-white font-bold">
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
