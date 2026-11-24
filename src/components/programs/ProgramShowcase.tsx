import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Images, PlayCircle, X } from 'lucide-react';
import type { ProgramCategory } from '../../types';

interface Props {
  prog: ProgramCategory;
  language: string;
  dark?: boolean;
}

export const ProgramShowcase: React.FC<Props> = ({ prog, language, dark }) => {
  const imgs = prog.galleryImages || [];
  const vids = prog.videoIds || [];
  const [open, setOpen] = useState<number | null>(null);
  const ar = language === 'ar';

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % imgs.length));
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + imgs.length) % imgs.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, imgs.length]);

  if (!imgs.length && !vids.length) return null;
  const head = dark ? 'text-[#F3E5AB]' : 'text-[#061638]';

  return (
    <div className="space-y-8">
      {vids.length > 0 && (
        <div>
          <h4 className={`flex items-center gap-2 font-bold text-base sm:text-lg mb-3 ${head}`}>
            <PlayCircle className="w-5 h-5 text-[#D4AF37]" />
            {ar ? 'فيديوهات تعريفية بالبرنامج' : 'Program introduction videos'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vids.map((id) => (
              <div key={id} className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 bg-black shadow aspect-video">
                <iframe
                  src={`https://drive.google.com/file/d/${id}/preview`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  loading="lazy"
                  title="video"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {imgs.length > 0 && (
        <div>
          <h4 className={`flex items-center gap-2 font-bold text-base sm:text-lg mb-3 ${head}`}>
            <Images className="w-5 h-5 text-[#D4AF37]" />
            {ar ? 'لقطات من دروس البرنامج' : 'A look inside our lessons'}
          </h4>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
            {imgs.map((src, i) => (
              <button
                key={src}
                onClick={() => setOpen(i)}
                className="snap-start flex-shrink-0 w-[78%] sm:w-[46%] lg:w-[31%] rounded-2xl overflow-hidden border border-[#D4AF37]/30 bg-white shadow hover:shadow-lg hover:border-[#D4AF37] transition-all"
              >
                <img src={src} alt="" loading="lazy" className="w-full aspect-[16/10] object-cover object-top" />
              </button>
            ))}
          </div>
          <p className={`text-xs mt-1 ${dark ? 'text-gray-300' : 'text-gray-500'}`}>
            {ar ? 'اسحب لرؤية المزيد، واضغط على أي صورة لتكبيرها.' : 'Swipe to see more, and tap any image to enlarge it.'}
          </p>
        </div>
      )}

      {open !== null && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-3" onClick={() => setOpen(null)}>
          <button className="absolute top-4 right-4 text-white/90 hover:text-white" onClick={() => setOpen(null)} aria-label="close">
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-2 sm:left-6 text-white/80 hover:text-white p-2"
            onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + imgs.length) % imgs.length); }}
            aria-label="previous"
          >
            <ChevronLeft className="w-9 h-9" />
          </button>
          <img src={imgs[open]} alt="" className="max-h-[88vh] max-w-[92vw] rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button
            className="absolute right-2 sm:right-6 text-white/80 hover:text-white p-2"
            onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % imgs.length); }}
            aria-label="next"
          >
            <ChevronRight className="w-9 h-9" />
          </button>
          <div className="absolute bottom-4 text-white/80 text-sm">{open + 1} / {imgs.length}</div>
        </div>
      )}
    </div>
  );
};
