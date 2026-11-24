import React from 'react';
import { Tag, Award } from 'lucide-react';
import type { ProgramCategory } from '../../types';

interface Props {
  prog: ProgramCategory;
  language: string;
  dark?: boolean;
  className?: string;
}

/** Monthly price with the old price struck through and the offer note. */
export const ProgramPrice: React.FC<Props> = ({ prog, language, dark, className = '' }) => {
  if (!prog.monthlyStartingPrice) return null;
  const ar = language === 'ar';
  const note = ar ? prog.offerNoteAr : prog.offerNoteEn;
  return (
    <div className={`rounded-2xl border-2 border-[#D4AF37] p-4 ${dark ? 'bg-white/10' : 'bg-white'} ${className}`}>
      <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
        <span className={`text-3xl font-extrabold ${dark ? 'text-[#F3E5AB]' : 'text-[#0E3A99]'}`}>
          ${prog.monthlyStartingPrice}
        </span>
        <span className={`text-sm font-bold ${dark ? 'text-gray-200' : 'text-gray-600'}`}>{ar ? '/ شهريًا' : '/ month'}</span>
        {prog.originalPrice && (
          <span className={`text-lg font-bold line-through ${dark ? 'text-gray-400' : 'text-gray-400'}`}>${prog.originalPrice}</span>
        )}
      </div>
      {note && (
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-extrabold">
          <Tag className="w-3.5 h-3.5" />
          {note}
        </div>
      )}
      {(ar ? prog.certNoteAr : prog.certNoteEn) && (
        <div className={`mt-2 flex items-center gap-1.5 text-sm font-extrabold ${dark ? 'text-[#F3E5AB]' : 'text-[#0E3A99]'}`}>
          <Award className="w-4 h-4 text-[#D4AF37]" />
          {ar ? prog.certNoteAr : prog.certNoteEn}
        </div>
      )}
      {ar && prog.priceNoteAr && <p className={`text-[11px] mt-2 ${dark ? 'text-gray-300' : 'text-gray-500'}`}>{prog.priceNoteAr}</p>}
    </div>
  );
};
