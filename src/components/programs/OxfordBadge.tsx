import React from 'react';
import { BookOpenCheck } from 'lucide-react';

interface Props {
  language: string;
  dark?: boolean;
  className?: string;
}

/** Clear, bold reminder of the curriculum: accredited Oxford + interactive. */
export const OxfordBadge: React.FC<Props> = ({ language, dark, className = '' }) => {
  const ar = language === 'ar';
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 shadow-sm ${
        dark
          ? 'bg-[#F3E5AB] border-[#D4AF37] text-[#0A192F]'
          : 'bg-[#FFF8E1] border-[#D4AF37] text-[#0A192F]'
      } ${className}`}
    >
      <BookOpenCheck className="w-5 h-5 flex-shrink-0 text-[#AA820A]" />
      <span className="font-extrabold text-sm sm:text-base leading-snug">
        {ar ? 'منهج أكسفورد (Oxford) المعتمد • منهج تفاعلي' : 'Accredited Oxford curriculum • Interactive learning'}
      </span>
    </div>
  );
};
