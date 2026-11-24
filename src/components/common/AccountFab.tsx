import React, { useState } from 'react';
import { UserRound, X } from 'lucide-react';

// زر دائري ثابت يعيد المسجّل إلى حسابه من أي صفحة (مكان زر الرد الآلي)
// زر ✕ صغير يخفيه حتى تحديث الصفحة
export const AccountFab: React.FC<{ isAr: boolean; onClick: () => void }> = ({ isAr, onClick }) => {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="fixed bottom-5 left-5 z-[60]">
      <button
        onClick={onClick}
        className="w-16 h-16 rounded-full bg-[#0A192F] text-[#F3E5AB] border-2 border-[#D4AF37] shadow-2xl flex flex-col items-center justify-center gap-0.5 hover:scale-105 transition-transform"
        title={isAr ? 'حسابي' : 'My account'}
      >
        <UserRound className="w-5 h-5 text-[#D4AF37]" />
        <span className="text-[10px] font-bold leading-none">{isAr ? 'حسابي' : 'Account'}</span>
      </button>
      <button
        onClick={() => setHidden(true)}
        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white text-[#0A192F] border border-[#D4AF37] shadow flex items-center justify-center"
        aria-label="hide"
        title={isAr ? 'إخفاء' : 'Hide'}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
