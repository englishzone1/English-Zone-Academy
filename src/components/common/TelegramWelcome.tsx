import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { WORKSHOP_ONLY } from '../student/WorkshopConfirm';

const TG_URL = 'https://t.me/En9lishZ0ne';

interface Props {
  uid?: string;
  role?: string;
  createdAt?: string;
  // البيانات مكتملة (الاسم والجنس والدولة والعمر): النافذة تظهر بعد «تم» في نموذج البيانات
  profileDone?: boolean;
  isAr: boolean;
}

// نافذة ترحيب تظهر مرة واحدة لكل حساب جديد: رابط الانضمام إلى قناة تيليغرام للمتابعة
export const TelegramWelcome: React.FC<Props> = ({ uid, role, createdAt, profileDone, isAr }) => {
  const [open, setOpen] = useState(false);
  // جاء من رابط الورش المجانية: الرسالة عن مواعيد الورش وروابطها
  const fromWorkshop = (() => {
    try {
      return !!localStorage.getItem('ez_from_workshop');
    } catch {
      return false;
    }
  })();
  const key = `ez_tg_welcome_${uid}`;

  useEffect(() => {
    if (!uid || role !== 'student' || !createdAt || !profileDone) return;
    // مسجّلو الورشة يرون زر تأكيد التسجيل ومجموعة تيليغرام بدل هذه النافذة
    if (WORKSHOP_ONLY && fromWorkshop) return;
    // حساب جديد: أُنشئ خلال آخر 3 أيام
    const age = Date.now() - new Date(createdAt).getTime();
    if (!(age >= 0 && age < 3 * 24 * 3600 * 1000)) return;
    try {
      if (localStorage.getItem(key)) return;
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => setOpen(true), fromWorkshop ? 300 : 1200);
    return () => window.clearTimeout(t);
  }, [uid, role, createdAt, profileDone]);

  const close = () => {
    try {
      localStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" dir={isAr ? 'rtl' : 'ltr'} onClick={close}>
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl border-2 border-[#D4AF37]" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} className="absolute top-3 end-3 text-gray-400 hover:text-gray-700" aria-label="close">
          <X className="w-5 h-5" />
        </button>
        <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-[#229ED9] flex items-center justify-center text-white text-3xl">✈</div>
        <h3 className="text-lg font-bold text-[#0A192F] mb-2">{isAr ? 'أهلًا {بك|بكِ} في English Zone 🎉' : 'Welcome to English Zone 🎉'}</h3>
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          {fromWorkshop
            ? isAr
              ? 'مواعيد الورش المجانية وروابط الدخول إليها تُنشر في قناتنا على تيليغرام. {انضم|انضمّي} الآن حتى لا {تفوتك|تفوتكِ} أي ورشة.'
              : 'Free workshop dates and joining links are posted on our Telegram channel. Join now so you never miss a workshop.'
            : isAr
              ? '{انضم|انضمّي} إلى قناتنا على تيليغرام لتصلك كل الأخبار والمواعيد والعروض أولًا بأول.'
              : 'Join our Telegram channel to get all news, schedules and offers first.'}
        </p>
        <a
          href={TG_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          className="block w-full py-3 rounded-2xl bg-[#229ED9] hover:bg-[#1c8cc2] text-white font-bold"
        >
          {isAr ? '{انضم|انضمّي} إلى قناة تيليغرام' : 'Join our Telegram channel'}
        </a>
        <button onClick={close} className="mt-3 text-xs text-gray-400 hover:text-gray-600">
          {isAr ? 'لاحقًا' : 'Later'}
        </button>
      </div>
    </div>
  );
};
