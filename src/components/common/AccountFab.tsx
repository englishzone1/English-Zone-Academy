import React from 'react';
import { UserRound } from 'lucide-react';

// زر دائري ثابت يعيد المسجّل إلى حسابه من أي صفحة (مكان زر الرد الآلي)
export const AccountFab: React.FC<{ isAr: boolean; onClick: () => void }> = ({ isAr, onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-5 left-5 z-[60] w-16 h-16 rounded-full bg-[#0E3A99] text-[#F3E5AB] border-2 border-[#D4AF37] shadow-2xl flex flex-col items-center justify-center gap-0.5 hover:scale-105 transition-transform"
    title={isAr ? 'حسابي' : 'My account'}
  >
    <UserRound className="w-5 h-5 text-[#D4AF37]" />
    <span className="text-[10px] font-bold leading-none">{isAr ? 'حسابي' : 'Account'}</span>
  </button>
);
