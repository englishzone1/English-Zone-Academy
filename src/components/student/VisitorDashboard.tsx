import React, { useEffect, useState } from 'react';
import { BookOpen, Newspaper, GraduationCap, MessageCircle, LogOut, Gift } from 'lucide-react';
import { studentHubService } from '../../services/studentHubService';
import { whatsappWithText } from '../../hooks/useAcademySettings';

interface Props {
  isAr: boolean;
  name: string;
  whatsapp: string;
  navigate: (route: string) => void;
  onLogout: () => void;
}

// صفحة الحساب المجاني: الكتب والمجلة المفتوحة للمسجّلين، ودعوة للاشتراك
export const VisitorDashboard: React.FC<Props> = ({ isAr, name, whatsapp, navigate, onLogout }) => {
  const tr = (en: string, ar: string) => (isAr ? ar : en);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentHubService
      .getMembersLibrary()
      .then(setItems)
      .catch((err) => console.error('Error loading members library:', err))
      .finally(() => setLoading(false));
  }, []);

  const mags = items.filter((b) => b.category === 'magazine');
  const books = items.filter((b) => b.category !== 'magazine');
  const title = (b: any) => (isAr ? b.titleAr : b.titleEn) || b.titleAr || b.titleEn;

  const row = (b: any, Icon: any) => (
    <div key={b.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-200 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {b.coverUrl ? (
          <img src={b.coverUrl} alt="" className="w-10 h-14 object-cover rounded-md border border-gray-200 shrink-0" />
        ) : (
          <Icon className="w-5 h-5 text-[#AA820A] mt-0.5 shrink-0" />
        )}
        <div>
          <span className="font-bold text-sm text-[#0A192F] block">{title(b)}</span>
          <span className="text-[11px] text-gray-500">{b.issue || (b.level && b.level !== 'All Levels' ? b.level : '')}</span>
          {b.description && <p className="text-xs text-gray-600 mt-1">{b.description}</p>}
        </div>
      </div>
      {b.downloadUrl && (
        <a href={b.downloadUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0A192F] text-[#F3E5AB] whitespace-nowrap">
          {tr('Open', 'فتح')}
        </a>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-[#0A192F] to-[#102445] text-white rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37] text-[#0A192F] text-[11px] font-bold">
              <Gift className="w-3.5 h-3.5" />
              {tr('Free account', 'حساب مجاني')}
            </span>
            <h1 className="font-serif-luxury font-bold text-2xl text-[#F3E5AB]">
              {tr(`Welcome, ${name}`, `أهلًا بكِ يا ${name}`)} 🌟
            </h1>
            <p className="text-sm text-gray-300">{tr('Here are the free books and materials for members.', 'هنا الكتب والمواد المجانية المفتوحة لكِ.')}</p>
          </div>
          <button onClick={onLogout} className="self-start px-3 py-2 rounded-xl border border-white/20 text-xs font-bold flex items-center gap-1.5">
            <LogOut className="w-4 h-4" />
            {tr('Sign out', 'خروج')}
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-[#D4AF37]/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-[#0A192F] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
              {tr('Ready to study with us?', 'جاهزة للدراسة معنا؟')}
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              {tr(
                'Live small-group classes, interactive homework and monthly reports.',
                'حصص مباشرة في مجموعات صغيرة، وواجبات تفاعلية، وتقرير شهري بمستواك.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate('register')} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A192F] text-xs font-bold">
              {tr('Enroll now', 'اشتركي الآن')}
            </button>
            {whatsapp && (
              <a
                href={whatsappWithText(whatsapp, isAr ? `مرحبًا English Zone، أنا ${name} ولدي حساب مجاني، أريد معرفة المزيد عن الاشتراك.` : `Hello English Zone, I'm ${name} with a free account. I'd like to know more about enrolling.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                {tr('Ask on WhatsApp', 'اسألي على واتساب')}
              </a>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          {loading ? (
            <p className="text-xs text-gray-500 text-center py-6">{tr('Loading...', 'جارٍ التحميل...')}</p>
          ) : items.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">{tr('New free materials are coming soon.', 'مواد مجانية جديدة قريبًا.')}</p>
          ) : (
            <>
              {mags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-[#0A192F] flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-[#D4AF37]" />
                    {tr('Academy Magazine', 'مجلة الأكاديمية')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{mags.map((b) => row(b, Newspaper))}</div>
                </div>
              )}
              {books.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-[#0A192F] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                    {tr('Library', 'المكتبة')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{books.map((b) => row(b, BookOpen))}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
