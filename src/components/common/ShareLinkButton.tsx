import React, { useState } from 'react';
import { Link2, Check } from 'lucide-react';
import { copyText } from '../../utils/copyText';

// نسخ رابط كتاب أو مجلة في المكتبة لنشره (يفتح المكتبة على هذا العنصر نفسه)
export const libraryItemUrl = (id: string) => `${window.location.origin}/#/library/${id}`;

export const ShareLinkButton: React.FC<{ url: string; isAr: boolean }> = ({ url, isAr }) => {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(url)) {
          setDone(true);
          window.setTimeout(() => setDone(false), 2500);
        }
      }}
      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#D4AF37] text-[#0A192F] bg-white whitespace-nowrap flex items-center justify-center gap-1"
    >
      {done ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5 text-[#AA820A]" />}
      {done ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ الرابط' : 'Copy link'}
    </button>
  );
};
