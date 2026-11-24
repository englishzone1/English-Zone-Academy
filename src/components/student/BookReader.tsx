import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Props {
  folder: string; // e.g. /curriculum/ef5-a1/books/<token>/stage1
  count: number;
  title: string;
  pdf?: string;
  isAr: boolean;
  onClose: () => void;
}

const src = (folder: string, n: number) => `${folder}/${String(n).padStart(3, '0')}.jpg?v=2`;

// قارئ الكتاب داخل الموقع: صفحة بصفحة (صور)، يعمل على كل الهواتف دون عارض PDF
export const BookReader: React.FC<Props> = ({ folder, count, title, pdf, isAr, onClose }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const key = `ez_book_page_${folder}`;
  const [page, setPage] = useState(() => {
    try {
      const n = Number(localStorage.getItem(key));
      return n >= 1 && n <= count ? n : 1;
    } catch {
      return 1;
    }
  });
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const box = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);

  const go = (n: number) => {
    const p = Math.min(count, Math.max(1, n));
    if (p === page) return;
    setLoading(true);
    setPage(p);
    box.current?.scrollTo({ top: 0 });
  };

  useEffect(() => {
    try {
      localStorage.setItem(key, String(page));
    } catch {
      /* ignore */
    }
    // تحميل الصفحة التالية مسبقًا
    if (page < count) new Image().src = src(folder, page + 1);
  }, [page, folder, count, key]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(isAr ? page - 1 : page + 1);
      if (e.key === 'ArrowLeft') go(isAr ? page + 1 : page - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const full = () => {
    const el: any = document.getElementById('book-reader');
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => undefined);
    else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  const btn = 'px-3 py-1.5 rounded-lg text-[11px] font-bold';
  return (
    <div id="book-reader" className="rounded-2xl border-2 border-[#D4AF37] bg-[#0E3A99] p-2 sm:p-3 space-y-2">
      <div className="flex items-center justify-between text-[#F3E5AB] text-xs font-bold gap-2">
        <span className="truncate">📖 {title}</span>
        <button onClick={onClose} title={tr('Close', 'إغلاق')}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={box}
        className="relative bg-white rounded-xl overflow-auto max-h-[85vh]"
        onTouchStart={(e) => (touch.current = zoom === 1 ? e.touches[0].clientX : null)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          touch.current = null;
          if (Math.abs(dx) > 60) go(dx < 0 ? page + 1 : page - 1);
        }}
      >
        {loading && <p className="absolute inset-x-0 top-6 text-center text-xs text-gray-400">{tr('Loading page…', 'جارٍ تحميل الصفحة…')}</p>}
        <img
          key={page}
          src={src(folder, page)}
          alt={`${title} – ${page}`}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
          style={{ width: `${zoom * 100}%`, maxWidth: 'none' }}
          className="block mx-auto select-none"
          draggable={false}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2" dir="ltr">
        <button onClick={() => go(page - 1)} disabled={page <= 1} className={`${btn} bg-white text-[#0E3A99] disabled:opacity-40 flex items-center`}>
          <ChevronLeft className="w-4 h-4" />
          {tr('Previous', 'السابقة')}
        </button>
        <span className="text-[#F3E5AB] text-xs font-bold flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={count}
            value={page}
            onChange={(e) => go(Number(e.target.value) || 1)}
            className="w-14 px-1 py-1 rounded bg-white text-[#0E3A99] text-center"
          />
          / {count}
        </span>
        <button onClick={() => go(page + 1)} disabled={page >= count} className={`${btn} bg-white text-[#0E3A99] disabled:opacity-40 flex items-center`}>
          {tr('Next', 'التالية')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)))} disabled={zoom <= 1} className={`${btn} bg-white/10 text-[#F3E5AB] border border-[#D4AF37]/60 disabled:opacity-40`}>
          − {tr('Zoom out', 'تصغير')}
        </button>
        <button onClick={() => setZoom((z) => Math.min(3, z + 0.5))} className={`${btn} bg-white/10 text-[#F3E5AB] border border-[#D4AF37]/60`}>
          + {tr('Zoom in', 'تكبير')}
        </button>
        <button onClick={full} className={`${btn} bg-white text-[#0E3A99]`}>
          ⛶ {tr('Full screen', 'ملء الشاشة')}
        </button>
        {pdf && (
          <a href={pdf} download className={`${btn} bg-[#D4AF37] text-[#0E3A99]`}>
            ⬇ {tr('Download PDF', 'تحميل الكتاب PDF')}
          </a>
        )}
      </div>
    </div>
  );
};
