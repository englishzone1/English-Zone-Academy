import React, { useEffect, useState } from 'react';
import { BookOpen, Newspaper } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { studentHubService } from '../services/studentHubService';

// صفحة عامة: المواد والمجلة التي نشرتها الأكاديمية «للعامة»
export const LibraryPage: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentHubService
      .getPublicLibrary()
      .then(setItems)
      .catch((err) => console.error('Error loading library:', err))
      .finally(() => setLoading(false));
  }, []);

  const mags = items.filter((b) => b.category === 'magazine');
  const books = items.filter((b) => b.category !== 'magazine');
  const title = (b: any) => (isAr ? b.titleAr : b.titleEn) || b.titleAr || b.titleEn;
  const open = (b: any) =>
    b.downloadUrl ? (
      <a href={b.downloadUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0A192F] text-[#F3E5AB] whitespace-nowrap">
        {isAr ? 'فتح' : 'Open'}
      </a>
    ) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="text-center space-y-2">
        <h1 className="font-serif-luxury font-bold text-3xl text-[#0A192F]">{isAr ? 'المكتبة والمجلة' : 'Library & Magazine'}</h1>
        <p className="text-sm text-gray-500">{isAr ? 'مواد ومجلة English Zone Academy المتاحة للجميع' : 'English Zone Academy materials and magazine, free for everyone'}</p>
      </div>

      {loading ? (
        <p className="text-center text-xs text-gray-500">{isAr ? 'جارٍ التحميل...' : 'Loading...'}</p>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-10">{isAr ? 'لا توجد مواد منشورة بعد.' : 'Nothing published yet.'}</p>
      ) : (
        <>
          {mags.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-bold text-xl text-[#0A192F] flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#D4AF37]" />
                {isAr ? 'مجلة الأكاديمية' : 'Academy Magazine'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mags.map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    {b.coverUrl ? (
                      <img src={b.coverUrl} alt="" className="w-full h-56 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-[#0A192F] flex items-center justify-center">
                        <Newspaper className="w-10 h-10 text-[#D4AF37]" />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <span className="font-bold text-sm text-[#0A192F]">{title(b)}</span>
                      {b.issue && <span className="text-[11px] text-[#AA820A] font-bold">{b.issue}</span>}
                      {b.description && <p className="text-xs text-gray-600 flex-1">{b.description}</p>}
                      <div>{open(b)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {books.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-bold text-xl text-[#0A192F] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                {isAr ? 'المكتبة' : 'Library'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {books.map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-white border border-gray-200 flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-sm text-[#0A192F] block">{title(b)}</span>
                      {b.level && b.level !== 'All Levels' && <span className="text-[11px] text-gray-500">{b.level}</span>}
                      {b.description && <p className="text-xs text-gray-600 mt-1">{b.description}</p>}
                    </div>
                    {open(b)}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
