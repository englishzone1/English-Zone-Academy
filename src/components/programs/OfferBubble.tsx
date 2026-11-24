import React, { useEffect, useState } from 'react';
import { Gift, X, ArrowLeft, Award } from 'lucide-react';
import { PROGRAM_CATEGORIES } from '../../data/academyData';

interface Props {
  language: string;
  navigate: (route: string) => void;
}

const KEY = 'ez_offer_bubble_closed';

/** Side bubble titled "Current offer", driven by programs that carry an offer note. */
export const OfferBubble: React.FC<Props> = ({ language, navigate }) => {
  const offer = PROGRAM_CATEGORIES.find((p) => p.monthlyStartingPrice && p.offerNoteAr);
  const ar = language === 'ar';
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let closed = false;
    try { closed = sessionStorage.getItem(KEY) === '1'; } catch { /* ignore */ }
    if (closed) return;
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!offer) return null;

  const close = () => {
    setOpen(false);
    try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
  };
  const side = ar ? 'right-0' : 'left-0';

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`fixed ${side} top-1/3 z-[55] bg-gradient-to-b from-[#D4AF37] to-[#AA820A] text-[#0E3A99] font-extrabold text-xs px-2 py-3 shadow-xl border border-[#0E3A99]/20 flex flex-col items-center gap-1 ${ar ? 'rounded-l-xl' : 'rounded-r-xl'}`}
        style={{ writingMode: 'vertical-rl' }}
      >
        <Gift className="w-4 h-4" style={{ writingMode: 'horizontal-tb' }} />
        {ar ? 'العرض الحالي' : 'Current offer'}
      </button>
    );
  }

  return (
    <div
      dir={ar ? 'rtl' : 'ltr'}
      className={`fixed ${ar ? 'right-3' : 'left-3'} top-1/4 z-[55] w-64 bg-[#0E3A99] text-white rounded-2xl border-2 border-[#D4AF37] shadow-2xl p-4`}
    >
      <button onClick={close} className="absolute top-2 left-2 text-gray-300 hover:text-white" aria-label="close">
        <X className="w-4 h-4" />
      </button>
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37] text-[#0E3A99] text-[11px] font-extrabold mb-2">
        <Gift className="w-3.5 h-3.5" />
        {ar ? 'العرض الحالي' : 'Current offer'}
      </div>
      <h4 className="font-bold text-base text-[#F3E5AB] leading-snug">{ar ? offer.titleAr : offer.titleEn}</h4>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-2xl font-extrabold text-[#F3E5AB]">${offer.monthlyStartingPrice}</span>
        <span className="text-xs text-gray-300">{ar ? '/ شهريًا' : '/ month'}</span>
        {offer.originalPrice && <span className="text-sm line-through text-gray-400">${offer.originalPrice}</span>}
      </div>
      <p className="text-xs text-gray-200 mt-1 leading-relaxed">{ar ? 'المدة: ' : 'Duration: '}{ar ? offer.durationAr : offer.durationEn}<br />{ar ? offer.formatAr : offer.formatEn}</p>
      {(ar ? offer.certNoteAr : offer.certNoteEn) && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-extrabold text-[#F3E5AB]">
          <Award className="w-4 h-4 text-[#D4AF37]" />
          {ar ? offer.certNoteAr : offer.certNoteEn}
        </p>
      )}
      <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-extrabold">
        {ar ? offer.offerNoteAr : offer.offerNoteEn}
      </div>
      <button
        onClick={() => { close(); navigate(`course/${offer.id}`); }}
        className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0E3A99] font-bold text-sm flex items-center justify-center gap-1.5"
      >
        {ar ? 'تفاصيل العرض' : 'Offer details'}
        <ArrowLeft className={`w-4 h-4 ${ar ? '' : 'rotate-180'}`} />
      </button>
    </div>
  );
};
