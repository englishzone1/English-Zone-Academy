import React, { useState } from 'react';
import { ExternalLink, Maximize2, Minimize2, BookOpenCheck } from 'lucide-react';
import { useAcademySettings } from '../../hooks/useAcademySettings';

// منصة الواجبات والاختبارات التفاعلية داخل لوحة الطالب (الرابط من إعدادات الإدارة)
export const HomeworkPlatform: React.FC<{ isAr: boolean }> = ({ isAr }) => {
  const { homeworkUrl } = useAcademySettings();
  const [tall, setTall] = useState(false);
  if (!homeworkUrl || !/^https:\/\//i.test(homeworkUrl)) return null;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#D4AF37]/40 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif-luxury font-bold text-xl text-[#0A192F] flex items-center gap-2">
          <BookOpenCheck className="w-5 h-5 text-[#D4AF37]" />
          {isAr ? 'الواجبات والاختبارات التفاعلية' : 'Interactive Homework & Tests'}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTall((t) => !t)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 flex items-center gap-1.5"
          >
            {tall ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {tall ? (isAr ? 'تصغير' : 'Smaller') : isAr ? 'تكبير' : 'Bigger'}
          </button>
          <a
            href={homeworkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-[#0A192F] text-[#F3E5AB] text-xs font-bold flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
            {isAr ? 'فتح في صفحة كاملة' : 'Open full page'}
          </a>
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-[#FAF8F5]">
        <iframe
          src={homeworkUrl}
          title={isAr ? 'الواجبات والاختبارات' : 'Homework and tests'}
          className="w-full block"
          style={{ height: tall ? '92vh' : '75vh' }}
          allow="autoplay; fullscreen; clipboard-write"
          allowFullScreen
        />
      </div>
    </div>
  );
};
